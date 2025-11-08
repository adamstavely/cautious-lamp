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
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1 text-center md:text-left">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  404
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto md:mx-0">
                  Looks like you've ventured off the beaten path. The page you're looking for doesn't exist or has been moved.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="notFoundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Stylized lost/exploration icon -->
                    <!-- Compass -->
                    <circle cx="100" cy="100" r="60" fill="url(#notFoundGradient)" opacity="0.2" stroke="url(#notFoundGradient)" stroke-width="2" stroke-opacity="0.4"/>
                    <circle cx="100" cy="100" r="45" fill="url(#notFoundGradient)" opacity="0.3"/>
                    <!-- Compass needle pointing up -->
                    <line x1="100" y1="55" x2="100" y2="145" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
                    <path d="M 100 55 L 110 75 L 100 85 L 90 75 Z" fill="white" opacity="0.9"/>
                    <path d="M 100 145 L 90 125 L 100 115 L 110 125 Z" fill="url(#notFoundGradient)" opacity="0.7"/>
                    <!-- Direction markers -->
                    <text x="100" y="40" font-family="Arial" font-size="16" font-weight="bold" fill="white" text-anchor="middle" opacity="0.8">N</text>
                    <text x="100" y="170" font-family="Arial" font-size="16" font-weight="bold" fill="white" text-anchor="middle" opacity="0.6">S</text>
                    <text x="160" y="105" font-family="Arial" font-size="16" font-weight="bold" fill="white" text-anchor="middle" opacity="0.6">E</text>
                    <text x="40" y="105" font-family="Arial" font-size="16" font-weight="bold" fill="white" text-anchor="middle" opacity="0.6">W</text>
                    <!-- Center dot -->
                    <circle cx="100" cy="100" r="6" fill="white" opacity="0.9"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="max-w-7xl mx-auto">
          <div class="grid md:grid-cols-3 gap-6 mb-8">
          <!-- Go Home -->
          <router-link 
            to="/"
            class="group rounded-2xl p-6 border transition-all"
            :class="isDarkMode 
              ? 'border-gray-700 bg-slate-900 hover:border-indigo-400 hover:bg-slate-800' 
              : 'border-gray-300 bg-white hover:border-indigo-500 hover:bg-indigo-50'"
          >
            <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
              <span class="material-symbols-outlined text-5xl">home</span>
            </div>
            <h3 
              class="font-semibold text-lg transition-colors mb-2"
              :class="isDarkMode 
                ? 'text-white group-hover:text-indigo-400' 
                : 'text-gray-900 group-hover:text-indigo-600'"
            >
              Go Home
            </h3>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Return to the homepage and explore our design system.
            </p>
          </router-link>

          <!-- Browse Components -->
          <router-link 
            to="/components"
            class="group rounded-2xl p-6 border transition-all"
            :class="isDarkMode 
              ? 'border-gray-700 bg-slate-900 hover:border-indigo-400 hover:bg-slate-800' 
              : 'border-gray-300 bg-white hover:border-indigo-500 hover:bg-indigo-50'"
          >
            <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
              <span class="material-symbols-outlined text-5xl">widgets</span>
            </div>
            <h3 
              class="font-semibold text-lg transition-colors mb-2"
              :class="isDarkMode 
                ? 'text-white group-hover:text-indigo-400' 
                : 'text-gray-900 group-hover:text-indigo-600'"
            >
              Browse Components
            </h3>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Explore our component library and find what you need.
            </p>
          </router-link>

          <!-- Search -->
          <button
            @click="focusSearch"
            class="group rounded-2xl p-6 border transition-all text-left"
            :class="isDarkMode 
              ? 'border-gray-700 bg-slate-900 hover:border-indigo-400 hover:bg-slate-800' 
              : 'border-gray-300 bg-white hover:border-indigo-500 hover:bg-indigo-50'"
          >
            <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
              <span class="material-symbols-outlined text-5xl">search</span>
            </div>
            <h3 
              class="font-semibold text-lg transition-colors mb-2"
              :class="isDarkMode 
                ? 'text-white group-hover:text-indigo-400' 
                : 'text-gray-900 group-hover:text-indigo-600'"
            >
              Search
            </h3>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Use our search to find what you're looking for.
            </p>
          </button>
          </div>

          <!-- Popular Links -->
          <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Popular Pages
            </h3>
            <div class="flex flex-wrap gap-3 justify-center">
              <router-link 
                to="/getting-started"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-slate-800 text-gray-300 hover:bg-indigo-600 hover:text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-600 hover:text-white'"
              >
                Getting Started
              </router-link>
              <router-link 
                to="/guidelines"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-slate-800 text-gray-300 hover:bg-indigo-600 hover:text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-600 hover:text-white'"
              >
                Guidelines
              </router-link>
              <router-link 
                to="/components"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-slate-800 text-gray-300 hover:bg-indigo-600 hover:text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-600 hover:text-white'"
              >
                Components
              </router-link>
              <router-link 
                to="/tokens"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-slate-800 text-gray-300 hover:bg-indigo-600 hover:text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-600 hover:text-white'"
              >
                Tokens
              </router-link>
              <router-link 
                to="/patterns"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-slate-800 text-gray-300 hover:bg-indigo-600 hover:text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-600 hover:text-white'"
              >
                Patterns
              </router-link>
              <router-link 
                to="/fonts"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-slate-800 text-gray-300 hover:bg-indigo-600 hover:text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-600 hover:text-white'"
              >
                Fonts
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
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const router = useRouter();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

const closeDrawer = () => { drawerOpen.value = false; };
const toggleDrawer = () => { drawerOpen.value = !drawerOpen.value; };

const focusSearch = () => {
  // Dispatch a custom event to focus the search bar in TopNav
  window.dispatchEvent(new CustomEvent('focus-search'));
  // Navigate to home if not already there
  if (router.currentRoute.value.path !== '/') {
    router.push('/');
  }
};

let darkModeObserver = null;
onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  darkModeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});
onBeforeUnmount(() => {
  if (darkModeObserver) darkModeObserver.disconnect();
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

