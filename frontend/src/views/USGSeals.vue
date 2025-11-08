<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <Breadcrumbs :custom-path="'/design-assets/usg-seals'" />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    USG Seals
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Official US Government seals and emblems for authorized use. Access approved government seals and official insignia for agency communications.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="usgSealsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized seal icon -->
                      <circle cx="100" cy="100" r="70" fill="url(#usgSealsGradient)" opacity="0.3"/>
                      <circle cx="100" cy="100" r="55" fill="url(#usgSealsGradient)" opacity="0.5"/>
                      <circle cx="100" cy="100" r="40" fill="url(#usgSealsGradient)" opacity="0.7"/>
                      <path d="M 100 60 L 110 90 L 140 90 L 115 110 L 125 140 L 100 120 L 75 140 L 85 110 L 60 90 L 90 90 Z" fill="white" opacity="0.8"/>
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
                USG seals library coming soon. Upload and manage official government seals here.
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

