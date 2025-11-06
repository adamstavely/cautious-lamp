<template>
  <nav v-if="crumbs.length > 0" class="px-8 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
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
        <router-link
          v-if="index < crumbs.length - 1 && crumb.path"
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
import { useRoute } from 'vue-router';

const route = useRoute();

const crumbs = computed(() => {
  const path = route.path;
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
  };
  
  // Build breadcrumbs from path parts
  let currentPath = '';
  
  parts.forEach((part, index) => {
    currentPath += '/' + part;
    const label = pathLabels[currentPath] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    
    breadcrumbs.push({
      label,
      path: index < parts.length - 1 ? currentPath : null
    });
  });
  
  return breadcrumbs;
});
</script>

