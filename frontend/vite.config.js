import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

/** The backend's own default port (backend/src/main.ts, PORT) */
const BACKEND_DEFAULT_PORT = 3000;

/**
 * Where `vite dev` sends API calls: VITE_API_PROXY_TARGET, else the
 * VITE_API_BASE_URL the app would call directly, else the backend on its
 * default port.
 */
export function proxyTarget(env = {}) {
  return env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL || `http://localhost:${BACKEND_DEFAULT_PORT}`;
}

/**
 * The dev proxy. Only API calls are forwarded: the backend's prefixes under
 * /api, and the patterns library (mounted outside /api, since the MCP server
 * uses that path). The app's own pages, such as /api (the API reference),
 * stay with Vite, so reloading them works.
 */
export function devProxy(env = {}) {
  const backend = { target: proxyTarget(env), changeOrigin: true, secure: false };
  return {
    '^/api/(v1|palettes|versions)(/|$)': backend,
    '^/patterns-library/': backend,
  };
}

export default defineConfig({
  plugins: [
    // Trench Coat's tc-* tags are web components, not Vue components
    vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('tc-') } } }),
  ],
  server: {
    port: 5174,
    proxy: devProxy(loadEnv('development', __dirname)),
  },
  resolve: {
    alias: {
      '@docs': resolve(__dirname, 'docs'),
    },
  },
  publicDir: 'public',
  optimizeDeps: {
    include: ['@pdftron/webviewer'],
    exclude: [],
  },
});

