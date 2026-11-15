import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { AnalyticsService } from './analytics.service';
import { UsageDoc } from './component-usage.types';

const NOW = new Date('2026-11-15T12:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

const components = [
  { id: 'button', name: 'Button', status: 'production' },
  { id: 'card', name: 'Card', status: 'production' },
  { id: 'old-modal', name: 'OldModal', status: 'deprecated' },
];
const applications = [
  { id: 'app_a', name: 'App A' },
  { id: 'app_b', name: 'App B' },
  { id: 'app_c', name: 'App C' },
];

function build() {
  const store = new InMemoryStore<UsageDoc>();
  const designSystem = {
    getAllComponents: () => components,
    getComponentById: (id: string) => components.find((c) => c.id === id),
  };
  const registry = { list: async () => applications, listFor: async () => applications };
  const service = new AnalyticsService(designSystem as any, registry as any, store);
  let seq = 0;
  const scan = (applicationId: string, at: string, code: { html?: string; javascript?: string }, target = 'codebase:App.vue') =>
    service.recordApplicationScan({
      scanId: `scan-${++seq}`,
      applicationId,
      applicationName: applications.find((a) => a.id === applicationId)!.name,
      target,
      scannedAt: at,
      inputs: [{ html: code.html ?? '', css: '', javascript: code.javascript ?? '' }],
    });
  return { service, store, scan };
}

describe('AnalyticsService (usage recorded by scans, in Elasticsearch)', () => {
  beforeAll(() => jest.useFakeTimers({ now: NOW, doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] }));
  afterAll(() => jest.useRealTimers());

  it('says there is no data instead of reporting zeros before any scan', async () => {
    const { service } = build();
    expect(await service.getSummary()).toEqual({ usageDataAvailable: false, totalApplications: 3, scannedApplications: 0, lastScanAt: null });
    expect(await service.getComponentPopularity()).toEqual([]);
    expect(await service.getUsageTrends(30)).toEqual([]);
    expect(await service.getDesignDebtMetrics()).toMatchObject({ usageDataAvailable: false, deprecatedComponentsInUse: null, technicalDebtScore: null, recommendations: [] });
    expect((await service.getApplicationAdoption()).every((a) => !a.scanned && a.adoptionRate === null)).toBe(true);
  });

  it('stores one document per scan and per component it found, idempotently', async () => {
    const { service, store } = build();
    const usage = {
      scanId: 'scan-x',
      applicationId: 'app_a',
      applicationName: 'App A',
      target: 'codebase:App.vue',
      scannedAt: daysAgo(1),
      inputs: [{ html: '<Button/><Button/><Card/>', css: '', javascript: '' }],
    };
    await service.recordApplicationScan(usage);
    await service.recordApplicationScan(usage);
    const docs = await store.list();
    expect(docs).toHaveLength(3);
    expect(docs.find((d) => d.kind === 'scan')).toMatchObject({ id: 'scan-x', applicationId: 'app_a', componentCount: 2 });
    expect(docs.find((d) => d.kind === 'component' && d.componentId === 'button')).toMatchObject({ scanId: 'scan-x', usageCount: 2 });
  });

  it('computes popularity, adoption and debt from the latest scan of each target', async () => {
    const { service, scan } = build();
    await scan('app_a', daysAgo(40), { html: '<Button/><OldModal/>' });
    // A later scan of the same file no longer finds OldModal: it stops counting
    await scan('app_a', daysAgo(2), { html: '<Button/><Button/><Card/>' });
    // Another file of the same application adds to it
    await scan('app_a', daysAgo(2), { html: '<Card/>' }, 'codebase:Other.vue');
    await scan('app_b', daysAgo(1), { html: '<Button/><OldModal/><OldModal/>' });

    const popularity = await service.getComponentPopularity('all');
    expect(popularity.map((p) => [p.componentId, p.totalUsage, p.applicationCount, p.adoptionRate])).toEqual([
      ['button', 3, 2, 100],
      ['card', 2, 1, 50],
      ['old-modal', 2, 1, 50],
    ]);
    expect(popularity[0]).toMatchObject({ status: 'production', trend: null, trendChange: null });

    // 30 days ago only the first scan existed: Button was used once, now three times
    const recent = await service.getComponentPopularity('30d');
    expect(recent.find((p) => p.componentId === 'button')).toMatchObject({ totalUsage: 3, trend: 'up', trendChange: 200 });
    expect(recent.find((p) => p.componentId === 'card')).toMatchObject({ trend: null, trendChange: null });

    const usage = await service.getComponentUsageAnalytics('card');
    expect(usage).toMatchObject({ componentName: 'Card', totalUsage: 2, applicationCount: 1, usageDataAvailable: true });
    expect(usage.applications[0].files.sort()).toEqual(['codebase:App.vue', 'codebase:Other.vue']);

    const adoption = await service.getApplicationAdoption();
    expect(adoption.map((a) => [a.applicationId, a.scanned, a.designSystemComponents, a.adoptionRate])).toEqual([
      ['app_a', true, 2, 100],
      ['app_b', true, 1, 50],
      ['app_c', false, null, null],
    ]);

    const debt = await service.getDesignDebtMetrics();
    expect(debt).toMatchObject({ usageDataAvailable: true, deprecatedComponentsInUse: 1, technicalDebtScore: 28.6 });
    expect(debt.deprecatedInUse).toEqual([{ componentId: 'old-modal', componentName: 'OldModal', usage: 2, applicationCount: 1 }]);

    const comparison = await service.getCrossApplicationComparison(['app_a', 'app_b', 'app_c']);
    expect(comparison.map((c) => [c.applicationId, c.scanned, c.uniqueComponents, c.adoptionRate])).toEqual([
      ['app_a', true, 2, 100],
      ['app_b', true, 2, 50],
      ['app_c', false, null, null],
    ]);
    expect(comparison[0].sharedComponents).toEqual(['Button']);

    expect(await service.getSummary()).toMatchObject({ usageDataAvailable: true, scannedApplications: 2, lastScanAt: daysAgo(1) });
  });

  it('builds daily trends from the stored scans', async () => {
    const { service, scan } = build();
    await scan('app_a', daysAgo(2), { html: '<Button/>' });
    await scan('app_b', daysAgo(1), { html: '<Button/><Card/>' });
    await scan('app_a', daysAgo(0), { html: '' });

    const trends = await service.getUsageTrends(7);
    expect(trends).toEqual([
      { date: daysAgo(2).slice(0, 10), totalUsage: 1, uniqueComponents: 1, uniqueApplications: 1 },
      { date: daysAgo(1).slice(0, 10), totalUsage: 3, uniqueComponents: 2, uniqueApplications: 2 },
      // App A's latest scan found nothing
      { date: daysAgo(0).slice(0, 10), totalUsage: 2, uniqueComponents: 2, uniqueApplications: 1 },
    ]);
    // Only the last day in a one-day window
    expect(await service.getUsageTrends(1)).toHaveLength(1);
  });

  it("leaves applications and components the caller can't see out of every figure", async () => {
    const { service, scan } = build();
    await scan('app_a', daysAgo(1), { html: '<Button/><Card/>' });
    await scan('app_b', daysAgo(1), { html: '<Button/>' });
    const visibleApps = [applications[1]] as any;
    const visibleComponents = [components[0]] as any;

    const popularity = await service.getComponentPopularity('all', visibleComponents, visibleApps);
    expect(popularity).toEqual([expect.objectContaining({ componentId: 'button', totalUsage: 1, applicationCount: 1, adoptionRate: 100 })]);
    expect(JSON.stringify(await service.getUsageTrends(30, visibleComponents, visibleApps))).not.toContain('"uniqueComponents":2');
    expect((await service.getComponentUsageAnalytics('card', 'all', visibleApps)).applications).toEqual([]);
  });
});
