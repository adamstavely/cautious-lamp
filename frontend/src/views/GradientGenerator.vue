<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <router-link
          to="/"
          class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <span class="material-symbols-outlined mr-2">arrow_back</span>
          <span>Back to Home</span>
        </router-link>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span class="material-symbols-outlined text-4xl text-indigo-600">gradient</span>
          Gradient Generator
        </h1>
        <p class="mt-2 text-gray-600">
          Create beautiful gradients for your UI designs with custom stops, angles, and color interpolation.
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Main Gradient Editor -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Gradient Preview -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
            <div
              class="w-full h-64 rounded-lg shadow-inner mb-4 transition-all"
              :style="{ background: cssGradient }"
            ></div>
            
            <!-- Preview on Different Backgrounds -->
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div class="bg-white rounded p-2 border border-gray-200">
                <div class="h-16 rounded" :style="{ background: cssGradient }"></div>
                <p class="text-xs text-gray-600 mt-1 text-center">White</p>
              </div>
              <div class="bg-gray-900 rounded p-2 border border-gray-200">
                <div class="h-16 rounded" :style="{ background: cssGradient }"></div>
                <p class="text-xs text-gray-600 mt-1 text-center text-white">Dark</p>
              </div>
              <div class="bg-gray-200 rounded p-2 border border-gray-200">
                <div class="h-16 rounded" :style="{ background: cssGradient }"></div>
                <p class="text-xs text-gray-600 mt-1 text-center">Gray</p>
              </div>
            </div>

            <!-- Accessibility Check -->
            <div class="pt-4 border-t border-gray-200">
              <label class="block text-sm font-medium text-gray-700 mb-2">Accessibility Check</label>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <label class="text-xs text-gray-600">Text Color:</label>
                  <button
                    @click="openAccessibilityColorPicker($event)"
                    class="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer hover:border-indigo-500 transition-colors flex-shrink-0"
                    :style="{ backgroundColor: accessibilityTextColor }"
                    title="Pick text color"
                  ></button>
                  <input
                    v-model="accessibilityTextColor"
                    type="text"
                    class="w-20 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                    placeholder="#000000"
                  />
                </div>
                <div class="flex items-center gap-3 text-xs">
                  <span class="font-semibold text-gray-700">Ratio:</span>
                  <span :class="contrastRatio >= 4.5 ? 'text-green-600 font-semibold' : contrastRatio >= 3 ? 'text-yellow-600 font-semibold' : 'text-red-600 font-semibold'">
                    {{ contrastRatio.toFixed(2) }}:1
                  </span>
                  <span :class="contrastRatio >= 4.5 ? 'text-green-600' : 'text-red-600'">
                    {{ contrastRatio >= 4.5 ? '✓ AA' : '✗ AA' }}
                  </span>
                  <span :class="contrastRatio >= 7 ? 'text-green-600' : 'text-red-600'">
                    {{ contrastRatio >= 7 ? '✓ AAA' : '✗ AAA' }}
                  </span>
                </div>
                <div class="flex-1 p-2 rounded border-2" :style="{ background: cssGradient, borderColor: accessibilityTextColor }">
                  <p class="text-sm font-semibold text-center" :style="{ color: accessibilityTextColor }">
                    Sample
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Color Stops -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Color Stops</h2>
              <div class="flex items-center gap-2">
                <button
                  @click="fetchPalettes"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Load from Palette Builder
                </button>
                <button
                  @click="addColorStop"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-lg">add</span>
                  Add Stop
                </button>
              </div>
            </div>

            <!-- Palette Selector -->
            <div v-if="availablePalettes.length > 0" class="mb-4 space-y-2">
              <select
                v-model="selectedPaletteId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select a palette...</option>
                <option v-for="palette in availablePalettes" :key="palette.id" :value="palette.id">
                  {{ palette.name }}
                </option>
              </select>
              <button
                @click="importPaletteColors"
                :disabled="!selectedPaletteId"
                class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Colors
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(stop, index) in colorStops"
                :key="stop.id"
                class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                :class="{ 'cursor-move': !isDragging, 'cursor-grabbing': isDragging }"
                @dragover.prevent="handleDragOver(index, $event)"
                @drop="handleDrop(index, $event)"
              >
                <!-- Drag Handle -->
                <div
                  class="cursor-move flex-shrink-0"
                  draggable="true"
                  @dragstart="handleDragStart(index, $event)"
                  @dragend="handleDragEnd"
                  title="Drag to reorder"
                >
                  <span class="material-symbols-outlined text-gray-400 hover:text-gray-600">drag_indicator</span>
                </div>

                <!-- Color Swatch Button -->
                <button
                  @click="openColorPicker(index, $event)"
                  class="w-12 h-12 rounded border-2 border-gray-300 cursor-pointer hover:border-indigo-500 transition-colors flex-shrink-0"
                  :style="{ backgroundColor: stop.color }"
                  title="Pick color"
                  @mousedown.stop
                ></button>
                
                <!-- Hex Input -->
                <input
                  v-model="stop.color"
                  type="text"
                  @input="updateGradient"
                  placeholder="#000000"
                  class="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono flex-shrink-0"
                  @mousedown.stop
                  @click.stop
                />
                
                <!-- Position Slider -->
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs text-gray-600 w-12">Position</span>
                    <input
                      v-model.number="stop.position"
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      @input="updateGradient"
                      @mousedown.stop
                      @click.stop
                      class="flex-1"
                    />
                    <input
                      v-model.number="stop.position"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      @input="updateGradient"
                      @mousedown.stop
                      @click.stop
                      class="w-16 px-2 py-1 border border-gray-300 rounded text-sm flex-shrink-0"
                    />
                    <span class="text-xs text-gray-600 w-8">%</span>
                  </div>
                  <!-- Opacity Slider -->
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-600 w-12">Opacity</span>
                    <input
                      v-model.number="stop.opacity"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      @input="updateGradient"
                      @mousedown.stop
                      @click.stop
                      class="flex-1"
                    />
                    <input
                      v-model.number="stop.opacity"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      @input="updateGradient"
                      @mousedown.stop
                      @click.stop
                      class="w-16 px-2 py-1 border border-gray-300 rounded text-sm flex-shrink-0"
                    />
                    <span class="text-xs text-gray-600 w-8">%</span>
                  </div>
                </div>

                <!-- Remove Button -->
                <button
                  v-if="colorStops.length > 2"
                  @click="removeColorStop(index)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  title="Remove stop"
                  @mousedown.stop
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Gradient Type & Settings -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
            
            <!-- Gradient Type -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Gradient Type</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="type in gradientTypes"
                  :key="type.value"
                  @click="gradientType = type.value"
                  class="px-4 py-2 rounded-lg border-2 transition-all"
                  :class="gradientType === type.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>

            <!-- Linear Gradient Settings -->
            <div v-if="gradientType === 'linear'" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Angle</label>
              <div class="flex items-center gap-4">
                <input
                  v-model.number="linearAngle"
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  class="flex-1"
                />
                <div class="flex items-center gap-1">
                  <input
                    v-model.number="linearAngle"
                    type="number"
                    min="0"
                    max="360"
                    class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span class="text-base text-gray-600">°</span>
                </div>
              </div>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  v-for="direction in linearDirections"
                  :key="direction.value"
                  @click="linearAngle = direction.angle"
                  class="px-3 py-1 text-xs rounded border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  {{ direction.label }}
                </button>
              </div>
            </div>

            <!-- Radial Gradient Settings -->
            <div v-if="gradientType === 'radial'" class="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Position X</label>
                <input
                  v-model="radialPosition.x"
                  type="text"
                  placeholder="50%"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Position Y</label>
                <input
                  v-model="radialPosition.y"
                  type="text"
                  placeholder="50%"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Shape</label>
                <select
                  v-model="radialShape"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="ellipse">Ellipse</option>
                  <option value="circle">Circle</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <select
                  v-model="radialSize"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="farthest-corner">Farthest Corner</option>
                  <option value="farthest-side">Farthest Side</option>
                  <option value="closest-corner">Closest Corner</option>
                  <option value="closest-side">Closest Side</option>
                </select>
              </div>
            </div>

            <!-- Conic Gradient Settings -->
            <div v-if="gradientType === 'conic'" class="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Position X</label>
                <input
                  v-model="conicPosition.x"
                  type="text"
                  placeholder="50%"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Position Y</label>
                <input
                  v-model="conicPosition.y"
                  type="text"
                  placeholder="50%"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Angle</label>
                <input
                  v-model.number="conicAngle"
                  type="number"
                  min="0"
                  max="360"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Export -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Export</h2>
            </div>
            
            <!-- Export Format Selector -->
            <div class="mb-4">
              <label class="block text-xs font-medium text-gray-700 mb-2">Code Format</label>
              <select
                v-model="exportFormat"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="css">CSS</option>
                <option value="css-vars">CSS Variables</option>
                <option value="tailwind">Tailwind Config</option>
                <option value="scss">SCSS Variables</option>
                <option value="json">JSON</option>
                <option value="react">React (styled-components)</option>
                <option value="vue">Vue (style binding)</option>
              </select>
              <div class="mt-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <code class="text-xs font-mono text-gray-800 whitespace-pre-wrap break-all">{{ formattedExportCode }}</code>
              </div>
              <button
                @click="copyFormattedCode"
                class="w-full mt-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Copy {{ exportFormat.toUpperCase() }}
              </button>
            </div>

            <!-- File Export Options -->
            <div class="pt-4 border-t border-gray-200">
              <label class="block text-xs font-medium text-gray-700 mb-2">File Format</label>
              <div class="space-y-2">
                <button
                  @click="exportAsImage"
                  class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Export as Image
                </button>
                <button
                  @click="exportAsSVG"
                  class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Export as SVG
                </button>
                <button
                  @click="exportToAdobe"
                  class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Export to Adobe
                </button>
                <button
                  @click="exportToPenpot"
                  class="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Export to Penpot
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Picker -->
    <ColorPicker
      :show="showColorPicker"
      :initial-color="pickerColor"
      :position="pickerPosition"
      @update:show="showColorPicker = $event"
      @apply="handleColorPickerApply"
      @cancel="showColorPicker = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ColorPicker from '../components/ColorPicker.vue';
import axios from 'axios';

const gradientType = ref('linear');
const linearAngle = ref(90);
const radialPosition = ref({ x: '50%', y: '50%' });
const radialShape = ref('ellipse');
const radialSize = ref('farthest-corner');
const conicPosition = ref({ x: '50%', y: '50%' });
const conicAngle = ref(0);

const colorStops = ref([
  { id: 1, color: '#3b82f6', position: 0, opacity: 100 },
  { id: 2, color: '#8b5cf6', position: 100, opacity: 100 },
]);

const draggedIndex = ref(null);
const showColorPicker = ref(false);
const pickerColorIndex = ref(null);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });
const isDragging = ref(false);
const exportFormat = ref('css');
const showAccessibilityCheck = ref(false);
const accessibilityTextColor = ref('#000000');
const availablePalettes = ref([]);
const selectedPaletteId = ref('');

const gradientTypes = [
  { label: 'Linear', value: 'linear' },
  { label: 'Radial', value: 'radial' },
  { label: 'Conic', value: 'conic' },
];

const linearDirections = [
  { label: 'To Right', angle: 90, value: 'to right' },
  { label: 'To Bottom', angle: 180, value: 'to bottom' },
  { label: 'To Left', angle: 270, value: 'to left' },
  { label: 'To Top', angle: 0, value: 'to top' },
  { label: 'To Top Right', angle: 45, value: 'to top right' },
  { label: 'To Bottom Right', angle: 135, value: 'to bottom right' },
  { label: 'To Bottom Left', angle: 225, value: 'to bottom left' },
  { label: 'To Top Left', angle: 315, value: 'to top left' },
];

const updateGradient = () => {
  // Sort stops by position
  colorStops.value.sort((a, b) => a.position - b.position);
};

// Helper to convert hex + opacity to rgba
const hexToRgba = (hex, opacity) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${opacity / 100})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
};

const cssGradient = computed(() => {
  const stops = colorStops.value
    .map((stop) => {
      const color = stop.opacity === 100 ? stop.color : hexToRgba(stop.color, stop.opacity);
      return `${color} ${stop.position}%`;
    })
    .join(', ');

  switch (gradientType.value) {
    case 'linear':
      return `linear-gradient(${linearAngle.value}deg, ${stops})`;
    case 'radial':
      return `radial-gradient(${radialShape.value} ${radialSize.value} at ${radialPosition.value.x} ${radialPosition.value.y}, ${stops})`;
    case 'conic':
      return `conic-gradient(from ${conicAngle.value}deg at ${conicPosition.value.x} ${conicPosition.value.y}, ${stops})`;
    default:
      return `linear-gradient(90deg, ${stops})`;
  }
});

const addColorStop = () => {
  const newPosition = colorStops.value.length > 0
    ? Math.min(100, Math.max(0, colorStops.value[colorStops.value.length - 1].position + 10))
    : 50;
  
  // Generate a color between the last two stops if possible
  let newColor = '#6366f1';
  if (colorStops.value.length >= 2) {
    const last = colorStops.value[colorStops.value.length - 1];
    const secondLast = colorStops.value[colorStops.value.length - 2];
    newColor = interpolateColor(secondLast.color, last.color, 0.5);
  } else if (colorStops.value.length === 1) {
    newColor = colorStops.value[0].color;
  }

  colorStops.value.push({
    id: Date.now(),
    color: newColor,
    position: newPosition,
    opacity: 100,
  });
  updateGradient();
};

const removeColorStop = (index) => {
  if (colorStops.value.length > 2) {
    colorStops.value.splice(index, 1);
    updateGradient();
  }
};

const formattedExportCode = computed(() => {
  const gradient = cssGradient.value;
  
  switch (exportFormat.value) {
    case 'css':
      return `background: ${gradient};\nbackground-image: ${gradient};`;
      
    case 'css-vars':
      return `:root {\n  --gradient-primary: ${gradient};\n}\n\n.my-element {\n  background: var(--gradient-primary);\n}`;
      
    case 'tailwind':
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      backgroundImage: {\n        'gradient-primary': '${gradient}',\n      },\n    },\n  },\n}`;
      
    case 'scss':
      return `$gradient-primary: ${gradient};\n\n.my-element {\n  background: $gradient-primary;\n}`;
      
    case 'json':
      return JSON.stringify({
        type: gradientType.value,
        css: gradient,
        stops: colorStops.value.map(s => ({
          color: s.color,
          position: s.position,
          opacity: s.opacity,
        })),
        settings: {
          linearAngle: linearAngle.value,
          radialPosition: radialPosition.value,
          radialShape: radialShape.value,
          radialSize: radialSize.value,
          conicPosition: conicPosition.value,
          conicAngle: conicAngle.value,
        },
      }, null, 2);
      
    case 'react':
      return `import styled from 'styled-components';\n\nconst GradientComponent = styled.div\`\n  background: ${gradient};\n\`;`;
      
    case 'vue':
      // Vue component code - using style binding
      return 'const gradient = \'' + gradient + '\';\n\n// Use in template:\n// <div :style="{ background: gradient }">Your content</div>';
      
    default:
      return gradient;
  }
});

const copyFormattedCode = async () => {
  try {
    await navigator.clipboard.writeText(formattedExportCode.value);
    alert(`${exportFormat.value.toUpperCase()} code copied to clipboard!`);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const exportAsImage = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return;
  
  let gradient;
  if (gradientType.value === 'linear') {
    const radians = (linearAngle.value * Math.PI) / 180;
    const x1 = canvas.width / 2 - (canvas.width / 2) * Math.cos(radians + Math.PI);
    const y1 = canvas.height / 2 - (canvas.height / 2) * Math.sin(radians + Math.PI);
    const x2 = canvas.width / 2 + (canvas.width / 2) * Math.cos(radians + Math.PI);
    const y2 = canvas.height / 2 + (canvas.height / 2) * Math.sin(radians + Math.PI);
    gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  } else if (gradientType.value === 'radial') {
    const x = parseFloat(radialPosition.value.x.replace('%', '')) * canvas.width / 100;
    const y = parseFloat(radialPosition.value.y.replace('%', '')) * canvas.height / 100;
    const radius = Math.max(canvas.width, canvas.height) / 2;
    gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  } else {
    // Conic gradients are not directly supported in canvas, use linear as fallback
    gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  }
  
  colorStops.value.forEach((stop) => {
    const rgb = hexToRgb(stop.color);
    gradient.addColorStop(stop.position / 100, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
  });
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
};

const exportAsSVG = () => {
  // Build SVG using DOM methods to avoid Vue parser issues
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('width', '800');
  svg.setAttribute('height', '600');
  
  const defs = document.createElementNS(svgNS, 'defs');
  
  let gradient;
  if (gradientType.value === 'linear') {
    gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', 'grad');
    const radians = (linearAngle.value * Math.PI) / 180;
    const x1 = 50 - 50 * Math.cos(radians + Math.PI);
    const y1 = 50 - 50 * Math.sin(radians + Math.PI);
    const x2 = 50 + 50 * Math.cos(radians + Math.PI);
    const y2 = 50 + 50 * Math.sin(radians + Math.PI);
    gradient.setAttribute('x1', x1 + '%');
    gradient.setAttribute('y1', y1 + '%');
    gradient.setAttribute('x2', x2 + '%');
    gradient.setAttribute('y2', y2 + '%');
  } else if (gradientType.value === 'radial') {
    gradient = document.createElementNS(svgNS, 'radialGradient');
    gradient.setAttribute('id', 'grad');
    gradient.setAttribute('cx', radialPosition.value.x);
    gradient.setAttribute('cy', radialPosition.value.y);
  } else {
    gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', 'grad');
  }
  
  colorStops.value.forEach((stop) => {
    const stopEl = document.createElementNS(svgNS, 'stop');
    stopEl.setAttribute('offset', stop.position + '%');
    stopEl.setAttribute('stop-color', stop.color);
    if (stop.opacity !== 100) {
      stopEl.setAttribute('stop-opacity', (stop.opacity / 100).toString());
    }
    gradient.appendChild(stopEl);
  });
  
  defs.appendChild(gradient);
  svg.appendChild(defs);
  
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('width', '800');
  rect.setAttribute('height', '600');
  rect.setAttribute('fill', 'url(#grad)');
  svg.appendChild(rect);
  
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gradient.svg';
  a.click();
  URL.revokeObjectURL(url);
};

// Color interpolation helper
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
};

const interpolateColor = (color1, color2, factor) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
  const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
  const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
  return rgbToHex(r, g, b);
};

// Calculate contrast ratio for accessibility
const calculateLuminance = (rgb) => {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = computed(() => {
  const textRgb = hexToRgb(accessibilityTextColor.value);
  const textLuminance = calculateLuminance(textRgb);
  
  // Calculate average luminance of gradient (simplified - uses first stop)
  // For more accuracy, we'd need to sample multiple points
  const gradientRgb = hexToRgb(colorStops.value[0]?.color || '#000000');
  const gradientLuminance = calculateLuminance(gradientRgb);
  
  const lighter = Math.max(textLuminance, gradientLuminance);
  const darker = Math.min(textLuminance, gradientLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
});

// Fetch palettes from backend
const fetchPalettes = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/palettes');
    availablePalettes.value = response.data || [];
  } catch (error) {
    console.error('Error fetching palettes:', error);
    alert('Error loading palettes. Make sure you have saved palettes in Palette Builder.');
  }
};

// Import colors from selected palette
const importPaletteColors = async () => {
  if (!selectedPaletteId.value) return;
  
  try {
    const response = await axios.get(`http://localhost:3000/api/palettes/${selectedPaletteId.value}`);
    const palette = response.data;
    
    if (palette.colors && palette.colors.length > 0) {
      const colors = palette.colors.map((c) => c.hex || c);
      const step = 100 / (colors.length - 1);
      
      colorStops.value = colors.map((color, index) => ({
        id: Date.now() + index,
        color: typeof color === 'string' ? color : color.hex,
        position: index * step,
        opacity: 100,
      }));
      
      updateGradient();
      alert(`Imported ${colors.length} colors from ${palette.name}`);
    }
  } catch (error) {
    console.error('Error importing palette:', error);
    alert('Error importing palette colors');
  }
};

// Export to Adobe XD (CSS format compatible with Adobe XD)
const exportToAdobe = () => {
  const gradientData = {
    css: cssGradient.value,
    type: gradientType.value,
    stops: colorStops.value.map((stop) => ({
      color: stop.color,
      position: stop.position,
      opacity: stop.opacity / 100,
    })),
    settings: {
      angle: gradientType.value === 'linear' ? linearAngle.value : undefined,
      position: gradientType.value === 'radial' ? radialPosition.value : undefined,
      shape: gradientType.value === 'radial' ? radialShape.value : undefined,
      size: gradientType.value === 'radial' ? radialSize.value : undefined,
    },
  };
  
  const json = JSON.stringify(gradientData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gradient-adobe.json';
  a.click();
  URL.revokeObjectURL(url);
};

// Export to Penpot (Penpot JSON format)
const exportToPenpot = () => {
  const gradientData = {
    type: 'gradient',
    gradientType: gradientType.value === 'linear' ? 'linear' : gradientType.value === 'radial' ? 'radial' : 'linear',
    stops: colorStops.value.map((stop) => ({
      offset: stop.position / 100,
      color: {
        r: hexToRgb(stop.color).r / 255,
        g: hexToRgb(stop.color).g / 255,
        b: hexToRgb(stop.color).b / 255,
        a: stop.opacity / 100,
      },
    })),
    transform: gradientType.value === 'linear' 
      ? {
          sx: Math.cos(linearAngle.value * Math.PI / 180),
          sy: Math.sin(linearAngle.value * Math.PI / 180),
          tx: 0,
          ty: 0,
        }
      : {
          sx: 1,
          sy: 1,
          tx: 0,
          ty: 0,
        },
  };
  
  const json = JSON.stringify(gradientData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gradient-penpot.json';
  a.click();
  URL.revokeObjectURL(url);
};

const handleDragStart = (index, event) => {
  draggedIndex.value = index;
  isDragging.value = true;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target);
};

const handleDragOver = (index, event) => {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
};

const handleDrop = (index, event) => {
  event.preventDefault();
  if (draggedIndex.value === null || draggedIndex.value === index) {
    isDragging.value = false;
    return;
  }
  
  const draggedStop = colorStops.value[draggedIndex.value];
  colorStops.value.splice(draggedIndex.value, 1);
  colorStops.value.splice(index, 0, draggedStop);
  
  updateGradient();
  isDragging.value = false;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  isDragging.value = false;
};

const openColorPicker = (index, event) => {
  event.stopPropagation();
  pickerColorIndex.value = index;
  pickerColor.value = colorStops.value[index].color;
  
  // Calculate position near the color swatch button
  const rect = event.target.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  const pickerWidth = 280;
  const pickerHeight = 550; // Approximate height of color picker
  const padding = 16;
  
  let left = rect.right + scrollLeft + padding;
  let top = rect.top + scrollTop;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth + scrollLeft) {
    left = rect.left + scrollLeft - pickerWidth - padding;
  }
  
  // If there's not enough space at the bottom, show above the button
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = rect.top + scrollTop - pickerHeight - padding;
  }
  
  // Ensure it doesn't go off-screen horizontally
  left = Math.max(padding, Math.min(left, window.innerWidth + scrollLeft - pickerWidth - padding));
  
  // Ensure it doesn't go off-screen vertically
  top = Math.max(padding, Math.min(top, window.innerHeight + scrollTop - pickerHeight - padding));
  
  // If still too tall, position at top of viewport
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = scrollTop + padding;
  }
  
  pickerPosition.value = { left, top };
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  if (pickerColorIndex.value === 'accessibility') {
    accessibilityTextColor.value = color;
  } else if (pickerColorIndex.value !== null) {
    colorStops.value[pickerColorIndex.value].color = color;
    updateGradient();
  }
  showColorPicker.value = false;
  pickerColorIndex.value = null;
};

const openAccessibilityColorPicker = (event) => {
  event.stopPropagation();
  pickerColorIndex.value = 'accessibility';
  pickerColor.value = accessibilityTextColor.value;
  
  // Calculate position near the color swatch button
  const rect = event.target.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  const pickerWidth = 280;
  const pickerHeight = 550; // Approximate height of color picker
  const padding = 16;
  
  let left = rect.right + scrollLeft + padding;
  let top = rect.top + scrollTop;
  
  // If there's not enough space on the right, show on the left
  if (left + pickerWidth > window.innerWidth + scrollLeft) {
    left = rect.left + scrollLeft - pickerWidth - padding;
  }
  
  // If there's not enough space at the bottom, show above the button
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = rect.top + scrollTop - pickerHeight - padding;
  }
  
  // Ensure it doesn't go off-screen horizontally
  left = Math.max(padding, Math.min(left, window.innerWidth + scrollLeft - pickerWidth - padding));
  
  // Ensure it doesn't go off-screen vertically
  top = Math.max(padding, Math.min(top, window.innerHeight + scrollTop - pickerHeight - padding));
  
  // If still too tall, position at top of viewport
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = scrollTop + padding;
  }
  
  pickerPosition.value = { left, top };
  showColorPicker.value = true;
};

onMounted(() => {
  updateGradient();
});
</script>
