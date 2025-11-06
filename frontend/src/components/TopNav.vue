<template>
  <nav class="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
    <div class="flex items-center h-16">
      <!-- Left spacer for sidebar -->
      <div class="w-24 flex-shrink-0"></div>
      
      <!-- Site Title - Left Justified -->
      <router-link
        to="/"
        class="text-xl font-bold px-4 flex-shrink-0 transition-colors"
        :class="isDarkMode ? 'text-gray-100 hover:text-indigo-400' : 'text-indigo-600 hover:text-indigo-700'"
      >
        Design System
      </router-link>
      
      <!-- Center Search Bar -->
      <div class="flex-1 flex justify-center">
        <div class="w-full max-w-2xl mx-8">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-xl pointer-events-none"
              :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'"
            >
              search
            </span>
            <input
              type="text"
              placeholder="Search design system..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors"
              :class="isDarkMode 
                ? 'border-slate-600 bg-slate-700 text-gray-100 placeholder-gray-400' 
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'"
            />
          </div>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-4 px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <!-- Notifications -->
        <button
          class="relative flex items-center justify-center p-2 rounded-lg transition-colors"
          :class="isDarkMode 
            ? 'text-gray-300 hover:text-indigo-400 hover:bg-indigo-900/20' 
            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'"
          title="Notifications"
        >
          <span class="material-symbols-outlined flex items-center justify-center">notifications</span>
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full"
            :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
          ></span>
        </button>

        <!-- User Avatar -->
        <button
          class="flex items-center gap-2 p-1 rounded-lg transition-colors"
          :class="isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'"
          title="User Menu"
        >
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
            :class="isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'"
          >
            A
          </div>
        </button>

        <!-- App Picker -->
        <button
          class="flex items-center justify-center p-2 rounded-lg transition-colors"
          :class="isDarkMode 
            ? 'text-gray-300 hover:text-indigo-400 hover:bg-indigo-900/20' 
            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'"
          title="Switch App"
        >
          <span class="material-symbols-outlined flex items-center justify-center">apps</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Check if dark mode is active - make it reactive
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

// Watch for dark class changes on html element using MutationObserver
let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Set up dark mode observer
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Also check periodically as a fallback
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  // Check immediately
  checkDarkMode();
  
  // Check every 100ms as fallback
  darkModeInterval = setInterval(checkDarkMode, 100);
});

// Cleanup observer and interval on unmount
onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

