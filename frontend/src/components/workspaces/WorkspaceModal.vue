<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="!busy && emit('close')"
    @keydown.esc="!busy && emit('close')"
  >
    <div
      ref="panel"
      class="rounded-lg shadow-xl p-6 w-full mx-4 max-h-[90vh] overflow-y-auto"
      :class="[c.modal, widthClass]"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      tabindex="-1"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold flex items-center gap-2" :class="c.heading">
          <span v-if="icon" class="material-symbols-outlined text-indigo-600 text-2xl" aria-hidden="true">{{ icon }}</span>
          {{ title }}
        </h3>
        <button type="button" class="text-gray-400 hover:text-gray-600" aria-label="Close" :disabled="busy" @click="emit('close')">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { ui } from './ui.js';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  isDarkMode: { type: Boolean, default: false },
  /** sm | md | lg */
  size: { type: String, default: 'md' },
  /** While true, the modal can't be closed (a request is in flight) */
  busy: { type: Boolean, default: false },
});
const emit = defineEmits(['close']);

const panel = ref(null);
const c = computed(() => ui(props.isDarkMode));
const widthClass = computed(() => ({ sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-3xl' })[props.size] ?? 'max-w-lg');

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    await nextTick();
    panel.value?.focus();
  },
);
</script>
