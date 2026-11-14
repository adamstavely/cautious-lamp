<template>
  <UiDialog :open="modelValue" :title="title" size="sm" @update:open="emit('update:modelValue', $event)">
    <UiCallout :tone="tone" :role="type === 'error' ? 'alert' : 'status'">{{ message }}</UiCallout>
    <template #footer>
      <UiButton variant="primary" @click="close">OK</UiButton>
    </template>
  </UiDialog>
</template>

<script setup>
import { computed } from 'vue';
import { UiButton, UiCallout, UiDialog } from '../ui';

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: 'Notification'
  },
  message: String,
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'error'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue']);

const tone = computed(() => ({ error: 'danger', success: 'success' })[props.type] || 'info');

const close = () => {
  emit('update:modelValue', false);
};
</script>
