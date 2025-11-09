<template>
  <div class="relative" ref="datePickerRef">
    <!-- Hidden native date input for programmatic access -->
    <input
      ref="dateInputRef"
      type="date"
      :value="modelValue"
      :min="min"
      :max="max"
      @input="handleDateChange"
      @change="handleDateChange"
      class="absolute opacity-0 pointer-events-none w-0 h-0"
      tabindex="-1"
    />
    
    <!-- Visible button that triggers the native picker -->
    <button
      type="button"
      @click="openNativePicker"
      :class="[
        'px-3 py-1.5 border rounded-lg text-sm text-left flex items-center justify-between w-full',
        isDarkMode.value 
          ? 'bg-slate-700 border-gray-600 text-gray-100 hover:border-gray-500' 
          : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
      ]"
    >
      <span>{{ displayValue || placeholder }}</span>
      <span class="material-symbols-outlined text-base">calendar_today</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select date'
  },
  min: {
    type: String,
    default: ''
  },
  max: {
    type: String,
    default: ''
  },
  isDarkMode: {
    type: Boolean,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const datePickerRef = ref(null);
const dateInputRef = ref(null);
const localDarkMode = ref(document.documentElement.classList.contains('dark'));

const isDarkMode = computed(() => {
  return props.isDarkMode !== null ? props.isDarkMode : localDarkMode.value;
});

const displayValue = computed(() => {
  if (!props.modelValue) return '';
  const date = new Date(props.modelValue);
  return date.toLocaleDateString();
});

const openNativePicker = () => {
  // Programmatically trigger the native date picker
  if (!dateInputRef.value) return;
  
  try {
    // Use showPicker() if available (modern browsers), otherwise fall back to click()
    if (typeof dateInputRef.value.showPicker === 'function') {
      const pickerPromise = dateInputRef.value.showPicker();
      // showPicker() returns a Promise, handle it safely
      if (pickerPromise && typeof pickerPromise.then === 'function') {
        pickerPromise.catch(() => {
          // Fallback if showPicker fails (e.g., user cancels or browser doesn't support it)
          dateInputRef.value?.click();
        });
      }
    } else {
      // Fallback for browsers that don't support showPicker()
      dateInputRef.value.click();
    }
  } catch (error) {
    // If anything fails, fall back to click()
    dateInputRef.value?.click();
  }
};

const handleDateChange = (event) => {
  emit('update:modelValue', event.target.value);
};

let darkModeObserver = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    localDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
});
</script>

