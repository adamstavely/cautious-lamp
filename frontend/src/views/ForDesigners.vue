<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-hidden">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <div class="mb-4">
                  <router-link 
                    to="/" 
                    class="inline-flex items-center text-white/80 hover:text-white transition-colors text-sm mb-4"
                  >
                    <span class="material-symbols-outlined mr-2 text-lg">arrow_back</span>
                    Back to Home
                  </router-link>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Tools for Designers
                  <span class="block text-indigo-400 mt-2 text-3xl md:text-4xl">Visual tools, design assets, and seamless workflows</span>
                </h1>
                <p class="text-base md:text-lg text-white/90 leading-relaxed max-w-2xl">
                  Everything you need to create, iterate, and collaborate on design systems. Visual tools, design assets, and seamless design-to-code workflows.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="designerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Design-focused illustration -->
                    <circle cx="100" cy="100" r="60" fill="url(#designerGradient)" opacity="0.3"/>
                    <rect x="60" y="60" width="80" height="80" rx="8" fill="url(#designerGradient)" opacity="0.4"/>
                    <circle cx="100" cy="100" r="25" fill="url(#designerGradient)" opacity="0.6"/>
                    <circle cx="100" cy="100" r="8" fill="white" opacity="0.9"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Access Tools Grid -->
        <div class="max-w-7xl mx-auto mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            Design Tools
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <!-- Gradient Generator -->
            <router-link 
              to="/tools/gradient-generator" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">gradient</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Gradient Generator
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Create stunning CSS gradients with an intuitive visual editor.
              </p>
            </router-link>

            <!-- Palette Builder -->
            <router-link 
              to="/palette-builder" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">palette</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Palette Builder
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Build comprehensive color palettes with advanced tools.
              </p>
            </router-link>

            <!-- Color Converter -->
            <router-link 
              to="/tools/color-converter" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">swap_horiz</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Color Converter
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Convert colors between different formats and spaces.
              </p>
            </router-link>

            <!-- Color Contrast Checker -->
            <router-link 
              to="/tools/color-contrast" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">contrast</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Color Contrast
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Check WCAG accessibility standards for color combinations.
              </p>
            </router-link>
          </div>

          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 mt-16">
            Typography
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <!-- Font Library -->
            <router-link 
              to="/design-assets/font-library" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">text_fields</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Font Library
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Browse and preview hundreds of Google Fonts.
              </p>
            </router-link>

            <!-- Font Scale -->
            <router-link 
              to="/tools/font-scale" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">format_size</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Font Scale
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate typography scales for your design system.
              </p>
            </router-link>

            <!-- Font Stack -->
            <router-link 
              to="/tools/font-stack" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">layers</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Font Stack
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Build font stacks and subset Google Fonts.
              </p>
            </router-link>
          </div>

          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 mt-16">
            Design Assets
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <!-- Icon Library -->
            <router-link 
              to="/design-assets/icons" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">image</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Icon Library
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Browse Material, Lucide, and custom icon sets.
              </p>
            </router-link>

            <!-- Token Studio -->
            <router-link 
              to="/tokens/studio" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">style</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Token Studio
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Create and manage design tokens visually.
              </p>
            </router-link>
          </div>

          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 mt-16">
            Design-to-Code Sync
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            <!-- Figma Sync -->
            <router-link 
              to="/design-sync" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">design_services</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Figma Sync
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Sync components and tokens from Figma.
              </p>
            </router-link>

            <!-- Penpot Sync -->
            <router-link 
              to="/design-sync" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">brush</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Penpot Sync
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Sync components and tokens from Penpot.
              </p>
            </router-link>

            <!-- Token Sync -->
            <router-link 
              to="/tokens/sync" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">sync</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Token Sync
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Sync design tokens from Figma, Penpot, or Adobe XD.
              </p>
            </router-link>
          </div>
        </div>

        <!-- Featured Workflows Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            Featured Workflows
          </h2>
          
          <div class="grid md:grid-cols-3 gap-6">
            <!-- Create a Color Palette -->
            <router-link 
              to="/palette-builder" 
              class="group rounded-2xl p-8 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-6 rounded-xl flex items-center justify-center" :class="isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'">
                <span class="material-symbols-outlined text-4xl">palette</span>
              </div>
              <h3 
                class="font-bold text-2xl transition-colors mb-3"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Create a Color Palette
              </h3>
              <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Build a comprehensive color palette with harmony, contrast, and accessibility tools.
              </p>
            </router-link>

            <!-- Sync Design Tokens -->
            <router-link 
              to="/tokens/sync" 
              class="group rounded-2xl p-8 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-6 rounded-xl flex items-center justify-center" :class="isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'">
                <span class="material-symbols-outlined text-4xl">sync</span>
              </div>
              <h3 
                class="font-bold text-2xl transition-colors mb-3"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Sync Design Tokens
              </h3>
              <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Keep your design tokens in sync between your design tools and codebase.
              </p>
            </router-link>

            <!-- Export Design Assets -->
            <router-link 
              to="/components/export" 
              class="group rounded-2xl p-8 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-16 h-16 mb-6 rounded-xl flex items-center justify-center" :class="isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'">
                <span class="material-symbols-outlined text-4xl">download</span>
              </div>
              <h3 
                class="font-bold text-2xl transition-colors mb-3"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Export Design Assets
              </h3>
              <p class="text-base" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export your component library to Storybook, PDF, Markdown, or design tools.
              </p>
            </router-link>
          </div>
        </div>

        <!-- Getting Started Section -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 border" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Getting Started
            </h2>
            <p class="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-3xl">
              New to the design system? Start here with our designer-focused guides and tutorials.
            </p>
            <div class="grid md:grid-cols-2 gap-6">
              <router-link 
                to="/guidelines" 
                class="group rounded-xl p-6 border transition-all"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-800 hover:border-indigo-400' 
                  : 'border-gray-300 bg-white hover:border-indigo-500'"
              >
                <h3 
                  class="font-semibold text-xl transition-colors mb-2"
                  :class="isDarkMode 
                    ? 'text-white group-hover:text-indigo-400' 
                    : 'text-gray-900 group-hover:text-indigo-600'"
                >
                  Design Guidelines
                </h3>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Learn about design principles and best practices.
                </p>
              </router-link>
              <router-link 
                to="/tokens" 
                class="group rounded-xl p-6 border transition-all"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-800 hover:border-indigo-400' 
                  : 'border-gray-300 bg-white hover:border-indigo-500'"
              >
                <h3 
                  class="font-semibold text-xl transition-colors mb-2"
                  :class="isDarkMode 
                    ? 'text-white group-hover:text-indigo-400' 
                    : 'text-gray-900 group-hover:text-indigo-600'"
                >
                  Design Tokens Guide
                </h3>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Understand how to create and manage design tokens.
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

