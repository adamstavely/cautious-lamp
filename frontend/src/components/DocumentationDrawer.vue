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
          <button
            v-for="item in foundations"
            :key="item.link"
            @click="navigateToDoc(item.link)"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="isDarkMode 
              ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </button>
        </nav>
      </div>
      
      <!-- Artificial Intelligence - only show when not on patterns route -->
      <div v-if="showMainSections" class="mb-8">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Artificial Intelligence</h3>
        <nav class="space-y-1">
          <button
            v-for="item in artificialIntelligence"
            :key="item.link"
            @click="navigateToDoc(item.link)"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="isDarkMode 
              ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </button>
        </nav>
      </div>
      
      <!-- Human-Centered Design - only show when not on patterns route -->
      <div v-if="showMainSections" class="mb-8">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Human-Centered Design</h3>
        <nav class="space-y-1">
          <button
            v-for="item in humanCenteredDesign"
            :key="item.link"
            @click="navigateToDoc(item.link)"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="isDarkMode 
              ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </button>
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
          <button
            v-for="item in patterns"
            :key="item.link"
            @click="navigateToDoc(item.link)"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="isDarkMode 
              ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </button>
        </nav>
      </div>
      
      <!-- Components - only show when on components route -->
      <div v-if="showComponents" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Components</h3>
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
            v-for="item in componentItems"
            :key="item.link"
            :to="item.link"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="[
              isActive(item.link)
                ? (isDarkMode 
                  ? 'text-indigo-400 bg-indigo-900/20' 
                  : 'text-indigo-600 bg-indigo-50')
                : (isDarkMode
                  ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
            ]"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
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
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="[
              isActive(item.link)
                ? (isDarkMode 
                  ? 'text-indigo-400 bg-indigo-900/20' 
                  : 'text-indigo-600 bg-indigo-50')
                : (isDarkMode
                  ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
            ]"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
        </nav>
      </div>
      
      <!-- Tools - only show when on tools route -->
      <div v-if="showTools" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tools</h3>
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
            v-for="item in tools"
            :key="item.link"
            :to="item.link"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="[
              isActive(item.link)
                ? (isDarkMode 
                  ? 'text-indigo-400 bg-indigo-900/20' 
                  : 'text-indigo-600 bg-indigo-50')
                : (isDarkMode
                  ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
            ]"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
        </nav>
      </div>
      
      <!-- Review - only show when on review route -->
      <div v-if="showReview" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Review</h3>
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
            v-for="item in reviewItems"
            :key="item.link"
            :to="item.link"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="[
              isActive(item.link)
                ? (isDarkMode 
                  ? 'text-indigo-400 bg-indigo-900/20' 
                  : 'text-indigo-600 bg-indigo-50')
                : (isDarkMode
                  ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
            ]"
          >
            <span class="material-symbols-outlined text-lg">{{ item.icon }}</span>
            <span class="font-medium">{{ item.text }}</span>
          </router-link>
        </nav>
      </div>
      
      <!-- Design Assets - only show when on design assets route -->
      <div v-if="showDesignAssets" class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Design Assets</h3>
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
            v-for="item in designAssets"
            :key="item.link"
            :to="item.link"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group w-full text-left"
            :class="[
              isActive(item.link)
                ? (isDarkMode 
                  ? 'text-indigo-400 bg-indigo-900/20' 
                  : 'text-indigo-600 bg-indigo-50')
                : (isDarkMode
                  ? 'text-gray-300 hover:bg-slate-700 hover:text-white' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
            ]"
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
import { useRoute, useRouter, RouterLink } from 'vue-router';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'toggle', 'navigate-doc']);

const route = useRoute();
const router = useRouter();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

const close = () => {
  emit('close');
};

const toggle = () => {
  emit('toggle');
};

const navigateToDoc = (link) => {
  emit('navigate-doc', link);
  // Navigate to guidelines page if not already there
  if (route.path !== '/guidelines') {
    router.push('/guidelines');
  }
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

const reviewItems = [
  { text: 'Overview', link: '/review', icon: 'rate_review' },
  { text: 'My Requested Reviews', link: '/review/my-requests', icon: 'view_module' },
  { text: 'Admin', link: '/admin', icon: 'admin_panel_settings' }
];

const tools = [
  { text: 'Overview', link: '/tools', icon: 'build' },
  { text: 'Gradient Generator', link: '/tools/gradient-generator', icon: 'gradient' },
  { text: 'Lorem Ipsum Generator', link: '/tools/lorem-ipsum', icon: 'text_fields' },
  { text: 'SEO Tagging Generator', link: '/tools/seo-tagging', icon: 'search' },
  { text: 'Palette Builder', link: '/palette-builder', icon: 'palette' }
];

const designAssets = [
  { text: 'Overview', link: '/design-assets', icon: 'collections' },
  { text: 'Icon Library', link: '/design-assets/icons', icon: 'star' },
  { text: 'Images', link: '/design-assets/images', icon: 'image' },
  { text: 'Logos', link: '/design-assets/logos', icon: 'account_circle' },
  { text: 'Illustrations', link: '/design-assets/illustrations', icon: 'draw' },
  { text: 'Patterns', link: '/design-assets/patterns', icon: 'pattern' }
];

const componentItems = [
  { text: 'Overview', link: '/components', icon: 'widgets' },
  { text: 'Component Status', link: '/components/status', icon: 'check_circle' },
  { text: 'Buttons', link: '/components/buttons', icon: 'smart_button' },
  { text: 'Forms', link: '/components/forms', icon: 'description' },
  { text: 'Cards', link: '/components/cards', icon: 'view_module' },
  { text: 'Navigation', link: '/components/navigation', icon: 'navigation' },
  { text: 'Data Display', link: '/components/data-display', icon: 'table_chart' }
];

const showReview = computed(() => {
  return route.path === '/review' || route.path.startsWith('/review/') || route.path === '/admin';
});

const showPatterns = computed(() => {
  return route.path === '/patterns' || route.path.startsWith('/patterns/');
});

const showFonts = computed(() => {
  return route.path === '/fonts' || route.path.startsWith('/fonts/');
});

const showTools = computed(() => {
  return route.path === '/tools' || route.path.startsWith('/tools/') || route.path === '/palette-builder';
});

const showDesignAssets = computed(() => {
  return route.path === '/design-assets' || route.path.startsWith('/design-assets/');
});

const showComponents = computed(() => {
  return route.path === '/components' || route.path.startsWith('/components/');
});

const showMainSections = computed(() => {
  return !showPatterns.value && !showFonts.value && !showComponents.value && !showTools.value && !showDesignAssets.value && !showReview.value;
});

const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/');
};

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
