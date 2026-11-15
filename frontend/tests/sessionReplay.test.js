// Session replay pages: the project page asks OpenReplay (through the API) for one
// user's sessions with the filters and page, shows both install snippets, and
// saves privacy and capture settings; the create dialog sends key and id apart;
// the session page links to OpenReplay's player and lists events. Every tab
// has its own address.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import SessionReplay from '../src/views/SessionReplay.vue';
import SessionReplayProject from '../src/views/SessionReplayProject.vue';
import SessionReplayViewer from '../src/views/SessionReplayViewer.vue';
import { captureForm, capturePayload } from '../src/components/session-replay/captureSettings.js';
import { mountView } from './helpers/mountView.js';

const flush = async () => {
  for (let i = 0; i < 8; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const routes = [
  { path: '/hcd/session-replay/:id/sessions/:sessionId', component: { render: () => null } },
  { path: '/hcd/session-replay/:id/:tab(sessions|heatmaps|settings)?', component: { render: () => null } },
];

const PROJECT = {
  id: 'sr_1',
  name: 'Checkout replay',
  teamId: 'team-pay',
  openreplayProjectKey: 'abc123',
  openreplayProjectId: 42,
  openreplayBaseUrl: 'https://api.openreplay.com',
  hasApiKey: true,
  privacySettings: {
    defaultInputMode: 'obscured',
    privateMode: false,
    obscureTextEmails: true,
    obscureTextNumbers: false,
    obscureInputEmails: true,
    obscureInputNumbers: true,
    maskTextSelector: [],
    blockSelector: ['.ad'],
    respectDoNotTrack: true,
  },
  config: { captureConsole: true, captureNetwork: true, captureNetworkPayload: false, captureIFrames: true },
  createdAt: '2026-11-01T10:00:00.000Z',
};

// jsdom has no <dialog> methods; UiDialog opens one
HTMLDialogElement.prototype.showModal ??= function showModal() {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function close() {
  this.open = false;
};

const fail = (status, data) => Object.assign(new Error(`HTTP ${status}`), { response: { status, data } });

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;

beforeEach(() => {
  calls = [];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    'GET /api/v1/session-replay/projects': [PROJECT],
    'GET /api/v1/workspaces': [],
    'GET /api/v1/session-replay/projects/sr_1': structuredClone(PROJECT),
    'GET /api/v1/session-replay/projects/sr_1/integration-code': {
      script: '<script>var initOpts = { projectKey: "abc123" };</script>',
      npmInstall: 'npm i @openreplay/tracker@^19',
      npm: "import OpenReplay from '@openreplay/tracker';",
    },
    'GET /api/v1/session-replay/projects/sr_1/sessions': (config) => ({
      items: [{ sessionId: `s${config.params.page}`, userId: config.params.userId, startTime: '2026-11-02T10:00:00.000Z', endTime: '2026-11-02T10:01:30.000Z', duration: 90, eventsCount: 7, replayUrl: 'https://app.openreplay.com/42/session/s1' }],
      total: 45,
      page: config.params.page,
      limit: config.params.limit,
      startDate: '2026-11-01T00:00:00.000Z',
      endDate: '2026-11-03T23:59:59.999Z',
    }),
    'PUT /api/v1/session-replay/projects/sr_1': (config) => ({ ...PROJECT, ...JSON.parse(config.data) }),
    'POST /api/v1/session-replay/projects': (config) => ({ id: 'sr_2', ...JSON.parse(config.data) }),
    'GET /api/v1/session-replay/projects/sr_1/sessions/s1/replay-url': { url: 'https://app.openreplay.com/42/session/s1' },
    'GET /api/v1/session-replay/projects/sr_1/sessions/s1/events': (config) => ({
      items: [{ id: 'e1', name: 'CLICK', time: '2026-11-02T10:00:05.000Z', autoCaptured: true, properties: { label: 'Pay' } }],
      total: 1,
      page: config.params.page,
      limit: config.params.limit,
    }),
  };
  apiClient.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    calls.push({ key, params: config.params, data: config.data ? JSON.parse(config.data) : undefined });
    let data = responses[key];
    if (typeof data === 'function') data = data(config);
    if (data instanceof Error) return Promise.reject(data);
    if (data === undefined) return Promise.reject(fail(404, { message: 'not found' }));
    return { status: 200, statusText: 'OK', data, headers: {}, config };
  };
  window.showToast = vi.fn();
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

const text = () => document.body.textContent.replace(/\s+/g, ' ');
const open = async (component, path) => {
  page = await mountView(component, { path, routes });
  await flush();
  return page;
};

describe('Session replay project', () => {
  it('shows both install snippets and the configuration', async () => {
    await open(SessionReplayProject, '/hcd/session-replay/sr_1');
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(text()).toContain('var initOpts');
    expect(text()).toContain('abc123');
    expect(text()).toContain('42');
    page.state.installMethod = 'npm';
    await flush();
    expect(text()).toContain('npm i @openreplay/tracker@^19');
    expect(text()).toContain("import OpenReplay from '@openreplay/tracker'");
  });

  it("says what's missing instead of showing code without a project key", async () => {
    responses['GET /api/v1/session-replay/projects/sr_1'] = { ...PROJECT, openreplayProjectKey: undefined, hasApiKey: false };
    responses['GET /api/v1/session-replay/projects/sr_1/integration-code'] = fail(409, {
      code: 'OPENREPLAY_PROJECT_KEY_MISSING',
      message: 'This project has no OpenReplay project key.',
    });
    await open(SessionReplayProject, '/hcd/session-replay/sr_1');
    await vi.waitFor(() => expect(page.state.integrationProblem).toBeTruthy());
    await flush();
    expect(text()).toContain('Finish setting up this project');
    expect(text()).toContain('This project has no OpenReplay project key.');
    expect(text()).not.toContain('var initOpts');
  });

  it('passes the filters and page to the server and pages through the results', async () => {
    await open(SessionReplayProject, '/hcd/session-replay/sr_1/sessions');
    expect(page.state.activeTab).toBe('sessions');
    // Nothing is asked for until there is a user to ask about
    expect(calls.some((c) => c.key.endsWith('/sessions'))).toBe(false);
    Object.assign(page.state.filters, { userId: 'user-9', startDate: '2026-11-01', endDate: '2026-11-03', sortOrder: 'asc' });
    await page.state.searchSessions(1);
    await flush();

    const first = calls.filter((c) => c.key === 'GET /api/v1/session-replay/projects/sr_1/sessions').at(-1);
    expect(first.params).toEqual({ userId: 'user-9', startDate: '2026-11-01', endDate: '2026-11-03', sortOrder: 'asc', page: 1, limit: 20 });
    expect(text()).toContain('Sessions 1–1 of 45');
    await vi.waitFor(() => expect(page.router.currentRoute.value.query).toMatchObject({ userId: 'user-9', page: '1', startDate: '2026-11-01' }));

    const next = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Next');
    next.click();
    await flush();
    expect(calls.filter((c) => c.key.endsWith('/sessions')).at(-1).params).toMatchObject({ page: 2, userId: 'user-9' });
    expect(text()).toContain('Sessions 21–21 of 45');
    // Each row links to its session page with the session's time window
    const link = [...document.querySelectorAll('a')].find((a) => a.getAttribute('href')?.includes('/sessions/s2'));
    const query = new URL(link.getAttribute('href'), 'http://x').searchParams;
    expect(Object.fromEntries(query)).toEqual({ userId: 'user-9', start: '2026-11-02T10:00:00.000Z', end: '2026-11-02T10:01:30.000Z' });
  });

  it('runs a search from a shared address', async () => {
    await open(SessionReplayProject, '/hcd/session-replay/sr_1/sessions?userId=u-3&page=2&sortOrder=desc');
    expect(calls.find((c) => c.key.endsWith('/sessions')).params).toMatchObject({ userId: 'u-3', page: 2, sortOrder: 'desc' });
  });

  it('explains when OpenReplay is not connected', async () => {
    responses['GET /api/v1/session-replay/projects/sr_1/sessions'] = fail(503, {
      code: 'OPENREPLAY_NOT_CONFIGURED',
      message: 'This project has no OpenReplay API key.',
    });
    await open(SessionReplayProject, '/hcd/session-replay/sr_1/sessions');
    page.state.filters.userId = 'u';
    await page.state.searchSessions(1);
    await flush();
    expect(text()).toContain("OpenReplay isn't connected");
    expect(text()).toContain('This project has no OpenReplay API key.');
  });

  it('saves privacy and capture settings, and sends connection fields only when changed', async () => {
    await open(SessionReplayProject, '/hcd/session-replay/sr_1');
    page.state.selectTab('settings');
    await flush();
    expect(text()).toContain('Mask all text');
    expect(text()).toContain('Request and response bodies');
    expect(document.querySelector('#settings-block-selectors').value).toBe('.ad');

    Object.assign(page.state.captureSettings, { defaultInputMode: 'ignored', privateMode: true, maskTextSelector: '.price\n .balance ', captureConsole: false });
    await page.state.updateProject();
    await flush();
    const put = calls.find((c) => c.key === 'PUT /api/v1/session-replay/projects/sr_1').data;
    expect(put.privacySettings).toMatchObject({ defaultInputMode: 'ignored', privateMode: true, maskTextSelector: ['.price', '.balance'], blockSelector: ['.ad'] });
    expect(put.config).toMatchObject({ captureConsole: false, captureNetwork: true });
    expect(put).not.toHaveProperty('openreplayProjectKey');
    expect(put).not.toHaveProperty('openreplayProjectId');
    expect(put).not.toHaveProperty('openreplayApiKey');

    page.state.projectForm.openreplayProjectId = '';
    page.state.projectForm.openreplayProjectKey = 'newKey9';
    await page.state.updateProject();
    const second = calls.filter((c) => c.key.startsWith('PUT')).at(-1).data;
    expect(second).toMatchObject({ openreplayProjectKey: 'newKey9', openreplayProjectId: null });
  });

  it('gives every tab its own address, and opens the tab an address names', async () => {
    await open(SessionReplayProject, '/hcd/session-replay/sr_1');
    expect(page.state.activeTab).toBe('overview');
    const path = () => page.router.currentRoute.value.path;

    for (const tab of ['settings', 'heatmaps', 'sessions']) {
      page.state.selectTab(tab);
      await vi.waitFor(() => expect(path()).toBe(`/hcd/session-replay/sr_1/${tab}`));
    }
    page.state.selectTab('overview');
    await vi.waitFor(() => expect(path()).toBe('/hcd/session-replay/sr_1'));

    // Back goes to the previous tab
    page.router.back();
    await vi.waitFor(() => expect(path()).toBe('/hcd/session-replay/sr_1/sessions'));
    await flush();
    expect(page.state.activeTab).toBe('sessions');
    page.unmount();

    await open(SessionReplayProject, '/hcd/session-replay/sr_1/settings');
    expect(page.state.activeTab).toBe('settings');
    expect(document.querySelector('#settings-block-selectors')).not.toBeNull();
  });

  it('keeps the sessions search in the address when coming back to the Sessions tab', async () => {
    await open(SessionReplayProject, '/hcd/session-replay/sr_1/sessions');
    page.state.filters.userId = 'user-9';
    await page.state.searchSessions(1);
    await flush();
    const route = () => page.router.currentRoute.value;
    page.state.selectTab('settings');
    await vi.waitFor(() => expect(route().path).toBe('/hcd/session-replay/sr_1/settings'));
    expect(route().query).toEqual({});
    page.state.selectTab('sessions');
    await vi.waitFor(() => expect(route().query).toMatchObject({ userId: 'user-9', page: '1' }));
  });

  it('links heatmaps out to OpenReplay', async () => {
    responses['GET /api/v1/session-replay/projects/sr_1/heatmaps-url'] = { url: 'https://app.openreplay.com/42/metrics' };
    await open(SessionReplayProject, '/hcd/session-replay/sr_1');
    page.state.selectTab('heatmaps');
    await flush();
    const link = [...document.querySelectorAll('a')].find((a) => /Open heatmaps in OpenReplay/.test(a.textContent));
    expect(link.getAttribute('href')).toBe('https://app.openreplay.com/42/metrics');
    expect(document.querySelector('iframe')).toBeNull();
  });
});

describe('Session replay projects list', () => {
  it('creates a project with the key and the numeric id apart, and its settings', async () => {
    await open(SessionReplay, '/hcd/session-replay');
    page.state.openCreateProjectModal();
    Object.assign(page.state.newProject, { name: 'Shop', openreplayProjectKey: ' abc123 ', openreplayProjectId: '42' });
    page.state.newCapture.blockSelector = '.card';
    await page.state.createProject();
    await flush();
    const post = calls.find((c) => c.key === 'POST /api/v1/session-replay/projects').data;
    expect(post).toMatchObject({ name: 'Shop', openreplayProjectKey: 'abc123', openreplayProjectId: 42, workspaceId: null });
    expect(post).not.toHaveProperty('openreplayApiKey');
    expect(post.privacySettings).toMatchObject({ defaultInputMode: 'obscured', blockSelector: ['.card'], respectDoNotTrack: true });
  });
});

describe('Session page', () => {
  it('links to the player and lists the events in the session window', async () => {
    await open(SessionReplayViewer, '/hcd/session-replay/sr_1/sessions/s1?userId=user-9&start=2026-11-02T10:00:00.000Z&end=2026-11-02T10:01:30.000Z');
    const watch = [...document.querySelectorAll('a')].find((a) => /Watch in OpenReplay/.test(a.textContent));
    expect(watch.getAttribute('href')).toBe('https://app.openreplay.com/42/session/s1');
    expect(calls.find((c) => c.key.endsWith('/events')).params).toEqual({
      page: 1,
      limit: 50,
      startDate: '2026-11-02T10:00:00.000Z',
      endDate: '2026-11-02T10:01:30.000Z',
    });
    expect(text()).toContain('CLICK');
    expect(text()).toContain('label: Pay');
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('says why there is no replay link', async () => {
    responses['GET /api/v1/session-replay/projects/sr_1/sessions/s1/replay-url'] = fail(409, {
      code: 'OPENREPLAY_PROJECT_ID_MISSING',
      message: 'This project has no OpenReplay project id.',
    });
    await open(SessionReplayViewer, '/hcd/session-replay/sr_1/sessions/s1');
    expect(text()).toContain('This project has no OpenReplay project id.');
  });
});

describe('capture settings form', () => {
  it('round-trips and keeps bodies off when requests are off', () => {
    const form = captureForm({ privacySettings: { maskTextSelector: ['.a', '.b'] }, config: { captureNetwork: false, captureNetworkPayload: true } });
    expect(form.maskTextSelector).toBe('.a\n.b');
    expect(form.defaultInputMode).toBe('obscured');
    const payload = capturePayload(form);
    expect(payload.privacySettings.maskTextSelector).toEqual(['.a', '.b']);
    expect(payload.config).toMatchObject({ captureNetwork: false, captureNetworkPayload: false });
  });
});
