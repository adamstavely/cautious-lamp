import type { Rule } from 'eslint';
import {
  COMPONENT_DECLARATION_SELECTOR,
  findColors,
  getDeclaredIdentifier,
  getPropertyName,
  isHardcodedSpacing,
  isInvalidComponentName,
  isMissingAccessibleName,
  isNonValueLiteral
} from './checks';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DesignSystemRule {
  name: string;
  category: string;
  enabled: boolean;
  severity: 'error' | 'warning' | 'info';
  description: string;
  scannerCode?: string;
}

export interface DesignSystemConfig {
  /** Rules Engine base URL, e.g. http://localhost:3000/api/v1 */
  apiUrl?: string;
  apiKey?: string;
  /** Rules to register directly, without hitting the API. */
  rules?: DesignSystemRule[];
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
    scannerCode: typeof r.scannerCode === 'string' ? r.scannerCode : undefined
  }));
}

/**
 * Fetches rules from `${apiUrl}/rules/export?format=eslint`. Never throws:
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
    const response = await axios.get(`${apiUrl.replace(/\/+$/, '')}/rules/export`, {
      params: { format: 'eslint' },
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

export function convertToESLintRule(rule: DesignSystemRule, config: DesignSystemConfig = {}): Rule.RuleModule {
  return {
    meta: {
      type: rule.severity === 'error' ? 'problem' : 'suggestion',
      docs: {
        description: rule.description || rule.name,
        recommended: rule.severity === 'error'
      },
      messages: {
        violation: '{{message}}',
        hardcodedValue: 'Found hardcoded {{type}}: {{value}}. Use design token instead.',
        missingAttribute: 'Missing required attribute: {{attribute}}',
        namingConvention: '{{message}}'
      },
      schema: []
    },
    create(context) {
      return createASTVisitor(rule, context, config);
    }
  };
}

type Handler = (node: any) => void;

function createASTVisitor(rule: DesignSystemRule, context: Rule.RuleContext, _config: DesignSystemConfig): Rule.RuleListener {
  const handlers: Record<string, Handler[]> = {};
  const on = (selector: string, handler: Handler) => {
    (handlers[selector] ??= []).push(handler);
  };
  const scannerCode = typeof rule.scannerCode === 'string' ? rule.scannerCode : '';
  const lower = scannerCode.toLowerCase();

  const reportColorsIn = (node: any, text: unknown) => {
    for (const value of findColors(text)) {
      context.report({ node, messageId: 'hardcodedValue', data: { type: 'color', value } });
    }
  };

  const checksColors = lower.includes('hardcoded') && lower.includes('color');
  const checksTokens = lower.includes('token');

  if (checksColors || checksTokens) {
    on('Literal', node => {
      if (typeof node.value === 'string' && !isNonValueLiteral(node)) reportColorsIn(node, node.value);
    });
    on('TemplateLiteral', node => {
      for (const quasi of node.quasis ?? []) reportColorsIn(quasi, quasi?.value?.raw);
    });
  }

  if (lower.includes('spacing')) {
    on('Literal', node => {
      if (typeof node.value !== 'string' || isNonValueLiteral(node)) return;
      if (isHardcodedSpacing(node.value, getPropertyName(node))) {
        context.report({ node, messageId: 'hardcodedValue', data: { type: 'spacing', value: node.value.trim() } });
      }
    });
  }

  if (lower.includes('naming')) {
    on(COMPONENT_DECLARATION_SELECTOR, node => {
      const id = getDeclaredIdentifier(node);
      if (id && isInvalidComponentName(id.name)) {
        context.report({
          node: id,
          messageId: 'namingConvention',
          data: { message: `Component "${id.name}" should follow PascalCase convention` }
        });
      }
    });
  }

  if (lower.includes('aria') || lower.includes('accessibility')) {
    on('JSXOpeningElement', node => {
      if (isMissingAccessibleName(node)) {
        context.report({ node, messageId: 'missingAttribute', data: { attribute: 'aria-label or aria-labelledby' } });
      }
    });
  }

  // Default: generic hardcoded-color check.
  if (Object.keys(handlers).length === 0) {
    on('Literal', node => {
      if (typeof node.value !== 'string' || isNonValueLiteral(node)) return;
      for (const value of findColors(node.value)) {
        context.report({
          node,
          messageId: 'violation',
          data: { message: `Hardcoded color detected: ${value}. Consider using a design token.` }
        });
      }
    });
  }

  // Several patterns can target the same node type; run all of them (the old
  // implementation overwrote earlier handlers, e.g. spacing replaced colors).
  const visitor: Record<string, Handler> = {};
  for (const [selector, list] of Object.entries(handlers)) {
    visitor[selector] = node => {
      for (const handler of list) handler(node);
    };
  }
  return visitor as Rule.RuleListener;
}
