<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" persistent max-width="400">
    <v-card>
      <v-card-title class="text-h6">Enter Password</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          outlined
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="submitPassword">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(['update:modelValue', 'submit']);

const password = ref('');
const showPassword = ref(false);

const submitPassword = () => {
  emit('submit', password.value);
  emit('update:modelValue', false);
};
</script>
