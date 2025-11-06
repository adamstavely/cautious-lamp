<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" persistent max-width="400">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="selectedDate"
          type="date"
          :label="label"
          :min="minDate"
          variant="outlined"
          autofocus
          @keyup.enter="submit"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="cancel">Cancel</v-btn>
        <v-btn color="primary" @click="submit" :disabled="required && !selectedDate">OK</v-btn>
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

const selectedDate = ref(props.defaultValue || null);

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedDate.value = props.defaultValue || null;
  }
});

const submit = () => {
  if (props.required && !selectedDate.value) return;
  emit('submit', selectedDate.value);
  emit('update:modelValue', false);
};

const cancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

