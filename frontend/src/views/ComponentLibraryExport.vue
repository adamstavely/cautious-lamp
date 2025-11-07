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
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Component Library Export
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Export your design system components and documentation in various formats.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Options -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Storybook -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'storybook'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                    library_books
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Storybook
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate a Storybook instance with all components, stories, and documentation.
              </p>
              <button
                @click.stop="exportStorybook"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
              >
                Export Storybook
              </button>
            </div>

            <!-- PDF Documentation -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'pdf'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-red-900/30' : 'bg-red-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                    description
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  PDF Documentation
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate a comprehensive PDF document with all components and guidelines.
              </p>
              <button
                @click.stop="exportPDF"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'"
              >
                Export PDF
              </button>
            </div>

            <!-- Markdown -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'markdown'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">
                    article
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Markdown
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export all documentation as Markdown files for version control.
              </p>
              <button
                @click.stop="exportMarkdown"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'"
              >
                Export Markdown
              </button>
            </div>

            <!-- NPM Package -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'npm'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-green-900/30' : 'bg-green-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
                    package_2
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  NPM Package
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate an NPM package with all components ready to publish.
              </p>
              <button
                @click.stop="exportNPM"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'"
              >
                Export NPM
              </button>
            </div>

            <!-- Static Site -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'static'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'">
                    public
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Static Site
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Export as a static HTML site for hosting anywhere.
              </p>
              <button
                @click.stop="exportStatic"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'"
              >
                Export Static
              </button>
            </div>

            <!-- Figma Plugin -->
            <div 
              class="rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700 hover:border-indigo-500' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
              @click="exportFormat = 'figma'"
            >
              <div class="flex items-center gap-3 mb-4">
                <div class="p-2 rounded-lg" :class="isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'">
                  <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-orange-400' : 'text-orange-600'">
                    extension
                  </span>
                </div>
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Figma Plugin
                </h3>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate a Figma plugin to sync tokens and components.
              </p>
              <button
                @click.stop="exportFigma"
                class="w-full px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white'"
              >
                Export Plugin
              </button>
            </div>
          </div>
        </div>

        <!-- Export Settings -->
        <div v-if="exportFormat" class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Export Settings
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Include Components
                </label>
                <div class="space-y-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" v-model="exportSettings.includeComponents" class="accent-indigo-600" />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">All components</span>
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Include Tokens
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="exportSettings.includeTokens" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Design tokens</span>
                </label>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Include Documentation
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="exportSettings.includeDocs" class="accent-indigo-600" />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Guidelines and examples</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Status -->
        <div v-if="exportStatus" class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center gap-3">
              <span 
                class="material-symbols-outlined"
                :class="exportStatus === 'success' 
                  ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                  : (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')"
              >
                {{ exportStatus === 'success' ? 'check_circle' : 'hourglass_empty' }}
              </span>
              <div class="flex-1">
                <p class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ exportStatus === 'success' ? 'Export completed successfully!' : 'Exporting...' }}
                </p>
                <p v-if="exportStatus === 'success'" class="text-sm mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Your export is ready for download.
                </p>
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
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const exportFormat = ref('');
const exportStatus = ref('');
const exportSettings = ref({
  includeComponents: true,
  includeTokens: true,
  includeDocs: true
});

const exportStorybook = () => {
  exportFormat.value = 'storybook';
  exportStatus.value = 'processing';
  setTimeout(() => {
    exportStatus.value = 'success';
  }, 2000);
};

const exportPDF = () => {
  exportFormat.value = 'pdf';
  exportStatus.value = 'processing';
  setTimeout(() => {
    exportStatus.value = 'success';
  }, 2000);
};

const exportMarkdown = () => {
  exportFormat.value = 'markdown';
  exportStatus.value = 'processing';
  setTimeout(() => {
    exportStatus.value = 'success';
  }, 2000);
};

const exportNPM = () => {
  exportFormat.value = 'npm';
  exportStatus.value = 'processing';
  setTimeout(() => {
    exportStatus.value = 'success';
  }, 2000);
};

const exportStatic = () => {
  exportFormat.value = 'static';
  exportStatus.value = 'processing';
  setTimeout(() => {
    exportStatus.value = 'success';
  }, 2000);
};

const exportFigma = () => {
  exportFormat.value = 'figma';
  exportStatus.value = 'processing';
  setTimeout(() => {
    exportStatus.value = 'success';
  }, 2000);
};

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

