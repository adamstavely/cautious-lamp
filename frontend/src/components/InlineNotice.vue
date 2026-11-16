<template>
  <!-- No box of its own (display: contents), so an empty notice adds no gap to
       its parent; classes from the page go to the visible message -->
  <div class="contents">
    <!-- Live regions that are always present: screen readers announce a change
         to an existing region, but often miss one that arrives already filled -->
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ politeText }}</p>
    <p class="sr-only" aria-live="assertive" aria-atomic="true">{{ assertiveText }}</p>

    <div v-if="notice" v-bind="$attrs" class="inline-notice" :class="`inline-notice-${notice.type}`">
      <AppIcon :name="icon" class="text-lg" />
      <p class="flex-1">{{ notice.message }}</p>
      <button type="button" class="inline-notice-close" aria-label="Dismiss" @click="$emit('dismiss')">
        <AppIcon name="x" class="text-base" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';

defineOptions({ inheritAttrs: false });

const props = defineProps({
  /** { message, type } from useNotice(), or null */
  notice: { type: Object, default: null },
});

defineEmits(['dismiss']);

const icon = computed(() => ({
  success: 'circle-check',
  error: 'circle-alert',
  warning: 'triangle-alert',
  info: 'info',
})[props.notice?.type] ?? 'info');

// Errors interrupt; everything else waits its turn. Clearing first means the
// same message shown twice in a row is announced twice.
const politeText = ref('');
const assertiveText = ref('');
watch(
  () => props.notice,
  async (notice) => {
    politeText.value = '';
    assertiveText.value = '';
    if (!notice?.message) return;
    await nextTick();
    if (notice.type === 'error') assertiveText.value = notice.message;
    else politeText.value = notice.message;
  },
  { immediate: true },
);
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
/* At least 24px, the WCAG 2.5.8 minimum */
.inline-notice-close {
  @apply flex items-center justify-center min-w-6 min-h-6 rounded-pill opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-2 outline-focus;
}
</style>
