<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Font Scale
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create harmonious typography scales using mathematical ratios. Generate consistent heading and body text sizes for your design system.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
                      Typography Tool
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated Jan 15, 2024
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="fontScaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized font scale icon -->
                      <line x1="40" y1="40" x2="40" y2="160" stroke="url(#fontScaleGradient)" stroke-width="4" opacity="0.6"/>
                      <text x="50" y="50" font-family="Arial" font-size="24" font-weight="bold" fill="url(#fontScaleGradient)" opacity="0.8">H1</text>
                      <text x="50" y="80" font-family="Arial" font-size="18" font-weight="bold" fill="url(#fontScaleGradient)" opacity="0.7">H2</text>
                      <text x="50" y="110" font-family="Arial" font-size="14" fill="url(#fontScaleGradient)" opacity="0.6">Body</text>
                      <text x="50" y="140" font-family="Arial" font-size="12" fill="url(#fontScaleGradient)" opacity="0.5">Small</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="max-w-6xl mx-auto">

          <!-- Base Font Size Input -->
          <div 
            class="mb-6 rounded-lg border p-6" 
            :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
          >
            <label 
              class="text-sm font-medium mb-2 block flex items-center gap-2" 
              :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
            >
              <span class="material-symbols-outlined text-indigo-600">text_fields</span>
              Base Font Size (px)
            </label>
            <input 
              v-model.number="fontSize" 
              type="number" 
              min="12" 
              max="72"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'"
            />
          </div>
          
          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column: Individual Size Displays -->
            <div class="space-y-4">
              <div 
                v-for="(size, name) in computedTypographyScale" 
                :key="name" 
                class="rounded-lg border p-6" 
                :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
              >
                <div 
                  class="text-xs font-semibold uppercase tracking-wide mb-2" 
                  :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                >
                  {{ name === 'h1' ? 'Heading 1' : name === 'h2' ? 'Heading 2' : name === 'h3' ? 'Heading 3' : name === 'h4' ? 'Heading 4' : name === 'h5' ? 'Heading 5' : name === 'h6' ? 'Heading 6' : name === 'body' ? 'Body Text' : 'Small Text' }}
                </div>
                <div 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'" 
                  :style="{ fontSize: size + 'px', fontFamily: 'system-ui, sans-serif', lineHeight: lineHeight, letterSpacing: letterSpacing + 'px', fontWeight: name.startsWith('h') ? 'bold' : 'normal' }"
                >
                  {{ name === 'body' ? 'The quick brown fox jumps over the lazy dog.' : name === 'small' ? 'Small text example' : name.toUpperCase() + ' Heading Example' }}
                </div>
                <div 
                  class="text-xs mt-2" 
                  :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                >
                  {{ size }}px
                </div>
              </div>
            </div>
            
            <!-- Right Column: Complete Scale Preview -->
            <div 
              class="rounded-lg border p-6" 
              :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
            >
              <h4 
                class="font-semibold mb-4 flex items-center gap-2" 
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
              >
                <span class="material-symbols-outlined text-indigo-600">preview</span>
                Complete Scale Preview
              </h4>
              <div class="space-y-2" :style="{ fontFamily: 'system-ui, sans-serif' }">
                <div 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'" 
                  :style="{ fontSize: computedTypographyScale.h1 + 'px', fontWeight: 'bold', lineHeight: lineHeight }"
                >
                  Heading 1
                </div>
                <div 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'" 
                  :style="{ fontSize: computedTypographyScale.h2 + 'px', fontWeight: 'bold', lineHeight: lineHeight }"
                >
                  Heading 2
                </div>
                <div 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'" 
                  :style="{ fontSize: computedTypographyScale.h3 + 'px', fontWeight: 'bold', lineHeight: lineHeight }"
                >
                  Heading 3
                </div>
                <div 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'" 
                  :style="{ fontSize: computedTypographyScale.h4 + 'px', fontWeight: 'bold', lineHeight: lineHeight }"
                >
                  Heading 4
                </div>
                <div 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'" 
                  :style="{ fontSize: computedTypographyScale.body + 'px', lineHeight: lineHeight }"
                >
                  Body text with normal weight
                </div>
                <div 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'" 
                  :style="{ fontSize: computedTypographyScale.small + 'px', lineHeight: lineHeight }"
                >
                  Small text
                </div>
              </div>
            </div>
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

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

