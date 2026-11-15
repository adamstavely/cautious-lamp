import { componentToInput } from '../governance/scans.service';
import { GovernanceRule, ScanInput } from '../governance/governance.types';
import { RunResult } from '../governance/rule-interpreter';

/**
 * The checks a contribution goes through, run on the code that was submitted.
 * Every result is deterministic: the same submission always gets the same
 * results. A check that needs a person (running the contributor's lint or
 * test commands, judging tests) is reported as `needs-review`, never as a
 * pass or a fail.
 */

export const SUBMISSION_LANGUAGES = ['vue', 'html', 'react'] as const;
export type SubmissionLanguage = (typeof SUBMISSION_LANGUAGES)[number];

export interface ContributionSubmission {
  /** The component's source: a Vue SFC, HTML (with any <style>/<script>), or a React component */
  code: string;
  language: SubmissionLanguage;
  /** Component name, e.g. "DatePicker" */
  name?: string;
  description?: string;
  /** Usage documentation (Markdown) */
  documentation?: string;
  /** The component's test file */
  tests?: string;
}

/** How a check is run: governance rules, a structural check, or a person */
export const CHECK_RUNNERS = ['governance', 'structure', 'documentation', 'tests', 'manual'] as const;
export type CheckRunner = (typeof CHECK_RUNNERS)[number];

export type CheckStatus = 'pass' | 'fail' | 'needs-review';

export interface CheckFinding {
  message: string;
  severity: 'error' | 'warning' | 'info';
  rule?: string;
  line?: number;
  element?: string;
}

export interface CheckOutcome {
  status: CheckStatus;
  summary: string;
  findings: CheckFinding[];
}

const blocks = (source: string, tag: 'style' | 'script'): string => {
  const re = tag === 'style' ? /<style\b[^>]*>([\s\S]*?)<\/style>/gi : /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  return Array.from(source.matchAll(re), (m) => m[1]).join('\n');
};

/** The submission as the governance rule interpreter sees it */
export function submissionToInput(submission: ContributionSubmission): ScanInput {
  const file = submission.name ?? 'submission';
  if (submission.language === 'vue') return { ...componentToInput({ name: file, code: { vue: submission.code } }), file };
  if (submission.language === 'html') {
    return { html: submission.code, css: blocks(submission.code, 'style'), javascript: blocks(submission.code, 'script'), component: file, file };
  }
  return { html: '', css: '', javascript: submission.code, component: file, file };
}

const ERROR_LEVELS = new Set(['error', 'warning']);

/**
 * A governance run as a check outcome. Fails when an error- or
 * warning-severity rule found violations; info-level findings are listed but
 * don't fail. A rule that couldn't run, or couldn't check everything, needs
 * review. Nothing to check (no rules enabled, or no rule applied to this kind
 * of code) needs review too, since it isn't a pass.
 */
export function governanceOutcome(rules: GovernanceRule[], run: RunResult | null, what: string): CheckOutcome {
  if (!run || rules.length === 0) {
    return { status: 'needs-review', summary: `No ${what} rules are enabled, so nothing was checked automatically.`, findings: [] };
  }
  const severity = new Map(rules.map((rule) => [rule.id, rule.severity]));
  const findings: CheckFinding[] = run.checks
    .filter((check) => check.status !== 'pass' && !check.id.endsWith(':error') && !check.id.endsWith(':incomplete'))
    .map((check) => ({
      message: check.message,
      severity: severity.get(check.ruleId ?? '') ?? 'info',
      rule: check.rule,
      line: check.line,
      element: check.element,
    }));
  const failed = run.ruleResults.filter((result) => result.outcome === 'fail' && ERROR_LEVELS.has(severity.get(result.ruleId) ?? 'info'));
  const unchecked = run.ruleResults.filter((result) => result.outcome === 'error' || result.outcome === 'incomplete');
  const applied = run.ruleResults.filter((result) => result.outcome !== 'skipped');
  for (const result of unchecked) {
    findings.push({ message: `${result.name} could not check everything: ${result.reason ?? 'no reason given'}`, severity: 'warning', rule: result.name });
  }

  if (failed.length) {
    const count = findings.filter((f) => ERROR_LEVELS.has(f.severity)).length;
    return { status: 'fail', summary: `${count} ${count === 1 ? 'problem' : 'problems'} from ${failed.length} of ${applied.length} ${what} rules.`, findings };
  }
  if (unchecked.length) return { status: 'needs-review', summary: `${unchecked.length} ${what} ${unchecked.length === 1 ? 'rule' : 'rules'} could not run fully; a reviewer should check by hand.`, findings };
  if (applied.length === 0) return { status: 'needs-review', summary: `None of the ${what} rules apply to this kind of code, so a reviewer should check it.`, findings };
  return { status: 'pass', summary: `Passed all ${applied.length} ${what} rules that apply.`, findings };
}

/** Prop names the code declares: defineProps({ … }), defineProps<{ … }>(), props: { … } or props: [ … ] */
export function declaredProps(code: string): string[] {
  const names = new Set<string>();
  const body = (start: number, open: string, close: string): string | null => {
    const from = code.indexOf(open, start);
    if (from === -1) return null;
    let depth = 0;
    for (let i = from; i < code.length; i++) {
      if (code[i] === open) depth++;
      else if (code[i] === close && --depth === 0) return code.slice(from + 1, i);
    }
    return null;
  };
  // Top-level keys of an object/type literal body
  const keys = (text: string) => {
    let depth = 0;
    let token = '';
    for (const char of text) {
      if ('{[('.includes(char)) depth++;
      else if ('}])'.includes(char)) depth--;
      else if (depth === 0) {
        if (char === ':' || char === '?') {
          const name = /([A-Za-z_$][\w$]*)['"]?\s*$/.exec(token.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ''))?.[1];
          if (name) names.add(name);
          token = '';
          continue;
        }
        if (char === ',' || char === ';' || char === '\n') {
          token = '';
          continue;
        }
      }
      if (depth === 0) token += char;
    }
  };

  for (const match of code.matchAll(/defineProps\s*(<)?/g)) {
    if (match[1]) {
      const typed = body(match.index!, '{', '}');
      if (typed) keys(typed);
    } else {
      const args = (body(match.index!, '(', ')') ?? '').trim();
      if (args.startsWith('[')) for (const m of args.matchAll(/['"]([\w$-]+)['"]/g)) names.add(m[1]);
      else if (args.startsWith('{')) keys(args.slice(1, args.lastIndexOf('}')));
    }
  }
  const options = /\bprops\s*:\s*([[{])/.exec(code);
  if (options) {
    if (options[1] === '[') for (const m of (body(options.index, '[', ']') ?? '').matchAll(/['"]([\w$-]+)['"]/g)) names.add(m[1]);
    else keys(body(options.index, '{', '}') ?? '');
  }
  // React: function Button({ label, onClick }) / const Button = ({ … }) =>
  const destructured = /(?:function\s+[A-Z]\w*\s*\(|const\s+[A-Z]\w*\s*=\s*\()\s*\{([^}]*)\}/.exec(code);
  if (destructured) for (const part of destructured[1].split(',')) {
    const name = /^\s*([A-Za-z_$][\w$]*)/.exec(part)?.[1];
    if (name) names.add(name);
  }
  return [...names];
}

/** Structural checks: the parts a component of this kind needs */
export function structureOutcome(submission: ContributionSubmission): CheckOutcome {
  const findings: CheckFinding[] = [];
  const code = submission.code;
  const problem = (message: string) => findings.push({ message, severity: 'error' });

  if (!code.trim()) problem('No code was submitted.');
  if (!submission.name?.trim()) problem('The contribution has no component name.');
  else if (!/^[A-Z][A-Za-z0-9]*$/.test(submission.name.trim())) problem(`"${submission.name}" isn't PascalCase (for example "DatePicker").`);

  if (code.trim()) {
    if (submission.language === 'vue') {
      if (!/<template\b/i.test(code) && !/\brender\s*\(|\bh\(/.test(code)) problem('The Vue component has no <template> and no render function.');
      if (!/<script\b/i.test(code)) findings.push({ message: 'The Vue component has no <script> block: fine for a template-only component.', severity: 'info' });
    } else if (submission.language === 'html') {
      if (!/<[a-z][\w-]*[\s>]/i.test(code)) problem('The HTML has no elements.');
    } else if (!/export\s+(default\b|function\s+[A-Z]|const\s+[A-Z])/.test(code)) {
      problem('The React code exports no component (export default, or an exported function or const with a capitalised name).');
    }
  }

  const errors = findings.filter((f) => f.severity === 'error').length;
  return errors
    ? { status: 'fail', summary: `${errors} structural ${errors === 1 ? 'problem' : 'problems'}.`, findings }
    : { status: 'pass', summary: 'The component has the structure its kind needs.', findings };
}

/** Documentation: a description, usage docs with an example, and every prop described */
export function documentationOutcome(submission: ContributionSubmission): CheckOutcome {
  const findings: CheckFinding[] = [];
  const docs = submission.documentation ?? '';
  const description = submission.description?.trim() ?? '';
  if (description.length < 20) findings.push({ message: 'The description is missing or shorter than 20 characters.', severity: 'error' });
  if (!docs.trim()) findings.push({ message: 'No usage documentation was submitted.', severity: 'error' });
  else if (!/```/.test(docs)) findings.push({ message: 'The documentation has no code example (a fenced ``` block).', severity: 'error' });

  const undocumented = declaredProps(submission.code).filter((prop) => {
    const inDocs = new RegExp(`\\b${prop.replace(/\$/g, '\\$')}\\b`).test(docs);
    const jsdoc = new RegExp(`/\\*\\*[^*]*(?:\\*(?!/)[^*]*)*\\*/\\s*['"]?${prop.replace(/\$/g, '\\$')}['"]?\\s*\\??:`).test(submission.code);
    return !inDocs && !jsdoc;
  });
  if (undocumented.length) {
    findings.push({ message: `Props without documentation: ${undocumented.join(', ')}. Describe them in the docs or with a /** comment */.`, severity: 'error' });
  }

  return findings.length
    ? { status: 'fail', summary: `${findings.length} documentation ${findings.length === 1 ? 'gap' : 'gaps'}.`, findings }
    : { status: 'pass', summary: 'Description, usage example and every prop are documented.', findings };
}

/**
 * Tests: none submitted fails; a file with no test cases or assertions fails.
 * Tests that look right still need a person, since they aren't run here.
 */
export function testsOutcome(submission: ContributionSubmission): CheckOutcome {
  const tests = submission.tests ?? '';
  if (!tests.trim()) return { status: 'fail', summary: 'No tests were submitted.', findings: [{ message: 'Add a test file for the component.', severity: 'error' }] };
  const findings: CheckFinding[] = [];
  const cases = tests.match(/\b(?:it|test)(?:\.each\([^)]*\))?\s*\(/g)?.length ?? 0;
  if (!cases) findings.push({ message: 'The test file has no test cases (it(…) or test(…)).', severity: 'error' });
  if (!/\bexpect\s*\(|\bassert\b/.test(tests)) findings.push({ message: 'The test file makes no assertions (expect(…) or assert).', severity: 'error' });
  if (submission.name && !tests.includes(submission.name)) findings.push({ message: `The tests never mention ${submission.name}.`, severity: 'warning' });
  if (findings.some((f) => f.severity === 'error')) return { status: 'fail', summary: 'The test file is incomplete.', findings };
  return {
    status: 'needs-review',
    summary: `${cases} test ${cases === 1 ? 'case' : 'cases'} found. Tests aren't run here: a reviewer confirms they pass in CI.`,
    findings,
  };
}

/** A check run by a person: its command runs in the contributor's repository, not here */
export function manualOutcome(command?: string): CheckOutcome {
  return {
    status: 'needs-review',
    summary: command
      ? `Runs as \`${command}\` in the contributor's repository and CI, not on the submitted code here. A reviewer confirms it passed.`
      : 'A reviewer checks this by hand.',
    findings: [],
  };
}
