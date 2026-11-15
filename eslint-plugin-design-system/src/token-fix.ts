// Autofix support for the token rules: a hardcoded value is replaced with a
// token reference only when the rule's `tokens` option has exactly one token
// with that value. No tokens, no match, or two tokens with the same value: the
// rule reports and leaves the code alone.

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Rule } from 'eslint';

export interface TokenFixOptions {
  /** Token name to value, e.g. `{ 'color-primary': '#3b82f6', 'spacing-md': '16px' }` */
  tokens?: Record<string, string>;
  /** How a token is written in place of the value; `{name}` is the token name. Default `var(--{name})`. */
  replacement?: string;
}

export const TOKEN_FIX_SCHEMA = [
  {
    type: 'object',
    properties: {
      tokens: { type: 'object', additionalProperties: { type: 'string' } },
      replacement: { type: 'string', pattern: '\\{name\\}' }
    },
    additionalProperties: false
  }
];

export type ValueKind = 'color' | 'length';

const expandHex = (hex: string): string =>
  hex.length === 4 || hex.length === 5 ? `#${[...hex.slice(1)].map(c => c + c).join('')}` : hex;

/** Values that mean the same thing compare equal: `#FFF` and `#ffffff`, `rgb(0,0,0)` and `rgb(0, 0, 0)`, `.5em` and `0.5em`. */
export function normalizeValue(value: string, kind: ValueKind): string {
  const v = value.trim().toLowerCase();
  if (kind === 'color') {
    return v.startsWith('#') ? expandHex(v) : v.replace(/\s+/g, '');
  }
  const m = /^(-?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/.exec(v);
  return m ? `${parseFloat(m[1])}${m[2]}` : v;
}

export function readOptions(context: Rule.RuleContext): TokenFixOptions {
  const options = context.options?.[0];
  return options && typeof options === 'object' ? (options as TokenFixOptions) : {};
}

/** The one token whose value is `value`; undefined when none or several match. */
export function uniqueToken(options: TokenFixOptions, value: string, kind: ValueKind): string | undefined {
  const wanted = normalizeValue(value, kind);
  const matches = Object.entries(options.tokens ?? {}).filter(
    ([, tokenValue]) => typeof tokenValue === 'string' && normalizeValue(tokenValue, kind) === wanted
  );
  return matches.length === 1 ? matches[0][0] : undefined;
}

export function tokenReference(options: TokenFixOptions, name: string): string {
  return (options.replacement ?? 'var(--{name})').replace(/\{name\}/g, name);
}

/** A reference can go inside a string only if it can't end the string or start an escape or interpolation. */
export function safeInside(reference: string, quote: string): boolean {
  return !reference.includes(quote) && !reference.includes('\\') && !reference.includes('${') && !/[\r\n]/.test(reference);
}

/**
 * Fixes for the values found in a string literal or template quasi, located in
 * its source text in order. A value that can't be found verbatim (written with
 * escapes) gets no fix.
 */
export function locateInSource(
  sourceText: string,
  start: number,
  values: string[]
): Array<{ value: string; range: [number, number] } | undefined> {
  let from = 0;
  return values.map(value => {
    const index = sourceText.indexOf(value, from);
    if (index === -1) return undefined;
    from = index + value.length;
    return { value, range: [start + index, start + index + value.length] as [number, number] };
  });
}

/** The quote character a string literal or JSX attribute value was written with. */
export function quoteOf(node: any, sourceText: string): string {
  return node.type === 'TemplateElement' ? '`' : sourceText[0];
}
