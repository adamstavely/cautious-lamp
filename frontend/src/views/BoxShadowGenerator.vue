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
          <div class="max-w-7xl mx-auto mb-16">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      Box Shadow Generator
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create beautiful box shadows with custom offsets, blur, spread, and color. Support for single and multiple shadows.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
                      Design Tool
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                    </span>
                  </div>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                      <defs>
                        <linearGradient id="boxShadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                        <filter id="shadow">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                          <feOffset dx="0" dy="4" result="offsetblur"/>
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3"/>
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <!-- Stylized box shadow icon -->
                      <rect x="50" y="50" width="100" height="100" rx="8" fill="url(#boxShadowGradient)" filter="url(#shadow)" opacity="0.8"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="max-w-6xl mx-auto">
            <!-- Preview Section -->
            <div 
              class="rounded-lg border p-6 mb-6" 
              :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h4 
                  class="font-semibold flex items-center gap-2" 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                >
                  <span class="material-symbols-outlined text-indigo-600">preview</span>
                  Live Preview
                </h4>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="previewDarkMode"
                    class="rounded"
                  />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Dark Background</span>
                </label>
              </div>
              <div 
                class="w-full h-64 rounded-lg flex items-center justify-center transition-colors"
                :class="previewDarkMode ? 'bg-slate-900' : 'bg-gray-100'"
              >
                <div 
                  class="w-48 h-48 rounded-lg flex items-center justify-center transition-all"
                  :style="computedBoxShadow"
                  :class="previewDarkMode ? 'bg-slate-800' : 'bg-white'"
                >
                  <span 
                    class="text-sm font-medium"
                    :class="previewDarkMode ? 'text-gray-300' : 'text-gray-700'"
                  >
                    Preview Box
                  </span>
                </div>
              </div>
            </div>

            <!-- Shadows List -->
            <div 
              class="rounded-lg border p-6 mb-6" 
              :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h4 
                  class="font-semibold flex items-center gap-2" 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                >
                  <span class="material-symbols-outlined text-indigo-600">layers</span>
                  Shadows
                </h4>
                <div class="flex gap-2">
                  <button
                    @click="loadPreset('sm')"
                    class="px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors"
                    :class="isDarkMode
                      ? 'bg-slate-700 border-gray-600 text-white hover:bg-slate-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    Small
                  </button>
                  <button
                    @click="loadPreset('md')"
                    class="px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors"
                    :class="isDarkMode
                      ? 'bg-slate-700 border-gray-600 text-white hover:bg-slate-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    Medium
                  </button>
                  <button
                    @click="loadPreset('lg')"
                    class="px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors"
                    :class="isDarkMode
                      ? 'bg-slate-700 border-gray-600 text-white hover:bg-slate-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    Large
                  </button>
                  <button
                    @click="addShadow"
                    class="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors flex items-center gap-1"
                    :class="isDarkMode
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    <span class="material-symbols-outlined text-sm">add</span>
                    Add Shadow
                  </button>
                </div>
              </div>

              <div class="space-y-4">
                <div 
                  v-for="(shadow, index) in shadows" 
                  :key="shadow.id"
                  class="p-4 rounded-lg border"
                  :class="isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-gray-50 border-gray-200'"
                >
                  <div class="flex items-center justify-between mb-3">
                    <h5 
                      class="font-medium text-sm"
                      :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                    >
                      Shadow {{ index + 1 }}
                    </h5>
                    <button
                      @click="removeShadow(shadow.id)"
                      class="text-red-500 hover:text-red-600 transition-colors"
                      :disabled="shadows.length === 1"
                    >
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                  
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <!-- X Offset -->
                    <div>
                      <label 
                        class="text-xs font-medium mb-1 block"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        X Offset (px)
                      </label>
                      <input 
                        v-model.number="shadow.x"
                        type="number"
                        step="1"
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-600 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                    
                    <!-- Y Offset -->
                    <div>
                      <label 
                        class="text-xs font-medium mb-1 block"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        Y Offset (px)
                      </label>
                      <input 
                        v-model.number="shadow.y"
                        type="number"
                        step="1"
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-600 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                    
                    <!-- Blur -->
                    <div>
                      <label 
                        class="text-xs font-medium mb-1 block"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        Blur (px)
                      </label>
                      <input 
                        v-model.number="shadow.blur"
                        type="number"
                        min="0"
                        step="1"
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-600 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                    
                    <!-- Spread -->
                    <div>
                      <label 
                        class="text-xs font-medium mb-1 block"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        Spread (px)
                      </label>
                      <input 
                        v-model.number="shadow.spread"
                        type="number"
                        step="1"
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-600 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <!-- Color -->
                    <div>
                      <label 
                        class="text-xs font-medium mb-1 block"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        Color
                      </label>
                      <div class="flex items-center gap-2">
                        <input 
                          v-model="shadow.color"
                          type="color"
                          class="w-12 h-10 rounded border cursor-pointer"
                          :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                        />
                        <input 
                          v-model="shadow.color"
                          type="text"
                          class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-mono"
                          :class="isDarkMode 
                            ? 'border-gray-600 bg-slate-600 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                      </div>
                    </div>
                    
                    <!-- Opacity -->
                    <div>
                      <label 
                        class="text-xs font-medium mb-1 block"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        Opacity (0-1)
                      </label>
                      <div class="flex items-center gap-2">
                        <input 
                          v-model.number="shadow.opacity"
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          class="flex-1"
                        />
                        <input 
                          v-model.number="shadow.opacity"
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          class="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                          :class="isDarkMode 
                            ? 'border-gray-600 bg-slate-600 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <!-- Inset -->
                  <div class="mt-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input 
                        v-model="shadow.inset"
                        type="checkbox"
                        class="rounded"
                      />
                      <span 
                        class="text-sm"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        Inset Shadow
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Export Section -->
            <div 
              class="rounded-lg border p-6" 
              :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
            >
              <h4 
                class="font-semibold mb-4 flex items-center gap-2" 
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
              >
                <span class="material-symbols-outlined text-indigo-600">download</span>
                Export
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  @click="exportFormat('css')"
                  class="px-4 py-3 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2"
                  :class="isDarkMode
                    ? 'bg-slate-700 border-gray-600 text-white hover:bg-slate-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
                >
                  <span class="material-symbols-outlined text-lg">code</span>
                  Export CSS
                </button>
                <button
                  @click="exportFormat('tailwind')"
                  class="px-4 py-3 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2"
                  :class="isDarkMode
                    ? 'bg-slate-700 border-gray-600 text-white hover:bg-slate-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
                >
                  <span class="material-symbols-outlined text-lg">settings</span>
                  Export Tailwind
                </button>
                <button
                  @click="exportFormat('json')"
                  class="px-4 py-3 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2"
                  :class="isDarkMode
                    ? 'bg-slate-700 border-gray-600 text-white hover:bg-slate-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
                >
                  <span class="material-symbols-outlined text-lg">data_object</span>
                  Export JSON
                </button>
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
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const previewDarkMode = ref(false);
let shadowIdCounter = 0;

const shadows = ref([
  {
    id: shadowIdCounter++,
    x: 0,
    y: 1,
    blur: 2,
    spread: 0,
    color: '#000000',
    opacity: 0.05,
    inset: false
  }
]);

const computedBoxShadow = computed(() => {
  const shadowStrings = shadows.value.map(shadow => {
    const rgba = hexToRgba(shadow.color, shadow.opacity);
    const inset = shadow.inset ? 'inset ' : '';
    return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${rgba}`;
  });
  return {
    boxShadow: shadowStrings.join(', ')
  };
});

const hexToRgba = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const addShadow = () => {
  shadows.value.push({
    id: shadowIdCounter++,
    x: 0,
    y: 4,
    blur: 6,
    spread: 0,
    color: '#000000',
    opacity: 0.1,
    inset: false
  });
};

const removeShadow = (id) => {
  if (shadows.value.length > 1) {
    shadows.value = shadows.value.filter(s => s.id !== id);
  }
};

const loadPreset = (size) => {
  const presets = {
    sm: [{ x: 0, y: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.05, inset: false }],
    md: [{ x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 0.1, inset: false }],
    lg: [{ x: 0, y: 10, blur: 15, spread: -3, color: '#000000', opacity: 0.1, inset: false }]
  };
  
  const preset = presets[size];
  shadows.value = preset.map(s => ({
    id: shadowIdCounter++,
    ...s
  }));
};

const exportFormat = (format) => {
  if (format === 'css') {
    const css = `.shadow-custom {\n  box-shadow: ${computedBoxShadow.value.boxShadow};\n}\n`;
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `box-shadow-${Date.now()}.css`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'tailwind') {
    const config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      boxShadow: {\n        'custom': '${computedBoxShadow.value.boxShadow}',\n      },\n    },\n  },\n};\n`;
    const blob = new Blob([config], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `box-shadow-tailwind-${Date.now()}.js`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'json') {
    const config = {
      type: 'box-shadow',
      shadows: shadows.value.map(s => ({
        x: s.x,
        y: s.y,
        blur: s.blur,
        spread: s.spread,
        color: s.color,
        opacity: s.opacity,
        inset: s.inset
      }))
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `box-shadow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
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

