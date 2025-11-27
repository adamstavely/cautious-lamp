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
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Color Palettes
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Discover curated color palettes designed for accessibility and consistency in modern design systems. Each palette is carefully crafted with equal contrast levels and theme support.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="paletteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Color palette swatches -->
                    <rect x="30" y="40" width="35" height="35" rx="3" fill="#4f46e5" opacity="0.8"/>
                    <rect x="70" y="40" width="35" height="35" rx="3" fill="#6366f1" opacity="0.8"/>
                    <rect x="110" y="40" width="35" height="35" rx="3" fill="#818cf8" opacity="0.8"/>
                    <rect x="150" y="40" width="35" height="35" rx="3" fill="#a5b4fc" opacity="0.8"/>
                    <rect x="30" y="80" width="35" height="35" rx="3" fill="#7c3aed" opacity="0.7"/>
                    <rect x="70" y="80" width="35" height="35" rx="3" fill="#8b5cf6" opacity="0.7"/>
                    <rect x="110" y="80" width="35" height="35" rx="3" fill="#a78bfa" opacity="0.7"/>
                    <rect x="150" y="80" width="35" height="35" rx="3" fill="#c4b5fd" opacity="0.7"/>
                    <rect x="30" y="120" width="35" height="35" rx="3" fill="#059669" opacity="0.7"/>
                    <rect x="70" y="120" width="35" height="35" rx="3" fill="#10b981" opacity="0.7"/>
                    <rect x="110" y="120" width="35" height="35" rx="3" fill="#34d399" opacity="0.7"/>
                    <rect x="150" y="120" width="35" height="35" rx="3" fill="#6ee7b7" opacity="0.7"/>
                    <!-- Palette frame/border -->
                    <rect x="25" y="35" width="165" height="125" rx="4" fill="none" stroke="url(#paletteGradient)" stroke-width="2" opacity="0.4"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Palettes -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Available Palettes
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400">
              Browse our curated collection of color palettes designed for modern design systems.
            </p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Harmony Palette Card -->
            <router-link
              to="/tokens/color-palettes/harmony"
              class="group rounded-2xl p-8 border transition-all hover:shadow-xl"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 mb-0" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                      <span class="material-symbols-outlined text-5xl">palette</span>
                    </div>
                    <h3 
                      class="font-semibold text-2xl transition-colors"
                      :class="isDarkMode 
                        ? 'text-white group-hover:text-indigo-400' 
                        : 'text-gray-900 group-hover:text-indigo-600'"
                    >
                      Harmony
                    </h3>
                  </div>
                  <p class="text-base mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Accessible UI color palette by Evil Martians. Uses OKLCH and APCA for highly consistent color shades with precise control over text and UI element contrast.
                  </p>
                  
                  <!-- Features Badges -->
                  <div class="flex flex-wrap gap-2 mb-4">
                    <span 
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
                    >
                      OKLCH
                    </span>
                    <span 
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
                    >
                      APCA
                    </span>
                    <span 
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
                    >
                      Tailwind
                    </span>
                    <span 
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
                    >
                      P3 Support
                    </span>
                  </div>
                  
                  <!-- Install Info -->
                  <div class="p-3 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <code class="text-xs font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      npm install @evilmartians/harmony
                    </code>
                  </div>
                </div>
                <span class="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1 ml-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                  arrow_forward
                </span>
              </div>
            </router-link>

            <!-- Colored Text Options Palette Card -->
            <router-link
              to="/tokens/color-palettes/colored-text"
              class="group rounded-2xl p-8 border transition-all hover:shadow-xl"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 mb-0" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                      <span class="material-symbols-outlined text-5xl">layers</span>
                    </div>
                    <h3 
                      class="font-semibold text-2xl transition-colors"
                      :class="isDarkMode 
                        ? 'text-white group-hover:text-indigo-400' 
                        : 'text-gray-900 group-hover:text-indigo-600'"
                    >
                      Neutral Backgrounds
                    </h3>
                  </div>
                  <p class="text-base mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Explore neutral color palettes designed for backgrounds. Instead of using pure black or white, these neutral shades provide subtle, accessible background options that work beautifully in both light and dark themes.
                  </p>
                  
                  <!-- Features Badges -->
                  <div class="flex flex-wrap gap-2 mb-4">
                    <span 
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
                    >
                      Neutral Colors
                    </span>
                    <span 
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
                    >
                      Background Focused
                    </span>
                    <span 
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
                    >
                      WCAG Compliant
                    </span>
                  </div>
                </div>
                <span class="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1 ml-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                  arrow_forward
                </span>
              </div>
            </router-link>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { useDrawer } from '../composables/useDrawer.js';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();





let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
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

