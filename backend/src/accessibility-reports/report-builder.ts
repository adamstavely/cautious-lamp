import { ComplianceCheck } from '../governance/governance.types';
import {
  AccessibilityReport,
  Impact,
  IssuesByCategory,
  PrioritizedFix,
  ReportTrend,
  WcagCriterionResult,
} from './accessibility-reports.types';
import { AxeOutcome, AxeRuleResult } from './axe-engine';
import { WcagLevel } from './sla';

const IMPACT: Record<string, Impact> = { critical: 'CRITICAL', serious: 'HIGH', moderate: 'MODERATE', minor: 'LOW' };

/** Score deducted for each failing criterion, by level */
export const LEVEL_PENALTY = { A: 15, AA: 10, AAA: 5 } as const;

const CRITERION_NAMES: Record<string, string> = {
  '1.1.1': 'Non-text Content',
  '1.3.1': 'Info and Relationships',
  '1.3.5': 'Identify Input Purpose',
  '1.4.1': 'Use of Color',
  '1.4.3': 'Contrast (Minimum)',
  '1.4.4': 'Resize Text',
  '1.4.12': 'Text Spacing',
  '2.1.1': 'Keyboard',
  '2.2.1': 'Timing Adjustable',
  '2.2.2': 'Pause, Stop, Hide',
  '2.4.1': 'Bypass Blocks',
  '2.4.2': 'Page Titled',
  '2.4.4': 'Link Purpose (In Context)',
  '2.5.3': 'Label in Name',
  '2.5.8': 'Target Size (Minimum)',
  '3.1.1': 'Language of Page',
  '3.1.2': 'Language of Parts',
  '3.3.2': 'Labels or Instructions',
  '4.1.1': 'Parsing',
  '4.1.2': 'Name, Role, Value',
};

/** WCAG success criteria ("1.4.3") an axe rule maps to, from tags like `wcag143` */
export function criteriaFor(rule: Pick<AxeRuleResult, 'tags'>): string[] {
  return rule.tags.map((tag) => /^wcag(\d)(\d)(\d{1,2})$/.exec(tag)).filter(Boolean).map((m) => `${m![1]}.${m![2]}.${m![3]}`);
}

/** The WCAG level an axe rule tests, from tags like `wcag2aa` */
export function levelFor(rule: Pick<AxeRuleResult, 'tags'>): 'A' | 'AA' | 'AAA' {
  if (rule.tags.some((t) => /^wcag2\d?aaa$/.test(t))) return 'AAA';
  if (rule.tags.some((t) => /^wcag2\d?aa$/.test(t))) return 'AA';
  return 'A';
}

export function categoryFor(ruleId: string): keyof IssuesByCategory {
  if (ruleId.includes('color-contrast')) return 'colorContrast';
  if (/(^|-)alt$|alt-|image|svg-img/.test(ruleId)) return 'altText';
  if (/^(label|select-name|form-field|input-button-name|autocomplete)/.test(ruleId)) return 'formLabels';
  if (/heading|page-has-heading/.test(ruleId)) return 'headingHierarchy';
  if (/^aria-|^role-|button-name|link-name/.test(ruleId)) return 'ariaAttributes';
  if (/tabindex|accesskeys|scrollable-region|nested-interactive|frame-focusable|bypass|skip-link/.test(ruleId)) return 'keyboardNavigation';
  if (/focus/.test(ruleId)) return 'focusManagement';
  return 'other';
}

const EFFORT: Record<keyof IssuesByCategory, PrioritizedFix['effort']> = {
  altText: 'low',
  formLabels: 'low',
  headingHierarchy: 'low',
  colorContrast: 'medium',
  other: 'medium',
  focusManagement: 'medium',
  ariaAttributes: 'high',
  keyboardNavigation: 'high',
};

const SEVERITY_WEIGHT: Record<Impact, number> = { CRITICAL: 10, HIGH: 7, MODERATE: 4, LOW: 1, INFO: 0.5 };
const EFFORT_WEIGHT = { low: 1, medium: 2, high: 3 };

const IMPACT_TEXT: Record<Impact, string> = {
  CRITICAL: 'Blocks some people with disabilities from using the content',
  HIGH: 'Seriously impairs use for people with disabilities',
  MODERATE: 'Makes the content harder to use for some people',
  LOW: 'Minor inconvenience for some people',
  INFO: 'Informational',
};

const CODE_EXAMPLES: Partial<Record<keyof IssuesByCategory, PrioritizedFix['codeExamples']>> = {
  altText: [
    { before: '<img src="hero.jpg" />', after: '<img src="hero.jpg" alt="Aerial view of the city at sunset" />', language: 'html', explanation: 'Describe what the image conveys.' },
    { before: '<img src="divider.png" alt="Decorative line" />', after: '<img src="divider.png" alt="" />', language: 'html', explanation: 'Decorative images get an empty alt.' },
  ],
  colorContrast: [
    { before: '.text { color: #999; }', after: '.text { color: #595959; }', language: 'css', explanation: 'Normal text needs 4.5:1 contrast (3:1 for large text).' },
  ],
  keyboardNavigation: [
    { before: '<div onclick="save()">Save</div>', after: '<button type="button" onclick="save()">Save</button>', language: 'html', explanation: 'Native controls are focusable and keyboard operable.' },
  ],
  focusManagement: [
    { before: '.button:focus { outline: none; }', after: '.button:focus-visible { outline: 2px solid #0066cc; outline-offset: 2px; }', language: 'css', explanation: 'Keep a visible focus indicator.' },
  ],
  ariaAttributes: [
    { before: '<button><svg>…</svg></button>', after: '<button aria-label="Close"><svg aria-hidden="true">…</svg></button>', language: 'html', explanation: 'Every control needs an accessible name.' },
  ],
  formLabels: [
    { before: '<input type="email" name="email" />', after: '<label for="email">Email</label>\n<input type="email" id="email" name="email" />', language: 'html', explanation: 'Associate a visible label with each field.' },
  ],
  headingHierarchy: [
    { before: '<h1>Title</h1>\n<h3>Subtitle</h3>', after: '<h1>Title</h1>\n<h2>Subtitle</h2>', language: 'html', explanation: "Don't skip heading levels." },
  ],
};

const fingerprint = (ruleId: string, target: string) => `${ruleId}|${target}`;

export interface BuildReportInput {
  id: string;
  applicationId: string;
  applicationName: string;
  generatedAt: Date;
  source: 'url' | 'html';
  scheduled?: boolean;
  scheduleId?: string;
  createdBy: string;
}

/** Turns axe-core results into a report: WCAG criteria, score, level, fixes and trend */
export function buildReport(outcome: AxeOutcome, input: BuildReportInput, previous?: AccessibilityReport | null): AccessibilityReport {
  const criteria: Record<string, WcagCriterionResult> = {};
  const ensure = (key: string, rule: AxeRuleResult): WcagCriterionResult =>
    (criteria[key] ??= {
      criterion: `${key} ${CRITERION_NAMES[key] ?? rule.help}`,
      level: levelFor(rule),
      status: 'pass',
      issues: 0,
      description: rule.description,
      failingElements: [],
    });

  for (const rule of outcome.passes) for (const key of criteriaFor(rule)) ensure(key, rule);
  for (const rule of outcome.incomplete) {
    for (const key of criteriaFor(rule)) {
      const c = ensure(key, rule);
      if (c.status === 'pass') c.status = 'review';
    }
  }

  const issuesByCategory: IssuesByCategory = {
    colorContrast: 0,
    keyboardNavigation: 0,
    ariaAttributes: 0,
    focusManagement: 0,
    altText: 0,
    headingHierarchy: 0,
    formLabels: 0,
    other: 0,
  };
  const counts: Record<Impact, number> = { CRITICAL: 0, HIGH: 0, MODERATE: 0, LOW: 0, INFO: 0 };
  const checks: ComplianceCheck[] = [];
  const fixes: PrioritizedFix[] = [];

  for (const rule of outcome.violations) {
    const impact = IMPACT[rule.impact ?? ''] ?? 'MODERATE';
    const category = categoryFor(rule.id);
    const keys = criteriaFor(rule);
    for (const node of rule.nodes) {
      counts[impact]++;
      issuesByCategory[category]++;
      const id = fingerprint(rule.id, node.target);
      checks.push({
        id,
        ruleId: rule.id,
        rule: rule.help,
        status: impact === 'CRITICAL' || impact === 'HIGH' ? 'error' : 'warning',
        message: node.failureSummary || rule.description,
        element: node.html,
        impact,
      });
      for (const key of keys) {
        const c = ensure(key, rule);
        c.status = 'fail';
        c.issues++;
        c.failingElements.push({ id, message: `${rule.help} (${rule.id})`, element: node.html, target: node.target, impact });
      }
    }
    const effort = EFFORT[category];
    fixes.push({
      id: `fix-${rule.id}`,
      rule: rule.help,
      ruleId: rule.id,
      severity: impact,
      impact: IMPACT_TEXT[impact],
      effort,
      priority: Math.round(((SEVERITY_WEIGHT[impact] * rule.nodes.length) / EFFORT_WEIGHT[effort]) * 10) / 10,
      affectedElements: rule.nodes.length,
      description: rule.description,
      recommendation: rule.help,
      helpUrl: rule.helpUrl || undefined,
      wcagCriterion: keys[0] ?? 'best practice',
      codeExamples: CODE_EXAMPLES[category],
    });
  }

  const failing = Object.values(criteria).filter((c) => c.status === 'fail');
  const score = Math.max(0, 100 - failing.reduce((sum, c) => sum + LEVEL_PENALTY[c.level], 0));
  let wcagLevel: WcagLevel = 'AA';
  if (failing.some((c) => c.level === 'A')) wcagLevel = 'Non-Compliant';
  else if (failing.some((c) => c.level === 'AA')) wcagLevel = 'A';

  const totalIssues = checks.length;
  const trend: ReportTrend = { scoreChange: 0, issuesChange: 0, newIssues: 0, fixedIssues: 0 };
  if (previous) {
    const before = new Set(previous.checks.map((c) => c.id));
    const now = new Set(checks.map((c) => c.id));
    trend.scoreChange = score - previous.complianceScore;
    trend.issuesChange = totalIssues - previous.totalIssues;
    trend.newIssues = checks.filter((c) => !before.has(c.id)).length;
    trend.fixedIssues = previous.checks.filter((c) => !now.has(c.id)).length;
  }

  return {
    id: input.id,
    applicationId: input.applicationId,
    applicationName: input.applicationName,
    generatedAt: input.generatedAt.toISOString(),
    scheduled: !!input.scheduled,
    scheduleId: input.scheduleId,
    source: input.source,
    url: outcome.url,
    engine: outcome.engine,
    wcagLevel,
    complianceScore: score,
    totalIssues,
    criticalIssues: counts.CRITICAL,
    highIssues: counts.HIGH,
    moderateIssues: counts.MODERATE,
    lowIssues: counts.LOW,
    infoIssues: counts.INFO,
    needsReview: outcome.incomplete.length,
    wcagCriteria: Object.fromEntries(Object.entries(criteria).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))),
    issuesByCategory,
    prioritizedFixes: fixes.sort((a, b) => b.priority - a.priority),
    checks,
    previousReportId: previous?.id,
    trend,
    createdBy: input.createdBy,
  };
}
