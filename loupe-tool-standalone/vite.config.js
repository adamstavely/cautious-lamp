import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'LoupeTool',
      // ESM gets .mjs so Node treats it as a module (the package is CommonJS by default)
      fileName: (format) => (format === 'es' ? 'loupe-tool.es.mjs' : 'loupe-tool.umd.js'),
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        // initX() and the component are named exports; the component is also the default
        exports: 'named',
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});

