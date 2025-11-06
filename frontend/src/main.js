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
      path: '/font/:fontName',
      component: () => import('./components/font-previewer/FontDetail.vue'),
    },
    {
      path: '/review',
      component: () => import('./views/Review.vue'),
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
      path: '/tokens',
      component: () => import('./views/Tokens.vue'),
    },
    {
      path: '/patterns',
      component: () => import('./views/Patterns.vue'),
    },
    {
      path: '/tools/gradient-generator',
      component: () => import('./views/GradientGenerator.vue'),
    },
    {
      path: '/design-assets',
      component: () => import('./views/DesignAssets.vue'),
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
