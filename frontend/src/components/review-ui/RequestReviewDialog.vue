<template>
  <v-dialog :model-value="modelValue" @update:model-value="setOpen" persistent max-width="800" :scrim="isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'">
    <v-card :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" :style="cardStyle">
      <v-card-title :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="d-flex align-center justify-space-between px-6 pt-10 pb-4" :style="isDarkMode ? cardStyle : `${cardStyle} font-family: inherit; font-weight: 600;`">
        <div class="d-flex align-center">
          <svg :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'" class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" class="font-bold text-2xl">Design Review Request</span>
          <DemoDataBadge class="ml-3" />
        </div>
        <button @click.stop="setOpen(false)" aria-label="Close" :class="isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'" class="transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </v-card-title>
      <v-card-text :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" class="pt-0 px-6" :style="cardStyle">
        <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'" class="text-sm mb-6">Upload design files or link to a website under development for client review</p>
        <FileUpload @uploaded="handleUploaded" />
        <div
          v-if="resultUrl"
          class="mt-6 p-4 rounded-lg border"
          :class="isDarkMode
            ? 'bg-green-900/20 border-green-800'
            : 'bg-green-50 border-green-200'"
        >
          <div class="flex items-start">
            <svg :class="isDarkMode ? 'text-green-400' : 'text-green-600'" class="w-5 h-5 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
              <p :class="isDarkMode ? 'text-green-300' : 'text-green-800'" class="text-sm font-medium">Review created. Share this link:</p>
              <a :href="resultUrl" target="_blank" rel="noopener"
                :class="isDarkMode
                  ? 'text-green-400 hover:text-green-300'
                  : 'text-green-600 hover:text-green-800'"
                class="text-sm underline mt-1 block break-all">{{ resultUrl }}</a>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import FileUpload from './FileUpload.vue';
import DemoDataBadge from './DemoDataBadge.vue';
import { useDarkMode } from '../../composables/useDarkMode.js';

const props = defineProps({
  modelValue: Boolean,
});

// created: ({ reviewId, url }) after each review is created
const emit = defineEmits(['update:modelValue', 'created']);

const isDarkMode = useDarkMode();
const resultUrl = ref('');

const cardStyle = computed(() => (isDarkMode.value
  ? 'background-color: #1e293b !important; opacity: 1 !important;'
  : 'background-color: #ffffff !important; opacity: 1 !important;'));

const setOpen = (open) => emit('update:modelValue', open);

// Start fresh each time the dialog opens
watch(() => props.modelValue, (open) => {
  if (open) resultUrl.value = '';
});

const handleUploaded = (result) => {
  resultUrl.value = result.url;
  emit('created', result);
};
</script>

<style scoped>
/* Ensure modal is fully opaque and visible */
:deep(.v-card) {
  opacity: 1 !important;
}
</style>
