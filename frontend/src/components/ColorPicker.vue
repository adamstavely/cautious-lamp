<template>
  <div
    v-if="show"
    ref="colorPickerContainerRef"
    role="dialog"
    aria-modal="true"
    aria-labelledby="color-picker-title"
    :class="[
      'fixed z-50 rounded-lg shadow-xl border p-4',
      isDarkMode 
        ? 'bg-slate-800 border-gray-700' 
        : 'bg-white border-gray-200'
    ]"
    :style="safePickerStyle"
    @click.stop
    @keydown.esc="cancel"
    tabindex="-1"
  >
    <div class="w-64">
      <h2 id="color-picker-title" class="sr-only">Color Picker</h2>
      <!-- Gradient/Hue Selector -->
      <div class="relative mb-4">
        <label for="gradient-canvas" class="sr-only">Saturation and Lightness Selector</label>
        <canvas
          id="gradient-canvas"
          ref="gradientCanvas"
          width="256"
          height="200"
          role="img"
          :aria-label="`Saturation and lightness selector. Current saturation: ${Math.round(currentSaturation)}%, lightness: ${Math.round(currentLightness)}%`"
          :class="[
            'w-full h-48 rounded-lg cursor-crosshair border focus:outline-none focus:ring-2 focus:ring-indigo-500',
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          ]"
          @mousedown="startGradientDrag"
          @click="handleGradientClick"
          @keydown="handleGradientKeydown"
          tabindex="0"
        ></canvas>
        <!-- Selector indicator -->
        <div
          class="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
          :style="selectorStyle"
        ></div>
      </div>
      
      <!-- Hue Slider -->
      <div class="mb-4">
        <label for="hue-canvas" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">Hue</label>
        <div class="relative h-8">
          <canvas
            id="hue-canvas"
            ref="hueCanvas"
            width="256"
            height="32"
            role="slider"
            :aria-label="`Hue selector. Current hue: ${Math.round(currentHue)} degrees`"
            :aria-valuemin="0"
            :aria-valuemax="360"
            :aria-valuenow="Math.round(currentHue)"
            :class="[
              'w-full h-8 rounded cursor-pointer border focus:outline-none focus:ring-2 focus:ring-indigo-500',
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            ]"
            @click="handleHueClick"
            @keydown="handleHueKeydown"
            tabindex="0"
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
          <label for="rgb-r-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">R</label>
          <input
            id="rgb-r-input"
            v-model.number="rgbValues.r"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            aria-label="Red value"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="rgb-g-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">G</label>
          <input
            id="rgb-g-input"
            v-model.number="rgbValues.g"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            aria-label="Green value"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="rgb-b-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">B</label>
          <input
            id="rgb-b-input"
            v-model.number="rgbValues.b"
            @input="updateFromRGB"
            type="number"
            min="0"
            max="255"
            aria-label="Blue value"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
      </div>
      
      <!-- Hex Input -->
      <div class="mb-4">
        <label for="hex-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">Hex</label>
        <input
          id="hex-input"
          v-model="hexInput"
          @input="updateFromHex"
          type="text"
          aria-label="Hex color value"
          pattern="^#[0-9A-Fa-f]{6}$"
          :class="[
            'w-full px-2 py-1 text-sm border rounded font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            isDarkMode 
              ? 'border-gray-600 bg-slate-700 text-white' 
              : 'border-gray-300 bg-white text-gray-900'
          ]"
          placeholder="#000000"
        />
      </div>
      
      <!-- CMYK Inputs -->
      <div class="grid grid-cols-4 gap-2 mb-4">
        <div>
          <label for="cmyk-c-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">C</label>
          <input
            id="cmyk-c-input"
            v-model.number="cmykValues.c"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            aria-label="Cyan value"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="cmyk-m-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">M</label>
          <input
            id="cmyk-m-input"
            v-model.number="cmykValues.m"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            aria-label="Magenta value"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="cmyk-y-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">Y</label>
          <input
            id="cmyk-y-input"
            v-model.number="cmykValues.y"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            aria-label="Yellow value"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
        <div>
          <label for="cmyk-k-input" :class="['block text-xs font-medium mb-1', isDarkMode ? 'text-gray-300' : 'text-gray-700']">K</label>
          <input
            id="cmyk-k-input"
            v-model.number="cmykValues.k"
            @input="updateFromCMYK"
            type="number"
            min="0"
            max="100"
            step="0.1"
            aria-label="Key (black) value"
            :class="[
              'w-full px-2 py-1 text-sm border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              isDarkMode 
                ? 'border-gray-600 bg-slate-700 text-white' 
                : 'border-gray-300 bg-white text-gray-900'
            ]"
          />
        </div>
      </div>
      
      <!-- Color Preview -->
      <div class="mb-4 flex items-center gap-3" role="region" aria-label="Color preview">
        <div
          :class="[
            'w-16 h-16 rounded-lg border-2',
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          ]"
          :style="{ backgroundColor: currentHex }"
          :aria-label="`Selected color: ${currentHex}`"
          role="img"
        ></div>
        <div class="flex-1">
          <div :class="['text-sm font-mono font-semibold', isDarkMode ? 'text-white' : 'text-gray-900']" aria-live="polite">{{ currentHex }}</div>
          <div :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-500']">RGB({{ rgbValues.r }}, {{ rgbValues.g }}, {{ rgbValues.b }})</div>
          <div :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-500']">CMYK({{ Math.round(cmykValues.c) }}, {{ Math.round(cmykValues.m) }}, {{ Math.round(cmykValues.y) }}, {{ Math.round(cmykValues.k) }})</div>
        </div>
      </div>
      
      <!-- Eyedropper Button -->
      <div class="mb-4">
        <button
          @click="toggleEyedropper"
          aria-label="Use eyedropper tool to pick color from screen"
          :class="[
            'w-full px-4 py-2 text-sm border rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500',
            isDarkMode
              ? 'bg-slate-700 border-gray-600 text-white hover:bg-slate-600'
              : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
          ]"
        >
          <span class="material-symbols-outlined eyedropper-icon" aria-hidden="true">colorize</span>
          Use Eyedropper
        </button>
      </div>
      
      <!-- Buttons -->
      <div class="flex gap-2">
        <button
          @click="applyColor"
          aria-label="Apply selected color"
          class="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Apply
        </button>
        <button
          @click="cancel"
          aria-label="Cancel color selection"
          :class="[
            'flex-1 px-4 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
            isDarkMode
              ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

// Picker dimensions
const PICKER_WIDTH = 280;
const PICKER_HEIGHT = 400;
const PADDING = 16;

// Use previewDarkMode prop for dark mode styling
const isDarkMode = computed(() => props.previewDarkMode);

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  initialColor: {
    type: String,
    default: '#000000',
  },
  position: {
    type: Object,
    default: () => ({ left: 0, top: 0 }),
  },
  previewDarkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:show', 'apply', 'cancel']);

const colorPickerContainerRef = ref(null);
const gradientCanvas = ref(null);
const hueCanvas = ref(null);
const currentHex = ref('#000000');
const hexInput = ref('#000000');
const rgbValues = ref({ r: 0, g: 0, b: 0 });
const huePosition = ref(0);
const selectorStyle = ref({ left: '0%', top: '0%' });
const isDragging = ref(false);
const currentHue = ref(0);
const currentSaturation = ref(100);
const currentLightness = ref(50);
const cmykValues = ref({ c: 0, m: 0, y: 0, k: 100 });
const pickerStyle = ref({});

// Computed style that ensures picker stays within viewport
const safePickerStyle = computed(() => {
  if (!props.show) return {};
  
  let left = typeof props.position.left === 'string' 
    ? parseFloat(props.position.left) 
    : props.position.left;
  let top = typeof props.position.top === 'string' 
    ? parseFloat(props.position.top) 
    : props.position.top;
  
  // Ensure picker doesn't go off right edge
  if (left + PICKER_WIDTH > window.innerWidth - PADDING) {
    left = window.innerWidth - PICKER_WIDTH - PADDING;
  }
  
  // Ensure picker doesn't go off left edge
  if (left < PADDING) {
    left = PADDING;
  }
  
  // Ensure picker doesn't go off bottom edge
  if (top + PICKER_HEIGHT > window.innerHeight - PADDING) {
    top = window.innerHeight - PICKER_HEIGHT - PADDING;
  }
  
  // Ensure picker doesn't go off top edge
  if (top < PADDING) {
    top = PADDING;
  }
  
  return {
    left: `${left}px`,
    top: `${top}px`,
  };
});

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
  if (!canvas) {
    // If canvas isn't ready, try again on next tick
    nextTick(() => {
      drawHueCanvas();
    });
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas first
  ctx.clearRect(0, 0, width, height);
  
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

// Keyboard navigation for gradient canvas
const handleGradientKeydown = (event) => {
  const step = 1; // 1% per arrow key press
  let newSaturation = currentSaturation.value;
  let newLightness = currentLightness.value;
  
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      newSaturation = Math.max(0, currentSaturation.value - step);
      break;
    case 'ArrowRight':
      event.preventDefault();
      newSaturation = Math.min(100, currentSaturation.value + step);
      break;
    case 'ArrowUp':
      event.preventDefault();
      newLightness = Math.min(100, currentLightness.value + step);
      break;
    case 'ArrowDown':
      event.preventDefault();
      newLightness = Math.max(0, currentLightness.value - step);
      break;
    case 'Home':
      event.preventDefault();
      newSaturation = 0;
      break;
    case 'End':
      event.preventDefault();
      newSaturation = 100;
      break;
    case 'PageUp':
      event.preventDefault();
      newLightness = 100;
      break;
    case 'PageDown':
      event.preventDefault();
      newLightness = 0;
      break;
    default:
      return;
  }
  
  currentSaturation.value = newSaturation;
  currentLightness.value = newLightness;
  updateFromHSL();
  drawGradientCanvas();
  
  // Update selector position
  if (gradientCanvas.value) {
    const width = gradientCanvas.value.width;
    const height = gradientCanvas.value.height;
    selectorStyle.value = {
      left: `${newSaturation}%`,
      top: `${100 - newLightness}%`,
    };
  }
};

// Keyboard navigation for hue slider
const handleHueKeydown = (event) => {
  const step = 5; // 5 degrees per arrow key press
  let newHue = currentHue.value;
  
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      event.preventDefault();
      newHue = Math.max(0, currentHue.value - step);
      break;
    case 'ArrowRight':
    case 'ArrowUp':
      event.preventDefault();
      newHue = Math.min(360, currentHue.value + step);
      break;
    case 'Home':
      event.preventDefault();
      newHue = 0;
      break;
    case 'End':
      event.preventDefault();
      newHue = 360;
      break;
    default:
      return;
  }
  
  currentHue.value = newHue;
  huePosition.value = (newHue / 360) * 100;
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
  emit('apply', currentHex.value);
  emit('update:show', false);
};

const cancel = () => {
  emit('cancel');
  emit('update:show', false);
};

const toggleEyedropper = () => {
  if ('EyeDropper' in window) {
    const eyeDropper = new window.EyeDropper();
    eyeDropper
      .open()
      .then((result) => {
        let hex = result.sRGBHex.toUpperCase();
        setColorFromHex(hex);
        drawGradientCanvas();
        drawHueCanvas();
      })
      .catch((err) => {
        console.error('EyeDropper error:', err);
      });
  } else {
    alert('EyeDropper API is not supported in your browser');
  }
};

// Watch for show prop changes
watch(() => props.show, (newVal) => {
  if (newVal) {
    const color = props.initialColor || '#000000';
    setColorFromHex(color);
    // Use double nextTick to ensure canvas elements are rendered
    nextTick(() => {
      nextTick(() => {
        drawGradientCanvas();
        drawHueCanvas();
        // Focus the gradient canvas for keyboard navigation
        if (gradientCanvas.value) {
          gradientCanvas.value.focus();
        }
      });
    });
  }
});

watch(() => props.initialColor, (newVal) => {
  if (props.show && newVal) {
    setColorFromHex(newVal);
    // Use double nextTick to ensure canvas elements are rendered
    nextTick(() => {
      nextTick(() => {
        drawGradientCanvas();
        drawHueCanvas();
      });
    });
  }
});

// Watch for canvas ref to be available and draw when it becomes available
watch([hueCanvas, gradientCanvas], () => {
  if (props.show && hueCanvas.value && gradientCanvas.value) {
    nextTick(() => {
      drawGradientCanvas();
      drawHueCanvas();
    });
  }
});

// Position watcher removed - safePickerStyle computed property handles positioning with bounds checking

// Close on outside click
const handleClickOutside = (event) => {
  if (props.show && colorPickerContainerRef.value && !colorPickerContainerRef.value.contains(event.target)) {
    emit('update:show', false);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  
  if (props.show) {
    setColorFromHex(props.initialColor);
    // Use double nextTick to ensure canvas elements are rendered
    nextTick(() => {
      nextTick(() => {
        drawGradientCanvas();
        drawHueCanvas();
        // Focus the gradient canvas for keyboard navigation
        if (gradientCanvas.value) {
          gradientCanvas.value.focus();
        }
      });
    });
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('mousemove', handleGradientDrag);
  document.removeEventListener('mouseup', endGradientDrag);
});
</script>

