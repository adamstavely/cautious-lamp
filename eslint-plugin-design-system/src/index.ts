import type { Linter } from 'eslint';
import { rules } from './rules';
import { loadRulesFromAPI } from './api';
import type { DesignSystemPlugin, LegacyConfig } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json') as { version: string };

const PLUGIN_NAME = 'design-system';

const recommendedRules: Linter.RulesRecord = {
  [`${PLUGIN_NAME}/hardcoded-design-tokens`]: 'error',
  [`${PLUGIN_NAME}/component-naming`]: 'warn',
  [`${PLUGIN_NAME}/accessibility-attributes`]: 'error',
  [`${PLUGIN_NAME}/spacing-consistency`]: 'warn',
  [`${PLUGIN_NAME}/typography-scale`]: 'warn'
};

/** eslintrc config: `extends: ['plugin:design-system/recommended']` (ESLint 8 default). */
const legacyRecommended: LegacyConfig = {
  plugins: [PLUGIN_NAME],
  rules: { ...recommendedRules }
};

const plugin = {
  meta: { name: 'eslint-plugin-design-system', version },
  rules,
  configs: {
    recommended: legacyRecommended,
    'legacy-recommended': legacyRecommended
  },
  loadRulesFromAPI
} as unknown as DesignSystemPlugin;

/** Flat config (eslint.config.js; ESLint >= 8.57 flat mode and ESLint 9). */
plugin.configs['flat/recommended'] = {
  plugins: { [PLUGIN_NAME]: plugin as unknown as NonNullable<Linter.FlatConfig['plugins']>[string] },
  rules: { ...recommendedRules }
};

// CommonJS export so `require('eslint-plugin-design-system')` returns the plugin
// itself (ESLint loads plugins with require and reads `.rules` / `.configs`).
export = plugin;
