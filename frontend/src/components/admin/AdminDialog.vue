<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    :aria-labelledby="titleId"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
    @after-leave="restoreFocus"
  >
    <div class="admin-dialog flex max-h-[90vh] flex-col overflow-hidden rounded-lg shadow-xl bg-[#fff] dark:bg-slate-800">
      <div class="flex items-start justify-between gap-4 border-b border-solid border-gray-200 p-6 dark:border-gray-700">
        <div class="min-w-0">
          <h2 :id="titleId" class="text-xl font-bold text-gray-900 dark:text-white">{{ title }}</h2>
          <p v-if="subtitle" class="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">{{ subtitle }}</p>
        </div>
        <button
          type="button"
          class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-white"
          aria-label="Close"
          :disabled="persistent"
          @click="emit('update:modelValue', false)"
        >
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-6">
        <slot />
      </div>
      <div
        v-if="$slots.actions"
        class="flex flex-wrap justify-end gap-3 border-t border-solid border-gray-200 px-6 py-4 dark:border-gray-700"
      >
        <slot name="actions" />
      </div>
    </div>
  </v-dialog>
</template>

<script setup>
import { watch } from 'vue';

/**
 * A dialog for the admin pages: Vuetify's v-dialog (focus trap, Escape,
 * aria-modal) with a labelled title, and focus returned to whatever opened it.
 * `persistent` while saving, so the dialog can't be dismissed mid-request.
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  maxWidth: { type: [String, Number], default: 560 },
  persistent: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const titleId = `admin-dialog-${Math.random().toString(36).slice(2, 10)}`;
let opener = null;

watch(
  () => props.modelValue,
  (open) => {
    if (open) opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  },
  { immediate: true }
);

const restoreFocus = () => {
  if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
  opener = null;
};
</script>
