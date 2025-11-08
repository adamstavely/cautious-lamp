import { Injectable } from '@nestjs/common';
import { DesignSystemService } from '../design-system/design-system.service';
import { AccessibilityReportsService } from '../accessibility-reports/accessibility-reports.service';

export interface HealthScoreFactors {
  componentCoverage: number; // 0-100: % of components in production
  adoptionRate: number; // 0-100: % of components being used across applications
  compliance: number; // 0-100: Average compliance score across applications
  maintenance: number; // 0-100: Based on deprecated components, technical debt
  accessibility: number; // 0-100: Average accessibility score
}

export interface HealthScore {
  score: number; // 0-100 overall score
  factors: HealthScoreFactors;
  timestamp: Date;
  trend?: {
    previousScore: number;
    change: number;
    direction: 'up' | 'down' | 'stable';
  };
}

export interface HealthScoreTrend {
  date: string;
  score: number;
  factors: HealthScoreFactors;
}

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
  private healthScoreHistory: HealthScoreTrend[] = [];
  private readonly MAX_HISTORY_DAYS = 90; // Keep 90 days of history

  constructor(
    private readonly designSystemService: DesignSystemService,
    private readonly accessibilityReportsService: AccessibilityReportsService,
  ) {
    // Initialize with some mock historical data for demonstration
    this.initializeMockHistory();
  }

  /**
   * Calculate comprehensive health score
   */
  calculateHealthScore(): HealthScore {
    const factors = this.calculateFactors();
    const score = this.calculateOverallScore(factors);
    
    // Get previous score for trend
    const previousScore = this.getPreviousScore();
    const change = score - previousScore;
    const direction = change > 2 ? 'up' : change < -2 ? 'down' : 'stable';

    const healthScore: HealthScore = {
      score: Math.round(score * 10) / 10, // Round to 1 decimal
      factors,
      timestamp: new Date(),
      trend: previousScore !== null ? {
        previousScore,
        change: Math.round(change * 10) / 10,
        direction,
      } : undefined,
    };

    // Store in history
    this.addToHistory(healthScore);

    return healthScore;
  }

  /**
   * Calculate individual health score factors
   */
  private calculateFactors(): HealthScoreFactors {
    // Component Coverage: % of components in production
    const components = this.designSystemService.getAllComponents();
    const totalComponents = components.length;
    const productionComponents = components.filter(c => c.status === 'production').length;
    const componentCoverage = totalComponents > 0 
      ? (productionComponents / totalComponents) * 100 
      : 0;

    // Adoption Rate: Estimate based on component usage (mock for now, would need real usage data)
    // In a real system, this would track actual component usage across applications
    const adoptionRate = this.calculateAdoptionRate(components);

    // Compliance: Average compliance score from accessibility reports
    const compliance = this.calculateComplianceScore();

    // Maintenance: Based on deprecated components and technical debt indicators
    const maintenance = this.calculateMaintenanceScore(components);

    // Accessibility: Average accessibility score
    const accessibility = this.calculateAccessibilityScore();

    return {
      componentCoverage: Math.round(componentCoverage * 10) / 10,
      adoptionRate: Math.round(adoptionRate * 10) / 10,
      compliance: Math.round(compliance * 10) / 10,
      maintenance: Math.round(maintenance * 10) / 10,
      accessibility: Math.round(accessibility * 10) / 10,
    };
  }

  /**
   * Calculate adoption rate (mock implementation - would need real usage tracking)
   */
  private calculateAdoptionRate(components: any[]): number {
    // Mock: Assume 70-90% adoption for production components, 30-50% for in-progress
    const productionComponents = components.filter(c => c.status === 'production');
    const inProgressComponents = components.filter(c => c.status === 'in-progress');
    
    if (components.length === 0) return 0;

    const productionAdoption = productionComponents.length * 0.8; // 80% average
    const inProgressAdoption = inProgressComponents.length * 0.4; // 40% average
    
    return ((productionAdoption + inProgressAdoption) / components.length) * 100;
  }

  /**
   * Calculate compliance score from accessibility reports
   */
  private calculateComplianceScore(): number {
    try {
      const summary = this.accessibilityReportsService.getMultiApplicationComplianceSummary();
      if (summary.applications.length === 0) return 100; // No apps = perfect (no issues)
      return summary.averageScore;
    } catch (error) {
      // If no reports exist, return a default score
      return 85; // Default compliance score
    }
  }

  /**
   * Calculate maintenance score
   */
  private calculateMaintenanceScore(components: any[]): number {
    if (components.length === 0) return 100;

    const deprecated = components.filter(c => c.status === 'deprecated').length;
    const inProgress = components.filter(c => c.status === 'in-progress').length;
    
    // Penalize deprecated components heavily, in-progress moderately
    const deprecatedPenalty = (deprecated / components.length) * 50; // Up to 50 point penalty
    const inProgressPenalty = (inProgress / components.length) * 10; // Up to 10 point penalty
    
    return Math.max(0, 100 - deprecatedPenalty - inProgressPenalty);
  }

  /**
   * Calculate accessibility score
   */
  private calculateAccessibilityScore(): number {
    try {
      const summary = this.accessibilityReportsService.getMultiApplicationComplianceSummary();
      if (summary.applications.length === 0) return 100;
      return summary.averageScore;
    } catch (error) {
      return 95; // Default accessibility score
    }
  }

  /**
   * Calculate overall health score from factors
   */
  private calculateOverallScore(factors: HealthScoreFactors): number {
    // Weighted average:
    // Component Coverage: 25%
    // Adoption Rate: 25%
    // Compliance: 20%
    // Maintenance: 15%
    // Accessibility: 15%
    
    const weightedScore = 
      (factors.componentCoverage * 0.25) +
      (factors.adoptionRate * 0.25) +
      (factors.compliance * 0.20) +
      (factors.maintenance * 0.15) +
      (factors.accessibility * 0.15);

    return Math.max(0, Math.min(100, weightedScore));
  }

  /**
   * Get previous health score for trend calculation
   */
  private getPreviousScore(): number | null {
    if (this.healthScoreHistory.length < 2) return null;
    return this.healthScoreHistory[this.healthScoreHistory.length - 2].score;
  }

  /**
   * Add health score to history
   */
  private addToHistory(healthScore: HealthScore): void {
    const trend: HealthScoreTrend = {
      date: healthScore.timestamp.toISOString(),
      score: healthScore.score,
      factors: healthScore.factors,
    };

    this.healthScoreHistory.push(trend);

    // Keep only last 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.MAX_HISTORY_DAYS);
    
    this.healthScoreHistory = this.healthScoreHistory.filter(
      entry => new Date(entry.date) >= cutoffDate
    );
  }

  /**
   * Get health score trends
   */
  getHealthScoreTrends(days: number = 30): HealthScoreTrend[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.healthScoreHistory.filter(
      entry => new Date(entry.date) >= cutoffDate
    );
  }

  /**
   * Check if health score has dropped significantly
   */
  checkHealthScoreAlerts(currentScore: number): Array<{ severity: 'high' | 'medium' | 'low'; message: string }> {
    const alerts: Array<{ severity: 'high' | 'medium' | 'low'; message: string }> = [];
    
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
    if (this.healthScoreHistory.length >= 2) {
      const previousScore = this.healthScoreHistory[this.healthScoreHistory.length - 2].score;
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
    const factors = healthScore.factors;

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
   * Initialize mock history for demonstration
   */
  private initializeMockHistory(): void {
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate mock scores with slight variation
      const baseScore = 82;
      const variation = Math.sin(i / 5) * 3 + (Math.random() - 0.5) * 2;
      const score = Math.max(70, Math.min(95, baseScore + variation));

      this.healthScoreHistory.push({
        date: date.toISOString(),
        score: Math.round(score * 10) / 10,
        factors: {
          componentCoverage: score + (Math.random() - 0.5) * 5,
          adoptionRate: score - 5 + (Math.random() - 0.5) * 5,
          compliance: score + 3 + (Math.random() - 0.5) * 3,
          maintenance: score - 2 + (Math.random() - 0.5) * 4,
          accessibility: score + 5 + (Math.random() - 0.5) * 3,
        },
      });
    }
  }
}

