<template>
  <aside 
    id="navigation" 
    data-ds-component="sidebar"
    data-ds-path="@design-system/components/sidebar"
    class="sticky top-0 h-screen text-white flex flex-col flex-shrink-0 w-24 transition-colors z-50 bg-indigo-800 dark:bg-indigo-900" 
    aria-label="Main navigation"
  >
    <!-- Navigation Items -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden pt-16 pb-4" role="navigation" aria-label="Main navigation">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex flex-col items-center px-3 py-3 relative group mb-2',
          isActive(item.path)
            ? (isDarkMode 
              ? 'border border-indigo-300 rounded-lg bg-indigo-400/30' 
              : 'border border-indigo-400 rounded-lg bg-indigo-500/30')
            : (isDarkMode
              ? 'hover:bg-indigo-400/30 rounded-lg'
              : 'hover:bg-indigo-700/50 rounded-lg')
        ]"
      >
        <span class="material-symbols-outlined flex-shrink-0 mb-2" aria-hidden="true">{{ item.icon }}</span>
        <span class="font-medium text-sm text-center">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Admin Section -->
    <div class="px-3 pb-2 border-t" :class="isDarkMode ? 'border-indigo-700' : 'border-indigo-600'">
      <router-link
        to="/admin"
        :class="[
          'flex flex-col items-center px-3 py-3 relative group',
          isActive('/admin')
            ? (isDarkMode 
              ? 'border border-indigo-300 rounded-lg bg-indigo-400/30' 
              : 'border border-indigo-400 rounded-lg bg-indigo-500/30')
            : (isDarkMode
              ? 'hover:bg-indigo-400/30 rounded-lg'
              : 'hover:bg-indigo-700/50 rounded-lg')
        ]"
      >
        <span class="material-symbols-outlined flex-shrink-0 mb-2" aria-hidden="true">admin_panel_settings</span>
        <span class="font-medium text-sm text-center">Admin</span>
      </router-link>
    </div>

    <!-- Dark Mode Toggle -->
    <div class="p-4">
      <button
        @click="toggleDarkMode"
        class="flex items-center justify-center p-2 rounded-lg transition-colors relative group w-full"
        :class="isDarkMode ? 'hover:bg-indigo-400/30' : 'hover:bg-indigo-700/50'"
        :title="isDarkMode ? 'Light Mode' : 'Dark Mode'"
        :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        aria-pressed="false"
      >
        <span class="material-symbols-outlined flex-shrink-0" aria-hidden="true">
          {{ isDarkMode ? 'light_mode' : 'dark_mode' }}
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from 'vuetify';

const route = useRoute();
const theme = useTheme();

// Initialize dark mode synchronously based on current state
const getInitialDarkMode = () => {
  // Check if dark class is already on html (set by main.js)
  if (document.documentElement.classList.contains('dark')) {
    return true;
  }
  // Check localStorage
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) {
    return saved === 'true';
  }
  // Check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const isDarkMode = ref(getInitialDarkMode());

// Load dark mode preference from localStorage and sync with Vuetify
onMounted(() => {
  // Ensure Vuetify theme matches current state
  applyDarkMode();
  
  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    // Only apply if user hasn't manually set a preference
    if (localStorage.getItem('darkMode') === null) {
      isDarkMode.value = e.matches;
      applyDarkMode();
    }
  });
});

// Watch for dark mode changes and apply
watch(isDarkMode, (newValue) => {
  applyDarkMode();
  localStorage.setItem('darkMode', newValue.toString());
});

const applyDarkMode = () => {
  // Update Tailwind dark class first
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
    theme.change('dark');
  } else {
    document.documentElement.classList.remove('dark');
    theme.change('light');
  }
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
};

const menuItems = [
  { path: '/getting-started', label: 'Getting Started', icon: 'rocket_launch' },
  { path: '/guidelines', label: 'Guidelines', icon: 'menu_book' },
  { path: '/components', label: 'Components', icon: 'widgets' },
  { path: '/tokens', label: 'Tokens', icon: 'style' },
  { path: '/patterns', label: 'Patterns', icon: 'pattern' },
  { path: '/fonts', label: 'Fonts', icon: 'text_fields' },
  { path: '/research', label: 'Research Repo', icon: 'science' },
  { path: '/design-assets', label: 'Design Assets', icon: 'collections' },
  { path: '/review', label: 'Review', icon: 'rate_review' },
  { path: '/tools', label: 'Tools', icon: 'build' },
];

const isActive = (path) => {
  if (path === '/tokens') {
    return route.path === '/tokens' || route.path.startsWith('/palette-builder');
  }
  if (path === '/tools') {
    return route.path === '/tools' || route.path.startsWith('/tools/');
  }
  if (path === '/admin') {
    return route.path === '/admin' || route.path.startsWith('/admin/');
  }
  if (path === '/getting-started') {
    return route.path === '/getting-started' || route.path.startsWith('/getting-started/');
  }
  if (path === '/research') {
    return route.path === '/research' || route.path.startsWith('/research/');
  }
  return route.path === path || route.path.startsWith(path + '/');
};
</script>

