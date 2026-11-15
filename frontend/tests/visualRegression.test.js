// Visual regression: the results page's status, search and review-date
// filters and sorts work on real fields, the PDF report lists the run and its
// results, and the project page shows analytics for the chosen period, the CI
// setup instead of a fake "run tests", baselines with rollback, and sharing.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import VisualRegressionProject from '../src/views/VisualRegressionProject.vue';
import VisualRegressionResults from '../src/views/VisualRegressionResults.vue';
import { buildRunReportPdf, filterResults, sortResults } from '../src/utils/visualRegressionReport.js';
import { mountView } from './helpers/mountView.js';

// jsPDF stand-in that records the text drawn and the file saved
const drawn = [];
const saved = [];
vi.mock('jspdf', () => ({
  default: class {
    constructor() {
      const internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } };
      return new Proxy(
        {},
        {
          get: (_target, prop) => {
            if (prop === 'internal') return internal;
            if (prop === 'text') return (text) => drawn.push([].concat(text).join(' '));
            if (prop === 'splitTextToSize') return (text) => [text];
            if (prop === 'save') return (name) => saved.push(name);
            return () => undefined;
          },
        },
      );
    }
  },
}));

const flush = async () => {
  for (let i = 0; i < 16; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const RESULTS = [
  { id: 'r1', testName: 'home', status: 'failed', approved: true, approvedAt: '2026-11-12T15:00:00' },
  { id: 'r2', testName: 'about', status: 'passed', approved: true },
  { id: 'r3', testName: 'checkout', status: 'new', approved: false, approvedAt: '2026-11-10T09:00:00' },
  { id: 'r4', testName: 'account', status: 'failed', approved: false },
];

const RUN = {
  id: 'run_1',
  projectId: 'vr_1',
  argosBuildNumber: 7,
  argosStatus: 'changes-detected',
  argosUrl: 'https://app.argos-ci.com/acme/web/builds/7',
  status: 'completed',
  branch: 'feature',
  commitSha: 'abc1234def',
  startedAt: '2026-11-10T10:00:00.000Z',
  resultsSummary: { total: 4, passed: 1, failed: 2, new: 1, removed: 0 },
};

const PROJECT = {
  id: 'vr_1',
  name: 'Web',
  description: 'Storefront',
  argosProjectId: 'acme/web',
  argosBranch: 'develop',
  teamId: 'ws_a',
  workspaceId: 'ws_a',
  config: {},
  createdAt: '2026-11-01T10:00:00.000Z',
  hasWebhookSecret: false,
};

describe('result filters and sorts', () => {
  it('filters by status and search text', () => {
    expect(filterResults(RESULTS, { status: 'failed' }).map((r) => r.id)).toEqual(['r1', 'r4']);
    expect(filterResults(RESULTS, { query: 'CHECK' }).map((r) => r.id)).toEqual(['r3']);
  });

  it('filters by review date, both days included, leaving out unreviewed results', () => {
    expect(filterResults(RESULTS, { reviewedFrom: '2026-11-10', reviewedTo: '2026-11-10' }).map((r) => r.id)).toEqual(['r3']);
    expect(filterResults(RESULTS, { reviewedFrom: '2026-11-11' }).map((r) => r.id)).toEqual(['r1']);
    expect(filterResults(RESULTS, { reviewedTo: '2026-11-12' }).map((r) => r.id)).toEqual(['r1', 'r3']);
    expect(filterResults(RESULTS, { reviewedFrom: '2026-11-13' })).toEqual([]);
  });

  it('sorts by review date with unreviewed results last in both directions', () => {
    expect(sortResults(RESULTS, 'reviewed', 'asc').map((r) => r.id)).toEqual(['r3', 'r1', 'r2', 'r4']);
    expect(sortResults(RESULTS, 'reviewed', 'desc').map((r) => r.id)).toEqual(['r1', 'r3', 'r2', 'r4']);
  });

  it('sorts by name and by status', () => {
    expect(sortResults(RESULTS, 'name').map((r) => r.testName)).toEqual(['about', 'account', 'checkout', 'home']);
    expect(sortResults(RESULTS, 'status').map((r) => r.id)).toEqual(['r4', 'r1', 'r3', 'r2']);
  });
});

describe('PDF report', () => {
  beforeEach(() => {
    drawn.length = 0;
  });

  it('lists the build, its counts and every result with its review', () => {
    buildRunReportPdf({ project: PROJECT, run: RUN, results: RESULTS });
    const text = drawn.join('\n');
    expect(text).toContain('Project: Web');
    expect(text).toContain('Argos project: acme/web');
    expect(text).toContain('Argos build #7');
    expect(text).toContain('Status: Changes to review');
    expect(text).toContain('Commit: abc1234def');
    expect(text).toContain('4 compared: 1 passed, 2 changed, 1 new, 0 removed');
    expect(text).toContain('2 reviewed here');
    expect(text).toMatch(/home — Changed, approved /);
    expect(text).toContain('account — Changed, not reviewed');
    expect(text).toMatch(/checkout — New, changes requested /);
  });

  it('says when Argos has not reported screenshots instead of inventing counts', () => {
    buildRunReportPdf({ project: PROJECT, run: { ...RUN, resultsSummary: undefined }, results: [] });
    expect(drawn.join('\n')).toContain('Argos has not reported this build’s screenshots yet.');
  });
});

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;
const fail = (status, message) => Object.assign(new Error(message), { response: { status, data: { message } } });

beforeEach(() => {
  calls = [];
  saved.length = 0;
  drawn.length = 0;
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    'GET /api/v1/visual-regression/projects/vr_1': structuredClone(PROJECT),
    'GET /api/v1/visual-regression/projects/vr_1/runs': { data: [RUN], pagination: { total: 1 } },
    'GET /api/v1/visual-regression/projects/vr_1/analytics': {
      totalRuns: 3,
      passedRuns: 1,
      changedRuns: 1,
      failedRuns: 1,
      averageDuration: 42000,
      trends: [{ date: '2026-11-10', passed: 1, changed: 1, failed: 1 }],
    },
    'GET /api/v1/visual-regression/projects/vr_1/ci-setup': {
      uploadCommand: "npx @argos-ci/cli upload ./screenshots \\\n  --reference-branch 'develop'",
      playwrightConfig: 'export default defineConfig({});',
      screenshotHelper: 'await argosScreenshot(page, name, { root: "./screenshots" });',
      reference: { kind: 'branch', branch: 'develop' },
    },
    'GET /api/v1/visual-regression/projects/vr_1/baselines': [
      { id: 'b2', name: 'v2', runId: 'run_2', argosBuildNumber: 8, commitSha: 'fff9999', createdAt: '2026-11-11T10:00:00.000Z', current: true },
      { id: 'b1', name: 'v1', runId: 'run_1', argosBuildNumber: 7, commitSha: 'abc1234', createdAt: '2026-11-10T10:00:00.000Z', current: false },
    ],
    'GET /api/v1/visual-regression/projects/vr_1/baselines/history': [],
    'POST /api/v1/visual-regression/projects/vr_1/baselines/b1/rollback': { id: 'b1', current: true },
    'GET /api/v1/visual-regression/projects/vr_1/shares': [],
    'POST /api/v1/visual-regression/projects/vr_1/share': { userId: 'usr_2', name: 'Pat', role: 'editor' },
    'GET /api/v1/visual-regression/runs/run_1': RUN,
    'GET /api/v1/visual-regression/runs/run_1/results': { data: RESULTS, pagination: { hasNext: false } },
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

const text = () => document.body.textContent.replace(/\s+/g, ' ');
const buttonNamed = (name) => [...document.querySelectorAll('button')].find((b) => b.textContent.replace(/\s+/g, ' ').trim().startsWith(name));

describe('Results page', () => {
  const openResults = async () => {
    page = await mountView(VisualRegressionResults, {
      path: '/tools/visual-regression/vr_1/runs/run_1',
      routes: [{ path: '/tools/visual-regression/:id/runs/:runId', component: VisualRegressionResults }],
    });
    // mountView mounts the component itself; the route only supplies params
    await flush();
    return page;
  };

  it('applies the review-date filter and sort to what it shows', async () => {
    await openResults();
    expect(document.querySelector('h1').textContent).toContain('Build #7');
    const shown = () => page.state.filteredResults.map((r) => r.id);
    expect(shown()).toEqual(['r2', 'r4', 'r3', 'r1']);
    page.state.dateRange.from = '2026-11-11';
    await flush();
    expect(shown()).toEqual(['r1']);
    page.state.dateRange.from = '';
    page.state.sortBy = 'reviewed';
    page.state.sortOrder = 'desc';
    await flush();
    expect(shown()).toEqual(['r1', 'r3', 'r2', 'r4']);
  });

  it('downloads a PDF of the results shown', async () => {
    await openResults();
    buttonNamed('Download PDF').click();
    await flush();
    expect(saved).toEqual(['visual-regression-build-7.pdf']);
    expect(drawn.join('\n')).toContain('Project: Web');
  });
});

describe('Project page', () => {
  const openProject = async () => {
    page = await mountView(VisualRegressionProject, {
      path: '/tools/visual-regression/vr_1',
      routes: [{ path: '/tools/visual-regression/:id', component: { render: () => null } }],
    });
    await flush();
    return page;
  };

  it('shows the analytics and offers the CI setup instead of starting runs', async () => {
    await openProject();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    const body = text();
    expect(body).toContain('Builds3');
    expect(body).toContain('Average test time42 s');
    expect(buttonNamed('Run tests')).toBeUndefined();
    expect(calls.some((c) => c.key.startsWith('POST') && c.key.endsWith('/runs'))).toBe(false);

    page.state.activeTab = 'ci';
    await flush();
    expect(text()).toContain("npx @argos-ci/cli upload ./screenshots");
  });

  it('limits runs and analytics to the chosen days', async () => {
    await openProject();
    page.state.range.from = '2026-11-10';
    page.state.range.to = '2026-11-12';
    await flush();
    const analytics = calls.filter((c) => c.key.endsWith('/analytics')).at(-1);
    expect(analytics.params).toEqual({ startDate: '2026-11-10', endDate: '2026-11-12' });
    const runs = calls.filter((c) => c.key.endsWith('/runs')).map((c) => c.params);
    expect(runs).toContainEqual({ page: 1, limit: 100, from: '2026-11-10', to: '2026-11-12' });
  });

  it('rolls back to an earlier baseline', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await openProject();
    page.state.activeTab = 'baselines';
    await flush();
    expect(text()).toContain('v2');
    buttonNamed('Roll back').click();
    await flush();
    expect(calls.map((c) => c.key)).toContain('POST /api/v1/visual-regression/projects/vr_1/baselines/b1/rollback');
    expect(text()).toContain('“v1” is the current baseline again.');
  });

  it('shares the project with a person by email and role', async () => {
    await openProject();
    page.state.activeTab = 'settings';
    await flush();
    const email = document.querySelector('input[type="email"]');
    email.value = 'pat@example.com';
    email.dispatchEvent(new Event('input'));
    const role = document.querySelector('#share-role');
    role.value = 'editor';
    role.dispatchEvent(new Event('change'));
    await flush();
    document.querySelector('#vr-share').dispatchEvent(new Event('submit'));
    await flush();
    expect(calls.find((c) => c.key === 'POST /api/v1/visual-regression/projects/vr_1/share').data).toEqual({ email: 'pat@example.com', role: 'editor' });
    expect(text()).toContain('Shared with Pat as editor.');
  });
});
