import { JSDOM, VirtualConsole } from 'jsdom';
import { runAxeOnHtml } from '../accessibility-reports/axe-engine';
import {
  CheckImpact,
  CheckStatus,
  ComplianceCheck,
  DesignToken,
  GovernanceRule,
  LIMITS,
  RuleResult,
  ScanInput,
  ScanSummary,
} from './governance.types';
import { RegexRunner, RegexTimeoutError } from './regex-safety';

export interface Violation {
  message: string;
  line?: number;
  element?: string;
  impact?: CheckImpact;
}

export interface RuleEvaluation {
  outcome: 'pass' | 'fail' | 'skipped' | 'error';
  violations: Violation[];
  reason?: string;
}

export interface InterpreterContext {
  runner: RegexRunner;
  tokens: DesignToken[];
}

/** Values every token-usage rule accepts */
const GLOBAL_ALLOWED_VALUES = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer', 'currentcolor', 'transparent', 'none', 'auto', '0']);

/** Line number (1-based) of a character offset */
export function lineAt(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

/** Lazily parsed DOM for one input, shared by every selector rule */
class ParsedInput {
  private dom: JSDOM | null = null;

  constructor(readonly input: ScanInput) {}

  get document(): Document {
    if (!this.dom) {
      // No scripts run and no resources load: jsdom's defaults
      this.dom = new JSDOM(this.input.html, { includeNodeLocations: true, virtualConsole: new VirtualConsole() });
    }
    return this.dom.window.document;
  }

  lineOf(node: Node): number | undefined {
    try {
      return this.dom?.nodeLocation(node)?.startLine ?? undefined;
    } catch {
      return undefined;
    }
  }

  close(): void {
    this.dom?.window.close();
    this.dom = null;
  }
}

const snippet = (el: Element) => el.outerHTML.slice(0, 200);

function textFor(input: ScanInput, target: GovernanceRule['target']): string {
  return input[target] ?? '';
}

/** CSS declarations `{ property, value, index }` from every innermost block */
export function cssDeclarations(css: string): Array<{ property: string; value: string; index: number }> {
  const out: Array<{ property: string; value: string; index: number }> = [];
  // Blank out comments, keeping offsets so line numbers stay right
  const text = css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
  const blocks = /\{([^{}]*)\}/g;
  let block: RegExpExecArray | null;
  while ((block = blocks.exec(text)) !== null) {
    const body = block[1];
    const bodyStart = block.index + 1;
    let offset = 0;
    for (const part of body.split(';')) {
      const colon = part.indexOf(':');
      if (colon > 0) {
        const property = part.slice(0, colon).trim().toLowerCase();
        const value = part.slice(colon + 1).trim();
        if (/^-?[a-z][a-z0-9-]*$/.test(property) && value) {
          const leading = part.length - part.trimStart().length;
          out.push({ property, value, index: bodyStart + offset + leading });
        }
      }
      offset += part.length + 1;
    }
  }
  return out;
}

/** Splits a CSS value on whitespace and commas outside parentheses */
function valueParts(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (depth === 0 && (ch === ' ' || ch === ',' || ch === '\t' || ch === '\n')) {
      if (current) parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function propertyMatches(property: string, patterns: string[]): boolean {
  return patterns.some((p) => (p.endsWith('*') ? property.startsWith(p.slice(0, -1)) : property === p));
}

async function evaluateTokenUsage(rule: GovernanceRule, input: ScanInput, ctx: InterpreterContext): Promise<RuleEvaluation> {
  const css = input.css;
  if (!css.trim()) return { outcome: 'skipped', violations: [], reason: 'No CSS to check' };
  const allowed = new Set([...GLOBAL_ALLOWED_VALUES, ...(rule.allowedValues ?? []).map((v) => v.trim().toLowerCase())]);
  const tokenValues = new Set(ctx.tokens.map((t) => String(t.value ?? '').trim().toLowerCase()).filter(Boolean));
  const isAllowed = (v: string) => {
    const value = v.toLowerCase();
    return allowed.has(value) || tokenValues.has(value) || value.includes('var(--');
  };
  const violations: Violation[] = [];
  for (const decl of cssDeclarations(css)) {
    if (!propertyMatches(decl.property, rule.properties ?? [])) continue;
    const value = decl.value.replace(/!important\s*$/i, '').trim();
    if (isAllowed(value) || valueParts(value).every(isAllowed)) continue;
    violations.push({ message: `${rule.message} (${decl.property}: ${value})`, line: lineAt(css, decl.index) });
    if (violations.length >= LIMITS.matchesPerRule) break;
  }
  return { outcome: violations.length ? 'fail' : 'pass', violations };
}

async function evaluateSelectorAttribute(rule: GovernanceRule, parsed: ParsedInput, ctx: InterpreterContext): Promise<RuleEvaluation> {
  const elements = Array.from(parsed.document.querySelectorAll(rule.selector!)).slice(0, 1000);
  const names = rule.attribute!.split('|').map((n) => n.trim()).filter(Boolean);
  const missing: Element[] = [];
  const withValue: Array<{ el: Element; value: string }> = [];
  for (const el of elements) {
    const name = names.find((n) => el.hasAttribute(n));
    if (!name) missing.push(el);
    else if (rule.pattern) withValue.push({ el, value: el.getAttribute(name) ?? '' });
  }
  const violations: Violation[] = missing.map((el) => ({ message: rule.message, element: snippet(el), line: parsed.lineOf(el) }));
  if (rule.pattern && withValue.length) {
    const results = await ctx.runner.testEach(rule.pattern, rule.flags ?? '', withValue.map((w) => w.value));
    withValue.forEach((w, i) => {
      if (!results[i]) violations.push({ message: rule.message, element: snippet(w.el), line: parsed.lineOf(w.el) });
    });
  }
  return { outcome: violations.length ? 'fail' : 'pass', violations: violations.slice(0, LIMITS.matchesPerRule) };
}

function evaluateSelectorCount(rule: GovernanceRule, parsed: ParsedInput): RuleEvaluation {
  const count = parsed.document.querySelectorAll(rule.selector!).length;
  const tooFew = rule.min !== undefined && rule.min !== null && count < rule.min;
  const tooMany = rule.max !== undefined && rule.max !== null && count > rule.max;
  if (!tooFew && !tooMany) return { outcome: 'pass', violations: [] };
  const bound = tooFew ? `at least ${rule.min}` : `at most ${rule.max}`;
  return { outcome: 'fail', violations: [{ message: `${rule.message} (found ${count} "${rule.selector}", expected ${bound})` }] };
}

const AXE_IMPACT: Record<string, CheckImpact> = { critical: 'CRITICAL', serious: 'HIGH', moderate: 'MODERATE', minor: 'LOW' };

async function evaluateBuiltin(rule: GovernanceRule, input: ScanInput, parsed: ParsedInput): Promise<RuleEvaluation> {
  switch (rule.builtin) {
    case 'axe': {
      const outcome = await runAxeOnHtml(input.html);
      const violations: Violation[] = [];
      for (const result of outcome.violations) {
        for (const node of result.nodes) {
          violations.push({
            message: `${result.help} (${result.id})`,
            element: node.html,
            impact: AXE_IMPACT[result.impact ?? ''] ?? 'MODERATE',
          });
        }
      }
      return { outcome: violations.length ? 'fail' : 'pass', violations: violations.slice(0, LIMITS.matchesPerRule) };
    }
    case 'heading-order': {
      const violations: Violation[] = [];
      let previous = 0;
      for (const heading of Array.from(parsed.document.querySelectorAll('h1, h2, h3, h4, h5, h6'))) {
        const level = Number(heading.tagName[1]);
        if (previous > 0 && level > previous + 1) {
          violations.push({ message: `${rule.message} (h${previous} to h${level})`, element: snippet(heading), line: parsed.lineOf(heading) });
        }
        previous = level;
      }
      return { outcome: violations.length ? 'fail' : 'pass', violations };
    }
    case 'form-labels': {
      const doc = parsed.document;
      const fields = Array.from(
        doc.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea'),
      );
      const violations: Violation[] = [];
      for (const field of fields) {
        const id = field.getAttribute('id');
        const labelled =
          !!field.getAttribute('aria-label')?.trim() ||
          !!field.getAttribute('aria-labelledby')?.trim() ||
          !!field.getAttribute('title')?.trim() ||
          !!field.closest('label') ||
          (!!id && Array.from(doc.querySelectorAll('label[for]')).some((label) => label.getAttribute('for') === id));
        if (!labelled) violations.push({ message: rule.message, element: snippet(field), line: parsed.lineOf(field) });
      }
      return { outcome: violations.length ? 'fail' : 'pass', violations: violations.slice(0, LIMITS.matchesPerRule) };
    }
    case 'component-naming': {
      if (!input.component) return { outcome: 'skipped', violations: [], reason: 'Only applies to design system components' };
      return /^[A-Z][A-Za-z0-9]*$/.test(input.component)
        ? { outcome: 'pass', violations: [] }
        : { outcome: 'fail', violations: [{ message: `${rule.message} ("${input.component}")` }] };
    }
    default:
      return { outcome: 'error', violations: [], reason: `Unknown built-in check "${rule.builtin}"` };
  }
}

/** Runs one rule against one input. Never throws: failures come back as `error`. */
export async function evaluateRule(rule: GovernanceRule, input: ScanInput, ctx: InterpreterContext, parsed = new ParsedInput(input)): Promise<RuleEvaluation> {
  try {
    const text = textFor(input, rule.target);
    switch (rule.type) {
      case 'regex-present': {
        if (!text.trim()) return { outcome: 'skipped', violations: [], reason: `No ${rule.target} to check` };
        const matches = await ctx.runner.matchAll(rule.pattern!, rule.flags ?? '', text, 1);
        return matches.length ? { outcome: 'pass', violations: [] } : { outcome: 'fail', violations: [{ message: rule.message }] };
      }
      case 'regex-absent': {
        if (!text.trim()) return { outcome: 'skipped', violations: [], reason: `No ${rule.target} to check` };
        const matches = await ctx.runner.matchAll(rule.pattern!, rule.flags ?? '', text);
        const violations = matches.map((m) => ({ message: rule.message, line: lineAt(text, m.index), element: m.match }));
        return { outcome: violations.length ? 'fail' : 'pass', violations };
      }
      case 'selector-attribute':
      case 'selector-count':
      case 'builtin': {
        if (!input.html.trim() && !(rule.type === 'builtin' && rule.builtin === 'component-naming')) {
          return { outcome: 'skipped', violations: [], reason: 'No HTML to check' };
        }
        if (rule.type === 'selector-attribute') return await evaluateSelectorAttribute(rule, parsed, ctx);
        if (rule.type === 'selector-count') return evaluateSelectorCount(rule, parsed);
        return await evaluateBuiltin(rule, input, parsed);
      }
      case 'token-usage':
        return await evaluateTokenUsage(rule, input, ctx);
      default:
        return { outcome: 'error', violations: [], reason: `Unknown rule type "${(rule as GovernanceRule).type}"` };
    }
  } catch (error) {
    const reason = error instanceof RegexTimeoutError ? error.message : `Rule failed: ${(error as Error).message}`;
    return { outcome: 'error', violations: [], reason };
  }
}

const SEVERITY_STATUS: Record<GovernanceRule['severity'], CheckStatus> = { error: 'error', warning: 'warning', info: 'info' };
const SEVERITY_IMPACT: Record<GovernanceRule['severity'], CheckImpact> = { error: 'HIGH', warning: 'MODERATE', info: 'INFO' };

export interface RunResult {
  checks: ComplianceCheck[];
  ruleResults: RuleResult[];
  summary: ScanSummary;
  truncated: boolean;
}

/**
 * Runs every rule over every input. Each rule contributes one `pass` check if
 * it found nothing anywhere it applied, otherwise one check per violation. A
 * rule that couldn't run is reported in `ruleResults` with its reason and as
 * an `error` check, so a broken rule never looks like a pass.
 */
export async function runRules(
  rules: GovernanceRule[],
  inputs: ScanInput[],
  ctx: InterpreterContext,
  meta: { application?: string } = {},
): Promise<RunResult> {
  const parsedInputs = inputs.map((input) => new ParsedInput(input));
  const checks: ComplianceCheck[] = [];
  const ruleResults: RuleResult[] = [];
  let truncated = false;
  const push = (check: ComplianceCheck) => {
    if (checks.length >= LIMITS.storedChecks) truncated = true;
    else checks.push(check);
  };

  try {
    for (const rule of rules) {
      let violations = 0;
      let applied = false;
      let errorReason: string | undefined;
      let skipReason: string | undefined;
      for (const parsed of parsedInputs) {
        const evaluation = await evaluateRule(rule, parsed.input, ctx, parsed);
        if (evaluation.outcome === 'skipped') {
          skipReason ??= evaluation.reason;
          continue;
        }
        if (evaluation.outcome === 'error') {
          errorReason ??= evaluation.reason;
          continue;
        }
        applied = true;
        evaluation.violations.forEach((violation, index) => {
          violations++;
          push({
            id: `${rule.id}:${parsed.input.component ?? parsed.input.file ?? 'input'}:${index}`,
            ruleId: rule.id,
            rule: rule.name,
            status: SEVERITY_STATUS[rule.severity],
            message: violation.message,
            component: parsed.input.component,
            application: meta.application,
            file: parsed.input.file,
            line: violation.line,
            element: violation.element,
            impact: violation.impact ?? SEVERITY_IMPACT[rule.severity],
          });
        });
      }

      const base = { ruleId: rule.id, name: rule.name, version: rule.version };
      if (errorReason) {
        ruleResults.push({ ...base, outcome: 'error', violations, reason: errorReason });
        push({ id: `${rule.id}:error`, ruleId: rule.id, rule: rule.name, status: 'error', message: errorReason, application: meta.application });
      } else if (!applied) {
        ruleResults.push({ ...base, outcome: 'skipped', violations: 0, reason: skipReason });
      } else if (violations > 0) {
        ruleResults.push({ ...base, outcome: 'fail', violations });
      } else {
        ruleResults.push({ ...base, outcome: 'pass', violations: 0 });
        push({ id: `${rule.id}:pass`, ruleId: rule.id, rule: rule.name, status: 'pass', message: `No violations of "${rule.name}"`, application: meta.application });
      }
    }
  } finally {
    parsedInputs.forEach((parsed) => parsed.close());
  }

  return { checks, ruleResults, summary: summarize(checks), truncated };
}

export function summarize(checks: ComplianceCheck[]): ScanSummary {
  const count = (status: CheckStatus) => checks.filter((c) => c.status === status).length;
  return { passed: count('pass'), warnings: count('warning'), errors: count('error'), info: count('info'), total: checks.length };
}
