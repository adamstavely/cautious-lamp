<template>
  <dialog ref="dialog" class="ui-dialog" :class="`ui-dialog-${size}`" :aria-labelledby="headingId" @close="$emit('update:open', false)" @cancel.prevent="close">
    <div class="ui-dialog-head">
      <h2 :id="headingId" class="ui-dialog-title">{{ title }}</h2>
      <UiButton icon-only icon="close" label="Close" variant="ghost" size="sm" @click="close" />
    </div>
    <div class="ui-dialog-body"><slot /></div>
    <div v-if="$slots.footer" class="ui-dialog-foot"><slot name="footer" /></div>
  </dialog>
</template>

<script setup>
import { onMounted, ref, useId, watch } from 'vue';
import UiButton from './UiButton.vue';

/**
 * A modal dialog on the native <dialog> element: focus moves in and back,
 * Escape and the close button close it, the page behind is inert. Control it
 * with v-model:open; put the actions in the footer slot.
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
});

const emit = defineEmits(['update:open']);
const dialog = ref(null);
const headingId = useId();

const sync = (open) => {
  const el = dialog.value;
  if (!el) return;
  if (open && !el.open) el.showModal();
  if (!open && el.open) el.close();
};
const close = () => emit('update:open', false);

watch(() => props.open, sync);
onMounted(() => sync(props.open));
</script>

<style scoped>
.ui-dialog {
  @apply w-full p-0 rounded-card border border-line bg-surface-overlay text-ink shadow-overlay;
}
.ui-dialog::backdrop {
  @apply bg-surface-inverse opacity-40;
}
.ui-dialog-sm {
  @apply max-w-md;
}
.ui-dialog-md {
  @apply max-w-xl;
}
.ui-dialog-lg {
  @apply max-w-3xl;
}
.ui-dialog-head {
  @apply flex items-center justify-between gap-3 px-6 pt-5 pb-3;
}
.ui-dialog-title {
  @apply text-lg font-semibold text-ink-strong;
}
.ui-dialog-body {
  @apply flex flex-col gap-5 px-6 pb-6 text-sm text-ink-secondary;
}
.ui-dialog-foot {
  @apply flex flex-wrap justify-end gap-3 px-6 py-4 border-t border-line bg-surface-sunken;
}
</style>
