<template>
  <aside class="sticky top-0 h-screen text-white flex flex-col flex-shrink-0 w-24 transition-colors z-50"
    :style="isDarkMode ? 'background-color: #6366f1' : 'background-color: #4f46e5'"
  >
    <!-- Navigation Items -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden pt-16 pb-4">
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
        <span class="material-symbols-outlined flex-shrink-0 mb-2">{{ item.icon }}</span>
        <span class="font-medium text-sm text-center">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Dark Mode Toggle -->
    <div class="p-4">
      <button
        @click="toggleDarkMode"
        class="flex items-center justify-center p-2 rounded-lg transition-colors relative group w-full"
        :class="isDarkMode ? 'hover:bg-indigo-400/30' : 'hover:bg-indigo-700/50'"
        :title="isDarkMode ? 'Light Mode' : 'Dark Mode'"
      >
        <span class="material-symbols-outlined flex-shrink-0">
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
  { path: '/guidelines', label: 'Guidelines', icon: 'menu_book' },
  { path: '/components', label: 'Components', icon: 'widgets' },
  { path: '/tokens', label: 'Tokens', icon: 'style' },
  { path: '/patterns', label: 'Patterns', icon: 'pattern' },
  { path: '/fonts', label: 'Fonts', icon: 'text_fields' },
  { path: '/design-assets', label: 'Design Assets', icon: 'collections' },
  { path: '/review', label: 'Review', icon: 'rate_review' },
  { path: '/tools/gradient-generator', label: 'Tools', icon: 'build' },
];

const isActive = (path) => {
  if (path === '/tokens') {
    return route.path === '/tokens' || route.path.startsWith('/palette-builder');
  }
  return route.path === path || route.path.startsWith(path + '/');
};
</script>

