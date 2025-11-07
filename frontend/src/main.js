import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

// Initialize dark mode before creating Vuetify
const initDarkMode = () => {
  const saved = localStorage.getItem('darkMode');
  let isDark = false;
  
  if (saved !== null) {
    isDark = saved === 'true';
  } else {
    // Check system preference
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return isDark ? 'dark' : 'light';
};

const initialTheme = initDarkMode();

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: initialTheme,
    themes: {
      light: {
        colors: {
          primary: '#4f46e5', // indigo-600
          secondary: '#6366f1', // indigo-500
          background: '#ffffff',
          surface: '#ffffff',
        },
      },
      dark: {
        colors: {
          primary: '#818cf8', // indigo-400 (lighter for dark mode)
          secondary: '#6366f1', // indigo-500
          background: '#0f172a', // slate-900
          surface: '#1e293b', // slate-800
        },
      },
    },
  },
  defaults: {
    global: {
      ripple: false,
    },
    VMain: {
      style: 'background: transparent;',
    },
    VApp: {
      style: 'background: transparent;',
    },
    VSwitch: {
      color: 'primary',
    },
    VCheckbox: {
      color: 'primary',
    },
  },
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/Home.vue'),
    },
    {
      path: '/fonts',
      component: () => import('./views/Fonts.vue'),
    },
    {
      path: '/fonts/library',
      component: () => import('./views/FontLibrary.vue'),
    },
    {
      path: '/fonts/scale',
      component: () => import('./views/FontScale.vue'),
    },
    {
      path: '/fonts/stack',
      component: () => import('./views/FontStack.vue'),
    },
    {
      path: '/fonts/subsetting',
      component: () => import('./views/FontSubsetting.vue'),
    },
    {
      path: '/font/:fontName',
      component: () => import('./components/font-previewer/FontDetail.vue'),
    },
    {
      path: '/review',
      component: () => import('./views/Review.vue'),
    },
    {
      path: '/review/my-requests',
      component: () => import('./views/ReviewKanban.vue'),
    },
    {
      path: '/review/:id',
      component: () => import('./views/ReviewPage.vue'),
    },
    {
      path: '/review/:id/preview',
      component: () => import('./views/FullScreenPreview.vue'),
    },
    {
      path: '/admin',
      component: () => import('./views/AdminDashboard.vue'),
    },
    {
      path: '/components',
      component: () => import('./views/Components.vue'),
    },
    {
      path: '/components/status',
      component: () => import('./views/ComponentStatus.vue'),
    },
    {
      path: '/components/buttons',
      component: () => import('./views/ComponentButton.vue'),
    },
    {
      path: '/components/snippets',
      component: () => import('./views/CodeSnippets.vue'),
    },
    {
      path: '/components/testing',
      component: () => import('./views/ComponentTesting.vue'),
    },
    {
      path: '/components/documentation',
      component: () => import('./views/DocumentationGenerator.vue'),
    },
    {
      path: '/components/handoff',
      component: () => import('./views/HandoffTools.vue'),
    },
    {
      path: '/governance',
      component: () => import('./views/Governance.vue'),
    },
    {
      path: '/notifications',
      component: () => import('./views/ChangeNotifications.vue'),
    },
    {
      path: '/ai-suggestions',
      component: () => import('./views/AISuggestions.vue'),
    },
    {
      path: '/brands',
      component: () => import('./views/MultiBrand.vue'),
    },
    {
      path: '/theme-builder',
      component: () => import('./views/ThemeBuilder.vue'),
    },
    {
      path: '/components/composition',
      component: () => import('./views/ComponentComposition.vue'),
    },
    {
      path: '/components/deprecation',
      redirect: '/tools/migration',
    },
    {
      path: '/tools/migration',
      component: () => import('./views/MigrationAssistant.vue'),
    },
    {
      path: '/code-quality',
      component: () => import('./views/CodeQuality.vue'),
    },
    {
      path: '/security',
      component: () => import('./views/VulnerabilityScanner.vue'),
    },
    {
      path: '/components/dependencies',
      component: () => import('./views/ComponentDependencyGraph.vue'),
    },
    {
      path: '/components/feedback',
      redirect: '/feedback',
    },
    {
      path: '/feedback',
      component: () => import('./views/Feedback.vue'),
    },
    {
      path: '/components/export',
      component: () => import('./views/ComponentLibraryExport.vue'),
    },
    {
      path: '/components/examples',
      component: () => import('./views/ComponentExamples.vue'),
    },
    {
      path: '/components/versions',
      redirect: '/components',
    },
    {
      path: '/performance/budgets',
      component: () => import('./views/PerformanceBudgets.vue'),
    },
    {
      path: '/performance/bundle-analysis',
      component: () => import('./views/BundleSizeAnalysis.vue'),
    },
    {
      path: '/roadmap',
      component: () => import('./views/Roadmap.vue'),
    },
    {
      path: '/api',
      component: () => import('./views/DesignSystemAPI.vue'),
    },
    {
      path: '/search',
      redirect: '/',
    },
    {
      path: '/health',
      component: () => import('./views/SystemHealth.vue'),
    },
    {
      path: '/tokens',
      component: () => import('./views/Tokens.vue'),
    },
    {
      path: '/tokens/studio',
      component: () => import('./views/TokenStudio.vue'),
    },
    {
      path: '/tokens/library',
      component: () => import('./views/StyleLibrary.vue'),
    },
    {
      path: '/tokens/playground',
      component: () => import('./views/TokenPlayground.vue'),
    },
    {
      path: '/patterns',
      component: () => import('./views/Patterns.vue'),
    },
    {
      path: '/patterns/navigation',
      component: () => import('./views/PatternNavigation.vue'),
    },
    {
      path: '/patterns/data-display',
      component: () => import('./views/PatternDetail.vue'),
    },
    {
      path: '/patterns/layout',
      component: () => import('./views/PatternDetail.vue'),
    },
    {
      path: '/patterns/forms',
      component: () => import('./views/PatternDetail.vue'),
    },
    {
      path: '/patterns/feedback',
      component: () => import('./views/PatternDetail.vue'),
    },
    {
      path: '/tools/gradient-generator',
      component: () => import('./views/GradientGenerator.vue'),
    },
    {
      path: '/tools/lorem-ipsum',
      component: () => import('./views/LoremIpsumGenerator.vue'),
    },
    {
      path: '/tools/seo-tagging',
      component: () => import('./views/SEOTaggingGenerator.vue'),
    },
    {
      path: '/tools/color-scale',
      component: () => import('./views/ColorScaleGenerator.vue'),
    },
    {
      path: '/tools/color-converter',
      component: () => import('./views/ColorConverter.vue'),
    },
    {
      path: '/tools/color-contrast',
      component: () => import('./views/ColorContrastChecker.vue'),
    },
    {
      path: '/tools',
      component: () => import('./views/Tools.vue'),
    },
    {
      path: '/design-assets',
      component: () => import('./views/DesignAssets.vue'),
    },
    {
      path: '/design-assets/icons',
      component: () => import('./views/IconLibrary.vue'),
    },
    {
      path: '/guidelines',
      component: () => import('./views/Guidelines.vue'),
    },
    {
      path: '/palette-builder',
      component: () => import('./views/Wizard.vue'),
    },
    // Legacy route redirect
    {
      path: '/gradient-generator',
      redirect: '/tools/gradient-generator',
    },
  ],
});

const app = createApp(App);
app.use(router);
app.use(vuetify);
app.mount('#app');
