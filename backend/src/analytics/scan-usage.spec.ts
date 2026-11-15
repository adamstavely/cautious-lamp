import { AuthPrincipal } from '../auth/principal';
import { SYSTEM_SCOPE } from '../governance/evidence-access';
import { MetaDoc } from '../governance/governance-stores';
import { GovernanceRule, ScanRecord } from '../governance/governance.types';
import { RulesService } from '../governance/rules.service';
import { ScansService } from '../governance/scans.service';
import { FakeApplications, FakeDesignSystem } from '../governance/testing/fakes';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { AnalyticsService } from './analytics.service';
import { UsageDoc } from './component-usage.types';

const scanner = { type: 'service', id: 'ci', name: 'CI', email: null, roles: [], permissions: new Set(), mustChangePassword: false } as unknown as AuthPrincipal;

const components = [
  { id: 'button', name: 'Button', status: 'production' },
  { id: 'card', name: 'Card', status: 'production' },
];

/** Real ScansService recording into a real AnalyticsService, both over in-memory stores */
function setup() {
  const usageStore = new InMemoryStore<UsageDoc>();
  const registry = [
    { id: 'shop', name: 'Shop' },
    { id: 'blog', name: 'Blog' },
  ];
  const analytics = new AnalyticsService(
    { getAllComponents: () => components, getComponentById: (id: string) => components.find((c) => c.id === id) } as any,
    { list: async () => registry, listFor: async () => registry } as any,
    usageStore,
  );
  const apps = new FakeApplications(registry);
  const rules = new RulesService(new InMemoryStore<GovernanceRule>(), new InMemoryStore<MetaDoc>());
  const scans = new ScansService(rules, new InMemoryStore<ScanRecord>(), apps, new FakeDesignSystem(), { scopeFor: async () => SYSTEM_SCOPE }, analytics);
  const scan = (applicationId: string, html: string, file = 'App.vue') =>
    scans.scan({ scope: 'application', applicationId, ruleIds: ['ds-component-import'], codebase: { html, file } }, scanner);
  return { analytics, scans, scan, usageStore };
}

describe('Component usage recorded by governance application scans', () => {
  it('records each scan per application and component, and analytics reads it back', async () => {
    const { analytics, scan, usageStore } = setup();
    expect(await analytics.getComponentPopularity()).toEqual([]);

    const first = await scan('shop', '<template><Button/><Button/><Card/></template>');
    await scan('blog', '<template><Button/></template>');

    const docs = await usageStore.list();
    expect(docs.filter((d) => d.kind === 'scan').map((d) => d.scanId).sort()).toContain(first.id);
    expect(docs.find((d) => d.kind === 'component' && d.applicationId === 'shop' && d.componentId === 'button')).toMatchObject({
      scanId: first.id,
      usageCount: 2,
      target: 'codebase:App.vue',
    });

    const popularity = await analytics.getComponentPopularity();
    expect(popularity.map((p) => [p.componentId, p.totalUsage, p.applicationCount])).toEqual([
      ['button', 3, 2],
      ['card', 1, 1],
    ]);
    expect(await analytics.getSummary()).toMatchObject({ usageDataAvailable: true, scannedApplications: 2 });

    // Card removed from the shop's App.vue: the next scan of that file drops it
    await scan('shop', '<template><Button/></template>');
    expect((await analytics.getComponentPopularity()).find((p) => p.componentId === 'card')).toMatchObject({ totalUsage: 0, applicationCount: 0 });
  });

  it("doesn't record design-system scans, and a failing recorder doesn't fail the scan", async () => {
    const { scans, scan, usageStore, analytics } = setup();
    jest.spyOn(analytics, 'recordApplicationScan').mockRejectedValueOnce(new Error('Elasticsearch is down'));
    const result = await scan('shop', '<Button/>');
    expect(result.id).toMatch(/^scan-/);
    expect(usageStore.docs.size).toBe(0);
    await expect(scans.scan({ scope: 'design-system', ruleIds: ['ds-component-import'] }, scanner, { system: true })).rejects.toThrow(/no components/);
    expect(usageStore.docs.size).toBe(0);
  });
});
