import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TtlCache } from '../src/ttlCache';

test('each cache has its own freshness', () => {
  let now = 0;
  const clock = () => now;
  const components = new TtlCache<string[]>(1000, clock);
  const tokens = new TtlCache<string[]>(1000, clock);

  components.set(['button']);
  now = 900;
  tokens.set(['color.primary']);
  now = 1200;

  // Loading tokens at t=900 must not keep components (loaded at t=0) fresh
  assert.equal(components.getFresh(), null);
  assert.deepEqual(components.getStale(), ['button']);
  assert.deepEqual(tokens.getFresh(), ['color.primary']);
});

test('clear drops the value', () => {
  const cache = new TtlCache<number>(1000, () => 0);
  cache.set(1);
  cache.clear();
  assert.equal(cache.getFresh(), null);
  assert.equal(cache.getStale(), null);
});
