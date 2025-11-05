import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/Home.vue'),
    },
    {
      path: '/palette-builder',
      component: () => import('./views/Wizard.vue'),
    },
    {
      path: '/gradient-generator',
      component: () => import('./views/GradientGenerator.vue'),
    },
  ],
});

const app = createApp(App);
app.use(router);
app.mount('#app');
