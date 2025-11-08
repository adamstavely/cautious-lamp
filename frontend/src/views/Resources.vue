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
                    Resources
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Helpful resources, tools, and links to help you work effectively with the design system.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="resourcesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized book/resources icon -->
                      <rect x="60" y="50" width="80" height="100" rx="4" fill="url(#resourcesGradient)" opacity="0.4"/>
                      <rect x="65" y="55" width="70" height="90" rx="2" fill="url(#resourcesGradient)" opacity="0.5"/>
                      <line x1="100" y1="55" x2="100" y2="145" stroke="url(#resourcesGradient)" stroke-width="2" opacity="0.3"/>
                      <circle cx="100" cy="100" r="3" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Resources Content -->
          <div class="max-w-7xl mx-auto space-y-8">
            <!-- Design Resources -->
            <div>
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Design Resources
              </h2>
              <div class="grid md:grid-cols-2 gap-6">
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">design_services</span>
                    Penpot Library
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Access our Penpot component library with all design system components, patterns, and styles.
                  </p>
                  <a
                    href="#"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    Open Penpot Library →
                  </a>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">style</span>
                    Design Tokens
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Download design tokens in various formats (JSON, CSS, SCSS) for use in your design tools.
                  </p>
                  <router-link
                    to="/tokens"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    View Design Tokens →
                  </router-link>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">image</span>
                    Icon Library
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Browse and download icons from Material Symbols and Lucide icon sets.
                  </p>
                  <router-link
                    to="/design-assets/icons"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    Browse Icons →
                  </router-link>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">palette</span>
                    Color Palette
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Explore our color system, including accessibility guidelines and usage examples.
                  </p>
                  <router-link
                    to="/tokens"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    View Colors →
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Development Resources -->
            <div>
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Development Resources
              </h2>
              <div class="grid md:grid-cols-2 gap-6">
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">code</span>
                    GitHub Repository
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Access the source code, file issues, and contribute to the design system.
                  </p>
                  <a
                    href="#"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    View on GitHub →
                  </a>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">inventory</span>
                    NPM Package
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Install the design system package from npm.
                  </p>
                  <div 
                    class="rounded-lg p-3 font-mono text-sm mb-3 relative group"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900'"
                  >
                    <span>npm install @design-system/core</span>
                    <button
                      @click="copyToClipboard('npm install @design-system/core')"
                      class="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded hover:bg-opacity-20 transition-colors"
                      :class="isDarkMode 
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-white' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'"
                      title="Copy to clipboard"
                    >
                      <span class="material-symbols-outlined text-lg">{{ copiedText === 'npm install @design-system/core' ? 'check' : 'content_copy' }}</span>
                    </button>
                  </div>
                  <a
                    href="#"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    View on NPM →
                  </a>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">terminal</span>
                    CLI Tool
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Use our CLI tool to scaffold components, validate code, and manage design tokens.
                  </p>
                  <div 
                    class="rounded-lg p-3 font-mono text-sm mb-3 relative group"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900'"
                  >
                    <span>npm install -g @design-system/cli</span>
                    <button
                      @click="copyToClipboard('npm install -g @design-system/cli')"
                      class="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded hover:bg-opacity-20 transition-colors"
                      :class="isDarkMode 
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-white' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'"
                      title="Copy to clipboard"
                    >
                      <span class="material-symbols-outlined text-lg">{{ copiedText === 'npm install -g @design-system/cli' ? 'check' : 'content_copy' }}</span>
                    </button>
                  </div>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">api</span>
                    SDK & API
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Integrate with our REST API or use the JavaScript SDK for programmatic access.
                  </p>
                  <router-link
                    to="/api"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    View API Documentation →
                  </router-link>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">extension</span>
                    VS Code Extension
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Enhance your development workflow with autocomplete, hover info, and snippets.
                  </p>
                  <a
                    href="#"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    Install Extension →
                  </a>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">rule</span>
                    ESLint Plugin
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Enforce design system rules and best practices in your code with our ESLint plugin.
                  </p>
                  <div 
                    class="rounded-lg p-3 font-mono text-sm mb-3 relative group"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border border-slate-700 text-gray-100' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900'"
                  >
                    <span>npm install eslint-plugin-design-system</span>
                    <button
                      @click="copyToClipboard('npm install eslint-plugin-design-system')"
                      class="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded hover:bg-opacity-20 transition-colors"
                      :class="isDarkMode 
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-white' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'"
                      title="Copy to clipboard"
                    >
                      <span class="material-symbols-outlined text-lg">{{ copiedText === 'npm install eslint-plugin-design-system' ? 'check' : 'content_copy' }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Learning Resources -->
            <div>
              <h2 class="text-2xl font-bold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Learning Resources
              </h2>
              <div class="grid md:grid-cols-2 gap-6">
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">play_circle</span>
                    Video Tutorials
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Watch video tutorials covering component usage, theming, and advanced patterns.
                  </p>
                  <a
                    href="#"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    Watch Tutorials →
                  </a>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">code_blocks</span>
                    Code Examples
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Browse code examples and sample implementations for common use cases.
                  </p>
                  <router-link
                    to="/components"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    View Examples →
                  </router-link>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">article</span>
                    Design System Blog
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Read articles about design system best practices, updates, and case studies.
                  </p>
                  <a
                    href="#"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    Read Blog →
                  </a>
                </div>

                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-xl font-semibold mb-3 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">forum</span>
                    Community Forum
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Join discussions, ask questions, and share knowledge with other design system users.
                  </p>
                  <a
                    href="#"
                    class="text-indigo-600 hover:text-indigo-700 underline"
                    :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : ''"
                  >
                    Join Forum →
                  </a>
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
const copiedText = ref('');

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    copiedText.value = text;
    setTimeout(() => {
      copiedText.value = '';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text:', err);
  }
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

