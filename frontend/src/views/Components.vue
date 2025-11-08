<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-hidden">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Components
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Explore our comprehensive library of reusable UI components. Each component is designed with accessibility, consistency, and flexibility in mind, enabling you to build beautiful interfaces faster.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="componentsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Stylized components icon -->
                    <rect x="30" y="30" width="60" height="60" rx="8" fill="url(#componentsGradient)" opacity="0.3"/>
                    <rect x="110" y="30" width="60" height="60" rx="8" fill="url(#componentsGradient)" opacity="0.5"/>
                    <rect x="30" y="110" width="60" height="60" rx="8" fill="url(#componentsGradient)" opacity="0.4"/>
                    <rect x="110" y="110" width="60" height="60" rx="8" fill="url(#componentsGradient)" opacity="0.6"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Browse Components Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Browse components
            </h2>
            <button 
              class="px-6 py-2 rounded-full border transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'"
            >
              View all components
            </button>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <!-- Component Card 0: Buttons -->
            <router-link 
              to="/components/buttons" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">smart_button</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Buttons
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Primary, secondary, and tertiary button variants.
              </p>
            </router-link>

            <!-- Component Card: Color Picker -->
            <router-link 
              to="/components/color-picker" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4 flex items-center justify-center" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <Pipette :size="48" :stroke-width="2" />
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Color Picker
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Comprehensive color picker with gradient selector and multiple color formats.
              </p>
            </router-link>

            <!-- Component Card 3: Forms -->
            <router-link 
              to="/components/forms" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">description</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Forms
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Input fields, selects, checkboxes, and form controls.
              </p>
            </router-link>

            <!-- Component Card 4: Cards -->
            <router-link 
              to="/components/cards" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">view_module</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Cards
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Card components for displaying content and actions.
              </p>
            </router-link>

            <!-- Component Card 5: Navigation -->
            <router-link 
              to="/components/navigation" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">navigation</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Navigation
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Menus, breadcrumbs, tabs, and navigation components.
              </p>
            </router-link>

            <!-- Component Card 6: Data Display -->
            <router-link 
              to="/components/data-display" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">table_chart</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Data Display
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Tables, lists, and data visualization components.
              </p>
            </router-link>

            <!-- Component Card 7c: Testing Framework -->
            <router-link 
              to="/components/testing" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">bug_report</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Testing Framework
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate tests and run visual regression tests.
              </p>
            </router-link>

            <!-- Component Card 7d: Documentation Generator -->
            <router-link 
              to="/components/documentation" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">description</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Documentation Generator
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Auto-generate docs from code comments.
              </p>
            </router-link>

            <!-- Component Card 7: Export -->
            <router-link 
              to="/components/export" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">download</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Library Export
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export components as Storybook, PDF, Markdown, and more.
              </p>
            </router-link>
          </div>
        </div>

        <!-- Featured Components Section -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-4xl md:text-5xl font-bold text-white">
                Component Tools
              </h2>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6 mt-8">
              <!-- Component Status Card -->
              <router-link 
                to="/components/status" 
                class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <div class="w-12 h-12 mb-4 flex items-center justify-center text-white">
                  <span class="material-symbols-outlined text-5xl">check_circle</span>
                </div>
                <h3 class="text-white font-semibold text-xl mb-2 group-hover:text-indigo-200 transition-colors">Component Status</h3>
                <p class="text-white/80 text-sm">Track component development status and availability.</p>
              </router-link>

              <!-- Loupe Card -->
              <router-link 
                to="/components/loupe" 
                class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <div class="w-12 h-12 mb-4 flex items-center justify-center text-white">
                  <ScanEye :size="48" :stroke-width="2" />
                </div>
                <h3 class="text-white font-semibold text-xl mb-2 group-hover:text-indigo-200 transition-colors">Loupe</h3>
                <p class="text-white/80 text-sm">Inspect design system components on any page.</p>
              </router-link>

              <!-- Dependency Graph Card -->
              <router-link 
                to="/components/dependencies" 
                class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
              >
                <div class="w-12 h-12 mb-4 flex items-center justify-center text-white">
                  <span class="material-symbols-outlined text-5xl">account_tree</span>
                </div>
                <h3 class="text-white font-semibold text-xl mb-2 group-hover:text-indigo-200 transition-colors">Dependency Graph</h3>
                <p class="text-white/80 text-sm">Visualize component relationships and dependencies.</p>
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
import { Pipette, ScanEye } from 'lucide-vue-next';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

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
