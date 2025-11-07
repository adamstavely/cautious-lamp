// ESLint configuration processor
// This file helps initialize the plugin with rules from the API

import { DesignSystemConfig } from './rule-converter';
import { loadRulesFromAPI } from './index';

// ESLint processor for async rule loading
export const processor = {
  preprocess(text: string, filename: string) {
    return [text];
  },
  postprocess(messages: any[], filename: string) {
    return messages.flat();
  },
  supportsAutofix: true
};

// Initialize plugin with config from ESLint settings
export async function initializePlugin(config?: DesignSystemConfig) {
  if (config?.apiUrl) {
    await loadRulesFromAPI(config);
  }
  // Use dynamic import to avoid circular dependency
  const plugin = await import('./index');
  return plugin.default;
}
