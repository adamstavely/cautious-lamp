<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <Breadcrumbs :custom-path="'/design-assets/stock-photos'" />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    Stock Photos
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Curated collection of stock photography for use in your projects. Browse professional images organized by category and theme.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="stockPhotosGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized photo icon -->
                      <rect x="40" y="50" width="120" height="100" rx="4" fill="url(#stockPhotosGradient)" opacity="0.4"/>
                      <rect x="50" y="60" width="100" height="80" rx="2" fill="url(#stockPhotosGradient)" opacity="0.6"/>
                      <circle cx="100" cy="100" r="25" fill="url(#stockPhotosGradient)" opacity="0.8"/>
                      <circle cx="100" cy="100" r="15" fill="white" opacity="0.6"/>
                      <rect x="130" y="70" width="20" height="20" rx="2" fill="url(#stockPhotosGradient)" opacity="0.5"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="max-w-7xl mx-auto">
            <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'">
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Stock photos library coming soon. Upload and manage stock photography assets here.
              </p>
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
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

const closeDrawer = () => { drawerOpen.value = false; };
const toggleDrawer = () => { drawerOpen.value = !drawerOpen.value; };

let darkModeObserver = null;
onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  darkModeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});
onBeforeUnmount(() => {
  if (darkModeObserver) darkModeObserver.disconnect();
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

