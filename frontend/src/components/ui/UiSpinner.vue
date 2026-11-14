<template>
  <div class="ui-spinner" role="status">
    <span class="ui-spinner-ring" aria-hidden="true"></span>
    <span :class="{ 'sr-only': !showLabel }">{{ label }}</span>
  </div>
</template>

<script setup>
/** Loading: a spinner with a label read to assistive technology (shown when `showLabel`) */
defineProps({
  label: { type: String, default: 'Loading…' },
  showLabel: { type: Boolean, default: true },
});
</script>

<style scoped>
.ui-spinner {
  @apply flex flex-col items-center gap-3 py-12 text-sm text-ink-secondary;
}
.ui-spinner-ring {
  @apply w-8 h-8 rounded-pill border-4 border-solid border-accent-highlight border-t-accent animate-spin motion-reduce:animate-none;
}
</style>
