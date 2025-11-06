<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area - shifts when drawer is open -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="min-h-screen p-8">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-3xl font-bold mb-4"
            :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'"
          >
            Patterns
          </h1>
          <p class="mb-8"
            :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
          >
            Explore and manage design patterns and UI patterns.
          </p>
          
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8">
            <div class="text-center py-12">
              <span class="material-symbols-outlined text-6xl mb-4"
                :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'"
              >
                pattern
              </span>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                Design patterns library coming soon...
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

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Watch for dark mode changes
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

