// Multi-brand reads brands and tokens from the API and creates, edits and
// deletes brands there; nothing is hard-coded or only logged.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MultiBrand from '../src/views/MultiBrand.vue';
import { fail, flush, stubApi } from './helpers/stubApi.js';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const permissions = new Set();
vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({ hasPermission: (p) => permissions.has(p), user: { value: { id: 'usr_1' } } }),
}));

const BRAND = {
  id: 'brd_1',
  name: 'Enterprise',
  description: 'Sober colours',
  tokenOverrides: [{ token: 'color.primary', value: '#047857' }, { token: 'spacing.md', value: '1.25rem' }],
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-02T10:00:00.000Z',
  createdBy: { id: 'usr_1', name: 'Rita' },
  updatedBy: { id: 'usr_1', name: 'Rita' },
};
const TOKENS = [
  { name: 'color.primary', value: '#4f46e5', type: 'color', category: 'colors' },
  { name: 'spacing.md', value: '1rem', type: 'dimension', category: 'spacing' },
];

let api;
let page;
let responses;

beforeEach(() => {
  permissions.clear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    'GET /api/v1/brands': { brands: [BRAND], count: 1 },
    'GET /api/v1/tokens': { tokens: TOKENS, count: 2 },
  };
  api = stubApi(responses);
});

afterEach(() => {
  page?.unmount();
  page = null;
  api.restore();
});

const open = async () => {
  page = await mountView(MultiBrand);
  await flush();
  return page;
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');
// Buttons on the page, not in the closed dialogs
const buttonLabels = () => [...document.querySelectorAll('button')].filter((b) => !b.closest('dialog')).map((b) => b.textContent.trim());

describe('Multi-brand', () => {
  it('shows the stored brands with their overrides next to the base token values', async () => {
    await open();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    const body = text();
    expect(body).toContain('Enterprise');
    expect(body).toContain('2 tokens');
    expect(body).toContain('#047857');
    expect(body).toContain('#4f46e5'); // base value
    expect(body).not.toContain('Primary Brand'); // the old hard-coded list
    expect(buttonLabels().some((l) => /^Add brand/.test(l))).toBe(false);
    expect(buttonLabels().some((l) => /^Delete/.test(l))).toBe(false);
  });

  it('says so when there are no brands', async () => {
    responses['GET /api/v1/brands'] = { brands: [], count: 0 };
    await open();
    expect(text()).toContain('No brands yet');
  });

  it('creates a brand through the API', async () => {
    permissions.add('token:create');
    responses['POST /api/v1/brands'] = (body) => ({ ...BRAND, id: 'brd_2', ...body });
    await open();
    page.state.openEditor();
    page.state.addOverride();
    Object.assign(page.state.editor, { name: ' Kids ', description: 'Bright' });
    Object.assign(page.state.editor.overrides[0], { token: 'color.primary', value: ' #db2777 ' });
    page.state.addOverride(); // left empty: dropped
    await page.state.saveBrand();
    await flush();
    expect(api.calls.find((c) => c.key === 'POST /api/v1/brands').data).toEqual({
      name: 'Kids',
      description: 'Bright',
      tokenOverrides: [{ token: 'color.primary', value: '#db2777' }],
    });
    expect(page.state.brands.map((b) => b.name)).toEqual(['Enterprise', 'Kids']);
    expect(page.state.selectedId).toBe('brd_2');
    expect(page.state.editor).toBe(null);
  });

  it('edits a brand, keeping the dialog open with the server error if refused', async () => {
    permissions.add('token:edit');
    responses['PUT /api/v1/brands/brd_1'] = fail(400, "Token 'color.nope' not found");
    await open();
    page.state.openEditor(page.state.brands[0]);
    page.state.editor.overrides[1].value = '2rem';
    await page.state.saveBrand();
    await flush();
    expect(page.state.editor.error).toContain("Token 'color.nope' not found");

    responses['PUT /api/v1/brands/brd_1'] = (body) => ({ ...BRAND, ...body });
    await page.state.saveBrand();
    await flush();
    expect(api.calls.at(-1).data.tokenOverrides).toEqual([{ token: 'color.primary', value: '#047857' }, { token: 'spacing.md', value: '2rem' }]);
    expect(page.state.brands[0].tokenOverrides[1].value).toBe('2rem');
  });

  it('deletes a brand after confirming', async () => {
    permissions.add('token:delete');
    responses['DELETE /api/v1/brands/brd_1'] = { success: true };
    await open();
    const pending = page.state.removeBrand(page.state.brands[0]);
    await flush();
    expect(page.state.confirmState.title).toBe('Delete Enterprise?');
    page.state.confirmState.resolve(true);
    await pending;
    await flush();
    expect(api.calls.some((c) => c.key === 'DELETE /api/v1/brands/brd_1')).toBe(true);
    expect(page.state.brands).toEqual([]);
    expect(text()).toContain('No brands yet');
  });
});
