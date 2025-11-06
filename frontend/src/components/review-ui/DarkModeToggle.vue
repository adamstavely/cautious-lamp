<template>
  <button
    @click="toggleDarkMode"
    class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    aria-label="Toggle dark mode"
  >
    <!-- Sun Icon (visible in dark mode) -->
    <svg
      v-if="isDark"
      class="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    <!-- Moon Icon (visible in light mode) -->
    <svg
      v-else
      class="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();
const isDark = ref(false);

// Check for saved preference or system preference
const initDarkMode = () => {
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) {
    isDark.value = saved === 'true';
  } else {
    // Check system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  applyDarkMode();
};

// Apply dark mode class to document and Vuetify theme
const applyDarkMode = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    theme.change('dark');
  } else {
    document.documentElement.classList.remove('dark');
    theme.change('light');
  }
};

// Toggle dark mode
const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  localStorage.setItem('darkMode', isDark.value.toString());
  applyDarkMode();
};

// Listen for system preference changes
onMounted(() => {
  initDarkMode();
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    // Only apply if user hasn't manually set a preference
    if (localStorage.getItem('darkMode') === null) {
      isDark.value = e.matches;
      applyDarkMode();
    }
  });
});
</script>

