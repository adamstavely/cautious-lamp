import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.js'],
  },
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'BreakpointOverlay',
      // ESM gets .mjs so Node treats it as a module (the package is CommonJS by default)
      fileName: (format) => (format === 'es' ? 'breakpoint-overlay.es.mjs' : 'breakpoint-overlay.umd.js'),
      formats: ['es', 'umd'],
      // Vite 6 names the CSS after the package; the ./style.css export expects style.css
      cssFileName: 'style'
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

