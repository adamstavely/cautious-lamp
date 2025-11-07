<template>
  <div class="relative" ref="dropdownRef">
    <button
      type="button"
      @click="toggleDropdown"
      :class="[
        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-left flex items-center justify-between',
        isOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : '',
        computedDarkMode 
          ? (isOpen ? 'border-indigo-400 ring-indigo-400 focus:ring-indigo-400 focus:border-indigo-400 bg-slate-700 text-gray-100 border-slate-600' : 'border-slate-600 bg-slate-700 text-gray-100')
          : (isOpen ? 'border-indigo-500 ring-indigo-500 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 border-gray-300' : 'border-gray-300 bg-white text-gray-900')
      ]"
    >
      <span>{{ selectedLabel }}</span>
      <span class="material-symbols-outlined text-lg transition-transform" :class="{ 'rotate-180': isOpen }">
        expand_more
      </span>
    </button>
    
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 w-full border rounded-lg shadow-lg max-h-60 overflow-auto"
        :class="computedDarkMode 
          ? 'bg-slate-700 border-slate-600' 
          : 'bg-white border-gray-300'"
      >
        <div
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option)"
            :class="[
            'px-4 py-2 cursor-pointer text-sm transition-colors',
            option.value === modelValue
              ? (computedDarkMode 
                ? 'bg-indigo-900/20 text-indigo-400 font-medium' 
                : 'bg-indigo-50 text-indigo-600 font-medium')
              : (computedDarkMode 
                ? 'text-gray-100 hover:bg-slate-600' 
                : 'text-gray-900 hover:bg-gray-50')
          ]"
        >
          {{ option.label }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  options: {
    type: Array,
    required: true,
    validator: (options) => {
      return options.every(opt => opt.value !== undefined && opt.label !== undefined);
    }
  },
  isDarkMode: {
    type: Boolean,
    default: null  // null means auto-detect
  },
  label: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const dropdownRef = ref(null);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

// Use prop if provided, otherwise auto-detect
const computedDarkMode = computed(() => {
  return props.isDarkMode !== null ? props.isDarkMode : isDarkMode.value;
});

const selectedLabel = computed(() => {
  const option = props.options.find(opt => opt.value === props.modelValue);
  return option ? option.label : '';
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  
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
  document.removeEventListener('click', handleClickOutside);
  
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

