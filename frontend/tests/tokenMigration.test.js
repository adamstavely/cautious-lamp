// Token migration: renames inferred from two token sets, references rewritten
// in each kind of source file with real counts and diffs, names that are only
// a prefix of another token left alone, and the zip of changed files.
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { flattenTokenJson, parseTokenText } from '../src/utils/designTokens.js';
import { inferRenames, migrateFiles, parseRenameText, rewriteSource, validateRenames, zipFiles } from '../src/utils/tokenMigration.js';

const OLD = {
  color: {
    $type: 'color',
    primary: { $value: '#4f46e5' },
    'primary-hover': { $value: '#4338ca' },
    danger: { $value: '#ef4444' },
    gone: { $value: '#123456' },
  },
  spacing: { md: { $value: '1rem', $type: 'dimension' } },
};
const NEW = {
  color: {
    $type: 'color',
    brand: { primary: { $value: '#4F46E5' }, 'primary-hover': { $value: '#4338ca' } },
    danger: { $value: '#ef4444' },
  },
  spacing: { md: { $value: '1rem', $type: 'dimension' } },
};

describe('token files', () => {
  it('flattens W3C tokens with inherited types and resolves aliases', () => {
    const tokens = flattenTokenJson({ color: { $type: 'color', base: { $value: '#fff' }, bg: { $value: '{color.base}' }, loop: { $value: '{color.loop}' } } });
    expect(tokens.map((t) => [t.name, t.type, t.resolved])).toEqual([
      ['color.base', 'color', '#fff'],
      ['color.bg', 'color', '#fff'],
      ['color.loop', 'color', null],
    ]);
  });

  it('reads Tokens Studio files with several sets', () => {
    const tokens = flattenTokenJson({
      core: { blue: { value: '#00f', type: 'color' } },
      semantic: { link: { value: '{blue}', type: 'color' } },
      $metadata: { tokenSetOrder: ['core', 'semantic'] },
    });
    expect(tokens.map((t) => [t.name, t.resolved])).toEqual([
      ['blue', '#00f'],
      ['link', '#00f'],
    ]);
  });

  it('rejects text that is not JSON or holds no tokens', () => {
    expect(() => parseTokenText('{nope')).toThrow(/Not valid JSON/);
    expect(() => parseTokenText('{"a": 1}')).toThrow(/No tokens found/);
  });
});

describe('inferRenames', () => {
  it('pairs removed and added tokens by value, and leaves the rest unmatched', () => {
    const result = inferRenames(flattenTokenJson(OLD), flattenTokenJson(NEW));
    expect(result.renames).toEqual([
      { from: 'color.primary', to: 'color.brand.primary', reason: 'Same value' },
      { from: 'color.primary-hover', to: 'color.brand.primary-hover', reason: 'Same value' },
    ]);
    expect(result.unmatched).toEqual([{ name: 'color.gone', value: '#123456', candidates: [] }]);
    expect(result.kept).toBe(2);
  });
});

describe('parseRenameText', () => {
  it('reads arrows, spaces, commas and JSON, and reports bad lines', () => {
    expect(parseRenameText('a.b -> c.d\ne.f => g.h\ni j\nk,l\n// note\nbroken').renames).toEqual([
      { from: 'a.b', to: 'c.d' },
      { from: 'e.f', to: 'g.h' },
      { from: 'i', to: 'j' },
      { from: 'k', to: 'l' },
    ]);
    expect(parseRenameText('broken').errors).toEqual(['Line 1: expected "old.name -> new.name"']);
    expect(parseRenameText('{"a.b": "c.d"}').renames).toEqual([{ from: 'a.b', to: 'c.d' }]);
  });

  it('flags renames to the same name and names with two targets', () => {
    expect(validateRenames([{ from: 'a', to: 'a' }])).toEqual(['"a" is renamed to itself.']);
    expect(validateRenames([{ from: 'a', to: 'b' }, { from: 'a', to: 'c' }])).toEqual(['"a" has two new names.']);
  });
});

const RENAMES = [
  { from: 'color.primary', to: 'color.brand.primary' },
  { from: 'spacing.md', to: 'space.4' },
];

describe('rewriteSource', () => {
  it('rewrites CSS variables but not longer names that start the same', () => {
    const css = ':root {\n  --color-primary: #4f46e5;\n  --color-primary-hover: #4338ca;\n}\n.a { color: var(--color-primary); margin: var(--spacing-md); }';
    const { output, replacements, changedLines } = rewriteSource(css, 'theme.css', RENAMES);
    expect(output).toBe(':root {\n  --color-brand-primary: #4f46e5;\n  --color-primary-hover: #4338ca;\n}\n.a { color: var(--color-brand-primary); margin: var(--space-4); }');
    expect(replacements).toHaveLength(3);
    expect(changedLines.map((l) => l.line)).toEqual([2, 5]);
  });

  it('rewrites Sass variables in SCSS', () => {
    const { output, replacements } = rewriteSource('$color-primary: blue;\n.b { padding: $spacing-md; }', 'x.scss', RENAMES);
    expect(output).toBe('$color-brand-primary: blue;\n.b { padding: $space-4; }');
    expect(replacements.map((r) => r.form)).toEqual(['sass', 'sass']);
  });

  it('rewrites dotted paths in scripts, leaving deeper paths and identifiers alone', () => {
    const js = "const a = tokens.color.primary;\nconst b = tokens.color.primary.500;\nconst c = get('color.primary');\nconst d = mycolor.primary;";
    const { output, replacements } = rewriteSource(js, 'x.ts', RENAMES);
    expect(output).toBe("const a = tokens.color.brand.primary;\nconst b = tokens.color.primary.500;\nconst c = get('color.brand.primary');\nconst d = mycolor.primary;");
    expect(replacements).toHaveLength(2);
  });

  it('applies every form in a Vue file, with an optional CSS prefix', () => {
    const vue = "<template><div :class=\"t.color.primary\" /></template>\n<style>.x { color: var(--ds-color-primary); }</style>";
    const { output } = rewriteSource(vue, 'X.vue', RENAMES, { cssPrefix: 'ds-' });
    expect(output).toBe("<template><div :class=\"t.color.brand.primary\" /></template>\n<style>.x { color: var(--ds-color-brand-primary); }</style>");
  });

  it('does not touch Sass-style names in plain CSS', () => {
    expect(rewriteSource('/* $color-primary */', 'x.css', RENAMES).replacements).toEqual([]);
  });
});

describe('migrateFiles', () => {
  it('counts replacements per file and per rename, and finds names with no new name', () => {
    const result = migrateFiles(
      [
        { name: 'a.css', text: '.a { color: var(--color-primary); }\n.b { color: var(--color-gone); }' },
        { name: 'b.js', text: 'export const x = 1;' },
      ],
      [...RENAMES, { from: 'color.unused', to: 'color.other' }],
      { unmatched: ['color.gone'] },
    );
    expect(result.totals).toEqual({ files: 2, filesChanged: 1, replacements: 1, linesChanged: 1, leftovers: 1, unusedRenames: 2 });
    expect(result.byRename.map((r) => r.count)).toEqual([1, 0, 0]);
    expect(result.files[0].leftovers).toEqual([{ line: 2, name: '--color-gone', form: 'css' }]);
    expect(result.files[1].changed).toBe(false);
  });

  it('zips the files it is given, keeping duplicate names apart', async () => {
    const bytes = await zipFiles(
      [
        { name: 'a.css', text: 'one' },
        { name: 'a.css', text: 'two' },
      ],
      { type: 'uint8array' },
    );
    const zip = await JSZip.loadAsync(bytes);
    expect(Object.keys(zip.files).sort()).toEqual(['a (2).css', 'a.css']);
    expect(await zip.file('a (2).css').async('string')).toBe('two');
  });
});
