<template>
  <aside 
    id="navigation" 
    data-ds-component="sidebar"
    data-ds-path="@design-system/components/sidebar"
    class="side sticky top-0 h-screen flex flex-col flex-shrink-0 w-24 transition-colors z-50" 
    aria-label="Main navigation"
  >
    <!-- Navigation Items -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden pt-16 pb-4 px-2" role="navigation" aria-label="Main navigation">
      <template v-for="(item, index) in menuItems" :key="item.path">
        <router-link
          :to="item.path"
          @click="handleSidebarClick"
          :class="['side-item mb-1', { on: isActive(item.path) }]"
        >
          <span class="material-symbols-outlined side-ic" aria-hidden="true">{{ item.icon }}</span>
          <span class="side-label">{{ item.label }}</span>
        </router-link>
        <!-- Divider after HCD and Design Assets -->
        <div 
          v-if="item.path === '/research' || item.path === '/design-assets'"
          class="side-divider"
          aria-hidden="true"
        ></div>
      </template>
    </nav>

    <!-- Admin Section (only for people who can open it) -->
    <div v-if="canAccessPath('/admin')" class="px-2 pb-2">
      <router-link
        to="/admin"
        @click="handleSidebarClick"
        :class="['side-item', { on: isActive('/admin') }]"
      >
        <span class="material-symbols-outlined side-ic" aria-hidden="true">admin_panel_settings</span>
        <span class="side-label">Admin</span>
      </router-link>
    </div>

    <!-- Dark Mode Toggle -->
    <div class="px-2 pb-4">
      <button
        @click="toggleDarkMode"
        class="side-item w-full"
        :title="darkTheme ? 'Light Mode' : 'Dark Mode'"
        :aria-label="darkTheme ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <span class="material-symbols-outlined side-ic flex-shrink-0" aria-hidden="true">
          {{ darkTheme ? 'light_mode' : 'dark_mode' }}
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from 'vuetify';
import { canAccessPath } from '../router/rbacGuards.js';

const route = useRoute();
const theme = useTheme();

// Handle sidebar click - set flag to auto-open drawer
const handleSidebarClick = () => {
  // Set flag in sessionStorage to indicate sidebar navigation
  sessionStorage.setItem('openDrawerOnLoad', 'true');
};

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

const darkTheme = ref(getInitialDarkMode());

// Load dark mode preference from localStorage and sync with Vuetify
onMounted(() => {
  // Ensure Vuetify theme matches current state
  applyDarkMode();
  
  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    // Only apply if user hasn't manually set a preference
    if (localStorage.getItem('darkMode') === null) {
      darkTheme.value = e.matches;
      applyDarkMode();
    }
  });
});

// Watch for dark mode changes and apply
watch(darkTheme, (newValue) => {
  applyDarkMode();
  localStorage.setItem('darkMode', newValue.toString());
});

const applyDarkMode = () => {
  // Update Tailwind dark class first
  if (darkTheme.value) {
    document.documentElement.classList.add('dark');
    theme.change('dark');
  } else {
    document.documentElement.classList.remove('dark');
    theme.change('light');
  }
};

const toggleDarkMode = () => {
  darkTheme.value = !darkTheme.value;
};

const menuItems = [
  { path: '/getting-started', label: 'Getting Started', icon: 'rocket_launch' },
  { path: '/guidelines', label: 'Guidelines', icon: 'menu_book' },
  { path: '/research', label: 'HCD', icon: 'note_stack' },
  { path: '/components', label: 'Components', icon: 'widgets' },
  { path: '/tokens', label: 'Tokens', icon: 'style' },
  { path: '/patterns', label: 'Patterns', icon: 'pattern' },
  { path: '/design-assets', label: 'Design Assets', icon: 'collections' },
  { path: '/review', label: 'Review', icon: 'rate_review' },
  { path: '/data-viz', label: 'Data Viz', icon: 'bar_chart' },
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
    return route.path === '/research' || route.path.startsWith('/research/') || route.path.startsWith('/hcd/');
  }
  if (path === '/data-viz') {
    return route.path === '/data-viz' || route.path.startsWith('/data-viz/');
  }
  return route.path === path || route.path.startsWith(path + '/');
};
</script>

<style scoped>
.side {
  @apply bg-surface border-r border-line text-ink-secondary;
}
.side-item {
  @apply flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-tile transition-colors hover:bg-fill-hover hover:text-ink-strong;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
.side-item.on {
  @apply bg-accent-subtle text-accent-text;
}
.side-ic {
  @apply text-ink-muted transition-colors;
}
.side-item:hover .side-ic,
.side-item.on .side-ic {
  @apply text-accent-text;
}
.side-label {
  @apply text-xs font-medium text-center leading-tight;
}
.side-item.on .side-label {
  @apply font-semibold;
}
.side-divider {
  @apply h-px mx-3 my-2 bg-line;
}
</style>
