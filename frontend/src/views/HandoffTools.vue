<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Design-Dev Handoff
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Generate specs, export assets, and measure designs for seamless design-to-development handoff.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="handoffGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Design side (left) -->
                    <rect x="30" y="60" width="60" height="80" rx="4" fill="url(#handoffGradient)" opacity="0.3"/>
                    <circle cx="50" cy="80" r="8" fill="url(#handoffGradient)" opacity="0.5"/>
                    <rect x="45" y="100" width="30" height="20" rx="2" fill="url(#handoffGradient)" opacity="0.4"/>
                    <!-- Arrow/transfer -->
                    <path d="M 100 100 L 120 100" stroke="url(#handoffGradient)" stroke-width="4" stroke-linecap="round" opacity="0.6"/>
                    <path d="M 115 95 L 120 100 L 115 105" stroke="url(#handoffGradient)" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
                    <!-- Development side (right) -->
                    <rect x="110" y="60" width="60" height="80" rx="4" fill="url(#handoffGradient)" opacity="0.3"/>
                    <line x1="120" y1="75" x2="160" y2="75" stroke="white" stroke-width="2" opacity="0.5"/>
                    <line x1="120" y1="90" x2="150" y2="90" stroke="white" stroke-width="2" opacity="0.5"/>
                    <line x1="120" y1="105" x2="155" y2="105" stroke="white" stroke-width="2" opacity="0.5"/>
                    <line x1="120" y1="120" x2="145" y2="120" stroke="white" stroke-width="2" opacity="0.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Tools -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Component Selector -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">widgets</span>
                Select Component
              </h3>
              <select
                v-model="selectedComponent"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="">Choose a component...</option>
                <option value="button">Button</option>
                <option value="card">Card</option>
                <option value="input">Input</option>
                <option value="modal">Modal</option>
                <option value="navigation">Navigation</option>
              </select>
            </div>

            <!-- Measurement Tool -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">straighten</span>
                Measurement Tool
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Width (px)
                  </label>
                  <input
                    v-model.number="measurements.width"
                    type="number"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Height (px)
                  </label>
                  <input
                    v-model.number="measurements.height"
                    type="number"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Padding (px)
                  </label>
                  <input
                    v-model.number="measurements.padding"
                    type="number"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Margin (px)
                  </label>
                  <input
                    v-model.number="measurements.margin"
                    type="number"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Border Radius (px)
                  </label>
                  <input
                    v-model.number="measurements.borderRadius"
                    type="number"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Spec Generation & Export -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Spec Generator -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">description</span>
                  Generate Specs
                </h3>
                <div class="flex items-center gap-2">
                  <select
                    v-model="specFormat"
                    class="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="css">CSS</option>
                    <option value="scss">SCSS</option>
                    <option value="json">JSON</option>
                    <option value="figma">Figma</option>
                  </select>
                  <button
                    @click="generateSpecs"
                    :disabled="!selectedComponent"
                    class="px-4 py-2 rounded-lg font-medium transition-colors"
                    :class="selectedComponent
                      ? (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')
                      : (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div v-if="generatedSpecs" class="rounded-lg overflow-hidden" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-50'">
                <div class="p-4 overflow-x-auto max-h-64 overflow-y-auto">
                  <pre class="text-sm font-mono whitespace-pre-wrap" :class="isDarkMode ? 'text-green-400' : 'text-gray-700'"><code>{{ generatedSpecs }}</code></pre>
                </div>
                <div class="p-3 border-t flex items-center justify-end gap-2" :class="isDarkMode ? 'border-gray-800' : 'border-gray-200'">
                  <button
                    @click="copySpecs"
                    class="px-3 py-1 rounded text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    Copy
                  </button>
                  <button
                    @click="downloadSpecs"
                    class="px-3 py-1 rounded text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>

            <!-- Asset Export -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">download</span>
                Export Assets
              </h3>
              <div class="grid md:grid-cols-2 gap-4">
                <button
                  @click="exportIcons"
                  class="p-4 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center gap-2"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 hover:border-indigo-500' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-500'"
                >
                  <span class="material-symbols-outlined text-3xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">star</span>
                  <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Icons</span>
                  <span class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">SVG, PNG, PDF</span>
                </button>
                <button
                  @click="exportFonts"
                  class="p-4 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center gap-2"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 hover:border-indigo-500' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-500'"
                >
                  <span class="material-symbols-outlined text-3xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">text_fields</span>
                  <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Fonts</span>
                  <span class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">WOFF, WOFF2, TTF</span>
                </button>
                <button
                  @click="exportImages"
                  class="p-4 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center gap-2"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 hover:border-indigo-500' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-500'"
                >
                  <span class="material-symbols-outlined text-3xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">image</span>
                  <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Images</span>
                  <span class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">PNG, JPG, SVG</span>
                </button>
                <button
                  @click="exportTokens"
                  class="p-4 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center gap-2"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-800 hover:border-indigo-500' 
                    : 'border-gray-300 bg-gray-50 hover:border-indigo-500'"
                >
                  <span class="material-symbols-outlined text-3xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">palette</span>
                  <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Tokens</span>
                  <span class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">JSON, CSS, SCSS</span>
                </button>
              </div>
            </div>

            <!-- Visual Spec Preview -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">preview</span>
                  Visual Spec Preview
                </h3>
                <button
                  @click="previewDarkMode = !previewDarkMode"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  :class="previewDarkMode
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode 
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  <span class="material-symbols-outlined text-base">{{ previewDarkMode ? 'dark_mode' : 'light_mode' }}</span>
                  {{ previewDarkMode ? 'Dark' : 'Light' }}
                </button>
              </div>
              <div 
                class="rounded-lg border-2 border-dashed p-8 flex items-center justify-center"
                :style="getPreviewStyle()"
                :class="previewDarkMode ? 'border-gray-600 bg-slate-800 dark' : 'border-gray-300 bg-gray-50'"
              >
                <div class="text-center">
                  <div class="text-sm mb-2" :class="previewDarkMode ? 'text-gray-300' : 'text-gray-600'">
                    Component Preview
                  </div>
                  <div class="text-xs font-mono" :class="previewDarkMode ? 'text-gray-400' : 'text-gray-500'">
                    {{ measurements.width }}px × {{ measurements.height }}px
                  </div>
                </div>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Padding:</span>
                  <span class="ml-2 font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ measurements.padding }}px</span>
                </div>
                <div>
                  <span class="font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Margin:</span>
                  <span class="ml-2 font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ measurements.margin }}px</span>
                </div>
                <div>
                  <span class="font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Border Radius:</span>
                  <span class="ml-2 font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ measurements.borderRadius }}px</span>
                </div>
                <div>
                  <span class="font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Aspect Ratio:</span>
                  <span class="ml-2 font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ getAspectRatio() }}</span>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const previewDarkMode = ref(false);
const selectedComponent = ref('');
const specFormat = ref('css');
const generatedSpecs = ref('');
const measurements = ref({
  width: 200,
  height: 48,
  padding: 12,
  margin: 8,
  borderRadius: 8
});

const getPreviewStyle = () => {
  return {
    width: `${measurements.value.width}px`,
    height: `${measurements.value.height}px`,
    padding: `${measurements.value.padding}px`,
    margin: `${measurements.value.margin}px`,
    borderRadius: `${measurements.value.borderRadius}px`,
    margin: '0 auto'
  };
};

const getAspectRatio = () => {
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const w = measurements.value.width;
  const h = measurements.value.height;
  const divisor = gcd(w, h);
  return `${w / divisor}:${h / divisor}`;
};

const generateSpecs = () => {
  if (!selectedComponent.value) return;

  const component = selectedComponent.value;
  const m = measurements.value;

  if (specFormat.value === 'css') {
    generatedSpecs.value = `.${component} {
  width: ${m.width}px;
  height: ${m.height}px;
  padding: ${m.padding}px;
  margin: ${m.margin}px;
  border-radius: ${m.borderRadius}px;
}`;
  } else if (specFormat.value === 'scss') {
    generatedSpecs.value = `$component-width: ${m.width}px;
$component-height: ${m.height}px;
$component-padding: ${m.padding}px;
$component-margin: ${m.margin}px;
$component-border-radius: ${m.borderRadius}px;

.${component} {
  width: $component-width;
  height: $component-height;
  padding: $component-padding;
  margin: $component-margin;
  border-radius: $component-border-radius;
}`;
  } else if (specFormat.value === 'json') {
    generatedSpecs.value = JSON.stringify({
      component: component,
      measurements: {
        width: `${m.width}px`,
        height: `${m.height}px`,
        padding: `${m.padding}px`,
        margin: `${m.margin}px`,
        borderRadius: `${m.borderRadius}px`
      }
    }, null, 2);
  } else if (specFormat.value === 'figma') {
    generatedSpecs.value = `{
  "name": "${component}",
  "type": "COMPONENT",
  "width": ${m.width},
  "height": ${m.height},
  "padding": ${m.padding},
  "margin": ${m.margin},
  "borderRadius": ${m.borderRadius}
}`;
  }
};

const copySpecs = async () => {
  if (!generatedSpecs.value) return;
  try {
    await navigator.clipboard.writeText(generatedSpecs.value);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const downloadSpecs = () => {
  if (!generatedSpecs.value) return;
  const extension = specFormat.value === 'json' ? 'json' : specFormat.value === 'scss' ? 'scss' : 'css';
  const filename = `${selectedComponent.value}-spec.${extension}`;
  
  const blob = new Blob([generatedSpecs.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportIcons = () => {
  // Mock icon export
  const iconData = {
    icons: [
      { name: 'home', svg: '<svg>...</svg>' },
      { name: 'user', svg: '<svg>...</svg>' }
    ]
  };
  const blob = new Blob([JSON.stringify(iconData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'icons-export.json';
  link.click();
  URL.revokeObjectURL(url);
};

const exportFonts = () => {
  // Mock font export manifest
  const fontManifest = {
    fonts: [
      { name: 'Inter', weights: [400, 500, 600, 700] },
      { name: 'Roboto', weights: [400, 500, 700] }
    ]
  };
  const blob = new Blob([JSON.stringify(fontManifest, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fonts-manifest.json';
  link.click();
  URL.revokeObjectURL(url);
};

const exportImages = () => {
  // Mock image export manifest
  const imageManifest = {
    images: [
      { name: 'logo', format: 'svg', path: '/assets/logo.svg' },
      { name: 'hero', format: 'jpg', path: '/assets/hero.jpg' }
    ]
  };
  const blob = new Blob([JSON.stringify(imageManifest, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'images-manifest.json';
  link.click();
  URL.revokeObjectURL(url);
};

const exportTokens = () => {
  // Mock token export
  const tokens = {
    colors: {
      primary: '#4f46e5',
      secondary: '#6366f1'
    },
    spacing: {
      sm: '8px',
      md: '16px',
      lg: '24px'
    }
  };
  const blob = new Blob([JSON.stringify(tokens, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'design-tokens.json';
  link.click();
  URL.revokeObjectURL(url);
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
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

