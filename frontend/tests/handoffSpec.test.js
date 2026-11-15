// Handoff specs: values read from SVG markup and design-token JSON, matched
// to the nearest design-system token (exact, close, or none), unsupported
// uploads explained, and the HTML export escaping what it embeds.
import { describe, expect, it } from 'vitest';
import { fromDesignSystemTokens } from '../src/utils/designTokens.js';
import { findSimilarComponents, handoffHtml, matchToTokens, parseSvgSpec, parseTokenSpec, toPx, unsupportedMessage, uploadKind } from '../src/utils/handoffSpec.js';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="48" viewBox="0 0 320 48">
  <style>.label { font-family: 'Inter', sans-serif; fill: #111827; }</style>
  <rect width="320" height="48" rx="8" fill="#4F46E5" />
  <rect x="2" y="2" width="10" height="10" style="fill: #4f46e5; stroke: none" />
  <text class="label" x="16" y="30" font-size="16" font-weight="bold">Save <tspan>changes</tspan></text>
</svg>`;

const DS = fromDesignSystemTokens([
  { name: 'color.primary', value: '#4f46e5', type: 'color' },
  { name: 'color.button.primary', value: '{color.primary}', type: 'color' },
  { name: 'color.neutral.900', value: '#111827', type: 'color' },
  { name: 'color.secondary', value: '#6366f1', type: 'color' },
  { name: 'spacing.sm', value: '0.5rem', type: 'dimension' },
  { name: 'border.radius.md', value: '0.5rem', type: 'dimension' },
  { name: 'typography.fontSize.md', value: '1rem', type: 'fontSize' },
  { name: 'typography.fontWeight.bold', value: '700', type: 'fontWeight' },
  { name: 'typography.fontFamily.primary', value: 'Inter, sans-serif', type: 'fontFamily' },
]);

describe('parseSvgSpec', () => {
  it('reads size, colours with counts, fonts, radii and text', () => {
    const spec = parseSvgSpec(SVG, 'button.svg');
    expect(spec.width).toBe(320);
    expect(spec.height).toBe(48);
    const values = Object.fromEntries(spec.values.map((v) => [`${v.kind}:${v.value}`, v.count]));
    expect(values).toEqual({
      'color:#4f46e5': 2,
      'color:#111827': 1,
      'fontFamily:Inter': 1,
      'fontSize:16': 1,
      'fontWeight:700': 1,
      'dimension:8': 1,
    });
    expect(spec.texts).toEqual(['Save changes']);
  });

  it('falls back to the viewBox for size, and rejects markup that is not SVG', () => {
    expect(parseSvgSpec('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 12"/>').width).toBe(24);
    expect(() => parseSvgSpec('<html></html>', 'x.svg')).toThrow(/isn't valid SVG/);
  });
});

describe('parseTokenSpec', () => {
  it('collects token values by kind, in px for sizes', () => {
    const spec = parseTokenSpec(JSON.stringify({ c: { $type: 'color', a: { $value: '#ff0000' } }, s: { gap: { $value: '1.5rem', $type: 'dimension' } } }));
    expect(spec.values.map((v) => [v.kind, v.value, v.names])).toEqual([
      ['color', '#ff0000', ['c.a']],
      ['dimension', 24, ['s.gap']],
    ]);
  });
});

describe('matchToTokens', () => {
  it('finds exact matches, nearest tokens, and says when nothing is near', () => {
    const matches = matchToTokens(
      [
        { kind: 'color', value: '#4f46e5', count: 2 },
        { kind: 'color', value: '#5048e6', count: 1 },
        { kind: 'color', value: '#00ff00', count: 1 },
        { kind: 'dimension', value: 8, count: 1, role: 'radius' },
        { kind: 'fontSize', value: 15, count: 1 },
        { kind: 'fontWeight', value: 700, count: 1 },
        { kind: 'fontFamily', value: 'Inter', count: 1 },
        { kind: 'fontFamily', value: 'Comic Sans MS', count: 1 },
      ],
      DS,
    );
    expect(matches.map((m) => [m.kind, m.match, m.token])).toEqual([
      ['color', 'exact', 'color.primary'],
      ['color', 'close', 'color.primary'],
      ['color', 'none', null],
      ['dimension', 'exact', 'border.radius.md'],
      ['fontSize', 'close', 'typography.fontSize.md'],
      ['fontWeight', 'exact', 'typography.fontWeight.bold'],
      ['fontFamily', 'exact', 'typography.fontFamily.primary'],
      ['fontFamily', 'none', null],
    ]);
    expect(matches[4].distance).toBe(1);
  });
});

describe('findSimilarComponents', () => {
  it('names components whose names appear as whole words in layers or the file name', () => {
    const spec = parseSvgSpec('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><g id="PrimaryButton"><rect/></g><g data-name="Cardigan"/></svg>', 'checkout-modal.svg');
    const found = findSimilarComponents(spec, [
      { id: 'button', name: 'Button' },
      { id: 'card', name: 'Card' },
      { id: 'modal', name: 'Modal' },
      { id: 'data-table', name: 'Data Table' },
    ]);
    expect(found.map((f) => [f.component.id, f.reason])).toEqual([
      ['button', 'Layer "PrimaryButton"'],
      ['modal', 'File name "checkout-modal.svg"'],
    ]);
  });
});

describe('uploads', () => {
  it('knows what it can read and explains what it cannot', () => {
    expect(uploadKind({ name: 'a.SVG' })).toBe('svg');
    expect(uploadKind({ name: 'tokens.json' })).toBe('tokens');
    expect(uploadKind({ name: 'shot.png' })).toBeNull();
    expect(unsupportedMessage({ name: 'shot.png' })).toMatch(/bitmap image/);
    expect(unsupportedMessage({ name: 'file.fig' })).toMatch(/Export the frame as SVG/);
  });

  it('converts lengths to px', () => {
    expect([toPx('2rem'), toPx('12pt'), toPx('10'), toPx('auto')]).toEqual([32, 16, 10, null]);
  });
});

describe('handoffHtml', () => {
  it('is a full page with every value, escaping text from the file', () => {
    const spec = { source: '<b>.svg', width: 10, height: 20, values: [], texts: ['<script>x</script>'] };
    const html = handoffHtml(spec, [{ kind: 'color', value: '#4f46e5', count: 1, token: 'color.primary', tokenValue: '#4f46e5', match: 'exact', distance: 0 }]);
    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain('<code>color.primary</code>');
    expect(html).toContain('&lt;script&gt;x&lt;/script&gt;');
    expect(html).not.toContain('<script>x');
  });
});
