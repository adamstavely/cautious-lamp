// Admin section accessibility fixes: the dependency graph is a group of
// buttons (not an image hiding them) with status shown without colour; the
// application edit modal checks both tabs and takes you to the first problem;
// a warning comes two minutes before the sign-in session ends (WCAG 2.2.1);
// and a workspace member's role only changes when "Save role" is pressed.
import axios from 'axios';
import { createApp, h, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AppIcon from '../src/components/ui/AppIcon.vue';
import WorkspaceMembersPanel from '../src/components/workspaces/WorkspaceMembersPanel.vue';
import ApplicationManagement from '../src/views/ApplicationManagement.vue';
import ComponentDependencyGraph from '../src/views/ComponentDependencyGraph.vue';
import { mountView } from './helpers/mountView.js';
import { flush, stubApi } from './helpers/stubApi.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));
vi.mock('../src/composables/useAuth.js', async () => {
  const { computed } = await import('vue');
  return {
    useAuth: () => ({
      hasPermission: (p) => ['admin:governance', 'component:edit'].includes(p),
      user: computed(() => ({ id: 'usr_owner' })),
    }),
  };
});

let api;
let page;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  page?.unmount();
  page = null;
  api?.restore();
  api = null;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Vue ignores a click in the same millisecond its listener was attached
const settle = async () => {
  await flush();
  await new Promise((resolve) => setTimeout(resolve, 2));
};
const visibleText = (el) => {
  const copy = el.cloneNode(true);
  copy.querySelectorAll('.sr-only').forEach((hidden) => hidden.remove());
  return copy.textContent.trim();
};
const button = (label) => [...document.querySelectorAll('button')].find((el) => visibleText(el) === label);

describe('Component dependency graph', () => {
  it('is a group of named buttons, says each status in words and points to the list', async () => {
    api = stubApi({
      'GET /api/v1/components': {
        components: [
          { id: 'button', name: 'Button', status: 'production', dependencies: [] },
          { id: 'card', name: 'Card', status: 'in-progress', dependencies: ['button'] },
          { id: 'old', name: 'Old card', status: 'deprecated', dependencies: ['card'] },
        ],
      },
    });
    page = await mountView(ComponentDependencyGraph);
    await flush();

    const svg = document.querySelector('.graph-well svg');
    expect(svg.getAttribute('role')).toBe('group');
    expect(svg.getAttribute('aria-label')).toContain('Card depends on Button');
    const help = document.getElementById(svg.getAttribute('aria-describedby'));
    expect(help.querySelector('a').getAttribute('href')).toBe('#dependencies-list');
    expect(document.getElementById('dependencies-list')).not.toBeNull();

    const names = [...svg.querySelectorAll('[role="button"]')].map((node) => node.getAttribute('aria-label'));
    expect(names).toEqual(['Focus on Button, Production ready', 'Focus on Card, In progress', 'Focus on Old card, Deprecated']);
    // Not colour alone: a ring style per status, a strike for deprecated
    expect(svg.querySelector('.status-ring-dashed')).not.toBeNull();
    expect(svg.querySelectorAll('.status-strike')).toHaveLength(1);
  });
});

describe('Application edit modal', () => {
  const APP = {
    id: 'app_1',
    name: 'Shop',
    workspaceId: null,
    registeredAt: '2026-11-14T00:00:00.000Z',
    capabilities: { governance: { enabled: false }, visualRegression: { enabled: false }, sessionReplay: { enabled: false } },
    metadata: {},
  };

  beforeEach(() => {
    api = stubApi({
      'GET /api/v1/applications': { applications: [APP], count: 1, total: 1, facets: { teams: [], environments: [] } },
      'GET /api/v1/workspaces': [],
      'GET /api/v1/applications/version-tracking': { upgradeSummary: {}, applicationsByVersion: {}, recommendedActions: [] },
      'GET /api/v1/design-system/current-version': { version: '1.0.0', source: 'package' },
      'GET /api/v1/governance/rules': { rules: [] },
      'PUT /api/v1/applications/app_1': APP,
      'PATCH /api/v1/applications/app_1/capabilities': APP,
    });
  });

  const writes = () => api.calls.filter((c) => !c.key.startsWith('GET'));

  it('switches to the tab with the invalid field, shows its message and focuses it', async () => {
    page = await mountView(ApplicationManagement, { path: '/admin/applications' });
    await flush();
    page.state.openEdit(APP);
    await flush();
    expect(document.querySelector('form#edit-application-form').noValidate).toBe(true);

    // A required field on the hidden Capabilities tab, while Details is showing
    page.state.edit.capabilities.visualRegression.enabled = true;
    await flush();
    expect(page.state.edit.tab).toBe('details');

    await page.state.saveEdit();
    await flush();
    expect(page.state.edit.tab).toBe('capabilities');
    expect(page.state.edit.errors).toEqual({ argosProjectId: 'Enter the Argos project, as owner/project.' });
    const field = document.querySelector('input[name="argosProjectId"]');
    expect(document.activeElement).toBe(field);
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(field.getAttribute('aria-describedby')).textContent).toContain('Enter the Argos project');
    expect(writes()).toEqual([]);

    // Fixed: it saves, and the message goes
    page.state.edit.capabilities.visualRegression.argosProjectId = 'acme/web';
    await flush();
    await page.state.saveEdit();
    await flush();
    expect(page.state.edit.errors).toEqual({});
    expect(writes().map((c) => c.key)).toEqual(['PATCH /api/v1/applications/app_1/capabilities']);
  });

  it('finds a pattern mismatch on the Details tab from the Capabilities tab', async () => {
    page = await mountView(ApplicationManagement, { path: '/admin/applications' });
    await flush();
    page.state.openEdit(APP);
    page.state.edit.details.teamId = 'team web!';
    page.state.edit.tab = 'capabilities';
    await flush();

    await page.state.saveEdit();
    await flush();
    expect(page.state.edit.tab).toBe('details');
    expect(page.state.edit.errors.teamId).toMatch(/letters, digits/);
    expect(document.activeElement).toBe(document.querySelector('input[name="teamId"]'));
    expect(writes()).toEqual([]);
  });
});

describe('Session expiry warning', () => {
  const CURRENT_PATH = '/admin/workspaces/abc?tab=members';
  const originalAdapter = axios.defaults.adapter;
  let auth;
  let replaced;
  let host;
  let app;

  beforeEach(async () => {
    vi.useFakeTimers();
    sessionStorage.clear();
    replaced = [];
    axios.defaults.adapter = async (config) => ({
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: { accessToken: 'token-1', expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(), user: { id: 'u1', permissions: [] } },
    });
    vi.resetModules();
    auth = await import('../src/services/auth.js');
    auth.setAuthRouter({ currentRoute: { value: { fullPath: CURRENT_PATH, meta: {} } }, replace: (to) => replaced.push(to) });
    // The same module instance as `auth` (after resetModules)
    const { default: SessionExpiryWarning } = await import('../src/components/SessionExpiryWarning.vue');
    host = document.createElement('div');
    document.body.appendChild(host);
    app = createApp({ render: () => h(SessionExpiryWarning) });
    app.component('AppIcon', AppIcon);
    app.config.warnHandler = () => {};
    app.mount(host);
  });

  afterEach(() => {
    app.unmount();
    host.remove();
    auth.clearSession();
    axios.defaults.adapter = originalAdapter;
  });

  const dialog = () => host.querySelector('dialog');

  it('appears two minutes before the session ends, and Sign in again keeps the page to come back to', async () => {
    await auth.login('a@b.c', 'pw');
    await nextTick();
    expect(dialog().open).toBe(false);

    await vi.advanceTimersByTimeAsync(8 * 60_000 - 1000);
    expect(auth.authState.expiringSoon).toBe(false);
    expect(dialog().open).toBe(false);

    await vi.advanceTimersByTimeAsync(2000);
    await nextTick();
    expect(auth.authState.expiringSoon).toBe(true);
    expect(dialog().open).toBe(true);
    expect(dialog().textContent).toContain('Your session is about to end');
    expect(dialog().textContent).toContain("anything you haven't saved will be lost");
    expect(replaced).toEqual([]);

    await vi.advanceTimersByTimeAsync(5);
    button('Sign in again').click();
    await nextTick();
    expect(auth.authState.token).toBeNull();
    expect(auth.authState.expiringSoon).toBe(false);
    expect(replaced).toEqual([{ path: '/login', query: { redirect: CURRENT_PATH } }]);
    expect(dialog().open).toBe(false);
  });

  it('Keep working hides it; the session still ends on time', async () => {
    await auth.login('a@b.c', 'pw');
    await vi.advanceTimersByTimeAsync(8 * 60_000 + 1000);
    await nextTick();
    expect(dialog().open).toBe(true);

    await vi.advanceTimersByTimeAsync(5);
    button('Keep working').click();
    await nextTick();
    expect(dialog().open).toBe(false);
    expect(auth.authState.token).toBe('token-1');

    await vi.advanceTimersByTimeAsync(2 * 60_000);
    expect(auth.authState.token).toBeNull();
    expect(replaced).toEqual([{ path: '/login', query: { redirect: CURRENT_PATH, expired: '1' } }]);
  });
});

describe('Workspace member role', () => {
  let host;
  let app;

  const WORKSPACE = {
    id: 'ws_1',
    name: 'Alpha',
    effectiveRole: 'owner',
    members: [
      { userId: 'usr_owner', email: 'owner@example.com', role: 'owner', addedAt: '2026-11-01T00:00:00.000Z' },
      { userId: 'usr_ed', email: 'ed@example.com', role: 'editor', addedAt: '2026-11-01T00:00:00.000Z' },
    ],
  };

  beforeEach(async () => {
    api = stubApi({ 'PATCH /api/v1/workspaces/ws_1/members/usr_ed': (body) => ({ ...WORKSPACE, members: [WORKSPACE.members[0], { ...WORKSPACE.members[1], role: body.role }] }) });
    host = document.createElement('div');
    document.body.appendChild(host);
    app = createApp({ render: () => h(WorkspaceMembersPanel, { workspace: WORKSPACE, currentUserId: 'usr_owner' }) });
    app.component('AppIcon', AppIcon);
    app.config.warnHandler = () => {};
    app.mount(host);
    await flush();
  });

  afterEach(() => {
    app.unmount();
    host.remove();
  });

  it('only saves when Save role is pressed, then announces the result', async () => {
    const select = host.querySelector('select[aria-label="Role for ed@example.com"]');
    expect(button('Save role')).toBeUndefined();

    // Arrowing through the options fires change for each one: nothing is saved
    for (const role of ['admin', 'viewer']) {
      select.value = role;
      select.dispatchEvent(new Event('change'));
      await flush();
    }
    expect(api.calls).toEqual([]);
    expect(select.value).toBe('viewer');

    await settle();
    button('Save role').click();
    await flush();
    expect(api.calls).toEqual([{ key: 'PATCH /api/v1/workspaces/ws_1/members/usr_ed', params: undefined, data: { role: 'viewer' } }]);
    const live = [...host.querySelectorAll('[aria-live="polite"]')].map((el) => el.textContent).join(' ');
    expect(live).toContain('ed@example.com is now a viewer.');
    expect(button('Save role')).toBeUndefined();
    expect(document.activeElement).toBe(select);
  });
});
