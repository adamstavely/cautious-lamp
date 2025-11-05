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
            <div class="grid grid-cols-3 gap-2">
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
          </div>

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
                <input
                  v-model.number="linearAngle"
                  type="number"
                  min="0"
                  max="360"
                  class="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <span class="text-sm text-gray-600">°</span>
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

          <!-- Color Stops -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Color Stops</h2>
              <button
                @click="addColorStop"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-lg">add</span>
                Add Stop
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
          <!-- CSS Code -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">CSS Code</h2>
              <button
                @click="copyToClipboard"
                class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-base">content_copy</span>
                Copy
              </button>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <code class="text-sm font-mono text-gray-800 whitespace-pre-wrap break-all">{{ cssGradient }}</code>
            </div>
            <div class="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <code class="text-xs font-mono text-gray-800 whitespace-pre-wrap break-all">{{ fullCssCode }}</code>
            </div>
          </div>

          <!-- Presets -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Presets</h2>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="preset in presets"
                :key="preset.name"
                @click="loadPreset(preset)"
                class="p-2 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
              >
                <div class="h-8 rounded mb-2" :style="{ background: preset.css }"></div>
                <p class="text-xs text-gray-700 font-medium">{{ preset.name }}</p>
              </button>
            </div>
          </div>

          <!-- Export Options -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Export</h2>
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

const gradientType = ref('linear');
const linearAngle = ref(90);
const radialPosition = ref({ x: '50%', y: '50%' });
const radialShape = ref('ellipse');
const radialSize = ref('farthest-corner');
const conicPosition = ref({ x: '50%', y: '50%' });
const conicAngle = ref(0);

const colorStops = ref([
  { id: 1, color: '#3b82f6', position: 0 },
  { id: 2, color: '#8b5cf6', position: 100 },
]);

const draggedIndex = ref(null);
const showColorPicker = ref(false);
const pickerColorIndex = ref(null);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });
const isDragging = ref(false);

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

const presets = [
  {
    name: 'Sunset',
    type: 'linear',
    stops: [
      { color: '#ff6b6b', position: 0 },
      { color: '#ffa500', position: 100 },
    ],
    css: 'linear-gradient(to right, #ff6b6b, #ffa500)',
  },
  {
    name: 'Ocean',
    type: 'linear',
    stops: [
      { color: '#0072ff', position: 0 },
      { color: '#00c6ff', position: 100 },
    ],
    css: 'linear-gradient(to right, #0072ff, #00c6ff)',
  },
  {
    name: 'Forest',
    type: 'linear',
    stops: [
      { color: '#134e5e', position: 0 },
      { color: '#71b280', position: 100 },
    ],
    css: 'linear-gradient(to right, #134e5e, #71b280)',
  },
  {
    name: 'Purple Dream',
    type: 'linear',
    stops: [
      { color: '#667eea', position: 0 },
      { color: '#764ba2', position: 100 },
    ],
    css: 'linear-gradient(to right, #667eea, #764ba2)',
  },
  {
    name: 'Radial Blue',
    type: 'radial',
    stops: [
      { color: '#3b82f6', position: 0 },
      { color: '#1e40af', position: 100 },
    ],
    css: 'radial-gradient(circle, #3b82f6, #1e40af)',
  },
  {
    name: 'Sunrise',
    type: 'linear',
    stops: [
      { color: '#ff9a9e', position: 0 },
      { color: '#fecfef', position: 50 },
      { color: '#fecfef', position: 100 },
    ],
    css: 'linear-gradient(to right, #ff9a9e, #fecfef)',
  },
];

const updateGradient = () => {
  // Sort stops by position
  colorStops.value.sort((a, b) => a.position - b.position);
};

const cssGradient = computed(() => {
  const stops = colorStops.value
    .map((stop) => `${stop.color} ${stop.position}%`)
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

const fullCssCode = computed(() => {
  return `background: ${cssGradient.value};\nbackground-image: ${cssGradient.value};`;
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
  });
  updateGradient();
};

const removeColorStop = (index) => {
  if (colorStops.value.length > 2) {
    colorStops.value.splice(index, 1);
    updateGradient();
  }
};

const loadPreset = (preset) => {
  gradientType.value = preset.type;
  colorStops.value = preset.stops.map((stop, index) => ({
    id: Date.now() + index,
    color: stop.color,
    position: stop.position,
  }));
  updateGradient();
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(cssGradient.value);
    alert('CSS code copied to clipboard!');
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
  const stops = colorStops.value.map((stop) => 
    `<stop offset="${stop.position}%" stop-color="${stop.color}" />`
  ).join('\n    ');
  
  let gradientDef;
  if (gradientType.value === 'linear') {
    const radians = (linearAngle.value * Math.PI) / 180;
    const x1 = 50 - 50 * Math.cos(radians + Math.PI);
    const y1 = 50 - 50 * Math.sin(radians + Math.PI);
    const x2 = 50 + 50 * Math.cos(radians + Math.PI);
    const y2 = 50 + 50 * Math.sin(radians + Math.PI);
    gradientDef = `<linearGradient id="grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">\n    ${stops}\n  </linearGradient>`;
  } else if (gradientType.value === 'radial') {
    gradientDef = `<radialGradient id="grad" cx="${radialPosition.value.x}" cy="${radialPosition.value.y}">\n    ${stops}\n  </radialGradient>`;
  } else {
    gradientDef = `<linearGradient id="grad">\n    ${stops}\n  </linearGradient>`;
  }
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <defs>
    ${gradientDef}
  </defs>
  <rect width="800" height="600" fill="url(#grad)" />
</svg>`;
  
  const blob = new Blob([svg], { type: 'image/svg+xml' });
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
  if (pickerColorIndex.value !== null) {
    colorStops.value[pickerColorIndex.value].color = color;
    updateGradient();
  }
  showColorPicker.value = false;
  pickerColorIndex.value = null;
};

onMounted(() => {
  updateGradient();
});
</script>
