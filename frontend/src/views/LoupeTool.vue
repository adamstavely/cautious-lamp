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
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Loupe Tool
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Inspect design system components on any page. Press a keyboard shortcut to see every component and access its documentation, source code, and design files.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">search</span>
                      Component Inspector
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="loupeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized magnifying glass icon -->
                      <circle cx="100" cy="100" r="50" fill="none" stroke="url(#loupeGradient)" stroke-width="4" opacity="0.6"/>
                      <circle cx="100" cy="100" r="35" fill="url(#loupeGradient)" opacity="0.2"/>
                      <line x1="130" y1="130" x2="160" y2="160" stroke="url(#loupeGradient)" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
                      <!-- Component indicators -->
                      <rect x="60" y="60" width="20" height="20" rx="2" fill="url(#loupeGradient)" opacity="0.4"/>
                      <rect x="120" y="60" width="20" height="20" rx="2" fill="url(#loupeGradient)" opacity="0.5"/>
                      <rect x="60" y="120" width="20" height="20" rx="2" fill="url(#loupeGradient)" opacity="0.3"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <!-- How to Use Section -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                How to Use
              </h2>
              
              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                    :class="isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'"
                  >
                    1
                  </div>
                  <div>
                    <h3 class="font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Activate the Loupe Tool
                    </h3>
                    <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Press <kbd class="px-2 py-1 rounded border" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'">Ctrl</kbd> + <kbd class="px-2 py-1 rounded border" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'">Shift</kbd> + <kbd class="px-2 py-1 rounded border" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'">L</kbd> (or <kbd class="px-2 py-1 rounded border" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'">Cmd</kbd> + <kbd class="px-2 py-1 rounded border" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'">Shift</kbd> + <kbd class="px-2 py-1 rounded border" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'">L</kbd> on Mac) on any page to activate the tool.
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                    :class="isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'"
                  >
                    2
                  </div>
                  <div>
                    <h3 class="font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      View Components
                    </h3>
                    <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      All design system components on the page will be highlighted with a blue overlay.
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                    :class="isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'"
                  >
                    3
                  </div>
                  <div>
                    <h3 class="font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Hover for Details
                    </h3>
                    <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Hover over any highlighted component to see its name, import path, and links to documentation, GitHub, and Figma.
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                    :class="isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'"
                  >
                    4
                  </div>
                  <div>
                    <h3 class="font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Access Resources
                    </h3>
                    <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Click on any link in the info panel to open documentation, source code, or design files in a new tab.
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                    :class="isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-600'"
                  >
                    5
                  </div>
                  <div>
                    <h3 class="font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      Deactivate
                    </h3>
                    <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Press the keyboard shortcut again or <kbd class="px-2 py-1 rounded border" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'">Escape</kbd> to close the tool.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Adding Components Section -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Adding Components to the Loupe Tool
              </h2>
              
              <p class="mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                To make a component detectable by the Loupe Tool, add data attributes to the component's root element:
              </p>

              <div class="rounded-lg p-4 mb-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                <pre class="text-sm overflow-x-auto"><code :class="isDarkMode ? 'text-gray-300' : 'text-gray-800'">&lt;template&gt;
  &lt;div 
    data-ds-component="component-name"
    data-ds-path="@design-system/components/component-name"
  &gt;
    &lt;!-- Component content --&gt;
  &lt;/div&gt;
&lt;/template&gt;</code></pre>
              </div>

              <div class="space-y-2">
                <div>
                  <strong :class="isDarkMode ? 'text-white' : 'text-gray-900'">data-ds-component</strong>
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"> (required): The component identifier (e.g., "button", "card", "input")</span>
                </div>
                <div>
                  <strong :class="isDarkMode ? 'text-white' : 'text-gray-900'">data-ds-path</strong>
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"> (optional): The import path for the component (e.g., "@design-system/components/button")</span>
                </div>
              </div>
            </div>

            <!-- Try It Now Section -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Try It Now
              </h2>
              
              <p class="mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Press <kbd class="px-2 py-1 rounded border" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'">Ctrl</kbd> + <kbd class="px-2 py-1 rounded border" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'">Shift</kbd> + <kbd class="px-2 py-1 rounded border" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300' : 'border-gray-300 bg-gray-100 text-gray-700'">L</kbd> to activate the Loupe Tool and see all design system components on this page highlighted.
              </p>

              <div class="mt-6 p-4 rounded-lg" :class="isDarkMode ? 'bg-indigo-900/20 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200'">
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400">info</span>
                  <div>
                    <p class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-indigo-300' : 'text-indigo-900'">
                      Components on this page
                    </p>
                    <p class="text-sm" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-700'">
                      This page includes several design system components that you can inspect with the Loupe Tool, including the Sidebar, Top Navigation, Breadcrumbs, and Documentation Drawer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const drawerOpen = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

onMounted(() => {
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

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

