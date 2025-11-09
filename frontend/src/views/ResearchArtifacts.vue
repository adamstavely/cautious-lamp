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
        <div class="max-w-7xl mx-auto mb-12">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Research Artifacts
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  A comprehensive collection of research artifacts, documents, and resources from our human-centered design research activities.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="researchArtifactsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Folder icon -->
                    <path d="M 40 60 L 40 160 L 160 160 L 160 80 L 120 80 L 120 60 Z" fill="url(#researchArtifactsGradient)" opacity="0.5"/>
                    <path d="M 40 60 L 120 60 L 120 80 L 160 80" fill="url(#researchArtifactsGradient)" opacity="0.7"/>
                    <!-- Documents inside folder -->
                    <rect x="50" y="90" width="60" height="8" rx="1" fill="url(#researchArtifactsGradient)" opacity="0.6"/>
                    <rect x="50" y="105" width="80" height="8" rx="1" fill="url(#researchArtifactsGradient)" opacity="0.6"/>
                    <rect x="50" y="120" width="70" height="8" rx="1" fill="url(#researchArtifactsGradient)" opacity="0.6"/>
                    <rect x="50" y="135" width="90" height="8" rx="1" fill="url(#researchArtifactsGradient)" opacity="0.6"/>
                    <!-- Additional artifacts -->
                    <circle cx="100" cy="50" r="15" fill="url(#researchArtifactsGradient)" opacity="0.4"/>
                    <rect x="130" y="40" width="20" height="20" rx="2" fill="url(#researchArtifactsGradient)" opacity="0.4"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border p-8"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <p class="text-lg" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Content for Research Artifacts coming soon...
            </p>
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

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

onMounted(() => {
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

