/**
 * The level a report's automated checks verified (report-builder.ts):
 * `Non-Compliant` when a level A criterion failed, `Unverified` when none
 * failed but level A isn't fully verified (criteria need manual review), `A`
 * or `AA` when every criterion up to that level passed with nothing left to
 * review. Automated checks never prove conformance, and HTML-only scans
 * never reach `AA`. `AAA` is only ever an SLA target.
 */
export type WcagLevel = 'A' | 'AA' | 'AAA' | 'Non-Compliant' | 'Unverified';

/** What the automated checks could say, separately from the score */
export type ConformanceStatus = 'failing' | 'needs-review' | 'no-automated-failures';

export interface Conformance {
  /**
   * - `failing`: a level A or AA criterion has automated failures
   * - `needs-review`: no failures, but some A/AA criteria couldn't be decided
   *   automatically, or the HTML was checked without rendering it
   * - `no-automated-failures`: a rendered page passed every automated A/AA
   *   check with nothing to review. Still not a conformance claim.
   */
  status: ConformanceStatus;
  /** Highest level with no automated failures (null: a level A criterion failed) */
  noFailuresUpTo: 'A' | 'AA' | null;
  /** Highest level whose criteria all passed with nothing to review (null: not even A) */
  verifiedUpTo: 'A' | 'AA' | null;
  /** A/AA criteria that need a manual check (e.g. "1.4.3") */
  reviewCriteria: string[];
  /** False for HTML-only scans: layout-dependent criteria (contrast, focus visible, target size…) weren't tested */
  rendered: boolean;
  /** Worked out from an older stored report that didn't record it (conservatively) */
  derived?: boolean;
}

export interface SlaTargets {
  targetScore: number;
  targetLevel: 'A' | 'AA' | 'AAA';
  criticalIssuesThreshold: number;
  highIssuesThreshold: number;
}

export interface ReportFigures {
  complianceScore: number;
  wcagLevel: WcagLevel;
  criticalIssues: number;
  highIssues: number;
  /** Older stored reports lack it; read them through withConformance (report-builder.ts) first */
  conformance?: Pick<Conformance, 'noFailuresUpTo' | 'verifiedUpTo'>;
}

/**
 * - `no-sla`: the application has no SLA, so there is nothing to be compliant with
 * - `no-report`: there is an SLA but no report yet
 * - `non-compliant`: below the target score or level, or more critical issues than allowed
 * - `at-risk`: more high issues than allowed, or right at a limit (score within
 *   5 points of the target, or critical/high issues exactly at a non-zero threshold)
 * - `needs-review`: nothing above applies, but the automated checks couldn't
 *   verify every criterion up to the target level (criteria need a manual
 *   check, the scan was HTML-only and the target is AA, or the target is AAA,
 *   which no automated rule tests). Not counted as compliant.
 * - `compliant`: otherwise
 */
export type SlaStatus = 'compliant' | 'at-risk' | 'needs-review' | 'non-compliant' | 'no-sla' | 'no-report';

const rank = (level: 'A' | 'AA' | 'AAA' | null) => (level === null ? 0 : { A: 1, AA: 2, AAA: 3 }[level]);

/** Points above the target score that still count as at risk */
export const SCORE_MARGIN = 5;

export function evaluateSla(sla: SlaTargets | null | undefined, report: ReportFigures | null | undefined): SlaStatus {
  if (!sla) return 'no-sla';
  if (!report) return 'no-report';
  // Without the breakdown (callers that skipped withConformance), trust nothing beyond outright failure
  const conformance = report.conformance ?? { noFailuresUpTo: report.wcagLevel === 'Non-Compliant' ? null : report.wcagLevel === 'AA' ? 'AA' : 'A', verifiedUpTo: null };
  if (report.complianceScore < sla.targetScore) return 'non-compliant';
  // Automated rules only go up to AA: an AAA target fails on AA failures, and is otherwise unverifiable
  if (rank(conformance.noFailuresUpTo) < Math.min(rank(sla.targetLevel), rank('AA'))) return 'non-compliant';
  if (report.criticalIssues > sla.criticalIssuesThreshold) return 'non-compliant';
  if (report.highIssues > sla.highIssuesThreshold) return 'at-risk';
  const atLimit = (count: number, threshold: number) => threshold > 0 && count === threshold;
  if (atLimit(report.criticalIssues, sla.criticalIssuesThreshold) || atLimit(report.highIssues, sla.highIssuesThreshold)) return 'at-risk';
  if (report.complianceScore < Math.min(100, sla.targetScore + SCORE_MARGIN)) return 'at-risk';
  if (rank(conformance.verifiedUpTo) < rank(sla.targetLevel)) return 'needs-review';
  return 'compliant';
}
