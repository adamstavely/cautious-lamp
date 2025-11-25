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
                  AI Patterns
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Design patterns that leverage AI to create intelligent and adaptive user experiences.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="aiPatternsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- AI pattern representation - interconnected nodes -->
                    <circle cx="50" cy="50" r="15" fill="url(#aiPatternsGradient)" opacity="0.6"/>
                    <circle cx="150" cy="50" r="15" fill="url(#aiPatternsGradient)" opacity="0.6"/>
                    <circle cx="50" cy="150" r="15" fill="url(#aiPatternsGradient)" opacity="0.6"/>
                    <circle cx="150" cy="150" r="15" fill="url(#aiPatternsGradient)" opacity="0.6"/>
                    <circle cx="100" cy="100" r="20" fill="url(#aiPatternsGradient)" opacity="0.8"/>
                    <!-- Connecting lines representing pattern connections -->
                    <line x1="50" y1="50" x2="100" y2="100" stroke="url(#aiPatternsGradient)" stroke-width="2" opacity="0.4"/>
                    <line x1="150" y1="50" x2="100" y2="100" stroke="url(#aiPatternsGradient)" stroke-width="2" opacity="0.4"/>
                    <line x1="50" y1="150" x2="100" y2="100" stroke="url(#aiPatternsGradient)" stroke-width="2" opacity="0.4"/>
                    <line x1="150" y1="150" x2="100" y2="100" stroke="url(#aiPatternsGradient)" stroke-width="2" opacity="0.4"/>
                    <!-- Pattern grid overlay -->
                    <rect x="30" y="30" width="140" height="140" rx="8" fill="none" stroke="url(#aiPatternsGradient)" stroke-width="2" opacity="0.3"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto">
          <div class="rounded-lg shadow-sm border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
            <p class="text-lg" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Content coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';

const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const isDarkMode = ref(false);





onMounted(() => {
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
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

