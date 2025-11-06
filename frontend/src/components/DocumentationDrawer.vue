<template>
  <!-- Drawer - slides in/out from left, positioned next to sidebar -->
  <!-- When closed, show a small toggle button -->
  <div v-if="!isOpen" class="fixed left-24 top-16 h-[calc(100vh-4rem)] w-12 bg-white dark:bg-slate-800 border-r z-30 flex items-start justify-center pt-4 transition-all duration-300"
    :class="isDarkMode ? 'border-slate-700' : 'border-gray-200'"
  >
    <button
      @click="toggle"
      class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
      :class="isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
      title="Open drawer"
    >
      <span class="material-symbols-outlined">menu</span>
    </button>
  </div>
  
  <!-- Drawer - when open -->
  <div 
    v-if="isOpen"
    class="fixed left-24 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-800 shadow-xl overflow-y-auto z-30 border-r transition-transform duration-300 ease-in-out"
    :class="isDarkMode ? 'border-slate-700' : 'border-gray-200'"
  >
    <!-- Drawer Content -->
    <div class="p-6">
      <!-- Foundations - only show when not on patterns route -->
      <div v-if="showMainSections" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Foundations</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-1">
          <a
            v-for="item in foundations"
            :key="item.link"
            :href="getDocUrl(item.link)"
            target="_blank"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group"
            :class="isDarkMode 
              ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </a>
        </nav>
      </div>
      
      <!-- Artificial Intelligence - only show when not on patterns route -->
      <div v-if="showMainSections" class="mb-8">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Artificial Intelligence</h3>
        <nav class="space-y-1">
          <a
            v-for="item in artificialIntelligence"
            :key="item.link"
            :href="getDocUrl(item.link)"
            target="_blank"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group"
            :class="isDarkMode 
              ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </a>
        </nav>
      </div>
      
      <!-- Human-Centered Design - only show when not on patterns route -->
      <div v-if="showMainSections" class="mb-8">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Human-Centered Design</h3>
        <nav class="space-y-1">
          <a
            v-for="item in humanCenteredDesign"
            :key="item.link"
            :href="getDocUrl(item.link)"
            target="_blank"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group"
            :class="isDarkMode 
              ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </a>
        </nav>
      </div>
      
      <!-- Patterns - only show when on patterns route -->
      <div v-if="showPatterns" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patterns</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-1">
          <a
            v-for="item in patterns"
            :key="item.link"
            :href="getDocUrl(item.link)"
            target="_blank"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group"
            :class="isDarkMode 
              ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </a>
        </nav>
      </div>
      
      <!-- Fonts - only show when on fonts route -->
      <div v-if="showFonts" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fonts</h3>
          <button
            @click="toggle"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
            title="Close drawer"
          >
            <span class="material-symbols-outlined">left_panel_close</span>
          </button>
        </div>
        <nav class="space-y-1">
          <router-link
            v-for="item in fonts"
            :key="item.link"
            :to="item.link"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group"
            :class="isDarkMode 
              ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'toggle']);

const route = useRoute();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

const close = () => {
  emit('close');
};

const toggle = () => {
  emit('toggle');
};

const getDocUrl = (link) => {
  if (import.meta.env.DEV) {
    return `http://localhost:5173/guidelines${link === '/' ? '' : link}`;
  }
  return `/guidelines${link === '/' ? '/index.html' : link}.html`;
};

const foundations = [
  { text: 'Colors', link: '/colors', icon: 'palette' },
  { text: 'Typography', link: '/typography', icon: 'text_fields' },
  { text: 'Spacing', link: '/spacing', icon: 'space_dashboard' },
  { text: 'Shadows', link: '/shadows', icon: 'layers' }
];

const artificialIntelligence = [
  { text: 'AI Overview', link: '/ai/overview', icon: 'psychology' },
  { text: 'AI Patterns', link: '/ai/patterns', icon: 'auto_awesome' },
  { text: 'AI Components', link: '/ai/components', icon: 'smart_toy' }
];

const humanCenteredDesign = [
  { text: 'HCD Principles', link: '/hcd/principles', icon: 'people' },
  { text: 'User Research', link: '/hcd/research', icon: 'search' },
  { text: 'Accessibility', link: '/hcd/accessibility', icon: 'accessibility' }
];

const patterns = [
  { text: 'Layout Patterns', link: '/patterns', icon: 'view_quilt' },
  { text: 'Navigation', link: '/patterns/navigation', icon: 'navigation' },
  { text: 'Data Display', link: '/patterns/data-display', icon: 'table_chart' }
];

const fonts = [
  { text: 'Font Library', link: '/fonts/library', icon: 'library_books' },
  { text: 'Font Scale', link: '/fonts/scale', icon: 'format_size' },
  { text: 'Font Stack', link: '/fonts/stack', icon: 'layers' },
  { text: 'Font Subsetting', link: '/fonts/subsetting', icon: 'content_cut' }
];

const showPatterns = computed(() => {
  return route.path === '/patterns' || route.path.startsWith('/patterns/');
});

const showFonts = computed(() => {
  return route.path === '/fonts' || route.path.startsWith('/fonts/');
});

const showMainSections = computed(() => {
  return !showPatterns.value && !showFonts.value;
});

// Watch for dark mode changes and Escape key
let darkModeObserver = null;
let darkModeInterval = null;
let escapeHandler = null;

onMounted(() => {
  // Dark mode observer
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
  
  // Escape key handler
  escapeHandler = (e) => {
    if (e.key === 'Escape' && props.isOpen) {
      close();
    }
  };
  window.addEventListener('keydown', escapeHandler);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
  if (escapeHandler) {
    window.removeEventListener('keydown', escapeHandler);
  }
});
</script>
