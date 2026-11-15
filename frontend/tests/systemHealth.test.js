// System health page: component analytics come from governance scans. Before
// any scan it says so instead of listing components at 0%, and with usage it
// shows each component's real status, not a placeholder.
import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../src/services/api.js';
import SystemHealth from '../src/views/SystemHealth.vue';
import { mountView } from './helpers/mountView.js';

vi.mock('../src/components/admin/IntegrationsPanel.vue', () => ({ default: { render: () => null } }));

const flush = async () => {
  for (let i = 0; i < 12; i++) {
    await Promise.resolve();
    await nextTick();
  }
};

const SCORE = {
  score: 80,
  factors: { componentCoverage: 80, adoptionRate: null, compliance: null, maintenance: 80, accessibility: null },
  notCollected: ['adoptionRate', 'compliance', 'accessibility'],
  timestamp: '2026-11-15T10:00:00.000Z',
  alerts: [],
  recommendations: [],
  inventory: { components: { total: 5, production: 4, inProgress: 0, planned: 0, deprecated: 1 }, tokens: { total: 0, categories: [] } },
};

let responses;
let page;
const originalAdapter = apiClient.defaults.adapter;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  responses = {
    'GET /api/v1/system-health/score': SCORE,
    'GET /api/v1/system-health/trends?days=30': [],
    'GET /api/v1/analytics/summary': { usageDataAvailable: false, totalApplications: 3, scannedApplications: 0, lastScanAt: null },
    'GET /api/v1/analytics/component-popularity?timeframe=30d': [],
    'GET /api/v1/analytics/usage-trends?days=30': [],
    'GET /api/v1/analytics/design-debt': { usageDataAvailable: false, deprecatedComponentsInUse: null, deprecatedInUse: [], technicalDebtScore: null, recommendations: [] },
    'GET /api/v1/analytics/cross-application-comparison': [
      { applicationId: 'app_1', applicationName: 'Shop', scanned: false, componentsUsed: [], uniqueComponents: null, sharedComponents: [], adoptionRate: null },
    ],
  };
  apiClient.defaults.adapter = async (config) => {
    const data = responses[`${config.method.toUpperCase()} ${config.url}`];
    if (data === undefined) return Promise.reject(Object.assign(new Error('not found'), { response: { status: 404, data: {} } }));
    return { status: 200, statusText: 'OK', data, headers: {}, config };
  };
});

afterEach(() => {
  page?.unmount();
  page = null;
  apiClient.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

/** Mounts the page and waits until its last request (cross-application comparison) has landed */
const open = async () => {
  page = await mountView(SystemHealth, { path: '/admin/system-health' });
  await vi.waitFor(() => expect(page.state.loadingAnalytics).toBe(false));
  await vi.waitFor(() => expect(page.state.crossApplicationComparison).toHaveLength(1));
  await flush();
  return document.body.textContent;
};

describe('System health analytics', () => {
  it('says no usage has been recorded instead of showing zeros', async () => {
    const text = await open();
    expect(text).toContain('No component usage recorded yet');
    expect(text).not.toContain('Design debt metrics');
    expect(text).not.toContain('Cross-application comparison');
    expect(text).not.toContain('Custom components');
    expect(text).toContain('The server stores a snapshot once a day');
  });

  it("shows recorded usage with each component's own status", async () => {
    responses['GET /api/v1/analytics/summary'] = { usageDataAvailable: true, totalApplications: 3, scannedApplications: 2, lastScanAt: '2026-11-14T10:00:00.000Z' };
    responses['GET /api/v1/analytics/component-popularity?timeframe=30d'] = [
      { componentId: 'old', componentName: 'OldModal', status: 'deprecated', totalUsage: 4, applicationCount: 1, adoptionRate: 50, trend: null, trendChange: null },
      { componentId: 'button', componentName: 'Button', status: 'production', totalUsage: 3, applicationCount: 2, adoptionRate: 100, trend: null, trendChange: null },
      { componentId: 'card', componentName: 'Card', status: 'production', totalUsage: 0, applicationCount: 0, adoptionRate: 0, trend: null, trendChange: null },
    ];
    responses['GET /api/v1/analytics/design-debt'] = {
      usageDataAvailable: true,
      deprecatedComponentsInUse: 1,
      deprecatedInUse: [{ componentId: 'old', componentName: 'OldModal', usage: 4, applicationCount: 1 }],
      technicalDebtScore: 57.1,
      recommendations: ['Replace 1 deprecated component still in use'],
    };
    const text = await open();
    expect(text).not.toContain('No component usage recorded yet');
    expect(text).toContain('From 2 of 3 applications scanned');
    expect(page.state.topComponents.map((c) => [c.name, c.status])).toEqual([
      ['OldModal', 'deprecated'],
      ['Button', 'production'],
    ]);
    expect(text).toContain('Deprecated');
    expect(text).not.toContain('Production Ready');
    expect(text).toContain('57.1%');
    expect(text).toContain('Not scanned yet');
  });
});
