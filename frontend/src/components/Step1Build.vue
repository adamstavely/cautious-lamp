<template>
  <div>
    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <!-- Actions Bar -->
    <div class="flex flex-wrap items-end justify-end gap-3 mb-6">
      <div class="mr-auto w-64">
        <UiInput :model-value="paletteName" label="Palette name" placeholder="My Palette" @update:model-value="setPaletteName" />
      </div>
      <UiButton icon="upload" @click="triggerFileInput">Import palette</UiButton>
      <UiButton variant="danger" icon="delete" @click="clearPalette">Clear palette</UiButton>
      <input ref="fileInput" type="file" accept=".json" class="hidden" aria-label="Palette file" @change="handleFileImport" />
    </div>

    <!-- Color Cards Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8 relative">
      <!-- Existing Color Cards -->
      <div
        v-for="(color, index) in palette.colors"
        :key="`color-${index}`"
        :ref="el => { if (el) cardRefs[index] = el }"
        class="color-card"
        :class="{ 'opacity-50': draggedIndex === index, 'border-accent': dragOverIndex === index }"
        @dragover.prevent="handleDragOver(index, $event)"
        @drop="handleDrop(index, $event)"
      >
        <!-- Drag Handle -->
        <div
          draggable="true"
          class="absolute top-2 right-2 z-10 cursor-move p-1 rounded-control bg-surface-overlay text-ink-secondary shadow-control"
          title="Drag to reorder"
          @dragstart="handleDragStart(index, $event)"
          @dragend="handleDragEnd"
        >
          <span class="material-symbols-outlined text-base" aria-hidden="true">drag_handle</span>
        </div>

        <!-- Color Swatch -->
        <UiColorSample
          tag="button"
          class="block w-full h-32 cursor-pointer"
          :color="color.hex"
          :aria-label="`Edit color ${color.hex}`"
          @click="openColorPicker(index, $event)"
        />

        <!-- Color Info -->
        <div class="p-4 space-y-2">
          <UiInput
            :model-value="color.name || ''"
            placeholder="Color name..."
            :aria-label="`Name for ${color.hex}`"
            @update:model-value="updateColorName(index, $event)"
            @click.stop
          />

          <div class="flex items-center justify-between">
            <span class="font-code text-sm font-semibold text-ink-strong">{{ color.hex }}</span>
            <div class="flex items-center gap-1">
              <UiButton variant="ghost" size="sm" icon="content_copy" icon-only :label="`Copy hex code ${color.hex}`" @click.stop="copyToClipboard(color.hex)" />
              <UiButton variant="ghost" size="sm" icon="delete" icon-only :label="`Delete color ${color.hex}`" @click.stop="removeColor(index)" />
            </div>
          </div>

          <UiSelect
            :model-value="color.role || ''"
            :options="roleOptions"
            :aria-label="`Role for ${color.hex}`"
            @update:model-value="updateRole(index, $event)"
            @click.stop
          />
        </div>
      </div>

      <!-- Add New Color Card -->
      <div ref="addCardRef" class="add-card">
        <button type="button" class="add-card-pick" @click="openColorPicker(null, $event)">
          <span class="absolute inset-0 bg-checkered opacity-20" aria-hidden="true"></span>
          <span class="relative z-10 text-center">
            <span class="material-symbols-outlined text-4xl text-ink-muted mb-2" aria-hidden="true">format_color_fill</span>
            <span class="block text-sm font-medium text-ink">Click to Pick Color</span>
            <span class="block text-xs mt-1 text-ink-secondary">Colors auto-add when selected</span>
          </span>
        </button>

        <div class="p-4">
          <UiInput
            v-model="colorInput"
            mono
            :placeholder="placeholders.add"
            aria-label="Add a hex color, then press Enter"
            @keyup.enter="addColor"
            @click.stop
          />
        </div>
      </div>
    </div>

    <!-- Smart Suggestions -->
    <section v-if="suggestions.length > 0" class="mb-8" aria-labelledby="smart-suggestions-heading">
      <div class="flex items-center justify-between mb-4">
        <h3 id="smart-suggestions-heading" class="text-lg font-semibold text-ink-strong">✨ Smart suggestions</h3>
        <UiButton variant="ghost" size="sm" icon="refresh" @click="regenerateSuggestions">Regenerate</UiButton>
      </div>

      <div v-for="group in suggestionGroups" :key="group.title" class="mb-6">
        <template v-if="group.items.length > 0">
          <h4 class="text-sm font-medium text-ink mb-3">{{ group.title }}</h4>
          <ul class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <li v-for="(suggestion, index) in group.items" :key="`${suggestion.type}-${index}`" class="group relative">
              <UiColorSample
                tag="button"
                class="block w-full h-24 rounded-tile shadow-control transition-transform hover:scale-105 mb-2"
                :color="suggestion.hex"
                :aria-label="`Add ${suggestion.type.replace('-', ' ')} suggestion ${suggestion.hex}`"
                @click="addSuggestion(suggestion)"
              />
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-ink-secondary capitalize flex-1">{{ suggestion.type.replace('-', ' ') }}</span>
                <UiButton
                  variant="ghost"
                  size="sm"
                  icon="refresh"
                  icon-only
                  :label="`Regenerate the ${suggestion.type.replace('-', ' ')} color`"
                  class="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                  @click.stop="regenerateSuggestion(suggestion.type)"
                />
              </div>
              <p class="text-xs text-ink-muted">{{ suggestion.reason }}</p>
            </li>
          </ul>
        </template>
      </div>
    </section>

    <!-- Advanced Palette Tools -->
    <AdvancedPaletteTools
      :palette="palette"
      @update-palette="updatePalette"
      @update-generated-data="handleGeneratedData"
    />

    <!-- Instructions -->
    <p class="mt-8 pt-6 border-t border-line-faint text-sm text-ink-secondary">
      Click any color or the + box to open the native color spectrum. Use hex codes or the eyedropper tool. Drag colors to reorder them.
    </p>

    <!-- Floating Color Picker -->
    <div v-if="showColorPicker" ref="colorPickerContainerRef" class="color-picker" role="dialog" aria-label="Color picker">
      <div class="w-64 space-y-4">
        <!-- Gradient/Hue Selector -->
        <div class="relative">
          <canvas
            ref="gradientCanvas"
            width="256"
            height="200"
            class="w-full h-48 rounded-tile cursor-crosshair border border-line"
            aria-label="Saturation and lightness"
            @mousedown="startGradientDrag"
            @click="handleGradientClick"
          ></canvas>
          <div class="picker-selector" aria-hidden="true"></div>
        </div>

        <!-- Hue Slider -->
        <div>
          <p class="block text-xs font-medium text-ink mb-1">Hue</p>
          <div class="relative h-8">
            <canvas
              ref="hueCanvas"
              width="256"
              height="32"
              class="w-full h-8 rounded-control cursor-pointer border border-line"
              aria-label="Hue"
              @click="handleHueClick"
            ></canvas>
            <div class="picker-hue-marker" aria-hidden="true"></div>
          </div>
        </div>

        <!-- RGB Inputs -->
        <div class="grid grid-cols-3 gap-2">
          <UiInput
            v-for="field in rgbFields"
            :key="field.key"
            type="number"
            :label="field.label"
            :model-value="rgbValues[field.key]"
            min="0"
            max="255"
            @update:model-value="setRgb(field.key, $event)"
          />
        </div>

        <!-- Hex Input -->
        <UiInput :model-value="hexInput" label="Hex" mono :placeholder="placeholders.hex" @update:model-value="setHex" />

        <!-- CMYK Inputs -->
        <div class="grid grid-cols-4 gap-2">
          <UiInput
            v-for="field in cmykFields"
            :key="field.key"
            type="number"
            :label="field.label"
            :model-value="cmykValues[field.key]"
            min="0"
            max="100"
            step="0.1"
            @update:model-value="setCmyk(field.key, $event)"
          />
        </div>

        <!-- Color Preview -->
        <div class="flex items-center gap-3">
          <UiSwatch :color="currentHex" size="lg" :label="`Selected color ${currentHex}`" />
          <div class="flex-1">
            <div class="text-sm font-code font-semibold text-ink-strong">{{ currentHex }}</div>
            <div class="text-xs text-ink-secondary">RGB({{ rgbValues.r }}, {{ rgbValues.g }}, {{ rgbValues.b }})</div>
            <div class="text-xs text-ink-secondary">
              CMYK({{ Math.round(cmykValues.c) }}, {{ Math.round(cmykValues.m) }}, {{ Math.round(cmykValues.y) }}, {{ Math.round(cmykValues.k) }})
            </div>
          </div>
        </div>

        <!-- Eyedropper Button -->
        <UiButton class="w-full justify-center" icon="colorize" @click="toggleEyedropper">Use eyedropper</UiButton>

        <!-- Buttons -->
        <div class="flex gap-2">
          <UiButton variant="primary" class="flex-1 justify-center" @click="applyColor">Apply</UiButton>
          <UiButton class="flex-1 justify-center" @click="closeColorPicker">Cancel</UiButton>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-end mt-8">
      <UiButton variant="primary" trailing-icon="arrow_forward" :disabled="palette.colors.length === 0" @click="$emit('next')">
        Next: Harmony check
      </UiButton>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import apiClient from '../services/api.js';
import AdvancedPaletteTools from './AdvancedPaletteTools.vue';
import InlineNotice from './InlineNotice.vue';
import { UiButton, UiInput, UiSelect, UiSwatch } from './ui';
import UiColorSample from './ui/UiColorSample.vue';
import { useNotice } from '../composables/useNotice.js';

const { notice, showNotice, clearNotice } = useNotice();

// Example values shown in the empty hex fields
const placeholders = { add: '#ffffff', hex: '#000000' };

const props = defineProps({
  palette: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update-palette', 'next', 'update-generated-data']);

const colorInput = ref('');
const suggestions = ref([]);
const fileInput = ref(null);
const colorPickerInput = ref(null);

// Handle generated data from AdvancedPaletteTools
const handleGeneratedData = (data) => {
  emit('update-generated-data', data);
};
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

const setPaletteName = (value) => {
  paletteName.value = value;
  updatePaletteName();
};

// The picker's number and hex fields update the colour as they change
const setRgb = (channel, value) => {
  rgbValues.value = { ...rgbValues.value, [channel]: value };
  updateFromRGB();
};
const setCmyk = (channel, value) => {
  cmykValues.value = { ...cmykValues.value, [channel]: value };
  updateFromCMYK();
};
const setHex = (value) => {
  hexInput.value = value;
  updateFromHex();
};

const rgbFields = [
  { key: 'r', label: 'R' },
  { key: 'g', label: 'G' },
  { key: 'b', label: 'B' },
];
const cmykFields = [
  { key: 'c', label: 'C' },
  { key: 'm', label: 'M' },
  { key: 'y', label: 'Y' },
  { key: 'k', label: 'K' },
];
const roleOptions = [
  { value: '', label: 'Select role...' },
  { value: 'hero', label: 'Hero' },
  { value: 'accent', label: 'Accent' },
  { value: 'neutral', label: 'Neutral' },
];

// Picker placement and markers, computed from pointer positions (reach CSS via v-bind)
const pickerLeft = computed(() => colorPickerStyle.value.left || '0px');
const pickerTop = computed(() => colorPickerStyle.value.top || '0px');
const pickerWidth = computed(() => colorPickerStyle.value.width || '280px');
const selectorLeft = computed(() => selectorStyle.value.left);
const selectorTop = computed(() => selectorStyle.value.top);
const hueLeft = computed(() => `${huePosition.value}%`);

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
    showNotice('Please enter a valid hex color (e.g., #FF5733 or FF5733)', 'error');
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
    const response = await apiClient.post(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/palettes/suggestions`, {
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
          showNotice('Invalid palette file format', 'error');
        }
    } catch (error) {
      showNotice('Error reading palette file', 'error');
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
  
  // Get card position (getBoundingClientRect returns viewport coordinates)
  const rect = cardElement.getBoundingClientRect();
  
  // Calculate position - place it to the right of the card
  const gap = 16; // gap-4 = 16px
  const pickerWidth = 280; // Width of color picker
  const pickerHeight = 600; // Approximate height of color picker (including padding)
  
  let left = rect.right + gap;
  let top = rect.top;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth) {
    left = rect.left - pickerWidth - gap;
  }
  
  // Ensure it doesn't go off-screen horizontally
  left = Math.max(16, Math.min(left, window.innerWidth - pickerWidth - 16));
  
  // Ensure it doesn't go off-screen vertically
  const viewportHeight = window.innerHeight;
  const maxTop = viewportHeight - pickerHeight - 16; // 16px padding from bottom
  top = Math.max(16, Math.min(top, maxTop));
  
  // If it would still go off the bottom, position it above the card instead
  if (top + pickerHeight > viewportHeight) {
    top = rect.top - pickerHeight - gap;
    // If that would go off the top, center it vertically in the viewport
    if (top < 16) {
      top = Math.max(16, (viewportHeight - pickerHeight) / 2);
    }
  }
  
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
          showNotice('Eyedropper feature is not available in your browser', 'error');
        }
      });
  } else {
    showNotice('Eyedropper API is not supported in your browser. Please use Chrome or Edge.', 'warning');
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotice(`Copied ${text}`, 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Could not copy to the clipboard.', 'error');
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

const suggestionGroups = computed(() => [
  { title: 'Color harmony', items: colorSuggestions.value },
  { title: 'Neutrals', items: neutralSuggestions.value },
]);

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
.color-card {
  @apply relative overflow-hidden rounded-tile border border-line-faint bg-surface-raised shadow-control transition-all hover:shadow-card-hover;
}
.add-card {
  @apply overflow-hidden rounded-tile border-2 border-dashed border-line-control bg-surface-sunken transition-colors hover:border-accent-border;
}
.add-card-pick {
  @apply relative flex w-full h-32 items-center justify-center cursor-pointer hover:bg-fill-hover focus-visible:outline focus-visible:outline-2 outline-focus;
}
.bg-checkered {
  background-image:
    linear-gradient(45deg, var(--tc-border-strong) 25%, transparent 25%),
    linear-gradient(-45deg, var(--tc-border-strong) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--tc-border-strong) 75%),
    linear-gradient(-45deg, transparent 75%, var(--tc-border-strong) 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0px;
}
.color-picker {
  @apply fixed z-50 rounded-tile border border-line-faint bg-surface-overlay shadow-overlay p-4;
  left: v-bind(pickerLeft);
  top: v-bind(pickerTop);
  width: v-bind(pickerWidth);
}
.picker-selector {
  @apply absolute w-4 h-4 -ml-2 -mt-2 rounded-pill border-2 border-surface shadow-overlay pointer-events-none;
  left: v-bind(selectorLeft);
  top: v-bind(selectorTop);
}
.picker-hue-marker {
  @apply absolute top-0 h-8 w-1 border border-ink-strong pointer-events-none;
  left: v-bind(hueLeft);
}
</style>
