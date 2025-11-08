import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
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

