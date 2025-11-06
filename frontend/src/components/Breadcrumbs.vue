<template>
  <nav v-if="crumbs.length > 0" class="px-8 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900">
    <div class="flex items-center gap-2 text-sm">
      <router-link
        to="/"
        class="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        Home
      </router-link>
      <span 
        v-for="(crumb, index) in crumbs" 
        :key="index"
        class="flex items-center gap-2"
      >
        <span class="text-gray-400 dark:text-gray-500">/</span>
        <button
          v-if="index < crumbs.length - 1 && crumb.path"
          @click="handleClick(crumb.path)"
          class="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {{ crumb.label }}
        </button>
        <router-link
          v-else-if="index < crumbs.length - 1 && crumb.path && !onNavigate"
          :to="crumb.path"
          class="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {{ crumb.label }}
        </router-link>
        <span
          v-else
          class="text-gray-900 dark:text-gray-100 font-medium"
        >
          {{ crumb.label }}
        </span>
      </span>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
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

