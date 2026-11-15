import { Inject, Injectable, Logger } from '@nestjs/common';
import { AccessibilityReportsService } from '../accessibility-reports/accessibility-reports.service';
import type { MultiApplicationComplianceSummary } from '../accessibility-reports/accessibility-reports.types';
import { AnalyticsService } from '../analytics/analytics.service';
import { UsageState } from '../analytics/usage-model';
import { AuthPrincipal } from '../auth/principal';
import { ComponentAccessService } from '../design-system/component-access.service';
import { Component, DesignSystemService } from '../design-system/design-system.service';
import { DocumentStore, DuplicateDocumentError } from '../reviews/document-store';
import { HEALTH_SNAPSHOT_STORE, HealthInputs, HealthSnapshotDoc, SnapshotApplication, snapshotId } from './health-snapshots';

/**
 * Each factor is 0-100, or null when there is no data to measure it from
 * ("not collected"). Nothing is estimated or made up.
 */
export interface HealthScoreFactors {
  componentCoverage: number | null; // % of components in production
  adoptionRate: number | null; // % of components used by at least one scanned application
  compliance: number | null; // Average compliance score of applications with an accessibility report
  maintenance: number | null; // From deprecated and in-progress components
  accessibility: number | null; // Same reports as compliance (the only accessibility data there is)
}

export type HealthFactor = keyof HealthScoreFactors;

export interface HealthScore {
  /** Weighted over the measured factors only; null when none could be measured */
  score: number | null;
  factors: HealthScoreFactors;
  /** Factors that had no data and were left out of the score */
  notCollected: HealthFactor[];
  timestamp: Date;
  /** Against the latest daily snapshot before today, recomputed for the same caller */
  trend?: {
    previousScore: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
}

/** A day's score, recomputed from that day's snapshot for one caller */
export interface HealthScoreTrend {
  date: string;
  score: number;
  factors: HealthScoreFactors;
}

/** What one caller may read: other workspaces' components and applications are left out */
export interface HealthScope {
  componentIds: ReadonlySet<string>;
  /** Applications whose component usage the caller may see (AnalyticsService.applicationsVisibleTo) */
  applicationIds: ReadonlySet<string>;
  /** Applications whose accessibility reports the caller may read (the accessibility summary's scope) */
  reportApplicationIds: ReadonlySet<string>;
}

const WEIGHTS: Record<HealthFactor, number> = {
  componentCoverage: 0.25,
  adoptionRate: 0.25,
  compliance: 0.2,
  maintenance: 0.15,
  accessibility: 0.15,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_HISTORY_DAYS = 365;

const round1 = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10);
const utcDate = (at: Date) => at.toISOString().slice(0, 10);

export interface HealthRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'component' | 'adoption' | 'compliance' | 'maintenance' | 'accessibility';
  title: string;
  description: string;
  impact: string; // Estimated impact on health score
  action: string; // Suggested action
}

/** Applications in compliance and usage data, merged into snapshot rows */
function applicationRows(compliance: MultiApplicationComplianceSummary, usage: UsageState, usageApplicationIds?: ReadonlySet<string>): SnapshotApplication[] {
  const rows = new Map<string, SnapshotApplication>();
  const row = (id: string) => {
    if (!rows.has(id)) rows.set(id, { id, complianceScore: null, scanned: false, componentIds: [] });
    return rows.get(id)!;
  };
  for (const app of compliance.applications) row(app.applicationId).complianceScore = app.complianceScore;
  for (const id of usage.scannedApplications.keys()) {
    if (!usageApplicationIds || usageApplicationIds.has(id)) row(id).scanned = true;
  }
  for (const [componentId, usages] of usage.byComponent) {
    for (const u of usages) if (rows.get(u.applicationId)?.scanned) row(u.applicationId).componentIds.push(componentId);
  }
  return [...rows.values()];
}

/** The parts of a snapshot one caller may read */
export function scopeInputs(inputs: HealthInputs, scope: HealthScope): HealthInputs {
  return {
    components: inputs.components.filter((c) => scope.componentIds.has(c.id)),
    applications: inputs.applications
      .filter((app) => scope.applicationIds.has(app.id) || scope.reportApplicationIds.has(app.id))
      .map((app) => ({
        id: app.id,
        complianceScore: scope.reportApplicationIds.has(app.id) ? app.complianceScore : null,
        scanned: scope.applicationIds.has(app.id) && app.scanned,
        componentIds: scope.applicationIds.has(app.id) ? app.componentIds : [],
      })),
  };
}

/** The five factors, from the components and applications given */
export function healthFactors(inputs: HealthInputs): HealthScoreFactors {
  const { components, applications } = inputs;
  const total = components.length;
  const status = (s: string) => components.filter((c) => c.status === s).length;
  const scanned = applications.filter((app) => app.scanned);
  const used = new Set(scanned.flatMap((app) => app.componentIds));
  const scores = applications.map((app) => app.complianceScore).filter((score): score is number => score !== null);
  const compliance = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  return {
    componentCoverage: total ? round1((status('production') / total) * 100) : null,
    // Null until a governance scan of one of the caller's applications has recorded usage
    adoptionRate: total && scanned.length ? round1((components.filter((c) => used.has(c.id)).length / total) * 100) : null,
    compliance: round1(compliance),
    // Deprecated components cost up to 50 points, in-progress ones up to 10
    maintenance: total ? round1(Math.max(0, 100 - (status('deprecated') / total) * 50 - (status('in-progress') / total) * 10)) : null,
    accessibility: round1(compliance),
  };
}

/** Weighted average over the measured factors (weights rescaled to the ones present) */
export function overallScore(factors: HealthScoreFactors): number | null {
  let weighted = 0;
  let weights = 0;
  for (const key of Object.keys(WEIGHTS) as HealthFactor[]) {
    const value = factors[key];
    if (value === null) continue;
    weighted += value * WEIGHTS[key];
    weights += WEIGHTS[key];
  }
  if (weights === 0) return null;
  return round1(Math.max(0, Math.min(100, weighted / weights)));
}

/**
 * The design system's health, measured from components, accessibility
 * reports and the component usage governance scans record. Every figure is
 * limited to what the caller may read: their visible components
 * (ComponentAccessService), applications (AnalyticsService) and accessibility
 * reports (the accessibility summary's scope).
 *
 * History is one snapshot a day in Elasticsearch, taken by
 * SystemHealthSnapshotScheduler (takeSnapshot), never by a read.
 */
@Injectable()
export class SystemHealthService {
  private readonly logger = new Logger(SystemHealthService.name);

  constructor(
    private readonly designSystemService: DesignSystemService,
    private readonly accessibilityReportsService: AccessibilityReportsService,
    private readonly analyticsService: AnalyticsService,
    private readonly componentAccess: ComponentAccessService,
    @Inject(HEALTH_SNAPSHOT_STORE) private readonly snapshots: DocumentStore<HealthSnapshotDoc>,
  ) {}

  // ---------- Snapshots ----------

  /**
   * Stores today's snapshot (UTC) unless one exists. Its id is the day, so
   * concurrent instances store one. Returns whether this call stored it.
   */
  async takeSnapshot(at = new Date()): Promise<boolean> {
    const date = utcDate(at);
    const id = snapshotId(date);
    if (await this.snapshots.get(id)) return false;
    const components = await this.allComponents();
    const usage = await this.analyticsService.currentUsage();
    const doc: HealthSnapshotDoc = {
      id,
      date,
      createdAt: at.toISOString(),
      components: components.map((c) => ({ id: c.id, status: c.status })),
      applications: applicationRows(this.accessibilityReportsService.getMultiApplicationComplianceSummary(), usage),
    };
    try {
      await this.snapshots.create(doc);
      return true;
    } catch (error) {
      if (error instanceof DuplicateDocumentError) return false;
      throw error;
    }
  }

  // ---------- Scores ----------

  /** The health score from current data, for what the caller may read */
  async calculateHealthScore(principal: AuthPrincipal): Promise<HealthScore> {
    const { inputs, scope } = await this.measure(principal);
    return this.scoreOf(inputs, scope);
  }

  /** The score, alerts, recommendations and inventory the dashboard shows */
  async getDashboard(principal: AuthPrincipal) {
    const { inputs, scope, components } = await this.measure(principal);
    const healthScore = await this.scoreOf(inputs, scope);
    return {
      ...healthScore,
      timestamp: healthScore.timestamp.toISOString(),
      alerts: this.checkHealthScoreAlerts(healthScore),
      recommendations: this.generateRecommendations(healthScore),
      inventory: await this.getInventory(components),
    };
  }

  /** Daily scores from the last `days` days of snapshots, recomputed for the caller (empty before the first snapshot) */
  async getHealthScoreTrends(principal: AuthPrincipal, days = 30): Promise<HealthScoreTrend[]> {
    return this.trendsFor((await this.measure(principal)).scope, days);
  }

  /**
   * Alerts for a low score, or for a drop since the previous snapshot
   */
  checkHealthScoreAlerts(healthScore: HealthScore): Array<{ severity: 'high' | 'medium' | 'low'; message: string }> {
    const alerts: Array<{ severity: 'high' | 'medium' | 'low'; message: string }> = [];
    const currentScore = healthScore.score;
    if (currentScore === null) return alerts;

    if (currentScore < 50) {
      alerts.push({
        severity: 'high',
        message: 'Health score is critically low. Immediate action required.',
      });
    } else if (currentScore < 70) {
      alerts.push({
        severity: 'medium',
        message: 'Health score is below optimal. Review recommendations.',
      });
    }

    const previousScore = healthScore.trend?.previousScore;
    if (previousScore !== undefined) {
      const drop = previousScore - currentScore;
      if (drop > 10) {
        alerts.push({
          severity: 'high',
          message: `Health score dropped by ${drop.toFixed(1)} points since the last daily snapshot. Investigate recent changes.`,
        });
      } else if (drop > 5) {
        alerts.push({
          severity: 'medium',
          message: `Health score dropped by ${drop.toFixed(1)} points since the last daily snapshot.`,
        });
      }
    }

    return alerts;
  }

  /**
   * Generate recommendations to improve health score
   */
  generateRecommendations(healthScore: HealthScore): HealthRecommendation[] {
    const recommendations: HealthRecommendation[] = [];
    // Unmeasured factors read as 100 here, so they never produce a recommendation
    const f = healthScore.factors;
    const factors = {
      componentCoverage: f.componentCoverage ?? 100,
      adoptionRate: f.adoptionRate ?? 100,
      compliance: f.compliance ?? 100,
      maintenance: f.maintenance ?? 100,
      accessibility: f.accessibility ?? 100,
    };

    // Component Coverage recommendations
    if (factors.componentCoverage < 80) {
      recommendations.push({
        id: 'rec-component-coverage',
        priority: factors.componentCoverage < 60 ? 'high' : 'medium',
        category: 'component',
        title: 'Improve Component Coverage',
        description: `${(100 - factors.componentCoverage).toFixed(1)}% of components are not production-ready.`,
        impact: `Improving to 80% would increase health score by ~${((80 - factors.componentCoverage) * 0.25).toFixed(1)} points.`,
        action: 'Review components in progress and prioritize completing them.',
      });
    }

    // Adoption Rate recommendations
    if (factors.adoptionRate < 70) {
      recommendations.push({
        id: 'rec-adoption',
        priority: factors.adoptionRate < 50 ? 'high' : 'medium',
        category: 'adoption',
        title: 'Increase Component Adoption',
        description: `Component adoption rate is ${factors.adoptionRate.toFixed(1)}%.`,
        impact: `Increasing adoption to 80% would increase health score by ~${((80 - factors.adoptionRate) * 0.25).toFixed(1)} points.`,
        action: 'Promote design system components to development teams and provide training.',
      });
    }

    // Compliance recommendations
    if (factors.compliance < 90) {
      recommendations.push({
        id: 'rec-compliance',
        priority: factors.compliance < 70 ? 'high' : 'medium',
        category: 'compliance',
        title: 'Improve Compliance Score',
        description: `Average compliance score is ${factors.compliance.toFixed(1)}%.`,
        impact: `Improving compliance to 95% would increase health score by ~${((95 - factors.compliance) * 0.20).toFixed(1)} points.`,
        action: 'Review accessibility reports and address compliance issues.',
      });
    }

    // Maintenance recommendations
    if (factors.maintenance < 85) {
      recommendations.push({
        id: 'rec-maintenance',
        priority: factors.maintenance < 70 ? 'high' : 'medium',
        category: 'maintenance',
        title: 'Reduce Technical Debt',
        description: `Maintenance score is ${factors.maintenance.toFixed(1)}%.`,
        impact: `Improving maintenance to 90% would increase health score by ~${((90 - factors.maintenance) * 0.15).toFixed(1)} points.`,
        action: 'Deprecate or update outdated components. Reduce components in progress.',
      });
    }

    // Accessibility recommendations
    if (factors.accessibility < 95) {
      recommendations.push({
        id: 'rec-accessibility',
        priority: factors.accessibility < 80 ? 'high' : 'low',
        category: 'accessibility',
        title: 'Improve Accessibility',
        description: `Average accessibility score is ${factors.accessibility.toFixed(1)}%.`,
        impact: `Improving accessibility to 98% would increase health score by ~${((98 - factors.accessibility) * 0.15).toFixed(1)} points.`,
        action: 'Review accessibility reports and fix WCAG compliance issues.',
      });
    }

    // Sort by priority (high first)
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /** A full report of the caller's view of the design system's health */
  async generateAuditReport(principal: AuthPrincipal): Promise<any> {
    const { inputs, scope, components, usage } = await this.measure(principal);
    const healthScore = await this.scoreOf(inputs, scope);
    const trends = await this.trendsFor(scope, 90);
    const recommendations = this.generateRecommendations(healthScore);
    const alerts = this.checkHealthScoreAlerts(healthScore);
    const summary = await this.accessibilityReportsService.getComplianceSummary(principal);

    return {
      reportId: `audit-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      executiveSummary: {
        overallHealthScore: healthScore.score,
        healthGrade: this.getHealthGrade(healthScore.score),
        trend: healthScore.trend,
        keyFindings: this.generateKeyFindings(healthScore, components, alerts),
        recommendations: recommendations.slice(0, 5), // Top 5
      },
      detailedMetrics: {
        components: this.calculateComponentMetrics(components),
        tokens: await this.calculateTokenMetrics(),
        compliance: this.calculateComplianceMetrics(healthScore.factors.compliance),
        adoption: {
          overallRate: healthScore.factors.adoptionRate,
          byComponent: healthScore.factors.adoptionRate === null ? [] : this.getComponentAdoptionRates(components, usage),
          // Adoption from each daily snapshot; empty before the first
          trend: trends.filter((t) => t.factors.adoptionRate !== null).map((t) => ({ date: t.date, adoptionRate: t.factors.adoptionRate })),
        },
        accessibility: {
          score: healthScore.factors.accessibility,
          wcagLevel: this.lowestVerifiedLevel(summary),
        },
      },
      healthScoreFactors: healthScore.factors,
      trends: {
        current: healthScore,
        historical: trends,
        period: '90 days',
        // Daily snapshots start when the scheduler first ran; there is nothing older
        collectedSince: trends[0]?.date ?? null,
      },
      alerts: alerts,
      recommendations: recommendations,
      components: {
        total: components.length,
        byStatus: this.groupComponentsByStatus(components),
        topUsed: this.getTopUsedComponents(components, usage),
        deprecated: components.filter((c) => c.status === 'deprecated'),
      },
      nextSteps: this.generateNextSteps(recommendations, alerts),
    };
  }

  // ---------- Internals ----------

  private async allComponents(): Promise<Component[]> {
    // Awaited so this keeps working if the design system's reads become asynchronous
    return (await this.designSystemService.getAllComponents()) ?? [];
  }

  /** Current data, limited to what the caller may read */
  private async measure(principal: AuthPrincipal) {
    const [components, applications, compliance] = await Promise.all([
      this.componentAccess.list(principal),
      this.analyticsService.applicationsVisibleTo(principal),
      this.accessibilityReportsService.getComplianceSummary(principal),
    ]);
    const usage = await this.analyticsService.currentUsage(applications);
    const scope: HealthScope = {
      componentIds: new Set(components.map((c) => c.id)),
      applicationIds: new Set(applications.map((app) => app.id)),
      reportApplicationIds: new Set(compliance.applications.map((app) => app.applicationId)),
    };
    const inputs = scopeInputs(
      { components: components.map((c) => ({ id: c.id, status: c.status })), applications: applicationRows(compliance, usage, scope.applicationIds) },
      scope,
    );
    return { inputs, scope, components, usage };
  }

  private async scoreOf(inputs: HealthInputs, scope: HealthScope): Promise<HealthScore> {
    const factors = healthFactors(inputs);
    const score = overallScore(factors);
    const healthScore: HealthScore = {
      score,
      factors,
      notCollected: (Object.keys(factors) as HealthFactor[]).filter((key) => factors[key] === null),
      timestamp: new Date(),
    };
    const previous = await this.previousScore(scope);
    if (score !== null && previous !== null) {
      const change = Math.round((score - previous) * 10) / 10;
      healthScore.trend = { previousScore: previous, change, direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable' };
    }
    return healthScore;
  }

  /** The caller's score on the latest snapshot before today */
  private async previousScore(scope: HealthScope): Promise<number | null> {
    const today = utcDate(new Date());
    const earlier = (await this.snapshots.list()).filter((s) => s.date < today).sort((a, b) => b.date.localeCompare(a.date));
    return earlier.length ? overallScore(healthFactors(scopeInputs(earlier[0], scope))) : null;
  }

  private async trendsFor(scope: HealthScope, days: number): Promise<HealthScoreTrend[]> {
    const span = Number.isFinite(days) && days > 0 ? Math.min(days, MAX_HISTORY_DAYS) : 30;
    const cutoff = new Date(Date.now() - span * DAY_MS).toISOString();
    const snapshots = await this.snapshots.list({ after: { createdAt: cutoff } });
    return snapshots
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((snapshot) => {
        const factors = healthFactors(scopeInputs(snapshot, scope));
        return { date: snapshot.date, score: overallScore(factors), factors };
      })
      .filter((trend): trend is HealthScoreTrend => trend.score !== null);
  }

  /** Component and token counts for the dashboard's overview cards (components the caller can see) */
  private async getInventory(components: Component[]) {
    const tokens = (await this.designSystemService.getAllTokens()) ?? [];
    const byCategory = new Map<string, number>();
    for (const token of tokens) byCategory.set(token.category, (byCategory.get(token.category) ?? 0) + 1);
    const status = (s: string) => components.filter((c) => c.status === s).length;
    return {
      components: {
        total: components.length,
        production: status('production'),
        inProgress: status('in-progress'),
        planned: status('planned'),
        deprecated: status('deprecated'),
      },
      tokens: {
        total: tokens.length,
        categories: [...byCategory.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      },
    };
  }

  /**
   * Calculate component metrics
   */
  private calculateComponentMetrics(components: any[]): any {
    const total = components.length;
    const production = components.filter(c => c.status === 'production').length;
    const inProgress = components.filter(c => c.status === 'in-progress').length;
    const planned = components.filter(c => c.status === 'planned').length;
    const deprecated = components.filter(c => c.status === 'deprecated').length;

    return {
      total,
      production,
      inProgress,
      planned,
      deprecated,
      productionPercentage: total > 0 ? (production / total) * 100 : 0,
      healthScore: total > 0 ? ((production / total) * 100) - (deprecated / total * 20) : 0,
    };
  }

  /** Token counts from the design system. Usage per token is not tracked, so it is null. */
  private async calculateTokenMetrics(): Promise<any> {
    const tokens = (await this.designSystemService.getAllTokens()) ?? [];
    return {
      total: tokens.length,
      categories: new Set(tokens.map((t) => t.category)).size,
      usage: null,
    };
  }

  private calculateComplianceMetrics(compliance: number | null): any {
    if (compliance === null) return { score: null, level: 'not-collected', wcagCompliance: null };
    return {
      score: compliance,
      level: compliance >= 95 ? 'excellent' : compliance >= 85 ? 'good' : compliance >= 70 ? 'fair' : 'needs-improvement',
      wcagCompliance: compliance >= 90,
    };
  }

  private getHealthGrade(score: number | null): string | null {
    if (score === null) return null;
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * The weakest level the applications' latest accessibility reports
   * verified (Non-Compliant < Unverified < A < AA), or null without reports.
   * Never derived from the score: automated scores can't certify a level.
   */
  private lowestVerifiedLevel(summary: MultiApplicationComplianceSummary): string | null {
    const order = ['Non-Compliant', 'Unverified', 'A', 'AA'];
    const levels = summary.applications
      .map((app) => app.wcagLevel)
      .filter((level): level is NonNullable<typeof level> => !!level && order.includes(level));
    if (!levels.length) return null;
    return levels.reduce((lowest, level) => (order.indexOf(level) < order.indexOf(lowest) ? level : lowest));
  }

  /**
   * Generate key findings for executive summary
   */
  private generateKeyFindings(healthScore: HealthScore, components: any[], alerts: any[]): string[] {
    const findings: string[] = [];

    if (healthScore.score === null) {
      findings.push('There is not enough data to calculate a health score yet.');
    } else if (healthScore.score >= 85) {
      findings.push('Design system is in excellent health with strong adoption and compliance.');
    } else if (healthScore.score >= 70) {
      findings.push('Design system is in good health with room for improvement in specific areas.');
    } else {
      findings.push('Design system requires attention to improve overall health score.');
    }

    const { componentCoverage, adoptionRate } = healthScore.factors;
    if (componentCoverage !== null && componentCoverage < 80) {
      findings.push(`${(100 - componentCoverage).toFixed(1)}% of components are not production-ready.`);
    }

    if (adoptionRate !== null && adoptionRate < 70) {
      findings.push(`Component adoption rate is ${adoptionRate.toFixed(1)}%, below optimal levels.`);
    }

    if (healthScore.notCollected.length > 0) {
      findings.push(`Not collected (no data yet): ${healthScore.notCollected.join(', ')}.`);
    }

    if (alerts.length > 0) {
      findings.push(`${alerts.length} active alert${alerts.length > 1 ? 's' : ''} require attention.`);
    }

    const deprecated = components.filter(c => c.status === 'deprecated').length;
    if (deprecated > 0) {
      findings.push(`${deprecated} deprecated component${deprecated > 1 ? 's' : ''} should be migrated or removed.`);
    }

    return findings;
  }

  /**
   * Group components by status
   */
  private groupComponentsByStatus(components: any[]): any {
    return {
      production: components.filter(c => c.status === 'production'),
      inProgress: components.filter(c => c.status === 'in-progress'),
      planned: components.filter(c => c.status === 'planned'),
      deprecated: components.filter(c => c.status === 'deprecated'),
    };
  }

  /** Components by recorded usage across the caller's scanned applications (empty before any scan) */
  private getTopUsedComponents(components: Component[], usage: UsageState): Array<{ name: string; usage: number; applications: number }> {
    return components
      .map((c) => {
        const usages = usage.byComponent.get(c.id) ?? [];
        return { name: c.name, usage: usages.reduce((sum, u) => sum + u.usageCount, 0), applications: usages.length };
      })
      .filter((c) => c.usage > 0)
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);
  }

  /** Share of the caller's scanned applications using each component */
  private getComponentAdoptionRates(components: Component[], usage: UsageState): Array<{ name: string; adoptionRate: number }> {
    const scanned = usage.scannedApplications.size;
    if (scanned === 0) return [];
    return components.map((c) => ({
      name: c.name,
      adoptionRate: Math.round(((usage.byComponent.get(c.id)?.length ?? 0) / scanned) * 1000) / 10,
    }));
  }

  /**
   * Generate next steps from recommendations and alerts
   */
  private generateNextSteps(recommendations: HealthRecommendation[], alerts: any[]): string[] {
    const steps: string[] = [];

    const highPriorityRecs = recommendations.filter(r => r.priority === 'high');
    if (highPriorityRecs.length > 0) {
      steps.push(`Address ${highPriorityRecs.length} high-priority recommendation${highPriorityRecs.length > 1 ? 's' : ''}.`);
    }

    const highSeverityAlerts = alerts.filter(a => a.severity === 'high');
    if (highSeverityAlerts.length > 0) {
      steps.push(`Resolve ${highSeverityAlerts.length} high-severity alert${highSeverityAlerts.length > 1 ? 's' : ''}.`);
    }

    if (steps.length === 0) {
      steps.push('Continue monitoring health metrics and maintain current standards.');
      steps.push('Focus on increasing component adoption across applications.');
    }

    return steps;
  }
}

