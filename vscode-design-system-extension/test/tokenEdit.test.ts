import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyEdits, computeTokenReplacement, cssVarName, jsAccessor } from '../src/tokenEdit';

const options = { importPath: '@design-system/tokens' };

/** Replaces the first occurrence of `value` in `text` and returns the new text */
function fix(text: string, value: string, languageId: string, tokenName = 'color.primary', occurrence = 0): string | undefined {
  let start = -1;
  for (let i = 0; i <= occurrence; i++) start = text.indexOf(value, start + 1);
  assert.ok(start >= 0, `"${value}" not found`);
  const result = computeTokenReplacement(text, start, start + value.length, languageId, tokenName, options);
  return result && applyEdits(text, result.edits);
}

test('token names map to CSS custom properties and JS accessors', () => {
  assert.equal(cssVarName('color.neutral.500'), '--color-neutral-500');
  assert.equal(jsAccessor('color.primary'), 'tokens.color.primary');
  assert.equal(jsAccessor('color.neutral.500'), 'tokens.color.neutral["500"]');
  assert.equal(jsAccessor('space-md'), 'tokens["space-md"]');
});

test('CSS: the value becomes var(--token)', () => {
  assert.equal(fix('.a { color: #4f46e5; }', '#4f46e5', 'css'), '.a { color: var(--color-primary); }');
  assert.equal(fix('.a { margin: 16px 0; }', '16px', 'scss', 'spacing.md'), '.a { margin: var(--spacing-md) 0; }');
});

test('JS: the whole string literal, quotes included, becomes the token expression, and tokens is imported', () => {
  const src = "import React from 'react';\nconst c = '#4f46e5';\n";
  assert.equal(fix(src, '#4f46e5', 'javascript'), "import React from 'react';\nimport { tokens } from '@design-system/tokens';\nconst c = tokens.color.primary;\n");
});

test('JS: the existing tokens import is reused', () => {
  for (const imp of [
    "import { tokens } from './theme';",
    "import { colors, tokens as _t, tokens } from './theme';",
    "import tokens from './tokens';",
    "import * as tokens from './tokens';",
    "const { tokens } = require('./theme');"
  ]) {
    const src = `${imp}\nconst c = "#4f46e5";\n`;
    assert.equal(fix(src, '#4f46e5', 'typescript'), `${imp}\nconst c = tokens.color.primary;\n`, imp);
  }
});

test('JS: no imports at all puts the import at the top (after use strict)', () => {
  assert.equal(fix("const c = '#4f46e5';", '#4f46e5', 'javascript'), "import { tokens } from '@design-system/tokens';\nconst c = tokens.color.primary;");
  assert.equal(
    fix("'use strict';\nconst c = '#4f46e5';", '#4f46e5', 'javascript'),
    "'use strict';\nimport { tokens } from '@design-system/tokens';\nconst c = tokens.color.primary;"
  );
});

test('JSX attribute: the quoted value becomes {tokens.x}', () => {
  const src = "import { tokens } from 'ds';\nconst el = <Box color=\"#4f46e5\" />;";
  assert.equal(fix(src, '#4f46e5', 'typescriptreact'), "import { tokens } from 'ds';\nconst el = <Box color={tokens.color.primary} />;");
});

test('a value inside a longer string becomes var(--token), staying in the string', () => {
  const src = "const border = '1px solid #4f46e5';";
  assert.equal(fix(src, '#4f46e5', 'javascript'), "const border = '1px solid var(--color-primary)';");
});

test('a value inside a template literal becomes an interpolation', () => {
  const src = "import { tokens } from 'ds';\nconst css = `color: #4f46e5; margin: ${m};`;";
  assert.equal(fix(src, '#4f46e5', 'javascript'), "import { tokens } from 'ds';\nconst css = `color: ${tokens.color.primary}; margin: ${m};`;");
});

test('a template literal after an interpolation is still recognised', () => {
  const src = "import { tokens } from 'ds';\nconst css = `${a ? '{' : '}'} color: #4f46e5;`;";
  assert.equal(fix(src, '#4f46e5', 'javascript'), "import { tokens } from 'ds';\nconst css = `${a ? '{' : '}'} color: ${tokens.color.primary};`;");
});

test('no edit in comments or bare code', () => {
  assert.equal(fix('// was #4f46e5\nconst a = 1;', '#4f46e5', 'javascript'), undefined);
  assert.equal(fix('/* 16px */', '16px', 'javascript', 'spacing.md'), undefined);
});

test('Vue: <style> gets var(), <script> gets an expression and an import inside the script block', () => {
  const src = [
    '<template><div style="color: #4f46e5" /></template>',
    '<script setup>',
    "import { ref } from 'vue';",
    "const c = '#4f46e5';",
    '</script>',
    '<style scoped>',
    '.a { color: #4f46e5; }',
    '</style>'
  ].join('\n');
  assert.equal(
    fix(src, '#4f46e5', 'vue', 'color.primary', 1),
    src
      .replace("import { ref } from 'vue';", "import { ref } from 'vue';\nimport { tokens } from '@design-system/tokens';")
      .replace("const c = '#4f46e5';", 'const c = tokens.color.primary;')
  );
  assert.equal(fix(src, '#4f46e5', 'vue', 'color.primary', 2), src.replace('.a { color: #4f46e5; }', '.a { color: var(--color-primary); }'));
  assert.equal(fix(src, '#4f46e5', 'vue', 'color.primary', 0), src.replace('style="color: #4f46e5"', 'style="color: var(--color-primary)"'));
});

test('Vue script without imports gets the import on its first line', () => {
  const src = "<script>\nexport default { data: () => ({ c: '#4f46e5' }) };\n</script>";
  assert.equal(
    fix(src, '#4f46e5', 'vue'),
    "<script>\nimport { tokens } from '@design-system/tokens';\nexport default { data: () => ({ c: tokens.color.primary }) };\n</script>"
  );
});
