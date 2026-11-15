import { UsageState } from '../analytics/usage-model';
import { AuthPrincipal } from '../auth/principal';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { HealthSnapshotDoc } from './health-snapshots';
import { SystemHealthSnapshotScheduler } from './system-health.scheduler';
import { SystemHealthService } from './system-health.service';

type Component = { id: string; name: string; status: string };

const person = (id: string) => ({ type: 'user', id, email: `${id}@example.com`, name: id, roles: [], permissions: new Set(), mustChangePassword: false }) as unknown as AuthPrincipal;
const admin = person('admin');

/**
 * The world as SystemHealthService reads it. `visible` limits what a
 * non-admin caller sees: its components, applications and reports.
 */
function build(options: {
  components?: Component[];
  tokens?: Array<{ name: string; category: string }>;
  /** applicationId -> latest accessibility report score */
  reported?: Record<string, number>;
  /** Verified WCAG level per reported application */
  levels?: Record<string, string>;
  /** applicationId -> components a scan found (an empty list: scanned, none found) */
  usage?: Record<string, Record<string, number>>;
  visible?: { components: string[]; applications: string[] };
}) {
  const components = options.components ?? [];
  const reported = options.reported ?? {};
  const usage = options.usage ?? {};
  const allApps = [...new Set([...Object.keys(reported), ...Object.keys(usage)])];
  const scope = (principal: AuthPrincipal) => (principal.id === 'admin' || !options.visible ? null : options.visible);
  const summary = (apps: string[]) => ({
    applications: apps
      .filter((id) => id in reported)
      .map((id) => ({ applicationId: id, applicationName: id, complianceScore: reported[id], wcagLevel: options.levels?.[id] ?? null })),
  });
  const state = (apps: string[]): UsageState => {
    const byComponent: UsageState['byComponent'] = new Map();
    const scannedApplications = new Map();
    for (const appId of apps.filter((id) => id in usage)) {
      scannedApplications.set(appId, { applicationName: appId, lastScan: '2026-11-01T00:00:00.000Z' });
      for (const [componentId, count] of Object.entries(usage[appId])) {
        if (!byComponent.has(componentId)) byComponent.set(componentId, []);
        byComponent.get(componentId)!.push({
          componentId,
          componentName: componentId,
          applicationId: appId,
          applicationName: appId,
          usageCount: count,
          targets: ['codebase:App.vue'],
          firstSeen: '2026-11-01T00:00:00.000Z',
          lastSeen: '2026-11-01T00:00:00.000Z',
        });
      }
    }
    return { scannedApplications, byComponent };
  };

  const designSystem = { getAllComponents: () => components, getAllTokens: () => options.tokens ?? [] };
  const reports = {
    getMultiApplicationComplianceSummary: () => summary(allApps),
    getComplianceSummary: async (principal: AuthPrincipal) => summary(scope(principal)?.applications ?? allApps),
  };
  const analytics = {
    applicationsVisibleTo: async (principal: AuthPrincipal) => (scope(principal)?.applications ?? allApps).map((id) => ({ id, name: id })),
    currentUsage: async (apps?: Array<{ id: string }>) => state(apps ? apps.map((a) => a.id) : allApps),
  };
  const access = { list: async (principal: AuthPrincipal) => components.filter((c) => !scope(principal) || scope(principal)!.components.includes(c.id)) };
  const snapshots = new InMemoryStore<HealthSnapshotDoc>();
  const service = new SystemHealthService(designSystem as any, reports as any, analytics as any, access as any, snapshots);
  return { service, snapshots };
}

const at = (iso: string) => new Date(iso);

describe('SystemHealthService (measured data only)', () => {
  it('starts with no history, and reading a score records nothing', async () => {
    const { service, snapshots } = build({ components: [{ id: 'button', name: 'Button', status: 'production' }] });
    await service.calculateHealthScore(admin);
    await service.getDashboard(admin);
    expect(await service.getHealthScoreTrends(admin, 90)).toEqual([]);
    expect(snapshots.docs.size).toBe(0);
  });

  it('reports unmeasured factors as not collected and leaves them out of the score', async () => {
    const empty = await build({}).service.calculateHealthScore(admin);
    expect(empty.score).toBeNull();
    expect(empty.factors).toEqual({ componentCoverage: null, adoptionRate: null, compliance: null, maintenance: null, accessibility: null });
    expect(empty.notCollected).toHaveLength(5);

    const { service } = build({
      components: [
        { id: 'button', name: 'Button', status: 'production' },
        { id: 'card', name: 'Card', status: 'deprecated' },
      ],
    });
    const score = await service.calculateHealthScore(admin);
    expect(score.factors).toMatchObject({ componentCoverage: 50, maintenance: 75, adoptionRate: null, compliance: null, accessibility: null });
    expect(score.notCollected).toEqual(['adoptionRate', 'compliance', 'accessibility']);
    // (50 * 0.25 + 75 * 0.15) / 0.4
    expect(score.score).toBe(59.4);
    expect(service.generateRecommendations(score).map((r) => r.category)).not.toContain('accessibility');
  });

  it('computes adoption from the usage scans recorded, and compliance from accessibility reports', async () => {
    const { service } = build({
      components: [
        { id: 'button', name: 'Button', status: 'production' },
        { id: 'card', name: 'Card', status: 'production' },
      ],
      reported: { app_1: 80, app_2: 90 },
      usage: { app_1: { button: 12 }, app_2: { button: 3 } },
    });
    const score = await service.calculateHealthScore(admin);
    expect(score.factors).toEqual({ componentCoverage: 100, adoptionRate: 50, compliance: 85, maintenance: 100, accessibility: 85 });
    expect(score.notCollected).toEqual([]);

    const report = await service.generateAuditReport(admin);
    expect(report.components.topUsed).toEqual([{ name: 'Button', usage: 15, applications: 2 }]);
    expect(report.detailedMetrics.adoption.byComponent).toEqual([
      { name: 'Button', adoptionRate: 100 },
      { name: 'Card', adoptionRate: 0 },
    ]);
  });

  it('counts a scanned application that uses no component as adoption data', async () => {
    const { service } = build({ components: [{ id: 'button', name: 'Button', status: 'production' }], usage: { app_1: {} } });
    expect((await service.calculateHealthScore(admin)).factors.adoptionRate).toBe(0);
  });

  it("limits every figure to the caller's components, applications and reports", async () => {
    const { service } = build({
      components: [
        { id: 'button', name: 'Button', status: 'production' },
        { id: 'secret', name: 'Secret', status: 'deprecated' },
      ],
      reported: { mine: 60, theirs: 100 },
      usage: { mine: { button: 1 }, theirs: { secret: 9 } },
      visible: { components: ['button'], applications: ['mine'] },
    });
    const outsider = person('usr_out');
    const score = await service.calculateHealthScore(outsider);
    expect(score.factors).toEqual({ componentCoverage: 100, adoptionRate: 100, compliance: 60, maintenance: 100, accessibility: 60 });
    const report = await service.generateAuditReport(outsider);
    expect(JSON.stringify(report)).not.toMatch(/Secret|theirs/);
    expect((await service.getDashboard(outsider)).inventory.components.total).toBe(1);

    expect((await service.calculateHealthScore(admin)).factors).toMatchObject({ compliance: 80, adoptionRate: 100, componentCoverage: 50 });
  });

  it('stores one snapshot a day and recomputes each caller’s trend from it', async () => {
    const { service, snapshots } = build({
      components: [
        { id: 'button', name: 'Button', status: 'production' },
        { id: 'secret', name: 'Secret', status: 'deprecated' },
      ],
      reported: { mine: 60, theirs: 100 },
      visible: { components: ['button'], applications: ['mine'] },
    });
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(await service.takeSnapshot(yesterday)).toBe(true);
    expect(await service.takeSnapshot(yesterday)).toBe(false);
    expect(snapshots.docs.size).toBe(1);
    const stored = [...snapshots.docs.values()][0].doc;
    expect(stored).toMatchObject({ id: `health-${yesterday.toISOString().slice(0, 10)}`, components: [{ id: 'button' }, { id: 'secret' }] });

    const outsider = person('usr_out');
    const [mine] = await service.getHealthScoreTrends(outsider, 7);
    expect(mine.factors).toMatchObject({ componentCoverage: 100, compliance: 60 });
    const [all] = await service.getHealthScoreTrends(admin, 7);
    expect(all.factors).toMatchObject({ componentCoverage: 50, compliance: 80 });

    // Today's score is compared with yesterday's snapshot, for the same caller
    expect((await service.calculateHealthScore(outsider)).trend).toMatchObject({ previousScore: mine.score, change: 0, direction: 'stable' });
  });

  it('the scheduler stores the snapshot and survives a failing store', async () => {
    const { service, snapshots } = build({ components: [{ id: 'button', name: 'Button', status: 'production' }] });
    const scheduler = new SystemHealthSnapshotScheduler(service);
    await scheduler.tick(at('2026-11-14T08:00:00Z'));
    await scheduler.tick(at('2026-11-14T09:00:00Z'));
    await scheduler.tick(at('2026-11-15T08:00:00Z'));
    expect([...snapshots.docs.keys()].sort()).toEqual(['health-2026-11-14', 'health-2026-11-15']);

    jest.spyOn(snapshots, 'create').mockRejectedValueOnce(new Error('Elasticsearch is down'));
    await expect(scheduler.tick(at('2026-11-16T08:00:00Z'))).resolves.toBeUndefined();
    expect(snapshots.docs.has('health-2026-11-16')).toBe(false);
  });

  it('reports real token counts', async () => {
    const report = await build({
      components: [{ id: 'button', name: 'Button', status: 'production' }],
      tokens: [
        { name: 'color.primary', category: 'colors' },
        { name: 'space.md', category: 'spacing' },
        { name: 'color.secondary', category: 'colors' },
      ],
    }).service.generateAuditReport(admin);
    expect(report.components.topUsed).toEqual([]);
    expect(report.detailedMetrics.adoption).toEqual({ overallRate: null, byComponent: [], trend: [] });
    expect(report.detailedMetrics.tokens).toEqual({ total: 3, categories: 2, usage: null });
    expect(report.detailedMetrics.compliance).toMatchObject({ score: null, level: 'not-collected' });
  });

  it('labels accessibility with the weakest level the reports verified, never a level derived from the score', async () => {
    // Perfect scores, but one application's AA criteria still need review
    const report = await build({ reported: { a: 100, b: 100 }, levels: { a: 'AA', b: 'A' } }).service.generateAuditReport(admin);
    expect(report.detailedMetrics.accessibility).toEqual({ score: 100, wcagLevel: 'A' });
    const unverified = await build({ reported: { a: 100 }, levels: { a: 'Unverified' } }).service.generateAuditReport(admin);
    expect(unverified.detailedMetrics.accessibility.wcagLevel).toBe('Unverified');
    expect((await build({}).service.generateAuditReport(admin)).detailedMetrics.accessibility.wcagLevel).toBeNull();
  });
});
