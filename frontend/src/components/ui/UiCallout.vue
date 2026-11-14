<template>
  <div class="ui-callout" :class="`ui-callout-${tone}`" :role="role">
    <span class="material-symbols-outlined text-lg leading-6" aria-hidden="true">{{ icon || defaultIcon }}</span>
    <div class="min-w-0 flex-1">
      <p v-if="title" class="ui-callout-title">{{ title }}</p>
      <div class="ui-callout-body"><slot /></div>
    </div>
    <slot name="actions" />
  </div>
</template>

<script setup>
import { computed } from 'vue';

/** A note in the flow of the page: tips (info), confirmations, warnings and problems. For dismissable messages use InlineNotice. */
const props = defineProps({
  tone: { type: String, default: 'info', validator: (v) => ['info', 'success', 'warning', 'danger'].includes(v) },
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
  /** status for updates the page makes, alert for errors that need attention now; none for static notes */
  role: { type: String, default: undefined },
});

const defaultIcon = computed(() => ({ info: 'info', success: 'check_circle', warning: 'warning', danger: 'error' })[props.tone]);
</script>

<style scoped>
.ui-callout {
  @apply flex gap-3 rounded-tile border px-4 py-3 text-sm leading-relaxed;
}
.ui-callout-title {
  @apply font-semibold;
}
.ui-callout-body {
  @apply text-ink-secondary;
}
.ui-callout-info {
  @apply border-info-border bg-info-bg text-info;
}
.ui-callout-success {
  @apply border-success-border bg-success-bg text-success;
}
.ui-callout-warning {
  @apply border-warning-border bg-warning-bg text-warning;
}
.ui-callout-danger {
  @apply border-danger-border bg-danger-bg text-danger;
}
</style>
