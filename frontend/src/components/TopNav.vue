<template>
  <nav class="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 relative">
    <div class="flex items-center h-16">
      <!-- Left spacer for sidebar -->
      <div class="w-24 flex-shrink-0"></div>
      
      <!-- Site Title - Left Justified (positioned absolutely) -->
      <router-link
        to="/"
        class="absolute left-0 flex items-center gap-2 pl-[50px] transition-all group"
      >
        <!-- Custom Carets Icon (overlapping by 25%) -->
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          class="transition-transform group-hover:scale-110"
        >
          <defs>
            <linearGradient id="caretGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#312e81;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#3730a3;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#4338ca;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="caretGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#1e1b4b;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#312e81;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#3730a3;stop-opacity:1" />
            </linearGradient>
          </defs>
          <!-- Left caret < (width: 4 units, from x=6 to x=10) -->
          <path 
            d="M10 6 L6 12 L10 18" 
            :stroke="isDarkMode ? 'url(#caretGradientDark)' : 'url(#caretGradient)'"
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            fill="none"
          />
          <!-- Right caret > (width: 4 units, from x=9 to x=13, overlapping left by 1 unit = 25%) -->
          <path 
            d="M13 6 L17 12 L13 18" 
            :stroke="isDarkMode ? 'url(#caretGradientDark)' : 'url(#caretGradient)'"
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
        <span class="text-xl font-bold bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 dark:from-indigo-950 dark:via-indigo-900 dark:to-indigo-800 bg-clip-text text-transparent">Design System</span>
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

