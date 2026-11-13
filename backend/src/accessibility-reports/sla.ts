export type WcagLevel = 'A' | 'AA' | 'AAA' | 'Non-Compliant';

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
}

/**
 * - `no-sla`: the application has no SLA, so there is nothing to be compliant with
 * - `no-report`: there is an SLA but no report yet
 * - `non-compliant`: below the target score or level, or more critical issues than allowed
 * - `at-risk`: more high issues than allowed, or right at a limit (score within
 *   5 points of the target, or critical/high issues exactly at a non-zero threshold)
 * - `compliant`: otherwise
 */
export type SlaStatus = 'compliant' | 'at-risk' | 'non-compliant' | 'no-sla' | 'no-report';

const LEVEL_ORDER: Record<WcagLevel, number> = { 'Non-Compliant': 0, A: 1, AA: 2, AAA: 3 };

/** Points above the target score that still count as at risk */
export const SCORE_MARGIN = 5;

export function evaluateSla(sla: SlaTargets | null | undefined, report: ReportFigures | null | undefined): SlaStatus {
  if (!sla) return 'no-sla';
  if (!report) return 'no-report';
  if (report.complianceScore < sla.targetScore) return 'non-compliant';
  if (LEVEL_ORDER[report.wcagLevel] < LEVEL_ORDER[sla.targetLevel]) return 'non-compliant';
  if (report.criticalIssues > sla.criticalIssuesThreshold) return 'non-compliant';
  if (report.highIssues > sla.highIssuesThreshold) return 'at-risk';
  const atLimit = (count: number, threshold: number) => threshold > 0 && count === threshold;
  if (atLimit(report.criticalIssues, sla.criticalIssuesThreshold) || atLimit(report.highIssues, sla.highIssuesThreshold)) return 'at-risk';
  if (report.complianceScore < Math.min(100, sla.targetScore + SCORE_MARGIN)) return 'at-risk';
  return 'compliant';
}
