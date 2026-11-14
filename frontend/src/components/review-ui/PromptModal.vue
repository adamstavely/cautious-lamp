<template>
  <UiDialog :open="modelValue" :title="title" size="sm" @update:open="onOpen">
    <form :id="formId" class="flex flex-col gap-3" @submit.prevent="submit">
      <UiInput
        v-model="inputValue"
        :label="label"
        :type="type === 'password' && showPassword ? 'text' : type"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="type === 'password' ? 'new-password' : undefined"
        autofocus
      />
      <UiCheckbox v-if="type === 'password'" v-model="showPassword" label="Show password" />
    </form>
    <template #footer>
      <UiButton variant="ghost" @click="cancel">Cancel</UiButton>
      <UiButton variant="primary" type="submit" :form="formId" :disabled="required && !String(inputValue).trim()">OK</UiButton>
    </template>
  </UiDialog>
</template>

<script setup>
import { ref, useId, watch } from 'vue';
import { UiButton, UiCheckbox, UiDialog, UiInput } from '../ui';

const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: 'Input'
  },
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  },
  required: {
    type: Boolean,
    default: false
  },
  defaultValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const formId = `prompt-${useId()}`;
const inputValue = ref(props.defaultValue);
const showPassword = ref(false);

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    inputValue.value = props.defaultValue;
    showPassword.value = false; // Reset password visibility when modal opens
  }
});

const submit = () => {
  const value = String(inputValue.value ?? '');
  if (props.required && !value.trim()) return;
  emit('submit', value);
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
