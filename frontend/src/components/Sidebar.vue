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

    <!-- Admin Section -->
    <div class="px-2 pb-2">
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
        class="side-item side-toggle w-full"
        :title="isDarkMode ? 'Light Mode' : 'Dark Mode'"
        :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        aria-pressed="false"
      >
        <span class="material-symbols-outlined side-ic" aria-hidden="true">
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
  background: var(--ds-bg);
  color: var(--ds-muted);
  border-right: 1px solid var(--ds-line);
}
.side-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  border-radius: 10px;
  color: var(--ds-muted);
  transition: .12s;
}
.side-item:hover {
  background: var(--ds-bg-3);
  color: var(--ds-ink);
}
.side-item.on {
  background: var(--ds-accent-wash);
  color: var(--ds-accent-ink);
}
.side-ic {
  color: var(--ds-faint);
  transition: color .12s;
}
.side-item:hover .side-ic,
.side-item.on .side-ic {
  color: var(--ds-accent);
}
.side-label {
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.25;
  text-align: center;
}
.side-item.on .side-label {
  font-weight: 600;
}
.side-toggle {
  padding: 8px;
}
.side-divider {
  height: 1px;
  margin: 6px 12px 8px;
  background: var(--ds-line);
}
</style>
