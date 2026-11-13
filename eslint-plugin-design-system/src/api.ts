import { builtInRules, rules } from './rules';
import {
  convertToESLintRule,
  DesignSystemConfig,
  DesignSystemRule,
  fetchRules,
  sanitizeRules,
  toRuleId
} from './rule-converter';

export interface LoadRulesResult {
  /** Rule ids (without the `design-system/` prefix) that are now registered. */
  loaded: string[];
  /** Rule names that were skipped (disabled, unnamed, or clashing with a built-in rule). */
  skipped: string[];
}

/**
 * Converts Rules Engine rules and registers them on `plugin.rules`. Disabled
 * rules, rules whose name sanitizes to nothing and rules that would replace a
 * built-in rule are skipped. Never throws.
 */
export function registerRules(defs: unknown, config: DesignSystemConfig = {}): LoadRulesResult {
  const result: LoadRulesResult = { loaded: [], skipped: [] };
  for (const def of sanitizeRules(defs)) {
    const id = toRuleId(def.name);
    if (!def.enabled || !id || Object.prototype.hasOwnProperty.call(builtInRules, id)) {
      result.skipped.push(def.name);
      continue;
    }
    try {
      rules[id] = convertToESLintRule(def as DesignSystemRule, config);
      result.loaded.push(id);
    } catch {
      result.skipped.push(def.name);
    }
  }
  return result;
}

const inflight = new Map<string, Promise<LoadRulesResult>>();

/**
 * Loads extra rules from the Design System Rules Engine (and/or `config.rules`)
 * into the plugin. ESLint rules are synchronous, so call and await this before
 * linting, e.g. with top-level await in `eslint.config.mjs`. Nothing runs at
 * require-time. The request times out after `config.timeout` ms (default
 * 5000); if the API is unreachable this resolves with whatever could be loaded
 * and never rejects.
 */
export async function loadRulesFromAPI(config: DesignSystemConfig = {}): Promise<LoadRulesResult> {
  try {
    const result = registerRules(config?.rules ?? [], config);
    if (!config?.apiUrl) return result;

    let pending = inflight.get(config.apiUrl);
    if (!pending) {
      pending = fetchRules(config)
        .then(fetched => registerRules(fetched, config))
        .catch(() => ({ loaded: [], skipped: [] }))
        .finally(() => inflight.delete(config.apiUrl as string));
      inflight.set(config.apiUrl, pending);
    }
    const fromApi = await pending;
    return {
      loaded: [...result.loaded, ...fromApi.loaded],
      skipped: [...result.skipped, ...fromApi.skipped]
    };
  } catch (error: unknown) {
    console.warn('[eslint-plugin-design-system] Failed to load rules:', error);
    return { loaded: [], skipped: [] };
  }
}
