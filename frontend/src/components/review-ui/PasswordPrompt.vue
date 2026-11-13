<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" persistent max-width="400">
    <v-card>
      <v-card-title class="text-h6">Enter Password</v-card-title>
      <v-card-text>
        <p class="text-sm mb-3 text-gray-600 dark:text-gray-400">This review is password protected.</p>
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          autofocus
          :error-messages="error ? [error] : []"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          @keyup.enter="submitPassword"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :loading="loading" :disabled="!password" @click="submitPassword">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

// The parent closes the dialog once the password is accepted.
const props = defineProps({
  modelValue: Boolean,
  error: { type: String, default: '' },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue', 'submit']);

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
