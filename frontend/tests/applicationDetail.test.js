// Application detail page: overview and per-capability statuses from the API,
// a not-found state for a 404, Run scan posts an application scan and shows the
// result, one failing status stays inline, and read-only users see no write actions.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import ApplicationDetail from '../src/views/ApplicationDetail.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const permissions = new Set();
vi.mock('../src/composables/useAuth.js', () => ({
  useAuth: () => ({ hasPermission: (p) => permissions.has(p), user: { value: { id: 'usr_1' } } }),
}));

const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const routes = [{ path: '/admin/applications/:id', component: { render: () => null } }];

const APP = {
  id: 'app_1',
  name: 'Checkout',
  description: 'Where people pay',
  repository: 'https://github.com/example/checkout',
  applicationUrl: 'https://checkout.example.com',
  version: '2.1.0',
  designSystemVersion: '1.0.0',
  teamId: 'team-pay',
  workspaceId: 'ws_a',
  registeredAt: '2026-01-02T10:00:00.000Z',
  updatedAt: '2026-02-03T10:00:00.000Z',
  registeredBy: { id: 'usr_1', name: 'Rita Registrar' },
  updatedBy: { id: 'usr_2', name: 'Uma Updater' },
  capabilities: {
    governance: { enabled: true, rules: [], scanSchedule: 'weekly', lastScan: '2026-03-01T09:00:00.000Z' },
    visualRegression: { enabled: true, projectId: 'vr_1' },
    sessionReplay: { enabled: true, projectId: 'sr_1' },
  },
  metadata: { environment: 'production', framework: 'Vue', language: 'TypeScript', tags: ['payments', 'public'] },
};

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;

const fail = (status, message) => Object.assign(new Error(message ?? `HTTP ${status}`), { response: { status, data: message ? { message } : {} } });

// jsdom has no <dialog> methods; ConfirmDialog opens one
HTMLDialogElement.prototype.showModal ??= function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function close() {
  this.open = false;
};

beforeEach(() => {
  permissions.clear();
  calls = [];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    'GET /api/v1/applications/app_1': structuredClone(APP),
    'GET /api/v1/workspaces': [{ id: 'ws_a', name: 'Payments', effectiveRole: 'admin' }],
    'GET /api/v1/design-system/current-version': { version: '1.2.0', source: 'package' },
    'GET /api/v1/governance/scans': {
      scans: [
        { id: 'scan_2', createdAt: '2026-03-01T09:00:00.000Z', source: 'url', summary: { passed: 7, warnings: 2, errors: 1, info: 0, total: 10 } },
        { id: 'scan_1', createdAt: '2026-02-01T09:00:00.000Z', source: 'url', summary: { passed: 9, warnings: 0, errors: 0, info: 1, total: 10 } },
      ],
      total: 2,
    },
    'GET /api/v1/accessibility-reports/reports': [
      { id: 'rep_2', complianceScore: 91, wcagLevel: 'AA', conformance: { status: 'needs-review' }, generatedAt: '2026-03-02T09:00:00.000Z' },
      { id: 'rep_1', complianceScore: 80, wcagLevel: 'A', conformance: { status: 'failing' }, generatedAt: '2026-02-02T09:00:00.000Z' },
    ],
    'GET /api/v1/visual-regression/projects/vr_1/runs': {
      data: [{ id: 'run_1', projectId: 'vr_1', status: 'completed', startedAt: '2026-03-03T09:00:00.000Z', resultsSummary: { total: 5, passed: 4, failed: 1, new: 0, removed: 0 } }],
      pagination: { page: 1, limit: 1, total: 12, totalPages: 12, hasNext: true, hasPrevious: false },
    },
    'GET /api/v1/session-replay/projects/sr_1': { id: 'sr_1', openreplayProjectKey: 'abc123', openreplayProjectId: 34, hasApiKey: true },
    'POST /api/v1/governance/scans': (config) => {
      const body = JSON.parse(config.data);
      return { id: 'scan_3', scope: 'application', applicationId: body.applicationId, createdAt: '2026-04-01T09:00:00.000Z', source: 'url', summary: { passed: 5, warnings: 1, errors: 3, info: 0, total: 9 } };
    },
  };
  apiClient.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    calls.push({ key, params: config.params, data: config.data ? JSON.parse(config.data) : undefined });
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

const open = async (id = 'app_1') => {
  page = await mountView(ApplicationDetail, { path: `/admin/applications/${id}`, routes });
  await flush();
  return page;
};
const text = () => document.body.textContent.replace(/\s+/g, ' ');
const buttons = () => [...document.querySelectorAll('button, a')].map((el) => el.textContent.trim());

describe('Application detail', () => {
  it('renders the overview and every status from the API', async () => {
    permissions.add('admin:governance');
    await open();
    const body = text();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelector('h1').textContent).toContain('Checkout');
    expect(body).toContain('Where people pay');
    expect(body).toContain('Payments');
    expect(body).toContain('team-pay');
    expect(body).toContain('TypeScript');
    expect(body).toContain('payments');
    expect(body).toContain('v1.0.0');
    expect(body).toContain('Upgrade available: v1.2.0');
    expect(body).toContain('Rita Registrar');
    expect(body).toContain('Uma Updater');
    // Governance: latest scan and the recent list
    expect(body).toContain('Weekly scans');
    expect(body).toContain('7 passed, 2 warnings, 1 errors');
    expect(body).toContain('9 passed, 0 warnings, 0 errors');
    // Accessibility: newest report
    expect(body).toContain('91%');
    expect(body).toContain('Needs manual review');
    // Visual regression and session replay
    expect(body).toContain('12');
    expect(body).toContain('Completed');
    expect(body).toContain('Connected');
    expect(body).toContain('OpenReplay project 34');

    const scanCall = calls.find((c) => c.key === 'GET /api/v1/governance/scans');
    expect(scanCall.params).toEqual({ applicationId: 'app_1', limit: 5 });
    expect(calls.find((c) => c.key === 'GET /api/v1/accessibility-reports/reports').params).toEqual({ applicationId: 'app_1' });

    const hrefs = [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/tools/visual-regression/vr_1');
    expect(hrefs).toContain('/hcd/session-replay/sr_1/sessions');
    expect(hrefs).toContain('/admin/applications?edit=app_1');
    expect(hrefs).toContain('/admin/accessibility-reports');
    expect(hrefs).toContain('/admin/applications');
  });

  it('shows the not-found state for a 404, with a way back to the list', async () => {
    await open('missing');
    await vi.waitFor(() => expect(page.state.notFound).toBe(true));
    await flush();
    expect(text()).toContain("This application doesn't exist or isn't visible to you.");
    expect([...document.querySelectorAll('a')].some((a) => a.getAttribute('href') === '/admin/applications' && /Back to applications/.test(a.textContent))).toBe(true);
    // Statuses aren't asked for an application that isn't there
    expect(calls.some((c) => c.key.includes('/governance/scans'))).toBe(false);
  });

  it('runs an application scan and shows its result first', async () => {
    permissions.add('admin:governance');
    await open();
    await page.state.runScan();
    await flush();
    const post = calls.find((c) => c.key === 'POST /api/v1/governance/scans');
    expect(post.data).toEqual({ scope: 'application', applicationId: 'app_1' });
    expect(page.state.scans.data.scans[0].id).toBe('scan_3');
    expect(page.state.scans.data.total).toBe(3);
    expect(text()).toContain('Scan finished: 5 passed, 1 warnings, 3 errors.');
    expect(text()).toContain('5 passed, 1 warnings, 3 errors');
  });

  it("shows the server's message when a scan fails", async () => {
    permissions.add('admin:governance');
    responses['POST /api/v1/governance/scans'] = fail(400, 'Nothing to scan: send codebase { html, css, javascript } or a public url, or set the application URL');
    await open();
    await page.state.runScan();
    await flush();
    expect(page.state.scanError).toContain('Nothing to scan');
    expect(text()).toContain('Nothing to scan');
    // The earlier scans are still there
    expect(text()).toContain('7 passed, 2 warnings, 1 errors');
  });

  it('keeps a failing status inline without breaking the others', async () => {
    responses['GET /api/v1/session-replay/projects/sr_1'] = fail(500, 'Elasticsearch is down');
    responses['GET /api/v1/accessibility-reports/reports'] = fail(403);
    await open();
    await vi.waitFor(() => expect(page.state.replayProject.error).toBeTruthy());
    await vi.waitFor(() => expect(page.state.reports.error).toBeTruthy());
    await flush();
    const body = text();
    expect(body).toContain('The session replay project could not be loaded. Elasticsearch is down');
    expect(body).toContain("You don't have access to this.");
    expect(body).toContain('Checkout');
    expect(body).toContain('7 passed, 2 warnings, 1 errors');
    expect(body).toContain('Completed');
  });

  it('hides write actions from a read-only user', async () => {
    responses['GET /api/v1/workspaces'] = [{ id: 'ws_a', name: 'Payments', effectiveRole: 'viewer' }];
    await open();
    expect(page.state.canWrite).toBe(false);
    const labels = buttons();
    expect(labels.some((l) => /Run scan/.test(l))).toBe(false);
    expect(labels.some((l) => /^Edit/.test(l))).toBe(false);
    expect(labels.some((l) => /^Delete/.test(l))).toBe(false);
    // Read-only links stay
    expect(labels.some((l) => /View test runs/.test(l))).toBe(true);
    expect(labels.some((l) => /View sessions/.test(l))).toBe(true);
  });

  it('lets a workspace admin edit and delete, but explains that scans need admin:governance', async () => {
    await open();
    expect(page.state.canWrite).toBe(true);
    const scan = [...document.querySelectorAll('button')].find((b) => /Run scan/.test(b.textContent));
    expect(scan.disabled).toBe(true);
    expect(text()).toContain('Running a scan needs the admin:governance permission.');
  });

  it('deletes after confirming, then returns to the list', async () => {
    permissions.add('admin:governance');
    responses['DELETE /api/v1/applications/app_1'] = { success: true };
    await open();
    const pending = page.state.deleteApplication();
    await flush();
    expect(page.state.confirmState.message).toBe(
      '"Checkout", its visual-regression project, its session-replay project, and its accessibility schedules and SLA will be deleted. Its governance scans and accessibility reports are kept as a record. This can\'t be undone.',
    );
    page.state.confirmState.resolve(true);
    await pending;
    await flush();
    expect(calls.some((c) => c.key === 'DELETE /api/v1/applications/app_1')).toBe(true);
    await vi.waitFor(() => expect(page.router.currentRoute.value.path).toBe('/admin/applications'));
  });
});
