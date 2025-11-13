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
                  Research Reports
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Guidelines for creating comprehensive, actionable research reports that effectively communicate findings and recommendations to stakeholders.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="researchReportsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Document/report -->
                    <rect x="60" y="50" width="80" height="100" rx="4" fill="url(#researchReportsGradient)" opacity="0.7"/>
                    <line x1="70" y1="70" x2="130" y2="70" stroke="white" stroke-width="2" opacity="0.6"/>
                    <line x1="70" y1="90" x2="130" y2="90" stroke="white" stroke-width="2" opacity="0.6"/>
                    <line x1="70" y1="110" x2="130" y2="110" stroke="white" stroke-width="2" opacity="0.6"/>
                    <line x1="70" y1="130" x2="110" y2="130" stroke="white" stroke-width="2" opacity="0.6"/>
                    <!-- Chart/graph icon on document -->
                    <rect x="70" y="50" width="20" height="15" fill="white" opacity="0.4"/>
                    <line x1="75" y1="60" x2="85" y2="55" stroke="url(#researchReportsGradient)" stroke-width="1.5"/>
                    <line x1="85" y1="55" x2="87" y2="62" stroke="url(#researchReportsGradient)" stroke-width="1.5"/>
                    <!-- Insights/lightbulb -->
                    <circle cx="100" cy="30" r="12" fill="url(#researchReportsGradient)" opacity="0.8"/>
                    <path d="M 100 20 L 95 25 L 100 24 L 105 25 Z" fill="white" opacity="0.7"/>
                    <!-- Data points -->
                    <circle cx="140" cy="80" r="4" fill="url(#researchReportsGradient)" opacity="0.6"/>
                    <circle cx="140" cy="100" r="4" fill="url(#researchReportsGradient)" opacity="0.6"/>
                    <circle cx="140" cy="120" r="4" fill="url(#researchReportsGradient)" opacity="0.6"/>
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
              Content for Research Reports coming soon...
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

