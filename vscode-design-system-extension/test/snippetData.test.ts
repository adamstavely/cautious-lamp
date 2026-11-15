import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SNIPPET_FILES, parseSnippets } from '../src/snippetData';
import manifest = require('../package.json');

// Compiled to out-test/test, so the package root is two levels up
const root = join(__dirname, '..', '..');

test('every snippet file parses, with a prefix and a body for each snippet', () => {
  for (const file of new Set(Object.values(SNIPPET_FILES))) {
    const snippets = parseSnippets(JSON.parse(readFileSync(join(root, 'snippets', file), 'utf8')));
    assert.ok(snippets.length > 0, file);
    for (const s of snippets) {
      assert.match(s.prefix, /^ds-/, `${file}: ${s.name}`);
      assert.ok(s.body.length > 0, `${file}: ${s.name}`);
    }
  }
  assert.ok(parseSnippets(JSON.parse(readFileSync(join(root, 'snippets', 'vue.json'), 'utf8'))).some(s => s.prefix === 'ds-button'));
});

test('array prefixes and bodies are supported, and malformed entries are skipped', () => {
  assert.deepEqual(parseSnippets({
    A: { prefix: ['a1', 'a2'], body: ['x', 'y'], description: 'A' },
    B: { prefix: 'b' },
    C: null,
  }), [
    { name: 'A', prefix: 'a1', body: 'x\ny', description: 'A' },
    { name: 'A', prefix: 'a2', body: 'x\ny', description: 'A' },
  ]);
});

test('snippets are not contributed statically, so enableSnippets can turn them off', () => {
  assert.equal((manifest.contributes as Record<string, unknown>).snippets, undefined);
  assert.ok('designSystem.enableSnippets' in manifest.contributes.configuration.properties);
});
