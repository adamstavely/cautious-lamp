// API page: the version and the route list come from the server, there is no
// v2, GraphQL or Python SDK, and a failed load says so instead of showing made-up data.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import DesignSystemAPI from '../src/views/DesignSystemAPI.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const ROUTES = [
  { method: 'GET', path: '/api/v1/health', versioned: true, public: true, permissions: [] },
  { method: 'GET', path: '/api/v1/tokens', versioned: true, public: false, permissions: [] },
  { method: 'POST', path: '/api/v1/components', versioned: true, public: false, permissions: ['component:create'] },
  { method: 'GET', path: '/patterns-library/patterns', versioned: false, public: false, permissions: [] },
];

let responses;
let page;
const originalAdapter = apiClient.defaults.adapter;
const fail = (status) => Object.assign(new Error(`HTTP ${status}`), { response: { status, data: {} } });

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    'GET /api/versions/current': { version: 'v1', status: 'current', basePath: '/api/v1', release: '1.4.2', routeCount: 213 },
    'GET /api/versions/current/routes': ROUTES,
  };
  apiClient.defaults.adapter = async (config) => {
    const data = responses[`${config.method.toUpperCase()} ${config.url}`];
    if (data instanceof Error || data === undefined) return Promise.reject(data ?? fail(404));
    return { status: 200, statusText: 'OK', data, headers: {}, config };
  };
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

const open = async () => {
  page = await mountView(DesignSystemAPI, { path: '/api' });
  await flush();
  return page;
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');
const rows = () => [...document.querySelectorAll('tbody tr')].map((tr) => tr.textContent.replace(/\s+/g, ' ').trim());

describe('Design system API page', () => {
  it('shows the version and every route from the server', async () => {
    await open();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    const body = text();
    expect(body).toContain('1.4.2');
    expect(body).toContain('213');
    expect(body).toContain(`${window.location.origin}/api/v1`);
    expect(rows()).toEqual([
      'GET/api/v1/healthAnyone, no credential',
      'GET/api/v1/tokensAnyone signed in',
      'POST/api/v1/componentsSigned in, with component:create',
      'GET/patterns-library/patternsAnyone signed in',
    ]);
    // Only what exists
    expect(body).not.toMatch(/graphql|v2|pip install|python/i);
    expect(body).toContain('/tokens/category/:category');
  });

  it('filters the routes', async () => {
    await open();
    page.state.query = 'component:create';
    await nextTick();
    expect(rows()).toEqual(['POST/api/v1/componentsSigned in, with component:create']);
    page.state.query = 'nothing-like-this';
    await nextTick();
    expect(text()).toContain('No routes match “nothing-like-this”');
  });

  it('says when the server could not answer', async () => {
    responses['GET /api/versions/current'] = fail(500);
    responses['GET /api/versions/current/routes'] = fail(403);
    await open();
    expect(text()).toContain('The API version could not be loaded.');
    expect(rows()).toEqual([]);
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(2);
  });
});
