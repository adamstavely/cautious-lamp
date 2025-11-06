<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" persistent max-width="400">
    <v-card class="bg-white dark:bg-slate-800">
      <v-card-title class="d-flex align-center bg-white dark:bg-slate-800 px-6 pt-6 pb-4">
        <span class="material-symbols-outlined mr-3 confirm-modal-icon" style="font-size: 24px;">warning</span>
        <span class="text-lg font-bold confirm-modal-title">{{ title }}</span>
      </v-card-title>
      <v-divider />
      <v-card-text class="px-6 py-4 bg-white dark:bg-slate-800">
        <p class="confirm-modal-message">{{ message }}</p>
      </v-card-text>
      <v-divider />
      <v-card-actions class="px-6 py-4 bg-white dark:bg-slate-800">
        <v-spacer />
        <v-btn color="grey" variant="text" @click="cancel" class="text-gray-600 dark:text-gray-400">Cancel</v-btn>
        <v-btn :color="confirmColor" variant="flat" @click="confirm" class="text-white">{{ confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
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
  confirmColor: {
    type: String,
    default: 'primary'
  }
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const confirm = () => {
  emit('confirm');
  emit('update:modelValue', false);
};

const cancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<style scoped>
/* Icon color - brand blue */
.confirm-modal-icon {
  color: #4f46e5 !important; /* indigo-600 */
}

/* Title text color */
.confirm-modal-title {
  color: #111827 !important; /* gray-900 */
}

/* Message text color */
.confirm-modal-message {
  color: #374151 !important; /* gray-700 */
}
</style>

<style>
/* Global styles for dark mode overrides */
html.dark .confirm-modal-icon {
  color: #818cf8 !important; /* indigo-400 */
}

html.dark .confirm-modal-title {
  color: #f1f5f9 !important; /* slate-100 */
}

html.dark .confirm-modal-message {
  color: #d1d5db !important; /* gray-300 */
}
</style>
