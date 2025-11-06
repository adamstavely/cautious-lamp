<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="text-3xl font-bold mb-4">Review</h1>
      <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-sm mb-8">Review and analyze your design system components and patterns.</p>
      
      <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
        <p class="text-red-800 dark:text-red-200 font-semibold">Error loading review interface:</p>
        <p class="text-red-600 dark:text-red-300 text-sm mt-2">{{ error }}</p>
        <pre class="text-xs mt-2 overflow-auto text-gray-800 dark:text-gray-200">{{ errorStack }}</pre>
      </div>
      
      <component v-else-if="mounted && UploadPageComponent" :is="UploadPageComponent" />
      
      <div v-else class="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
        <p class="text-gray-500 dark:text-gray-400">Loading review interface...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onErrorCaptured, h } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const UploadPageComponent = ref(null);
const mounted = ref(false);
const error = ref(null);
const errorStack = ref(null);

// Check if dark mode is active - make it reactive
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

// Watch for dark class changes on html element using MutationObserver
let darkModeObserver = null;
let darkModeInterval = null;

onMounted(async () => {
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
  
  try {
    // Dynamically import to catch any import errors
    const module = await import('../components/review-ui/UploadPage.vue');
    UploadPageComponent.value = module.default;
    mounted.value = true;
  } catch (err) {
    error.value = err.message;
    errorStack.value = err.stack;
    console.error('Error loading UploadPage component:', err);
  }
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

onErrorCaptured((err) => {
  error.value = err.message;
  errorStack.value = err.stack;
  console.error('Error in Review page:', err);
  return false;
});
</script>

