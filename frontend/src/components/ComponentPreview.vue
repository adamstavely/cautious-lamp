<template>
  <div class="component-preview">
    <!-- Button Component -->
    <div v-if="component === 'button'" class="flex items-center gap-4">
      <button
        :class="[
          'px-6 py-2 rounded-lg font-medium transition-colors',
          componentProps.variant === 'primary' ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
          componentProps.variant === 'secondary' ? 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50' :
          componentProps.variant === 'tertiary' ? 'bg-transparent text-indigo-600 hover:bg-indigo-50' :
          componentProps.variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
          'bg-indigo-600 text-white hover:bg-indigo-700',
          componentProps.size === 'sm' ? 'px-4 py-1 text-sm' :
          componentProps.size === 'lg' ? 'px-8 py-3 text-lg' :
          '',
          componentProps.disabled ? 'opacity-50 cursor-not-allowed' : '',
          componentProps.loading ? 'opacity-75' : ''
        ]"
        :disabled="componentProps.disabled || componentProps.loading"
      >
        <span v-if="componentProps.loading" class="inline-block mr-2">
          <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        {{ componentProps.label || 'Button' }}
      </button>
    </div>

    <!-- Card Component -->
    <div v-else-if="component === 'card'" class="w-full max-w-md">
      <div
        :class="[
          'rounded-lg p-6',
          componentProps.variant === 'elevated' ? 'shadow-lg' :
          componentProps.variant === 'outlined' ? 'border-2 border-gray-200' :
          'border border-gray-200',
          isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white'
        ]"
      >
        <h3 v-if="componentProps.title" class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
          {{ componentProps.title }}
        </h3>
        <p v-if="componentProps.content" class="text-sm mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">
          {{ componentProps.content }}
        </p>
        <div v-if="componentProps.showActions" class="flex gap-2 mt-4">
          <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
            Action
          </button>
          <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm" :class="isDarkMode ? 'border-gray-600 hover:bg-slate-700' : ''">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Input Component -->
    <div v-else-if="component === 'input'" class="w-full max-w-md">
      <label v-if="componentProps.label" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
        {{ componentProps.label }}
        <span v-if="componentProps.required" class="text-red-500 ml-1">*</span>
      </label>
      <input
        :type="componentProps.type || 'text'"
        :placeholder="componentProps.placeholder || ''"
        :required="componentProps.required"
        :disabled="componentProps.disabled"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        :class="isDarkMode 
          ? 'border-gray-600 bg-slate-700 text-white' 
          : 'border-gray-300 bg-white text-gray-900'"
      />
    </div>

    <!-- Select Component -->
    <div v-else-if="component === 'select'" class="w-full max-w-md">
      <label v-if="componentProps.label" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
        {{ componentProps.label }}
        <span v-if="componentProps.required" class="text-red-500 ml-1">*</span>
      </label>
      <select
        :required="componentProps.required"
        :disabled="componentProps.disabled"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        :class="isDarkMode 
          ? 'border-gray-600 bg-slate-700 text-white' 
          : 'border-gray-300 bg-white text-gray-900'"
      >
        <option value="">Select an option...</option>
        <option v-for="option in (componentProps.options || '').split(',').map(o => o.trim())" :key="option" :value="option">
          {{ option }}
        </option>
      </select>
    </div>

    <!-- Checkbox Component -->
    <div v-else-if="component === 'checkbox'" class="flex items-center gap-2">
      <input
        type="checkbox"
        :checked="componentProps.checked"
        :disabled="componentProps.disabled"
        class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <label class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
        {{ componentProps.label || 'Checkbox' }}
      </label>
    </div>

    <!-- Radio Component -->
    <div v-else-if="component === 'radio'" class="space-y-2">
      <div v-for="option in (componentProps.options || '').split(',').map(o => o.trim())" :key="option" class="flex items-center gap-2">
        <input
          type="radio"
          :name="componentProps.name || 'radio-group'"
          :value="option"
          class="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
        />
        <label class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
          {{ option }}
        </label>
      </div>
    </div>

    <!-- Textarea Component -->
    <div v-else-if="component === 'textarea'" class="w-full max-w-md">
      <label v-if="componentProps.label" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
        {{ componentProps.label }}
        <span v-if="componentProps.required" class="text-red-500 ml-1">*</span>
      </label>
      <textarea
        :rows="componentProps.rows || 4"
        :placeholder="componentProps.placeholder || ''"
        :required="componentProps.required"
        :disabled="componentProps.disabled"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
        :class="isDarkMode 
          ? 'border-gray-600 bg-slate-700 text-white' 
          : 'border-gray-300 bg-white text-gray-900'"
      ></textarea>
    </div>

    <!-- Badge Component -->
    <div v-else-if="component === 'badge'" class="flex items-center gap-4">
      <span
        :class="[
          'px-3 py-1 rounded-full text-xs font-medium',
          componentProps.variant === 'success' ? 'bg-green-100 text-green-800' :
          componentProps.variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          componentProps.variant === 'error' ? 'bg-red-100 text-red-800' :
          componentProps.variant === 'info' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800',
          componentProps.size === 'sm' ? 'text-xs px-2 py-0.5' :
          componentProps.size === 'lg' ? 'text-sm px-4 py-1.5' :
          ''
        ]"
      >
        {{ componentProps.label || 'Badge' }}
      </span>
    </div>

    <!-- Alert Component -->
    <div v-else-if="component === 'alert'" class="w-full max-w-md">
      <div
        :class="[
          'rounded-lg p-4 flex items-start gap-3',
          componentProps.variant === 'success' ? 'bg-green-50 border border-green-200' :
          componentProps.variant === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
          componentProps.variant === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        ]"
      >
        <span class="material-symbols-outlined flex-shrink-0 mt-0.5"
          :class="componentProps.variant === 'success' ? 'text-green-600' :
                  componentProps.variant === 'warning' ? 'text-yellow-600' :
                  componentProps.variant === 'error' ? 'text-red-600' :
                  'text-blue-600'"
        >
          {{ componentProps.variant === 'success' ? 'check_circle' :
             componentProps.variant === 'warning' ? 'warning' :
             componentProps.variant === 'error' ? 'error' :
             'info' }}
        </span>
        <div class="flex-1">
          <h4 v-if="componentProps.title" class="font-semibold mb-1"
            :class="componentProps.variant === 'success' ? 'text-green-900' :
                    componentProps.variant === 'warning' ? 'text-yellow-900' :
                    componentProps.variant === 'error' ? 'text-red-900' :
                    'text-blue-900'"
          >
            {{ componentProps.title }}
          </h4>
          <p class="text-sm"
            :class="componentProps.variant === 'success' ? 'text-green-800' :
                    componentProps.variant === 'warning' ? 'text-yellow-800' :
                    componentProps.variant === 'error' ? 'text-red-800' :
                    'text-blue-800'"
          >
            {{ componentProps.message || 'Alert message' }}
          </p>
        </div>
        <button v-if="componentProps.dismissible" class="flex-shrink-0 p-1 rounded hover:bg-black/10">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  component: {
    type: String,
    required: true
  },
  props: {
    type: Object,
    default: () => ({})
  },
  isDarkMode: {
    type: Boolean,
    default: false
  }
});

const isDarkMode = computed(() => props.isDarkMode || document.documentElement.classList.contains('dark'));

// Create a computed property to ensure reactivity
const componentProps = computed(() => props.props);

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

