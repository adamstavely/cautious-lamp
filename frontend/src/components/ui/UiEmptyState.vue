<template>
  <div class="ui-empty" :class="{ 'ui-empty-bordered': bordered }">
    <SpotArt v-if="spot" :name="spot" size="lg" />
    <p class="ui-empty-title">{{ title }}</p>
    <p v-if="body || $slots.default" class="ui-empty-body"><slot>{{ body }}</slot></p>
    <div v-if="$slots.actions" class="flex flex-wrap justify-center gap-3 mt-2"><slot name="actions" /></div>
  </div>
</template>

<script setup>
import SpotArt from './SpotArt.vue';

/** Nothing to show yet (or a feature that isn't set up): an illustration, what's missing, and what to do */
defineProps({
  title: { type: String, required: true },
  body: { type: String, default: '' },
  spot: { type: String, default: '' },
  bordered: { type: Boolean, default: true },
});
</script>

<style scoped>
.ui-empty {
  @apply flex flex-col items-center gap-2 px-6 py-12 text-center;
}
.ui-empty-bordered {
  @apply rounded-card border border-line bg-surface-raised;
}
.ui-empty-title {
  @apply text-lg font-semibold text-ink-strong;
}
.ui-empty-body {
  @apply max-w-lg text-sm text-ink-secondary;
}
</style>
