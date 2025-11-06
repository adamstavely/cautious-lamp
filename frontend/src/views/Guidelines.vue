<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" @navigate-doc="handleDocNavigation" />
    
    <!-- Main Content Area - shifts when drawer is open -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- VitePress Content - shown when a doc link is clicked -->
      <div v-if="currentDocLink" class="h-full w-full relative">
        <!-- Breadcrumbs -->
        <Breadcrumbs 
          :custom-path="`/guidelines${currentDocLink}`"
          :on-navigate="handleBreadcrumbNavigate"
        />
        <MarkdownViewer :doc-path="currentDocLink" />
      </div>
      
      <!-- Overview Content - shown by default -->
      <div v-else class="h-full p-8 overflow-hidden">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Guidelines
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Welcome to our comprehensive library of design system guidelines, which our team is producing in collaboration with design experts from around the world. Design System Guidelines enables designers and developers of all skill sets to build and use design systems with purpose.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <!-- Large stylized "D" or design system icon -->
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Stylized "D" -->
                    <path d="M 40 40 L 40 160 L 120 160 Q 160 160 160 120 L 160 80 Q 160 40 120 40 Z" 
                          fill="url(#iconGradient)" 
                          opacity="0.3"/>
                    <path d="M 50 50 L 50 150 L 110 150 Q 150 150 150 120 L 150 80 Q 150 50 110 50 Z" 
                          fill="url(#iconGradient)" 
                          opacity="0.5"/>
                    <!-- Typography lines overlay -->
                    <line x1="30" y1="100" x2="170" y2="100" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="2,2"/>
                    <line x1="30" y1="80" x2="170" y2="80" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                    <line x1="30" y1="120" x2="170" y2="120" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Browse Topics Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Browse topics
            </h2>
            <button 
              class="px-6 py-2 rounded-full border transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'"
            >
              View all topics
            </button>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <!-- Topic Card 1: Foundations -->
            <a 
              href="#" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">palette</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Foundations
              </h3>
            </a>

            <!-- Topic Card 2: Artificial Intelligence -->
            <a 
              href="#" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">psychology</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Artificial Intelligence
              </h3>
            </a>

            <!-- Topic Card 3: Human-Centered Design -->
            <a 
              href="#" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">people</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Human-Centered Design
              </h3>
            </a>

            <!-- Topic Card 4: Components -->
            <a 
              href="#" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">widgets</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Components
              </h3>
            </a>

            <!-- Topic Card 5: Patterns -->
            <a 
              href="#" 
              class="group rounded-2xl p-6 border transition-all relative"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">pattern</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Patterns
              </h3>
              <span class="material-symbols-outlined absolute top-4 right-4 text-xl" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                chevron_right
              </span>
            </a>
          </div>
        </div>

        <!-- Featured Articles Section -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-4xl md:text-5xl font-bold text-white">
                Building with design systems
              </h2>
              <button class="px-6 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors text-sm font-medium">
                View all articles
              </button>
            </div>
            
            <!-- Article cards will go here -->
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Getting Started</h3>
                <p class="text-white/80 text-sm">Learn the fundamentals of design systems and how to get started building your own.</p>
              </div>
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Design Tokens</h3>
                <p class="text-white/80 text-sm">Understand how to create and manage design tokens for consistent design systems.</p>
              </div>
              <div class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 class="text-white font-semibold text-xl mb-2">Component Architecture</h3>
                <p class="text-white/80 text-sm">Explore best practices for structuring and organizing design system components.</p>
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
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import MarkdownViewer from '../components/MarkdownViewer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const route = useRoute();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const currentDocLink = ref(null);

const handleBreadcrumbNavigate = (path) => {
  // Handle navigation from breadcrumbs
  if (path === '/guidelines' || path === '/') {
    currentDocLink.value = null;
  } else if (path.startsWith('/guidelines/')) {
    currentDocLink.value = path.replace('/guidelines', '');
  }
};

const handleDocNavigation = (link) => {
  currentDocLink.value = link;
  // Open drawer if closed
  if (!drawerOpen.value) {
    drawerOpen.value = true;
  }
};

const openDrawer = () => {
  drawerOpen.value = true;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Open drawer when navigating to /guidelines - removed auto-open
// watch(() => route.path, (newPath) => {
//   if (newPath === '/guidelines') {
//     drawerOpen.value = true;
//   }
// }, { immediate: true });

// Watch for dark mode changes
let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Removed auto-open drawer
  // if (route.path === '/guidelines') {
  //   drawerOpen.value = true;
  // }
  
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
