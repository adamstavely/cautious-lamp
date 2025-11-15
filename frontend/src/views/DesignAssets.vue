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
                  Design Assets
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Organize and manage all your design assets in one place. From icons and images to logos and illustrations, keep your assets accessible and ready to use across your projects.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="assetsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Stylized assets icon -->
                    <rect x="20" y="20" width="50" height="50" rx="4" fill="url(#assetsGradient)" opacity="0.3"/>
                    <rect x="80" y="20" width="50" height="50" rx="4" fill="url(#assetsGradient)" opacity="0.5"/>
                    <rect x="140" y="20" width="50" height="50" rx="4" fill="url(#assetsGradient)" opacity="0.4"/>
                    <rect x="20" y="80" width="50" height="50" rx="4" fill="url(#assetsGradient)" opacity="0.6"/>
                    <rect x="80" y="80" width="50" height="50" rx="4" fill="url(#assetsGradient)" opacity="0.3"/>
                    <rect x="140" y="80" width="50" height="50" rx="4" fill="url(#assetsGradient)" opacity="0.5"/>
                    <rect x="20" y="140" width="50" height="50" rx="4" fill="url(#assetsGradient)" opacity="0.4"/>
                    <rect x="80" y="140" width="50" height="50" rx="4" fill="url(#assetsGradient)" opacity="0.6"/>
                    <rect x="140" y="140" width="50" height="50" rx="4" fill="url(#assetsGradient)" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Browse Assets Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Browse assets
            </h2>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <!-- Asset Card 1: Icons -->
            <router-link 
              to="/design-assets/icons" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">star</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Icons
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Upload and manage icon sets from Material and Lucide.
              </p>
            </router-link>

            <!-- Asset Card 2: Country Flags -->
            <router-link 
              to="/design-assets/country-flags" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">flag</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Country Flags
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Collection of country flag assets for use in your designs.
              </p>
            </router-link>

            <!-- Asset Card 3: USG Seals -->
            <router-link 
              to="/design-assets/usg-seals" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">verified</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                USG Seals
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Official US Government seals and emblems for authorized use.
              </p>
            </router-link>

            <!-- Asset Card 4: Internal Seals -->
            <router-link 
              to="/design-assets/internal-seals" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">security</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Internal Seals
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Internal organizational seals and emblems for agency use.
              </p>
            </router-link>

            <!-- Asset Card 5: Interactives -->
            <router-link 
              to="/design-assets/interactives" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">touch_app</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Interactives
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Interactive design assets and components for enhanced user experiences.
              </p>
            </router-link>

            <!-- Asset Card 6: Stock Photos -->
            <router-link 
              to="/design-assets/stock-photos" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">photo_library</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Stock Photos
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Curated collection of stock photography for use in your projects.
              </p>
            </router-link>

            <!-- Asset Card 7: Illustrations -->
            <router-link 
              to="/design-assets/illustrations" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">draw</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Illustrations
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Curated illustration collections for your designs.
              </p>
            </router-link>

            <!-- Asset Card 8: Capability Logos -->
            <router-link 
              to="/design-assets/capability-logos" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">workspace_premium</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Capability Logos
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Logos and branding assets for specific capabilities and services.
              </p>
            </router-link>

            <!-- Asset Card 9: Company Logos -->
            <router-link 
              to="/design-assets/company-logos" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">business</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Company Logos
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Company and organization logos for partnership and collaboration materials.
              </p>
            </router-link>
          </div>
        </div>

        <!-- Featured Collections Section -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800">
            <div class="mb-8">
              <h2 class="text-4xl md:text-5xl font-bold text-white">
                Asset collections
              </h2>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Icon Library</h3>
                <p class="text-white/80 text-sm">Browse our comprehensive collection of icons organized by category and style.</p>
              </div>
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Brand Assets</h3>
                <p class="text-white/80 text-sm">Access logos, brand guidelines, and marketing materials in one centralized location.</p>
              </div>
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Illustration Sets</h3>
                <p class="text-white/80 text-sm">Discover curated illustration collections to enhance your design projects.</p>
              </div>
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
