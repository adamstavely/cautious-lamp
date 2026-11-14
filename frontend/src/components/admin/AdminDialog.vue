<template>
  <UiDialog :open="modelValue" :title="title" :size="size" @update:open="onOpen">
    <p v-if="subtitle" class="admin-dialog-subtitle">{{ subtitle }}</p>
    <slot />
    <template v-if="$slots.actions" #footer>
      <slot name="actions" />
    </template>
  </UiDialog>
</template>

<script setup>
import { computed } from 'vue';
import UiDialog from '../ui/UiDialog.vue';

/**
 * A dialog for the admin pages: UiDialog (native modal dialog: focus moves in
 * and back, Escape closes, the page behind is inert) with an optional subtitle.
 * `persistent` while saving, so the dialog can't be dismissed mid-request.
 * `maxWidth` picks the nearest UiDialog size.
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  maxWidth: { type: [String, Number], default: 560 },
  persistent: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const size = computed(() => {
  const width = Number.parseInt(props.maxWidth, 10) || 560;
  if (width <= 480) return 'sm';
  if (width <= 640) return 'md';
  return 'lg';
});

const onOpen = (open) => {
  // Escape and the close button ask to close; ignore them while a request runs
  if (!open && props.persistent) return;
  emit('update:modelValue', open);
};
</script>

<style scoped>
.admin-dialog-subtitle {
  @apply -mt-3 truncate text-sm text-ink-muted;
}
</style>
