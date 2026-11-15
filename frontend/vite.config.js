import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    // Trench Coat's tc-* tags are web components, not Vue components
    vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('tc-') } } }),
  ],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      // The patterns library is mounted outside /api (the MCP server uses that path)
      '/patterns-library': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
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

