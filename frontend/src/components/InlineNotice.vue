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
  @apply flex items-start gap-3 rounded-xl border border-solid px-4 py-3 text-sm;
}
.inline-notice-info {
  @apply border-[#dce8fb] bg-[#f2f6fd] text-[#2f5ea8] dark:border-[#263a5c] dark:bg-[#263a5c]/40 dark:text-[#9dbcf0];
}
.inline-notice-success {
  @apply border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300;
}
.inline-notice-warning {
  @apply border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300;
}
.inline-notice-error {
  @apply border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300;
}
.inline-notice-close {
  @apply rounded-full p-0.5 opacity-70 hover:opacity-100;
}
</style>
