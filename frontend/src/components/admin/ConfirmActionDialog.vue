<template>
  <AdminDialog
    :model-value="modelValue"
    :title="title"
    :persistent="busy"
    :max-width="460"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <p class="text-sm text-gray-700 dark:text-gray-300">{{ message }}</p>
      <slot />
      <InlineNotice :notice="error ? { type: 'error', message: error } : null" @dismiss="emit('clear-error')" />
    </div>
    <template #actions>
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
        :disabled="busy"
        @click="emit('update:modelValue', false)"
      >
        Cancel
      </button>
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        :class="danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400'"
        :disabled="busy"
        @click="emit('confirm')"
      >
        {{ busy ? busyText : confirmText }}
      </button>
    </template>
  </AdminDialog>
</template>

<script setup>
import AdminDialog from './AdminDialog.vue';
import InlineNotice from '../InlineNotice.vue';

/**
 * A confirmation in place of window.confirm(). The parent runs the action on
 * `confirm`, keeps the dialog open while `busy`, and shows a failure (such as
 * the API's 409 message) in `error` instead of closing.
 */
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirm' },
  busyText: { type: String, default: 'Working…' },
  danger: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  error: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'clear-error']);
</script>
