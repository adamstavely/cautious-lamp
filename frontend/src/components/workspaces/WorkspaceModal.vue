<template>
  <UiDialog :open="open" :title="title" :size="size" @update:open="onOpenChange">
    <slot />
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </UiDialog>
</template>

<script setup>
import { UiDialog } from '../ui';

/**
 * A UiDialog that can't be closed (Escape, the close button) while `busy`, so
 * a request in flight isn't abandoned. Emits `close` when the user closes it.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  /** While true, the modal can't be closed (a request is in flight) */
  busy: { type: Boolean, default: false },
});
const emit = defineEmits(['close']);

const onOpenChange = (open) => {
  if (!open && !props.busy) emit('close');
};
</script>
