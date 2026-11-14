import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchComponentMetadata, getDefaultMetadata, highlightStyle } from '../src/loupe-core.mjs';

const quiet = (t) => t.mock.method(console, 'warn', () => {});

function fakeFetch(response) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    if (response instanceof Error) throw response;
    return response;
  };
  return { impl, calls };
}

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: '',
  json: async () => body,
});

test('loads metadata from the backend component-metadata route', async () => {
  const data = { button: { name: 'Button' } };
  const { impl, calls } = fakeFetch(jsonResponse(200, data));

  assert.deepEqual(await fetchComponentMetadata('http://api.test/api/v1/', 'k', impl), data);
  assert.equal(calls[0].url, 'http://api.test/api/v1/component-metadata');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer k');
});

for (const status of [401, 404, 500]) {
  test(`falls back to built-in metadata on HTTP ${status}`, async (t) => {
    const warn = quiet(t);
    const { impl } = fakeFetch(jsonResponse(status, { message: 'nope' }));

    assert.deepEqual(await fetchComponentMetadata('http://api.test/api/v1', '', impl), getDefaultMetadata());
    assert.match(String(warn.mock.calls[0].arguments[0]), /component-metadata/);
    assert.match(String(warn.mock.calls[0].arguments[1]), new RegExp(`HTTP ${status}`));
  });
}

test('falls back on network errors and non-object bodies', async (t) => {
  quiet(t);
  assert.deepEqual(await fetchComponentMetadata('http://x', '', fakeFetch(new TypeError('Failed to fetch')).impl), getDefaultMetadata());
  assert.deepEqual(await fetchComponentMetadata('http://x', '', fakeFetch(jsonResponse(200, [])).impl), getDefaultMetadata());
  assert.deepEqual(await fetchComponentMetadata('http://x', '', fakeFetch(jsonResponse(200, null)).impl), getDefaultMetadata());
});

test('sends no Authorization header without a key', async () => {
  const { impl, calls } = fakeFetch(jsonResponse(200, {}));
  await fetchComponentMetadata('http://x', '', impl);
  assert.deepEqual(calls[0].init.headers, {});
});

test('fixed highlights use viewport coordinates, with no scroll offset', () => {
  // getBoundingClientRect is viewport-relative; on a page scrolled by 500px
  // an element at document y=700 reports top 200, and a fixed box at 200 covers it
  const style = highlightStyle({ left: 30, top: 200, width: 120, height: 40 });
  assert.deepEqual(style, { position: 'fixed', left: '30px', top: '200px', width: '120px', height: '40px', zIndex: 9998 });
});
