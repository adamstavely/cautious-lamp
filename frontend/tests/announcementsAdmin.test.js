// Admin pages say what happened (WCAG 4.1.3, 3.3.1): a dialog's save error is
// shown in the dialog (the page behind it is inert), result counts are
// announced after each filter change, and a one-time API key isn't thrown
// away by Escape or Close without asking first.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import Admin from '../src/views/Admin.vue';
import ApiKeys from '../src/views/ApiKeys.vue';
import ApplicationManagement from '../src/views/ApplicationManagement.vue';
import PerformanceAnalysis from '../src/views/PerformanceAnalysis.vue';
import { mountView } from './helpers/mountView.js';
import { fail, flush, stubApi } from './helpers/stubApi.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const myPermissions = ['admin:governance', 'admin:banners', 'admin:users', 'token:view'];
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

let page;
let restoreAdapter;

/** Answers requests by the end of their URL (some pages prefix VITE_API_BASE_URL) */
const stubBySuffix = (routes) => {
  const original = apiClient.defaults.adapter;
  apiClient.defaults.adapter = async (config) => {
    const method = config.method.toUpperCase();
    const entry = Object.entries(routes).find(([key]) => {
      const [m, path] = key.split(' ');
      return m === method && config.url.endsWith(path);
    });
    let answer = entry?.[1];
    if (typeof answer === 'function') answer = answer(config);
    if (answer instanceof Error) return Promise.reject(answer);
    if (answer === undefined) return Promise.reject(fail(404, 'not found'));
    return { status: 200, statusText: 'OK', data: structuredClone(answer), headers: {}, config };
  };
  return () => (apiClient.defaults.adapter = original);
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  page?.unmount();
  page = null;
  restoreAdapter?.();
  restoreAdapter = null;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const dialogWith = (selector) => document.querySelector(selector)?.closest('dialog');

describe('dialog save errors', () => {
  it('shows a failed banner save inside the banner form dialog, and clears it on reopening', async () => {
    restoreAdapter = stubBySuffix({
      'GET /api/v1/banners': [{ id: 'b1', title: 'Maintenance', message: 'Tonight', type: 'info', isActive: true, createdAt: '2026-11-01T00:00:00Z' }],
      'POST /api/v1/banners': fail(400, 'Title is too long'),
      'PUT /api/v1/banners/b1': {},
    });
    page = await mountView(Admin, { path: '/admin' });
    await flush();

    page.state.showBannerModal = true;
    page.state.openCreateBanner();
    page.state.bannerForm.title = 'x';
    page.state.bannerForm.message = 'y';
    await page.state.saveBanner();
    await flush();

    const formDialog = dialogWith('#admin-banner-form');
    expect(formDialog.open).toBe(true);
    const alert = formDialog.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Title is too long');

    page.state.showBannerForm = false;
    page.state.openCreateBanner();
    await flush();
    expect(dialogWith('#admin-banner-form').querySelector('[role="alert"]')).toBeNull();

    // A toggle from the banner list says so in that dialog, not on the inert page behind it
    page.state.showBannerForm = false;
    await page.state.toggleBannerStatus({ id: 'b1', isActive: true });
    await flush();
    expect(page.state.bannerNotice).toEqual({ message: 'Banner deactivated', type: 'success' });
    const listDialog = [...document.querySelectorAll('dialog')].find((d) => d.textContent.includes('Active banners'));
    expect(listDialog.textContent).toContain('Banner deactivated');
  });

  it('shows a failed budget save inside the budget dialog', async () => {
    const api = stubApi({
      'GET /api/v1/performance/budgets': [],
      'POST /api/v1/performance/budgets': fail(500),
    });
    restoreAdapter = api.restore;
    page = await mountView(PerformanceAnalysis, { path: '/admin/performance' });
    await flush();

    page.state.showCreateModal = true;
    await flush();
    await page.state.saveBudget();
    await flush();

    const dialog = dialogWith('#performance-budget-form');
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('[role="alert"]')?.textContent).toContain('Error saving budget');
    // Not on the page behind the dialog
    expect(page.state.notice?.message ?? '').not.toContain('Error saving budget');
  });
});

describe('Application list count', () => {
  const apps = Array.from({ length: 3 }, (_, i) => ({ id: `app_${i}`, name: `App ${i}`, workspaceId: null, registeredAt: '2026-11-14T00:00:00.000Z', capabilities: {}, metadata: {} }));

  it('announces the number of applications after a filter change, once typing pauses', async () => {
    vi.useFakeTimers();
    const api = stubApi({
      'GET /api/v1/applications': (_body, config) => {
        const list = config.params?.search ? apps.filter((a) => a.name.includes(config.params.search)) : apps;
        return { applications: list, facets: { teams: ['payments'], environments: [] } };
      },
      'GET /api/v1/workspaces': [],
      'GET /api/v1/applications/version-tracking': { upgradeSummary: {}, applicationsByVersion: {}, recommendedActions: [] },
      'GET /api/v1/design-system/current-version': { version: '1.0.0', source: 'package' },
    });
    restoreAdapter = api.restore;
    page = await mountView(ApplicationManagement, { path: '/admin/applications' });
    await flush();

    const live = () => [...document.querySelectorAll('[aria-live="polite"]')].map((el) => el.textContent.trim()).filter(Boolean);

    page.state.search = 'App 1';
    await vi.advanceTimersByTimeAsync(200);
    await flush();
    expect(live()).not.toContain('1 application');

    await vi.advanceTimersByTimeAsync(300);
    await flush();
    expect(live()).toContain('1 application');

    // Every filter change, including one that leaves a single page
    page.state.search = '';
    await vi.advanceTimersByTimeAsync(400);
    await flush();
    expect(live()).toContain('3 applications');
  });
});

describe('API key one-time secret', () => {
  beforeEach(() => {
    const api = stubApi({
      'GET /api/v1/auth/api-keys': [],
      'POST /api/v1/auth/api-keys': (body) => ({
        apiKey: 'dsk_' + 'x'.repeat(43),
        metadata: { id: 'key_' + 'e'.repeat(32), name: body.name, createdAt: '2026-11-15T10:00:00.000Z', revoked: false },
      }),
    });
    restoreAdapter = api.restore;
  });

  const createKey = async () => {
    page = await mountView(ApiKeys, { path: '/admin/api-keys' });
    await flush();
    page.state.openCreate();
    await flush();
    page.state.form.name = 'Release pipeline';
    await page.state.submit();
    await flush();
  };

  it('asks before closing when the key has not been copied', async () => {
    await createKey();
    page.state.requestCreateOpen(false);
    await flush();
    expect(page.state.createOpen).toBe(true);
    const alert = dialogWith('#api-key-value').querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("The key hasn't been copied");
    expect(document.activeElement?.textContent.trim()).toBe('Keep open');

    page.state.keepOpen();
    await flush();
    expect(page.state.createOpen).toBe(true);
    expect(page.state.confirmingClose).toBe(false);

    page.state.requestCreateOpen(false);
    page.state.closeWithoutCopying();
    await flush();
    expect(page.state.createOpen).toBe(false);
    expect(page.state.created).toBeNull();
  });

  it('closes straight away once the key has been copied', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockResolvedValue() }, configurable: true });
    await createKey();
    await page.state.copyKey();
    page.state.requestCreateOpen(false);
    await flush();
    expect(page.state.createOpen).toBe(false);
  });
});
