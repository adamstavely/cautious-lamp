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
                    Quick Start
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Get up and running with the design system in minutes. Follow these steps to start building with our components, tokens, and patterns.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="quickStartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized play/start icon -->
                      <circle cx="100" cy="100" r="60" fill="url(#quickStartGradient)" opacity="0.2"/>
                      <circle cx="100" cy="100" r="45" fill="url(#quickStartGradient)" opacity="0.3"/>
                      <path d="M 85 70 L 85 130 L 130 100 Z" fill="url(#quickStartGradient)" opacity="0.6"/>
                      <circle cx="100" cy="100" r="8" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Start Steps -->
          <div class="max-w-7xl mx-auto space-y-8">
            <!-- Step 1: Install -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-start gap-6">
                <div class="flex-shrink-0 w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl">
                  1
                </div>
                <div class="flex-1">
                  <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Install the Design System
                  </h2>
                  <p class="mb-4 text-lg" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Install the design system package in your project using npm or yarn.
                  </p>
                  <div 
                    class="rounded-lg p-4 font-mono text-sm"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900'"
                  >
                    <div class="mb-2">npm install @design-system/core</div>
                    <div class="text-xs opacity-75"># or</div>
                    <div>yarn add @design-system/core</div>
                  </div>
                  <router-link
                    to="/getting-started/installation"
                    class="inline-block mt-4 text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    View detailed installation guide →
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Step 2: Import -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-start gap-6">
                <div class="flex-shrink-0 w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl">
                  2
                </div>
                <div class="flex-1">
                  <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Import Components
                  </h2>
                  <p class="mb-4 text-lg" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Import the components and styles you need in your application.
                  </p>
                  <div 
                    class="rounded-lg p-4 font-mono text-sm"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900'"
                  >
                    <div class="mb-2">import { Button, Card, Input } from '@design-system/core';</div>
                    <div class="mb-2">import '@design-system/core/dist/styles.css';</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Use Components -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-start gap-6">
                <div class="flex-shrink-0 w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl">
                  3
                </div>
                <div class="flex-1">
                  <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Start Building
                  </h2>
                  <p class="mb-4 text-lg" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Use components in your application. Here's a simple example:
                  </p>
                  <div 
                    class="rounded-lg p-4 font-mono text-sm"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900'"
                  >
                    <div class="mb-1">&lt;Button variant="primary"&gt;</div>
                    <div class="ml-4 mb-1">Click me</div>
                    <div>&lt;/Button&gt;</div>
                  </div>
                  <router-link
                    to="/components"
                    class="inline-block mt-4 text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    Browse all components →
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Step 4: Design Tokens -->
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-start gap-6">
                <div class="flex-shrink-0 w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl">
                  4
                </div>
                <div class="flex-1">
                  <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Use Design Tokens
                  </h2>
                  <p class="mb-4 text-lg" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Access design tokens for colors, spacing, typography, and more in your styles.
                  </p>
                  <div 
                    class="rounded-lg p-4 font-mono text-sm"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900'"
                  >
                    <div class="mb-1">import { tokens } from '@design-system/core';</div>
                    <div class="mb-1"></div>
                    <div class="mb-1">const styles = {</div>
                    <div class="ml-4 mb-1">color: tokens.color.indigo.600,</div>
                    <div class="ml-4 mb-1">padding: tokens.spacing.4,</div>
                    <div>};</div>
                  </div>
                  <router-link
                    to="/tokens"
                    class="inline-block mt-4 text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    Explore design tokens →
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Next Steps -->
          <div class="max-w-7xl mx-auto mt-12">
            <div 
              class="rounded-lg shadow-sm border p-8"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Next Steps
              </h2>
              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Learn More
                  </h3>
                  <ul class="space-y-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <li>
                      <router-link to="/getting-started/principles" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">
                        Design Principles
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/getting-started/best-practices" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">
                        Best Practices
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/components" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">
                        Component Library
                      </router-link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Get Help
                  </h3>
                  <ul class="space-y-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <li>
                      <router-link to="/getting-started/support" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">
                        Support & Help
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/getting-started/resources" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">
                        Resources
                      </router-link>
                    </li>
                    <li>
                      <router-link to="/getting-started/contribute" class="text-indigo-600 hover:text-indigo-700 underline" :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''">
                        Contribute
                      </router-link>
                    </li>
                  </ul>
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

