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
                    Atomic Design
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Build interfaces systematically using atomic design principles. Create reusable components from the smallest atoms to complete page templates.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="atomicDesignGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Atomic design hierarchy: atoms, molecules, organisms -->
                      <circle cx="50" cy="50" r="15" fill="url(#atomicDesignGradient)" opacity="0.8"/>
                      <circle cx="100" cy="50" r="15" fill="url(#atomicDesignGradient)" opacity="0.8"/>
                      <circle cx="150" cy="50" r="15" fill="url(#atomicDesignGradient)" opacity="0.8"/>
                      <!-- Molecules -->
                      <rect x="40" y="90" width="30" height="30" rx="4" fill="url(#atomicDesignGradient)" opacity="0.7"/>
                      <rect x="85" y="90" width="30" height="30" rx="4" fill="url(#atomicDesignGradient)" opacity="0.7"/>
                      <rect x="130" y="90" width="30" height="30" rx="4" fill="url(#atomicDesignGradient)" opacity="0.7"/>
                      <!-- Organisms -->
                      <rect x="30" y="140" width="60" height="40" rx="6" fill="url(#atomicDesignGradient)" opacity="0.6"/>
                      <rect x="110" y="140" width="60" height="40" rx="6" fill="url(#atomicDesignGradient)" opacity="0.6"/>
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
                Understanding Atomic Design
              </h2>
              <p class="text-lg mb-6" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Atomic design is a methodology for creating design systems. It breaks interfaces down into fundamental building blocks that can be combined to create more complex components.
              </p>
              
              <div class="space-y-6 mt-8">
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Atoms
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    The smallest building blocks of our design system. These include buttons, inputs, labels, and other basic HTML elements that cannot be broken down further.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Molecules
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Simple combinations of atoms that form functional units. Examples include form fields with labels, search bars, and navigation items.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Organisms
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Complex components made from molecules and atoms. These include headers, forms, card groups, and other substantial interface sections.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Templates
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Page-level objects that combine organisms to create the structure of a page. Templates focus on content structure rather than final content.
                  </p>
                </div>
                
                <div>
                  <h3 class="text-xl font-semibold mb-3" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                    Pages
                  </h3>
                  <p class="mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Specific instances of templates with real content. Pages are what users interact with and are essential for testing the effectiveness of the design system.
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

