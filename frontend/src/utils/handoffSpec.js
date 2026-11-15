import chroma from 'chroma-js';
import { formatTokenValue, parseTokenText } from './designTokens.js';

/**
 * Design handoff specs read from files the browser can really parse:
 *  - SVG (exported from Figma, Sketch, Illustrator…): size, colours, fonts,
 *    corner radii and text, read from the markup;
 *  - design-token JSON (W3C / Tokens Studio): the values the designer defined.
 * Each value is then matched to the nearest design-system token.
 *
 * A spec is `{ source, kind, width, height, values, texts }`; `values` are
 * `{ kind, value, count, role? }` where kind is color, dimension, fontSize,
 * fontWeight or fontFamily, and role says what a size is for (`radius`).
 */

export const SUPPORTED_UPLOADS = 'SVG (.svg) or design-token JSON (.json)';

export function uploadKind(file) {
  const name = (file?.name ?? '').toLowerCase();
  if (name.endsWith('.svg') || file?.type === 'image/svg+xml') return 'svg';
  if (name.endsWith('.json') || file?.type === 'application/json') return 'tokens';
  return null;
}

/** Why a file can't be read, in words a designer can act on */
export function unsupportedMessage(file) {
  const name = file?.name ?? 'This file';
  if (/\.(png|jpe?g|gif|webp|avif)$/i.test(name)) {
    return `${name} is a bitmap image: its pixels hold no measurements, fonts or colour values to read. Export the frame as SVG instead.`;
  }
  if (/\.(fig|sketch|xd)$/i.test(name)) {
    return `${name} is a design tool's own file format, which can't be read in the browser. Export the frame as SVG, or the tokens as JSON.`;
  }
  return `${name} can't be read. Upload ${SUPPORTED_UPLOADS}.`;
}

const PX_PER_REM = 16;

/** A CSS length in px (px, rem, em, pt, or a bare number), or null */
export function toPx(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = /^\s*(-?\d*\.?\d+)\s*(px|rem|em|pt)?\s*$/i.exec(String(value ?? ''));
  if (!match) return null;
  const n = parseFloat(match[1]);
  const unit = (match[2] ?? 'px').toLowerCase();
  if (unit === 'rem' || unit === 'em') return n * PX_PER_REM;
  if (unit === 'pt') return (n * 4) / 3;
  return n;
}

const round = (n) => Math.round(n * 100) / 100;

const colorHex = (value) => {
  const text = String(value ?? '').trim();
  if (!text || /^(none|transparent|currentcolor|inherit)$/i.test(text) || text.startsWith('url(')) return null;
  if (!chroma.valid(text)) return null;
  const color = chroma(text);
  return color.alpha() < 1 ? color.hex('rgba') : color.hex('rgb');
};

/** Declarations from a style="" attribute */
const styleDeclarations = (style) =>
  Object.fromEntries(
    String(style ?? '')
      .split(';')
      .map((part) => part.split(':'))
      .filter((pair) => pair.length >= 2)
      .map(([prop, ...rest]) => [prop.trim().toLowerCase(), rest.join(':').trim()]),
  );

const firstFamily = (family) => String(family ?? '').split(',')[0].trim().replace(/^['"]|['"]$/g, '');

function tally(map, kind, value, role) {
  if (value === null || value === undefined || value === '') return;
  const key = `${kind}:${role ?? ''}:${value}`;
  const entry = map.get(key) ?? { kind, value, count: 0, ...(role ? { role } : {}) };
  entry.count++;
  map.set(key, entry);
}

const COLOR_PROPS = ['fill', 'stroke', 'stop-color', 'flood-color', 'color'];

/** A spec from SVG markup */
export function parseSvgSpec(text, source = 'design.svg') {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const svg = doc.documentElement;
  if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length) {
    throw new Error(`${source} isn't valid SVG.`);
  }
  const values = new Map();
  const viewBox = (svg.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);
  const width = toPx(svg.getAttribute('width')) ?? (viewBox.length === 4 ? viewBox[2] : null);
  const height = toPx(svg.getAttribute('height')) ?? (viewBox.length === 4 ? viewBox[3] : null);

  // <style> blocks: colours and font declarations anywhere in the CSS
  for (const style of svg.getElementsByTagName('style')) {
    const css = style.textContent ?? '';
    for (const m of css.matchAll(/(fill|stroke|stop-color|color)\s*:\s*([^;}]+)/gi)) tally(values, 'color', colorHex(m[2]));
    for (const m of css.matchAll(/font-family\s*:\s*([^;}]+)/gi)) tally(values, 'fontFamily', firstFamily(m[1]));
    for (const m of css.matchAll(/font-size\s*:\s*([^;}]+)/gi)) tally(values, 'fontSize', toPx(m[1]));
    for (const m of css.matchAll(/font-weight\s*:\s*([^;}]+)/gi)) tally(values, 'fontWeight', fontWeight(m[1]));
  }

  const texts = [];
  const layerNames = new Set();
  for (const el of svg.getElementsByTagName('*')) {
    const tag = el.localName;
    if (tag === 'style' || tag === 'script') continue;
    // Design tools export layer names as ids (Figma, Sketch) or labels (Inkscape)
    for (const attr of ['id', 'data-name', 'inkscape:label']) {
      const name = el.getAttribute(attr);
      if (name) layerNames.add(name);
    }
    if (tag === 'title' && el.textContent?.trim()) layerNames.add(el.textContent.trim());
    const style = styleDeclarations(el.getAttribute('style'));
    const read = (prop) => style[prop] ?? el.getAttribute(prop);
    for (const prop of COLOR_PROPS) tally(values, 'color', colorHex(read(prop)));
    tally(values, 'fontFamily', read('font-family') ? firstFamily(read('font-family')) : null);
    tally(values, 'fontSize', read('font-size') ? toPx(read('font-size')) : null);
    tally(values, 'fontWeight', read('font-weight') ? fontWeight(read('font-weight')) : null);
    if (tag === 'rect') {
      const rx = toPx(el.getAttribute('rx') ?? el.getAttribute('ry'));
      if (rx) tally(values, 'dimension', rx, 'radius');
    }
    // Text from the outermost <text>, so a <tspan>'s words aren't counted twice
    if (tag === 'text') {
      const content = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (content) texts.push(content);
    }
  }

  return { source, kind: 'svg', width: width === null ? null : round(width), height: height === null ? null : round(height), values: sortValues([...values.values()]), texts, layerNames: [...layerNames] };
}

const words = (text) =>
  String(text ?? '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.replace(/s$/, ''));

/**
 * Design-system components the design names: a component whose name (or id)
 * appears as whole words in a layer name, in the file name or in the text.
 * Returns `{ component, reason }`.
 */
export function findSimilarComponents(spec, components) {
  const sources = [
    ...(spec.layerNames ?? []).map((name) => ({ text: name, reason: `Layer "${name}"` })),
    { text: spec.source.replace(/\.[^.]+$/, ''), reason: `File name "${spec.source}"` },
    ...spec.texts.map((text) => ({ text, reason: `Text "${text}"` })),
  ].map((source) => ({ ...source, words: words(source.text) }));
  const found = [];
  for (const component of components) {
    const wanted = [words(component.name), words(component.id)].filter((list) => list.length);
    const hit = sources.find((source) =>
      wanted.some((name) => source.words.some((_, i) => name.every((word, j) => source.words[i + j] === word))),
    );
    if (hit) found.push({ component, reason: hit.reason });
  }
  return found;
}

function fontWeight(value) {
  const text = String(value ?? '').trim().toLowerCase();
  if (text === 'normal') return 400;
  if (text === 'bold') return 700;
  const n = Number(text);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const TYPE_KINDS = {
  color: 'color',
  dimension: 'dimension',
  spacing: 'dimension',
  sizing: 'dimension',
  borderRadius: 'dimension',
  borderWidth: 'dimension',
  fontSize: 'fontSize',
  fontSizes: 'fontSize',
  fontWeight: 'fontWeight',
  fontWeights: 'fontWeight',
  fontFamily: 'fontFamily',
  fontFamilies: 'fontFamily',
};

/** The kind of value a token holds, from its type (or its value when it has none) */
export function tokenKind(token) {
  if (token.type && TYPE_KINDS[token.type]) return TYPE_KINDS[token.type];
  const value = token.resolved ?? token.value;
  if (typeof value !== 'string') return null;
  if (colorHex(value)) return 'color';
  if (toPx(value) !== null && /[a-z]/i.test(value)) return 'dimension';
  return null;
}

/** A value in the form matching compares: hex for colours, px for sizes */
function normalizeValue(kind, value) {
  if (kind === 'color') return colorHex(value);
  if (kind === 'dimension' || kind === 'fontSize') return toPx(value);
  if (kind === 'fontWeight') return fontWeight(value);
  if (kind === 'fontFamily') return firstFamily(value) || null;
  return null;
}

/** A spec from design-token JSON: each token's value, by kind */
export function parseTokenSpec(text, source = 'tokens.json') {
  const tokens = parseTokenText(text);
  const values = new Map();
  for (const token of tokens) {
    const kind = tokenKind(token);
    if (!kind) continue;
    const value = normalizeValue(kind, token.resolved ?? token.value);
    if (value === null || value === undefined) continue;
    const key = `${kind}:${value}`;
    const entry = values.get(key) ?? { kind, value, count: 0, names: [] };
    entry.count++;
    entry.names.push(token.name);
    values.set(key, entry);
  }
  return { source, kind: 'tokens', width: null, height: null, values: sortValues([...values.values()]), texts: [], layerNames: [], tokenCount: tokens.length };
}

const KIND_ORDER = ['color', 'fontFamily', 'fontSize', 'fontWeight', 'dimension'];
function sortValues(values) {
  return values.sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || b.count - a.count);
}

/** Colour difference (CIEDE2000); under about 2.3 is hard to see */
export const colorDistance = (a, b) => chroma.deltaE(a, b);

/** Matching thresholds: an exact match, and the furthest a "close" match can be */
export const MATCH_LIMITS = { color: { exact: 0.5, close: 10 }, size: { exact: 0, closeRatio: 0.25 } };

/**
 * The nearest design-system token for each spec value. Returns
 * `{ kind, value, count, token, tokenValue, distance, match }` where match is
 * exact, close or none (no token of that kind, or nothing near enough).
 */
export function matchToTokens(values, designTokens) {
  const candidates = designTokens
    .map((token) => {
      const kind = tokenKind(token);
      return kind ? { token, kind, value: normalizeValue(kind, token.resolved ?? token.value) } : null;
    })
    .filter((c) => c && c.value !== null && c.value !== undefined);

  return values.map((spec) => {
    const pool = candidates.filter((c) => c.kind === spec.kind);
    // On a tie, a token named for the value's role wins (a corner radius matches border.radius.*, not spacing.*)
    const fits = (candidate) => (spec.role && candidate.token.name.toLowerCase().includes(spec.role) ? 1 : 0);
    let best = null;
    for (const candidate of pool) {
      const distance = measure(spec.kind, spec.value, candidate.value);
      if (distance === null) continue;
      if (!best || distance < best.distance || (distance === best.distance && fits(candidate) > fits(best.candidate))) best = { candidate, distance };
    }
    if (!best) return { ...spec, token: null, tokenValue: null, distance: null, match: 'none' };
    const match = grade(spec.kind, spec.value, best.distance);
    return {
      ...spec,
      token: match === 'none' ? null : best.candidate.token.name,
      tokenValue: match === 'none' ? null : formatTokenValue(best.candidate.token.resolved ?? best.candidate.token.value),
      distance: round(best.distance),
      match,
      nearest: best.candidate.token.name,
    };
  });
}

function measure(kind, a, b) {
  if (kind === 'color') {
    try {
      return colorDistance(a, b);
    } catch {
      return null;
    }
  }
  if (kind === 'fontFamily') return String(a).toLowerCase() === String(b).toLowerCase() ? 0 : null;
  if (typeof a !== 'number' || typeof b !== 'number') return null;
  return Math.abs(a - b);
}

function grade(kind, value, distance) {
  if (kind === 'color') {
    if (distance <= MATCH_LIMITS.color.exact) return 'exact';
    return distance <= MATCH_LIMITS.color.close ? 'close' : 'none';
  }
  if (distance === 0) return 'exact';
  if (kind === 'fontFamily') return 'none';
  // Sizes and weights: within a quarter of the value
  return distance <= Math.abs(value) * MATCH_LIMITS.size.closeRatio ? 'close' : 'none';
}

export const KIND_LABELS = { color: 'Colour', dimension: 'Size', fontSize: 'Font size', fontWeight: 'Font weight', fontFamily: 'Font family' };

/** A value as people read it */
export function formatSpecValue(kind, value) {
  if (kind === 'dimension' || kind === 'fontSize') return `${round(value)}px`;
  return String(value);
}

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const MATCH_WORDS = { exact: 'Exact match', close: 'Nearest token', none: 'No token' };

/** The handoff as a standalone HTML page */
export function handoffHtml(spec, matches, { generatedAt = new Date() } = {}) {
  const rows = matches
    .map((m) => {
      const swatch = m.kind === 'color' ? `<span class="swatch" style="background:${escapeHtml(m.value)}"></span>` : '';
      return `<tr><td>${KIND_LABELS[m.kind]}</td><td>${swatch}<code>${escapeHtml(formatSpecValue(m.kind, m.value))}</code></td><td>${m.count}</td><td>${m.token ? `<code>${escapeHtml(m.token)}</code> (${escapeHtml(m.tokenValue)})` : '—'}</td><td>${MATCH_WORDS[m.match]}${m.match === 'close' ? ` (distance ${m.distance})` : ''}</td></tr>`;
    })
    .join('\n');
  const size = spec.width && spec.height ? `<p><strong>Size:</strong> ${spec.width} × ${spec.height}px</p>` : '';
  const texts = spec.texts.length ? `<h2>Text</h2><ul>${spec.texts.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Design handoff: ${escapeHtml(spec.source)}</title>
<style>
body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; color: #1f2937; }
table { border-collapse: collapse; width: 100%; font-size: 14px; }
th, td { border-bottom: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: middle; }
code { font-family: ui-monospace, monospace; }
.swatch { display: inline-block; width: 14px; height: 14px; border: 1px solid #d1d5db; border-radius: 3px; margin-right: 6px; vertical-align: middle; }
</style>
</head>
<body>
<h1>Design handoff</h1>
<p><strong>Source:</strong> ${escapeHtml(spec.source)} · Generated ${escapeHtml(generatedAt.toISOString())}</p>
${size}
<h2>Values and design tokens</h2>
<table>
<thead><tr><th>Kind</th><th>Design value</th><th>Uses</th><th>Design-system token</th><th>Match</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
${texts}
</body>
</html>
`;
}

/** The handoff as Markdown */
export function handoffMarkdown(spec, matches) {
  const lines = ['# Design handoff', '', `Source: ${spec.source}`];
  if (spec.width && spec.height) lines.push(`Size: ${spec.width} × ${spec.height}px`);
  lines.push('', '| Kind | Design value | Uses | Token | Match |', '|------|------|------|------|------|');
  for (const m of matches) {
    lines.push(`| ${KIND_LABELS[m.kind]} | \`${formatSpecValue(m.kind, m.value)}\` | ${m.count} | ${m.token ? `\`${m.token}\`` : '—'} | ${MATCH_WORDS[m.match]} |`);
  }
  if (spec.texts.length) lines.push('', '## Text', '', ...spec.texts.map((t) => `- ${t}`));
  return `${lines.join('\n')}\n`;
}

/** The handoff as a jsPDF document (jspdf is loaded on demand) */
export async function handoffPdf(spec, matches, { generatedAt = new Date() } = {}) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const margin = 15;
  const pageHeight = doc.internal.pageSize.getHeight();
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;
  const write = (text, { size = 10, bold = false, gap = 2 } = {}) => {
    doc.setFontSize(size);
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(String(text), width);
    const height = lines.length * size * 0.45;
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines, margin, y);
    y += height + gap;
  };

  write('Design handoff', { size: 18, bold: true, gap: 4 });
  write(`Source: ${spec.source}`);
  write(`Generated: ${generatedAt.toISOString()}`);
  if (spec.width && spec.height) write(`Size: ${spec.width} × ${spec.height}px`);
  y += 4;
  write('Values and design tokens', { size: 14, bold: true, gap: 3 });
  for (const m of matches) {
    const token = m.token ? `${m.token} (${m.tokenValue})` : 'no token';
    write(`${KIND_LABELS[m.kind]}: ${formatSpecValue(m.kind, m.value)} × ${m.count}  ->  ${token}, ${MATCH_WORDS[m.match].toLowerCase()}`);
  }
  if (spec.texts.length) {
    y += 4;
    write('Text', { size: 14, bold: true, gap: 3 });
    spec.texts.forEach((t) => write(t));
  }
  return doc;
}
