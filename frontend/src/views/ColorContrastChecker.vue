<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Compare colors
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Compare two colors to check contrast, difference, and colorblind safety.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">contrast</span>
                      Accessibility Tool
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="contrastGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized contrast icon -->
                      <rect x="40" y="60" width="60" height="80" rx="4" fill="url(#contrastGradient)" opacity="0.5"/>
                      <rect x="100" y="60" width="60" height="80" rx="4" fill="url(#contrastGradient)" opacity="0.3"/>
                      <circle cx="70" cy="100" r="8" fill="rgba(255,255,255,0.6)"/>
                      <circle cx="130" cy="100" r="8" fill="rgba(255,255,255,0.4)"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid lg:grid-cols-3 gap-6">
              <!-- Left Column: Color Inputs -->
              <div class="lg:col-span-1 space-y-6">
                <!-- Foreground Color -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Foreground color<span class="text-red-500">*</span>
                  </label>
                  <div class="flex items-center gap-3 mb-4">
                    <input
                      v-model="foregroundColor"
                      type="text"
                      @input="updateContrast"
                      placeholder="#7AC600"
                      class="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                    <button
                      @click="openColorPicker('foreground', $event)"
                      class="w-12 h-12 rounded border-2 cursor-pointer transition-colors flex-shrink-0"
                      :class="isDarkMode 
                        ? 'border-gray-600 hover:border-indigo-400' 
                        : 'border-gray-300 hover:border-indigo-500'"
                      :style="{ backgroundColor: foregroundColor }"
                      title="Pick color"
                    ></button>
                  </div>
                  
                  <!-- Color Swatch -->
                  <div 
                    class="w-full h-32 rounded-lg border-2 mb-4"
                    :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                    :style="{ backgroundColor: foregroundColor }"
                  ></div>
                  
                  <!-- Color Slider -->
                  <input
                    type="range"
                    min="0"
                    max="360"
                    :value="foregroundHue"
                    @input="updateForegroundFromSlider($event.target.value)"
                    class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'"
                  />
                </div>

                <!-- Background Color -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Background color
                  </label>
                  <div class="flex items-center gap-3 mb-4">
                    <input
                      v-model="backgroundColor"
                      type="text"
                      @input="updateContrast"
                      placeholder="#0E55A8"
                      class="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                    <button
                      @click="openColorPicker('background', $event)"
                      class="w-12 h-12 rounded border-2 cursor-pointer transition-colors flex-shrink-0"
                      :class="isDarkMode 
                        ? 'border-gray-600 hover:border-indigo-400' 
                        : 'border-gray-300 hover:border-indigo-500'"
                      :style="{ backgroundColor: backgroundColor }"
                      title="Pick color"
                    ></button>
                  </div>
                  
                  <!-- Color Swatch -->
                  <div 
                    class="w-full h-32 rounded-lg border-2"
                    :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                    :style="{ backgroundColor: backgroundColor }"
                  ></div>
                </div>

                <!-- Supported Formats -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-sm font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    Supported formats
                  </h3>
                  <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                      <thead>
                        <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                          <th class="text-left py-2 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">COLOR SPACE</th>
                          <th class="text-left py-2 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">OPAQUE</th>
                          <th class="text-left py-2 font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">ALPHA</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                          <td class="py-2 font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">HEX</td>
                          <td class="py-2 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">#FFFFFF</td>
                          <td class="py-2 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">#FFFFFFFF</td>
                        </tr>
                        <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                          <td class="py-2 font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">RGB</td>
                          <td class="py-2 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">rgb(255, 255, 255)</td>
                          <td class="py-2 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">rgba(255, 255, 255, 1)</td>
                        </tr>
                        <tr>
                          <td class="py-2 font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">HSL</td>
                          <td class="py-2 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">hsl(360, 100%, 50%)</td>
                          <td class="py-2 font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">hsla(360, 100%, 50%, 1)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Right Column: Contrast Results -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Contrast Card -->
                <div 
                  class="rounded-lg shadow-sm border"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="p-6">
                    <!-- Contrast Ratio Display -->
                    <div class="flex items-center gap-6 mb-8">
                      <div class="flex items-center gap-2">
                        <div class="relative w-16 h-16 rounded border-2" :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'">
                          <div 
                            class="absolute inset-0 rounded"
                            :style="{ backgroundColor: backgroundColor }"
                          ></div>
                          <div 
                            class="absolute inset-2 rounded"
                            :style="{ backgroundColor: foregroundColor }"
                          ></div>
                        </div>
                        <div>
                          <div class="text-4xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                            {{ contrastRatio.toFixed(2) }}
                          </div>
                          <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                            Contrast ratio
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- WCAG Criteria Table -->
                    <div class="overflow-x-auto">
                      <table class="w-full">
                        <thead>
                          <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                            <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">WCAG CRITERIA</th>
                            <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">AA SCORE</th>
                            <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">AA MINIMUM</th>
                            <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">AAA SCORE</th>
                            <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">AAA MINIMUM</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr 
                            v-for="(criterion, index) in wcagCriteria" 
                            :key="index"
                            class="border-b"
                            :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                          >
                            <td class="py-3 px-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                              {{ criterion.label }}
                            </td>
                            <td class="py-3 px-4">
                              <span 
                                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                :class="criterion.aaPass 
                                  ? (isDarkMode 
                                    ? 'bg-green-900/30 text-green-300' 
                                    : 'bg-green-100 text-green-800')
                                  : (isDarkMode 
                                    ? 'bg-red-900/30 text-red-300' 
                                    : 'bg-red-100 text-red-800')"
                              >
                                {{ criterion.aaPass ? 'Pass' : 'Fail' }}
                              </span>
                            </td>
                            <td class="py-3 px-4 font-mono text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              {{ criterion.aaMinimum }}
                            </td>
                            <td class="py-3 px-4">
                              <span 
                                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                :class="criterion.aaaPass 
                                  ? (isDarkMode 
                                    ? 'bg-green-900/30 text-green-300' 
                                    : 'bg-green-100 text-green-800')
                                  : (isDarkMode 
                                    ? 'bg-red-900/30 text-red-300' 
                                    : 'bg-red-100 text-red-800')"
                              >
                                {{ criterion.aaaPass ? 'Pass' : 'Fail' }}
                              </span>
                            </td>
                            <td class="py-3 px-4 font-mono text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                              {{ criterion.aaaMinimum }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Color Difference Card -->
                <div 
                  class="rounded-lg shadow-sm border"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="p-6">
                    <div class="overflow-x-auto">
                      <table class="w-full">
                        <thead>
                          <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                            <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">PREVIEW</th>
                            <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">VISION TYPE</th>
                            <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">STATUS</th>
                            <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">COLOR DIFFERENCE</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr 
                            v-for="(vision, index) in visionTypes" 
                            :key="index"
                            class="border-b"
                            :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                          >
                            <td class="py-3 px-4">
                              <div class="flex items-center gap-2">
                                <div 
                                  class="w-12 h-8 rounded border"
                                  :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                                  :style="{ 
                                    background: `linear-gradient(to right, ${vision.fgColor} 50%, ${vision.bgColor} 50%)`
                                  }"
                                ></div>
                              </div>
                            </td>
                            <td class="py-3 px-4 font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                              {{ vision.name }}
                            </td>
                            <td class="py-3 px-4">
                              <span 
                                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                :class="vision.safe 
                                  ? (isDarkMode 
                                    ? 'bg-green-900/30 text-green-300' 
                                    : 'bg-green-100 text-green-800')
                                  : (isDarkMode 
                                    ? 'bg-red-900/30 text-red-300' 
                                    : 'bg-red-100 text-red-800')"
                              >
                                {{ vision.safe ? 'Safe' : 'Unsafe' }}
                              </span>
                            </td>
                            <td class="py-3 px-4">
                              <div class="flex items-center gap-3">
                                <span class="font-mono text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                                  {{ vision.deltaE.toFixed(2) }}
                                </span>
                                <div class="flex-1 h-2 rounded-full overflow-hidden" :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-200'">
                                  <div 
                                    class="h-full transition-all"
                                    :class="vision.safe ? 'bg-green-500' : 'bg-red-500'"
                                    :style="{ width: `${Math.min(100, (vision.deltaE / 100) * 100)}%` }"
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- How This Works Section -->
                    <div class="mt-8 pt-6 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                      <h3 class="text-lg font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        How this works
                      </h3>
                      <p class="text-sm leading-relaxed" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Ratings are calculated by first converting the colors to their simulated counterparts. The simulated values approximate the colors that would be seen by fully deficient vision of each particular type. The simulated colors are then compared using the DeltaE 2000 color difference formula. A color difference value of 11 or more is considered passing; anything lower is too similar to distinguish.
                        <br><br>
                        The color difference meters visualize the DeltaE value to give reference to how different the colors would appear for each color vision deficiency.
                      </p>
                    </div>
                  </div>
                </div>
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import ColorPicker from '../components/ColorPicker.vue';
import chroma from 'chroma-js';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const foregroundColor = ref('#7AC600');
const backgroundColor = ref('#0E55A8');
const showColorPicker = ref(false);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });
const currentPickerType = ref('foreground');
const foregroundHue = ref(83);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Calculate relative luminance
const getLuminance = (rgb) => {
  const [r, g, b] = rgb.map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Calculate contrast ratio
const contrastRatio = computed(() => {
  try {
    const fgRgb = chroma(foregroundColor.value).rgb();
    const bgRgb = chroma(backgroundColor.value).rgb();
    
    const fgLum = getLuminance(fgRgb);
    const bgLum = getLuminance(bgRgb);
    
    const lighter = Math.max(fgLum, bgLum);
    const darker = Math.min(fgLum, bgLum);
    
    return (lighter + 0.05) / (darker + 0.05);
  } catch (error) {
    return 1;
  }
});

// WCAG Criteria
const wcagCriteria = computed(() => {
  const ratio = contrastRatio.value;
  
  return [
    {
      label: 'Regular text (24px / 19px bold and below)',
      aaMinimum: '4.5',
      aaPass: ratio >= 4.5,
      aaaMinimum: '7',
      aaaPass: ratio >= 7
    },
    {
      label: 'Large text (24px / 19px bold and above)',
      aaMinimum: '3',
      aaPass: ratio >= 3,
      aaaMinimum: '4.5',
      aaaPass: ratio >= 4.5
    },
    {
      label: 'UI Components & graphics',
      aaMinimum: '3',
      aaPass: ratio >= 3,
      aaaMinimum: '3',
      aaaPass: ratio >= 3
    }
  ];
});

// Colorblind simulation matrices
const colorblindMatrices = {
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7]
  ],
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758]
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525]
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114]
  ]
};

// Simulate colorblind vision
const simulateColorblind = (rgb, type) => {
  const matrix = colorblindMatrices[type];
  if (!matrix) return rgb;
  
  return [
    Math.round(rgb[0] * matrix[0][0] + rgb[1] * matrix[0][1] + rgb[2] * matrix[0][2]),
    Math.round(rgb[0] * matrix[1][0] + rgb[1] * matrix[1][1] + rgb[2] * matrix[1][2]),
    Math.round(rgb[0] * matrix[2][0] + rgb[1] * matrix[2][1] + rgb[2] * matrix[2][2])
  ];
};

// Calculate Delta E (CIE76)
const calculateDeltaE = (rgb1, rgb2) => {
  // Convert RGB to LAB
  const lab1 = rgbToLab(rgb1);
  const lab2 = rgbToLab(rgb2);
  
  // Calculate Delta E
  const deltaL = lab1[0] - lab2[0];
  const deltaA = lab1[1] - lab2[1];
  const deltaB = lab1[2] - lab2[2];
  
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
};

// Convert RGB to LAB
const rgbToLab = (rgb) => {
  // Convert RGB to XYZ
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let b = rgb[2] / 255;
  
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
  r *= 100;
  g *= 100;
  b *= 100;
  
  // Observer = 2°, Illuminant = D65
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 95.047;
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 100.000;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 108.883;
  
  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);
  
  return [
    (116 * y) - 16,
    500 * (x - y),
    200 * (y - z)
  ];
};

// Vision types with simulated colors
const visionTypes = computed(() => {
  try {
    const fgRgb = chroma(foregroundColor.value).rgb();
    const bgRgb = chroma(backgroundColor.value).rgb();
    
    const types = [
      { name: 'Normal vision', type: null },
      { name: 'Deuteranopia', type: 'deuteranopia' },
      { name: 'Protanopia', type: 'protanopia' },
      { name: 'Tritanopia', type: 'tritanopia' },
      { name: 'Achromatopsia', type: 'achromatopsia' }
    ];
    
    return types.map(type => {
      const simFgRgb = type.type ? simulateColorblind(fgRgb, type.type) : fgRgb;
      const simBgRgb = type.type ? simulateColorblind(bgRgb, type.type) : bgRgb;
      
      const deltaE = calculateDeltaE(simFgRgb, simBgRgb);
      const safe = deltaE >= 11;
      
      return {
        name: type.name,
        fgColor: chroma(simFgRgb).hex(),
        bgColor: chroma(simBgRgb).hex(),
        deltaE,
        safe
      };
    });
  } catch (error) {
    return [];
  }
});

const updateContrast = () => {
  // Trigger reactivity
  contrastRatio.value;
  wcagCriteria.value;
  visionTypes.value;
};

const updateForegroundFromSlider = (hue) => {
  foregroundHue.value = hue;
  try {
    const color = chroma.hsl(hue, 1, 0.5);
    foregroundColor.value = color.hex();
    updateContrast();
  } catch (error) {
    // Ignore errors
  }
};

const openColorPicker = (type, event) => {
  if (event) {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const pickerWidth = 300;
    const pickerHeight = 550;
    const padding = 16;
    
    let left = rect.right + scrollLeft + padding;
    let top = rect.top + scrollTop;
    
    if (left + pickerWidth > window.innerWidth + scrollLeft) {
      left = rect.left + scrollLeft - pickerWidth - padding;
    }
    
    if (top + pickerHeight > window.innerHeight + scrollTop) {
      top = rect.top + scrollTop - pickerHeight - padding;
    }
    
    left = Math.max(padding, Math.min(left, window.innerWidth + scrollLeft - pickerWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight + scrollTop - pickerHeight - padding));
    
    pickerPosition.value = { left, top };
  }
  
  currentPickerType.value = type;
  pickerColor.value = type === 'foreground' ? foregroundColor.value : backgroundColor.value;
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  if (currentPickerType.value === 'foreground') {
    foregroundColor.value = color;
  } else {
    backgroundColor.value = color;
  }
  updateContrast();
  showColorPicker.value = false;
};

watch([foregroundColor, backgroundColor], () => {
  updateContrast();
  try {
    const hsl = chroma(foregroundColor.value).hsl();
    if (!isNaN(hsl[0])) {
      foregroundHue.value = hsl[0];
    }
  } catch (error) {
    // Ignore errors
  }
});

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  updateContrast();
  
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

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* Custom range slider styles for brand blue */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-runnable-track {
  background: linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%));
  border-radius: 9999px;
  height: 8px;
}

input[type="range"]::-moz-range-track {
  background: linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%));
  border-radius: 9999px;
  height: 8px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background-color: #4f46e5; /* indigo-600 - brand blue */
  border: 2px solid #fff;
  border-radius: 50%;
  height: 16px;
  width: 16px;
  margin-top: -4px;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  transition: background-color 0.2s, box-shadow 0.2s;
}

html.dark input[type="range"]::-webkit-slider-thumb {
  background-color: #6366f1; /* indigo-500 - brand blue for dark mode */
  border-color: #1e293b;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

input[type="range"]::-webkit-slider-thumb:hover {
  background-color: #4338ca; /* indigo-700 */
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.3);
}

html.dark input[type="range"]::-webkit-slider-thumb:hover {
  background-color: #818cf8; /* indigo-400 */
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3);
}

input[type="range"]::-moz-range-thumb {
  background-color: #4f46e5; /* indigo-600 - brand blue */
  border: 2px solid #fff;
  border-radius: 50%;
  height: 16px;
  width: 16px;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  transition: background-color 0.2s, box-shadow 0.2s;
}

html.dark input[type="range"]::-moz-range-thumb {
  background-color: #6366f1; /* indigo-500 - brand blue for dark mode */
  border-color: #1e293b;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

input[type="range"]::-moz-range-thumb:hover {
  background-color: #4338ca; /* indigo-700 */
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.3);
}

html.dark input[type="range"]::-moz-range-thumb:hover {
  background-color: #818cf8; /* indigo-400 */
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3);
}
</style>

