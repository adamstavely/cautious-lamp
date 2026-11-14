<template>
  <div class="ui-stat">
    <p class="ui-stat-label">
      <span v-if="icon" class="material-symbols-outlined text-base" aria-hidden="true">{{ icon }}</span>
      {{ label }}
    </p>
    <p class="ui-stat-value" :class="`ui-stat-${tone}`"><slot>{{ value }}</slot></p>
    <p v-if="hint" class="ui-stat-hint">{{ hint }}</p>
    <div v-if="$slots.footer" class="ui-stat-footer"><slot name="footer" /></div>
  </div>
</template>

<script setup>
/** A single figure with its label, e.g. "Total runs: 42"; `#footer` for a trend, a meter or a link. Show "Not collected" rather than a made-up number. */
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '' },
  hint: { type: String, default: '' },
  icon: { type: String, default: '' },
  tone: { type: String, default: 'neutral', validator: (v) => ['neutral', 'accent', 'success', 'warning', 'danger'].includes(v) },
});
</script>

<style scoped>
.ui-stat {
  @apply flex flex-col gap-1 rounded-card border border-line bg-surface-raised p-6;
}
.ui-stat-label {
  @apply flex items-center gap-1.5 text-sm font-medium text-ink-secondary;
}
.ui-stat-value {
  @apply text-3xl font-semibold tracking-tight;
}
.ui-stat-neutral {
  @apply text-ink-strong;
}
.ui-stat-accent {
  @apply text-accent-text;
}
.ui-stat-success {
  @apply text-success;
}
.ui-stat-warning {
  @apply text-warning;
}
.ui-stat-danger {
  @apply text-danger;
}
.ui-stat-footer {
  @apply mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-secondary;
}
.ui-stat-hint {
  @apply text-sm text-ink-muted;
}
</style>
