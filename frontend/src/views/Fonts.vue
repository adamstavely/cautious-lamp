<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 relative flex">
    <!-- Main Content Area -->
    <div class="flex-1 h-full transition-all duration-300 relative overflow-y-auto" style="margin-left: 48px;">
      <div class="min-h-screen p-8 pb-16">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Typography
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Explore and manage your typography system. Preview fonts, test readability, compare typefaces, and build a cohesive typographic hierarchy that enhances your design system.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="fontsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Stylized typography icon -->
                    <text x="50" y="100" font-family="Arial" font-size="60" font-weight="bold" fill="url(#fontsGradient)" opacity="0.3">Aa</text>
                    <text x="50" y="140" font-family="Arial" font-size="40" fill="url(#fontsGradient)" opacity="0.5">Aa</text>
                    <!-- Typography lines overlay -->
                    <line x1="30" y1="80" x2="170" y2="80" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                    <line x1="30" y1="100" x2="170" y2="100" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="2,2"/>
                    <line x1="30" y1="120" x2="170" y2="120" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
                    <line x1="30" y1="140" x2="170" y2="140" stroke="rgba(255,255,255,0.2)" stroke-width="1" stroke-dasharray="2,2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Font Previewer Section -->
        <div class="max-w-7xl mx-auto">
          <FontPreviewer />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import FontPreviewer from '../components/font-previewer/FontPreviewer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));

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

