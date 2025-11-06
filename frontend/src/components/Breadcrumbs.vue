<template>
  <nav 
    v-if="crumbs.length > 0" 
    class="px-8 pt-6 pb-4 border-b"
    :class="isDarkMode 
      ? 'border-gray-700 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
      : 'border-gray-200 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50'"
  >
    <div class="flex items-center gap-2 text-sm">
      <router-link
        to="/"
        class="transition-colors"
        :class="isDarkMode 
          ? 'text-gray-400 hover:text-indigo-400' 
          : 'text-gray-500 hover:text-indigo-600'"
      >
        Home
      </router-link>
      <span 
        v-for="(crumb, index) in crumbs" 
        :key="index"
        class="flex items-center gap-2"
      >
        <span :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">/</span>
        <button
          v-if="index < crumbs.length - 1 && crumb.path"
          @click="handleClick(crumb.path)"
          class="transition-colors"
          :class="isDarkMode 
            ? 'text-gray-400 hover:text-indigo-400' 
            : 'text-gray-500 hover:text-indigo-600'"
        >
          {{ crumb.label }}
        </button>
        <router-link
          v-else-if="index < crumbs.length - 1 && crumb.path && !onNavigate"
          :to="crumb.path"
          class="transition-colors"
          :class="isDarkMode 
            ? 'text-gray-400 hover:text-indigo-400' 
            : 'text-gray-500 hover:text-indigo-600'"
        >
          {{ crumb.label }}
        </router-link>
        <span
          v-else
          class="font-medium"
          :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'"
        >
          {{ crumb.label }}
        </span>
      </span>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  customPath: {
    type: String,
    default: null
  },
  onNavigate: {
    type: Function,
    default: null
  }
});

const route = useRoute();
const router = useRouter();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
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
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});

const crumbs = computed(() => {
  const path = props.customPath || route.path;
  const parts = path.split('/').filter(p => p);
  const breadcrumbs = [];
  
  // Map paths to labels
  const pathLabels = {
    '/': 'Home',
    '/components': 'Components',
    '/components/status': 'Component Status',
    '/components/buttons': 'Buttons',
    '/components/forms': 'Forms',
    '/components/cards': 'Cards',
    '/components/navigation': 'Navigation',
    '/components/data-display': 'Data Display',
    '/tokens': 'Tokens',
    '/patterns': 'Patterns',
    '/patterns/navigation': 'Navigation',
    '/patterns/data-display': 'Data Display',
    '/patterns/layout': 'Layout',
    '/patterns/forms': 'Forms',
    '/patterns/feedback': 'Feedback',
    '/fonts': 'Fonts',
    '/fonts/library': 'Font Library',
    '/fonts/scale': 'Font Scale',
    '/fonts/stack': 'Font Stack',
    '/fonts/subsetting': 'Font Subsetting',
    '/design-assets': 'Design Assets',
    '/review': 'Review',
    '/tools': 'Tools',
    '/tools/gradient-generator': 'Gradient Generator',
    '/guidelines': 'Guidelines',
    '/palette-builder': 'Palette Builder',
    // Guidelines doc paths
    '/colors': 'Colors',
    '/typography': 'Typography',
    '/spacing': 'Spacing',
    '/shadows': 'Shadows',
    '/ai/overview': 'AI Overview',
    '/ai/patterns': 'AI Patterns',
    '/ai/components': 'AI Components',
    '/hcd/principles': 'HCD Principles',
    '/hcd/research': 'User Research',
    '/hcd/accessibility': 'Accessibility',
  };
  
  // Build breadcrumbs from path parts
  let currentPath = '';
  let skipNext = false;
  
  parts.forEach((part, index) => {
    if (skipNext) {
      skipNext = false;
      return;
    }
    
    currentPath += '/' + part;
    
    // Special handling for guidelines paths
    // When we have /guidelines/colors, we want Guidelines > Colors
    // So we need to map the doc path part separately
    if (part === 'guidelines' && index < parts.length - 1) {
      // Add Guidelines breadcrumb
      breadcrumbs.push({
        label: 'Guidelines',
        path: '/guidelines'
      });
      // Handle the doc path separately
      const docPath = '/' + parts.slice(index + 1).join('/');
      const docLabel = pathLabels[docPath] || parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1).replace(/-/g, ' ');
      breadcrumbs.push({
        label: docLabel,
        path: null // Current page, not clickable
      });
      skipNext = true; // Skip processing the remaining parts
      return;
    }
    
    const label = pathLabels[currentPath] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    
    breadcrumbs.push({
      label,
      path: index < parts.length - 1 ? currentPath : null
    });
  });
  
  return breadcrumbs;
});

const handleClick = (crumbPath) => {
  if (props.onNavigate) {
    props.onNavigate(crumbPath);
  } else if (crumbPath) {
    router.push(crumbPath);
  }
};
</script>

