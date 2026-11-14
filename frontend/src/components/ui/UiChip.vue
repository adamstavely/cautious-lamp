<template>
  <span class="ui-chip" :class="`ui-chip-${tone}`">
    <span v-if="icon" class="material-symbols-outlined text-sm" aria-hidden="true">{{ icon }}</span>
    <slot />
  </span>
</template>

<script setup>
/** A short status or category label */
defineProps({
  tone: { type: String, default: 'neutral', validator: (v) => ['neutral', 'accent', 'success', 'warning', 'danger', 'info'].includes(v) },
  icon: { type: String, default: '' },
});
</script>

<style scoped>
.ui-chip {
  @apply inline-flex items-center gap-1 h-6 px-2.5 rounded-pill border text-xs font-medium whitespace-nowrap;
}
.ui-chip-neutral {
  @apply border-line bg-fill-subtle text-ink-secondary;
}
.ui-chip-accent {
  @apply border-accent-highlight bg-accent-subtle text-accent-text;
}
.ui-chip-success {
  @apply border-success-border bg-success-bg text-success;
}
.ui-chip-warning {
  @apply border-warning-border bg-warning-bg text-warning;
}
.ui-chip-danger {
  @apply border-danger-border bg-danger-bg text-danger;
}
.ui-chip-info {
  @apply border-info-border bg-info-bg text-info;
}
</style>
