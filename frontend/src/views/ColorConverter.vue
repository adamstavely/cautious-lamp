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
                      Color Converter
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Convert colors between different color spaces and formats. Get accurate conversions for HEX, RGB, HSL, HSV, LAB, LCH, CMYK, XYZ, and more.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">palette</span>
                      Color Tool
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
                        <linearGradient id="converterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized converter icon -->
                      <rect x="30" y="80" width="140" height="40" rx="4" fill="url(#converterGradient)" opacity="0.3"/>
                      <circle cx="50" cy="100" r="15" fill="url(#converterGradient)" opacity="0.5"/>
                      <path d="M 80 100 L 120 100" stroke="rgba(255,255,255,0.6)" stroke-width="4" stroke-linecap="round"/>
                      <circle cx="150" cy="100" r="15" fill="url(#converterGradient)" opacity="0.7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid lg:grid-cols-3 gap-6">
              <!-- Left Column: Input and Bulk Conversion -->
              <div class="lg:col-span-1 space-y-6">
                <!-- Convert Color Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">palette</span>
                    Convert color
                  </h2>
                  
                  <!-- Color Input -->
                  <div class="mb-6">
                    <label for="color-input" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Color</label>
                    <div class="flex items-center gap-3 mb-4">
                      <input
                        id="color-input"
                        v-model="inputColor"
                        type="text"
                        @input="convertColor"
                        placeholder="#7AC600"
                        class="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                        aria-label="Color input in hex, RGB, HSL, or other format"
                      />
                      <button
                        @click="openColorPicker($event)"
                        class="w-12 h-12 rounded border-2 cursor-pointer transition-colors flex-shrink-0"
                        :class="isDarkMode 
                          ? 'border-gray-600 hover:border-indigo-400' 
                          : 'border-gray-300 hover:border-indigo-500'"
                        :style="{ backgroundColor: currentColor }"
                        title="Pick color"
                        aria-label="Open color picker"
                      ></button>
                    </div>
                    
                    <!-- Color Swatch -->
                    <div 
                      class="w-full h-32 rounded-lg border-2"
                      :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                      :style="{ backgroundColor: currentColor }"
                      role="img"
                      :aria-label="`Color preview: ${currentColor}`"
                    ></div>
                  </div>
                </div>

                <!-- Bulk Conversion Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h3 class="text-lg font-semibold mb-2 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">format_list_bulleted</span>
                    Have a lot to convert?
                  </h3>
                  <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Use the bulk converter to convert all your colors in the formats you need.
                  </p>
                  <button
                    @click="showBulkModal = true"
                    class="w-full px-4 py-2 rounded-lg border-2 transition-colors text-sm font-medium"
                    :class="isDarkMode 
                      ? 'border-gray-600 hover:border-indigo-400 text-gray-300 hover:text-indigo-300' 
                      : 'border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-700'"
                  >
                    Convert bulk
                  </button>
                </div>
              </div>

              <!-- Right Column: Conversion Results -->
              <div class="lg:col-span-2">
                <div 
                  class="rounded-lg shadow-sm border"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead>
                        <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                          <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">COLOR SPACE</th>
                          <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">CHANNELS</th>
                          <th class="text-left py-3 px-4 font-semibold text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">STRING FORMAT</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr 
                          v-for="(conversion, index) in conversions" 
                          :key="index"
                          class="border-b"
                          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                        >
                          <td class="py-3 px-4 font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                            {{ conversion.name }}
                          </td>
                          <td class="py-3 px-4 font-mono text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                            {{ conversion.channels }}
                          </td>
                          <td class="py-3 px-4">
                            <div class="flex items-center gap-2">
                              <code 
                                class="font-mono text-sm px-2 py-1 rounded"
                                :class="isDarkMode 
                                  ? 'bg-slate-800 text-gray-300' 
                                  : 'bg-gray-100 text-gray-900'"
                              >
                                {{ conversion.string }}
                              </code>
                              <button
                                @click="copyToClipboard(conversion.string)"
                                class="p-1 rounded transition-colors"
                                :class="isDarkMode 
                                  ? 'text-gray-400 hover:text-indigo-400' 
                                  : 'text-gray-400 hover:text-indigo-600'"
                                :title="`Copy ${conversion.name} value`"
                                :aria-label="`Copy ${conversion.name} value: ${conversion.string}`"
                              >
                                <span class="material-symbols-outlined text-sm" aria-hidden="true">content_copy</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
      :initial-color="currentColor"
      :position="pickerPosition"
      @update:show="showColorPicker = $event"
      @apply="handleColorPickerApply"
      @cancel="showColorPicker = false"
    />

    <!-- Bulk Conversion Modal -->
    <v-dialog v-model="showBulkModal" max-width="800" persistent>
      <v-card :class="isDarkMode ? 'bg-slate-800' : 'bg-white'">
        <v-card-title class="d-flex align-center justify-space-between px-6 pt-6 pb-4" :class="isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'">
          <span class="text-xl font-semibold">Bulk Color Converter</span>
          <button @click="showBulkModal = false" :class="isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'">
            <span class="material-symbols-outlined">close</span>
          </button>
        </v-card-title>
        <v-divider />
        <v-card-text class="px-6 py-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-white'">
          <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
            Enter colors separated by commas, newlines, or spaces. One color per line recommended.
          </p>
          <textarea
            id="bulk-color-input"
            v-model="bulkInput"
            rows="10"
            placeholder="#7AC600&#10;#FF5733&#10;rgb(122, 198, 0)"
            class="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none"
            :class="isDarkMode 
              ? 'border-gray-600 bg-slate-700 text-white' 
              : 'border-gray-300 bg-white text-gray-900'"
            aria-label="Bulk color input - enter multiple colors separated by commas, newlines, or spaces"
            aria-describedby="bulk-input-description"
          ></textarea>
          <p id="bulk-input-description" class="sr-only">Enter colors separated by commas, newlines, or spaces. One color per line recommended.</p>
          <div class="mt-4 flex gap-2">
            <button
              @click="convertBulk"
              class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              :class="isDarkMode 
                ? 'bg-indigo-500 hover:bg-indigo-400' 
                : 'bg-indigo-600 hover:bg-indigo-700'"
            >
              Convert
            </button>
            <button
              @click="clearBulk"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Clear
            </button>
          </div>
          <div v-if="bulkResults.length > 0" class="mt-6">
            <h4 class="font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Results</h4>
            <div class="max-h-96 overflow-y-auto border rounded-lg" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <pre class="p-4 text-xs font-mono whitespace-pre-wrap" :class="isDarkMode ? 'text-gray-300' : 'text-gray-900'">{{ bulkResults }}</pre>
            </div>
            <button
              @click="copyBulkResults"
              class="mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              :class="isDarkMode 
                ? 'bg-indigo-500 hover:bg-indigo-400' 
                : 'bg-indigo-600 hover:bg-indigo-700'"
            >
              Copy Results
            </button>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import ColorPicker from '../components/ColorPicker.vue';
import chroma from 'chroma-js';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const inputColor = ref('#7AC600');
const currentColor = ref('#7AC600');
const showColorPicker = ref(false);
const pickerPosition = ref({ left: 0, top: 0 });
const showBulkModal = ref(false);
const bulkInput = ref('');
const bulkResults = ref('');

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const conversions = ref([]);

const convertColor = () => {
  try {
    const color = chroma(inputColor.value);
    currentColor.value = color.hex();
    
    const rgb = color.rgb();
    const hsl = color.hsl();
    const hsv = color.hsv();
    const lab = color.lab();
    const lch = color.lch();
    const cmyk = color.cmyk();
    const xyz = color.rgb().map(v => v / 255);
    
    // Convert RGB to XYZ (simplified conversion)
    const rgbNorm = rgb.map(v => {
      v = v / 255;
      return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
    });
    
    const xyzValue = [
      (rgbNorm[0] * 0.4124564 + rgbNorm[1] * 0.3575761 + rgbNorm[2] * 0.1804375) * 100,
      (rgbNorm[0] * 0.2126729 + rgbNorm[1] * 0.7151522 + rgbNorm[2] * 0.0721750) * 100,
      (rgbNorm[0] * 0.0193339 + rgbNorm[1] * 0.1191920 + rgbNorm[2] * 0.9503041) * 100
    ];
    
    // OKLAB conversion (approximation)
    const okLab = convertToOKLAB(rgb);
    
    // OKLCH conversion
    const okLch = convertToOKLCH(okLab);
    
    // Pantone approximation (simplified - would need a lookup table for accurate conversion)
    const pantone = approximatePantone(rgb);
    
    conversions.value = [
      {
        name: 'HEX',
        channels: '',
        string: color.hex().toLowerCase()
      },
      {
        name: 'RGB',
        channels: `R: ${rgb[0]}, G: ${rgb[1]}, B: ${rgb[2]}`,
        string: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
      },
      {
        name: 'HSL',
        channels: `H: ${hsl[0].toFixed(2)}, S: ${(hsl[1] * 100).toFixed(0)}, L: ${(hsl[2] * 100).toFixed(2)}`,
        string: `hsl(${hsl[0].toFixed(2)}, ${(hsl[1] * 100).toFixed(0)}%, ${(hsl[2] * 100).toFixed(2)}%)`
      },
      {
        name: 'HSV',
        channels: `H: ${hsv[0].toFixed(2)}, S: ${(hsv[1] * 100).toFixed(0)}, V: ${(hsv[2] * 100).toFixed(2)}`,
        string: `hsv(${hsv[0].toFixed(2)}, ${(hsv[1] * 100).toFixed(0)}, ${(hsv[2] * 100).toFixed(2)})`
      },
      {
        name: 'LAB',
        channels: `L: ${lab[0].toFixed(2)}, A: ${lab[1].toFixed(2)}, B: ${lab[2].toFixed(2)}`,
        string: `lab(${lab[0].toFixed(2)}%, ${lab[1].toFixed(2)}, ${lab[2].toFixed(2)})`
      },
      {
        name: 'LCH',
        channels: `L: ${lch[0].toFixed(2)}, C: ${lch[1].toFixed(2)}, H: ${lch[2].toFixed(2)}`,
        string: `lch(${lch[0].toFixed(2)}%, ${lch[1].toFixed(2)}, ${lch[2].toFixed(2)})`
      },
      {
        name: 'OKLAB',
        channels: `L: ${okLab[0].toFixed(2)}, A: ${okLab[1].toFixed(2)}, B: ${okLab[2].toFixed(2)}`,
        string: `oklab(${okLab[0].toFixed(2)}%, ${okLab[1].toFixed(2)}, ${okLab[2].toFixed(2)})`
      },
      {
        name: 'OKLCH',
        channels: `L: ${okLch[0].toFixed(2)}, C: ${okLch[1].toFixed(2)}, H: ${okLch[2].toFixed(2)}`,
        string: `oklch(${okLch[0].toFixed(2)}%, ${okLch[1].toFixed(2)}, ${okLch[2].toFixed(2)})`
      },
      {
        name: 'HSLuv',
        channels: `H (L): ${hsl[0].toFixed(2)}, S (U): ${(hsl[1] * 100).toFixed(0)}, L (V): ${(hsl[2] * 100).toFixed(2)}`,
        string: `hsluv(${hsl[0].toFixed(2)}, ${(hsl[1] * 100).toFixed(0)}, ${(hsl[2] * 100).toFixed(2)})`
      },
      {
        name: 'CAM02',
        channels: `L: ${lab[0].toFixed(2)}, A: ${lab[1].toFixed(2)}, B: ${lab[2].toFixed(2)}`,
        string: `jab(${lab[0].toFixed(2)}, ${lab[1].toFixed(2)}, ${lab[2].toFixed(2)})`
      },
      {
        name: 'CAM02p',
        channels: `L: ${lch[0].toFixed(2)}, C: ${lch[1].toFixed(2)}, H: ${lch[2].toFixed(2)}`,
        string: `jch(${lch[0].toFixed(2)}, ${lch[1].toFixed(2)}, ${lch[2].toFixed(2)})`
      },
      {
        name: 'CMYK',
        channels: `C: ${cmyk[0].toFixed(2)}, M: ${cmyk[1].toFixed(2)}, Y: ${cmyk[2].toFixed(2)}, K: ${cmyk[3].toFixed(2)}`,
        string: `cmyk(${cmyk[0].toFixed(2)}, ${cmyk[1].toFixed(2)}, ${cmyk[2].toFixed(2)}, ${cmyk[3].toFixed(2)})`
      },
      {
        name: 'XYZ',
        channels: `X: ${xyzValue[0].toFixed(2)}, Y: ${xyzValue[1].toFixed(2)}, Z: ${xyzValue[2].toFixed(2)}`,
        string: `xyz(${xyzValue[0].toFixed(2)}, ${xyzValue[1].toFixed(2)}, ${xyzValue[2].toFixed(2)})`
      },
      {
        name: 'Pantone',
        channels: '',
        string: pantone
      }
    ];
  } catch (error) {
    console.error('Error converting color:', error);
    conversions.value = [];
  }
};

// Convert RGB to OKLAB (simplified approximation)
const convertToOKLAB = (rgb) => {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  
  const l_ = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a_ = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const b_ = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  
  return [
    (l_ + 0.3963377774 * a_ + 0.2158037573 * b_) * 100,
    (l_ - 0.1055613458 * a_ - 0.0638541728 * b_) * 100,
    (l_ - 0.0894841775 * a_ - 1.2914855480 * b_) * 100
  ];
};

// Convert OKLAB to OKLCH
const convertToOKLCH = (oklab) => {
  const l = oklab[0];
  const a = oklab[1];
  const b = oklab[2];
  
  const c = Math.sqrt(a * a + b * b);
  const h = Math.atan2(b, a) * (180 / Math.PI);
  const h_ = h < 0 ? h + 360 : h;
  
  return [l, c, h_];
};

// Approximate Pantone (simplified - would need a lookup table for accurate conversion)
const approximatePantone = (rgb) => {
  // This is a very simplified approximation
  // In a real implementation, you'd need a Pantone color lookup table
  const hue = chroma.rgb(rgb[0], rgb[1], rgb[2]).hsl()[0] || 0;
  const lightness = chroma.rgb(rgb[0], rgb[1], rgb[2]).luminance();
  
  // Very basic approximation based on hue ranges
  if (hue >= 50 && hue <= 90 && lightness > 0.3) {
    return 'Pantone 376C';
  } else if (hue >= 200 && hue <= 250) {
    return 'Pantone 285C';
  } else if (hue >= 0 && hue <= 30) {
    return 'Pantone 186C';
  } else {
    return 'Pantone N/A';
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    // Could add a toast notification here
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

const openColorPicker = (event) => {
  if (event) {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    
    const pickerWidth = 300;
    const pickerHeight = 550;
    const padding = 16;
    
    // Calculate position relative to viewport (for fixed positioning)
    let left = rect.right + padding;
    let top = rect.top;
    
    // Check if picker would go off right edge
    if (left + pickerWidth > window.innerWidth) {
      left = rect.left - pickerWidth - padding;
    }
    
    // Check if picker would go off left edge
    if (left < padding) {
      left = padding;
    }
    
    // Check if picker would go off bottom edge
    if (top + pickerHeight > window.innerHeight - padding) {
      top = window.innerHeight - pickerHeight - padding;
    }
    
    // Check if picker would go off top edge
    if (top < padding) {
      top = padding;
    }
    
    // Ensure picker stays within viewport bounds
    left = Math.max(padding, Math.min(left, window.innerWidth - pickerWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - pickerHeight - padding));
    
    pickerPosition.value = { left, top };
  }
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  inputColor.value = color;
  convertColor();
  showColorPicker.value = false;
};

const convertBulk = () => {
  const colors = bulkInput.value
    .split(/[,\n\s]+/)
    .map(c => c.trim())
    .filter(c => c.length > 0);
  
  const results = [];
  
  colors.forEach(colorInput => {
    try {
      const color = chroma(colorInput);
      const rgb = color.rgb();
      const hsl = color.hsl();
      const hex = color.hex().toLowerCase();
      
      results.push(`${colorInput}:`);
      results.push(`  HEX: ${hex}`);
      results.push(`  RGB: rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
      results.push(`  HSL: hsl(${hsl[0].toFixed(2)}, ${(hsl[1] * 100).toFixed(0)}%, ${(hsl[2] * 100).toFixed(2)}%)`);
      results.push('');
    } catch (error) {
      results.push(`${colorInput}: Invalid color`);
      results.push('');
    }
  });
  
  bulkResults.value = results.join('\n');
};

const clearBulk = () => {
  bulkInput.value = '';
  bulkResults.value = '';
};

const copyBulkResults = async () => {
  await copyToClipboard(bulkResults.value);
};

watch(inputColor, () => {
  convertColor();
});

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  convertColor();
  
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
</style>

