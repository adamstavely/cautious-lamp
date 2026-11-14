import { describe, expect, it } from 'vitest';
import { scriptSafeJson } from '../src/utils/scriptSafeJson.js';

const tricky = {
  close: '</script><script>alert(1)</script>',
  upperClose: '</SCRIPT >',
  comment: '<!-- x -->',
  amp: 'a &amp; b & c',
  separators: 'line\u2028para\u2029end',
  nested: [{ s: '</script>' }, 1, null, true],
  quote: 'say "hi" \\ there',
};

describe('scriptSafeJson', () => {
  it('round-trips through JSON.parse and as a JS literal', () => {
    const out = scriptSafeJson(tricky);
    expect(JSON.parse(out)).toEqual(tricky);
    // eslint-disable-next-line no-new-func
    expect(new Function(`return ${out};`)()).toEqual(tricky);
  });

  it('leaves no characters that can end a <script> block or an HTML comment', () => {
    const out = scriptSafeJson(tricky);
    expect(out).not.toMatch(/[<>&]/);
    expect(out).not.toContain('\u2028');
    expect(out).not.toContain('\u2029');
    expect(out).toContain('\\u003c/script\\u003e');
  });

  it('keeps JSON.stringify formatting (indent defaults to 2, can be changed)', () => {
    const value = { a: [1, 2] };
    expect(scriptSafeJson(value)).toBe(JSON.stringify(value, null, 2));
    expect(scriptSafeJson(value, 4)).toBe(JSON.stringify(value, null, 4));
    expect(scriptSafeJson(value, 0)).toBe('{"a":[1,2]}');
  });

  it('handles plain values', () => {
    expect(scriptSafeJson('<b>')).toBe('"\\u003cb\\u003e"');
    expect(scriptSafeJson(3)).toBe('3');
    expect(scriptSafeJson(null)).toBe('null');
  });
});
