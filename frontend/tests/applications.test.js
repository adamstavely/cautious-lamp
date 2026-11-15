// Application registration and editing: clearing a URL really clears it,
// registering from a workspace page preselects that workspace, and the list
// says when a registration worked.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detailsForm, updateFields } from '../src/components/applications/details.js';
import apiClient from '../src/services/api.js';
import ApplicationRegistration from '../src/views/ApplicationRegistration.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));
vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({ hasPermission: () => false, user: { value: { id: 'usr_1' } } }),
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
