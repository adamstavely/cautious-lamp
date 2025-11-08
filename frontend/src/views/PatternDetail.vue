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
      
      <!-- Overview and Markdown Content -->
      <div class="h-full w-full relative overflow-y-auto">
        <div class="p-8">
          <!-- Overview Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Overview</h2>
            </div>
            
            <div 
              class="rounded-2xl border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-start gap-6">
                <div class="flex-shrink-0 w-16 h-16">
                  <svg viewBox="0 0 64 64" class="w-full h-full">
                    <defs>
                      <linearGradient id="patternOverviewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <rect x="8" y="8" width="20" height="20" rx="2" fill="url(#patternOverviewGradient)" opacity="0.4"/>
                    <rect x="36" y="8" width="20" height="20" rx="2" fill="url(#patternOverviewGradient)" opacity="0.5"/>
                    <rect x="8" y="36" width="20" height="20" rx="2" fill="url(#patternOverviewGradient)" opacity="0.6"/>
                    <rect x="36" y="36" width="20" height="20" rx="2" fill="url(#patternOverviewGradient)" opacity="0.4"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="leading-relaxed" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Design patterns provide reusable solutions to common interface challenges. This pattern guide covers best practices, implementation details, and examples for creating consistent and effective user interfaces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Markdown Content -->
        <MarkdownViewer :doc-path="patternPath" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import MarkdownViewer from '../components/MarkdownViewer.vue';

const route = useRoute();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

// Get pattern path from route
const patternPath = computed(() => {
  return route.path;
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

