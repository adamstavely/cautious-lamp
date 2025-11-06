<template>
  <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg mb-6">
    <div class="border-b border-gray-200 dark:border-slate-700 px-8 py-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Designer Tools</h3>
        </div>
        <span
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
          :class="isDesignerMode ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700' : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600'"
        >
          {{ isDesignerMode ? 'Designer' : 'Client' }}
        </span>
      </div>
    </div>
    <div class="p-8">
      <label class="flex items-center justify-between cursor-pointer">
        <div class="flex-1">
          <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Designer Mode</span>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {{ isDesignerMode ? 'Upload new versions and manage design files' : 'View as client - add comments and feedback' }}
          </p>
        </div>
        <div class="ml-4 relative inline-block w-11 h-6">
          <input
            type="checkbox"
            v-model="isDesignerMode"
            @change="toggleDesignerMode"
            class="sr-only"
          />
          <div
            class="w-11 h-6 rounded-full transition-colors duration-200 ease-in-out"
            :class="isDesignerMode ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-200 dark:bg-slate-600'"
          ></div>
          <div
            class="absolute left-1 top-1 bg-white dark:bg-slate-100 w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm"
            :class="isDesignerMode ? 'translate-x-5' : 'translate-x-0'"
          ></div>
        </div>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['mode-changed']);

const isDesignerMode = ref(false);

const toggleDesignerMode = () => {
  localStorage.setItem('designerMode', isDesignerMode.value.toString());
  emit('mode-changed', isDesignerMode.value);
};

onMounted(() => {
  // Check if designer mode was previously enabled
  const savedMode = localStorage.getItem('designerMode');
  if (savedMode === 'true') {
    isDesignerMode.value = true;
    emit('mode-changed', true);
  }
});
</script>
