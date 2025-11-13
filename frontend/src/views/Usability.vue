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
                    Usability
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Create interfaces that are intuitive, efficient, and accessible. Usability ensures users can accomplish their goals with ease and satisfaction.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="usabilityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- User and interface elements -->
                      <circle cx="100" cy="80" r="25" fill="url(#usabilityGradient)" opacity="0.8"/>
                      <rect x="50" y="120" width="100" height="50" rx="8" fill="url(#usabilityGradient)" opacity="0.7"/>
                      <rect x="60" y="130" width="30" height="8" rx="2" fill="white" opacity="0.6"/>
                      <rect x="60" y="145" width="50" height="8" rx="2" fill="white" opacity="0.6"/>
                      <rect x="60" y="160" width="40" height="8" rx="2" fill="white" opacity="0.6"/>
                      <!-- Connection lines showing interaction -->
                      <line x1="100" y1="105" x2="100" y2="120" stroke="url(#usabilityGradient)" stroke-width="3" opacity="0.5"/>
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
                Usability Principles
              </h2>
              <p class="text-lg mb-6" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Usability is about making interfaces easy to learn, efficient to use, and satisfying for users. Our design system incorporates usability best practices throughout.
              </p>
              
              <div class="space-y-6 mt-8">
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Learnability
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Interfaces should be easy to learn for new users. Use familiar patterns, clear labels, and helpful guidance to reduce the learning curve.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Efficiency
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Once learned, interfaces should allow users to accomplish tasks quickly. Optimize workflows, reduce steps, and provide shortcuts for experienced users.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Memorability
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Users should be able to remember how to use the interface after a period of not using it. Consistent patterns and clear visual hierarchy aid memorability.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Error Prevention & Recovery
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Design to prevent errors and provide clear paths to recovery when errors occur. Validation, confirmation dialogs, and undo functionality improve usability.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Satisfaction
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Users should find the interface pleasant and satisfying to use. Thoughtful design, smooth interactions, and positive feedback contribute to user satisfaction.
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

