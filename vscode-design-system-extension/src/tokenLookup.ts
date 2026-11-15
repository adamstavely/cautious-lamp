// Finds tokens from what's written in a document: references under the cursor,
// completions after a dotted prefix, and hard-coded values a token could replace.
// Pure string logic with no `vscode` import, so it can be unit tested.

import { computeTokenReplacement, cssVarName, jsAccessor } from './tokenEdit';

export interface Token {
  id: string;
  name: string;
  value: string;
  type: string;
  category: string;
  description?: string;
}

/** A span of one line; `end` is exclusive */
export interface Span {
  start: number;
  end: number;
}

export interface TokenReference extends Span {
  /** `color.primary.500` for `tokens.color.primary['500']`, or the custom property for `var(--color-primary-500)` */
  name?: string;
  cssVar?: string;
}

const REM_PX = 16;

/** `#abc` → `#aabbcc`, lower case; anything else unchanged */
export function normalizeHex(value: string): string {
  const v = value.trim().toLowerCase();
  if (/^#[0-9a-f]{3,4}$/.test(v)) return `#${[...v.slice(1)].map(c => c + c).join('')}`;
  return v;
}

/** `1rem` for `16px`, `0.25rem` for `0.25rem`, undefined for anything that isn't px or rem */
function toRem(value: string): number | undefined {
  const match = /^(-?\d+(?:\.\d+)?|-?\.\d+)(px|rem)$/i.exec(value.trim());
  if (!match) return undefined;
  const n = parseFloat(match[1]);
  return match[2].toLowerCase() === 'px' ? n / REM_PX : n;
}

function isSpacing(token: Token): boolean {
  return token.category === 'spacing' || token.type === 'spacing';
}

/**
 * The value a token stands for, following `{other.token}` references (the API
 * stores aliases that way). Undefined for a broken or circular reference.
 */
export function resolveTokenValue(tokens: Token[], token: Token): string | undefined {
  let current: Token | undefined = token;
  const seen = new Set<string>();
  while (current) {
    const ref = /^\{([^}]+)\}$/.exec(String(current.value).trim());
    if (!ref) return String(current.value);
    if (seen.has(current.name)) return undefined;
    seen.add(current.name);
    current = tokens.find(t => t.name === ref[1]);
  }
  return undefined;
}

/**
 * The token whose value is `value`: a hex colour (any case, short or long form)
 * or a spacing length. Spacing tokens are stored in rem, so `16px` finds the
 * `1rem` token. Aliases are compared by the value they resolve to, and the
 * token that holds the value itself wins over its aliases.
 */
export function findTokenForValue(tokens: Token[], value: string): Token | undefined {
  const trimmed = value.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) {
    const hex = normalizeHex(trimmed);
    const colors = tokens.filter(t => t.type === 'color');
    return colors.find(t => normalizeHex(String(t.value)) === hex)
      ?? colors.find(t => normalizeHex(resolveTokenValue(tokens, t) ?? '') === hex);
  }
  const rem = toRem(trimmed);
  if (rem !== undefined) {
    const spacing = tokens.filter(isSpacing);
    // A spacing token stored as a bare number means pixels
    const remOf = (t: Token) => {
      const v = String(t.value).trim();
      return /^\d+(\.\d+)?$/.test(v) ? parseFloat(v) / REM_PX : toRem(v);
    };
    return spacing.find(t => remOf(t) === rem)
      ?? spacing.find(t => { const v = resolveTokenValue(tokens, t); return v !== undefined && toRem(v) === rem; });
  }
  return undefined;
}

const TOKENS_ACCESSOR = /\btokens((?:\.[A-Za-z_$][\w$]*|\[\s*(?:'[^']*'|"[^"]*"|\d+)\s*\])+)/g;
const CSS_VAR = /var\(\s*(--[\w-]+)\s*[,)]/g;

/**
 * The token reference that covers `character` on `line`: a `tokens.a.b` or
 * `tokens.a['500']` accessor, or a `var(--a-b)` custom property. The default
 * word pattern stops at dots, so a hover on `primary` in `tokens.color.primary`
 * only sees `primary`; this reads the whole reference.
 */
export function tokenReferenceAt(line: string, character: number): TokenReference | undefined {
  for (const match of line.matchAll(TOKENS_ACCESSOR)) {
    const start = match.index!;
    const end = start + match[0].length;
    if (character < start || character > end) continue;
    const segments = [...match[1].matchAll(/\.([A-Za-z_$][\w$]*)|\[\s*(?:'([^']*)'|"([^"]*)"|(\d+))\s*\]/g)]
      .map(s => s[1] ?? s[2] ?? s[3] ?? s[4]);
    return { start, end, name: segments.join('.') };
  }
  for (const match of line.matchAll(CSS_VAR)) {
    const start = match.index!;
    const end = start + match[0].length;
    if (character < start || character > end) continue;
    return { start, end, cssVar: match[1] };
  }
  return undefined;
}

/** The token a reference names, by dotted name or by its CSS custom property */
export function findTokenByReference(tokens: Token[], ref: TokenReference): Token | undefined {
  if (ref.name) return tokens.find(t => t.name === ref.name);
  if (ref.cssVar) return tokens.find(t => cssVarName(t.name) === ref.cssVar);
  return undefined;
}

/** The hex colour (`#abc`, `#aabbcc`, with optional alpha) that covers `character` on `line` */
export function hexColorAt(line: string, character: number): (Span & { value: string }) | undefined {
  for (const match of line.matchAll(/(?<![\w&#])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi)) {
    const start = match.index!;
    const end = start + match[0].length;
    if (character >= start && character <= end) return { start, end, value: match[0] };
  }
  return undefined;
}

/** A small square swatch as an inline SVG image for hover markdown */
export function colorSwatchMarkdown(hex: string, label = hex): string {
  if (!/^#[0-9a-f]{3,8}$/i.test(hex)) return '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="16"><rect width="48" height="16" rx="2" fill="${hex}" stroke="#808080"/></svg>`;
  const uri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return `![${label.replace(/[[\]]/g, '')}](${uri})`;
}

export interface CompletionCandidate {
  token: Token;
  /**
   * What to insert after the typed prefix: the rest of the name as a JS
   * accessor (`primary['500']` for `color.primary.500`)
   */
  insertText: string;
  /** True when the insert must also replace the dot before the cursor (`spacing['2xl']`) */
  replacesDot: boolean;
}

/**
 * Tokens to offer after `linePrefix`: after `tokens.` and `tokens.color.` every
 * token under that path, and after a bare `color.` / `spacing.` (any first
 * segment some token name starts with) the tokens under it. The match is on
 * the token's dotted name, not its category (`color.*` tokens are in the
 * `colors` category). Returns undefined when the prefix isn't a token path.
 */
export function completionCandidates(linePrefix: string, tokens: Token[]): CompletionCandidate[] | undefined {
  let path: string;
  const accessor = /\btokens\.((?:[\w$-]+\.)*)$/.exec(linePrefix);
  if (accessor) {
    path = accessor[1];
  } else {
    const bare = /(?<![\w$.])([A-Za-z_$][\w$]*\.(?:[\w$-]+\.)*)$/.exec(linePrefix);
    if (!bare) return undefined;
    path = bare[1];
    const root = path.slice(0, path.indexOf('.') + 1);
    if (!tokens.some(t => t.name.startsWith(root))) return undefined;
  }
  return tokens
    .filter(t => t.name.startsWith(path) && t.name.length > path.length)
    .map(token => {
      const accessor = jsAccessor(token.name.slice(path.length), '');
      return accessor.startsWith('.')
        ? { token, insertText: accessor.slice(1), replacesDot: false }
        : { token, insertText: accessor, replacesDot: true };
    });
}

export interface HardcodedValue {
  /** Offsets into the document text; `end` is exclusive */
  start: number;
  end: number;
  value: string;
  token: Token;
}

/** Properties whose lengths are spacing, so `font-size: 16px` isn't flagged as `spacing.md` */
const SPACING_PROPERTY = /(?:^|[\s{;,('"])(?:margin|padding|gap|row-?gap|column-?gap|inset|top|right|bottom|left)[\w-]*['"]?\s*:\s*[^;:{}]*$/i;

/**
 * Hard-coded colours and spacing lengths in `text` that equal a token's value
 * and that the "Replace with token" fix can rewrite (in a stylesheet, a style
 * block or a string; never in a comment or bare code).
 */
export function findHardcodedValues(text: string, languageId: string, tokens: Token[], importPath: string): HardcodedValue[] {
  const found: HardcodedValue[] = [];
  const replaceable = (start: number, end: number, token: Token) =>
    computeTokenReplacement(text, start, end, languageId, token.name, { importPath }) !== undefined;

  for (const match of text.matchAll(/(?<![\w&#])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi)) {
    const start = match.index!;
    const end = start + match[0].length;
    const token = findTokenForValue(tokens, match[0]);
    if (token && replaceable(start, end, token)) found.push({ start, end, value: match[0], token });
  }

  for (const match of text.matchAll(/(?<![\w.#-])(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem)(?![\w%])/gi)) {
    const start = match.index!;
    const end = start + match[0].length;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    if (!SPACING_PROPERTY.test(text.slice(lineStart, start))) continue;
    const token = findTokenForValue(tokens, match[0]);
    if (token && replaceable(start, end, token)) found.push({ start, end, value: match[0], token });
  }

  return found.sort((a, b) => a.start - b.start);
}

/** Hover text for a token: its value (and what an alias resolves to), category, type and a swatch for colours */
export function tokenHoverMarkdown(tokens: Token[], token: Token): string {
  const resolved = resolveTokenValue(tokens, token);
  const parts = [`### ${token.name}`, `**Value:** \`${token.value}\``];
  if (resolved !== undefined && resolved !== String(token.value)) parts.push(`**Resolves to:** \`${resolved}\``);
  parts.push(`**Category:** ${token.category}`, `**Type:** ${token.type}`);
  if (token.description) parts.push(token.description);
  if (token.type === 'color' && resolved) {
    const swatch = colorSwatchMarkdown(resolved, token.name);
    if (swatch) parts.push(swatch);
  }
  return parts.join('\n\n');
}

/** Hover text for a hard-coded colour: a swatch, and the token to use instead when one has this value */
export function hardcodedColorHoverMarkdown(tokens: Token[], hex: string): string {
  const parts = [`### Hard-coded colour`, `**Value:** \`${hex}\``, colorSwatchMarkdown(hex)];
  const token = findTokenForValue(tokens, hex);
  parts.push(token
    ? `Token \`${token.name}\` has this value. Use the quick fix (Replace with token) to swap it in.`
    : 'No design token has this value.');
  return parts.join('\n\n');
}
