<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Artificial Intelligence
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Explore AI-powered design patterns, components, and tools that enhance user experiences and streamline design workflows.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Neural network representation -->
                    <circle cx="50" cy="50" r="12" fill="url(#aiGradient)" opacity="0.6"/>
                    <circle cx="100" cy="50" r="12" fill="url(#aiGradient)" opacity="0.6"/>
                    <circle cx="150" cy="50" r="12" fill="url(#aiGradient)" opacity="0.6"/>
                    <circle cx="50" cy="100" r="12" fill="url(#aiGradient)" opacity="0.7"/>
                    <circle cx="100" cy="100" r="15" fill="url(#aiGradient)" opacity="0.8"/>
                    <circle cx="150" cy="100" r="12" fill="url(#aiGradient)" opacity="0.7"/>
                    <circle cx="50" cy="150" r="12" fill="url(#aiGradient)" opacity="0.6"/>
                    <circle cx="100" cy="150" r="12" fill="url(#aiGradient)" opacity="0.6"/>
                    <circle cx="150" cy="150" r="12" fill="url(#aiGradient)" opacity="0.6"/>
                    <!-- Connecting lines -->
                    <line x1="50" y1="50" x2="100" y2="100" stroke="url(#aiGradient)" stroke-width="2" opacity="0.3"/>
                    <line x1="100" y1="50" x2="100" y2="100" stroke="url(#aiGradient)" stroke-width="2" opacity="0.3"/>
                    <line x1="150" y1="50" x2="100" y2="100" stroke="url(#aiGradient)" stroke-width="2" opacity="0.3"/>
                    <line x1="50" y1="100" x2="100" y2="100" stroke="url(#aiGradient)" stroke-width="2" opacity="0.3"/>
                    <line x1="150" y1="100" x2="100" y2="100" stroke="url(#aiGradient)" stroke-width="2" opacity="0.3"/>
                    <line x1="50" y1="150" x2="100" y2="100" stroke="url(#aiGradient)" stroke-width="2" opacity="0.3"/>
                    <line x1="100" y1="150" x2="100" y2="100" stroke="url(#aiGradient)" stroke-width="2" opacity="0.3"/>
                    <line x1="150" y1="150" x2="100" y2="100" stroke="url(#aiGradient)" stroke-width="2" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Browse AI Content Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Browse AI Content
            </h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- AI Overview Card -->
            <router-link 
              to="/ai" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">psychology</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                AI Overview
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Introduction to AI-powered design capabilities and how they enhance the design system.
              </p>
            </router-link>

            <!-- AI Patterns Card -->
            <router-link 
              to="/ai/patterns" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">auto_awesome</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                AI Patterns
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Design patterns that leverage AI to create intelligent and adaptive user experiences.
              </p>
            </router-link>

            <!-- AI Components Card -->
            <router-link 
              to="/ai/components" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">smart_toy</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                AI Components
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Reusable AI-powered components for chatbots, recommendations, and intelligent interfaces.
              </p>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const drawerOpen = ref(false);
const isDarkMode = ref(false);

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  isDarkMode.value = document.documentElement.classList.contains('dark');
  
  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});
</script>

