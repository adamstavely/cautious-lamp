// Pass-through processor plus an async initializer that loads API rules.

import type { Linter } from 'eslint';
import type { DesignSystemConfig } from './rule-converter';
import { loadRulesFromAPI } from './api';
import type { DesignSystemPlugin } from './types';

export const processor = {
  meta: { name: 'design-system/passthrough' },
  preprocess(text: string, _filename: string): string[] {
    return [typeof text === 'string' ? text : ''];
  },
  postprocess(messages: Linter.LintMessage[][], _filename: string): Linter.LintMessage[] {
    return Array.isArray(messages) ? messages.flat() : [];
  },
  supportsAutofix: true
};

/**
 * Loads API rules (if `config.apiUrl` / `config.rules` are given) and returns
 * the plugin. Never rejects because of the API.
 */
export async function initializePlugin(config?: DesignSystemConfig): Promise<DesignSystemPlugin> {
  if (config) await loadRulesFromAPI(config);
  // Required lazily: index.ts uses `export =`, and this keeps the import acyclic.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('./index') as DesignSystemPlugin;
}
