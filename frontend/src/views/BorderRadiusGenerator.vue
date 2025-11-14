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
                      Border Radius Generator
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Generate border radius values with individual corner controls. Perfect for creating rounded corners on cards, buttons, and UI elements.
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
                        <linearGradient id="borderRadiusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized border radius icon -->
                      <rect x="40" y="40" width="120" height="120" rx="16" fill="url(#borderRadiusGradient)" opacity="0.6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="max-w-6xl mx-auto">
            <!-- Configuration Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Unified Control -->
              <div 
                class="rounded-lg border p-6" 
                :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
              >
                <div class="flex items-center justify-between mb-4">
                  <h4 
                    class="font-semibold flex items-center gap-2" 
                    :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                  >
                    <span class="material-symbols-outlined text-indigo-600">tune</span>
                    Unified Control
                  </h4>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      v-model="locked"
                      class="rounded"
                    />
                    <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ locked ? 'Locked' : 'Unlocked' }}
                    </span>
                  </label>
                </div>
                <div class="space-y-4">
                  <div>
                    <label 
                      class="text-sm font-medium mb-2 block"
                      :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                    >
                      Value
                    </label>
                    <input 
                      v-model.number="unifiedValue"
                      @input="updateUnified"
                      type="number"
                      min="0"
                      step="1"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                  </div>
                  <div>
                    <label 
                      class="text-sm font-medium mb-2 block"
                      :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                    >
                      Unit
                    </label>
                    <select
                      v-model="unit"
                      @change="updateUnified"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    >
                      <option value="px">px</option>
                      <option value="rem">rem</option>
                      <option value="em">em</option>
                      <option value="%">%</option>
                    </select>
                  </div>
                  <div class="flex gap-2">
                    <button
                      v-for="preset in presets"
                      :key="preset.name"
                      @click="loadPreset(preset.value)"
                      class="flex-1 px-3 py-2 text-xs rounded-lg border font-medium transition-colors"
                      :class="isDarkMode
                        ? 'bg-slate-700 border-gray-600 text-white hover:bg-slate-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
                    >
                      {{ preset.name }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Individual Corner Controls -->
              <div 
                class="rounded-lg border p-6" 
                :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
              >
                <h4 
                  class="font-semibold mb-4 flex items-center gap-2" 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                >
                  <span class="material-symbols-outlined text-indigo-600">grid_4x4</span>
                  Individual Corners
                </h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      class="text-xs font-medium mb-1 block"
                      :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                    >
                      Top Left
                    </label>
                    <input 
                      v-model.number="topLeft"
                      @input="updateFromIndividual"
                      type="number"
                      min="0"
                      step="1"
                      :disabled="locked"
                      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white disabled:opacity-50' 
                        : 'border-gray-300 bg-white text-gray-900 disabled:opacity-50'"
                    />
                  </div>
                  <div>
                    <label 
                      class="text-xs font-medium mb-1 block"
                      :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                    >
                      Top Right
                    </label>
                    <input 
                      v-model.number="topRight"
                      @input="updateFromIndividual"
                      type="number"
                      min="0"
                      step="1"
                      :disabled="locked"
                      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white disabled:opacity-50' 
                        : 'border-gray-300 bg-white text-gray-900 disabled:opacity-50'"
                    />
                  </div>
                  <div>
                    <label 
                      class="text-xs font-medium mb-1 block"
                      :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                    >
                      Bottom Right
                    </label>
                    <input 
                      v-model.number="bottomRight"
                      @input="updateFromIndividual"
                      type="number"
                      min="0"
                      step="1"
                      :disabled="locked"
                      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white disabled:opacity-50' 
                        : 'border-gray-300 bg-white text-gray-900 disabled:opacity-50'"
                    />
                  </div>
                  <div>
                    <label 
                      class="text-xs font-medium mb-1 block"
                      :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                    >
                      Bottom Left
                    </label>
                    <input 
                      v-model.number="bottomLeft"
                      @input="updateFromIndividual"
                      type="number"
                      min="0"
                      step="1"
                      :disabled="locked"
                      class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white disabled:opacity-50' 
                        : 'border-gray-300 bg-white text-gray-900 disabled:opacity-50'"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Visual Preview Section -->
            <div 
              class="rounded-lg border p-6 mb-6" 
              :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
            >
              <h4 
                class="font-semibold mb-4 flex items-center gap-2" 
                :class="isDarkMode ? 'text-white' : 'text-gray-900'"
              >
                <span class="material-symbols-outlined text-indigo-600">preview</span>
                Visual Preview
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Box -->
                <div>
                  <h6 
                    class="text-xs font-medium mb-2 uppercase tracking-wide text-center"
                    :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                  >
                    Box
                  </h6>
                  <div 
                    class="w-full h-24 mx-auto"
                    :style="computedBorderRadius"
                    :class="isDarkMode ? 'bg-indigo-600' : 'bg-indigo-500'"
                  ></div>
                </div>
                
                <!-- Card -->
                <div>
                  <h6 
                    class="text-xs font-medium mb-2 uppercase tracking-wide text-center"
                    :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                  >
                    Card
                  </h6>
                  <div 
                    class="w-full h-24 mx-auto p-4 border"
                    :style="computedBorderRadius"
                    :class="isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-white border-gray-300'"
                  >
                    <div 
                      class="w-full h-full rounded"
                      :class="isDarkMode ? 'bg-slate-600' : 'bg-gray-100'"
                    ></div>
                  </div>
                </div>
                
                <!-- Button -->
                <div>
                  <h6 
                    class="text-xs font-medium mb-2 uppercase tracking-wide text-center"
                    :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                  >
                    Button
                  </h6>
                  <div 
                    class="w-full h-12 mx-auto flex items-center justify-center font-medium"
                    :style="computedBorderRadius"
                    :class="isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'"
                  >
                    Button
                  </div>
                </div>
                
                <!-- Circle -->
                <div>
                  <h6 
                    class="text-xs font-medium mb-2 uppercase tracking-wide text-center"
                    :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                  >
                    Circle
                  </h6>
                  <div 
                    class="w-24 h-24 mx-auto"
                    :style="computedBorderRadius"
                    :class="isDarkMode ? 'bg-indigo-600' : 'bg-indigo-500'"
                  ></div>
                </div>
              </div>
              
              <!-- CSS Output Preview -->
              <div class="mt-6 pt-6 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <label 
                  class="text-sm font-medium mb-2 block"
                  :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                >
                  CSS Output
                </label>
                <div 
                  class="p-4 rounded-lg font-mono text-sm overflow-x-auto"
                  :class="isDarkMode ? 'bg-slate-900 text-gray-300' : 'bg-gray-100 text-gray-800'"
                >
                  border-radius: {{ computedBorderRadius.borderRadius }};
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
const locked = ref(true);
const unit = ref('px');
const unifiedValue = ref(8);
const topLeft = ref(8);
const topRight = ref(8);
const bottomRight = ref(8);
const bottomLeft = ref(8);

const presets = [
  { name: 'None', value: 0 },
  { name: 'SM', value: 4 },
  { name: 'MD', value: 8 },
  { name: 'LG', value: 12 },
  { name: 'XL', value: 16 },
  { name: '2XL', value: 24 },
  { name: '3XL', value: 32 },
  { name: 'Full', value: 9999 }
];

const computedBorderRadius = computed(() => {
  const formatValue = (val) => {
    if (unit.value === '%') {
      return `${val}%`;
    }
    return `${val}${unit.value}`;
  };
  
  if (topLeft.value === topRight.value && 
      topRight.value === bottomRight.value && 
      bottomRight.value === bottomLeft.value) {
    return {
      borderRadius: formatValue(topLeft.value)
    };
  }
  
  return {
    borderRadius: `${formatValue(topLeft.value)} ${formatValue(topRight.value)} ${formatValue(bottomRight.value)} ${formatValue(bottomLeft.value)}`
  };
});

const updateUnified = () => {
  if (locked.value) {
    topLeft.value = unifiedValue.value;
    topRight.value = unifiedValue.value;
    bottomRight.value = unifiedValue.value;
    bottomLeft.value = unifiedValue.value;
  }
};

const updateFromIndividual = () => {
  if (!locked.value) {
    unifiedValue.value = topLeft.value;
  }
};

const loadPreset = (value) => {
  unifiedValue.value = value;
  updateUnified();
};

const exportFormat = (format) => {
  const borderRadius = computedBorderRadius.value.borderRadius;
  
  if (format === 'css') {
    const css = `.rounded-custom {\n  border-radius: ${borderRadius};\n}\n`;
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `border-radius-${Date.now()}.css`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'tailwind') {
    const config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      borderRadius: {\n        'custom': '${borderRadius}',\n      },\n    },\n  },\n};\n`;
    const blob = new Blob([config], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `border-radius-tailwind-${Date.now()}.js`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'json') {
    const config = {
      type: 'border-radius',
      unit: unit.value,
      topLeft: topLeft.value,
      topRight: topRight.value,
      bottomRight: bottomRight.value,
      bottomLeft: bottomLeft.value,
      borderRadius: borderRadius
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `border-radius-${Date.now()}.json`;
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

