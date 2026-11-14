<template>
  <UiChip
    v-if="demo"
    tone="warning"
    icon="science"
    title="VITE_USE_MOCKS is on: this review section uses sample data stored in your browser, not the review service."
    role="status"
  >
    Demo data
  </UiChip>
</template>

<script setup>
import { UiChip } from '../ui';
import { isMockMode } from '../../mockData.js';

// Fixed for the build, so no need to be reactive.
const demo = isMockMode();
</script>
