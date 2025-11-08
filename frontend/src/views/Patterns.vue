<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area - shifts when drawer is open -->
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
                  Patterns
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Discover proven design patterns and UI solutions. Learn from best practices and reusable solutions that solve common design problems across web and mobile interfaces.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="patternsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Stylized patterns icon -->
                    <rect x="20" y="20" width="40" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.3"/>
                    <rect x="70" y="20" width="40" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.5"/>
                    <rect x="120" y="20" width="40" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.4"/>
                    <rect x="170" y="20" width="20" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.6"/>
                    <rect x="20" y="70" width="40" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.5"/>
                    <rect x="70" y="70" width="40" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.3"/>
                    <rect x="120" y="70" width="40" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.6"/>
                    <rect x="170" y="70" width="20" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.4"/>
                    <rect x="20" y="120" width="40" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.4"/>
                    <rect x="70" y="120" width="40" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.6"/>
                    <rect x="120" y="120" width="40" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.3"/>
                    <rect x="170" y="120" width="20" height="40" rx="4" fill="url(#patternsGradient)" opacity="0.5"/>
                    <rect x="20" y="170" width="40" height="20" rx="4" fill="url(#patternsGradient)" opacity="0.6"/>
                    <rect x="70" y="170" width="40" height="20" rx="4" fill="url(#patternsGradient)" opacity="0.4"/>
                    <rect x="120" y="170" width="40" height="20" rx="4" fill="url(#patternsGradient)" opacity="0.5"/>
                    <rect x="170" y="170" width="20" height="20" rx="4" fill="url(#patternsGradient)" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Browse Patterns Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Browse patterns
            </h2>
            <button 
              class="px-6 py-2 rounded-full border transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'"
            >
              View all patterns
            </button>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <!-- Pattern Card 1: Layout -->
            <router-link 
              to="/patterns/layout" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">view_quilt</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Layout
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Grid systems, containers, and responsive layouts.
              </p>
            </router-link>

            <!-- Pattern Card 2: Navigation -->
            <router-link 
              to="/patterns/navigation" 
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
                Menu patterns, breadcrumbs, and navigation flows.
              </p>
            </router-link>

            <!-- Pattern Card 3: Data Display -->
            <router-link 
              to="/patterns/data-display" 
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
                Effective patterns for presenting tables and lists.
              </p>
            </router-link>

            <!-- Pattern Card 4: Forms -->
            <router-link 
              to="/patterns/forms" 
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
                Form layouts, validation, and user input patterns.
              </p>
            </router-link>

            <!-- Pattern Card 5: Feedback -->
            <router-link 
              to="/patterns/feedback" 
              class="group rounded-2xl p-6 border transition-all relative"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">feedback</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Feedback
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Alerts, notifications, and user feedback patterns.
              </p>
              <span class="material-symbols-outlined absolute top-4 right-4 text-xl" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                chevron_right
              </span>
            </router-link>
          </div>
        </div>

        <!-- Code Snippet Patterns Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-4xl md:text-5xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Code Pattern Library
            </h2>
          </div>
          
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <router-link 
              to="/patterns/form-validation" 
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
                Form Validation
              </h3>
              <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Complete form validation with error handling and accessibility
              </p>
              <span class="text-xs px-2 py-1 rounded" :class="isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'">
                Intermediate
              </span>
            </router-link>

            <router-link 
              to="/patterns/accessible-modal" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">fullscreen</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Accessible Modal
              </h3>
              <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Fully accessible modal dialog with focus trap and keyboard support
              </p>
              <span class="text-xs px-2 py-1 rounded" :class="isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'">
                Advanced
              </span>
            </router-link>

            <router-link 
              to="/patterns/sortable-data-table" 
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
                Sortable Data Table
              </h3>
              <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Data table with sorting, filtering, and pagination
              </p>
              <span class="text-xs px-2 py-1 rounded" :class="isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'">
                Advanced
              </span>
            </router-link>

            <router-link 
              to="/patterns/login-form" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">lock</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Login Form
              </h3>
              <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Complete authentication form with validation and error handling
              </p>
              <span class="text-xs px-2 py-1 rounded" :class="isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'">
                Intermediate
              </span>
            </router-link>

            <router-link 
              to="/patterns/responsive-navigation" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">menu</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Responsive Navigation
              </h3>
              <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Mobile-responsive navigation menu with dropdowns
              </p>
              <span class="text-xs px-2 py-1 rounded" :class="isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'">
                Intermediate
              </span>
            </router-link>

            <router-link 
              to="/patterns/toast-notification" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">notifications</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Toast Notification
              </h3>
              <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Toast notification system for temporary messages
              </p>
              <span class="text-xs px-2 py-1 rounded" :class="isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'">
                Beginner
              </span>
            </router-link>
          </div>
        </div>

        <!-- Featured Patterns Section -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-4xl md:text-5xl font-bold text-white">
                Pattern library
              </h2>
              <button class="px-6 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors text-sm font-medium">
                View all patterns
              </button>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Layout Patterns</h3>
                <p class="text-white/80 text-sm">Explore grid systems, containers, and responsive layout solutions for modern web applications.</p>
              </div>
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Navigation Patterns</h3>
                <p class="text-white/80 text-sm">Learn about menus, breadcrumbs, tabs, and other navigation patterns that improve user experience.</p>
              </div>
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Data Display Patterns</h3>
                <p class="text-white/80 text-sm">Discover effective ways to present tables, lists, cards, and other data visualization patterns.</p>
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

// Watch for dark mode changes
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

