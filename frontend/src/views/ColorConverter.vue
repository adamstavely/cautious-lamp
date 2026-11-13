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
                        :aria-invalid="inputError ? 'true' : 'false'"
                        aria-describedby="color-input-error"
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
                    
                    <p
                      v-if="inputError"
                      id="color-input-error"
                      class="text-sm mb-4"
                      :class="isDarkMode ? 'text-red-300' : 'text-red-700'"
                    >{{ inputError }}</p>

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
                  <div v-if="notice && !showBulkModal" class="p-4 pb-0">
                    <InlineNotice :notice="notice" @dismiss="clearNotice" />
                  </div>
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
          <InlineNotice v-if="notice" class="mt-4" :notice="notice" @dismiss="clearNotice" />
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
import { ref, watch, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import ColorPicker from '../components/ColorPicker.vue';
import InlineNotice from '../components/InlineNotice.vue';
import chroma from 'chroma-js';
import { Hsluv } from 'hsluv';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';

const isDarkMode = useDarkMode();
const { notice, showNotice, clearNotice } = useNotice();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const inputColor = ref('#7AC600');
const currentColor = ref('#7AC600');
const showColorPicker = ref(false);
const pickerPosition = ref({ left: 0, top: 0 });
const showBulkModal = ref(false);
const bulkInput = ref('');
const bulkResults = ref('');





const conversions = ref([]);
const inputError = ref('');

// ---------------------------------------------------------------------------
// Colour maths (sRGB, CSS Color 4 matrices; OKLab per Björn Ottosson)
// ---------------------------------------------------------------------------

// Fixed-precision number without "-0".
const fmt = (value, digits = 2) => {
  const n = Number.isFinite(value) ? value : 0;
  const s = n.toFixed(digits);
  return Number(s) === 0 ? (0).toFixed(digits) : s;
};

// sRGB channel (0-255) to linear light (0-1).
const srgbToLinear = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const mul3 = (m, v) => m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);

const LIN_SRGB_TO_XYZ_D65 = [
  [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607],
];

// Bradford chromatic adaptation D65 -> D50 (CSS lab()/lch() are D50).
const XYZ_D65_TO_D50 = [
  [1.0479298208405488, 0.022946793341019088, -0.05019222954313557],
  [0.029627815688159344, 0.990434484573249, -0.01707382502938514],
  [-0.009243058152591178, 0.015055144896577895, 0.7521316354461029],
];
const D50_WHITE = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];

// XYZ (D65), Y of white = 1.
const rgbToXyzD65 = (rgb) => mul3(LIN_SRGB_TO_XYZ_D65, rgb.map(srgbToLinear));

// CIE Lab relative to D50, as used by CSS lab().
const rgbToLabD50 = (rgb) => {
  const xyz = mul3(XYZ_D65_TO_D50, rgbToXyzD65(rgb));
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;
  const f = xyz.map((v, i) => {
    const x = v / D50_WHITE[i];
    return x > epsilon ? Math.cbrt(x) : (kappa * x + 16) / 116;
  });
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
};

// OKLab: linear sRGB -> LMS -> cube root -> Lab. L is 0-1; a/b roughly ±0.4.
const rgbToOklab = (rgb) => {
  const [r, g, b] = rgb.map(srgbToLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
};

// Rectangular (L, a, b) to polar (L, C, h). Below `epsilon` chroma the colour
// is treated as achromatic and the hue reported as 0 rather than noise.
const toPolar = ([L, a, b], epsilon) => {
  const c = Math.sqrt(a * a + b * b);
  let h = c < epsilon ? 0 : (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return [L, c, h];
};

// Hue that is NaN for greys (chroma.js) shown as 0.
const hue = (h) => (Number.isFinite(h) ? h : 0);

const toHsluv = (hex) => {
  const conv = new Hsluv();
  conv.hex = hex.slice(0, 7);
  conv.hexToHsluv();
  return [hue(conv.hsluv_h), conv.hsluv_s, conv.hsluv_l];
};

// A small table of Pantone coated colours with Pantone's published sRGB
// equivalents. The nearest entry (by OKLab distance) is only a rough guide:
// Pantone is a printed ink system and has no exact sRGB conversion.
const PANTONE_SAMPLES = [
  ['Yellow C', '#FEDD00'], ['109 C', '#FFD100'], ['123 C', '#FFC72C'], ['7406 C', '#F1C400'],
  ['1375 C', '#FF9E1B'], ['151 C', '#FF8200'], ['1505 C', '#FF6900'], ['Orange 021 C', '#FE5000'],
  ['Red 032 C', '#EF3340'], ['485 C', '#DA291C'], ['1795 C', '#D22630'], ['186 C', '#C8102E'],
  ['199 C', '#D50032'], ['200 C', '#BA0C2F'], ['7421 C', '#651D32'], ['219 C', '#DA1884'],
  ['Rhodamine Red C', '#E10098'], ['254 C', '#84329B'], ['Violet C', '#440099'], ['2685 C', '#330072'],
  ['Reflex Blue C', '#001489'], ['286 C', '#0033A0'], ['293 C', '#003DA5'], ['300 C', '#005EB8'],
  ['285 C', '#0072CE'], ['3005 C', '#0077C8'], ['Process Blue C', '#0085CA'], ['299 C', '#00A3E0'],
  ['311 C', '#05C3DE'], ['320 C', '#009CA6'], ['3275 C', '#00B2A9'], ['Green C', '#00AB84'],
  ['347 C', '#009A44'], ['355 C', '#009639'], ['354 C', '#00B140'], ['368 C', '#78BE20'],
  ['376 C', '#84BD00'], ['382 C', '#C4D600'], ['534 C', '#1B365D'], ['289 C', '#0C2340'],
  ['7546 C', '#253746'], ['432 C', '#333F48'], ['469 C', '#693F23'], ['4625 C', '#4F2C1D'],
  ['7527 C', '#D6D2C4'], ['Cool Gray 1 C', '#D9D9D6'], ['Cool Gray 5 C', '#B1B3B3'],
  ['Cool Gray 9 C', '#75787B'], ['Cool Gray 11 C', '#53565A'], ['Black C', '#2D2926'],
].map(([name, hex]) => ({ name, hex, oklab: rgbToOklab(chroma(hex).rgb()) }));

const nearestPantone = (rgb) => {
  const target = rgbToOklab(rgb);
  let best = PANTONE_SAMPLES[0];
  let bestDistance = Infinity;
  for (const sample of PANTONE_SAMPLES) {
    const d = Math.hypot(
      sample.oklab[0] - target[0],
      sample.oklab[1] - target[1],
      sample.oklab[2] - target[2],
    );
    if (d < bestDistance) {
      bestDistance = d;
      best = sample;
    }
  }
  return { ...best, distance: bestDistance };
};

// CSS alpha suffix for the space-separated colour functions.
const alphaSuffix = (alpha) => (alpha < 1 ? ` / ${fmt(alpha, 3).replace(/\.?0+$/, '')}` : '');

const hslString = (hsl, alpha) => {
  const [h, s, l] = [hue(hsl[0]), hsl[1] * 100, hsl[2] * 100];
  return alpha < 1
    ? `hsla(${fmt(h)}, ${fmt(s)}%, ${fmt(l)}%, ${fmt(alpha, 3).replace(/\.?0+$/, '')})`
    : `hsl(${fmt(h)}, ${fmt(s)}%, ${fmt(l)}%)`;
};

const rgbString = (rgb, alpha) => (alpha < 1
  ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${fmt(alpha, 3).replace(/\.?0+$/, '')})`
  : `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);

const convertColor = () => {
  const raw = inputColor.value.trim();
  if (!raw) {
    inputError.value = '';
    conversions.value = [];
    return;
  }
  let color;
  try {
    color = chroma(raw);
  } catch (error) {
    inputError.value = 'Not a recognised colour. Try a hex value, a CSS colour function (rgb, hsl, lab, lch, oklab, oklch) or a colour name.';
    conversions.value = [];
    return;
  }
  inputError.value = '';
  currentColor.value = color.hex();

  const alpha = color.alpha();
  const rgb = color.rgb();
  const hsl = color.hsl();
  const hsv = color.hsv();
  const cmyk = color.cmyk();
  const xyz = rgbToXyzD65(rgb);
  const lab = rgbToLabD50(rgb);
  const lch = toPolar(lab, 0.0015);
  const okLab = rgbToOklab(rgb);
  const okLch = toPolar(okLab, 0.00004);
  const hsluv = toHsluv(color.hex('rgb'));
  const pantone = nearestPantone(rgb);
  const a = alphaSuffix(alpha);

  conversions.value = [
    {
      name: 'HEX',
      channels: alpha < 1 ? `Alpha: ${fmt(alpha, 3)}` : '',
      string: color.hex().toLowerCase()
    },
    {
      name: 'RGB',
      channels: `R: ${rgb[0]}, G: ${rgb[1]}, B: ${rgb[2]}`,
      string: rgbString(rgb, alpha)
    },
    {
      name: 'HSL',
      channels: `H: ${fmt(hue(hsl[0]))}, S: ${fmt(hsl[1] * 100)}, L: ${fmt(hsl[2] * 100)}`,
      string: hslString(hsl, alpha)
    },
    {
      name: 'HSV',
      channels: `H: ${fmt(hue(hsv[0]))}, S: ${fmt(hsv[1] * 100)}, V: ${fmt(hsv[2] * 100)}`,
      string: `hsv(${fmt(hue(hsv[0]))}, ${fmt(hsv[1] * 100)}%, ${fmt(hsv[2] * 100)}%)`
    },
    {
      name: 'LAB (CIE, D50)',
      channels: `L: ${fmt(lab[0])}, A: ${fmt(lab[1])}, B: ${fmt(lab[2])}`,
      string: `lab(${fmt(lab[0])}% ${fmt(lab[1])} ${fmt(lab[2])}${a})`
    },
    {
      name: 'LCH (CIE, D50)',
      channels: `L: ${fmt(lch[0])}, C: ${fmt(lch[1])}, H: ${fmt(lch[2])}`,
      string: `lch(${fmt(lch[0])}% ${fmt(lch[1])} ${fmt(lch[2])}${a})`
    },
    {
      name: 'OKLAB',
      channels: `L: ${fmt(okLab[0], 4)}, A: ${fmt(okLab[1], 4)}, B: ${fmt(okLab[2], 4)}`,
      string: `oklab(${fmt(okLab[0] * 100)}% ${fmt(okLab[1], 4)} ${fmt(okLab[2], 4)}${a})`
    },
    {
      name: 'OKLCH',
      channels: `L: ${fmt(okLch[0], 4)}, C: ${fmt(okLch[1], 4)}, H: ${fmt(okLch[2])}`,
      string: `oklch(${fmt(okLch[0] * 100)}% ${fmt(okLch[1], 4)} ${fmt(okLch[2])}${a})`
    },
    {
      name: 'HSLuv',
      channels: `H: ${fmt(hsluv[0])}, S: ${fmt(hsluv[1])}, L: ${fmt(hsluv[2])}`,
      string: `hsluv(${fmt(hsluv[0])}, ${fmt(hsluv[1])}%, ${fmt(hsluv[2])}%)`
    },
    {
      name: 'CMYK (naive)',
      channels: `C: ${fmt(cmyk[0] * 100)}, M: ${fmt(cmyk[1] * 100)}, Y: ${fmt(cmyk[2] * 100)}, K: ${fmt(cmyk[3] * 100)}`,
      string: `device-cmyk(${fmt(cmyk[0] * 100)}% ${fmt(cmyk[1] * 100)}% ${fmt(cmyk[2] * 100)}% ${fmt(cmyk[3] * 100)}%)`
    },
    {
      name: 'XYZ (D65)',
      channels: `X: ${fmt(xyz[0] * 100)}, Y: ${fmt(xyz[1] * 100)}, Z: ${fmt(xyz[2] * 100)}`,
      string: `color(xyz-d65 ${fmt(xyz[0], 4)} ${fmt(xyz[1], 4)} ${fmt(xyz[2], 4)}${a})`
    },
    {
      name: 'Pantone (nearest, approximate)',
      channels: `Closest of ${PANTONE_SAMPLES.length} common coated colours (${pantone.hex}); ΔEok ${fmt(pantone.distance * 100, 1)}`,
      string: `PANTONE ${pantone.name}`
    }
  ];
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showNotice('Copied to clipboard.', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Could not copy to the clipboard.', 'error');
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

// Split on commas / whitespace / newlines, but not inside parentheses, so
// "rgb(122, 198, 0)" stays one colour.
const splitColorList = (text) => {
  const colors = [];
  let current = '';
  let depth = 0;
  for (const ch of text) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (depth === 0 && /[,\s]/.test(ch)) {
      if (current.trim()) colors.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) colors.push(current.trim());
  return colors;
};

const convertBulk = () => {
  const colors = splitColorList(bulkInput.value);
  
  const results = [];
  
  colors.forEach(colorInput => {
    try {
      const color = chroma(colorInput);
      const rgb = color.rgb();
      const hsl = color.hsl();
      const hex = color.hex().toLowerCase();
      
      results.push(`${colorInput}:`);
      results.push(`  HEX: ${hex}`);
      const alpha = color.alpha();
      const okLch = toPolar(rgbToOklab(rgb), 0.00004);
      results.push(`  RGB: ${rgbString(rgb, alpha)}`);
      results.push(`  HSL: ${hslString(hsl, alpha)}`);
      results.push(`  OKLCH: oklch(${fmt(okLch[0] * 100)}% ${fmt(okLch[1], 4)} ${fmt(okLch[2])}${alphaSuffix(alpha)})`);
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

onMounted(() => {
  convertColor();
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

