import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  Token,
  colorSwatchMarkdown,
  completionCandidates,
  findHardcodedValues,
  findTokenByReference,
  findTokenForValue,
  hardcodedColorHoverMarkdown,
  hexColorAt,
  resolveTokenValue,
  tokenHoverMarkdown,
  tokenReferenceAt,
} from '../src/tokenLookup';

// The shapes the API returns (backend/src/design-system/design-system-seed.ts)
const t = (name: string, value: string, type: string, category: string): Token => ({ id: name, name, value, type, category });
const tokens: Token[] = [
  t('color.primary', '#4f46e5', 'color', 'colors'),
  t('color.primary.500', '{color.primary}', 'color', 'colors'),
  t('color.error', '#ef4444', 'color', 'colors'),
  t('spacing.sm', '0.5rem', 'dimension', 'spacing'),
  t('spacing.md', '1rem', 'dimension', 'spacing'),
  t('spacing.2xl', '3rem', 'dimension', 'spacing'),
  t('typography.fontSize.md', '1rem', 'fontSize', 'typography'),
];

/** `character` is where `|` is in `line` */
function at(lineWithCursor: string) {
  const character = lineWithCursor.indexOf('|');
  return { line: lineWithCursor.replace('|', ''), character };
}

test('hover: a dotted token name is read whole, wherever the cursor is in it', () => {
  for (const cursor of ['const c = tok|ens.color.primary;', 'const c = tokens.color.pri|mary;', 'const c = tokens.co|lor.primary;']) {
    const { line, character } = at(cursor);
    const ref = tokenReferenceAt(line, character);
    assert.ok(ref, cursor);
    assert.equal(ref.name, 'color.primary');
    assert.equal(line.slice(ref.start, ref.end), 'tokens.color.primary');
    assert.equal(findTokenByReference(tokens, ref)?.name, 'color.primary');
  }
});

test('hover: bracketed segments and CSS custom properties find their token', () => {
  let { line, character } = at('gap: tokens.spacing["2x|l"],');
  assert.equal(findTokenByReference(tokens, tokenReferenceAt(line, character)!)?.name, 'spacing.2xl');
  ({ line, character } = at("x = tokens.color.primary['5|00']"));
  assert.equal(findTokenByReference(tokens, tokenReferenceAt(line, character)!)?.name, 'color.primary.500');
  ({ line, character } = at('  color: var(--color-pri|mary-500);'));
  assert.equal(findTokenByReference(tokens, tokenReferenceAt(line, character)!)?.name, 'color.primary.500');
  ({ line, character } = at('const c = othe|r.color.primary;'));
  assert.equal(tokenReferenceAt(line, character), undefined);
});

test('hover: an alias shows what it resolves to and a swatch of that colour', () => {
  const markdown = tokenHoverMarkdown(tokens, tokens[1]);
  assert.match(markdown, /\*\*Value:\*\* `\{color.primary\}`/);
  assert.match(markdown, /\*\*Resolves to:\*\* `#4f46e5`/);
  assert.ok(markdown.includes(colorSwatchMarkdown('#4f46e5', 'color.primary.500')));
});

test('colour preview: the swatch is a valid markdown image of an SVG data URI', () => {
  const swatch = colorSwatchMarkdown('#4f46e5');
  const match = /^!\[#4f46e5\]\(data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)\)$/.exec(swatch);
  assert.ok(match, swatch);
  const svg = Buffer.from(match[1], 'base64').toString('utf8');
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg, /fill="#4f46e5"/);
  // Not a colour: no image, rather than a broken one
  assert.equal(colorSwatchMarkdown('red" onload="x'), '');
});

test('hard-coded colour hover: the # is part of the value, and the matching token is named', () => {
  const { line, character } = at("const c = '#4f4|6e5';");
  const hex = hexColorAt(line, character);
  assert.deepEqual(hex && { value: hex.value, text: line.slice(hex.start, hex.end) }, { value: '#4f46e5', text: '#4f46e5' });
  const upper = at("const c = '#|4F46E5';");
  assert.equal(hexColorAt(upper.line, upper.character)?.value, '#4F46E5');
  assert.match(hardcodedColorHoverMarkdown(tokens, '#4F46E5'), /Token `color.primary` has this value/);
  assert.match(hardcodedColorHoverMarkdown(tokens, '#123456'), /No design token has this value/);
  // Not colours: an id selector-like word, an HTML entity
  assert.equal(hexColorAt('#header { }', 3), undefined);
  assert.equal(hexColorAt('&#123;', 3), undefined);
});

test('completion: `color.` lists the color.* tokens though their category is `colors`', () => {
  const after = (prefix: string) => completionCandidates(prefix, tokens)?.map(c => c.insertText);
  assert.deepEqual(after('const c = color.'), ['primary', 'primary["500"]', 'error']);
  assert.deepEqual(after('const c = tokens.color.'), ['primary', 'primary["500"]', 'error']);
  assert.deepEqual(after('const c = tokens.color.primary.'), ['["500"]']);
  assert.deepEqual(after('margin: spacing.'), ['sm', 'md', '["2xl"]']);
  assert.equal(after('const c = theme.color.'), undefined, 'a property path that only ends in color.');
  assert.equal(after('const c = foo.'), undefined);
});

test('completion: a segment that is not an identifier replaces the dot, so the result is valid JS', () => {
  const twoXl = completionCandidates('gap: tokens.spacing.', tokens)!.find(c => c.token.name === 'spacing.2xl')!;
  assert.deepEqual({ insertText: twoXl.insertText, replacesDot: twoXl.replacesDot }, { insertText: '["2xl"]', replacesDot: true });
  const md = completionCandidates('gap: tokens.spacing.', tokens)!.find(c => c.token.name === 'spacing.md')!;
  assert.equal(md.replacesDot, false);
});

test('replace with token: px and rem spacing find the rem spacing token, not a font size', () => {
  assert.equal(findTokenForValue(tokens, '16px')?.name, 'spacing.md');
  assert.equal(findTokenForValue(tokens, '1rem')?.name, 'spacing.md');
  assert.equal(findTokenForValue(tokens, '8px')?.name, 'spacing.sm');
  assert.equal(findTokenForValue(tokens, '48px')?.name, 'spacing.2xl');
  assert.equal(findTokenForValue(tokens, '17px'), undefined);
  // Spacing tokens stored as bare pixel numbers
  assert.equal(findTokenForValue([t('space.4', '16', 'spacing', 'spacing')], '16px')?.name, 'space.4');
});

test('replace with token: colours match in any case and short form, preferring the token over its alias', () => {
  assert.equal(findTokenForValue(tokens, '#4F46E5')?.name, 'color.primary');
  assert.equal(findTokenForValue([t('white', '#ffffff', 'color', 'colors')], '#FFF')?.name, 'white');
  assert.equal(findTokenForValue([tokens[1], tokens[0]], '#4f46e5')?.name, 'color.primary');
  assert.equal(findTokenForValue([tokens[1]], '#4f46e5'), undefined, 'an alias of a token that is not loaded');
});

test('aliases resolve through chains and stop at cycles', () => {
  const chain = [...tokens, t('color.button', '{color.primary.500}', 'color', 'colors')];
  assert.equal(resolveTokenValue(chain, chain[chain.length - 1]), '#4f46e5');
  const loop = [t('a', '{b}', 'color', 'colors'), t('b', '{a}', 'color', 'colors')];
  assert.equal(resolveTokenValue(loop, loop[0]), undefined);
});

test('diagnostics: hard-coded colours and spacing that equal a token, where the quick fix can replace them', () => {
  const css = '.a {\n  color: #4f46e5;\n  padding: 16px 8px;\n  font-size: 16px;\n  border: 1px solid #123456;\n}\n';
  const found = findHardcodedValues(css, 'css', tokens, '');
  assert.deepEqual(found.map(f => [f.value, f.token.name, css.slice(f.start, f.end)]), [
    ['#4f46e5', 'color.primary', '#4f46e5'],
    ['16px', 'spacing.md', '16px'],
    ['8px', 'spacing.sm', '8px'],
  ]);

  const js = "// brand: #4f46e5\nconst a = '#4f46e5';\nconst style = { paddingTop: '16px', fontSize: '16px' };\n";
  const inJs = findHardcodedValues(js, 'typescript', tokens, '');
  // Not in the comment; the string, and paddingTop but not fontSize
  assert.deepEqual(inJs.map(f => [f.value, js.slice(0, f.start).split('\n').length]), [['#4f46e5', 2], ['16px', 3]]);

  const vue = '<template><div class="a" /></template>\n<style>\n.a { margin: 0.5rem; color: #ef4444; }\n</style>\n';
  assert.deepEqual(findHardcodedValues(vue, 'vue', tokens, '').map(f => f.token.name), ['spacing.sm', 'color.error']);
});
