<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold text-gray-900">Palette Colors</h2>
      </div>
      <div class="flex gap-3">
        <button
          @click="triggerFileInput"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Import Palette
        </button>
        <button
          @click="clearPalette"
          class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Palette
        </button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        class="hidden"
        @change="handleFileImport"
      />
    </div>

    <!-- Color Cards Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
      <!-- Existing Color Cards -->
      <div
        v-for="(color, index) in palette.colors"
        :key="index"
        class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <!-- Color Swatch -->
        <div
          class="w-full h-32 cursor-pointer"
          :style="{ backgroundColor: color.hex }"
          @click="openColorPicker(index)"
        >
        </div>
        
        <!-- Color Info -->
        <div class="p-4">
          <!-- Hex Code -->
          <div class="flex items-center justify-between mb-3">
            <div class="font-mono text-sm font-semibold text-gray-900">{{ color.hex }}</div>
            <div class="flex items-center gap-2">
              <!-- Copy Icon -->
              <button
                @click.stop="copyToClipboard(color.hex)"
                class="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy hex code"
              >
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              
              <!-- Delete Icon -->
              <button
                @click.stop="removeColor(index)"
                class="p-1 hover:bg-red-50 rounded transition-colors text-red-600"
                title="Delete color"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Role Dropdown -->
          <select
            :value="color.role || ''"
            @change="updateRole(index, $event.target.value)"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            @click.stop
          >
            <option value="">Select role...</option>
            <option value="hero">Hero</option>
            <option value="accent">Accent</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
      </div>

      <!-- Add New Color Card -->
      <div
        class="bg-gray-50 rounded-lg shadow-md border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-gray-100 transition-all cursor-pointer overflow-hidden"
        @click="openColorPicker(null)"
      >
        <!-- Color Picker Placeholder -->
        <div class="w-full h-32 flex items-center justify-center relative">
          <div class="absolute inset-0 bg-checkered opacity-20"></div>
          <div class="relative z-10 text-center">
            <svg class="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <p class="text-sm font-medium text-gray-600">Click to Pick Color</p>
            <p class="text-xs text-gray-500 mt-1">Colors auto-add when selected</p>
          </div>
        </div>
        
        <!-- Hex Input -->
        <div class="p-4">
          <input
            v-model="colorInput"
            type="text"
            placeholder="#ffffff"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
            @keyup.enter="addColor"
            @click.stop
          />
          <button
            @click.stop="toggleEyedropper"
            class="w-full mt-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined eyedropper-icon">colorize</span>
            Use Eyedropper
          </button>
        </div>
      </div>
    </div>

    <!-- Smart Suggestions -->
    <div v-if="suggestions.length > 0" class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">✨ Smart Suggestions</h3>
        <button
          @click="regenerateSuggestions"
          class="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate
        </button>
      </div>
      
      <!-- Non-Neutral Suggestions -->
      <div v-if="colorSuggestions.length > 0" class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Color Harmony</h4>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            v-for="(suggestion, index) in colorSuggestions"
            :key="`${suggestion.type}-${index}`"
            class="cursor-pointer group relative"
          >
            <div
              class="w-full h-24 rounded-lg shadow-md transition-transform hover:scale-105 mb-2"
              :style="{ backgroundColor: suggestion.hex }"
              @click="addSuggestion(suggestion)"
            ></div>
            <div class="flex items-center justify-between mb-1">
              <div class="text-xs text-gray-600 capitalize flex-1">{{ suggestion.type.replace('-', ' ') }}</div>
              <button
                @click.stop="regenerateSuggestion(suggestion.type)"
                class="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Regenerate this color"
              >
                <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div class="text-xs text-gray-500">{{ suggestion.reason }}</div>
          </div>
        </div>
      </div>

      <!-- Neutral Suggestions -->
      <div v-if="neutralSuggestions.length > 0">
        <h4 class="text-sm font-medium text-gray-700 mb-3">Neutrals</h4>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            v-for="(suggestion, index) in neutralSuggestions"
            :key="`${suggestion.type}-${index}`"
            class="cursor-pointer group relative"
          >
            <div
              class="w-full h-24 rounded-lg shadow-md transition-transform hover:scale-105 mb-2"
              :style="{ backgroundColor: suggestion.hex }"
              @click="addSuggestion(suggestion)"
            ></div>
            <div class="flex items-center justify-between mb-1">
              <div class="text-xs text-gray-600 capitalize flex-1">{{ suggestion.type.replace('-', ' ') }}</div>
              <button
                @click.stop="regenerateSuggestion(suggestion.type)"
                class="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Regenerate this color"
              >
                <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div class="text-xs text-gray-500">{{ suggestion.reason }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <p class="text-sm text-gray-600">
        Click any color or the + box to open the native color spectrum. Use hex codes or the eyedropper tool. Drag colors to reorder them.
      </p>
    </div>

    <!-- Hidden Color Input for Native Picker -->
    <input
      ref="colorPickerInput"
      type="color"
      class="hidden"
      @input="handleColorPickerChange"
    />

    <!-- Navigation -->
    <div class="flex justify-end mt-8">
      <button
        @click="$emit('next')"
        :disabled="palette.colors.length === 0"
        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Next: Harmony Check →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update-palette', 'next']);

const colorInput = ref('');
const suggestions = ref([]);
const fileInput = ref(null);
const colorPickerInput = ref(null);
const currentColorIndex = ref(null);
const isEyedropperActive = ref(false);

// Separate suggestions into neutrals and colors
const neutralSuggestions = computed(() => {
  return suggestions.value.filter(s => s.type === 'light-neutral' || s.type === 'dark-neutral');
});

const colorSuggestions = computed(() => {
  return suggestions.value.filter(s => s.type !== 'light-neutral' && s.type !== 'dark-neutral');
});

// Auto-append '#' to hex input
watch(colorInput, (newValue) => {
  if (newValue && !newValue.startsWith('#')) {
    colorInput.value = '#' + newValue.replace(/^#+/, '');
  }
});

const addColor = () => {
  let hex = colorInput.value.trim().toUpperCase();
  
  // Auto-append '#' if missing
  if (hex && !hex.startsWith('#')) {
    hex = '#' + hex;
  }
  
  // Normalize 3-digit hex to 6-digit
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  
  if (isValidHex(hex)) {
    const newPalette = {
      ...props.palette,
      colors: [...props.palette.colors, { hex, name: '', role: null }],
    };
    emit('update-palette', newPalette);
    colorInput.value = '';
    fetchSuggestions();
  } else {
    alert('Please enter a valid hex color (e.g., #FF5733 or FF5733)');
  }
};

const removeColor = (index) => {
  const newPalette = {
    ...props.palette,
    colors: props.palette.colors.filter((_, i) => i !== index),
  };
  emit('update-palette', newPalette);
  fetchSuggestions();
};

const clearPalette = () => {
  if (confirm('Are you sure you want to clear all colors?')) {
    const newPalette = {
      ...props.palette,
      colors: [],
    };
    emit('update-palette', newPalette);
    suggestions.value = [];
  }
};

const addSuggestion = (suggestion) => {
  const newPalette = {
    ...props.palette,
    colors: [...props.palette.colors, { hex: suggestion.hex, name: '', role: null }],
  };
  emit('update-palette', newPalette);
  fetchSuggestions();
};

const updateRole = (index, role) => {
  const newPalette = {
    ...props.palette,
    colors: props.palette.colors.map((c, i) =>
      i === index ? { ...c, role: role || null } : c
    ),
  };
  emit('update-palette', newPalette);
};

const isValidHex = (hex) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

const fetchSuggestions = async (regenerateType = null) => {
  if (props.palette.colors.length === 0) {
    suggestions.value = [];
    return;
  }

  try {
    const colors = props.palette.colors.map((c) => c.hex);
    const response = await axios.post('http://localhost:3000/api/palettes/suggestions', {
      colors,
      regenerateType: regenerateType || undefined,
    });
    
    if (regenerateType) {
      // Replace only the specific suggestion type
      const newSuggestion = response.data[0];
      if (newSuggestion) {
        suggestions.value = suggestions.value.map(s => 
          s.type === regenerateType ? newSuggestion : s
        );
      }
    } else {
      // Replace all suggestions
      suggestions.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error);
  }
};

const regenerateSuggestions = () => {
  fetchSuggestions();
};

const regenerateSuggestion = (type) => {
  fetchSuggestions(type);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedPalette = JSON.parse(e.target.result);
      if (importedPalette.colors && Array.isArray(importedPalette.colors)) {
        const newPalette = {
          ...props.palette,
          colors: importedPalette.colors.map((c) => ({
            hex: typeof c === 'string' ? c : c.hex,
            name: c.name || '',
            role: c.role || null,
          })),
        };
        emit('update-palette', newPalette);
        fetchSuggestions();
      } else {
        alert('Invalid palette file format');
      }
    } catch (error) {
      alert('Error reading palette file');
      console.error(error);
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // Reset file input
};

const openColorPicker = (index) => {
  currentColorIndex.value = index;
  if (index !== null && props.palette.colors[index]) {
    colorPickerInput.value.value = props.palette.colors[index].hex;
  }
  colorPickerInput.value?.click();
};

const handleColorPickerChange = (event) => {
  let hex = event.target.value.toUpperCase();
  
  // Ensure color is fully opaque (remove any alpha channel if present)
  // Hex colors from color picker are always 6-digit without alpha, but ensure uppercase
  if (currentColorIndex.value !== null) {
    // Update existing color
    const newPalette = {
      ...props.palette,
      colors: props.palette.colors.map((c, i) =>
        i === currentColorIndex.value ? { ...c, hex } : c
      ),
    };
    emit('update-palette', newPalette);
  } else {
    // Add new color
    const newPalette = {
      ...props.palette,
      colors: [...props.palette.colors, { hex, name: '', role: null }],
    };
    emit('update-palette', newPalette);
    fetchSuggestions();
  }
  currentColorIndex.value = null;
};

const toggleEyedropper = () => {
  if ('EyeDropper' in window) {
    const eyeDropper = new window.EyeDropper();
    eyeDropper
      .open()
      .then((result) => {
        // Ensure color is fully opaque (uppercase hex without alpha)
        let hex = result.sRGBHex.toUpperCase();
        const newPalette = {
          ...props.palette,
          colors: [...props.palette.colors, { hex, name: '', role: null }],
        };
        emit('update-palette', newPalette);
        fetchSuggestions();
      })
      .catch((error) => {
        console.error('Eyedropper error:', error);
        alert('Eyedropper feature is not available in your browser');
      });
  } else {
    alert('Eyedropper API is not supported in your browser. Please use Chrome or Edge.');
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

watch(() => props.palette.colors, fetchSuggestions, { immediate: true });
</script>

<style scoped>
.bg-checkered {
  background-image: 
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0px;
}

.eyedropper-icon {
  font-size: 1rem;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
