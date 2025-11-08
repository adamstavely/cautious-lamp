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
                      Navigation Patterns
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Navigation helps users move through and understand the structure of an application. Explore proven navigation patterns and best practices.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
                      Pattern Library
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
                        <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized navigation icon -->
                      <rect x="20" y="40" width="160" height="8" rx="4" fill="url(#navGradient)" opacity="0.8"/>
                      <rect x="20" y="60" width="120" height="8" rx="4" fill="url(#navGradient)" opacity="0.6"/>
                      <rect x="20" y="80" width="140" height="8" rx="4" fill="url(#navGradient)" opacity="0.7"/>
                      <circle cx="180" cy="100" r="20" fill="url(#navGradient)" opacity="0.5"/>
                      <path d="M 170 100 L 180 90 L 190 100 L 180 110 Z" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Overview Section -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Overview</h2>
              <p class="text-gray-600 dark:text-gray-400">Navigation patterns provide structure and help users understand where they are in your application.</p>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
              <div class="flex items-start gap-6">
                <div class="flex-shrink-0 w-16 h-16">
                  <svg viewBox="0 0 64 64" class="w-full h-full">
                    <defs>
                      <linearGradient id="navOverviewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <rect x="8" y="12" width="48" height="6" rx="2" fill="url(#navOverviewGradient)" opacity="0.6"/>
                    <rect x="8" y="24" width="36" height="6" rx="2" fill="url(#navOverviewGradient)" opacity="0.5"/>
                    <rect x="8" y="36" width="42" height="6" rx="2" fill="url(#navOverviewGradient)" opacity="0.6"/>
                    <rect x="8" y="48" width="32" height="6" rx="2" fill="url(#navOverviewGradient)" opacity="0.4"/>
                    <circle cx="52" cy="27" r="5" fill="url(#navOverviewGradient)" opacity="0.5"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Effective navigation is crucial for user experience. It helps users understand the application structure, find content quickly, and move between sections seamlessly. This guide covers the most common navigation patterns and their best practices.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar Navigation Pattern -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sidebar Navigation</h2>
              <p class="text-gray-600 dark:text-gray-400">Fixed sidebar navigation provides persistent access to main sections.</p>
            </div>
            
            <div class="space-y-8">
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                <div class="mb-6">
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p class="text-gray-600 dark:text-gray-400 text-sm">A vertical navigation bar positioned on the left or right side of the screen, providing persistent access to main sections.</p>
                </div>
                
                <div class="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 mb-4 border border-gray-200 dark:border-gray-700">
                  <div class="flex">
                    <div class="w-64 bg-slate-800 dark:bg-slate-900 border-r border-gray-700 p-4">
                      <div class="space-y-2">
                        <div class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Dashboard</div>
                        <div class="px-4 py-2 text-gray-300 rounded-lg text-sm hover:bg-gray-700">Projects</div>
                        <div class="px-4 py-2 text-gray-300 rounded-lg text-sm hover:bg-gray-700">Settings</div>
                        <div class="px-4 py-2 text-gray-300 rounded-lg text-sm hover:bg-gray-700">Profile</div>
                      </div>
                    </div>
                    <div class="flex-1 p-4 bg-white dark:bg-slate-800">
                      <div class="h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                        <span class="text-gray-400 dark:text-gray-500">Main Content Area</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">lightbulb</span>
                    Best Practices
                  </h4>
                  <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span>Keep navigation items organized logically</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span>Use clear labels and icons</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span>Highlight active states</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span>Support keyboard navigation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Navigation Pattern -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Top Navigation</h2>
              <p class="text-gray-600 dark:text-gray-400">Horizontal navigation bar for primary actions and global navigation.</p>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
              <div class="mb-6">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">A horizontal navigation bar typically positioned at the top of the page, containing primary navigation items and actions.</p>
              </div>
              
              <div class="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 mb-4 border border-gray-200 dark:border-gray-700">
                <div class="bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
                  <div class="bg-slate-800 dark:bg-slate-900 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-6">
                      <span class="text-white font-semibold">Logo</span>
                      <div class="flex items-center gap-4">
                        <span class="text-gray-300 text-sm hover:text-white cursor-pointer">Home</span>
                        <span class="text-gray-300 text-sm hover:text-white cursor-pointer">About</span>
                        <span class="text-gray-300 text-sm hover:text-white cursor-pointer">Services</span>
                        <span class="text-gray-300 text-sm hover:text-white cursor-pointer">Contact</span>
                      </div>
                    </div>
                    <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Sign In</button>
                  </div>
                  <div class="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-b-lg">
                    <span class="text-gray-400 dark:text-gray-500">Main Content Area</span>
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">lightbulb</span>
                  Best Practices
                </h4>
                <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span>Limit the number of top-level items</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span>Use clear, concise labels</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span>Provide visual feedback for interactions</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span>Ensure mobile responsiveness</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Breadcrumbs Pattern -->
          <div class="max-w-7xl mx-auto mb-16">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Breadcrumbs</h2>
              <p class="text-gray-600 dark:text-gray-400">Show users their location in the hierarchy.</p>
            </div>
            
            <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
              <div class="mb-6">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">A secondary navigation pattern that shows the user's current location within a hierarchical structure.</p>
              </div>
              
              <div class="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 mb-4 border border-gray-200 dark:border-gray-700">
                <div class="bg-white dark:bg-slate-800 rounded-lg p-4">
                  <div class="flex items-center gap-2 text-sm mb-4">
                    <a href="#" class="text-gray-500 hover:text-indigo-600">Home</a>
                    <span class="text-gray-400">/</span>
                    <a href="#" class="text-gray-500 hover:text-indigo-600">Products</a>
                    <span class="text-gray-400">/</span>
                    <a href="#" class="text-gray-500 hover:text-indigo-600">Electronics</a>
                    <span class="text-gray-400">/</span>
                    <span class="text-gray-900 dark:text-white font-medium">Smartphones</span>
                  </div>
                  <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                    <span class="text-gray-400 dark:text-gray-500">Page Content</span>
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">lightbulb</span>
                  Best Practices
                </h4>
                <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span>Use for deep navigation hierarchies</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span>Make each level clickable</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span>Keep labels concise</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
                    <span>Show current location clearly</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Related Patterns -->
          <div class="max-w-7xl mx-auto">
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Related Patterns</h2>
              <p class="text-gray-600 dark:text-gray-400">Other navigation patterns that complement these designs.</p>
            </div>
            
            <div class="grid md:grid-cols-3 gap-6">
              <router-link to="/patterns/layout" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group">
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl">view_quilt</span>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Layout Patterns
                  </h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Explore grid systems and layout structures that work with navigation.
                </p>
              </router-link>

              <router-link to="/patterns/data-display" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group">
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl">table_chart</span>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Data Display
                  </h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Patterns for displaying data alongside navigation elements.
                </p>
              </router-link>

              <router-link to="/patterns/forms" class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all group">
                <div class="flex items-center gap-3 mb-3">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl">description</span>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Form Patterns
                  </h3>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Form navigation patterns and user flow best practices.
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

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

