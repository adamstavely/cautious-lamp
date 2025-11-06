<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area - shifts when drawer is open -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Main Content -->
      <div class="w-full h-full flex items-center justify-center">
        <div class="text-center max-w-4xl px-6">
          <h1 class="text-4xl font-bold mb-4"
            :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'"
          >
            Design System Guidelines
          </h1>
          <p class="text-lg mb-8"
            :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
          >
            Welcome to our comprehensive design system documentation. Use the drawer icon to browse our guidelines, components, and patterns.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const route = useRoute();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

const openDrawer = () => {
  drawerOpen.value = true;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Open drawer when navigating to /guidelines - removed auto-open
// watch(() => route.path, (newPath) => {
//   if (newPath === '/guidelines') {
//     drawerOpen.value = true;
//   }
// }, { immediate: true });

// Watch for dark mode changes
let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Removed auto-open drawer
  // if (route.path === '/guidelines') {
  //   drawerOpen.value = true;
  // }
  
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
