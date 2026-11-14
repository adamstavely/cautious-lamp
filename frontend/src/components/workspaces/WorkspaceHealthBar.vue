<template>
  <div class="health-track" aria-hidden="true">
    <div class="health-fill" :class="`health-${healthTone(score)}`"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { healthTone } from './ui.js';

/** A 0–100 health score as a bar. Decorative: show the number beside it. */
const props = defineProps({
  score: { type: Number, default: null },
});

const width = computed(() => `${Math.max(0, Math.min(100, props.score ?? 0))}%`);
</script>

<style scoped>
.health-track {
  @apply w-full h-2 rounded-pill bg-fill-strong overflow-hidden;
}
.health-fill {
  @apply h-full rounded-pill transition-all;
  width: v-bind(width);
}
.health-neutral {
  @apply bg-chart-neutral;
}
.health-success {
  @apply bg-success-solid;
}
.health-warning {
  @apply bg-warning-solid;
}
.health-danger {
  @apply bg-danger-solid;
}
</style>
