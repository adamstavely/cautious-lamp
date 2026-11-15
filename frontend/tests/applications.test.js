// Application registration and editing: clearing a URL really clears it,
// registering from a workspace page preselects that workspace, and the list
// says when a registration worked.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detailsForm, updateFields } from '../src/components/applications/details.js';
import apiClient from '../src/services/api.js';
import ApplicationManagement from '../src/views/ApplicationManagement.vue';
import ApplicationRegistration from '../src/views/ApplicationRegistration.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));
const auth = vi.hoisted(() => ({ governance: false }));
vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({ hasPermission: (p) => auth.governance && p === 'admin:governance', user: { value: { id: 'usr_1' } } }),
}));

const flush = async () => {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

describe('updateFields', () => {
  const app = { name: 'Shop', description: 'd', repository: 'https://example.com/repo', applicationUrl: 'https://shop.example.com', metadata: {} };

  it('sends a cleared URL as an empty string so the server clears it', () => {
    const form = { ...detailsForm(app), repository: '', applicationUrl: '  ' };
    expect(updateFields(form, app)).toEqual({ repository: '', applicationUrl: '' });
  });

  it('sends only what changed', () => {
    expect(updateFields(detailsForm(app), app)).toEqual({});
    expect(updateFields({ ...detailsForm(app), applicationUrl: 'https://new.example.com' }, app)).toEqual({ applicationUrl: 'https://new.example.com' });
  });
});

describe('Application registration', () => {
  let posted;
  let page;
  const originalAdapter = apiClient.defaults.adapter;

  beforeEach(() => {
    posted = null;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    apiClient.defaults.adapter = async (config) => {
      const reply = (data) => ({ status: 200, statusText: 'OK', data, headers: {}, config });
      if (config.url === '/api/v1/workspaces') {
        return reply([
          { id: 'ws_a', name: 'Alpha', effectiveRole: 'admin' },
          { id: 'ws_b', name: 'Beta', effectiveRole: 'admin' },
          { id: 'ws_c', name: 'Gamma', effectiveRole: 'viewer' },
        ]);
      }
      if (config.url === '/api/v1/applications/register') {
        posted = JSON.parse(config.data);
        return reply({ id: 'app_1', name: posted.name });
      }
      return Promise.reject(Object.assign(new Error('not found'), { response: { status: 404, data: {} } }));
    };
  });

  afterEach(() => {
    page?.unmount();
    page = null;
    apiClient.defaults.adapter = originalAdapter;
    vi.restoreAllMocks();
  });

  it('preselects the workspace it was opened from, then returns to the list with a confirmation', async () => {
    page = await mountView(ApplicationRegistration, { path: '/admin/applications/register?workspaceId=ws_b' });
    await flush();
    expect(page.state.workspaceId).toBe('ws_b');

    page.state.details.name = 'Checkout';
    await page.state.registerApplication();
    await flush();
    expect(posted).toMatchObject({ name: 'Checkout', workspaceId: 'ws_b' });
    // The navigation isn't awaited by the page
    await vi.waitFor(() => expect(page.router.currentRoute.value).toMatchObject({ path: '/admin/applications', query: { registered: 'Checkout' } }));
  });

  it("ignores a workspace the user can't register into", async () => {
    page = await mountView(ApplicationRegistration, { path: '/admin/applications/register?workspaceId=ws_c' });
    await flush();
    expect(page.state.workspaceId).toBe('');
  });
});

describe('Application list', () => {
  let requests;
  let page;
  const originalAdapter = apiClient.defaults.adapter;
  const apps = Array.from({ length: 45 }, (_, i) => ({
    id: `app_${i}`,
    name: `App ${String(i).padStart(2, '0')}`,
    workspaceId: null,
    registeredAt: '2026-11-14T00:00:00.000Z',
    capabilities: { governance: { enabled: i === 0 }, visualRegression: { enabled: false }, sessionReplay: { enabled: false } },
    metadata: {},
  }));

  beforeEach(() => {
    auth.governance = true;
    requests = [];
    vi.spyOn(console, 'error').mockImplementation(() => {});
    apiClient.defaults.adapter = async (config) => {
      const reply = (data) => ({ status: 200, statusText: 'OK', data, headers: {}, config });
      requests.push({ method: config.method, url: config.url, params: config.params, data: config.data });
      if (config.url === '/api/v1/applications') {
        const list = config.params?.search ? apps.filter((a) => a.name.includes(config.params.search)) : apps;
        return reply({ applications: list, count: list.length, total: list.length, facets: { teams: ['payments'], environments: [] } });
      }
      if (config.url === '/api/v1/workspaces') return reply([]);
      if (config.url === '/api/v1/applications/version-tracking') return reply({ upgradeSummary: {}, applicationsByVersion: {}, recommendedActions: [] });
      if (config.url === '/api/v1/design-system/current-version') return reply({ version: '1.0.0', source: 'package' });
      if (config.url === '/api/v1/governance/scans') return reply({ id: 'scan-1', summary: { errors: 1, warnings: 2, passed: 3 } });
      return Promise.reject(Object.assign(new Error('not found'), { response: { status: 404, data: {} } }));
    };
  });

  afterEach(() => {
    page?.unmount();
    page = null;
    apiClient.defaults.adapter = originalAdapter;
    auth.governance = false;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('pages the list 20 at a time', async () => {
    page = await mountView(ApplicationManagement, { path: '/admin/applications' });
    await flush();
    expect(page.state.pagedApplications).toHaveLength(20);
    expect(page.state.pageCount).toBe(3);
    page.state.page = 3;
    await flush();
    expect(page.state.pagedApplications.map((a) => a.id)).toEqual(apps.slice(40).map((a) => a.id));
  });

  it('sends search and filters to the server and goes back to page one', async () => {
    vi.useFakeTimers();
    page = await mountView(ApplicationManagement, { path: '/admin/applications' });
    await flush();
    page.state.page = 2;
    page.state.search = 'App 1';
    page.state.filterTeam = 'payments';
    await vi.advanceTimersByTimeAsync(400);
    await flush();
    const last = requests.filter((r) => r.url === '/api/v1/applications').at(-1);
    expect(last.params).toEqual({ search: 'App 1', teamId: 'payments' });
    expect(page.state.page).toBe(1);
  });

  it('runs a governance scan from the row and reports the result', async () => {
    page = await mountView(ApplicationManagement, { path: '/admin/applications' });
    await flush();
    await page.state.runScan(apps[0]);
    const scan = requests.find((r) => r.url === '/api/v1/governance/scans');
    expect(JSON.parse(scan.data)).toEqual({ scope: 'application', applicationId: 'app_0' });
    expect(page.state.notice?.message).toMatch(/1 error/);
  });
});
