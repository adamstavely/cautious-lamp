// Accessibility reports page: the PDF carries the same caveats as the
// dashboard and only shows a trend against an earlier comparable report; the
// Schedules tab refreshes while open; the summary doesn't link a report the
// viewer can't open.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import AccessibilityReports from '../src/views/AccessibilityReports.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/DocumentationDrawer.vue', () => ({ default: { render: () => null } }));

// jsPDF stand-in that records the text drawn
const drawn = [];
vi.mock('jspdf', () => ({
  default: class {
    constructor() {
      const internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 }, pages: [null, {}] };
      return new Proxy(
        {},
        {
          get: (_target, prop) => {
            if (prop === 'internal') return internal;
            if (prop === 'text') return (text) => drawn.push([].concat(text).join(' '));
            if (prop === 'splitTextToSize') return (text) => [text];
            if (prop === 'getTextWidth') return () => 10;
            return () => undefined;
          },
        },
      );
    }
  },
}));

const flush = async () => {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

let responses;
let calls;
let page;
const originalAdapter = apiClient.defaults.adapter;

beforeEach(() => {
  drawn.length = 0;
  calls = [];
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    '/api/v1/applications': { applications: [{ id: 'app-1', name: 'App one' }] },
    '/api/v1/accessibility-reports/reports': [],
    '/api/v1/accessibility-reports/schedules': [{ id: 'sched-1', applicationId: 'app-1', frequency: 'daily', time: '09:00', enabled: true, nextRun: '2026-11-15T09:00:00.000Z', lastReportId: 'report-a' }],
    '/api/v1/accessibility-reports/slas': [],
    '/api/v1/accessibility-reports/summary': {
      totalApplications: 1,
      reportedApplications: 1,
      compliantApplications: 0,
      atRiskApplications: 0,
      nonCompliantApplications: 0,
      needsReviewApplications: 0,
      unassessedApplications: 1,
      averageScore: 80,
      applications: [{ applicationId: 'app-1', applicationName: 'Moved app', complianceScore: 80, wcagLevel: 'A', totalIssues: 2, criticalIssues: 0, highIssues: 1, slaStatus: 'no-sla' }],
    },
  };
  apiClient.defaults.adapter = async (config) => {
    calls.push(config.url);
    const data = responses[config.url];
    if (data === undefined) return Promise.reject(Object.assign(new Error('not found'), { response: { status: 404, data: {} } }));
    return { status: 200, statusText: 'OK', data, headers: {}, config };
  };
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const report = (overrides = {}) => ({
  id: 'report-1',
  applicationId: 'app-1',
  applicationName: 'App one',
  generatedAt: '2026-11-14T10:00:00.000Z',
  source: 'url',
  url: 'https://example.com/',
  complianceScore: 80,
  wcagLevel: 'A',
  totalIssues: 2,
  criticalIssues: 0,
  highIssues: 1,
  moderateIssues: 1,
  lowIssues: 0,
  issuesByCategory: {},
  wcagCriteria: [],
  prioritizedFixes: [],
  checks: [],
  trend: { scoreChange: 0, issuesChange: 0, newIssues: 0, fixedIssues: 0 },
  conformance: { status: 'needs-review', reviewCriteria: ['1.4.3'], rendered: true },
  ...overrides,
});

describe('Accessibility reports page', () => {
  it("the PDF of a first report shows the conformance caveats and no trend", async () => {
    page = await mountView(AccessibilityReports);
    await flush();
    page.state.currentReport = report();
    page.state.exportToPDF();
    const text = drawn.join('\n');
    expect(text).toMatch(/Needs a manual check: 1\.4\.3/);
    expect(text).toMatch(/Automated checks can't prove WCAG conformance/);
    expect(text).toMatch(/First report of this kind/);
    expect(text).not.toMatch(/Trend Analysis/);
  });

  it('the PDF trend is in points, against the earlier comparable report', async () => {
    page = await mountView(AccessibilityReports);
    await flush();
    page.state.currentReport = report({ previousReportId: 'report-0', trend: { scoreChange: 5, issuesChange: -1, newIssues: 0, fixedIssues: 1 } });
    page.state.exportToPDF();
    const text = drawn.join('\n');
    expect(text).toMatch(/\+5\.0 pts/);
    expect(text).toMatch(/Score Change: \+5\.0 points/);
    expect(text).not.toMatch(/\+5\.0%/);
  });

  it("doesn't link a summary row whose latest report the viewer can't open", async () => {
    page = await mountView(AccessibilityReports);
    await flush();
    page.state.activeTab = 'multi-app';
    await flush();
    const row = [...document.querySelectorAll('tbody tr')].find((tr) => tr.textContent.includes('Moved app'));
    expect(row).toBeDefined();
    expect(row.querySelector('button.link-button')).toBeNull();
    expect(row.textContent).toMatch(/belongs to another workspace/);
  });

  it('refreshes schedules every 30 seconds while the Schedules tab is open, and reloads reports after a run', async () => {
    vi.useFakeTimers();
    page = await mountView(AccessibilityReports);
    await flush();
    page.state.activeTab = 'schedules';
    await flush();
    const scheduleCalls = () => calls.filter((url) => url === '/api/v1/accessibility-reports/schedules').length;
    const reportCalls = () => calls.filter((url) => url === '/api/v1/accessibility-reports/reports').length;
    const [schedulesBefore, reportsBefore] = [scheduleCalls(), reportCalls()];

    responses['/api/v1/accessibility-reports/schedules'] = [{ ...responses['/api/v1/accessibility-reports/schedules'][0], lastReportId: 'report-b' }];
    await vi.advanceTimersByTimeAsync(30_000);
    await flush();
    expect(scheduleCalls()).toBe(schedulesBefore + 1);
    expect(reportCalls()).toBe(reportsBefore + 1);

    page.state.activeTab = 'dashboard';
    await flush();
    const afterLeaving = scheduleCalls();
    await vi.advanceTimersByTimeAsync(90_000);
    expect(scheduleCalls()).toBe(afterLeaving);
  });
});
