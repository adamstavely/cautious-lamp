<template>
  <div
    v-if="notice"
    class="inline-notice"
    :class="`inline-notice-${notice.type}`"
    :role="notice.type === 'error' ? 'alert' : 'status'"
    aria-live="polite"
  >
    <span class="material-symbols-outlined text-lg" aria-hidden="true">{{ icon }}</span>
    <p class="flex-1">{{ notice.message }}</p>
    <button type="button" class="inline-notice-close" aria-label="Dismiss" @click="$emit('dismiss')">
      <span class="material-symbols-outlined text-base" aria-hidden="true">close</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** { message, type } from useNotice(), or null */
  notice: { type: Object, default: null },
});

defineEmits(['dismiss']);

const icon = computed(() => ({
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
})[props.notice?.type] ?? 'info');
</script>

<style scoped>
.inline-notice {
  @apply flex items-start gap-3 rounded-tile border border-solid px-4 py-3 text-sm;
}
.inline-notice-info {
  @apply border-info-border bg-info-bg text-info;
}
.inline-notice-success {
  @apply border-success-border bg-success-bg text-success;
}
.inline-notice-warning {
  @apply border-warning-border bg-warning-bg text-warning;
}
.inline-notice-error {
  @apply border-danger-border bg-danger-bg text-danger;
}
.inline-notice-close {
  @apply rounded-pill p-0.5 opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-2 outline-focus;
}
</style>
