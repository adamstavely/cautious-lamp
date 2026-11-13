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
                      APCA Calculator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Compose colors with consistent APCA (Advanced Perceptual Contrast Algorithm) contrast ratios. Calculate accessible color combinations using the modern contrast standard.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">contrast</span>
                      Color Calculator
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
                        <linearGradient id="apcaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized contrast icon -->
                      <circle cx="100" cy="100" r="60" fill="url(#apcaGradient)" opacity="0.2"/>
                      <circle cx="100" cy="100" r="40" fill="url(#apcaGradient)" opacity="0.4"/>
                      <circle cx="100" cy="100" r="20" fill="url(#apcaGradient)" opacity="0.6"/>
                      <path d="M 70 100 L 130 100" stroke="rgba(255,255,255,0.6)" stroke-width="4" stroke-linecap="round"/>
                      <path d="M 100 70 L 100 130" stroke="rgba(255,255,255,0.6)" stroke-width="4" stroke-linecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <!-- Contrast Model Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">tune</span>
                Contrast Model
              </h2>
              
              <div class="flex gap-4">
                <button
                  @click="contrastModel = 'apca'"
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="contrastModel === 'apca'
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  APCA (0-108)
                </button>
                <button
                  @click="contrastModel = 'wcag'"
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="contrastModel === 'wcag'
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  WCAG (1-21)
                </button>
              </div>
            </div>

            <!-- Color Composition Section -->
            <div 
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-6 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">palette</span>
                Color Composition
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Reference Color -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Reference Color ({{ colorPosition === 'bg' ? 'Background' : 'Foreground' }})
                  </label>
                  <div class="flex gap-2 mb-4">
                    <input
                      v-model="referenceColor"
                      type="text"
                      placeholder="#ffffff"
                      class="flex-1 px-4 py-2 rounded-lg border"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900'"
                    />
                    <input
                      v-model="referenceColor"
                      type="color"
                      class="w-16 h-10 rounded-lg border cursor-pointer"
                      :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                    />
                  </div>
                  <div class="flex gap-2 mb-4">
                    <button
                      @click="colorPosition = 'bg'"
                      class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      :class="colorPosition === 'bg'
                        ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                        : (isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                    >
                      Background
                    </button>
                    <button
                      @click="colorPosition = 'fg'"
                      class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      :class="colorPosition === 'fg'
                        ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                        : (isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                    >
                      Foreground
                    </button>
                  </div>
                </div>

                <!-- Contrast Ratio -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Desired Contrast Ratio
                    <span class="text-xs text-gray-500 ml-1">
                      ({{ contrastModel === 'apca' ? '0-108' : '1-21' }})
                    </span>
                  </label>
                  <input
                    v-model.number="contrastRatio"
                    type="number"
                    :min="contrastModel === 'apca' ? 0 : 1"
                    :max="contrastModel === 'apca' ? 108 : 21"
                    step="0.1"
                    class="w-full px-4 py-2 rounded-lg border mb-4"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'"
                  />
                  <input
                    v-model.number="contrastRatio"
                    type="range"
                    :min="contrastModel === 'apca' ? 0 : 1"
                    :max="contrastModel === 'apca' ? 108 : 21"
                    step="0.1"
                    class="w-full"
                  />
                </div>
              </div>

              <!-- Color Parameters -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <!-- Chroma -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Chroma (0-0.37)
                  </label>
                  <input
                    v-model.number="chroma"
                    type="number"
                    min="0"
                    max="0.37"
                    step="0.01"
                    class="w-full px-4 py-2 rounded-lg border mb-2"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'"
                  />
                  <input
                    v-model.number="chroma"
                    type="range"
                    min="0"
                    max="0.37"
                    step="0.01"
                    class="w-full"
                  />
                  <div class="flex items-center gap-2 mt-2">
                    <button
                      @click="useMaxChroma = !useMaxChroma"
                      class="px-3 py-1 text-xs rounded-lg transition-colors"
                      :class="useMaxChroma
                        ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                        : (isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700')"
                    >
                      Use Max Chroma
                    </button>
                    <input
                      v-if="useMaxChroma"
                      v-model.number="maxChromaLimit"
                      type="number"
                      min="0"
                      max="0.37"
                      step="0.01"
                      placeholder="Limit"
                      class="flex-1 px-2 py-1 text-xs rounded-lg border"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'"
                    />
                  </div>
                </div>

                <!-- Hue -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Hue (0-360)
                  </label>
                  <input
                    v-model.number="hue"
                    type="number"
                    min="0"
                    max="360"
                    step="1"
                    class="w-full px-4 py-2 rounded-lg border mb-2"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'"
                  />
                  <input
                    v-model.number="hue"
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    class="w-full"
                  />
                </div>

                <!-- Search Direction -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Search Direction
                  </label>
                  <select
                    v-model="searchDirection"
                    class="w-full px-4 py-2 rounded-lg border"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'"
                  >
                    <option value="auto">Auto</option>
                    <option value="lighter">Lighter</option>
                    <option value="darker">Darker</option>
                  </select>
                </div>
              </div>

              <!-- Calculate Button -->
              <div class="mt-6">
                <button
                  @click="calculateColor"
                  class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Calculate Color
                </button>
                <InlineNotice :notice="notice" class="mt-4" @dismiss="clearNotice" />
              </div>
            </div>

            <!-- Result Section -->
            <div 
              v-if="calculatedColor"
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-6 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">check_circle</span>
                Calculated Color
              </h2>
              <InlineNotice :notice="copyNotice" class="mb-4" @dismiss="clearCopyNotice" />
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Color Preview -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Color Preview
                  </label>
                  <div 
                    class="w-full h-32 rounded-lg border-2 mb-4"
                    :style="{ backgroundColor: calculatedColorHex }"
                    :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                  ></div>
                  <div 
                    class="w-full h-32 rounded-lg border-2"
                    :style="{ backgroundColor: sampleColors.bg }"
                    :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                  >
                    <div 
                      class="w-full h-full flex items-center justify-center text-lg font-semibold"
                      :style="{ color: sampleColors.fg }"
                    >
                      Sample Text
                    </div>
                  </div>
                </div>

                <!-- Color Formats -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Color Formats
                  </label>
                  <div class="space-y-3">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">OKLCH</label>
                      <div class="flex gap-2">
                        <input
                          :value="calculatedColorOklch"
                          readonly
                          class="flex-1 px-3 py-2 rounded-lg border text-sm font-mono"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white' 
                            : 'bg-gray-50 border-gray-300 text-gray-900'"
                        />
                        <button
                          @click="copyToClipboard(calculatedColorOklch)"
                          class="px-3 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                        >
                          <span class="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">HEX</label>
                      <div class="flex gap-2">
                        <input
                          :value="calculatedColorHex"
                          readonly
                          class="flex-1 px-3 py-2 rounded-lg border text-sm font-mono"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white' 
                            : 'bg-gray-50 border-gray-300 text-gray-900'"
                        />
                        <button
                          @click="copyToClipboard(calculatedColorHex)"
                          class="px-3 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                        >
                          <span class="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">RGB</label>
                      <div class="flex gap-2">
                        <input
                          :value="calculatedColorRgb"
                          readonly
                          class="flex-1 px-3 py-2 rounded-lg border text-sm font-mono"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white' 
                            : 'bg-gray-50 border-gray-300 text-gray-900'"
                        />
                        <button
                          @click="copyToClipboard(calculatedColorRgb)"
                          class="px-3 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                        >
                          <span class="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">Display P3</label>
                      <div class="flex gap-2">
                        <input
                          :value="calculatedColorP3"
                          readonly
                          class="flex-1 px-3 py-2 rounded-lg border text-sm font-mono"
                          :class="isDarkMode 
                            ? 'bg-slate-800 border-gray-600 text-white' 
                            : 'bg-gray-50 border-gray-300 text-gray-900'"
                        />
                        <button
                          @click="copyToClipboard(calculatedColorP3)"
                          class="px-3 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                        >
                          <span class="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Color Manipulation Section -->
            <div 
              v-if="calculatedColor"
              class="rounded-lg shadow-sm border p-6 mb-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h2 class="text-lg font-semibold mb-6 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">tune</span>
                Adjust Color
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Adjust Contrast -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Adjust Contrast
                  </label>
                  <input
                    v-model.number="contrastAdjustment"
                    type="number"
                    :min="contrastModel === 'apca' ? -108 : -21"
                    :max="contrastModel === 'apca' ? 108 : 21"
                    step="0.1"
                    class="w-full px-4 py-2 rounded-lg border mb-2"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'"
                  />
                  <button
                    @click="adjustContrast"
                    class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <!-- Adjust Chroma -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Adjust Chroma
                  </label>
                  <input
                    v-model.number="chromaAdjustment"
                    type="number"
                    min="-0.37"
                    max="0.37"
                    step="0.01"
                    class="w-full px-4 py-2 rounded-lg border mb-2"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'"
                  />
                  <button
                    @click="adjustChroma"
                    class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <!-- Adjust Hue -->
                <div>
                  <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Adjust Hue
                  </label>
                  <input
                    v-model.number="hueAdjustment"
                    type="number"
                    min="-360"
                    max="360"
                    step="1"
                    class="w-full px-4 py-2 rounded-lg border mb-2"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'"
                  />
                  <button
                    @click="adjustHue"
                    class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { apcach, crToBg, crToFg, maxChroma, apcachToCss, setContrast, setChroma, setHue } from 'apcach';

const isDarkMode = useDarkMode();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const { notice, showNotice, clearNotice } = useNotice();
const { notice: copyNotice, showNotice: showCopyNotice, clearNotice: clearCopyNotice } = useNotice();

// Calculator state
const contrastModel = ref('apca');
const referenceColor = ref('#ffffff');
const colorPosition = ref('bg');
const contrastRatio = ref(60);
const chroma = ref(0.2);
const hue = ref(145);
const useMaxChroma = ref(false);
const maxChromaLimit = ref(0.37);
const searchDirection = ref('auto');
const calculatedColor = ref(null);

// Adjustment values
const contrastAdjustment = ref(0);
const chromaAdjustment = ref(0);
const hueAdjustment = ref(0);

// Computed color formats
const calculatedColorOklch = computed(() => {
  if (!calculatedColor.value) return '';
  try {
    return apcachToCss(calculatedColor.value, 'oklch');
  } catch (e) {
    return '';
  }
});

const calculatedColorHex = computed(() => {
  if (!calculatedColor.value) return '';
  try {
    return apcachToCss(calculatedColor.value, 'hex');
  } catch (e) {
    return '';
  }
});

const calculatedColorRgb = computed(() => {
  if (!calculatedColor.value) return '';
  try {
    return apcachToCss(calculatedColor.value, 'rgb');
  } catch (e) {
    return '';
  }
});

const calculatedColorP3 = computed(() => {
  if (!calculatedColor.value) return '';
  try {
    return apcachToCss(calculatedColor.value, 'p3');
  } catch (e) {
    return '';
  }
});

// Contrast limits per model: APCA Lc 0..108, WCAG ratio 1..21.
const contrastRange = () => (contrastModel.value === 'apca' ? [0, 108] : [1, 21]);
const clampContrast = (value) => {
  const [min, max] = contrastRange();
  return Math.max(min, Math.min(max, value));
};
const wrapHue = (h) => ((h % 360) + 360) % 360;

// The two scales are not comparable, so switching model resets to a sensible default.
watch(contrastModel, (model) => {
  contrastRatio.value = model === 'apca' ? 60 : 4.5;
});

// With the reference as background, the calculated color is the text, and vice versa.
const sampleColors = computed(() =>
  colorPosition.value === 'bg'
    ? { bg: referenceColor.value, fg: calculatedColorHex.value }
    : { bg: calculatedColorHex.value, fg: referenceColor.value }
);

// Sync the inputs with the color apcach actually produced.
const syncInputs = (color) => {
  contrastRatio.value = color.contrastConfig?.cr ?? contrastRatio.value;
  if (typeof color.chroma === 'number') chroma.value = Math.round(color.chroma * 1000) / 1000;
  if (typeof color.hue === 'number') hue.value = Math.round(color.hue * 10) / 10;
};

const calculateColor = () => {
  const cr = Number(contrastRatio.value);
  const c = Number(chroma.value);
  const h = Number(hue.value);
  const limit = Number(maxChromaLimit.value);
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(referenceColor.value).trim()) && !/^(rgb|hsl|oklch|oklab|lab|lch|color)\(/i.test(String(referenceColor.value).trim())) {
    showNotice('Enter the reference color as a hex value (e.g. #ffffff) or a CSS color function.', 'error');
    return;
  }
  if (!Number.isFinite(cr)) {
    showNotice('Enter a contrast value.', 'error');
    return;
  }
  if (!useMaxChroma.value && (!Number.isFinite(c) || c < 0)) {
    showNotice('Chroma must be a number of 0 or more.', 'error');
    return;
  }
  if (!Number.isFinite(h)) {
    showNotice('Hue must be a number between 0 and 360.', 'error');
    return;
  }

  try {
    const chromaValue = useMaxChroma.value
      ? (Number.isFinite(limit) && limit > 0 ? maxChroma(Math.min(limit, 0.37)) : maxChroma())
      : Math.min(c, 0.37);

    // crToBg: the reference is the background and we solve for the foreground;
    // crToFg: the reference is the foreground and we solve for the background.
    // Signature: crToBg(color, contrast, model?, direction?)
    const crFunction = colorPosition.value === 'bg' ? crToBg : crToFg;
    const contrastConfig = crFunction(
      referenceColor.value.trim(),
      clampContrast(cr),
      contrastModel.value,
      searchDirection.value
    );

    const result = apcach(contrastConfig, chromaValue, wrapHue(h));
    if (!Number.isFinite(result?.lightness)) {
      throw new Error('apcach returned no lightness');
    }
    calculatedColor.value = result;
    syncInputs(result);
    clearNotice();
  } catch (error) {
    console.error('Error calculating color:', error);
    showNotice('Could not calculate a color. Please check your inputs.', 'error');
  }
};

// apcach's setters mutate the contrast config they are given, so hand them a copy.
const cloneColor = (color) => ({ ...color, contrastConfig: { ...color.contrastConfig } });

const adjustContrast = () => {
  if (!calculatedColor.value) return;
  const delta = Number(contrastAdjustment.value);
  if (!Number.isFinite(delta)) return;
  try {
    const current = Number(calculatedColor.value.contrastConfig?.cr ?? contrastRatio.value);
    const clampedContrast = clampContrast(current + delta);
    calculatedColor.value = setContrast(cloneColor(calculatedColor.value), clampedContrast);
    syncInputs(calculatedColor.value);
  } catch (error) {
    console.error('Error adjusting contrast:', error);
    showNotice('Could not adjust the contrast.', 'error');
  }
};

const adjustChroma = () => {
  if (!calculatedColor.value) return;
  const delta = Number(chromaAdjustment.value);
  if (!Number.isFinite(delta)) return;
  try {
    calculatedColor.value = setChroma(cloneColor(calculatedColor.value), (c) => Number(c) + delta);
    syncInputs(calculatedColor.value);
  } catch (error) {
    console.error('Error adjusting chroma:', error);
    showNotice('Could not adjust the chroma.', 'error');
  }
};

const adjustHue = () => {
  if (!calculatedColor.value) return;
  const delta = Number(hueAdjustment.value);
  if (!Number.isFinite(delta)) return;
  try {
    // Hue is an angle: wrap it (apcach would clamp 370 to 360).
    calculatedColor.value = setHue(cloneColor(calculatedColor.value), wrapHue(Number(calculatedColor.value.hue) + delta));
    syncInputs(calculatedColor.value);
  } catch (error) {
    console.error('Error adjusting hue:', error);
    showNotice('Could not adjust the hue.', 'error');
  }
};

const copyToClipboard = async (text) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showCopyNotice(`Copied ${text}`, 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showCopyNotice('Could not copy to the clipboard.', 'error');
  }
};

onMounted(() => {
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

