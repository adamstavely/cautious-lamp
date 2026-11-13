import type { Linter, Rule } from 'eslint';
import type { LoadRulesResult } from './api';
import type { DesignSystemConfig } from './rule-converter';

/** An eslintrc-style (legacy) shareable config. */
export interface LegacyConfig {
  plugins: string[];
  rules: Linter.RulesRecord;
}

export interface DesignSystemPlugin {
  meta: { name: string; version: string };
  rules: Record<string, Rule.RuleModule>;
  configs: {
    /** eslintrc: `extends: ['plugin:design-system/recommended']` */
    recommended: LegacyConfig;
    /** Alias of `recommended` (eslintrc). */
    'legacy-recommended': LegacyConfig;
    /** Flat config: `plugin.configs['flat/recommended']` in eslint.config.js */
    'flat/recommended': Linter.FlatConfig;
  };
  loadRulesFromAPI: (config?: DesignSystemConfig) => Promise<LoadRulesResult>;
}
