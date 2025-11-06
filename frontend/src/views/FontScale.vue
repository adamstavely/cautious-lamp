<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-y-auto"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="min-h-screen pb-16">
        <div class="p-8">
          <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="mb-8">
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-600">format_line_spacing</span>
              Font Scale
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Create a harmonious typography scale based on a base font size using a mathematical ratio.
            </p>
          </div>

          <!-- Base Font Size Input -->
          <div class="mb-6 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Base Font Size (px)</label>
            <input 
              v-model.number="fontSize" 
              type="number" 
              min="12" 
              max="72"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <!-- Typography Scale Display -->
          <div class="space-y-4 mb-6">
            <div v-for="(size, name) in computedTypographyScale" :key="name" class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                {{ name === 'h1' ? 'Heading 1' : name === 'h2' ? 'Heading 2' : name === 'h3' ? 'Heading 3' : name === 'h4' ? 'Heading 4' : name === 'h5' ? 'Heading 5' : name === 'h6' ? 'Heading 6' : name === 'body' ? 'Body Text' : 'Small Text' }}
              </div>
              <div class="text-gray-900 dark:text-white" :style="{ fontSize: size + 'px', fontFamily: 'system-ui, sans-serif', lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', fontWeight: name.startsWith('h') ? 'bold' : 'normal' }">
                {{ name === 'body' ? 'The quick brown fox jumps over the lazy dog.' : name === 'small' ? 'Small text example' : name.toUpperCase() + ' Heading Example' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">{{ size }}px</div>
            </div>
          </div>
          
          <!-- Complete Scale Preview -->
          <div class="bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-4">Complete Scale Preview</h4>
            <div class="space-y-2" :style="{ fontFamily: 'system-ui, sans-serif' }">
              <div class="text-gray-900 dark:text-white" :style="{ fontSize: computedTypographyScale.h1 + 'px', fontWeight: 'bold', lineHeight: lineHeight }">Heading 1</div>
              <div class="text-gray-900 dark:text-white" :style="{ fontSize: computedTypographyScale.h2 + 'px', fontWeight: 'bold', lineHeight: lineHeight }">Heading 2</div>
              <div class="text-gray-900 dark:text-white" :style="{ fontSize: computedTypographyScale.h3 + 'px', fontWeight: 'bold', lineHeight: lineHeight }">Heading 3</div>
              <div class="text-gray-900 dark:text-white" :style="{ fontSize: computedTypographyScale.h4 + 'px', fontWeight: 'bold', lineHeight: lineHeight }">Heading 4</div>
              <div class="text-gray-900 dark:text-white" :style="{ fontSize: computedTypographyScale.body + 'px', lineHeight: lineHeight }">Body text with normal weight</div>
              <div class="text-gray-900 dark:text-white" :style="{ fontSize: computedTypographyScale.small + 'px', lineHeight: lineHeight }">Small text</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const fontSize = ref(16);
const lineHeight = ref(1.4);
const letterSpacing = ref(0);

const computedTypographyScale = computed(() => {
  const ratio = 1.333; // Major third
  const baseSize = fontSize.value;
  return {
    h1: Math.round(baseSize * Math.pow(ratio, 3)),
    h2: Math.round(baseSize * Math.pow(ratio, 2)),
    h3: Math.round(baseSize * ratio),
    h4: baseSize,
    h5: Math.round(baseSize / ratio),
    h6: Math.round(baseSize / Math.pow(ratio, 2)),
    body: baseSize,
    small: Math.round(baseSize * 0.875)
  };
});

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

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
</script>

