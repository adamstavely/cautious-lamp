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
                    Responsiveness
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Create interfaces that adapt seamlessly across all devices and screen sizes. Our responsive design system ensures optimal experiences from mobile to desktop.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="responsivenessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Multiple device sizes -->
                      <rect x="30" y="40" width="35" height="60" rx="4" fill="url(#responsivenessGradient)" opacity="0.8"/>
                      <rect x="32" y="42" width="31" height="56" rx="2" fill="white" opacity="0.2"/>
                      <rect x="80" y="50" width="50" height="70" rx="6" fill="url(#responsivenessGradient)" opacity="0.7"/>
                      <rect x="82" y="52" width="46" height="66" rx="4" fill="white" opacity="0.2"/>
                      <rect x="145" y="45" width="40" height="30" rx="2" fill="url(#responsivenessGradient)" opacity="0.6"/>
                      <rect x="147" y="47" width="36" height="26" rx="1" fill="white" opacity="0.2"/>
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
              <h2 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Responsive Design Principles
              </h2>
              <p class="text-lg mb-6" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Responsive design ensures your interface works beautifully across all devices. Our design system provides breakpoints, flexible layouts, and adaptive components.
              </p>
              
              <div class="space-y-6 mt-8">
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Mobile-First Approach
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Start with mobile designs and progressively enhance for larger screens. This approach ensures core functionality works on all devices and improves performance.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Flexible Layouts
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Use flexible grids and containers that adapt to different screen sizes. Our spacing system and layout components automatically adjust to available space.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Breakpoint System
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Our standardized breakpoints ensure consistent responsive behavior across all components. Use these breakpoints to create layouts that adapt at key screen sizes.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Touch-Friendly Interactions
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Design interactions that work well on touch devices. Ensure buttons and interactive elements are appropriately sized and spaced for touch targets.
                  </p>
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

