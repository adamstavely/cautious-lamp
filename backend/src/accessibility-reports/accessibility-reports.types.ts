import type { EvidenceAccess } from '../governance/evidence-access';
import { ComplianceCheck } from '../governance/governance.types';
import { Frequency } from './schedule';
import { Conformance, ConformanceStatus, SlaStatus, WcagLevel } from './sla';

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
  /** Every failing element (failingElements lists at most a sample of them) */
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
  /**
   * Who may read the report: the application's workspace when it was
   * generated (evidence-access.ts). Reports stored before it existed are for
   * governance admins only.
   */
  access?: EvidenceAccess;
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
  /**
   * The level the automated checks verified (see WcagLevel): never AA when
   * criteria need review or the scan was HTML-only. Not a conformance claim.
   */
  wcagLevel: WcagLevel;
  /** What was and wasn't verified, separately from the score */
  conformance: Conformance;
  /** Automated scan score: 100 minus a penalty per failing A/AA criterion. Criteria needing review don't lower it; see conformance. */
  complianceScore: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  moderateIssues: number;
  lowIssues: number;
  infoIssues: number;
  /** axe rules that need a manual check */
  needsReview: number;
  /** The scheduled occurrence (its nextRun) this report was generated for */
  occurrence?: string;
  /**
   * Present when some rules failed on more elements than are kept as
   * examples. Counts, score and fixes use the full totals; `checks` and
   * `failingElements` only list the examples.
   */
  sampling?: { examplesPerRule: number; rules: Array<{ ruleId: string; shown: number; total: number }> };
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
  /** When the last occurrence finished (successfully, or for good) */
  lastRun?: string;
  /** dead-letter: the last occurrence failed every attempt and was given up (see deadLetters) */
  lastStatus?: 'success' | 'failed' | 'dead-letter';
  lastError?: string;
  lastReportId?: string;
  /**
   * The occurrence being run or waiting for a retry. nextRun only moves on
   * once it completes or is dead-lettered; a claim whose lease expired (the
   * instance running it died) is taken over by another instance.
   */
  pending?: PendingRun;
  /** Occurrences given up after the last attempt, newest first (at most 10) */
  deadLetters?: DeadLetter[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PendingRun {
  /** The nextRun being run (ISO); scheduled reports for it get a fixed id */
  occurrence: string;
  /** claimed: an instance is running it until leaseUntil; retry: the last attempt failed, the next is due at retryAt */
  state: 'claimed' | 'retry';
  attempts: number;
  /** Identifies the claiming run, so a run whose lease was taken over can't complete it */
  token: string;
  leaseUntil?: string;
  retryAt?: string;
  lastError?: string;
}

/** A schedule as clients see it: the scheduler's claim token and lease expiry are left out */
export type PublicReportSchedule = Omit<ReportSchedule, 'pending'> & { pending?: Omit<PendingRun, 'token' | 'leaseUntil'> };

export interface DeadLetter {
  occurrence: string;
  attempts: number;
  error: string;
  at: string;
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
  conformanceStatus: ConformanceStatus | null;
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
  /** The SLA's level couldn't be verified automatically (criteria need a manual check) */
  needsReviewApplications: number;
  /** No SLA or no report yet */
  unassessedApplications: number;
  /** Mean score over applications with a report (0 when none have one) */
  averageScore: number;
  applications: ApplicationComplianceSummary[];
}
