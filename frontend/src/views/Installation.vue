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
          <div class="max-w-7xl mx-auto mb-12">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    Installation
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Install and configure the design system in your project. Choose the installation method that works best for your stack.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="installationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized download/install icon -->
                      <rect x="70" y="40" width="60" height="80" rx="4" fill="url(#installationGradient)" opacity="0.4"/>
                      <path d="M 90 80 L 100 70 L 110 80" stroke="url(#installationGradient)" stroke-width="3" fill="none" opacity="0.6"/>
                      <rect x="75" y="130" width="50" height="8" rx="2" fill="url(#installationGradient)" opacity="0.5"/>
                      <rect x="80" y="145" width="40" height="8" rx="2" fill="url(#installationGradient)" opacity="0.5"/>
                      <rect x="85" y="160" width="30" height="8" rx="2" fill="url(#installationGradient)" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Installation Methods -->
          <div class="max-w-7xl mx-auto space-y-8">
            <!-- NPM Installation -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                NPM Installation
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Install the design system package using npm:
              </p>
              <div 
                class="rounded-lg p-4 font-mono text-sm mb-4"
                :class="isDarkMode 
                  ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                  : 'bg-gray-50 border border-gray-200 text-gray-900'"
              >
                npm install @design-system/core
              </div>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                This will install the latest stable version of the design system.
              </p>
            </div>

            <!-- Yarn Installation -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Yarn Installation
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Install using Yarn:
              </p>
              <div 
                class="rounded-lg p-4 font-mono text-sm mb-4"
                :class="isDarkMode 
                  ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                  : 'bg-gray-50 border border-gray-200 text-gray-900'"
              >
                yarn add @design-system/core
              </div>
            </div>

            <!-- CDN Installation -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                CDN Installation
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                For quick prototyping or if you're not using a package manager, you can include the design system via CDN:
              </p>
              <div 
                class="rounded-lg p-4 font-mono text-sm mb-4"
                :class="isDarkMode 
                  ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                  : 'bg-gray-50 border border-gray-200 text-gray-900'"
              >
                <div class="mb-2">&lt;link rel="stylesheet" href="https://cdn.design-system.com/core/latest/styles.css"&gt;</div>
                <div>&lt;script src="https://cdn.design-system.com/core/latest/index.js"&gt;&lt;/script&gt;</div>
              </div>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Note: CDN installation is not recommended for production applications.
              </p>
            </div>

            <!-- Framework-Specific Installation -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Framework-Specific Installation
              </h2>
              
              <!-- Vue -->
              <div class="mb-6">
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Vue.js
                </h3>
                <div 
                  class="rounded-lg p-4 font-mono text-sm mb-2"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'"
                >
                  <div>npm install @design-system/vue</div>
                </div>
                <div 
                  class="rounded-lg p-4 font-mono text-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'"
                >
                  <div class="mb-1">import { createApp } from 'vue';</div>
                  <div class="mb-1">import DesignSystem from '@design-system/vue';</div>
                  <div class="mb-1"></div>
                  <div>app.use(DesignSystem);</div>
                </div>
              </div>

              <!-- React -->
              <div class="mb-6">
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  React
                </h3>
                <div 
                  class="rounded-lg p-4 font-mono text-sm mb-2"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'"
                >
                  <div>npm install @design-system/react</div>
                </div>
                <div 
                  class="rounded-lg p-4 font-mono text-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'"
                >
                  <div class="mb-1">import { Button } from '@design-system/react';</div>
                  <div class="mb-1"></div>
                  <div>&lt;Button variant="primary"&gt;Click me&lt;/Button&gt;</div>
                </div>
              </div>

              <!-- Angular -->
              <div>
                <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Angular
                </h3>
                <div 
                  class="rounded-lg p-4 font-mono text-sm mb-2"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'"
                >
                  <div>npm install @design-system/angular</div>
                </div>
                <div 
                  class="rounded-lg p-4 font-mono text-sm"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'"
                >
                  <div class="mb-1">import { DesignSystemModule } from '@design-system/angular';</div>
                  <div class="mb-1"></div>
                  <div>@NgModule({ imports: [DesignSystemModule] })</div>
                </div>
              </div>
            </div>

            <!-- Configuration -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Configuration
              </h2>
              <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                After installation, you may need to configure the design system for your project. Common configuration options include:
              </p>
              <ul class="list-disc list-inside space-y-2 ml-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                <li>Theme customization (colors, typography, spacing)</li>
                <li>Component default props and variants</li>
                <li>Internationalization (i18n) settings</li>
                <li>Accessibility preferences</li>
                <li>Build and bundling configuration</li>
              </ul>
              <p class="mt-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                See the <router-link to="/getting-started/best-practices" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">Best Practices</router-link> guide for detailed configuration examples.
              </p>
            </div>

            <!-- Troubleshooting -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Troubleshooting
              </h2>
              <div class="space-y-4">
                <div>
                  <h3 class="font-semibold mb-2" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Installation fails
                  </h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Ensure you're using a compatible Node.js version (v16 or higher). Clear your node_modules and package-lock.json, then reinstall.
                  </p>
                </div>
                <div>
                  <h3 class="font-semibold mb-2" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Components not rendering
                  </h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Verify that you've imported the CSS stylesheet. Check that your build process includes the design system assets.
                  </p>
                </div>
                <div>
                  <h3 class="font-semibold mb-2" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Type errors (TypeScript)
                  </h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Ensure TypeScript definitions are installed. The design system includes built-in TypeScript support.
                  </p>
                </div>
              </div>
              <router-link
                to="/getting-started/support"
                class="inline-block mt-4 text-indigo-600 hover:text-indigo-700 underline"
                :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
              >
                Need more help? Contact support →
              </router-link>
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
const isDarkMode = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

onMounted(() => {
  isDarkMode.value = document.documentElement.classList.contains('dark');
  
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

