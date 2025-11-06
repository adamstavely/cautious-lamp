<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" persistent max-width="400">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="inputValue"
          :label="label"
          :type="type === 'password' && showPassword ? 'text' : type"
          :placeholder="placeholder"
          outlined
          autofocus
          :append-inner-icon="type === 'password' ? (showPassword ? 'mdi-eye-off' : 'mdi-eye') : undefined"
          @click:append-inner="type === 'password' ? (showPassword = !showPassword) : undefined"
          @keyup.enter="submit"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="cancel">Cancel</v-btn>
        <v-btn color="primary" @click="submit" :disabled="required && !inputValue.trim()">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

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

const inputValue = ref(props.defaultValue);
const showPassword = ref(false);

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    inputValue.value = props.defaultValue;
    showPassword.value = false; // Reset password visibility when modal opens
  }
});

const submit = () => {
  if (props.required && !inputValue.value.trim()) return;
  emit('submit', inputValue.value);
  emit('update:modelValue', false);
};

const cancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

