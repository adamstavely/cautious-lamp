import { TokenKind } from './design-tool.types';

/**
 * How design-tool names and values become design-system tokens. Names follow
 * the seeded tokens: `color.primary.500`, `spacing.md`, `border.radius.sm`,
 * `typography.fontSize.xl`. Values are written as CSS (hex colours, px sizes)
 * and compared loosely, so `1rem` in code and `16px` in Figma are the same.
 */

/** The token name prefix, type and category for each kind */
const KINDS: Record<TokenKind, { root: string[]; type: string; category: string; aliases: string[] }> = {
  color: { root: ['color'], type: 'color', category: 'colors', aliases: ['color', 'colors', 'colour', 'colours'] },
  spacing: { root: ['spacing'], type: 'dimension', category: 'spacing', aliases: ['spacing', 'space', 'spaces', 'gap', 'gaps'] },
  radius: {
    root: ['border', 'radius'],
    type: 'dimension',
    category: 'borders',
    aliases: ['border', 'borders', 'radius', 'radii', 'border-radius', 'corner-radius', 'corner', 'corners', 'rounded'],
  },
  dimension: { root: ['size'], type: 'dimension', category: 'sizing', aliases: ['size', 'sizes', 'sizing', 'dimension', 'dimensions'] },
  fontSize: { root: ['typography', 'fontSize'], type: 'fontSize', category: 'typography', aliases: ['typography', 'type', 'font', 'fonts', 'font-size', 'font-sizes', 'fontsize'] },
  fontWeight: {
    root: ['typography', 'fontWeight'],
    type: 'fontWeight',
    category: 'typography',
    aliases: ['typography', 'type', 'font', 'fonts', 'font-weight', 'font-weights', 'fontweight', 'weight', 'weights'],
  },
  fontFamily: {
    root: ['typography', 'fontFamily'],
    type: 'fontFamily',
    category: 'typography',
    aliases: ['typography', 'type', 'font', 'fonts', 'font-family', 'font-families', 'fontfamily', 'family', 'families'],
  },
  lineHeight: {
    root: ['typography', 'lineHeight'],
    type: 'lineHeight',
    category: 'typography',
    aliases: ['typography', 'type', 'font', 'line-height', 'line-heights', 'lineheight', 'leading'],
  },
};

export function kindInfo(kind: TokenKind): { type: string; category: string } {
  return { type: KINDS[kind].type, category: KINDS[kind].category };
}

/** One name segment in token style: lower case, words joined by hyphens */
function segment(raw: string): string {
  return raw
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** The segments of a design-tool name, split on `/` and `.` ("Color/Brand Blue" → color, brand-blue) */
export function nameSegments(name: string): string[] {
  return name.split(/[/.]/).map(segment).filter(Boolean);
}

/**
 * The design-system token name for a design-tool name: the kind's prefix,
 * then the name without any leading words that repeat it. "Colors/Primary/500"
 * becomes color.primary.500, "Radius/sm" border.radius.sm, and a text style
 * "Heading/XL" typography.fontSize.heading.xl.
 */
export function tokenNameFor(kind: TokenKind, designName: string): string {
  const { root, aliases } = KINDS[kind];
  const rest = nameSegments(designName);
  while (rest.length > 1 && aliases.includes(rest[0])) rest.shift();
  if (rest.length === 1 && aliases.includes(rest[0])) rest.shift();
  return [...root, ...(rest.length ? rest : ['default'])].join('.');
}

/** Figma or Penpot channel values (0–1) as CSS hex, with alpha only when it isn't opaque */
export function colorToHex(color: { r: number; g: number; b: number; a?: number }, opacity = 1): string {
  const channel = (value: number) =>
    Math.round(Math.min(1, Math.max(0, value)) * 255)
      .toString(16)
      .padStart(2, '0');
  const alpha = (color.a ?? 1) * opacity;
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}${alpha < 1 ? channel(alpha) : ''}`;
}

/** A Penpot colour ("#1F2937" with a separate opacity) as CSS hex */
export function hexWithOpacity(hex: string, opacity?: number): string {
  const normalized = normalizeHex(hex);
  if (!normalized || opacity === undefined || opacity >= 1) return normalized ?? hex;
  const alpha = Math.round(Math.max(0, opacity) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${normalized.slice(0, 7)}${alpha}`;
}

/** A number of pixels as CSS ("16px"), trimmed to 4 decimals */
export function px(value: number): string {
  return `${Number(value.toFixed(4))}px`;
}

/** #abc → #aabbcc, lower case, an opaque alpha dropped; undefined when it isn't hex */
function normalizeHex(value: string): string | undefined {
  const match = value.trim().toLowerCase().match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/);
  if (!match) return undefined;
  let hex = match[1];
  if (hex.length <= 4) hex = [...hex].map((c) => c + c).join('');
  if (hex.length === 8 && hex.endsWith('ff')) hex = hex.slice(0, 6);
  return `#${hex}`;
}

/** Root font size used to compare rem and px */
const REM_PX = 16;

/** A value in a form two sides can be compared in */
export function comparableValue(value: string): string {
  const trimmed = value.trim();
  const hex = normalizeHex(trimmed);
  if (hex) return hex;
  const size = trimmed.match(/^(-?\d*\.?\d+)(px|rem)?$/i);
  if (size) {
    const amount = Number(size[1]) * (size[2]?.toLowerCase() === 'rem' ? REM_PX : 1);
    // A bare number is a size in px for dimensions, and itself for weights and line heights
    return size[2] ? `${Number(amount.toFixed(4))}px` : String(Number(amount.toFixed(4)));
  }
  return trimmed.replace(/\s+/g, ' ').replace(/^["']|["']$/g, '').toLowerCase();
}

/** Whether two token values mean the same thing */
export function sameValue(a: string | undefined, b: string | undefined): boolean {
  if (a === undefined || b === undefined) return a === b;
  if (a === b) return true;
  const left = comparableValue(a);
  const right = comparableValue(b);
  if (left === right) return true;
  // 0 and 0px are the same size
  return left.replace(/px$/, '') === '0' && right.replace(/px$/, '') === '0';
}

/** Token types that hold the same kind of value (a radius can be a "dimension" or a "borderRadius") */
const COMPATIBLE_TYPES: string[][] = [
  ['dimension', 'spacing', 'sizing', 'borderRadius', 'radius'],
  ['fontSize', 'fontSizes'],
  ['fontWeight', 'fontWeights'],
  ['fontFamily', 'fontFamilies'],
];

export function compatibleTypes(a: string, b: string): boolean {
  return a === b || COMPATIBLE_TYPES.some((group) => group.includes(a) && group.includes(b));
}

/** `{color.primary}`: the token refers to another one */
export function isReference(value: string): boolean {
  return /^\{[^{}]+\}$/.test(value.trim());
}

/**
 * The kind a number variable or token maps to: from Figma's scopes first,
 * then from its name. Undefined when neither says (it is skipped, with a warning).
 */
export function numberKind(name: string, scopes: string[] = []): TokenKind | undefined {
  const scoped = scopes.filter((s) => s !== 'ALL_SCOPES');
  if (scoped.length) {
    if (scoped.includes('CORNER_RADIUS')) return 'radius';
    if (scoped.includes('FONT_SIZE')) return 'fontSize';
    if (scoped.includes('FONT_WEIGHT')) return 'fontWeight';
    if (scoped.includes('LINE_HEIGHT')) return 'lineHeight';
    if (scoped.includes('GAP')) return 'spacing';
    if (scoped.includes('WIDTH_HEIGHT')) return 'dimension';
  }
  const lower = name.toLowerCase();
  if (/radius|radii|corner|rounded/.test(lower)) return 'radius';
  if (/font.?size|text.?size/.test(lower)) return 'fontSize';
  if (/weight/.test(lower)) return 'fontWeight';
  if (/line.?height|leading/.test(lower)) return 'lineHeight';
  if (/spac|gap|padding|margin|gutter|inset/.test(lower)) return 'spacing';
  if (/size|width|height|dimension/.test(lower)) return 'dimension';
  return undefined;
}

/** A number in the form its kind is written in: weights and line-height ratios bare, sizes in px */
export function numberValue(kind: TokenKind, value: number): string {
  if (kind === 'fontWeight') return String(Math.round(value));
  if (kind === 'lineHeight' && value > 0 && value <= 4) return String(Number(value.toFixed(4)));
  return px(value);
}
