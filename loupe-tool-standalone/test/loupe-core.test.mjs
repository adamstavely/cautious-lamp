import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describeComponent, fetchComponentMetadata, highlightStyle, usableLinks } from '../src/loupe-core.mjs';

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

  assert.deepEqual(await fetchComponentMetadata('http://api.test/api/v1/', 'k', impl), { status: 'ready', metadata: data });
  assert.equal(calls[0].url, 'http://api.test/api/v1/component-metadata');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer k');
});

test('without an API key it asks for one and requests nothing', async () => {
  const { impl, calls } = fakeFetch(jsonResponse(200, {}));
  assert.deepEqual(await fetchComponentMetadata('http://x', '', impl), { status: 'missing-key', metadata: {} });
  assert.equal(calls.length, 0);
});

for (const status of [401, 404, 500]) {
  test(`reports HTTP ${status} as an error with no made-up metadata`, async (t) => {
    const warn = quiet(t);
    const { impl } = fakeFetch(jsonResponse(status, { message: 'nope' }));

    const result = await fetchComponentMetadata('http://api.test/api/v1', 'k', impl);
    assert.equal(result.status, 'error');
    assert.deepEqual(result.metadata, {});
    assert.match(result.error, new RegExp(`HTTP ${status}`));
    assert.match(String(warn.mock.calls[0].arguments[0]), /component-metadata/);
  });
}

test('reports network errors and non-object bodies as errors', async (t) => {
  quiet(t);
  for (const response of [new TypeError('Failed to fetch'), jsonResponse(200, []), jsonResponse(200, null)]) {
    const result = await fetchComponentMetadata('http://x', 'k', fakeFetch(response).impl);
    assert.equal(result.status, 'error');
    assert.deepEqual(result.metadata, {});
  }
});

test('shows only absolute links, leaving out missing ones and bare app paths', () => {
  assert.deepEqual(usableLinks({ docs: '/components', github: '', figma: 'https://figma.com/x' }), { figma: 'https://figma.com/x' });
  assert.deepEqual(usableLinks({ docs: 'https://ds.example.com/components/buttons' }), { docs: 'https://ds.example.com/components/buttons' });
  assert.deepEqual(usableLinks(undefined), {});
  assert.deepEqual(usableLinks({ docs: 'javascript:alert(1)' }), {});
});

test('describes a component from the metadata, or by its page name alone', () => {
  const metadata = { button: { name: 'Button', path: '@ds/button', icon: 'rectangle-horizontal', links: { docs: 'https://ds.test/components/buttons' } } };
  assert.deepEqual(describeComponent('Button', '', metadata), {
    name: 'Button', path: '@ds/button', icon: 'rectangle-horizontal', links: { docs: 'https://ds.test/components/buttons' },
  });
  assert.deepEqual(describeComponent('hero', '@app/hero', metadata), { name: 'hero', path: '@app/hero', icon: 'blocks', links: {} });
});

test('every icon the API sends has a Lucide component', () => {
  // The names in the backend's iconMap and its fallback, read from source so the two can't drift apart
  const service = readFileSync(new URL('../../backend/src/design-system/design-system.service.ts', import.meta.url), 'utf8');
  const block = service.slice(service.indexOf('getComponentMetadata('));
  const iconMap = block.slice(block.indexOf('const iconMap'), block.indexOf('};'));
  const sent = [...iconMap.matchAll(/:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]).concat('blocks');
  const icons = readFileSync(new URL('../src/icons.js', import.meta.url), 'utf8');
  for (const name of sent) assert.match(icons, new RegExp(`'${name}':`), `no Lucide icon for "${name}"`);
});

test('the component uses no Material Symbols ligatures or hand-drawn SVG icons', () => {
  const source = readFileSync(new URL('../src/LoupeTool.vue', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /material-symbols/);
  assert.doesNotMatch(source, /<svg|<path/);
  assert.doesNotMatch(source, /dev-key/);
});

test('fixed highlights use viewport coordinates, with no scroll offset', () => {
  // getBoundingClientRect is viewport-relative; on a page scrolled by 500px
  // an element at document y=700 reports top 200, and a fixed box at 200 covers it
  const style = highlightStyle({ left: 30, top: 200, width: 120, height: 40 });
  assert.deepEqual(style, { position: 'fixed', left: '30px', top: '200px', width: '120px', height: '40px', zIndex: 9998 });
});
