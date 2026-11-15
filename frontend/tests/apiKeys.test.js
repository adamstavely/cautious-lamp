// API keys page: lists the managed keys from the API (active ones by default),
// creates a key and shows its secret once, offers only the admin's own
// permissions as scopes, revokes after confirming, and shows API failures.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ApiKeys from '../src/views/ApiKeys.vue';
import { mountView } from './helpers/mountView.js';
import { fail, flush, stubApi } from './helpers/stubApi.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const myPermissions = ['admin:users', 'token:view', 'component:view'];
vi.mock('../src/composables/useAuth.js', async () => {
  const { computed } = await import('vue');
  return {
    useAuth: () => ({
      hasPermission: (p) => myPermissions.includes(p),
      permissions: computed(() => myPermissions),
      user: computed(() => ({ id: 'usr_admin', permissions: myPermissions })),
    }),
  };
});

const KEYS = [
  { id: 'key_' + 'a'.repeat(32), name: 'GitHub Actions: web', createdAt: '2026-11-01T10:00:00.000Z', lastUsed: '2026-11-14T08:00:00.000Z', revoked: false },
  { id: 'key_' + 'b'.repeat(32), name: 'Token bot', createdAt: '2026-11-02T10:00:00.000Z', revoked: false, scopes: ['token:view'], expiresAt: '2099-01-01T00:00:00.000Z' },
  { id: 'key_' + 'c'.repeat(32), name: 'Old CLI', createdAt: '2026-01-01T10:00:00.000Z', revoked: true, revokedAt: '2026-02-01T10:00:00.000Z' },
  { id: 'key_' + 'd'.repeat(32), name: 'Trial', createdAt: '2026-03-01T10:00:00.000Z', revoked: false, expiresAt: '2026-04-01T00:00:00.000Z' },
];
const SECRET = 'dsk_' + 'x'.repeat(43);

let api;
let page;
let keys;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  keys = structuredClone(KEYS);
  api = stubApi({
    'GET /api/v1/auth/api-keys': () => keys,
    'POST /api/v1/auth/api-keys': (body) => {
      const metadata = { id: 'key_' + 'e'.repeat(32), name: body.name, createdAt: '2026-11-15T10:00:00.000Z', revoked: false, scopes: body.scopes };
      keys.push(metadata);
      return { apiKey: SECRET, metadata };
    },
    [`POST /api/v1/auth/api-keys/key_${'a'.repeat(32)}/revoke`]: () => {
      keys[0].revoked = true;
      return { message: 'API key revoked successfully' };
    },
  });
});

afterEach(() => {
  page?.unmount();
  page = null;
  api.restore();
  vi.restoreAllMocks();
});

const open = async () => {
  page = await mountView(ApiKeys, { path: '/admin/api-keys' });
  await flush();
  return page;
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');
const button = (label) => [...document.querySelectorAll('button')].find((el) => el.textContent.trim() === label);

describe('API keys page', () => {
  it('lists active keys newest first, and revoked and expired ones on request', async () => {
    await open();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    const rows = () => [...document.querySelectorAll('tbody tr')].map((row) => row.querySelector('td').textContent);
    expect(rows()).toEqual([expect.stringContaining('Token bot'), expect.stringContaining('GitHub Actions: web')]);
    expect(text()).toContain('Default');
    expect(text()).toContain('token:view');

    page.state.showInactive = true;
    await flush();
    expect(rows()).toHaveLength(4);
    expect(text()).toContain('Revoked');
    expect(text()).toContain('Expired');
    // Only active keys can be revoked
    expect(document.querySelectorAll('button[aria-label^="Revoke"]')).toHaveLength(2);
  });

  it('creates a key with the chosen scopes and shows the secret once', async () => {
    await open();
    button('Create key').click();
    await flush();
    // Only permissions the admin holds are offered
    expect(page.state.grantable).toEqual(['admin:users', 'component:view', 'token:view']);

    page.state.form.name = 'Release pipeline';
    page.state.form.expiresInDays = '30';
    page.state.form.access = 'chosen';
    await page.state.submit();
    await flush();
    expect(page.state.scopesError).toBe('Choose at least one permission.');
    expect(api.calls.some((c) => c.key === 'POST /api/v1/auth/api-keys')).toBe(false);

    page.state.form.scopes = ['token:view'];
    await page.state.submit();
    await flush();
    expect(api.calls.find((c) => c.key === 'POST /api/v1/auth/api-keys').data).toEqual({ name: 'Release pipeline', expiresInDays: 30, scopes: ['token:view'] });
    expect(document.querySelector('#api-key-value').value).toBe(SECRET);
    expect(text()).toContain("It won't be shown again");
    expect(text()).toContain('Release pipeline');

    // Closing forgets the secret
    page.state.createOpen = false;
    await flush();
    expect(page.state.created).toBeNull();
    expect(document.body.innerHTML).not.toContain(SECRET);
  });

  it('sends no scopes for the default permissions and no expiry for "Never"', async () => {
    await open();
    page.state.openCreate();
    page.state.form.name = 'MCP server';
    page.state.form.expiresInDays = '';
    await page.state.submit();
    expect(api.calls.find((c) => c.key === 'POST /api/v1/auth/api-keys').data).toEqual({ name: 'MCP server' });
  });

  it("shows the API's reason when a key can't be created", async () => {
    api.restore();
    api = stubApi({
      'GET /api/v1/auth/api-keys': [],
      'POST /api/v1/auth/api-keys': fail(403, "You can't grant permissions you don't have: admin:rbac"),
    });
    await open();
    expect(text()).toContain('No API keys yet.');
    page.state.openCreate();
    page.state.form.name = 'Too strong';
    await page.state.submit();
    await flush();
    expect(page.state.formError).toContain("You can't grant permissions you don't have: admin:rbac");
  });

  it('revokes a key after confirming', async () => {
    await open();
    document.querySelector(`button[aria-label="Revoke GitHub Actions: web"]`).click();
    await flush();
    expect(text()).toContain('TOKEN_REVOKED');
    await page.state.revoke();
    await flush();
    expect(api.calls.map((c) => c.key)).toContain(`POST /api/v1/auth/api-keys/key_${'a'.repeat(32)}/revoke`);
    expect(page.state.revokeOpen).toBe(false);
    expect([...document.querySelectorAll('tbody tr')].map((row) => row.querySelector('td').textContent)).toEqual([expect.stringContaining('Token bot')]);
  });

  it('says when the keys cannot be loaded', async () => {
    api.restore();
    api = stubApi({ 'GET /api/v1/auth/api-keys': fail(503, 'Elasticsearch is unavailable') });
    await open();
    expect(text()).toContain('API keys are temporarily unavailable');
    expect(button('Try again')).toBeTruthy();
  });
});
