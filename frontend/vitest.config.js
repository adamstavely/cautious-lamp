import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

// Unit tests for regressions fixed in the generators, auth, RBAC guards and
// workspace pages. Reuses the app's Vite config (Vue plugin, aliases).
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.js'],
      // Same behaviour on every machine, whatever is in a local .env file.
      env: { VITE_API_BASE_URL: '', VITE_USE_MOCKS: 'false' },
      restoreMocks: true,
    },
  }),
);
