<template>
  <div class="version-selector-wrapper mb-4">
    <div class="relative">
      <label 
        for="version-select" 
        class="version-select-label"
        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
      >
        Select Version
      </label>
      <v-menu
        v-model="menuOpen"
        :close-on-content-click="true"
        location="bottom"
        :offset="0"
        class="version-select-menu"
        :width="menuWidth"
      >
        <template #activator="{ props }">
          <button
            ref="buttonRef"
            v-bind="props"
            class="version-select-button"
            :class="{ 
              'version-select-button--focused': menuOpen,
              'version-select-button--dark': isDarkMode,
              'version-select-button--light': !isDarkMode
            }"
          >
            <span class="version-select-button-text">{{ selectedLabel }}</span>
            <div class="version-select-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        </template>
        <v-list 
          class="version-select-dropdown"
          :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
          :style="isDarkMode 
            ? 'background-color: #1e293b !important; opacity: 1 !important;' 
            : 'background-color: #ffffff !important; opacity: 1 !important;'"
        >
          <v-list-item
            v-for="version in versions"
            :key="version.id"
            :value="version.id"
            :active="modelValue === version.id"
            @click="handleSelect(version.id)"
            class="version-select-option"
          >
            <v-list-item-title 
              :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'"
            >
              {{ version.label }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

// Check if dark mode is active - make it reactive
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

// Watch for dark class changes on html element using MutationObserver
let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Set up dark mode observer
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Also check periodically as a fallback
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  // Check immediately
  checkDarkMode();
  
  // Check every 100ms as fallback
  darkModeInterval = setInterval(checkDarkMode, 100);
  
  updateMenuWidth();
  window.addEventListener('resize', updateMenuWidth);
});

onUnmounted(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
  window.removeEventListener('resize', updateMenuWidth);
});

const props = defineProps({
  modelValue: String,
  versions: {
    type: Array,
    required: true,
  },
});
const emit = defineEmits(['update:modelValue']);

const menuOpen = ref(false);
const menuWidth = ref(0);
const buttonRef = ref(null);

const selectedLabel = computed(() => {
  const selected = props.versions.find(v => v.id === props.modelValue);
  return selected ? selected.label : 'Select Version';
});

const updateMenuWidth = () => {
  if (buttonRef.value) {
    // Get the actual width including padding and borders
    const rect = buttonRef.value.getBoundingClientRect();
    menuWidth.value = rect.width;
  }
};

// Watch for menu opening to update width
watch(menuOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    updateMenuWidth();
  }
});

const handleSelect = (value) => {
  emit('update:modelValue', value);
  menuOpen.value = false;
};
</script>

<style scoped>
.version-select-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.version-select-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.875rem;
  border-radius: 0.5rem;
  border: 1px solid;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.version-select-button--light {
  background-color: #ffffff;
  border-color: #d1d5db;
  color: #111827;
}

.version-select-button--light:hover {
  border-color: #6366f1;
  background-color: #f9fafb;
}

.version-select-button--dark {
  background-color: #1e293b;
  border-color: #475569;
  color: #f1f5f9;
}

.version-select-button--dark:hover {
  border-color: #818cf8;
  background-color: #334155;
}

.version-select-button--focused {
  outline: 2px solid;
  outline-offset: 2px;
}

.version-select-button--focused.version-select-button--light {
  outline-color: #6366f1;
  border-color: #6366f1;
}

.version-select-button--focused.version-select-button--dark {
  outline-color: #818cf8;
  border-color: #818cf8;
}

.version-select-button-text {
  flex: 1;
  text-align: left;
}

.version-select-icon {
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.version-selector-wrapper {
  position: relative;
  z-index: 10000;
}

.version-select-menu {
  z-index: 9999 !important;
}

.version-select-dropdown {
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  background-color: #ffffff !important;
  opacity: 1 !important;
}

.dark .version-select-dropdown {
  background-color: #1e293b !important;
  opacity: 1 !important;
}

.version-select-option {
  transition: background-color 0.2s;
}

.version-select-option:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.dark .version-select-option:hover {
  background-color: rgba(129, 140, 248, 0.2);
}

.version-select-option.v-list-item--active {
  background-color: rgba(99, 102, 241, 0.1);
}

.dark .version-select-option.v-list-item--active {
  background-color: rgba(129, 140, 248, 0.2);
}

:deep(.v-list-item-title) {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Ensure v-menu content has high z-index and opaque background */
:deep(.v-overlay__content) {
  z-index: 9999 !important;
}

:deep(.v-menu__content) {
  z-index: 9999 !important;
  background-color: #ffffff !important;
  opacity: 1 !important;
}

.dark :deep(.v-menu__content) {
  background-color: #1e293b !important;
  opacity: 1 !important;
}

/* Ensure list items have opaque backgrounds */
:deep(.v-list-item) {
  background-color: transparent !important;
}

.version-select-dropdown :deep(.v-list-item) {
  background-color: transparent !important;
}
</style>
