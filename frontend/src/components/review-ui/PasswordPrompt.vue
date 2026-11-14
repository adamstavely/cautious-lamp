<template>
  <UiDialog :open="modelValue" title="Enter password" size="sm" @update:open="emit('update:modelValue', $event)">
    <p>This review is password protected.</p>
    <form :id="formId" class="flex flex-col gap-3" @submit.prevent="submitPassword">
      <UiInput
        v-model="password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="current-password"
        :error="error"
        autofocus
      />
      <UiCheckbox v-model="showPassword" label="Show password" />
    </form>
    <template #footer>
      <UiButton variant="primary" type="submit" :form="formId" :loading="loading" :disabled="!password">Submit</UiButton>
    </template>
  </UiDialog>
</template>

<script setup>
import { ref, useId, watch } from 'vue';
import { UiButton, UiCheckbox, UiDialog, UiInput } from '../ui';

// The parent closes the dialog once the password is accepted.
const props = defineProps({
  modelValue: Boolean,
  error: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue', 'submit']);

const formId = `password-prompt-${useId()}`;
const password = ref('');
const showPassword = ref(false);

watch(() => props.modelValue, (open) => {
  if (open) password.value = '';
});

const submitPassword = () => {
  if (!password.value || props.loading) return;
  emit('submit', password.value);
};
</script>
