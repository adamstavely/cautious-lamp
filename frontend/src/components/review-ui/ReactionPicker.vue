<template>
  <div ref="root" class="relative" @keydown.esc.stop="close(true)" @focusout="onFocusOut">
    <UiButton
      ref="trigger"
      icon-only
      icon="add_reaction"
      variant="ghost"
      size="sm"
      :label="label"
      :disabled="disabled"
      :aria-expanded="open"
      aria-haspopup="true"
      @click="open = !open"
    />
    <div v-if="open" class="reaction-picker" role="group" :aria-label="label">
      <button
        v-for="emoji in emojis"
        :key="emoji"
        type="button"
        class="reaction-picker-emoji"
        :aria-label="`React with ${emoji}`"
        @click="pick(emoji)"
      >
        {{ emoji }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { UiButton } from '../ui';

/** An "Add reaction" button that opens a small grid of emoji; emits pick(emoji). Escape, a click outside or tabbing away closes it. */
defineProps({
  emojis: { type: Array, required: true },
  label: { type: String, default: 'Add reaction' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['pick']);

const open = ref(false);
const root = ref(null);
const trigger = ref(null);

const close = async (refocus = false) => {
  if (!open.value) return;
  open.value = false;
  if (refocus) {
    await nextTick();
    trigger.value?.$el?.focus();
  }
};

const pick = (emoji) => {
  emit('pick', emoji);
  close(true);
};

// Keyboard: tabbing out closes it. Pointer: a press outside closes it (Safari doesn't focus buttons on click).
const onFocusOut = (event) => {
  if (event.relatedTarget && !root.value?.contains(event.relatedTarget)) close();
};
const onPointerDown = (event) => {
  if (!root.value?.contains(event.target)) close();
};
watch(open, (isOpen) => {
  if (isOpen) document.addEventListener('pointerdown', onPointerDown);
  else document.removeEventListener('pointerdown', onPointerDown);
});
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown));
</script>

<style scoped>
.reaction-picker {
  @apply absolute bottom-full left-0 z-10 mb-1 grid w-52 grid-cols-5 gap-1 rounded-tile border border-line bg-surface-overlay p-2 shadow-overlay;
}
.reaction-picker-emoji {
  @apply flex h-9 w-9 items-center justify-center rounded-control text-lg transition-colors hover:bg-fill-hover;
  @apply focus-visible:outline focus-visible:outline-2 outline-focus;
}
</style>
