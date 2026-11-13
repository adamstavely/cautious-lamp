import { ComplianceCheck } from '../governance/governance.types';
import { Frequency } from './schedule';
import { SlaStatus, WcagLevel } from './sla';

export type Impact = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';

export interface FailingElement {
  id: string;
  message: string;
  element?: string;
  target?: string;
  impact?: Impact;
}

export interface WcagCriterionResult {
  criterion: string;
  level: 'A' | 'AA' | 'AAA';
  /** review: axe could not decide (e.g. contrast without layout) */
  status: 'pass' | 'fail' | 'review';
  issues: number;
  description: string;
  failingElements: FailingElement[];
}

export interface IssuesByCategory {
  colorContrast: number;
  keyboardNavigation: number;
  ariaAttributes: number;
  focusManagement: number;
  altText: number;
  headingHierarchy: number;
  formLabels: number;
  other: number;
}

export interface PrioritizedFix {
  id: string;
  rule: string;
  ruleId: string;
  severity: Impact;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  priority: number;
  affectedElements: number;
  description: string;
  recommendation: string;
  helpUrl?: string;
  wcagCriterion: string;
  codeExamples?: Array<{ before: string; after: string; language: 'html' | 'vue' | 'css'; explanation: string }>;
}

export interface ReportTrend {
  scoreChange: number;
  issuesChange: number;
  newIssues: number;
  fixedIssues: number;
}

export interface AccessibilityReport {
  id: string;
  applicationId: string;
  applicationName: string;
  generatedAt: string;
  /** Same as generatedAt; lets the store list newest first */
  createdAt?: string;
  scheduled: boolean;
  scheduleId?: string;
  source: 'url' | 'html';
  /** The page that was scanned (URL scans) */
  url?: string;
  engine: 'jsdom' | 'playwright';
  /** Highest WCAG level with no automated failures (A/AA rules only; automated tests can't prove conformance) */
  wcagLevel: WcagLevel;
  complianceScore: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  moderateIssues: number;
  lowIssues: number;
  infoIssues: number;
  /** axe rules that need a manual check */
  needsReview: number;
  wcagCriteria: Record<string, WcagCriterionResult>;
  issuesByCategory: IssuesByCategory;
  prioritizedFixes: PrioritizedFix[];
  checks: ComplianceCheck[];
  previousReportId?: string;
  trend: ReportTrend;
  createdBy: string;
}

export interface ReportSchedule {
  id: string;
  applicationId: string;
  /** Page to scan; falls back to the application's URL */
  url?: string;
  frequency: Frequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  /** HH:mm UTC */
  time: string;
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
  lastStatus?: 'success' | 'failed';
  lastError?: string;
  lastReportId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ComplianceSLA {
  id: string;
  applicationId: string;
  targetScore: number;
  targetLevel: 'A' | 'AA' | 'AAA';
  criticalIssuesThreshold: number;
  highIssuesThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationComplianceSummary {
  applicationId: string;
  applicationName: string;
  latestReportId?: string;
  complianceScore: number | null;
  wcagLevel: WcagLevel | null;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  slaStatus: SlaStatus;
  lastReportDate?: string;
  trend?: { scoreChange: number; issuesChange: number };
}

export interface MultiApplicationComplianceSummary {
  totalApplications: number;
  /** Applications with at least one report */
  reportedApplications: number;
  compliantApplications: number;
  atRiskApplications: number;
  nonCompliantApplications: number;
  /** No SLA or no report yet */
  unassessedApplications: number;
  /** Mean score over applications with a report (0 when none have one) */
  averageScore: number;
  applications: ApplicationComplianceSummary[];
}
