<template>
  <span
    v-if="demo"
    class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
    title="VITE_USE_MOCKS is on: this review section uses sample data stored in your browser, not the review service."
    role="status"
  >
    <span class="material-symbols-outlined" style="font-size: 14px;" aria-hidden="true">science</span>
    Demo data
  </span>
</template>

<script setup>
import { isMockMode } from '../../mockData.js';

// Fixed for the build, so no need to be reactive.
const demo = isMockMode();
</script>
