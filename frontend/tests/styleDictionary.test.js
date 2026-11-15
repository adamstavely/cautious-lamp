// Style dictionaries are stored as DTCG documents; the token editors work on flat
// lists. The conversion keeps names, types, values, descriptions and a custom category.
import { describe, expect, it } from 'vitest';
import { RETIRED_TAG, categoryFromName, dictionaryTokens, dtcgToTokens, isRetired, tokensToDtcg, withRetired } from '../src/utils/styleDictionary.js';
import { exportTokenFile, toAndroidXml, toCss } from '../src/utils/tokenExport.js';

describe('style dictionary conversion', () => {
  it('round-trips flat tokens through DTCG', () => {
    const tokens = [
      { id: 'a', name: 'color.primary.500', category: 'color', $type: 'color', $value: '#2f5ea8', $description: 'Primary' },
      { id: 'b', name: 'spacing.sm', category: 'spacing', $type: 'dimension', $value: '8px' },
      { id: 'c', name: 'color.button', category: 'color', $type: 'color', $value: '{color.primary.500}' },
    ];
    const dtcg = tokensToDtcg(tokens);
    expect(dtcg.color.primary['500']).toEqual({ $value: '#2f5ea8', $type: 'color', $description: 'Primary' });
    expect(dtcg.spacing.sm).toEqual({ $value: '8px', $type: 'dimension' });
    const back = dtcgToTokens(dtcg);
    // Tokens come back grouped by name
    const byName = (a, b) => a.name.localeCompare(b.name);
    expect(back.map(({ id, ...t }) => t).sort(byName)).toEqual(tokens.map(({ id, ...t }) => t).sort(byName));
  });

  it('gives tokens the $type of their group', () => {
    const tokens = dtcgToTokens({ color: { $type: 'color', brand: { primary: { $value: '#000' } } }, other: { $value: 'x' } });
    expect(tokens).toEqual([
      { id: 'color.brand.primary', name: 'color.brand.primary', category: 'color', $type: 'color', $value: '#000' },
      { id: 'other', name: 'other', category: 'other', $type: 'string', $value: 'x' },
    ]);
  });

  it('keeps a custom category in $extensions', () => {
    const dtcg = tokensToDtcg([{ name: 'radius.md', category: 'brand', $type: 'dimension', $value: '8px' }]);
    expect(dtcg.radius.md.$extensions).toEqual({ 'cautious-lamp': { category: 'brand' } });
    expect(dtcgToTokens(dtcg)[0].category).toBe('brand');
    // The default category (the first part of the name) isn't written out
    expect(tokensToDtcg([{ name: 'radius.md', category: 'radius', $type: 'dimension', $value: '8px' }]).radius.md.$extensions).toBeUndefined();
  });

  it('reads a saved dictionary, and an empty one as no tokens', () => {
    expect(dictionaryTokens({ tokens: { a: { $value: '1', $type: 'number' } } })).toHaveLength(1);
    expect(dictionaryTokens({})).toEqual([]);
    expect(dictionaryTokens(null)).toEqual([]);
    expect(categoryFromName('')).toBe('other');
  });

  it('marks dictionaries retired with a tag', () => {
    expect(isRetired({ tags: [RETIRED_TAG] })).toBe(true);
    expect(isRetired({ tags: ['brand'] })).toBe(false);
    expect(isRetired({})).toBe(false);
    expect(withRetired(['brand'], true)).toEqual(['brand', RETIRED_TAG]);
    expect(withRetired(['brand', RETIRED_TAG], true)).toEqual(['brand', RETIRED_TAG]);
    expect(withRetired(['brand', RETIRED_TAG], false)).toEqual(['brand']);
    expect(withRetired(undefined, false)).toEqual([]);
  });
});

describe('token export', () => {
  const dtcg = tokensToDtcg([
    { name: 'color.primary', $type: 'color', $value: '#2f5ea8' },
    { name: 'spacing.sm', $type: 'dimension', $value: '8px' },
    { name: 'agent.role', $type: 'string', $value: 'planner & <helper>' },
  ]);

  it('writes CSS custom properties', () => {
    expect(toCss(dtcg)).toBe(':root {\n  --color-primary: #2f5ea8;\n  --spacing-sm: 8px;\n  --agent-role: planner & <helper>;\n}');
  });

  it('writes Android resources with the right element for each type', () => {
    const xml = toAndroidXml(dtcg);
    expect(xml).toContain('<color name="color_primary">#FF2F5EA8</color>');
    expect(xml).toContain('<dimen name="spacing_sm">8dp</dimen>');
    expect(xml).toContain('<string name="agent_role">planner &amp; &lt;helper&gt;</string>');
  });

  it('names files after the format', () => {
    expect(exportTokenFile(dtcg, 'ios', 'brand').filename).toBe('brand.plist');
    expect(JSON.parse(exportTokenFile(dtcg, 'json').content)).toEqual(dtcg);
  });
});
