<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" @navigate-doc="handleDocNavigation" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Markdown Content - shown when a doc link is clicked -->
      <div v-if="currentDocLink" class="h-full w-full relative flex flex-col">
        <!-- Breadcrumbs -->
        <Breadcrumbs 
          :custom-path="currentDocLink"
          :on-navigate="handleBreadcrumbNavigate"
        />
        <div class="flex-1 overflow-hidden">
          <MarkdownViewer :doc-path="currentDocLink" />
        </div>
      </div>
      
      <!-- Overview Content - shown by default -->
      <div v-else class="h-full overflow-y-auto">
        <!-- Breadcrumbs -->
        <Breadcrumbs />
        
        <div class="p-8">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Data Visualization
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Create interactive charts, timelines, tables, and data visualizations to effectively communicate insights and information.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="dataVizGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Bar chart representation -->
                    <rect x="40" y="120" width="20" height="40" rx="2" fill="url(#dataVizGradient)" opacity="0.6"/>
                    <rect x="70" y="100" width="20" height="60" rx="2" fill="url(#dataVizGradient)" opacity="0.7"/>
                    <rect x="100" y="110" width="20" height="50" rx="2" fill="url(#dataVizGradient)" opacity="0.6"/>
                    <rect x="130" y="90" width="20" height="70" rx="2" fill="url(#dataVizGradient)" opacity="0.8"/>
                    <!-- Line chart representation -->
                    <path d="M 50 80 Q 70 70, 90 75 T 130 70" stroke="url(#dataVizGradient)" stroke-width="3" fill="none" opacity="0.6"/>
                    <circle cx="50" cy="80" r="4" fill="url(#dataVizGradient)" opacity="0.7"/>
                    <circle cx="90" cy="75" r="4" fill="url(#dataVizGradient)" opacity="0.7"/>
                    <circle cx="130" cy="70" r="4" fill="url(#dataVizGradient)" opacity="0.7"/>
                    <!-- Pie chart representation -->
                    <path d="M 100 50 L 100 50 A 25 25 0 0 1 120 65 Z" fill="url(#dataVizGradient)" opacity="0.5"/>
                    <path d="M 100 50 L 120 65 A 25 25 0 0 1 100 75 Z" fill="url(#dataVizGradient)" opacity="0.6"/>
                    <path d="M 100 50 L 100 75 A 25 25 0 0 1 80 65 Z" fill="url(#dataVizGradient)" opacity="0.4"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Browse Data Visualization Tools Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Browse Data Visualization Tools
            </h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Chart Builder Card -->
            <router-link 
              to="/tools/chart-builder" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">bar_chart</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Chart Builder
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Create interactive charts and graphs including line, bar, pie, doughnut, scatter plots, treemaps, and more.
              </p>
            </router-link>

            <!-- Map Maker Card -->
            <router-link 
              to="/tools/map-maker" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">map</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Map Maker
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Create interactive choropleth and flow maps with accurate geographic boundaries using TopoJSON data.
              </p>
            </router-link>

            <!-- Timeline Generator Card -->
            <router-link 
              to="/tools/timeline-generator" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">timeline</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Timeline Generator
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Create interactive timelines with events, dates, and custom styling for historical or project visualization.
              </p>
            </router-link>

            <!-- Table Generator Card -->
            <router-link 
              to="/tools/table-generator" 
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
                Table Generator
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate data tables with sorting, filtering, pagination, and customizable styling options.
              </p>
            </router-link>

            <!-- Color Scale Generator Card -->
            <router-link 
              to="/tools/color-scale" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">format_color_fill</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Color Scale Generator
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate accessible color scales using Adobe's Leonardo Color for data visualization.
              </p>
            </router-link>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import MarkdownViewer from '../components/MarkdownViewer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { useDrawer } from '../composables/useDrawer.js';

const route = useRoute();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const currentDocLink = ref(null);

const handleBreadcrumbNavigate = (path) => {
  // Handle navigation from breadcrumbs
  if (path === '/data-viz' || path === '/') {
    currentDocLink.value = null;
  } else if (path.startsWith('/data-viz/')) {
    // Keep the full path for MarkdownViewer
    currentDocLink.value = path;
  }
};

const handleDocNavigation = (link) => {
  currentDocLink.value = link;
  // Open drawer if closed
  if (!drawerOpen.value) {
    drawerOpen.value = true;
  }
};

// Watch for route changes to update currentDocLink
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/data-viz/') && newPath !== '/data-viz') {
    // Keep the full path for MarkdownViewer
    currentDocLink.value = newPath;
  } else if (newPath === '/data-viz') {
    currentDocLink.value = null;
  }
}, { immediate: true });

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  // Handle route on mount
  if (route.path.startsWith('/data-viz/') && route.path !== '/data-viz') {
    // Keep the full path for MarkdownViewer
    currentDocLink.value = route.path;
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

