<template>
  <div>
    <!-- Actions Bar -->
    <div class="flex items-center justify-end gap-3 mb-6">
      <div class="flex items-center gap-2 mr-auto">
        <label class="text-sm text-gray-600">Palette Name:</label>
        <input
          v-model="paletteName"
          @input="updatePaletteName"
          type="text"
          placeholder="My Palette"
          class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
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
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        class="hidden"
        @change="handleFileImport"
      />
    </div>

    <!-- Color Cards Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8 relative">
      <!-- Existing Color Cards -->
      <div
        v-for="(color, index) in palette.colors"
        :key="`color-${index}`"
        :ref="el => { if (el) cardRefs[index] = el }"
        @dragover.prevent="handleDragOver(index, $event)"
        @drop="handleDrop(index, $event)"
        class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow relative"
        :class="{ 'opacity-50': draggedIndex === index, 'border-indigo-400': dragOverIndex === index }"
      >
        <!-- Drag Handle -->
        <div
          draggable="true"
          @dragstart="handleDragStart(index, $event)"
          @dragend="handleDragEnd"
          class="absolute top-2 right-2 cursor-move p-1 bg-white bg-opacity-80 rounded hover:bg-opacity-100 z-10"
          title="Drag to reorder"
        >
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
          </svg>
        </div>
        
        <!-- Color Swatch -->
        <div
          class="w-full h-32 cursor-pointer"
          :style="{ backgroundColor: color.hex }"
          @click="openColorPicker(index, $event)"
        >
        </div>
        
        <!-- Color Info -->
        <div class="p-4">
          <!-- Color Name -->
          <input
            :value="color.name || ''"
            @input="updateColorName(index, $event.target.value)"
            @click.stop
            type="text"
            placeholder="Color name..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white mb-2"
          />
          
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
        ref="addCardRef"
        class="bg-gray-50 rounded-lg shadow-md border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-gray-100 transition-all cursor-pointer overflow-hidden"
        @click="openColorPicker(null, $event)"
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

    <!-- Advanced Palette Tools -->
    <AdvancedPaletteTools
      :palette="palette"
      @update-palette="updatePalette"
    />

    <!-- Instructions -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <p class="text-sm text-gray-600">
        Click any color or the + box to open the native color spectrum. Use hex codes or the eyedropper tool. Drag colors to reorder them.
      </p>
    </div>

    <!-- Floating Color Picker -->
    <div
      v-if="showColorPicker"
      ref="colorPickerContainerRef"
      class="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4"
      :style="colorPickerStyle"
    >
      <div class="w-64">
        <!-- Gradient/Hue Selector -->
        <div class="relative mb-4">
          <canvas
            ref="gradientCanvas"
            width="256"
            height="200"
            class="w-full h-48 rounded-lg cursor-crosshair border border-gray-300"
            @mousedown="startGradientDrag"
            @click="handleGradientClick"
          ></canvas>
          <!-- Selector indicator -->
          <div
            class="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
            :style="selectorStyle"
          ></div>
        </div>
        
        <!-- Hue Slider -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 mb-1">Hue</label>
          <div class="relative h-8">
            <canvas
              ref="hueCanvas"
              width="256"
              height="32"
              class="w-full h-8 rounded cursor-pointer border border-gray-300"
              @click="handleHueClick"
            ></canvas>
            <div
              class="absolute top-0 h-8 w-1 border border-gray-800 pointer-events-none"
              :style="{ left: `${huePosition}%` }"
            ></div>
          </div>
        </div>
        
        <!-- RGB Inputs -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">R</label>
            <input
              v-model.number="rgbValues.r"
              @input="updateFromRGB"
              type="number"
              min="0"
              max="255"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">G</label>
            <input
              v-model.number="rgbValues.g"
              @input="updateFromRGB"
              type="number"
              min="0"
              max="255"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">B</label>
            <input
              v-model.number="rgbValues.b"
              @input="updateFromRGB"
              type="number"
              min="0"
              max="255"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <!-- Hex Input -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 mb-1">Hex</label>
          <input
            v-model="hexInput"
            @input="updateFromHex"
            type="text"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="#000000"
          />
        </div>
        
        <!-- CMYK Inputs -->
        <div class="grid grid-cols-4 gap-2 mb-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">C</label>
            <input
              v-model.number="cmykValues.c"
              @input="updateFromCMYK"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">M</label>
            <input
              v-model.number="cmykValues.m"
              @input="updateFromCMYK"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Y</label>
            <input
              v-model.number="cmykValues.y"
              @input="updateFromCMYK"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">K</label>
            <input
              v-model.number="cmykValues.k"
              @input="updateFromCMYK"
              type="number"
              min="0"
              max="100"
              step="0.1"
              class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        <!-- Color Preview -->
        <div class="mb-4 flex items-center gap-3">
          <div
            class="w-16 h-16 rounded-lg border-2 border-gray-300"
            :style="{ backgroundColor: currentHex }"
          ></div>
          <div class="flex-1">
            <div class="text-sm font-mono font-semibold text-gray-900">{{ currentHex }}</div>
            <div class="text-xs text-gray-500">RGB({{ rgbValues.r }}, {{ rgbValues.g }}, {{ rgbValues.b }})</div>
            <div class="text-xs text-gray-500">CMYK({{ Math.round(cmykValues.c) }}, {{ Math.round(cmykValues.m) }}, {{ Math.round(cmykValues.y) }}, {{ Math.round(cmykValues.k) }})</div>
          </div>
        </div>
        
        <!-- Eyedropper Button -->
        <div class="mb-4">
          <button
            @click="toggleEyedropper"
            class="w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined eyedropper-icon">colorize</span>
            Use Eyedropper
          </button>
        </div>
        
        <!-- Buttons -->
        <div class="flex gap-2">
          <button
            @click="applyColor"
            class="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
          <button
            @click="closeColorPicker"
            class="flex-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

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
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import AdvancedPaletteTools from './AdvancedPaletteTools.vue';

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
const paletteName = ref(props.palette.name || 'My Palette');
const showColorPicker = ref(false);
const colorPickerStyle = ref({});
const cardRefs = ref({});
const addCardRef = ref(null);
const colorPickerContainerRef = ref(null);
const gradientCanvas = ref(null);
const hueCanvas = ref(null);
const currentHex = ref('#000000');
const hexInput = ref('#000000');
const rgbValues = ref({ r: 0, g: 0, b: 0 });
const huePosition = ref(0);
const selectorStyle = ref({ left: '0%', top: '0%' });
const isDragging = ref(false);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);
const currentHue = ref(0);
const currentSaturation = ref(100);
const currentLightness = ref(50);
const cmykValues = ref({ c: 0, m: 0, y: 0, k: 100 });

const updatePaletteName = () => {
  const newPalette = {
    ...props.palette,
    name: paletteName.value || 'My Palette',
  };
  emit('update-palette', newPalette);
};

const updatePalette = (newPalette) => {
  emit('update-palette', newPalette);
};

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

const updateColorName = (index, name) => {
  const newPalette = {
    ...props.palette,
    colors: props.palette.colors.map((c, i) =>
      i === index ? { ...c, name: name || '' } : c
    ),
  };
  emit('update-palette', newPalette);
};

// Drag and drop handlers
const handleDragStart = (index, event) => {
  draggedIndex.value = index;
  isDragging.value = true;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target);
};

const handleDragOver = (index, event) => {
  event.preventDefault();
  dragOverIndex.value = index;
};

const handleDrop = (index, event) => {
  event.preventDefault();
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    const colors = [...props.palette.colors];
    const draggedColor = colors[draggedIndex.value];
    colors.splice(draggedIndex.value, 1);
    colors.splice(index, 0, draggedColor);
    
    const newPalette = {
      ...props.palette,
      colors,
    };
    emit('update-palette', newPalette);
  }
  dragOverIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  dragOverIndex.value = null;
  isDragging.value = false;
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
            name: importedPalette.name || props.palette.name || 'My Palette',
            colors: importedPalette.colors.map((c) => ({
              hex: typeof c === 'string' ? c : c.hex,
              name: c.name || '',
              role: c.role || null,
            })),
          };
          paletteName.value = newPalette.name;
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

const openColorPicker = (index, event) => {
  // Stop event propagation to prevent immediate closing
  if (event) {
    event.stopPropagation();
  }
  
  currentColorIndex.value = index;
  
  // Get the clicked card element
  let cardElement = null;
  if (index !== null) {
    cardElement = cardRefs.value[index];
  } else {
    cardElement = addCardRef.value;
  }
  
  if (!cardElement) return;
  
  // Get card position
  const rect = cardElement.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  // Calculate position - place it to the right of the card
  const cardWidth = rect.width;
  const gap = 16; // gap-4 = 16px
  const pickerWidth = 280; // Width of color picker
  
  let left = rect.right + scrollLeft + gap;
  let top = rect.top + scrollTop;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth + scrollLeft) {
    left = rect.left + scrollLeft - pickerWidth - gap;
  }
  
  // Ensure it doesn't go off-screen
  left = Math.max(16, Math.min(left, window.innerWidth + scrollLeft - pickerWidth - 16));
  top = Math.max(16, Math.min(top, window.innerHeight + scrollTop - 400));
  
  colorPickerStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${pickerWidth}px`,
  };
  
  // Set initial color value
  let initialHex = '#000000';
  if (index !== null && props.palette.colors[index]) {
    initialHex = props.palette.colors[index].hex;
  }
  
  showColorPicker.value = true;
  
  // Wait for DOM to render, then initialize
  setTimeout(() => {
    setColorFromHex(initialHex);
    drawGradientCanvas();
    drawHueCanvas();
  }, 0);
};

const closeColorPicker = () => {
  showColorPicker.value = false;
  currentColorIndex.value = null;
};

// Color conversion utilities
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const rgbToCmyk = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const k = 1 - Math.max(r, g, b);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  
  const c = ((1 - r - k) / (1 - k)) * 100;
  const m = ((1 - g - k) / (1 - k)) * 100;
  const y = ((1 - b - k) / (1 - k)) * 100;
  
  return {
    c: Math.max(0, Math.min(100, c)),
    m: Math.max(0, Math.min(100, m)),
    y: Math.max(0, Math.min(100, y)),
    k: Math.max(0, Math.min(100, k * 100))
  };
};

const cmykToRgb = (c, m, y, k) => {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;
  
  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));
  
  return {
    r: Math.max(0, Math.min(255, r)),
    g: Math.max(0, Math.min(255, g)),
    b: Math.max(0, Math.min(255, b))
  };
};

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
};

const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgb = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

const setColorFromHex = (hex) => {
  currentHex.value = hex.toUpperCase();
  hexInput.value = hex.toUpperCase();
  const rgb = hexToRgb(hex);
  rgbValues.value = { ...rgb };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  currentHue.value = hsl.h;
  currentSaturation.value = hsl.s;
  currentLightness.value = hsl.l;
  cmykValues.value = { ...cmyk };
  huePosition.value = (hsl.h / 360) * 100;
  selectorStyle.value = {
    left: `${hsl.s}%`,
    top: `${100 - hsl.l}%`,
  };
};

const updateFromHSL = () => {
  const rgb = hslToRgb(currentHue.value, currentSaturation.value, currentLightness.value);
  rgbValues.value = rgb;
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  cmykValues.value = { ...cmyk };
  currentHex.value = rgbToHex(rgb.r, rgb.g, rgb.b);
  hexInput.value = currentHex.value;
};

const updateFromRGB = () => {
  const rgb = rgbValues.value;
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  cmykValues.value = { ...cmyk };
  currentHex.value = rgbToHex(rgb.r, rgb.g, rgb.b);
  hexInput.value = currentHex.value;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  currentHue.value = hsl.h;
  currentSaturation.value = hsl.s;
  currentLightness.value = hsl.l;
  huePosition.value = (hsl.h / 360) * 100;
  selectorStyle.value = {
    left: `${hsl.s}%`,
    top: `${100 - hsl.l}%`,
  };
  drawGradientCanvas();
};

const updateFromCMYK = () => {
  const cmyk = cmykValues.value;
  const rgb = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
  rgbValues.value = rgb;
  currentHex.value = rgbToHex(rgb.r, rgb.g, rgb.b);
  hexInput.value = currentHex.value;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  currentHue.value = hsl.h;
  currentSaturation.value = hsl.s;
  currentLightness.value = hsl.l;
  huePosition.value = (hsl.h / 360) * 100;
  selectorStyle.value = {
    left: `${hsl.s}%`,
    top: `${100 - hsl.l}%`,
  };
  drawGradientCanvas();
};

const updateFromHex = () => {
  let hex = hexInput.value.trim();
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
    hexInput.value = hex;
  }
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
    // Normalize 3-digit hex
    if (hex.length === 4) {
      hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    setColorFromHex(hex);
    drawGradientCanvas();
    drawHueCanvas();
  }
};

const drawGradientCanvas = () => {
  const canvas = gradientCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Create saturation/lightness gradient
  const hue = currentHue.value;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const s = (x / width) * 100;
      const l = 100 - (y / height) * 100;
      const rgb = hslToRgb(hue, s, l);
      ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
};

const drawHueCanvas = () => {
  const canvas = hueCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Create hue gradient
  for (let x = 0; x < width; x++) {
    const hue = (x / width) * 360;
    const rgb = hslToRgb(hue, 100, 50);
    ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    ctx.fillRect(x, 0, 1, height);
  }
};

const handleGradientClick = (event) => {
  const canvas = gradientCanvas.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const width = canvas.width;
  const height = canvas.height;
  
  currentSaturation.value = (x / width) * 100;
  currentLightness.value = 100 - (y / height) * 100;
  
  selectorStyle.value = {
    left: `${(x / width) * 100}%`,
    top: `${(y / height) * 100}%`,
  };
  
  updateFromHSL();
  drawGradientCanvas();
};

const handleHueClick = (event) => {
  const canvas = hueCanvas.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const width = canvas.width;
  
  currentHue.value = (x / width) * 360;
  huePosition.value = (x / width) * 100;
  
  updateFromHSL();
  drawGradientCanvas();
};

const startGradientDrag = (event) => {
  isDragging.value = true;
  handleGradientClick(event);
  document.addEventListener('mousemove', handleGradientDrag);
  document.addEventListener('mouseup', endGradientDrag);
};

const handleGradientDrag = (event) => {
  if (isDragging.value && gradientCanvas.value) {
    const canvas = gradientCanvas.value;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(canvas.width, event.clientX - rect.left));
    const y = Math.max(0, Math.min(canvas.height, event.clientY - rect.top));
    const width = canvas.width;
    const height = canvas.height;
    
    currentSaturation.value = (x / width) * 100;
    currentLightness.value = 100 - (y / height) * 100;
    
    selectorStyle.value = {
      left: `${(x / width) * 100}%`,
      top: `${(y / height) * 100}%`,
    };
    
    updateFromHSL();
    drawGradientCanvas();
  }
};

const endGradientDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleGradientDrag);
  document.removeEventListener('mouseup', endGradientDrag);
};

const applyColor = () => {
  const hex = currentHex.value;
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
  closeColorPicker();
};

const toggleEyedropper = () => {
  if ('EyeDropper' in window) {
    const eyeDropper = new window.EyeDropper();
    eyeDropper
      .open()
      .then((result) => {
        // Ensure color is fully opaque (uppercase hex without alpha)
        let hex = result.sRGBHex.toUpperCase();
        setColorFromHex(hex);
        drawGradientCanvas();
        drawHueCanvas();
      })
      .catch((error) => {
        console.error('Eyedropper error:', error);
        // Don't show alert if user cancelled
        if (error.name !== 'AbortError') {
          alert('Eyedropper feature is not available in your browser');
        }
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

watch(() => props.palette.name, (newName) => {
  if (newName !== paletteName.value) {
    paletteName.value = newName || 'My Palette';
  }
});

// Handle click outside to close color picker
const handleClickOutside = (event) => {
  if (showColorPicker.value && colorPickerContainerRef.value) {
    // Check if click is outside the color picker container
    if (!colorPickerContainerRef.value.contains(event.target)) {
      closeColorPicker();
    }
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('mousemove', handleGradientDrag);
  document.removeEventListener('mouseup', endGradientDrag);
});
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
