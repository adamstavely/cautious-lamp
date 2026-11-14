/**
 * Governance (compliance rules and scans). Rules are declarative data run by
 * one interpreter (rule-interpreter.ts); no rule, request or stored document
 * ever contains code. See docs/GOVERNANCE.md.
 */

export const RULE_TYPES = ['regex-present', 'regex-absent', 'selector-attribute', 'selector-count', 'token-usage', 'builtin'] as const;
export type RuleType = (typeof RULE_TYPES)[number];

export const RULE_TARGETS = ['html', 'css', 'javascript'] as const;
export type RuleTarget = (typeof RULE_TARGETS)[number];

export const RULE_CATEGORIES = ['design-system', 'ux-hcd', 'accessibility', 'custom'] as const;
export type RuleCategory = (typeof RULE_CATEGORIES)[number];

export const RULE_SEVERITIES = ['error', 'warning', 'info'] as const;
export type RuleSeverity = (typeof RULE_SEVERITIES)[number];

/** Checks implemented in the server, referenced by id from `type: 'builtin'` rules */
export const BUILTIN_CHECKS = ['axe', 'heading-order', 'form-labels', 'component-naming'] as const;
export type BuiltinCheck = (typeof BUILTIN_CHECKS)[number];

/** Allowed regex flags (the interpreter adds `g` itself) */
export const REGEX_FLAGS = ['i', 'm', 's'] as const;

/** The part of a rule that decides what it checks */
export interface RuleDefinition {
  name: string;
  description: string;
  category: RuleCategory;
  severity: RuleSeverity;
  enabled: boolean;
  type: RuleType;
  target: RuleTarget;
  /** regex-* rules; also optional for selector-attribute (the attribute value must match) */
  pattern?: string;
  flags?: string;
  /** selector-* rules */
  selector?: string;
  /** selector-attribute: one attribute name, or several separated by `|` (any of them) */
  attribute?: string;
  /** selector-count bounds (inclusive) */
  min?: number;
  max?: number;
  /** token-usage: CSS properties to check; a trailing `*` matches a prefix (`margin*`) */
  properties?: string[];
  /** token-usage: values accepted besides `var(--…)` and design token values */
  allowedValues?: string[];
  /** builtin rules */
  builtin?: BuiltinCheck;
  /** Shown for each violation */
  message: string;
}

export interface GovernanceRule extends RuleDefinition {
  id: string;
  /** Seeded from the built-in set (still editable) */
  builtIn: boolean;
  /** Bumped on every change; scans record the version they ran */
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type CheckStatus = 'pass' | 'warning' | 'error' | 'info';
export type CheckImpact = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';

/**
 * One result line. A rule with no violations produces one `pass` check; each
 * violation produces a check whose status is the rule's severity. So the
 * counts in a scan summary always equal the checks by status.
 */
export interface ComplianceCheck {
  id: string;
  ruleId?: string;
  rule: string;
  status: CheckStatus;
  message: string;
  component?: string;
  application?: string;
  file?: string;
  line?: number;
  element?: string;
  impact?: CheckImpact;
}

/** incomplete: no violations found, but part of the input was not checked (a size cap), so not a pass */
export type RuleOutcome = 'pass' | 'fail' | 'skipped' | 'error' | 'incomplete';

export interface RuleResult {
  ruleId: string;
  name: string;
  version: number;
  outcome: RuleOutcome;
  violations: number;
  /** Why the rule was skipped, errored or is incomplete */
  reason?: string;
}

export interface ScanSummary {
  passed: number;
  warnings: number;
  errors: number;
  info: number;
  total: number;
}

export type ScanScope = 'design-system' | 'application';
export type ScanSource = 'design-system' | 'codebase' | 'url';

export interface ScanActor {
  type: 'user' | 'service';
  id: string;
  name: string;
}

export interface ScanRecord {
  id: string;
  scope: ScanScope;
  source: ScanSource;
  applicationId?: string;
  applicationName?: string;
  url?: string;
  createdAt: string;
  createdBy: ScanActor;
  /** The rules that ran, with the version of each */
  rules: Array<{ id: string; name: string; version: number }>;
  ruleResults: RuleResult[];
  summary: ScanSummary;
  checks: ComplianceCheck[];
  /** True when more checks were found than are stored */
  truncated: boolean;
}

/** What one scan input looks like to the interpreter */
export interface ScanInput {
  html: string;
  css: string;
  javascript: string;
  /** Design-system scope: the component the input came from */
  component?: string;
  /** Shown as `file` on checks */
  file?: string;
}

export interface DesignToken {
  name: string;
  value: string;
  category?: string;
}

export interface DesignComponent {
  id: string;
  name: string;
  code?: { vue?: string; react?: string; html?: string };
}

/** Size limits (characters) */
export const LIMITS = {
  pattern: 300,
  selector: 300,
  message: 500,
  name: 120,
  description: 1000,
  codebaseField: 256 * 1024,
  codebaseTotal: 512 * 1024,
  fetchedBytes: 2 * 1024 * 1024,
  importRules: 200,
  storedChecks: 2000,
  matchesPerRule: 100,
  /** selector-attribute: attribute values tested against the rule's pattern (presence is checked on every match) */
  selectorPatternValues: 10000,
} as const;
