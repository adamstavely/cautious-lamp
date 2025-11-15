<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="'margin-left: 48px;'"
    >
      <div class="h-full p-6 overflow-hidden">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Design.com
                  <span class="block text-indigo-400 mt-2 text-3xl md:text-4xl">Unifying the Mission; by Design</span>
                </h1>
                <p class="text-base md:text-lg text-white/90 leading-relaxed max-w-2xl">
                  The Agency's Design System for Digital Experiences. Guidelines, components, tokens, patterns, assets; everything you need in one powerful platform.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="homeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Elegant layered circles composition -->
                    <!-- Large background circle -->
                    <circle cx="100" cy="100" r="70" fill="url(#homeGradient)" opacity="0.2"/>
                    <!-- Medium circle layer -->
                    <circle cx="100" cy="100" r="50" fill="url(#homeGradient)" opacity="0.3"/>
                    <!-- Inner circle layer -->
                    <circle cx="100" cy="100" r="35" fill="url(#homeGradient)" opacity="0.4"/>
                    <!-- Top accent circle -->
                    <circle cx="100" cy="50" r="18" fill="url(#homeGradient)" opacity="0.5"/>
                    <!-- Bottom accent circle -->
                    <circle cx="100" cy="150" r="18" fill="url(#homeGradient)" opacity="0.6"/>
                    <!-- Left accent circle -->
                    <circle cx="50" cy="100" r="15" fill="url(#homeGradient)" opacity="0.4"/>
                    <!-- Right accent circle -->
                    <circle cx="150" cy="100" r="15" fill="url(#homeGradient)" opacity="0.4"/>
                    <!-- White accent dots -->
                    <circle cx="100" cy="100" r="5" fill="white" opacity="0.8"/>
                    <circle cx="100" cy="50" r="4" fill="white" opacity="0.8"/>
                    <circle cx="100" cy="150" r="4" fill="white" opacity="0.8"/>
                    <circle cx="50" cy="100" r="3" fill="white" opacity="0.8"/>
                    <circle cx="150" cy="100" r="3" fill="white" opacity="0.8"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Browse Sections Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="mb-8">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Explore sections
            </h2>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <!-- Guidelines -->
            <router-link 
              to="/guidelines" 
              class="group rounded-2xl p-5 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">menu_book</span>
              </div>
              <h3 
                class="font-semibold text-base transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Guidelines
              </h3>
              <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Design principles and best practices for building consistent interfaces.
              </p>
            </router-link>

            <!-- Components -->
            <router-link 
              to="/components" 
              class="group rounded-2xl p-5 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">widgets</span>
              </div>
              <h3 
                class="font-semibold text-base transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Components
              </h3>
              <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Reusable UI components built with accessibility and consistency in mind.
              </p>
            </router-link>

            <!-- Tokens -->
            <router-link 
              to="/tokens" 
              class="group rounded-2xl p-5 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">style</span>
              </div>
              <h3 
                class="font-semibold text-base transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Tokens
              </h3>
              <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Design tokens for colors, spacing, typography, and more.
              </p>
            </router-link>

            <!-- Patterns -->
            <router-link 
              to="/patterns" 
              class="group rounded-2xl p-5 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">pattern</span>
              </div>
              <h3 
                class="font-semibold text-base transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Patterns
              </h3>
              <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Proven design patterns and reusable UI solutions.
              </p>
            </router-link>

            <!-- Fonts -->
            <router-link 
              to="/fonts" 
              class="group rounded-2xl p-5 border transition-all relative"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">text_fields</span>
              </div>
              <h3 
                class="font-semibold text-base transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Fonts
              </h3>
              <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Typography system with font libraries and scale tools.
              </p>
              <span class="material-symbols-outlined absolute top-4 right-4 text-base" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
                chevron_right
              </span>
            </router-link>
          </div>
        </div>

        <!-- Featured Tools Section -->
        <div class="max-w-7xl mx-auto mb-0">
          <div class="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl md:text-3xl font-bold text-white">
                Powerful tools
              </h2>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- For Designers Card -->
              <router-link 
                to="/for-designers" 
                class="group relative bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden"
              >
                <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                <div class="relative z-10">
                  <div class="w-12 h-12 mb-4 text-white">
                    <span class="material-symbols-outlined text-5xl">palette</span>
                  </div>
                  <h3 class="text-white font-bold text-xl md:text-2xl mb-3 group-hover:text-indigo-200 transition-colors">
                    For Designers
                  </h3>
                  <p class="text-white/80 text-sm mb-4 leading-relaxed">
                    Everything you need to create, iterate, and collaborate on design systems. Visual tools, design assets, and seamless design-to-code workflows.
                  </p>
                  <div class="flex items-center text-white/90 font-medium text-xs group-hover:text-indigo-200 transition-colors">
                    <span>Explore designer tools</span>
                    <span class="material-symbols-outlined ml-2 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </router-link>

              <!-- For Developers Card -->
              <router-link 
                to="/for-developers" 
                class="group relative bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden"
              >
                <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
                <div class="relative z-10">
                  <div class="w-12 h-12 mb-4 text-white">
                    <span class="material-symbols-outlined text-5xl">code</span>
                  </div>
                  <h3 class="text-white font-bold text-xl md:text-2xl mb-3 group-hover:text-indigo-200 transition-colors">
                    For Developers
                  </h3>
                  <p class="text-white/80 text-sm mb-4 leading-relaxed">
                    Build faster with our component library, APIs, and developer tools. Code snippets, testing frameworks, and seamless integrations.
                  </p>
                  <div class="flex items-center text-white/90 font-medium text-xs group-hover:text-indigo-200 transition-colors">
                    <span>Explore developer tools</span>
                    <span class="material-symbols-outlined ml-2 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </router-link>

              <!-- For Researchers Card -->
              <router-link 
                to="/for-researchers" 
                class="group relative bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden"
              >
                <div class="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
                <div class="relative z-10">
                  <div class="w-12 h-12 mb-4 text-white">
                    <span class="material-symbols-outlined text-5xl">psychology</span>
                  </div>
                  <h3 class="text-white font-bold text-xl md:text-2xl mb-3 group-hover:text-indigo-200 transition-colors">
                    For Researchers
                  </h3>
                  <p class="text-white/80 text-sm mb-4 leading-relaxed">
                    Comprehensive research tools, HCD methodologies, and user insights to inform design decisions and improve user experiences.
                  </p>
                  <div class="flex items-center text-white/90 font-medium text-xs group-hover:text-indigo-200 transition-colors">
                    <span>Explore research tools</span>
                    <span class="material-symbols-outlined ml-2 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
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

const isDarkMode = ref(document.documentElement.classList.contains('dark'));

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

