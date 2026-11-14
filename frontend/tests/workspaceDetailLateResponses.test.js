// R35: WorkspaceDetail loads the workspace, then its analytics, components,
// applications and the workspace list. Responses that arrive after the user
// has moved to another workspace (or after a newer request for the same data,
// or after leaving the page) must not overwrite what is shown.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import WorkspaceDetail from '../src/views/WorkspaceDetail.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

const ws = (id) => ({
  id,
  name: `WS ${id}`,
  slug: id,
  members: [],
  settings: {},
  metadata: {},
  myRole: 'owner',
  effectiveRole: 'owner',
  ownerId: 'u',
});

// Per-workspace response delays (ms) for each request kind.
let delays;
let analyticsVersion;
let page;
const originalAdapter = apiClient.defaults.adapter;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  delays = { workspace: {}, slow: {} };
  analyticsVersion = 0;
  apiClient.defaults.adapter = async (config) => {
    const reply = async (data, ms = 0) => {
      await sleep(ms);
      return { status: 200, statusText: 'OK', data, headers: {}, config };
    };
    const { url } = config;
    let m;
    if ((m = /^\/api\/v1\/workspaces\/(\w)$/.exec(url))) return reply(ws(m[1]), delays.workspace[m[1]] ?? 5);
    if ((m = /^\/api\/v1\/workspaces\/(\w)\/components$/.exec(url))) {
      return reply({ components: [{ id: `c-${m[1]}`, name: `Comp ${m[1]}`, workspaceId: m[1] }] }, delays.slow[m[1]] ?? 10);
    }
    if ((m = /^\/api\/v1\/workspaces\/(\w)\/analytics$/.exec(url))) {
      // Each analytics request answers with its own sequence number.
      analyticsVersion += 1;
      const version = analyticsVersion;
      const ms = typeof delays.analytics === 'function' ? delays.analytics(version) : delays.slow[m[1]] ?? 10;
      return reply({ workspace: m[1], version, totalComponents: version, adoptionMetrics: {} }, ms);
    }
    if (url === '/api/v1/applications') {
      const w = config.params.workspaceId;
      return reply({ applications: [{ id: `app-${w}`, name: `App ${w}`, workspaceId: w }] }, delays.slow[w] ?? 10);
    }
    if (url === '/api/v1/workspaces') return reply([ws('A'), ws('B')], delays.list ?? 5);
    throw new Error(`unexpected request ${url}`);
  };
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
  vi.useRealTimers();
});

const open = async (id) => {
  page = await mountView(WorkspaceDetail, {
    path: `/admin/workspaces/${id}`,
    routes: [{ path: '/admin/workspaces/:id', component: WorkspaceDetail }],
  });
  return page.state;
};

const shown = (state) => ({
  workspace: state.workspace?.id ?? null,
  components: state.components.map((c) => c.id),
  applications: state.applications.map((a) => a.id),
  analytics: state.analytics?.workspace ?? null,
});

describe('WorkspaceDetail late responses', () => {
  it('loads a workspace and its data', async () => {
    const state = await open('A');
    await vi.advanceTimersByTimeAsync(50);
    expect(shown(state)).toEqual({ workspace: 'A', components: ['c-A'], applications: ['app-A'], analytics: 'A' });
    expect(state.loading).toBe(false);
  });

  it("ignores the previous workspace's slow responses after switching workspace", async () => {
    delays.slow = { A: 300, B: 10 };
    const state = await open('A');
    await vi.advanceTimersByTimeAsync(30); // A loaded; its data still in flight
    expect(state.workspace?.id).toBe('A');

    await page.router.push('/admin/workspaces/B');
    await vi.advanceTimersByTimeAsync(50); // B's data arrives
    expect(shown(state)).toEqual({ workspace: 'B', components: ['c-B'], applications: ['app-B'], analytics: 'B' });

    await vi.advanceTimersByTimeAsync(600); // then A's
    expect(shown(state)).toEqual({ workspace: 'B', components: ['c-B'], applications: ['app-B'], analytics: 'B' });
  });

  it('ignores a slow workspace response for the workspace the user already left', async () => {
    delays.workspace = { A: 300, B: 5 };
    const state = await open('A');
    await vi.advanceTimersByTimeAsync(10);
    await page.router.push('/admin/workspaces/B');
    await vi.advanceTimersByTimeAsync(600);
    expect(shown(state)).toEqual({ workspace: 'B', components: ['c-B'], applications: ['app-B'], analytics: 'B' });
    expect(state.loading).toBe(false);
  });

  it('keeps the newest analytics when an older request for the same workspace answers last', async () => {
    const state = await open('A');
    await vi.advanceTimersByTimeAsync(50);
    expect(state.analytics.version).toBe(1);

    // Request 2 is slow, request 3 is fast: 3 must win.
    delays.analytics = (version) => (version === 2 ? 300 : 10);
    state.loadAnalytics();
    state.loadAnalytics();
    await vi.advanceTimersByTimeAsync(50);
    expect(state.analytics.version).toBe(3);
    await vi.advanceTimersByTimeAsync(400);
    expect(state.analytics.version).toBe(3);
  });

  it('writes nothing after the page is left', async () => {
    delays.slow = { A: 300 };
    const state = await open('A');
    await vi.advanceTimersByTimeAsync(30);
    page.unmount();
    page = null;
    await vi.advanceTimersByTimeAsync(600);
    await nextTick();
    expect(shown(state)).toEqual({ workspace: 'A', components: [], applications: [], analytics: null });
  });
});
