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
                      Font Scale Generator
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Generate consistent typography scales using mathematical ratios. Create harmonious heading and body text sizes for your design system.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
                      Typography Tool
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
                        <linearGradient id="fontScaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized font scale icon -->
                      <line x1="40" y1="40" x2="40" y2="160" stroke="url(#fontScaleGradient)" stroke-width="4" opacity="0.6"/>
                      <text x="50" y="50" font-family="Arial" font-size="24" font-weight="bold" fill="url(#fontScaleGradient)" opacity="0.8">H1</text>
                      <text x="50" y="80" font-family="Arial" font-size="18" font-weight="bold" fill="url(#fontScaleGradient)" opacity="0.7">H2</text>
                      <text x="50" y="110" font-family="Arial" font-size="14" fill="url(#fontScaleGradient)" opacity="0.6">Body</text>
                      <text x="50" y="140" font-family="Arial" font-size="12" fill="url(#fontScaleGradient)" opacity="0.5">Small</text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="max-w-6xl mx-auto">
            <!-- Configuration Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Base Font Size Input -->
              <div 
                class="rounded-lg border p-6" 
                :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
              >
                <label 
                  class="text-sm font-medium mb-2 block flex items-center gap-2" 
                  :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                >
                  <span class="material-symbols-outlined text-indigo-600">text_fields</span>
                  Base Font Size (px)
                </label>
                <input 
                  v-model.number="fontSize" 
                  type="number" 
                  min="12" 
                  max="72"
                  step="1"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                />
                <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                  Starting value for your typography scale
                </p>
              </div>

              <!-- Ratio Selection -->
              <div 
                class="rounded-lg border p-6" 
                :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
              >
                <label 
                  class="text-sm font-medium mb-2 block flex items-center gap-2" 
                  :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                >
                  <span class="material-symbols-outlined text-indigo-600">tune</span>
                  Ratio
                </label>
                <Dropdown
                  v-model="selectedRatio"
                  :options="ratioOptions"
                  :isDarkMode="isDarkMode"
                />
                <input 
                  v-if="selectedRatio === 'custom'"
                  v-model.number="customRatio"
                  type="number" 
                  min="1.1" 
                  max="2.0"
                  step="0.001"
                  placeholder="1.333"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mt-2"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                />
              </div>
            </div>

            <!-- Two Column Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Left Column: Font Scale Values -->
              <div 
                class="rounded-lg border p-6" 
                :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
              >
                <h4 
                  class="font-semibold mb-4 flex items-center gap-2" 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                >
                  <span class="material-symbols-outlined text-indigo-600">list</span>
                  Font Scale
                </h4>
                <div class="space-y-3">
                  <div 
                    v-for="(size, name) in computedTypographyScale" 
                    :key="name" 
                    class="flex items-center justify-between p-3 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-center gap-3 flex-1">
                      <div 
                        class="flex-shrink-0 rounded border-2 flex items-center justify-center font-semibold text-xs"
                        :style="{ 
                          width: Math.min(size / 2, 48) + 'px',
                          height: Math.min(size / 2, 48) + 'px',
                          backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                          borderColor: isDarkMode ? '#475569' : '#cbd5e1'
                        }"
                      >
                        <div 
                          class="w-full h-full rounded flex items-center justify-center"
                          :style="{ 
                            fontSize: Math.min(size / 3, 16) + 'px',
                            color: isDarkMode ? '#6366f1' : '#6366f1',
                            fontWeight: 'bold'
                          }"
                        >
                          {{ name.charAt(0).toUpperCase() }}
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div 
                          class="font-medium truncate" 
                          :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                        >
                          {{ getSizeLabel(name) }}
                        </div>
                        <div 
                          class="text-xs truncate" 
                          :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                        >
                          {{ size }}px
                        </div>
                      </div>
                    </div>
                    <div 
                      class="text-xs font-mono px-2 py-1 rounded flex-shrink-0"
                      :class="isDarkMode ? 'bg-slate-600 text-gray-300' : 'bg-gray-200 text-gray-700'"
                    >
                      {{ size }}px
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Right Column: Visual Preview -->
              <div 
                class="rounded-lg border p-6" 
                :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
              >
                <h4 
                  class="font-semibold mb-4 flex items-center gap-2" 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                >
                  <span class="material-symbols-outlined text-indigo-600">preview</span>
                  Visual Preview
                </h4>
                <div class="space-y-4">
                  <!-- Article Example -->
                  <div 
                    class="rounded-lg border p-4"
                    :style="{ 
                      padding: '24px',
                      borderColor: isDarkMode ? '#475569' : '#cbd5e1'
                    }"
                    :class="isDarkMode ? 'bg-slate-700' : 'bg-gray-50'"
                  >
                    <h5 
                      class="font-semibold mb-2"
                      :style="{ 
                        fontSize: computedTypographyScale.h1 + 'px',
                        fontWeight: 'bold',
                        lineHeight: lineHeight
                      }"
                      :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                    >
                      Article Title
                    </h5>
                    <p 
                      class="text-sm mb-3"
                      :style="{ 
                        fontSize: computedTypographyScale.body + 'px',
                        lineHeight: lineHeight
                      }"
                      :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'"
                    >
                      This is body text using <code class="px-1 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30">{{ computedTypographyScale.body }}px</code> font size. The quick brown fox jumps over the lazy dog.
                    </p>
                    <div 
                      class="text-xs"
                      :style="{ 
                        fontSize: computedTypographyScale.small + 'px',
                        lineHeight: lineHeight
                      }"
                      :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                    >
                      Small caption text
                    </div>
                  </div>

                  <!-- Heading Hierarchy Example -->
                  <div>
                    <h6 
                      class="text-xs font-medium mb-2 uppercase tracking-wide"
                      :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                    >
                      Heading Hierarchy
                    </h6>
                    <div class="space-y-2" :style="{ fontFamily: 'system-ui, sans-serif' }">
                      <div 
                        :class="isDarkMode ? 'text-white' : 'text-gray-900'" 
                        :style="{ 
                          fontSize: computedTypographyScale.h1 + 'px', 
                          fontWeight: 'bold', 
                          lineHeight: lineHeight 
                        }"
                      >
                        Heading 1
                      </div>
                      <div 
                        :class="isDarkMode ? 'text-white' : 'text-gray-900'" 
                        :style="{ 
                          fontSize: computedTypographyScale.h2 + 'px', 
                          fontWeight: 'bold', 
                          lineHeight: lineHeight 
                        }"
                      >
                        Heading 2
                      </div>
                      <div 
                        :class="isDarkMode ? 'text-white' : 'text-gray-900'" 
                        :style="{ 
                          fontSize: computedTypographyScale.h3 + 'px', 
                          fontWeight: 'bold', 
                          lineHeight: lineHeight 
                        }"
                      >
                        Heading 3
                      </div>
                      <div 
                        :class="isDarkMode ? 'text-white' : 'text-gray-900'" 
                        :style="{ 
                          fontSize: computedTypographyScale.h4 + 'px', 
                          fontWeight: 'bold', 
                          lineHeight: lineHeight 
                        }"
                      >
                        Heading 4
                      </div>
                    </div>
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const fontSize = ref(16);
const lineHeight = ref(1.4);
const letterSpacing = ref(0);
const selectedRatio = ref('major-third');
const customRatio = ref(1.333);

const ratioOptions = [
  { value: 'major-third', label: 'Major Third (1.333)' },
  { value: 'perfect-fourth', label: 'Perfect Fourth (1.5)' },
  { value: 'golden-ratio', label: 'Golden Ratio (1.618)' },
  { value: 'minor-third', label: 'Minor Third (1.2)' },
  { value: 'custom', label: 'Custom' }
];

const ratios = {
  'major-third': 1.333,
  'perfect-fourth': 1.5,
  'golden-ratio': 1.618,
  'minor-third': 1.2,
  'custom': customRatio.value
};

const currentRatio = computed(() => {
  if (selectedRatio.value === 'custom') {
    return customRatio.value;
  }
  return ratios[selectedRatio.value];
});

const computedTypographyScale = computed(() => {
  const ratio = currentRatio.value;
  const baseSize = fontSize.value;
  return {
    h1: Math.round(baseSize * Math.pow(ratio, 3)),
    h2: Math.round(baseSize * Math.pow(ratio, 2)),
    h3: Math.round(baseSize * ratio),
    h4: baseSize,
    h5: Math.round(baseSize / ratio),
    h6: Math.round(baseSize / Math.pow(ratio, 2)),
    body: baseSize,
    small: Math.round(baseSize * 0.875)
  };
});

const getSizeLabel = (name) => {
  const labels = {
    'h1': 'Heading 1',
    'h2': 'Heading 2',
    'h3': 'Heading 3',
    'h4': 'Heading 4',
    'h5': 'Heading 5',
    'h6': 'Heading 6',
    'body': 'Body Text',
    'small': 'Small Text'
  };
  return labels[name] || name;
};

const exportFormat = (format) => {
  const scale = computedTypographyScale.value;
  
  if (format === 'css') {
    let css = ':root {\n';
    Object.entries(scale).forEach(([name, value]) => {
      css += `  --font-size-${name}: ${value}px;\n`;
    });
    css += '}\n\n';
    css += '/* Usage example */\n';
    css += '.text-h1 { font-size: var(--font-size-h1); }\n';
    css += '.text-h2 { font-size: var(--font-size-h2); }\n';
    css += '.text-body { font-size: var(--font-size-body); }\n';
    
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `font-scale-${Date.now()}.css`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'tailwind') {
    let config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      fontSize: {\n`;
    Object.entries(scale).forEach(([name, value]) => {
      config += `        '${name}': '${value}px',\n`;
    });
    config += `      },\n    },\n  },\n};\n`;
    
    const blob = new Blob([config], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `font-scale-tailwind-${Date.now()}.js`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'json') {
    const config = {
      type: 'font-scale',
      base: fontSize.value,
      ratio: currentRatio.value,
      ratioName: selectedRatio.value,
      lineHeight: lineHeight.value,
      letterSpacing: letterSpacing.value,
      scale: scale
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `font-scale-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// Watch for ratio changes
watch(selectedRatio, (newValue) => {
  if (newValue === 'custom' && customRatio.value === 1.333) {
    // Custom ratio is already initialized, no action needed
  }
});





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

