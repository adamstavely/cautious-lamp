import type { Rule } from 'eslint';
import {
  COMPONENT_DECLARATION_SELECTOR,
  getDeclaredIdentifier,
  getPropertyName,
  isInvalidComponentName,
  isNonValueLiteral,
  normalizeName
} from './checks';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Rule types served by the governance API (docs/GOVERNANCE.md) */
export const RULE_TYPES = ['regex-present', 'regex-absent', 'selector-attribute', 'selector-count', 'token-usage', 'builtin'] as const;
export type RuleType = (typeof RULE_TYPES)[number];
export type RuleTarget = 'html' | 'css' | 'javascript';

/**
 * A governance rule as served by `GET /governance/rules/export`. Rules are
 * data: the fields below decide what is checked. There is no rule code.
 */
export interface DesignSystemRule {
  id?: string;
  name: string;
  category: string;
  enabled: boolean;
  severity: 'error' | 'warning' | 'info';
  description: string;
  type?: RuleType;
  target?: RuleTarget;
  /** regex-* (and optionally selector-attribute) */
  pattern?: string;
  flags?: string;
  /** selector-* */
  selector?: string;
  /** selector-attribute: attribute names separated by `|` (any of them) */
  attribute?: string;
  min?: number;
  max?: number;
  /** token-usage: CSS properties; a trailing `*` matches a prefix */
  properties?: string[];
  /** token-usage: values accepted besides `var(--…)` and keywords */
  allowedValues?: string[];
  builtin?: string;
  /** Shown for each violation */
  message?: string;
}

export interface DesignSystemConfig {
  /** Governance API base URL, e.g. http://localhost:3000/api/v1 */
  apiUrl?: string;
  apiKey?: string;
  /** Rules to register directly, without hitting the API. */
  rules?: DesignSystemRule[];
  /** Design token values token-usage rules accept as raw values (the server accepts these too). */
  tokenValues?: string[];
  cacheRules?: boolean;
  /** Cache lifetime in ms (default 5 minutes). */
  cacheTimeout?: number;
  /** Request timeout in ms (default 5000). */
  timeout?: number;
}

export const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_CACHE_MS = 5 * 60 * 1000;

const rulesCache = new Map<string, { rules: DesignSystemRule[]; timestamp: number }>();

/** Clears the in-memory API rules cache (mainly for tests). */
export function clearRulesCache(): void {
  rulesCache.clear();
}

function isDesignSystemRule(value: unknown): value is DesignSystemRule {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).name === 'string' &&
    (value as any).name.trim() !== ''
  );
}

/** Keeps only well-formed rule objects from untrusted API data. */
export function sanitizeRules(data: unknown): DesignSystemRule[] {
  if (!Array.isArray(data)) return [];
  return data.filter(isDesignSystemRule).map(r => ({
    ...r,
    category: typeof r.category === 'string' ? r.category : 'Design System',
    description: typeof r.description === 'string' ? r.description : '',
    severity: (['error', 'warning', 'info'] as const).includes(r.severity) ? r.severity : 'warning',
    enabled: r.enabled === true,
    type: (RULE_TYPES as readonly string[]).includes(r.type as string) ? r.type : undefined,
    target: (['html', 'css', 'javascript'] as const).includes(r.target as RuleTarget) ? r.target : undefined,
    pattern: stringOrUndefined(r.pattern),
    flags: stringOrUndefined(r.flags),
    selector: stringOrUndefined(r.selector),
    attribute: stringOrUndefined(r.attribute),
    min: typeof r.min === 'number' ? r.min : undefined,
    max: typeof r.max === 'number' ? r.max : undefined,
    properties: stringList(r.properties),
    allowedValues: stringList(r.allowedValues),
    builtin: stringOrUndefined(r.builtin),
    message: stringOrUndefined(r.message)
  }));
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

function stringList(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : undefined;
}

/**
 * Fetches the declarative rules from `${apiUrl}/governance/rules/export`
 * (the full definitions; `/rules/export?format=eslint` leaves out the fields
 * that say what a rule checks). Never throws:
 * on a missing URL, timeout, network error or malformed response it returns
 * the last cached rules for that URL (or []), and logs a single warning.
 */
export async function fetchRules(config: DesignSystemConfig): Promise<DesignSystemRule[]> {
  const apiUrl = config?.apiUrl;
  if (!apiUrl) return [];

  const cacheTimeout = config.cacheTimeout ?? DEFAULT_CACHE_MS;
  const cached = rulesCache.get(apiUrl);
  if (config.cacheRules !== false && cached && Date.now() - cached.timestamp < cacheTimeout) {
    return cached.rules;
  }

  const timeout = config.timeout && config.timeout > 0 ? config.timeout : DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  if (typeof timer === 'object' && typeof (timer as any).unref === 'function') (timer as any).unref();

  try {
    // Loaded lazily so requiring the plugin never pulls in the HTTP client.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const axios = require('axios') as typeof import('axios').default;
    const headers: Record<string, string> = {};
    if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
    const response = await axios.get(`${apiUrl.replace(/\/+$/, '')}/governance/rules/export`, {
      headers,
      timeout,
      signal: controller.signal
    });
    const fetched = sanitizeRules(response?.data?.rules);
    rulesCache.set(apiUrl, { rules: fetched, timestamp: Date.now() });
    return fetched;
  } catch (error: any) {
    const reason = controller.signal.aborted ? `timed out after ${timeout}ms` : error?.message ?? String(error);
    console.warn(`[eslint-plugin-design-system] Failed to fetch rules from ${apiUrl}: ${reason}`);
    return cached?.rules ?? [];
  } finally {
    clearTimeout(timer);
  }
}

/** ESLint rule id (without the `design-system/` prefix) for a Rules Engine rule name. */
export function toRuleId(name: string): string {
  return String(name ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------------------------------------------------------------------------
// Declarative rule -> ESLint visitor
// ---------------------------------------------------------------------------

/** Values every token-usage rule accepts (same as the server's interpreter) */
const GLOBAL_ALLOWED_VALUES = ['inherit', 'initial', 'unset', 'revert', 'revert-layer', 'currentcolor', 'transparent', 'none', 'auto', '0'];

/** A selector ESLint can match on JSX: one or more plain tag names (`img`, `button, a`) */
const SIMPLE_TAG_SELECTOR = /^\s*[a-z][a-z0-9-]*(\s*,\s*[a-z][a-z0-9-]*)*\s*$/;

/** HTML attribute names whose JSX spelling differs */
const JSX_ATTRIBUTE_ALIASES: Record<string, string> = { class: 'classname', for: 'htmlfor' };

/** Builtin checks that have an ESLint equivalent */
const LINTABLE_BUILTINS = new Set(['component-naming']);

/** Most violations reported per rule per file (the server's limit too) */
const MAX_MATCHES = 100;

function compilePattern(rule: DesignSystemRule): RegExp {
  const flags = rule.flags ?? '';
  if (!/^[ims]*$/.test(flags)) throw new Error(`unsupported regex flags "${flags}"`);
  return new RegExp(rule.pattern as string, `${Array.from(new Set(flags)).join('')}g`);
}

/**
 * Why ESLint can't check this rule, or undefined when it can. Rules are only
 * mapped where JavaScript/JSX source (including CSS-in-JS) carries the same
 * information the server checks; everything else is reported, never guessed.
 */
export function unsupportedReason(rule: DesignSystemRule): string | undefined {
  switch (rule.type) {
    case undefined:
      return 'no declarative rule type (old scannerCode rules are not supported)';
    case 'regex-present':
    case 'regex-absent':
      if (rule.target !== 'javascript') return `${rule.type} on ${rule.target ?? 'no'} target; ESLint only sees JavaScript`;
      if (!rule.pattern) return `${rule.type} has no pattern`;
      try {
        compilePattern(rule);
      } catch (error: any) {
        return `invalid pattern: ${error?.message ?? error}`;
      }
      return undefined;
    case 'token-usage':
      if (rule.target !== 'css') return `token-usage on ${rule.target ?? 'no'} target`;
      if (!rule.properties?.length) return 'token-usage has no properties';
      return undefined;
    case 'selector-attribute':
      if (rule.target !== 'html') return `selector-attribute on ${rule.target ?? 'no'} target`;
      if (!rule.selector || !SIMPLE_TAG_SELECTOR.test(rule.selector)) {
        return `selector "${rule.selector ?? ''}" is not a plain tag list ESLint can match on JSX`;
      }
      if (!rule.attribute?.split('|').some(n => n.trim())) return 'selector-attribute has no attribute';
      if (rule.pattern) {
        try {
          compilePattern(rule);
        } catch (error: any) {
          return `invalid pattern: ${error?.message ?? error}`;
        }
      }
      return undefined;
    case 'selector-count':
      return 'selector-count counts elements across a whole page, not one source file';
    case 'builtin':
      return rule.builtin && LINTABLE_BUILTINS.has(rule.builtin)
        ? undefined
        : `builtin check "${rule.builtin ?? ''}" runs on rendered HTML on the server`;
    default:
      return `unknown rule type "${String(rule.type)}"`;
  }
}

export function convertToESLintRule(rule: DesignSystemRule, config: DesignSystemConfig = {}): Rule.RuleModule {
  const reason = unsupportedReason(rule);
  if (reason) throw new Error(`Rule "${rule.name}" can't be checked by ESLint: ${reason}`);
  return {
    meta: {
      type: rule.severity === 'error' ? 'problem' : 'suggestion',
      docs: {
        description: rule.description || rule.name,
        recommended: rule.severity === 'error'
      },
      messages: {
        violation: '{{message}}'
      },
      schema: []
    },
    create(context) {
      return createASTVisitor(rule, context, config);
    }
  };
}

function createASTVisitor(rule: DesignSystemRule, context: Rule.RuleContext, config: DesignSystemConfig): Rule.RuleListener {
  const message = rule.message || rule.description || rule.name;
  switch (rule.type) {
    case 'regex-present':
    case 'regex-absent':
      return regexVisitor(rule, context, message);
    case 'token-usage':
      return tokenUsageVisitor(rule, context, message, config);
    case 'selector-attribute':
      return selectorAttributeVisitor(rule, context, message);
    case 'builtin':
      return componentNamingVisitor(context);
    default:
      return {};
  }
}

function sourceCodeOf(context: Rule.RuleContext): any {
  return (context as any).sourceCode ?? context.getSourceCode();
}

/** regex-absent: each match is a violation. regex-present: a file without a match is one. */
function regexVisitor(rule: DesignSystemRule, context: Rule.RuleContext, message: string): Rule.RuleListener {
  return {
    Program(node: any) {
      const sourceCode = sourceCodeOf(context);
      const text: string = sourceCode.text ?? '';
      if (!text.trim()) return;
      const re = compilePattern(rule);
      if (rule.type === 'regex-present') {
        if (!re.test(text)) context.report({ node, messageId: 'violation', data: { message } });
        return;
      }
      let match: RegExpExecArray | null;
      let count = 0;
      while ((match = re.exec(text)) !== null && count < MAX_MATCHES) {
        if (match[0] === '') {
          re.lastIndex++;
          continue;
        }
        const start = sourceCode.getLocFromIndex(match.index);
        const end = sourceCode.getLocFromIndex(match.index + match[0].length);
        context.report({ loc: { start, end }, messageId: 'violation', data: { message } });
        count++;
      }
    }
  };
}

/** Splits a CSS value on whitespace and commas outside parentheses */
function valueParts(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (depth === 0 && /[\s,]/.test(ch)) {
      if (current) parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/** `prop: value` declarations in CSS text (a styled-components body, a `style` string, a stylesheet) */
function cssDeclarations(css: string): Array<{ property: string; value: string }> {
  const out: Array<{ property: string; value: string }> = [];
  const text = css.replace(/\/\*[\s\S]*?\*\//g, ' ');
  for (const part of text.split(/[;{}]/)) {
    const colon = part.indexOf(':');
    if (colon <= 0) continue;
    const property = part.slice(0, colon).trim().toLowerCase();
    const value = part.slice(colon + 1).trim();
    if (/^-?[a-z][a-z0-9-]*$/.test(property) && value) out.push({ property, value });
  }
  return out;
}

/**
 * token-usage on CSS-in-JS: style object properties (`{ marginTop: '8px' }`,
 * `style={{ color: '#fff' }}`) and CSS declarations inside string or template
 * literals (styled-components, `css\`…\``). Interpolations in template literals
 * count as token references. Property names compare without `-`/`_` and case.
 */
function tokenUsageVisitor(
  rule: DesignSystemRule,
  context: Rule.RuleContext,
  message: string,
  config: DesignSystemConfig
): Rule.RuleListener {
  const patterns = (rule.properties ?? []).map(p => ({
    prefix: p.trim().endsWith('*'),
    name: normalizeName(p.trim().replace(/\*$/, ''))
  }));
  const propertyMatches = (property: string) => {
    const name = normalizeName(property);
    return patterns.some(p => (p.prefix ? name.startsWith(p.name) : name === p.name));
  };
  const allowed = new Set(
    [...GLOBAL_ALLOWED_VALUES, ...(rule.allowedValues ?? []), ...(config.tokenValues ?? [])].map(v => String(v).trim().toLowerCase())
  );
  const isAllowed = (v: string) => {
    const value = v.toLowerCase();
    return allowed.has(value) || value.includes('var(--');
  };
  const violates = (value: string) => {
    const v = value.replace(/!important\s*$/i, '').trim();
    return v !== '' && !isAllowed(v) && !valueParts(v).every(isAllowed);
  };
  let reported = 0;
  const report = (node: any, property: string, value: string) => {
    if (reported >= MAX_MATCHES) return;
    reported++;
    context.report({ node, messageId: 'violation', data: { message: `${message} (${property}: ${value.trim()})` } });
  };
  const checkCssText = (node: any, css: string) => {
    for (const decl of cssDeclarations(css)) {
      if (propertyMatches(decl.property) && violates(decl.value)) report(node, decl.property, decl.value);
    }
  };

  return {
    Literal(node: any) {
      if (isNonValueLiteral(node)) return;
      const property = getPropertyName(node);
      if (typeof node.value === 'number') {
        if (property && node.value !== 0 && propertyMatches(property)) report(node, property, String(node.value));
        return;
      }
      if (typeof node.value !== 'string') return;
      if (property && propertyMatches(property) && !node.value.includes(':')) {
        if (violates(node.value)) report(node, property, node.value);
        return;
      }
      checkCssText(node, node.value);
    },
    TemplateLiteral(node: any) {
      const quasis: any[] = node.quasis ?? [];
      const property = getPropertyName(node);
      const css = quasis.map(q => q?.value?.cooked ?? q?.value?.raw ?? '').join('var(--interpolation)');
      if (property && propertyMatches(property) && !css.includes(':')) {
        if (violates(css)) report(node, property, css);
        return;
      }
      checkCssText(node, css);
    }
  };
}

function jsxName(name: any): string | undefined {
  return name?.type === 'JSXIdentifier' ? String(name.name) : undefined;
}

/** selector-attribute on JSX: native elements matching a tag in `selector` need one of the attributes */
function selectorAttributeVisitor(rule: DesignSystemRule, context: Rule.RuleContext, message: string): Rule.RuleListener {
  const tags = new Set((rule.selector ?? '').split(',').map(t => t.trim()));
  const names = new Set(
    (rule.attribute ?? '')
      .split('|')
      .map(n => n.trim().toLowerCase())
      .filter(Boolean)
      .map(n => JSX_ATTRIBUTE_ALIASES[n] ?? n)
  );
  const pattern = rule.pattern ? compilePattern(rule) : undefined;
  const valueMatches = (attr: any) => {
    if (!pattern) return true;
    const value = attr.value;
    // `<img alt />` is an empty string; `{expr}` can't be known statically
    if (value == null) return testPattern(pattern, '');
    if (value.type === 'Literal') return testPattern(pattern, String(value.value));
    if (value.type === 'JSXExpressionContainer' && value.expression?.type === 'Literal') {
      return testPattern(pattern, String(value.expression.value));
    }
    return true;
  };
  return {
    JSXOpeningElement(node: any) {
      const tag = jsxName(node.name);
      // Only native lowercase elements; components may render anything
      if (!tag || tag !== tag.toLowerCase() || !tags.has(tag)) return;
      const attributes: any[] = node.attributes ?? [];
      if (attributes.some(a => a?.type === 'JSXSpreadAttribute')) return;
      const ok = attributes.some(a => {
        const name = jsxName(a?.name)?.toLowerCase();
        return name !== undefined && names.has(name) && valueMatches(a);
      });
      if (!ok) context.report({ node, messageId: 'violation', data: { message } });
    }
  };
}

function testPattern(re: RegExp, value: string): boolean {
  re.lastIndex = 0;
  return re.test(value);
}

/** builtin component-naming: declarations whose name should be PascalCase */
function componentNamingVisitor(context: Rule.RuleContext): Rule.RuleListener {
  return {
    [COMPONENT_DECLARATION_SELECTOR](node: any) {
      const id = getDeclaredIdentifier(node);
      if (id && isInvalidComponentName(id.name)) {
        context.report({
          node: id,
          messageId: 'violation',
          data: { message: `Component "${id.name}" should follow PascalCase convention` }
        });
      }
    }
  } as Rule.RuleListener;
}
