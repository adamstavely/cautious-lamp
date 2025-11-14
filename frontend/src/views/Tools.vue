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
                  Tools
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Powerful design tools to help you create, iterate, and refine your design system. From gradient generators to color palette builders, access all the tools you need in one place.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="toolsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Stylized tools icon -->
                    <rect x="40" y="40" width="50" height="50" rx="4" fill="url(#toolsGradient)" opacity="0.3" transform="rotate(45 65 65)"/>
                    <rect x="110" y="40" width="50" height="50" rx="4" fill="url(#toolsGradient)" opacity="0.5" transform="rotate(45 135 65)"/>
                    <rect x="40" y="110" width="50" height="50" rx="4" fill="url(#toolsGradient)" opacity="0.4" transform="rotate(45 65 135)"/>
                    <rect x="110" y="110" width="50" height="50" rx="4" fill="url(#toolsGradient)" opacity="0.6" transform="rotate(45 135 135)"/>
                    <circle cx="65" cy="65" r="8" fill="rgba(255,255,255,0.4)"/>
                    <circle cx="135" cy="65" r="8" fill="rgba(255,255,255,0.4)"/>
                    <circle cx="65" cy="135" r="8" fill="rgba(255,255,255,0.4)"/>
                    <circle cx="135" cy="135" r="8" fill="rgba(255,255,255,0.4)"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Browse Tools Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Browse tools
            </h2>
            <button 
              class="px-6 py-2 rounded-full border transition-colors text-sm font-medium"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'"
            >
              View all tools
            </button>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <!-- Tool Card 1: Gradient Generator -->
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
                Create beautiful CSS gradients with custom stops.
              </p>
            </router-link>

            <!-- Tool Card 2: Palette Builder -->
            <router-link 
              to="/palette-builder" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4 flex items-center justify-center" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <SwatchBook :size="48" :stroke-width="2" />
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
                Build comprehensive color palettes with AI suggestions.
              </p>
            </router-link>

            <!-- Tool Card 3: Lorem Ipsum Generator -->
            <router-link 
              to="/tools/lorem-ipsum" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4 flex items-center justify-center" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <TextInitial :size="48" :stroke-width="2" />
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Lorem Ipsum Generator
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate placeholder text for your designs.
              </p>
            </router-link>

            <!-- Tool Card 4: SEO Tagging Generator -->
            <router-link 
              to="/tools/seo-tagging" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4 flex items-center justify-center" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <Tag :size="48" :stroke-width="2" />
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                SEO Tagging Generator
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate SEO meta tags and structured data.
              </p>
            </router-link>

            <!-- Tool Card 5: Color Scale Generator -->
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
                Generate accessible color scales using Leonardo Color.
              </p>
            </router-link>

            <!-- Tool Card 6: Color Converter -->
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

            <!-- Tool Card 7: Color Contrast -->
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

            <!-- Tool Card 8: Photosensitivity Analysis -->
            <router-link 
              to="/tools/photosensitivity" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">visibility</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Photosensitivity Analysis
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Analyze video content for photosensitive epileptic risks using IRIS.
              </p>
            </router-link>

            <!-- Tool Card 12: PNG to ICO Converter -->
            <router-link 
              to="/tools/png-to-ico" 
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
                PNG to ICO Converter
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Convert PNG images to ICO format for favicons and app icons.
              </p>
            </router-link>

            <!-- Tool Card 13: Alt Text Generator -->
            <router-link 
              to="/tools/alt-text-generator" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4 flex items-center justify-center" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <Captions :size="48" :stroke-width="2" />
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                Alt Text Generator
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate accessible, descriptive alt text for images to improve web accessibility.
              </p>
            </router-link>

            <!-- Tool Card 14: PX Unit Converter -->
            <router-link 
              to="/tools/px-converter" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">straighten</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                PX Unit Converter
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Convert pixel values to REM, EM, percentage, and Tailwind units with customizable base sizes.
              </p>
            </router-link>

            <!-- Tool Card 15: CSS Converter -->
            <router-link 
              to="/tools/css-converter" 
              class="group rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="w-12 h-12 mb-4" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                <span class="material-symbols-outlined text-5xl">code</span>
              </div>
              <h3 
                class="font-semibold text-lg transition-colors mb-2"
                :class="isDarkMode 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900 group-hover:text-indigo-600'"
              >
                CSS Converter
              </h3>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Convert CSS to LESS, SASS, and SCSS preprocessor formats with nesting and variable support.
              </p>
            </router-link>
          </div>
        </div>

        <!-- Featured Tools Section -->
        <div class="max-w-7xl mx-auto">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-4xl md:text-5xl font-bold text-white">
                Popular tools
              </h2>
              <button class="px-6 py-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition-colors text-sm font-medium">
                View all tools
              </button>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <router-link to="/tools/gradient-generator" class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <h3 class="text-white font-semibold text-xl mb-2">Gradient Generator</h3>
                <p class="text-white/80 text-sm">Create beautiful gradients with custom stops, angles, and color interpolation for your designs.</p>
              </router-link>
              <router-link to="/palette-builder" class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <h3 class="text-white font-semibold text-xl mb-2">Palette Builder</h3>
                <p class="text-white/80 text-sm">Build comprehensive color palettes with advanced tools for harmony, contrast, and accessibility.</p>
              </router-link>
              <router-link to="/tools/lorem-ipsum" class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <h3 class="text-white font-semibold text-xl mb-2">Lorem Ipsum Generator</h3>
                <p class="text-white/80 text-sm">Generate placeholder text for your designs with customizable paragraphs, words, sentences, or lists.</p>
              </router-link>
              <router-link to="/tools/seo-tagging" class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <h3 class="text-white font-semibold text-xl mb-2">SEO Tagging Generator</h3>
                <p class="text-white/80 text-sm">Generate SEO meta tags, Open Graph tags, and structured data for optimal search engine optimization.</p>
              </router-link>
              <router-link to="/tools/color-scale" class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <h3 class="text-white font-semibold text-xl mb-2">Color Scale Generator</h3>
                <p class="text-white/80 text-sm">Generate accessible color scales using Adobe's Leonardo Color with sequential, diverging, and qualitative options.</p>
              </router-link>
              <router-link to="/tools/color-contrast" class="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors">
                <h3 class="text-white font-semibold text-xl mb-2">Color Contrast Checker</h3>
                <p class="text-white/80 text-sm">Ensure your color combinations meet WCAG accessibility standards for text readability.</p>
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
import { MonitorCog, Tag, TextInitial, SwatchBook, Captions } from 'lucide-vue-next';

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

