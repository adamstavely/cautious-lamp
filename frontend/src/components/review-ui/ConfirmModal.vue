<template>
  <UiDialog :open="modelValue" :title="title" size="sm" @update:open="onOpen">
    <p class="text-ink">{{ message }}</p>
    <template #footer>
      <UiButton variant="ghost" @click="cancel">Cancel</UiButton>
      <UiButton :variant="danger ? 'danger' : 'primary'" @click="confirm">{{ confirmText }}</UiButton>
    </template>
  </UiDialog>
</template>

<script setup>
import { computed } from 'vue';
import { UiButton, UiDialog } from '../ui';

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: 'Confirm'
  },
  message: String,
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  // 'primary', or 'red' / 'error' / 'danger' for destructive actions
  confirmColor: {
    type: String,
    default: 'primary'
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const danger = computed(() => ['red', 'error', 'danger'].includes(props.confirmColor));

const confirm = () => {
  emit('confirm');
  emit('update:modelValue', false);
};

const cancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};

// Escape or the close button count as Cancel
const onOpen = (open) => {
  if (!open && props.modelValue) cancel();
};
</script>
