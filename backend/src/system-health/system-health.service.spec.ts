import { SystemHealthService } from './system-health.service';

function build(options: {
  components?: Array<{ id: string; name: string; status: string }>;
  tokens?: Array<{ name: string; category: string }>;
  reported?: number[];
  usage?: Record<string, Array<{ applicationId: string; usageCount: number }>>;
}) {
  const designSystem = {
    getAllComponents: () => options.components ?? [],
    getAllTokens: () => options.tokens ?? [],
  };
  const reports = {
    getMultiApplicationComplianceSummary: () => {
      const reported = options.reported ?? [];
      return {
        applications: reported.map((score, i) => ({ applicationId: `app_${i}`, complianceScore: score })),
        reportedApplications: reported.length,
        averageScore: reported.length ? reported.reduce((a, b) => a + b, 0) / reported.length : 0,
      };
    },
  };
  const analytics = {
    getComponentUsage: (id: string) => options.usage?.[id] ?? [],
    getUsageTrends: () => (options.usage ? [{ date: '2026-01-01' }] : []),
  };
  return new SystemHealthService(designSystem as any, reports as any, analytics as any);
}

describe('SystemHealthService (measured data only)', () => {
  it('starts with no history instead of generated demo scores', () => {
    const service = build({});
    expect(service.getHealthScoreTrends(90)).toEqual([]);
  });

  it('reports unmeasured factors as not collected and leaves them out of the score', () => {
    const empty = build({}).calculateHealthScore();
    expect(empty.score).toBeNull();
    expect(empty.factors).toEqual({ componentCoverage: null, adoptionRate: null, compliance: null, maintenance: null, accessibility: null });
    expect(empty.notCollected).toHaveLength(5);

    const service = build({
      components: [
        { id: 'button', name: 'Button', status: 'production' },
        { id: 'card', name: 'Card', status: 'deprecated' },
      ],
    });
    const score = service.calculateHealthScore();
    expect(score.factors).toMatchObject({ componentCoverage: 50, maintenance: 75, adoptionRate: null, compliance: null, accessibility: null });
    expect(score.notCollected).toEqual(['adoptionRate', 'compliance', 'accessibility']);
    // (50 * 0.25 + 75 * 0.15) / 0.4
    expect(score.score).toBe(59.4);
    expect(service.generateRecommendations(score).map((r) => r.category)).not.toContain('accessibility');
  });

  it('uses accessibility reports and scanned usage when they exist', () => {
    const service = build({
      components: [
        { id: 'button', name: 'Button', status: 'production' },
        { id: 'card', name: 'Card', status: 'production' },
      ],
      reported: [80, 90],
      usage: { button: [{ applicationId: 'app_1', usageCount: 12 }, { applicationId: 'app_2', usageCount: 3 }] },
    });
    const score = service.calculateHealthScore();
    expect(score.factors).toEqual({ componentCoverage: 100, adoptionRate: 50, compliance: 85, maintenance: 100, accessibility: 85 });
    expect(score.notCollected).toEqual([]);

    const report = service.generateAuditReport();
    expect(report.components.topUsed).toEqual([{ name: 'Button', usage: 15, applications: 2 }]);
    expect(report.detailedMetrics.adoption.byComponent).toEqual([
      { name: 'Button', adoptionRate: 100 },
      { name: 'Card', adoptionRate: 0 },
    ]);
  });

  it('is deterministic and reports real token counts', () => {
    const options = {
      components: [{ id: 'button', name: 'Button', status: 'production' }],
      tokens: [
        { name: 'color.primary', category: 'colors' },
        { name: 'space.md', category: 'spacing' },
        { name: 'color.secondary', category: 'colors' },
      ],
    };
    const a = build(options).generateAuditReport();
    const b = build(options).generateAuditReport();
    expect(a.components.topUsed).toEqual([]);
    expect(a.detailedMetrics.adoption).toEqual({ overallRate: null, byComponent: [], trend: null });
    expect(a.detailedMetrics.tokens).toEqual({ total: 3, categories: 2, usage: null });
    expect(a.detailedMetrics.compliance).toMatchObject({ score: null, level: 'not-collected' });
    expect(a.healthScoreFactors).toEqual(b.healthScoreFactors);
    expect(a.executiveSummary.overallHealthScore).toBe(b.executiveSummary.overallHealthScore);
  });

  it('records what it measured, at most one point an hour', () => {
    const service = build({ components: [{ id: 'button', name: 'Button', status: 'production' }] });
    service.calculateHealthScore();
    service.calculateHealthScore();
    const trends = service.getHealthScoreTrends(1);
    expect(trends).toHaveLength(1);
    expect(trends[0]).toMatchObject({ score: 100, factors: { componentCoverage: 100 } });
  });
});
