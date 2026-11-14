// Works out the text edits that replace a hardcoded value with a design token
// reference. Pure string logic with no `vscode` import, so it can be unit tested.

export interface TextEdit {
  /** Offsets into the document text; `end` is exclusive */
  start: number;
  end: number;
  newText: string;
}

export interface TokenReplacement {
  /** Non-overlapping edits, in document order */
  edits: TextEdit[];
  /** The token reference that was written, e.g. `var(--color-primary)` or `tokens.color.primary` */
  reference: string;
}

export interface TokenEditOptions {
  /** Module the `tokens` object is imported from when a JS/TS file has no `tokens` binding yet */
  importPath: string;
}

type Context = 'css' | 'js' | 'markup';
type ScanState = 'code' | 'line-comment' | 'block-comment' | "'" | '"' | '`';

const CSS_LANGUAGES = new Set(['css', 'scss', 'sass', 'less', 'stylus', 'postcss']);
const JS_LANGUAGES = new Set(['javascript', 'typescript', 'javascriptreact', 'typescriptreact']);
const JSX_LANGUAGES = new Set(['javascriptreact', 'typescriptreact']);
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/** `--color-primary-500` for `color.primary.500` (Style Dictionary's CSS naming) */
export function cssVarName(tokenName: string): string {
  return `--${tokenName.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')}`;
}

/** `tokens.color.primary['500']` for `color.primary.500` */
export function jsAccessor(tokenName: string, root = 'tokens'): string {
  return tokenName
    .split('.')
    .filter(Boolean)
    .reduce((expr, segment) => (IDENTIFIER.test(segment) ? `${expr}.${segment}` : `${expr}[${JSON.stringify(segment)}]`), root);
}

/**
 * Whether `offset` is in CSS, JavaScript or markup. Single-file components and
 * HTML are split by their `<script>` / `<style>` blocks.
 */
export function contextAt(text: string, offset: number, languageId: string): Context {
  if (CSS_LANGUAGES.has(languageId)) return 'css';
  if (JS_LANGUAGES.has(languageId)) return 'js';
  let context: Context = 'markup';
  const blocks = /<(\/?)(script|style)\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = blocks.exec(text)) !== null && match.index < offset) {
    if (match.index + match[0].length > offset) break;
    context = match[1] ? 'markup' : match[2].toLowerCase() === 'style' ? 'css' : 'js';
  }
  return context;
}

/** Start of the JS code that contains `offset` (the inside of its `<script>` block, or 0) */
function codeStart(text: string, offset: number, languageId: string): number {
  if (JS_LANGUAGES.has(languageId)) return 0;
  let start = 0;
  const open = /<script\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = open.exec(text)) !== null && match.index < offset) start = match.index + match[0].length;
  return start;
}

/**
 * The lexical state at `offset`, scanning JavaScript from `from`: in code, a
 * comment, or a string/template literal. Handles escapes and `${…}` nesting;
 * regex literals are not recognised (a quote inside one can confuse the scan).
 */
function scanState(text: string, from: number, offset: number): ScanState {
  let state: ScanState = 'code';
  // Brace depth of each open `${` so `}` knows when it closes an interpolation
  const templateStack: number[] = [];
  let braces = 0;
  for (let i = from; i < offset; i++) {
    const ch = text[i];
    const next = text[i + 1];
    switch (state) {
      case 'code':
        if (ch === '/' && next === '/') {
          state = 'line-comment';
          i++;
        } else if (ch === '/' && next === '*') {
          state = 'block-comment';
          i++;
        } else if (ch === "'" || ch === '"' || ch === '`') {
          state = ch;
        } else if (ch === '{') {
          braces++;
        } else if (ch === '}') {
          if (templateStack.length > 0 && templateStack[templateStack.length - 1] === braces) {
            templateStack.pop();
            state = '`';
          } else {
            braces--;
          }
        }
        break;
      case 'line-comment':
        if (ch === '\n') state = 'code';
        break;
      case 'block-comment':
        if (ch === '*' && next === '/') {
          state = 'code';
          i++;
        }
        break;
      case "'":
      case '"':
        if (ch === '\\') i++;
        else if (ch === state || ch === '\n') state = 'code';
        break;
      case '`':
        if (ch === '\\') i++;
        else if (ch === '`') state = 'code';
        else if (ch === '$' && next === '{') {
          templateStack.push(braces);
          state = 'code';
          i++;
        }
        break;
    }
  }
  return state;
}

/** True when the quote at `quoteIndex` opens a JSX attribute value (`<Box color="…"`) */
function isJsxAttributeValue(text: string, quoteIndex: number): boolean {
  const before = text.slice(Math.max(0, quoteIndex - 500), quoteIndex);
  return /<[A-Za-z][\w.:-]*(?:\s+[^<>]*?)?\s[\w:-]+\s*=\s*$/.test(before);
}

const TOKENS_BINDING =
  /\bimport\s+(?:type\s+)?(?:tokens\b|\*\s+as\s+tokens\b|\{[^}]*\btokens\b[^}]*\}|[\w$]+\s*,\s*\{[^}]*\btokens\b[^}]*\})|\b(?:const|let|var)\s+(?:tokens\b|\{[^}]*\btokens\b[^}]*\})\s*=/;

/** Edit that adds `import { tokens } from '…'` after the existing imports, or undefined if `tokens` is already bound */
function importEdit(text: string, offset: number, languageId: string, importPath: string): TextEdit | undefined {
  const from = codeStart(text, offset, languageId);
  const end = JS_LANGUAGES.has(languageId) ? text.length : (() => {
    const close = text.slice(from).search(/<\/script>/i);
    return close === -1 ? text.length : from + close;
  })();
  const code = text.slice(from, end);
  if (TOKENS_BINDING.test(code)) return undefined;

  const statement = `import { tokens } from ${JSON.stringify(importPath).replace(/^"|"$/g, "'")};`;
  const imports = /^[ \t]*import\b[\s\S]*?(?:from\s*)?['"][^'"\n]+['"][ \t]*;?[ \t]*$/gm;
  let last: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;
  while ((match = imports.exec(code)) !== null) last = match;
  if (last) {
    const at = from + last.index + last[0].length;
    return { start: at, end: at, newText: `\n${statement}` };
  }
  // No imports: first line of the script (after a shebang and 'use strict')
  const prologue = /^(?:#![^\n]*\n)?(?:\s*(['"])use strict\1;?[ \t]*\n)?/.exec(code);
  let at = from + (prologue ? prologue[0].length : 0);
  if (from > 0 && text[at] === '\n') at++;
  return { start: at, end: at, newText: `${statement}\n` };
}

/**
 * Edits that replace the value at [start, end) with a reference to `tokenName`:
 * - CSS (and `<style>` blocks, and markup such as `style="…"`): `var(--token)`.
 * - JS/TS where the value is a whole string literal: the literal, quotes
 *   included, becomes `tokens.x` (`{tokens.x}` for a JSX attribute), and
 *   `import { tokens }` is added if the file doesn't bind `tokens`.
 * - Part of a template literal: `${tokens.x}` (plus the import).
 * - Part of a longer '…' / "…" string (e.g. `'1px solid #fff'`): `var(--token)`,
 *   which stays valid CSS inside the string.
 * Returns undefined where no edit makes sense (a comment, bare code).
 */
export function computeTokenReplacement(
  text: string,
  start: number,
  end: number,
  languageId: string,
  tokenName: string,
  options: TokenEditOptions
): TokenReplacement | undefined {
  if (start < 0 || end > text.length || start >= end) return undefined;
  const context = contextAt(text, start, languageId);
  const cssReference = `var(${cssVarName(tokenName)})`;
  if (context !== 'js') {
    return { edits: [{ start, end, newText: cssReference }], reference: cssReference };
  }

  const state = scanState(text, codeStart(text, start, languageId), start);
  const accessor = jsAccessor(tokenName);
  const withImport = (edit: TextEdit, reference: string): TokenReplacement => {
    const imp = importEdit(text, start, languageId, options.importPath);
    return { edits: imp ? [imp, edit] : [edit], reference };
  };

  if (state === "'" || state === '"' || state === '`') {
    const quote = state;
    const wholeLiteral = text[start - 1] === quote && text[end] === quote;
    if (wholeLiteral) {
      const jsx = quote !== '`' && (JSX_LANGUAGES.has(languageId) || languageId === 'javascript') && isJsxAttributeValue(text, start - 1);
      const reference = jsx ? `{${accessor}}` : accessor;
      return withImport({ start: start - 1, end: end + 1, newText: reference }, accessor);
    }
    if (quote === '`') {
      return withImport({ start, end, newText: `\${${accessor}}` }, accessor);
    }
    return { edits: [{ start, end, newText: cssReference }], reference: cssReference };
  }
  return undefined;
}

/** Applies edits to a string (for tests and previews) */
export function applyEdits(text: string, edits: TextEdit[]): string {
  return [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce((out, edit) => out.slice(0, edit.start) + edit.newText + out.slice(edit.end), text);
}
