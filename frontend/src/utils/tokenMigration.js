import { valueKey } from './designTokens.js';

/**
 * Token renames applied to source files, entirely in the browser.
 *
 * A rename map is a list of `{ from, to }` token names (`color.primary` →
 * `color.brand.primary`). Each name is looked for in the forms code uses:
 *  - CSS custom properties: `--color-primary` (with an optional prefix, `--ds-color-primary`)
 *  - Sass variables: `$color-primary`
 *  - dotted paths: `tokens.color.primary`, `'color.primary'`, aliases `{color.primary}`
 * Which forms a file gets depends on its type (see FORMS_BY_TYPE). A match
 * must be the whole name: `--color-primary-hover` and `color.primary.500` are
 * other tokens and are left alone unless they're in the map themselves.
 */

export const SOURCE_EXTENSIONS = ['css', 'scss', 'sass', 'less', 'js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'vue', 'svelte', 'html', 'json'];

const FORMS_BY_TYPE = {
  css: ['css'],
  less: ['css'],
  scss: ['css', 'sass'],
  sass: ['css', 'sass'],
  js: ['css', 'path'],
  mjs: ['css', 'path'],
  cjs: ['css', 'path'],
  jsx: ['css', 'path'],
  ts: ['css', 'path'],
  tsx: ['css', 'path'],
  json: ['path'],
  vue: ['css', 'sass', 'path'],
  svelte: ['css', 'sass', 'path'],
  html: ['css', 'path'],
};

export const FORM_LABELS = { css: 'CSS variable', sass: 'Sass variable', path: 'Token path' };

export const fileExtension = (name) => {
  const match = /\.([a-z0-9]+)$/i.exec(name ?? '');
  return match ? match[1].toLowerCase() : '';
};

export const isSupportedSource = (name) => SOURCE_EXTENSIONS.includes(fileExtension(name));

/** `color.primary` (or `color/primary`) as segments */
const segments = (name) => String(name).trim().split(/[./]/).filter(Boolean);
export const kebab = (name) => segments(name).join('-');
export const dotted = (name) => segments(name).join('.');

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Renames inferred from an old and a new token set. A token in both sets
 * keeps its name. A token only in the old set is renamed to the one token
 * only in the new set with the same resolved value (and type, when both have
 * one); with several candidates, one with the same last name segment wins.
 * Anything else is left unmatched, with its candidates, for the person to settle.
 */
export function inferRenames(oldTokens, newTokens) {
  const newNames = new Set(newTokens.map((token) => token.name));
  const oldNames = new Set(oldTokens.map((token) => token.name));
  const removed = oldTokens.filter((token) => !newNames.has(token.name));
  const added = newTokens.filter((token) => !oldNames.has(token.name));
  const claimed = new Set();
  const renames = [];
  const unmatched = [];

  const sameValue = (a, b) => {
    const left = valueKey(a.resolved ?? a.value);
    if (!left || left !== valueKey(b.resolved ?? b.value)) return false;
    return !a.type || !b.type || a.type === b.type;
  };
  const last = (name) => segments(name).at(-1);

  for (const token of removed) {
    let candidates = added.filter((candidate) => !claimed.has(candidate.name) && sameValue(token, candidate));
    if (candidates.length > 1) {
      const sameLeaf = candidates.filter((candidate) => last(candidate.name) === last(token.name));
      if (sameLeaf.length === 1) candidates = sameLeaf;
    }
    if (candidates.length === 1) {
      claimed.add(candidates[0].name);
      renames.push({ from: token.name, to: candidates[0].name, reason: 'Same value' });
    } else {
      unmatched.push({ name: token.name, value: token.resolved ?? token.value, candidates: candidates.map((c) => c.name) });
    }
  }
  return { renames, unmatched, kept: oldTokens.length - removed.length, added: added.filter((token) => !claimed.has(token.name)).map((t) => t.name) };
}

/**
 * Renames typed or pasted by a person: one per line as `old -> new`,
 * `old => new`, `old new` or `old,new`, or a JSON object `{ "old": "new" }`.
 * Returns the renames and the lines it couldn't read.
 */
export function parseRenameText(text) {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return { renames: [], errors: [] };
  if (trimmed.startsWith('{')) {
    try {
      const json = JSON.parse(trimmed);
      const renames = Object.entries(json)
        .filter(([from, to]) => typeof to === 'string' && from.trim() && to.trim())
        .map(([from, to]) => ({ from: from.trim(), to: to.trim() }));
      return { renames, errors: [] };
    } catch (error) {
      return { renames: [], errors: [`Not valid JSON: ${error.message}`] };
    }
  }
  const renames = [];
  const errors = [];
  trimmed.split('\n').forEach((raw, index) => {
    const line = raw.replace(/\s*(\/\/|#).*$/, '').trim();
    if (!line) return;
    const parts = line.split(/\s*(?:->|=>|,|\s)\s*/).filter(Boolean);
    if (parts.length === 2) renames.push({ from: parts[0], to: parts[1] });
    else errors.push(`Line ${index + 1}: expected "old.name -> new.name"`);
  });
  return { renames, errors };
}

/** Problems with a rename map that would make the rewrite ambiguous or a no-op */
export function validateRenames(renames) {
  const problems = [];
  const seen = new Map();
  for (const { from, to } of renames) {
    if (!from || !to) problems.push('Every rename needs an old and a new name.');
    else if (dotted(from) === dotted(to)) problems.push(`"${from}" is renamed to itself.`);
    else if (seen.has(dotted(from)) && seen.get(dotted(from)) !== dotted(to)) problems.push(`"${from}" has two new names.`);
    if (from) seen.set(dotted(from), dotted(to));
  }
  return [...new Set(problems)];
}

function buildMatchers(renames, { cssPrefix = '' } = {}) {
  const prefix = cssPrefix.replace(/^-+/, '').trim();
  const forms = {
    css: new Map(renames.map((r) => [`--${prefix}${kebab(r.from)}`, { to: `--${prefix}${kebab(r.to)}`, rename: r.from }])),
    sass: new Map(renames.map((r) => [`$${kebab(r.from)}`, { to: `$${kebab(r.to)}`, rename: r.from }])),
    path: new Map(renames.map((r) => [dotted(r.from), { to: dotted(r.to), rename: r.from }])),
  };
  const matchers = {};
  for (const [form, map] of Object.entries(forms)) {
    const names = [...map.keys()].filter(Boolean).sort((a, b) => b.length - a.length).map(escapeRegExp);
    if (!names.length) continue;
    // Whole names only: not inside a longer identifier, kebab name or dotted path
    const before = form === 'path' ? '(?<![\\w$-])' : '(?<![\\w-])';
    const after = form === 'path' ? '(?![\\w-]|\\.[\\w-])' : '(?![\\w-])';
    matchers[form] = { re: new RegExp(`${before}(?:${names.join('|')})${after}`, 'g'), map };
  }
  return matchers;
}

/**
 * Rewrites one file. Returns the new text, every replacement (`line`, `from`,
 * `to`, `form`, and `rename`: the map entry's old name), and the changed lines (`line`, `before`, `after`) for a diff.
 */
export function rewriteSource(text, fileName, renames, options = {}) {
  const forms = FORMS_BY_TYPE[fileExtension(fileName)] ?? ['css', 'sass', 'path'];
  const matchers = buildMatchers(renames, options);
  const replacements = [];
  const changedLines = [];
  const lines = text.split('\n');
  const output = lines.map((original, index) => {
    let line = original;
    for (const form of forms) {
      const matcher = matchers[form];
      if (!matcher) continue;
      line = line.replace(matcher.re, (match) => {
        const { to, rename } = matcher.map.get(match);
        replacements.push({ line: index + 1, from: match, to, form, rename });
        return to;
      });
    }
    if (line !== original) changedLines.push({ line: index + 1, before: original, after: line });
    return line;
  });
  return { output: output.join('\n'), replacements, changedLines };
}

/** Lines that still use a name the migration has no new name for */
export function findLeftovers(text, fileName, names, options = {}) {
  if (!names.length) return [];
  const forms = FORMS_BY_TYPE[fileExtension(fileName)] ?? ['css', 'sass', 'path'];
  const matchers = buildMatchers(names.map((name) => ({ from: name, to: name })), options);
  const found = [];
  text.split('\n').forEach((line, index) => {
    for (const form of forms) {
      const matcher = matchers[form];
      if (!matcher) continue;
      for (const match of line.matchAll(matcher.re)) found.push({ line: index + 1, name: match[0], form });
    }
  });
  return found;
}

/**
 * Runs the migration over every file. `files` are `{ name, text }`;
 * `unmatched` are old names with no new name, reported where they're still used.
 */
export function migrateFiles(files, renames, { unmatched = [], cssPrefix = '' } = {}) {
  const results = files.map((file) => {
    const { output, replacements, changedLines } = rewriteSource(file.text, file.name, renames, { cssPrefix });
    const leftovers = findLeftovers(output, file.name, unmatched, { cssPrefix });
    return { name: file.name, original: file.text, output, replacements, changedLines, leftovers, changed: output !== file.text };
  });
  const byRename = renames.map((rename) => ({
    ...rename,
    count: results.reduce((sum, result) => sum + result.replacements.filter((r) => r.rename === rename.from).length, 0),
  }));
  return {
    files: results,
    byRename,
    totals: {
      files: results.length,
      filesChanged: results.filter((r) => r.changed).length,
      replacements: results.reduce((sum, r) => sum + r.replacements.length, 0),
      linesChanged: results.reduce((sum, r) => sum + r.changedLines.length, 0),
      leftovers: results.reduce((sum, r) => sum + r.leftovers.length, 0),
      unusedRenames: byRename.filter((r) => r.count === 0).length,
    },
  };
}

/** A zip of `{ name, text }` entries, as a Blob by default (JSZip is loaded on demand) */
export async function zipFiles(entries, { type = 'blob' } = {}) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const taken = new Set();
  for (const entry of entries) {
    // Two uploads with the same name both go in the zip
    let name = entry.name;
    for (let n = 2; taken.has(name); n++) name = entry.name.replace(/(\.[^.]+)?$/, ` (${n})$1`);
    taken.add(name);
    zip.file(name, entry.text);
  }
  return zip.generateAsync({ type });
}
