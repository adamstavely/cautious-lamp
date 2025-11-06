<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" persistent max-width="400">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon :color="type === 'error' ? 'error' : 'success'" class="mr-2">{{ type === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle' }}</v-icon>
        {{ title }}
      </v-card-title>
      <v-card-text>
        {{ message }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="close">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
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

const close = () => {
  emit('update:modelValue', false);
};
</script>


