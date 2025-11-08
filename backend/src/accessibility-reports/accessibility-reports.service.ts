import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ComplianceCheck } from '../design-system/design-system.service';
import { DesignSystemService } from '../design-system/design-system.service';

export interface AccessibilityReport {
  id: string;
  applicationId: string;
  applicationName: string;
  generatedAt: Date;
  scheduled: boolean;
  scheduleId?: string;
  
  // WCAG Compliance Metrics
  wcagLevel: 'A' | 'AA' | 'AAA' | 'Non-Compliant';
  complianceScore: number; // 0-100
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  
  // Breakdown by WCAG Criteria
  wcagCriteria: {
    [key: string]: {
      criterion: string;
      level: 'A' | 'AA' | 'AAA';
      status: 'pass' | 'fail' | 'warning';
      issues: number;
      description: string;
    };
  };
  
  // Issues by Category
  issuesByCategory: {
    colorContrast: number;
    keyboardNavigation: number;
    ariaAttributes: number;
    focusManagement: number;
    altText: number;
    headingHierarchy: number;
    formLabels: number;
    photosensitivity: number;
    other: number;
  };
  
  // Prioritized Fixes
  prioritizedFixes: PrioritizedFix[];
  
  // Raw checks
  checks: ComplianceCheck[];
  
  // Trend data
  previousReportId?: string;
  trend: {
    scoreChange: number;
    issuesChange: number;
    newIssues: number;
    fixedIssues: number;
  };
}

export interface PrioritizedFix {
  id: string;
  rule: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  priority: number; // Calculated priority score
  affectedElements: number;
  description: string;
  recommendation: string;
  wcagCriterion: string;
  checks: ComplianceCheck[];
}

export interface ReportSchedule {
  id: string;
  applicationId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  recipients: string[]; // Email addresses
}

@Injectable()
export class AccessibilityReportsService {
  private readonly logger = new Logger(AccessibilityReportsService.name);
  private reports: Map<string, AccessibilityReport> = new Map();
  private schedules: Map<string, ReportSchedule> = new Map();

  constructor(
    @Inject(forwardRef(() => DesignSystemService))
    private readonly designSystemService: DesignSystemService,
  ) {
    // Initialize with some mock data for demonstration
    this.initializeMockData();
  }

  /**
   * Generate an accessibility report for an application
   */
  async generateReport(
    applicationId: string,
    options?: { scheduled?: boolean; scheduleId?: string }
  ): Promise<AccessibilityReport> {
    this.logger.log(`Generating accessibility report for application ${applicationId}`);

    // Get application
    const application = this.designSystemService.getApplication(applicationId);
    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    // Run accessibility scan
    const scanResult = await this.designSystemService.scanApplicationCodebase(
      applicationId,
      undefined,
      ['accessibility']
    );

    // Process checks and generate report
    const report = this.processScanResults(
      applicationId,
      application.name,
      scanResult.checks,
      options
    );

    // Calculate trends if previous report exists
    const previousReport = this.getLatestReport(applicationId, report.id);
    if (previousReport) {
      report.previousReportId = previousReport.id;
      report.trend = this.calculateTrend(report, previousReport);
    }

    // Store report
    this.reports.set(report.id, report);

    return report;
  }

  /**
   * Process scan results into structured report
   */
  private processScanResults(
    applicationId: string,
    applicationName: string,
    checks: ComplianceCheck[],
    options?: { scheduled?: boolean; scheduleId?: string }
  ): AccessibilityReport {
    // Filter accessibility-related checks
    const accessibilityChecks = checks.filter(
      check => 
        check.rule.includes('Accessibility') ||
        check.rule.includes('Alt Text') ||
        check.rule.includes('Heading Hierarchy') ||
        check.rule.includes('Color Contrast') ||
        check.rule.includes('Keyboard') ||
        check.rule.includes('ARIA') ||
        check.rule.includes('Focus') ||
        check.rule.includes('Photosensitivity')
    );

    // Categorize issues
    const issuesByCategory = {
      colorContrast: 0,
      keyboardNavigation: 0,
      ariaAttributes: 0,
      focusManagement: 0,
      altText: 0,
      headingHierarchy: 0,
      formLabels: 0,
      photosensitivity: 0,
      other: 0,
    };

    // Count by severity
    let criticalIssues = 0;
    let seriousIssues = 0;
    let moderateIssues = 0;
    let minorIssues = 0;

    accessibilityChecks.forEach(check => {
      // Categorize
      if (check.rule.includes('Color Contrast')) {
        issuesByCategory.colorContrast++;
      } else if (check.rule.includes('Keyboard')) {
        issuesByCategory.keyboardNavigation++;
      } else if (check.rule.includes('ARIA') || check.rule.includes('Accessibility Attributes')) {
        issuesByCategory.ariaAttributes++;
      } else if (check.rule.includes('Focus')) {
        issuesByCategory.focusManagement++;
      } else if (check.rule.includes('Alt Text') || check.rule.includes('Image')) {
        issuesByCategory.altText++;
      } else if (check.rule.includes('Heading')) {
        issuesByCategory.headingHierarchy++;
      } else if (check.rule.includes('Label') || check.rule.includes('Form')) {
        issuesByCategory.formLabels++;
      } else if (check.rule.includes('Photosensitivity')) {
        issuesByCategory.photosensitivity++;
      } else {
        issuesByCategory.other++;
      }

      // Count by severity
      if (check.impact === 'critical') {
        criticalIssues++;
      } else if (check.impact === 'serious') {
        seriousIssues++;
      } else if (check.impact === 'moderate') {
        moderateIssues++;
      } else {
        minorIssues++;
      }
    });

    const totalIssues = accessibilityChecks.length;

    // Calculate compliance score (0-100)
    // Base score of 100, deduct points for issues
    let score = 100;
    score -= criticalIssues * 10;
    score -= seriousIssues * 5;
    score -= moderateIssues * 2;
    score -= minorIssues * 1;
    score = Math.max(0, Math.min(100, score));

    // Determine WCAG level
    let wcagLevel: 'A' | 'AA' | 'AAA' | 'Non-Compliant' = 'Non-Compliant';
    if (score >= 95) {
      wcagLevel = 'AAA';
    } else if (score >= 85) {
      wcagLevel = 'AA';
    } else if (score >= 70) {
      wcagLevel = 'A';
    }

    // Map to WCAG criteria
    const wcagCriteria = this.mapToWCAGCriteria(accessibilityChecks);

    // Generate prioritized fixes
    const prioritizedFixes = this.prioritizeFixes(accessibilityChecks);

    const report: AccessibilityReport = {
      id: `report-${applicationId}-${Date.now()}`,
      applicationId,
      applicationName,
      generatedAt: new Date(),
      scheduled: options?.scheduled || false,
      scheduleId: options?.scheduleId,
      wcagLevel,
      complianceScore: score,
      totalIssues,
      criticalIssues,
      seriousIssues,
      moderateIssues,
      minorIssues,
      wcagCriteria,
      issuesByCategory,
      prioritizedFixes,
      checks: accessibilityChecks,
      trend: {
        scoreChange: 0,
        issuesChange: 0,
        newIssues: 0,
        fixedIssues: 0,
      },
    };

    return report;
  }

  /**
   * Map checks to WCAG criteria
   */
  private mapToWCAGCriteria(checks: ComplianceCheck[]): {
    [key: string]: {
      criterion: string;
      level: 'A' | 'AA' | 'AAA';
      status: 'pass' | 'fail' | 'warning';
      issues: number;
      description: string;
    };
  } {
    const criteria: {
      [key: string]: {
        criterion: string;
        level: 'A' | 'AA' | 'AAA';
        status: 'pass' | 'fail' | 'warning';
        issues: number;
        description: string;
      };
    } = {};

    // WCAG 2.1 Level A criteria
    const levelACriteria = {
      '1.1.1': { criterion: '1.1.1 Non-text Content', level: 'A' as const, description: 'All non-text content has text alternatives' },
      '1.3.1': { criterion: '1.3.1 Info and Relationships', level: 'A' as const, description: 'Information, structure, and relationships are programmatically determinable' },
      '2.1.1': { criterion: '2.1.1 Keyboard', level: 'A' as const, description: 'All functionality is operable through a keyboard' },
      '2.4.2': { criterion: '2.4.2 Page Titled', level: 'A' as const, description: 'Web pages have titles that describe topic or purpose' },
      '2.4.4': { criterion: '2.4.4 Link Purpose', level: 'A' as const, description: 'The purpose of each link can be determined from the link text alone' },
      '3.3.2': { criterion: '3.3.2 Labels or Instructions', level: 'A' as const, description: 'Labels or instructions are provided when content requires user input' },
      '4.1.2': { criterion: '4.1.2 Name, Role, Value', level: 'A' as const, description: 'For all user interface components, the name and role can be programmatically determined' },
    };

    // WCAG 2.1 Level AA criteria
    const levelAACriteria = {
      '1.4.3': { criterion: '1.4.3 Contrast (Minimum)', level: 'AA' as const, description: 'Text has a contrast ratio of at least 4.5:1' },
      '1.4.5': { criterion: '1.4.5 Images of Text', level: 'AA' as const, description: 'Images of text are not used' },
      '2.4.6': { criterion: '2.4.6 Headings and Labels', level: 'AA' as const, description: 'Headings and labels describe topic or purpose' },
      '2.4.7': { criterion: '2.4.7 Focus Visible', level: 'AA' as const, description: 'Keyboard focus indicator is visible' },
    };

    // Map checks to criteria
    checks.forEach(check => {
      let criterionKey = '';
      let criterionInfo: any = null;

      if (check.rule.includes('Alt Text') || check.rule.includes('Image')) {
        criterionKey = '1.1.1';
        criterionInfo = levelACriteria['1.1.1'];
      } else if (check.rule.includes('Heading')) {
        criterionKey = '1.3.1';
        criterionInfo = levelACriteria['1.3.1'];
      } else if (check.rule.includes('Keyboard')) {
        criterionKey = '2.1.1';
        criterionInfo = levelACriteria['2.1.1'];
      } else if (check.rule.includes('Color Contrast')) {
        criterionKey = '1.4.3';
        criterionInfo = levelAACriteria['1.4.3'];
      } else if (check.rule.includes('Focus')) {
        criterionKey = '2.4.7';
        criterionInfo = levelAACriteria['2.4.7'];
      } else if (check.rule.includes('Label') || check.rule.includes('Form')) {
        criterionKey = '3.3.2';
        criterionInfo = levelACriteria['3.3.2'];
      } else if (check.rule.includes('ARIA') || check.rule.includes('Accessibility Attributes')) {
        criterionKey = '4.1.2';
        criterionInfo = levelACriteria['4.1.2'];
      }

      if (criterionKey && criterionInfo) {
        if (!criteria[criterionKey]) {
          criteria[criterionKey] = {
            ...criterionInfo,
            status: 'pass' as const,
            issues: 0,
          };
        }
        criteria[criterionKey].issues++;
        if (check.status === 'error' || check.status === 'warning') {
          criteria[criterionKey].status = check.impact === 'critical' ? 'fail' : 'warning';
        }
      }
    });

    return criteria;
  }

  /**
   * Prioritize fixes based on severity, impact, and effort
   */
  private prioritizeFixes(checks: ComplianceCheck[]): PrioritizedFix[] {
    // Group checks by rule
    const checksByRule = new Map<string, ComplianceCheck[]>();
    checks.forEach(check => {
      if (!checksByRule.has(check.rule)) {
        checksByRule.set(check.rule, []);
      }
      checksByRule.get(check.rule)!.push(check);
    });

    const fixes: PrioritizedFix[] = [];

    checksByRule.forEach((ruleChecks, rule) => {
      // Determine severity from checks
      const hasCritical = ruleChecks.some(c => c.impact === 'critical');
      const hasSerious = ruleChecks.some(c => c.impact === 'serious');
      
      const severity: 'critical' | 'serious' | 'moderate' | 'minor' = 
        hasCritical ? 'critical' :
        hasSerious ? 'serious' :
        ruleChecks.some(c => c.impact === 'moderate') ? 'moderate' : 'minor';

      // Estimate effort based on rule type
      let effort: 'low' | 'medium' | 'high' = 'medium';
      if (rule.includes('Alt Text')) {
        effort = 'low';
      } else if (rule.includes('Color Contrast')) {
        effort = 'medium';
      } else if (rule.includes('Keyboard') || rule.includes('ARIA')) {
        effort = 'high';
      }

      // Calculate priority score (higher = more important)
      // Formula: (severity_weight * impact_weight) / effort_weight
      const severityWeight = {
        critical: 10,
        serious: 7,
        moderate: 4,
        minor: 1,
      };
      const effortWeight = {
        low: 1,
        medium: 2,
        high: 3,
      };
      
      const priority = (severityWeight[severity] * ruleChecks.length) / effortWeight[effort];

      // Get WCAG criterion
      let wcagCriterion = '';
      if (rule.includes('Alt Text')) wcagCriterion = '1.1.1';
      else if (rule.includes('Color Contrast')) wcagCriterion = '1.4.3';
      else if (rule.includes('Keyboard')) wcagCriterion = '2.1.1';
      else if (rule.includes('Focus')) wcagCriterion = '2.4.7';
      else if (rule.includes('Label')) wcagCriterion = '3.3.2';
      else if (rule.includes('ARIA')) wcagCriterion = '4.1.2';

      fixes.push({
        id: `fix-${rule.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
        rule,
        severity,
        impact: this.getImpactDescription(rule, severity),
        effort,
        priority,
        affectedElements: ruleChecks.length,
        description: ruleChecks[0]?.message || 'Accessibility issue detected',
        recommendation: this.getRecommendation(rule),
        wcagCriterion,
        checks: ruleChecks,
      });
    });

    // Sort by priority (highest first)
    return fixes.sort((a, b) => b.priority - a.priority);
  }

  private getImpactDescription(rule: string, severity: string): string {
    if (severity === 'critical') {
      return 'Blocks users with disabilities from accessing content';
    } else if (severity === 'serious') {
      return 'Significantly impacts user experience for users with disabilities';
    } else if (severity === 'moderate') {
      return 'Moderately impacts accessibility and user experience';
    }
    return 'Minor accessibility concern';
  }

  private getRecommendation(rule: string): string {
    if (rule.includes('Alt Text')) {
      return 'Add descriptive alt text to all images. Use empty alt="" for decorative images.';
    } else if (rule.includes('Color Contrast')) {
      return 'Ensure text has a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.';
    } else if (rule.includes('Keyboard')) {
      return 'Ensure all interactive elements are keyboard accessible. Remove tabindex="-1" from interactive elements or provide alternative keyboard access.';
    } else if (rule.includes('Focus')) {
      return 'Ensure keyboard focus indicators are visible. Add focus styles to all interactive elements.';
    } else if (rule.includes('ARIA')) {
      return 'Add appropriate ARIA attributes to improve screen reader support. Ensure roles, labels, and states are properly defined.';
    } else if (rule.includes('Heading')) {
      return 'Use proper heading hierarchy (h1, h2, h3, etc.) without skipping levels.';
    } else if (rule.includes('Label')) {
      return 'Associate all form inputs with labels using the "for" attribute or aria-label.';
    }
    return 'Review and fix accessibility issues according to WCAG 2.1 guidelines.';
  }

  /**
   * Calculate trend between two reports
   */
  private calculateTrend(
    current: AccessibilityReport,
    previous: AccessibilityReport
  ): AccessibilityReport['trend'] {
    const scoreChange = current.complianceScore - previous.complianceScore;
    const issuesChange = current.totalIssues - previous.totalIssues;

    // Find new and fixed issues by comparing check IDs
    const previousCheckIds = new Set(previous.checks.map(c => c.id));
    const currentCheckIds = new Set(current.checks.map(c => c.id));

    const newIssues = current.checks.filter(c => !previousCheckIds.has(c.id)).length;
    const fixedIssues = previous.checks.filter(c => !currentCheckIds.has(c.id)).length;

    return {
      scoreChange,
      issuesChange,
      newIssues,
      fixedIssues,
    };
  }

  /**
   * Get latest report for an application
   */
  getLatestReport(applicationId: string, excludeId?: string): AccessibilityReport | null {
    const reports = Array.from(this.reports.values())
      .filter(r => r.applicationId === applicationId && r.id !== excludeId)
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    
    return reports.length > 0 ? reports[0] : null;
  }

  /**
   * Get all reports for an application
   */
  getReports(applicationId?: string): AccessibilityReport[] {
    if (applicationId) {
      return Array.from(this.reports.values())
        .filter(r => r.applicationId === applicationId)
        .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    }
    return Array.from(this.reports.values())
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  /**
   * Get a specific report
   */
  getReport(reportId: string): AccessibilityReport | null {
    return this.reports.get(reportId) || null;
  }

  /**
   * Create a report schedule
   */
  createSchedule(schedule: Omit<ReportSchedule, 'id' | 'nextRun'>): ReportSchedule {
    const id = `schedule-${Date.now()}`;
    const nextRun = this.calculateNextRun(schedule);
    
    const newSchedule: ReportSchedule = {
      id,
      ...schedule,
      nextRun,
    };

    this.schedules.set(id, newSchedule);
    return newSchedule;
  }

  /**
   * Calculate next run time for a schedule
   */
  private calculateNextRun(schedule: Omit<ReportSchedule, 'id' | 'nextRun'>): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    if (schedule.frequency === 'daily') {
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    } else if (schedule.frequency === 'weekly') {
      const dayDiff = (schedule.dayOfWeek! - nextRun.getDay() + 7) % 7;
      nextRun.setDate(nextRun.getDate() + (dayDiff === 0 && nextRun > now ? 0 : dayDiff));
    } else if (schedule.frequency === 'monthly') {
      nextRun.setDate(schedule.dayOfMonth!);
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    }

    return nextRun;
  }

  /**
   * Get all schedules
   */
  getSchedules(applicationId?: string): ReportSchedule[] {
    if (applicationId) {
      return Array.from(this.schedules.values())
        .filter(s => s.applicationId === applicationId);
    }
    return Array.from(this.schedules.values());
  }

  /**
   * Update a schedule
   */
  updateSchedule(scheduleId: string, updates: Partial<ReportSchedule>): ReportSchedule | null {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return null;

    const updated = { ...schedule, ...updates };
    if (updates.frequency || updates.time || updates.dayOfWeek || updates.dayOfMonth) {
      updated.nextRun = this.calculateNextRun(updated);
    }
    
    this.schedules.set(scheduleId, updated);
    return updated;
  }

  /**
   * Delete a schedule
   */
  deleteSchedule(scheduleId: string): boolean {
    return this.schedules.delete(scheduleId);
  }

  /**
   * Initialize mock data for demonstration
   */
  private initializeMockData(): void {
    // This would be replaced with actual database queries in production
    this.logger.log('Initializing mock accessibility report data');
  }
}

