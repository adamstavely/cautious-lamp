<template>
  <UiDialog :open="modelValue" :title="title" size="sm" @update:open="onOpen">
    <form :id="formId" @submit.prevent="submit">
      <UiInput v-model="selectedDate" type="date" :label="label" :min="minDate" :required="required" autofocus />
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="cancel">Cancel</UiButton>
      <UiButton variant="primary" type="submit" :form="formId" :disabled="required && !selectedDate">OK</UiButton>
    </template>
  </UiDialog>
</template>

<script setup>
import { ref, useId, watch } from 'vue';
import { UiButton, UiDialog, UiInput } from '../ui';

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: 'Select Date'
  },
  label: {
    type: String,
    default: 'Select expiration date'
  },
  required: {
    type: Boolean,
    default: true
  },
  defaultValue: String,
  minDate: String
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const formId = `date-picker-${useId()}`;
const selectedDate = ref(props.defaultValue || '');

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedDate.value = props.defaultValue || '';
  }
});

const submit = () => {
  if (props.required && !selectedDate.value) return;
  emit('submit', selectedDate.value || null);
  emit('update:modelValue', false);
};

const cancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};

const onOpen = (open) => {
  if (!open && props.modelValue) cancel();
};
</script>
