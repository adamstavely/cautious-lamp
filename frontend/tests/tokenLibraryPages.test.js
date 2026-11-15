// Style library lists the workspace `style-dictionaries` items (no sample
// dictionaries when there are none) and retires them through the owning
// workspace; Token playground works on the design system's tokens from
// GET /api/v1/tokens instead of a hard-coded list.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import StyleLibrary from '../src/views/StyleLibrary.vue';
import TokenPlayground from '../src/views/TokenPlayground.vue';
import { oklchToHex, parseOklch } from '../src/utils/oklch.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const dictionary = (id, name, workspaceId, tokens, extra = {}) => ({
  id,
  kind: 'style-dictionaries',
  name,
  description: '',
  format: 'json',
  tokens,
  workspaceId,
  sharedWith: [],
  isGlobal: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  ...extra,
});

const BRAND = dictionary('res_brand', 'Brand', 'ws_a', {
  color: { $type: 'color', primary: { $value: '#2f5ea8' }, muted: { $value: '#667085' } },
  spacing: { sm: { $value: '8px', $type: 'dimension' } },
});
const OLD = dictionary('res_old', 'Legacy', 'ws_b', { radius: { sm: { $value: '2px', $type: 'dimension' } } }, { tags: ['retired'] });

const DS_TOKENS = [
  { name: 'color.primary', value: '#4f46e5', type: 'color', category: 'colors' },
  { name: 'color.button.primary', value: '{color.primary}', type: 'color', category: 'colors' },
  { name: 'color.neutral.50', value: '#f9fafb', type: 'color', category: 'colors' },
  { name: 'spacing.lg', value: '1.5rem', type: 'dimension', category: 'spacing' },
  { name: 'border.radius.md', value: '0.5rem', type: 'dimension', category: 'borders' },
  { name: 'typography.fontSize.lg', value: '1.25rem', type: 'fontSize', category: 'typography' },
];

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;
const fail = (status, message) => Object.assign(new Error(message), { response: { status, data: { message } } });

beforeEach(() => {
  localStorage.clear();
  calls = [];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    'GET /api/v1/resources/style-dictionaries': [structuredClone(BRAND), structuredClone(OLD)],
    'GET /api/v1/workspaces': [
      { id: 'ws_a', name: 'Brand team', effectiveRole: 'editor' },
      { id: 'ws_b', name: 'Platform team', effectiveRole: 'viewer' },
    ],
    'PATCH /api/v1/workspaces/ws_a/resources/style-dictionaries/res_brand': (config) => ({ ...BRAND, ...JSON.parse(config.data) }),
    'GET /api/v1/tokens': { tokens: structuredClone(DS_TOKENS), count: DS_TOKENS.length },
  };
  apiClient.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    calls.push({ key, data: config.data ? JSON.parse(config.data) : undefined });
    let data = responses[key];
    if (typeof data === 'function') data = data(config);
    if (data instanceof Error) return Promise.reject(data);
    if (data === undefined) return Promise.reject(fail(404, 'not found'));
    return { status: 200, statusText: 'OK', data, headers: {}, config };
  };
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

const text = () => document.body.textContent.replace(/\s+/g, ' ');
const button = (label) => [...document.querySelectorAll('button')].find((el) => el.textContent.trim() === label);

describe('Style library', () => {
  const open = async () => {
    page = await mountView(StyleLibrary, { path: '/tokens/library' });
    await flush();
  };

  it('lists the active dictionaries from the workspace library', async () => {
    await open();
    expect(calls.map((c) => c.key)).toContain('GET /api/v1/resources/style-dictionaries');
    expect(text()).toContain('Brand');
    expect(text()).toContain('3 tokens · Brand team');
    expect(text()).not.toContain('Legacy');
    expect(text()).toContain('1 active dictionary with 3 tokens.');
  });

  it('shows retired dictionaries under the retired filter', async () => {
    await open();
    page.state.filter = 'retired';
    await flush();
    expect(text()).toContain('Legacy');
    expect(text()).not.toContain('3 tokens · Brand team');
  });

  it('makes up no dictionaries when there are none', async () => {
    responses['GET /api/v1/resources/style-dictionaries'] = [];
    await open();
    expect(text()).toContain('No style dictionaries yet');
    expect(text()).not.toContain('Brand Colors 2024');
    expect(localStorage.getItem('styleDictionaries')).toBeNull();
  });

  it('says so when the library does not load', async () => {
    responses['GET /api/v1/resources/style-dictionaries'] = fail(500, 'Elasticsearch is down');
    await open();
    expect(text()).toContain("The style library didn't load");
    expect(text()).toContain('Elasticsearch is down');
  });

  it('shows a dictionary’s tokens by category and retires it through its workspace', async () => {
    await open();
    page.state.selectedId = 'res_brand';
    await flush();
    expect(text()).toContain('color.primary');
    expect(text()).toContain('spacing.sm');
    expect(document.querySelector('a[href="/tokens/studio?load=res_brand"]')).not.toBeNull();

    button('Retire').click();
    await flush();
    const patch = calls.find((c) => c.key.startsWith('PATCH'));
    expect(patch.key).toBe('PATCH /api/v1/workspaces/ws_a/resources/style-dictionaries/res_brand');
    expect(patch.data).toEqual({ tags: ['retired'] });
    expect(text()).toContain('Brand is retired.');
  });

  it('offers no retire control on a dictionary the user can only read', async () => {
    await open();
    page.state.filter = 'retired';
    page.state.selectedId = 'res_old';
    await flush();
    expect(button('Restore')).toBeUndefined();
  });
});

describe('Token playground', () => {
  const open = async () => {
    page = await mountView(TokenPlayground, { path: '/tokens/playground' });
    await flush();
  };

  it('lists the design system’s tokens, with aliases resolved, and no mock list', async () => {
    await open();
    expect(calls.map((c) => c.key)).toContain('GET /api/v1/tokens');
    expect(page.state.allTokens.map((t) => t.name)).toEqual(DS_TOKENS.map((t) => t.name));
    expect(page.state.allTokens.find((t) => t.name === 'color.button.primary').resolved).toBe('#4f46e5');
    expect(text()).not.toContain('color.text.secondary');
    expect(page.state.categoryOptions.map((o) => o.value)).toEqual(['', 'borders', 'colors', 'spacing', 'typography']);
  });

  it('picks default roles for the component preview from the tokens that exist', async () => {
    await open();
    expect(page.state.roles).toMatchObject({
      surface: 'color.neutral.50',
      accent: 'color.button.primary',
      padding: 'spacing.lg',
      radius: 'border.radius.md',
      shadow: '',
      text: '',
    });
  });

  it('exports the selected tokens with their resolved values', async () => {
    await open();
    page.state.toggleToken(page.state.allTokens.find((t) => t.name === 'color.button.primary'));
    page.state.toggleToken(page.state.allTokens.find((t) => t.name === 'spacing.lg'));
    await flush();
    expect(page.state.exportText('css')).toBe(':root {\n  --color-button-primary: #4f46e5;\n  --spacing-lg: 1.5rem;\n}');
    expect(page.state.exportText('scss')).toBe('$color-button-primary: #4f46e5;\n$spacing-lg: 1.5rem;');
    expect(JSON.parse(page.state.exportText('json'))).toEqual({ 'color.button.primary': '#4f46e5', 'spacing.lg': '1.5rem' });
  });

  it('filters by category and search', async () => {
    await open();
    page.state.selectedCategory = 'colors';
    page.state.tokenSearch = 'neutral';
    await flush();
    expect(page.state.filteredTokens.map((t) => t.name)).toEqual(['color.neutral.50']);
  });

  it('says so when there are no tokens or the API fails', async () => {
    responses['GET /api/v1/tokens'] = { tokens: [], count: 0 };
    await open();
    expect(text()).toContain('No tokens yet');
    page.unmount();

    responses['GET /api/v1/tokens'] = fail(500, 'Search is unavailable');
    await open();
    expect(text()).toContain("The tokens didn't load");
    expect(text()).toContain('Search is unavailable');
  });
});

describe('OKLCH to hex', () => {
  it('parses OKLCH with plain numbers and percentages', () => {
    expect(parseOklch('oklch(0.5 0.1 250)')).toEqual({ L: 0.5, C: 0.1, H: 250 });
    expect(parseOklch('oklch(50% 25% 250deg)')).toEqual({ L: 0.5, C: 0.1, H: 250 });
    expect(parseOklch('#fff')).toBeNull();
  });

  it('converts to sRGB hex', () => {
    expect(oklchToHex('oklch(1 0 0)')).toBe('#FFFFFF');
    expect(oklchToHex('oklch(0 0 0)')).toBe('#000000');
    expect(oklchToHex('oklch(0.6279 0.2577 29.23)')).toBe('#FF0000');
    expect(oklchToHex('not a colour')).toBeNull();
  });
});
