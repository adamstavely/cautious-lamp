import { Injectable } from '@nestjs/common';
import { AccessibilityReportsService } from '../accessibility-reports/accessibility-reports.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { DesignSystemService } from '../design-system/design-system.service';

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
  trend?: {
    previousScore: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
}

/** A score this server measured (kept in memory since it started; nothing older exists) */
export interface HealthScoreTrend {
  date: string;
  score: number;
  factors: HealthScoreFactors;
}

const WEIGHTS: Record<HealthFactor, number> = {
  componentCoverage: 0.25,
  adoptionRate: 0.25,
  compliance: 0.2,
  maintenance: 0.15,
  accessibility: 0.15,
};

/** At most one history point per this interval: the latest measurement replaces the previous one */
const HISTORY_INTERVAL_MS = 60 * 60 * 1000;

const round1 = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10);

export interface HealthRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'component' | 'adoption' | 'compliance' | 'maintenance' | 'accessibility';
  title: string;
  description: string;
  impact: string; // Estimated impact on health score
  action: string; // Suggested action
}

@Injectable()
export class SystemHealthService {
  /** Measured scores only, recorded when a score is calculated. Starts empty. */
  private healthScoreHistory: HealthScoreTrend[] = [];
  private readonly MAX_HISTORY_DAYS = 90;

  constructor(
    private readonly designSystemService: DesignSystemService,
    private readonly accessibilityReportsService: AccessibilityReportsService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /** Calculates the health score from current data and records it in the history */
  calculateHealthScore(): HealthScore {
    const factors = this.calculateFactors();
    const score = this.calculateOverallScore(factors);
    const previousScore = this.latestRecordedScore();
    const notCollected = (Object.keys(factors) as HealthFactor[]).filter((key) => factors[key] === null);

    const healthScore: HealthScore = {
      score: round1(score),
      factors,
      notCollected,
      timestamp: new Date(),
    };
    if (score !== null && previousScore !== null) {
      const change = score - previousScore;
      healthScore.trend = {
        previousScore,
        change: Math.round(change * 10) / 10,
        direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
      };
    }
    this.addToHistory(healthScore);
    return healthScore;
  }

  private calculateFactors(): HealthScoreFactors {
    const components = this.designSystemService.getAllComponents();
    const total = components.length;
    const production = components.filter((c) => c.status === 'production').length;
    const compliance = this.complianceAverage();
    return {
      componentCoverage: total > 0 ? round1((production / total) * 100) : null,
      adoptionRate: round1(this.calculateAdoptionRate(components)),
      compliance: round1(compliance),
      maintenance: round1(this.calculateMaintenanceScore(components)),
      accessibility: round1(compliance),
    };
  }

  /** Components with recorded usage in at least one application, from governance scans. Null before any scan. */
  private calculateAdoptionRate(components: any[]): number | null {
    if (components.length === 0) return null;
    const used = components.filter((c) => this.analyticsService.getComponentUsage(c.id).length > 0).length;
    const anyUsageRecorded = used > 0 || this.analyticsService.getUsageTrends(this.MAX_HISTORY_DAYS).length > 0;
    return anyUsageRecorded ? (used / components.length) * 100 : null;
  }

  /** Average score of applications with an accessibility report; null when there are none */
  private complianceAverage(): number | null {
    try {
      const summary = this.accessibilityReportsService.getMultiApplicationComplianceSummary();
      return summary.reportedApplications > 0 ? summary.averageScore : null;
    } catch {
      return null;
    }
  }

  private calculateMaintenanceScore(components: any[]): number | null {
    if (components.length === 0) return null;
    const deprecated = components.filter((c) => c.status === 'deprecated').length;
    const inProgress = components.filter((c) => c.status === 'in-progress').length;
    // Deprecated components cost up to 50 points, in-progress ones up to 10
    return Math.max(0, 100 - (deprecated / components.length) * 50 - (inProgress / components.length) * 10);
  }

  /** Weighted average over the measured factors (weights rescaled to the ones present) */
  private calculateOverallScore(factors: HealthScoreFactors): number | null {
    let weighted = 0;
    let weights = 0;
    for (const key of Object.keys(WEIGHTS) as HealthFactor[]) {
      const value = factors[key];
      if (value === null) continue;
      weighted += value * WEIGHTS[key];
      weights += WEIGHTS[key];
    }
    if (weights === 0) return null;
    return Math.max(0, Math.min(100, weighted / weights));
  }

  /** The last recorded score from before the current hour's slot */
  private latestRecordedScore(): number | null {
    const last = this.healthScoreHistory[this.healthScoreHistory.length - 1];
    if (!last) return null;
    if (Date.now() - new Date(last.date).getTime() < HISTORY_INTERVAL_MS) {
      return this.healthScoreHistory[this.healthScoreHistory.length - 2]?.score ?? null;
    }
    return last.score;
  }

  private addToHistory(healthScore: HealthScore): void {
    if (healthScore.score === null) return;
    const entry: HealthScoreTrend = {
      date: healthScore.timestamp.toISOString(),
      score: healthScore.score,
      factors: healthScore.factors,
    };
    const last = this.healthScoreHistory[this.healthScoreHistory.length - 1];
    if (last && healthScore.timestamp.getTime() - new Date(last.date).getTime() < HISTORY_INTERVAL_MS) {
      this.healthScoreHistory[this.healthScoreHistory.length - 1] = entry;
    } else {
      this.healthScoreHistory.push(entry);
    }
    const cutoff = Date.now() - this.MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000;
    this.healthScoreHistory = this.healthScoreHistory.filter((e) => new Date(e.date).getTime() >= cutoff);
  }

  /** Current component and token counts, for the dashboard's overview cards */
  getInventory() {
    const components = this.designSystemService.getAllComponents();
    const tokens = this.designSystemService.getAllTokens();
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

  /** Measured scores from the last `days` days (empty until scores have been calculated) */
  getHealthScoreTrends(days: number = 30): HealthScoreTrend[] {
    const span = Number.isFinite(days) && days > 0 ? Math.min(days, this.MAX_HISTORY_DAYS) : 30;
    const cutoff = Date.now() - span * 24 * 60 * 60 * 1000;
    return this.healthScoreHistory.filter((entry) => new Date(entry.date).getTime() >= cutoff);
  }

  /**
   * Check if health score has dropped significantly
   */
  checkHealthScoreAlerts(currentScore: number | null): Array<{ severity: 'high' | 'medium' | 'low'; message: string }> {
    const alerts: Array<{ severity: 'high' | 'medium' | 'low'; message: string }> = [];
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

    // Check for significant drop
    const previousScore = this.latestRecordedScore();
    if (previousScore !== null) {
      const drop = previousScore - currentScore;
      
      if (drop > 10) {
        alerts.push({
          severity: 'high',
          message: `Health score dropped by ${drop.toFixed(1)} points. Investigate recent changes.`,
        });
      } else if (drop > 5) {
        alerts.push({
          severity: 'medium',
          message: `Health score dropped by ${drop.toFixed(1)} points.`,
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

  /**
   * Generate comprehensive audit report
   */
  generateAuditReport(): any {
    const healthScore = this.calculateHealthScore();
    const components = this.designSystemService.getAllComponents();
    const trends = this.getHealthScoreTrends(90);
    const recommendations = this.generateRecommendations(healthScore);
    const alerts = this.checkHealthScoreAlerts(healthScore.score);

    // Calculate detailed metrics
    const componentMetrics = this.calculateComponentMetrics(components);
    const tokenMetrics = this.calculateTokenMetrics();
    const complianceMetrics = this.calculateComplianceMetrics(healthScore.factors.compliance);
    const adoptionMetrics = this.calculateAdoptionMetrics(components, healthScore.factors.adoptionRate);

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
        components: componentMetrics,
        tokens: tokenMetrics,
        compliance: complianceMetrics,
        adoption: adoptionMetrics,
        accessibility: {
          score: healthScore.factors.accessibility,
          wcagLevel: this.getWCAGLevel(healthScore.factors.accessibility),
        },
      },
      healthScoreFactors: healthScore.factors,
      trends: {
        current: healthScore,
        historical: trends,
        period: '90 days',
        // History is what this server measured since it started; it is empty until then
        collectedSince: trends[0]?.date ?? null,
      },
      alerts: alerts,
      recommendations: recommendations,
      components: {
        total: components.length,
        byStatus: this.groupComponentsByStatus(components),
        topUsed: this.getTopUsedComponents(components),
        deprecated: components.filter(c => c.status === 'deprecated'),
      },
      nextSteps: this.generateNextSteps(recommendations, alerts),
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
  private calculateTokenMetrics(): any {
    const tokens = this.designSystemService.getAllTokens();
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

  private calculateAdoptionMetrics(components: any[], overallRate: number | null): any {
    return {
      overallRate,
      byComponent: overallRate === null ? [] : this.getComponentAdoptionRates(components),
      // Usage history isn't kept per component, so there is no trend to report
      trend: null,
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

  private getWCAGLevel(score: number | null): string | null {
    if (score === null) return null;
    if (score >= 95) return 'AAA';
    if (score >= 90) return 'AA';
    if (score >= 80) return 'A';
    return 'Below A';
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

  /** Components by recorded usage across scanned applications (empty before any scan) */
  private getTopUsedComponents(components: any[]): Array<{ name: string; usage: number; applications: number }> {
    return components
      .map((c) => {
        const usage = this.analyticsService.getComponentUsage(c.id);
        return { name: c.name, usage: usage.reduce((sum, u) => sum + u.usageCount, 0), applications: usage.length };
      })
      .filter((c) => c.usage > 0)
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);
  }

  /** Share of scanned applications using each component */
  private getComponentAdoptionRates(components: any[]): Array<{ name: string; adoptionRate: number }> {
    const usageByComponent = components.map((c) => ({ c, usage: this.analyticsService.getComponentUsage(c.id) }));
    const scannedApps = new Set(usageByComponent.flatMap(({ usage }) => usage.map((u) => u.applicationId)));
    if (scannedApps.size === 0) return [];
    return usageByComponent.map(({ c, usage }) => ({
      name: c.name,
      adoptionRate: Math.round((new Set(usage.map((u) => u.applicationId)).size / scannedApps.size) * 1000) / 10,
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

