<template>
  <AdminDialog
    :model-value="modelValue"
    :title="title"
    :persistent="busy"
    :max-width="460"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="text-ink">{{ message }}</p>
    <slot />
    <InlineNotice :notice="error ? { type: 'error', message: error } : null" @dismiss="emit('clear-error')" />
    <template #actions>
      <UiButton variant="secondary" :disabled="busy" @click="emit('update:modelValue', false)">Cancel</UiButton>
      <UiButton :variant="danger ? 'danger' : 'primary'" :loading="busy" @click="emit('confirm')">
        {{ busy ? busyText : confirmText }}
      </UiButton>
    </template>
  </AdminDialog>
</template>

<script setup>
import AdminDialog from './AdminDialog.vue';
import InlineNotice from '../InlineNotice.vue';
import UiButton from '../ui/UiButton.vue';

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
