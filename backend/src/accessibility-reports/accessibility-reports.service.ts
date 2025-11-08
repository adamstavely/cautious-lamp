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
  highIssues: number;
  moderateIssues: number;
  lowIssues: number;
  infoIssues: number;
  
  // Breakdown by WCAG Criteria
  wcagCriteria: {
    [key: string]: {
      criterion: string;
      level: 'A' | 'AA' | 'AAA';
      status: 'pass' | 'fail' | 'warning';
      issues: number;
      description: string;
      failingElements: Array<{
        id: string;
        message: string;
        file?: string;
        line?: number;
        element?: string;
        impact?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';
      }>;
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
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';
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

  private mockDataInitialized = false;

  constructor(
    @Inject(forwardRef(() => DesignSystemService))
    private readonly designSystemService: DesignSystemService,
  ) {
    // Mock data will be initialized lazily on first access
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
    let highIssues = 0;
    let moderateIssues = 0;
    let lowIssues = 0;
    let infoIssues = 0;

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
      if (check.impact === 'CRITICAL') {
        criticalIssues++;
      } else if (check.impact === 'HIGH') {
        highIssues++;
      } else if (check.impact === 'MODERATE') {
        moderateIssues++;
      } else if (check.impact === 'LOW') {
        lowIssues++;
      } else if (check.impact === 'INFO') {
        infoIssues++;
      }
    });

    const totalIssues = accessibilityChecks.length;

    // Map to WCAG criteria first (needed for scoring)
    const wcagCriteria = this.mapToWCAGCriteria(accessibilityChecks);

    // Calculate compliance score based on WCAG 2.1 AA standards
    // WCAG 2.1 AA requires: All Level A criteria pass AND all Level AA criteria pass
    const levelACriteria = Object.values(wcagCriteria).filter(c => c.level === 'A');
    const levelAACriteria = Object.values(wcagCriteria).filter(c => c.level === 'AA');
    const levelAAACriteria = Object.values(wcagCriteria).filter(c => c.level === 'AAA');

    // Count failures by level
    const levelAFailures = levelACriteria.filter(c => c.status === 'fail').length;
    const levelAAFailures = levelAACriteria.filter(c => c.status === 'fail').length;
    const levelAWarnings = levelACriteria.filter(c => c.status === 'warning').length;
    const levelAAWarnings = levelAACriteria.filter(c => c.status === 'warning').length;

    // Calculate score: Start at 100, deduct for failures and warnings
    // Level A failures are more critical than Level AA failures
    let score = 100;
    score -= levelAFailures * 15; // Heavy penalty for Level A failures
    score -= levelAAFailures * 10; // Penalty for Level AA failures
    score -= levelAWarnings * 5; // Moderate penalty for Level A warnings
    score -= levelAAWarnings * 3; // Light penalty for Level AA warnings
    score = Math.max(0, Math.min(100, score));

    // Determine WCAG level based on WCAG 2.1 AA compliance
    // AA compliant: All Level A and Level AA criteria must pass (no failures)
    // AAA compliant: All Level A, AA, and AAA criteria must pass
    let wcagLevel: 'A' | 'AA' | 'AAA' | 'Non-Compliant' = 'Non-Compliant';
    
    if (levelAFailures === 0 && levelAAFailures === 0) {
      // Check AAA criteria if they exist
      const levelAAAFailures = levelAAACriteria.filter(c => c.status === 'fail').length;
      if (levelAAAFailures === 0 && levelAAACriteria.length > 0) {
        wcagLevel = 'AAA';
      } else {
        wcagLevel = 'AA'; // WCAG 2.1 AA compliant
      }
    } else if (levelAFailures === 0) {
      wcagLevel = 'A'; // Only Level A compliant
    }

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
      highIssues,
      moderateIssues,
      lowIssues,
      infoIssues,
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
      failingElements: Array<{
        id: string;
        message: string;
        file?: string;
        line?: number;
        element?: string;
        impact?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';
      }>;
    };
  } {
    const criteria: {
      [key: string]: {
        criterion: string;
        level: 'A' | 'AA' | 'AAA';
        status: 'pass' | 'fail' | 'warning';
        issues: number;
        description: string;
        failingElements: Array<{
          id: string;
          message: string;
          file?: string;
          line?: number;
          element?: string;
          impact?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';
        }>;
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
            failingElements: [],
          };
        }
        
        // Only add failing checks to the list
        if (check.status === 'error' || check.status === 'warning') {
          criteria[criterionKey].issues++;
          criteria[criterionKey].status = (check.impact === 'CRITICAL' || check.impact === 'HIGH') ? 'fail' : 'warning';
          criteria[criterionKey].failingElements.push({
            id: check.id,
            message: check.message,
            file: check.file,
            line: check.line,
            element: check.element,
            impact: check.impact,
          });
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
      // Determine severity from checks using new scale
      const hasCritical = ruleChecks.some(c => c.impact === 'CRITICAL');
      const hasHigh = ruleChecks.some(c => c.impact === 'HIGH');
      const hasModerate = ruleChecks.some(c => c.impact === 'MODERATE');
      const hasLow = ruleChecks.some(c => c.impact === 'LOW');
      
      const severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO' = 
        hasCritical ? 'CRITICAL' :
        hasHigh ? 'HIGH' :
        hasModerate ? 'MODERATE' :
        hasLow ? 'LOW' : 'INFO';

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
        CRITICAL: 10,
        HIGH: 7,
        MODERATE: 4,
        LOW: 1,
        INFO: 0.5,
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
    if (severity === 'CRITICAL') {
      return 'Blocks users with disabilities from accessing content';
    } else if (severity === 'HIGH') {
      return 'Significantly impacts user experience for users with disabilities';
    } else if (severity === 'MODERATE') {
      return 'Moderately impacts accessibility and user experience';
    } else if (severity === 'LOW') {
      return 'Minor accessibility concern';
    }
    return 'Informational accessibility note';
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
    // Initialize mock data on first access if not already done
    if (!this.mockDataInitialized && this.reports.size === 0) {
      this.logger.log('Initializing mock data on first getReports() call');
      this.initializeMockData();
      this.mockDataInitialized = true;
      this.logger.log(`Mock data initialized: ${this.reports.size} reports, ${this.schedules.size} schedules`);
    }

    const allReports = Array.from(this.reports.values());
    if (applicationId) {
      const filtered = allReports
        .filter(r => r.applicationId === applicationId)
        .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
      this.logger.log(`Returning ${filtered.length} reports for application ${applicationId}`);
      return filtered;
    }
    const sorted = allReports.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    this.logger.log(`Returning ${sorted.length} total reports`);
    return sorted;
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
    // Initialize mock data on first access if not already done
    if (!this.mockDataInitialized && this.schedules.size === 0) {
      this.initializeMockData();
      this.mockDataInitialized = true;
    }

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

    // Get available applications
    const allApps = this.designSystemService.getAllApplications();
    
    // Use existing applications or create placeholder IDs
    let app1, app2, app3;
    if (allApps.applications.length > 0) {
      app1 = allApps.applications[0];
      app2 = allApps.applications[1] || allApps.applications[0];
      app3 = allApps.applications[2] || allApps.applications[0];
    } else {
      // Create placeholder applications for mock data
      app1 = { id: 'mock-app-001', name: 'Sample Application 1' };
      app2 = { id: 'mock-app-002', name: 'Sample Application 2' };
      app3 = { id: 'mock-app-003', name: 'Sample Application 3' };
      this.logger.warn('No applications found, using placeholder IDs for mock data');
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Create mock reports for app1 (good compliance)
    const report1: AccessibilityReport = {
      id: 'report-mock-001',
      applicationId: app1.id,
      applicationName: app1.name,
      generatedAt: oneDayAgo,
      scheduled: false,
      wcagLevel: 'AA',
      complianceScore: 87,
      totalIssues: 12,
      criticalIssues: 0,
      highIssues: 3,
      moderateIssues: 6,
      lowIssues: 3,
      infoIssues: 0,
      wcagCriteria: {
        '1.1.1': {
          criterion: '1.1.1 Non-text Content',
          level: 'A',
          status: 'pass',
          issues: 0,
          description: 'All non-text content has text alternatives',
          failingElements: [],
        },
        '1.3.1': {
          criterion: '1.3.1 Info and Relationships',
          level: 'A',
          status: 'warning',
          issues: 2,
          description: 'Information, structure, and relationships are programmatically determinable',
          failingElements: [
            {
              id: 'check-1.3.1-001',
              message: 'Heading hierarchy skipped from h2 to h4 in components/Header.vue',
              file: 'components/Header.vue',
              line: 45,
              element: '<h4>Section Title</h4>',
              impact: 'MODERATE',
            },
            {
              id: 'check-1.3.1-002',
              message: 'List structure missing proper semantic markup in pages/Home.vue',
              file: 'pages/Home.vue',
              line: 120,
              element: '<div class="list-item">',
              impact: 'MODERATE',
            },
          ],
        },
        '1.4.3': {
          criterion: '1.4.3 Contrast (Minimum)',
          level: 'AA',
          status: 'warning',
          issues: 4,
          description: 'Text has a contrast ratio of at least 4.5:1',
          failingElements: [
            {
              id: 'check-1.4.3-001',
              message: 'Text color #999999 on white background has contrast ratio 2.8:1 in components/Button.vue',
              file: 'components/Button.vue',
              line: 23,
              element: '<button class="secondary">Click me</button>',
              impact: 'HIGH',
            },
            {
              id: 'check-1.4.3-002',
              message: 'Text color #cccccc on white background has contrast ratio 1.8:1 in components/Card.vue',
              file: 'components/Card.vue',
              line: 56,
              element: '<p class="subtitle">Card subtitle</p>',
              impact: 'HIGH',
            },
            {
              id: 'check-1.4.3-003',
              message: 'Text color #aaaaaa on white background has contrast ratio 2.1:1 in pages/About.vue',
              file: 'pages/About.vue',
              line: 78,
              element: '<span class="meta-text">Last updated</span>',
              impact: 'HIGH',
            },
            {
              id: 'check-1.4.3-004',
              message: 'Text color #bbbbbb on white background has contrast ratio 2.5:1 in components/Footer.vue',
              file: 'components/Footer.vue',
              line: 12,
              element: '<a href="/privacy">Privacy Policy</a>',
              impact: 'HIGH',
            },
          ],
        },
        '2.1.1': {
          criterion: '2.1.1 Keyboard',
          level: 'A',
          status: 'pass',
          issues: 0,
          description: 'All functionality is operable through a keyboard',
          failingElements: [],
        },
        '2.4.7': {
          criterion: '2.4.7 Focus Visible',
          level: 'AA',
          status: 'warning',
          issues: 3,
          description: 'Keyboard focus indicator is visible',
          failingElements: [
            {
              id: 'check-2.4.7-001',
              message: 'Button element missing visible focus indicator in components/Button.vue',
              file: 'components/Button.vue',
              line: 15,
              element: '<button class="primary">Submit</button>',
              impact: 'HIGH',
            },
            {
              id: 'check-2.4.7-002',
              message: 'Link element missing visible focus indicator in components/Nav.vue',
              file: 'components/Nav.vue',
              line: 32,
              element: '<a href="/about">About</a>',
              impact: 'HIGH',
            },
            {
              id: 'check-2.4.7-003',
              message: 'Input element missing visible focus indicator in components/Form.vue',
              file: 'components/Form.vue',
              line: 67,
              element: '<input type="text" name="email">',
              impact: 'HIGH',
            },
          ],
        },
        '3.3.2': {
          criterion: '3.3.2 Labels or Instructions',
          level: 'A',
          status: 'warning',
          issues: 2,
          description: 'Labels or instructions are provided when content requires user input',
          failingElements: [
            {
              id: 'check-3.3.2-001',
              message: 'Input field missing associated label in components/Form.vue',
              file: 'components/Form.vue',
              line: 45,
              element: '<input type="email" name="email">',
              impact: 'MODERATE',
            },
            {
              id: 'check-3.3.2-002',
              message: 'Textarea field missing associated label in components/ContactForm.vue',
              file: 'components/ContactForm.vue',
              line: 23,
              element: '<textarea name="message"></textarea>',
              impact: 'MODERATE',
            },
          ],
        },
        '4.1.2': {
          criterion: '4.1.2 Name, Role, Value',
          level: 'A',
          status: 'warning',
          issues: 1,
          description: 'For all user interface components, the name and role can be programmatically determined',
          failingElements: [
            {
              id: 'check-4.1.2-001',
              message: 'Custom button missing ARIA role and accessible name in components/CustomButton.vue',
              file: 'components/CustomButton.vue',
              line: 8,
              element: '<div class="button" @click="handleClick">Click</div>',
              impact: 'MODERATE',
            },
          ],
        },
      },
      issuesByCategory: {
        colorContrast: 4,
        keyboardNavigation: 0,
        ariaAttributes: 1,
        focusManagement: 3,
        altText: 0,
        headingHierarchy: 2,
        formLabels: 2,
        photosensitivity: 0,
        other: 0,
      },
      prioritizedFixes: [
        {
          id: 'fix-001',
          rule: 'Color Contrast (Minimum)',
          severity: 'HIGH',
          impact: 'Significantly impacts user experience for users with disabilities',
          effort: 'medium',
          priority: 14.0,
          affectedElements: 4,
          description: 'Text elements have insufficient color contrast ratios below WCAG 2.1 AA standards (4.5:1 for normal text)',
          recommendation: 'Ensure text has a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.',
          wcagCriterion: '1.4.3',
          checks: [],
        },
        {
          id: 'fix-002',
          rule: 'Focus Visible',
          severity: 'HIGH',
          impact: 'Significantly impacts user experience for users with disabilities',
          effort: 'low',
          priority: 10.5,
          affectedElements: 3,
          description: 'Keyboard focus indicators are not visible on interactive elements',
          recommendation: 'Ensure keyboard focus indicators are visible. Add focus styles to all interactive elements.',
          wcagCriterion: '2.4.7',
          checks: [],
        },
        {
          id: 'fix-003',
          rule: 'Heading Hierarchy',
          severity: 'MODERATE',
          impact: 'Moderately impacts accessibility and user experience',
          effort: 'low',
          priority: 4.0,
          affectedElements: 2,
          description: 'Heading hierarchy is not properly structured (skipped levels or incorrect nesting)',
          recommendation: 'Use proper heading hierarchy (h1, h2, h3, etc.) without skipping levels.',
          wcagCriterion: '1.3.1',
          checks: [],
        },
        {
          id: 'fix-004',
          rule: 'Form Labels',
          severity: 'MODERATE',
          impact: 'Moderately impacts accessibility and user experience',
          effort: 'low',
          priority: 4.0,
          affectedElements: 2,
          description: 'Form inputs are missing associated labels',
          recommendation: 'Associate all form inputs with labels using the "for" attribute or aria-label.',
          wcagCriterion: '3.3.2',
          checks: [],
        },
        {
          id: 'fix-005',
          rule: 'ARIA Attributes',
          severity: 'MODERATE',
          impact: 'Moderately impacts accessibility and user experience',
          effort: 'high',
          priority: 1.3,
          affectedElements: 1,
          description: 'Missing or incorrect ARIA attributes on interactive elements',
          recommendation: 'Add appropriate ARIA attributes to improve screen reader support. Ensure roles, labels, and states are properly defined.',
          wcagCriterion: '4.1.2',
          checks: [],
        },
      ],
      checks: [],
      trend: {
        scoreChange: 2.5,
        issuesChange: -3,
        newIssues: 1,
        fixedIssues: 4,
      },
    };

    // Create previous report for trend comparison
    const report1Previous: AccessibilityReport = {
      ...report1,
      id: 'report-mock-001-previous',
      generatedAt: threeDaysAgo,
      complianceScore: 84.5,
      totalIssues: 15,
      criticalIssues: 0,
      highIssues: 4,
      moderateIssues: 8,
      lowIssues: 3,
      infoIssues: 0,
      trend: {
        scoreChange: 0,
        issuesChange: 0,
        newIssues: 0,
        fixedIssues: 0,
      },
    };

    // Create mock report for app2 (needs improvement)
    const report2: AccessibilityReport = {
      id: 'report-mock-002',
      applicationId: app2.id,
      applicationName: app2.name,
      generatedAt: now,
      scheduled: true,
      scheduleId: 'schedule-mock-001',
      wcagLevel: 'A',
      complianceScore: 72,
      totalIssues: 28,
      criticalIssues: 2,
      highIssues: 8,
      moderateIssues: 12,
      lowIssues: 6,
      infoIssues: 0,
      wcagCriteria: {
        '1.1.1': {
          criterion: '1.1.1 Non-text Content',
          level: 'A',
          status: 'fail',
          issues: 5,
          description: 'All non-text content has text alternatives',
          failingElements: [
            {
              id: 'check-1.1.1-001',
              message: 'Image missing alt text in components/Hero.vue',
              file: 'components/Hero.vue',
              line: 12,
              element: '<img src="/hero.jpg">',
              impact: 'CRITICAL',
            },
            {
              id: 'check-1.1.1-002',
              message: 'Image missing alt text in components/Gallery.vue',
              file: 'components/Gallery.vue',
              line: 45,
              element: '<img src="/gallery-1.jpg">',
              impact: 'CRITICAL',
            },
            {
              id: 'check-1.1.1-003',
              message: 'Image missing alt text in pages/About.vue',
              file: 'pages/About.vue',
              line: 23,
              element: '<img src="/team.jpg">',
              impact: 'HIGH',
            },
            {
              id: 'check-1.1.1-004',
              message: 'Image missing alt text in components/ProductCard.vue',
              file: 'components/ProductCard.vue',
              line: 18,
              element: '<img src="/product.jpg">',
              impact: 'HIGH',
            },
            {
              id: 'check-1.1.1-005',
              message: 'Image missing alt text in components/Footer.vue',
              file: 'components/Footer.vue',
              line: 8,
              element: '<img src="/logo.png">',
              impact: 'HIGH',
            },
          ],
        },
        '1.4.3': {
          criterion: '1.4.3 Contrast (Minimum)',
          level: 'AA',
          status: 'fail',
          issues: 8,
          description: 'Text has a contrast ratio of at least 4.5:1',
          failingElements: [
            {
              id: 'check-1.4.3-001',
              message: 'Text color #888888 on white background has contrast ratio 3.2:1 in components/Button.vue',
              file: 'components/Button.vue',
              line: 15,
              element: '<button class="secondary">Learn More</button>',
              impact: 'HIGH',
            },
            {
              id: 'check-1.4.3-002',
              message: 'Text color #999999 on white background has contrast ratio 2.8:1 in components/Card.vue',
              file: 'components/Card.vue',
              line: 32,
              element: '<p class="subtitle">Card description</p>',
              impact: 'HIGH',
            },
            {
              id: 'check-1.4.3-003',
              message: 'Text color #aaaaaa on white background has contrast ratio 2.1:1 in pages/Home.vue',
              file: 'pages/Home.vue',
              line: 67,
              element: '<span class="meta">Published date</span>',
              impact: 'HIGH',
            },
            {
              id: 'check-1.4.3-004',
              message: 'Text color #bbbbbb on white background has contrast ratio 2.5:1 in components/Nav.vue',
              file: 'components/Nav.vue',
              line: 28,
              element: '<a href="/about">About Us</a>',
              impact: 'HIGH',
            },
            {
              id: 'check-1.4.3-005',
              message: 'Text color #777777 on white background has contrast ratio 3.8:1 in components/Footer.vue',
              file: 'components/Footer.vue',
              line: 15,
              element: '<p class="copyright">Copyright text</p>',
              impact: 'HIGH',
            },
            {
              id: 'check-1.4.3-006',
              message: 'Text color #cccccc on white background has contrast ratio 1.8:1 in components/Modal.vue',
              file: 'components/Modal.vue',
              line: 42,
              element: '<p class="help-text">Help information</p>',
              impact: 'HIGH',
            },
            {
              id: 'check-1.4.3-007',
              message: 'Text color #dddddd on white background has contrast ratio 1.4:1 in components/Tooltip.vue',
              file: 'components/Tooltip.vue',
              line: 19,
              element: '<span class="tooltip-text">Tooltip content</span>',
              impact: 'HIGH',
            },
            {
              id: 'check-1.4.3-008',
              message: 'Text color #666666 on white background has contrast ratio 4.1:1 in components/Form.vue',
              file: 'components/Form.vue',
              line: 56,
              element: '<label class="optional">Optional field</label>',
              impact: 'MODERATE',
            },
          ],
        },
        '2.1.1': {
          criterion: '2.1.1 Keyboard',
          level: 'A',
          status: 'fail',
          issues: 3,
          description: 'All functionality is operable through a keyboard',
          failingElements: [
            {
              id: 'check-2.1.1-001',
              message: 'Custom button element not keyboard accessible in components/CustomButton.vue',
              file: 'components/CustomButton.vue',
              line: 12,
              element: '<div class="button" @click="handleClick">Click me</div>',
              impact: 'CRITICAL',
            },
            {
              id: 'check-2.1.1-002',
              message: 'Interactive element has tabindex="-1" preventing keyboard access in components/Dropdown.vue',
              file: 'components/Dropdown.vue',
              line: 34,
              element: '<div class="dropdown-trigger" tabindex="-1">Menu</div>',
              impact: 'CRITICAL',
            },
            {
              id: 'check-2.1.1-003',
              message: 'Modal close button not keyboard accessible in components/Modal.vue',
              file: 'components/Modal.vue',
              line: 8,
              element: '<span class="close" @click="close">×</span>',
              impact: 'HIGH',
            },
          ],
        },
        '2.4.7': {
          criterion: '2.4.7 Focus Visible',
          level: 'AA',
          status: 'fail',
          issues: 6,
          description: 'Keyboard focus indicator is visible',
          failingElements: [
            {
              id: 'check-2.4.7-001',
              message: 'Button element missing visible focus indicator in components/Button.vue',
              file: 'components/Button.vue',
              line: 10,
              element: '<button class="primary">Submit</button>',
              impact: 'HIGH',
            },
            {
              id: 'check-2.4.7-002',
              message: 'Link element missing visible focus indicator in components/Nav.vue',
              file: 'components/Nav.vue',
              line: 25,
              element: '<a href="/products">Products</a>',
              impact: 'HIGH',
            },
            {
              id: 'check-2.4.7-003',
              message: 'Input element missing visible focus indicator in components/Form.vue',
              file: 'components/Form.vue',
              line: 45,
              element: '<input type="text" name="name">',
              impact: 'HIGH',
            },
            {
              id: 'check-2.4.7-004',
              message: 'Select element missing visible focus indicator in components/Form.vue',
              file: 'components/Form.vue',
              line: 52,
              element: '<select name="country">',
              impact: 'HIGH',
            },
            {
              id: 'check-2.4.7-005',
              message: 'Checkbox element missing visible focus indicator in components/Form.vue',
              file: 'components/Form.vue',
              line: 68,
              element: '<input type="checkbox" name="agree">',
              impact: 'HIGH',
            },
            {
              id: 'check-2.4.7-006',
              message: 'Radio button element missing visible focus indicator in components/Form.vue',
              file: 'components/Form.vue',
              line: 75,
              element: '<input type="radio" name="option">',
              impact: 'HIGH',
            },
          ],
        },
        '3.3.2': {
          criterion: '3.3.2 Labels or Instructions',
          level: 'A',
          status: 'warning',
          issues: 4,
          description: 'Labels or instructions are provided when content requires user input',
          failingElements: [
            {
              id: 'check-3.3.2-001',
              message: 'Input field missing associated label in components/Form.vue',
              file: 'components/Form.vue',
              line: 38,
              element: '<input type="email" name="email">',
              impact: 'MODERATE',
            },
            {
              id: 'check-3.3.2-002',
              message: 'Textarea field missing associated label in components/ContactForm.vue',
              file: 'components/ContactForm.vue',
              line: 20,
              element: '<textarea name="message"></textarea>',
              impact: 'MODERATE',
            },
            {
              id: 'check-3.3.2-003',
              message: 'Select field missing associated label in components/Form.vue',
              file: 'components/Form.vue',
              line: 52,
              element: '<select name="country">',
              impact: 'MODERATE',
            },
            {
              id: 'check-3.3.2-004',
              message: 'Checkbox missing associated label in components/Form.vue',
              file: 'components/Form.vue',
              line: 68,
              element: '<input type="checkbox" name="terms">',
              impact: 'MODERATE',
            },
          ],
        },
        '4.1.2': {
          criterion: '4.1.2 Name, Role, Value',
          level: 'A',
          status: 'fail',
          issues: 2,
          description: 'For all user interface components, the name and role can be programmatically determined',
          failingElements: [
            {
              id: 'check-4.1.2-001',
              message: 'Custom button missing ARIA role and accessible name in components/CustomButton.vue',
              file: 'components/CustomButton.vue',
              line: 12,
              element: '<div class="button" @click="handleClick">Click</div>',
              impact: 'HIGH',
            },
            {
              id: 'check-4.1.2-002',
              message: 'Icon button missing accessible name in components/IconButton.vue',
              file: 'components/IconButton.vue',
              line: 5,
              element: '<button><span class="icon">×</span></button>',
              impact: 'HIGH',
            },
          ],
        },
      },
      issuesByCategory: {
        colorContrast: 8,
        keyboardNavigation: 3,
        ariaAttributes: 2,
        focusManagement: 6,
        altText: 5,
        headingHierarchy: 2,
        formLabels: 4,
        photosensitivity: 0,
        other: 0,
      },
      prioritizedFixes: [
        {
          id: 'fix-006',
          rule: 'Alt Text Missing',
          severity: 'CRITICAL',
          impact: 'Blocks users with disabilities from accessing content',
          effort: 'low',
          priority: 50.0,
          affectedElements: 5,
          description: 'Images are missing alt text attributes, preventing screen reader users from understanding image content',
          recommendation: 'Add descriptive alt text to all images. Use empty alt="" for decorative images.',
          wcagCriterion: '1.1.1',
          checks: [],
        },
        {
          id: 'fix-007',
          rule: 'Color Contrast (Minimum)',
          severity: 'HIGH',
          impact: 'Significantly impacts user experience for users with disabilities',
          effort: 'medium',
          priority: 40.0,
          affectedElements: 8,
          description: 'Text elements have insufficient color contrast ratios below WCAG 2.1 AA standards',
          recommendation: 'Ensure text has a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.',
          wcagCriterion: '1.4.3',
          checks: [],
        },
        {
          id: 'fix-008',
          rule: 'Keyboard Navigation',
          severity: 'CRITICAL',
          impact: 'Blocks users with disabilities from accessing content',
          effort: 'high',
          priority: 7.0,
          affectedElements: 3,
          description: 'Interactive elements are not keyboard accessible',
          recommendation: 'Ensure all interactive elements are keyboard accessible. Remove tabindex="-1" from interactive elements or provide alternative keyboard access.',
          wcagCriterion: '2.1.1',
          checks: [],
        },
        {
          id: 'fix-009',
          rule: 'Focus Visible',
          severity: 'HIGH',
          impact: 'Significantly impacts user experience for users with disabilities',
          effort: 'low',
          priority: 21.0,
          affectedElements: 6,
          description: 'Keyboard focus indicators are not visible on interactive elements',
          recommendation: 'Ensure keyboard focus indicators are visible. Add focus styles to all interactive elements.',
          wcagCriterion: '2.4.7',
          checks: [],
        },
        {
          id: 'fix-010',
          rule: 'Form Labels',
          severity: 'MODERATE',
          impact: 'Moderately impacts accessibility and user experience',
          effort: 'low',
          priority: 8.0,
          affectedElements: 4,
          description: 'Form inputs are missing associated labels',
          recommendation: 'Associate all form inputs with labels using the "for" attribute or aria-label.',
          wcagCriterion: '3.3.2',
          checks: [],
        },
        {
          id: 'fix-011',
          rule: 'ARIA Attributes',
          severity: 'HIGH',
          impact: 'Significantly impacts user experience for users with disabilities',
          effort: 'high',
          priority: 2.7,
          affectedElements: 2,
          description: 'Missing or incorrect ARIA attributes on interactive elements',
          recommendation: 'Add appropriate ARIA attributes to improve screen reader support. Ensure roles, labels, and states are properly defined.',
          wcagCriterion: '4.1.2',
          checks: [],
        },
      ],
      checks: [],
      trend: {
        scoreChange: -1.2,
        issuesChange: 2,
        newIssues: 5,
        fixedIssues: 3,
      },
    };

    // Create mock report for app3 (excellent compliance)
    const report3: AccessibilityReport = {
      id: 'report-mock-003',
      applicationId: app3.id,
      applicationName: app3.name,
      generatedAt: oneWeekAgo,
      scheduled: false,
      wcagLevel: 'AAA',
      complianceScore: 98,
      totalIssues: 1,
      criticalIssues: 0,
      highIssues: 0,
      moderateIssues: 0,
      lowIssues: 1,
      infoIssues: 0,
      wcagCriteria: {
        '1.1.1': {
          criterion: '1.1.1 Non-text Content',
          level: 'A',
          status: 'pass',
          issues: 0,
          description: 'All non-text content has text alternatives',
          failingElements: [],
        },
        '1.3.1': {
          criterion: '1.3.1 Info and Relationships',
          level: 'A',
          status: 'pass',
          issues: 0,
          description: 'Information, structure, and relationships are programmatically determinable',
          failingElements: [],
        },
        '1.4.3': {
          criterion: '1.4.3 Contrast (Minimum)',
          level: 'AA',
          status: 'pass',
          issues: 0,
          description: 'Text has a contrast ratio of at least 4.5:1',
          failingElements: [],
        },
        '2.1.1': {
          criterion: '2.1.1 Keyboard',
          level: 'A',
          status: 'pass',
          issues: 0,
          description: 'All functionality is operable through a keyboard',
          failingElements: [],
        },
        '2.4.7': {
          criterion: '2.4.7 Focus Visible',
          level: 'AA',
          status: 'pass',
          issues: 0,
          description: 'Keyboard focus indicator is visible',
          failingElements: [],
        },
        '3.3.2': {
          criterion: '3.3.2 Labels or Instructions',
          level: 'A',
          status: 'pass',
          issues: 0,
          description: 'Labels or instructions are provided when content requires user input',
          failingElements: [],
        },
        '4.1.2': {
          criterion: '4.1.2 Name, Role, Value',
          level: 'A',
          status: 'warning',
          issues: 1,
          description: 'For all user interface components, the name and role can be programmatically determined',
          failingElements: [
            {
              id: 'check-4.1.2-001',
              message: 'One interactive element could benefit from additional ARIA attributes for better screen reader support in components/IconButton.vue',
              file: 'components/IconButton.vue',
              line: 12,
              element: '<button aria-label="Close"><span class="icon">×</span></button>',
              impact: 'LOW',
            },
          ],
        },
      },
      issuesByCategory: {
        colorContrast: 0,
        keyboardNavigation: 0,
        ariaAttributes: 1,
        focusManagement: 0,
        altText: 0,
        headingHierarchy: 0,
        formLabels: 0,
        photosensitivity: 0,
        other: 0,
      },
      prioritizedFixes: [
        {
          id: 'fix-012',
          rule: 'ARIA Attributes',
          severity: 'LOW',
          impact: 'Minor accessibility concern',
          effort: 'low',
          priority: 0.3,
          affectedElements: 1,
          description: 'One interactive element could benefit from additional ARIA attributes for better screen reader support',
          recommendation: 'Add appropriate ARIA attributes to improve screen reader support. Ensure roles, labels, and states are properly defined.',
          wcagCriterion: '4.1.2',
          checks: [],
        },
      ],
      checks: [],
      trend: {
        scoreChange: 0.5,
        issuesChange: -1,
        newIssues: 0,
        fixedIssues: 1,
      },
    };

    // Store reports
    this.reports.set(report1.id, report1);
    this.reports.set(report1Previous.id, report1Previous);
    this.reports.set(report2.id, report2);
    this.reports.set(report3.id, report3);

    // Create mock schedules
    const schedule1: ReportSchedule = {
      id: 'schedule-mock-001',
      applicationId: app2.id,
      frequency: 'weekly',
      dayOfWeek: 1, // Monday
      time: '09:00',
      enabled: true,
      lastRun: oneDayAgo,
      nextRun: this.calculateNextRun({
        applicationId: app2.id,
        frequency: 'weekly',
        dayOfWeek: 1,
        time: '09:00',
        enabled: true,
        recipients: ['dev-team@example.com', 'accessibility@example.com'],
      }),
      recipients: ['dev-team@example.com', 'accessibility@example.com'],
    };

    const schedule2: ReportSchedule = {
      id: 'schedule-mock-002',
      applicationId: app1.id,
      frequency: 'daily',
      time: '08:00',
      enabled: true,
      lastRun: oneDayAgo,
      nextRun: this.calculateNextRun({
        applicationId: app1.id,
        frequency: 'daily',
        time: '08:00',
        enabled: true,
        recipients: ['product-manager@example.com'],
      }),
      recipients: ['product-manager@example.com'],
    };

    const schedule3: ReportSchedule = {
      id: 'schedule-mock-003',
      applicationId: app3.id,
      frequency: 'monthly',
      dayOfMonth: 1,
      time: '10:00',
      enabled: false,
      lastRun: oneWeekAgo,
      nextRun: this.calculateNextRun({
        applicationId: app3.id,
        frequency: 'monthly',
        dayOfMonth: 1,
        time: '10:00',
        enabled: false,
        recipients: ['qa-team@example.com'],
      }),
      recipients: ['qa-team@example.com'],
    };

    // Store schedules
    this.schedules.set(schedule1.id, schedule1);
    this.schedules.set(schedule2.id, schedule2);
    this.schedules.set(schedule3.id, schedule3);

    this.logger.log(`Initialized ${this.reports.size} mock reports and ${this.schedules.size} mock schedules`);
    this.logger.log(`Report IDs: ${Array.from(this.reports.keys()).join(', ')}`);
    this.logger.log(`Schedule IDs: ${Array.from(this.schedules.keys()).join(', ')}`);
  }
}

