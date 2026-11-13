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
import { ref, computed } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';

const isDarkMode = useDarkMode();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const fontSize = ref(16);
const lineHeight = ref(1.4);
const letterSpacing = ref(0);
const selectedRatio = ref('perfect-fourth');
const customRatio = ref(1.333);

// Musical-interval ratios as used by modular type scales.
const ratios = {
  'minor-third': 1.2,
  'major-third': 1.25,
  'perfect-fourth': 1.333,
  'perfect-fifth': 1.5,
  'golden-ratio': 1.618,
};

const ratioOptions = [
  { value: 'minor-third', label: 'Minor Third (1.2)' },
  { value: 'major-third', label: 'Major Third (1.25)' },
  { value: 'perfect-fourth', label: 'Perfect Fourth (1.333)' },
  { value: 'perfect-fifth', label: 'Perfect Fifth (1.5)' },
  { value: 'golden-ratio', label: 'Golden Ratio (1.618)' },
  { value: 'custom', label: 'Custom' }
];

// Inputs are clamped to their min/max so an empty or out-of-range value
// can't produce NaN or a collapsing scale.
const baseSize = computed(() => {
  const n = Number(fontSize.value);
  if (!Number.isFinite(n) || n <= 0) return 16;
  return Math.min(72, Math.max(12, n));
});

const currentRatio = computed(() => {
  if (selectedRatio.value === 'custom') {
    const n = Number(customRatio.value);
    if (!Number.isFinite(n) || n <= 1) return 1.1;
    return Math.min(2, Math.max(1.1, n));
  }
  return ratios[selectedRatio.value] ?? ratios['perfect-fourth'];
});

const round2 = (n) => Math.round(n * 100) / 100;

// Modular scale: each heading level is one step (× ratio) above the next,
// with h6 and body text at the base size and small text one step below.
const computedTypographyScale = computed(() => {
  const ratio = currentRatio.value;
  const base = baseSize.value;
  const step = (n) => round2(base * Math.pow(ratio, n));
  return {
    h1: step(5),
    h2: step(4),
    h3: step(3),
    h4: step(2),
    h5: step(1),
    h6: step(0),
    body: step(0),
    small: step(-1)
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

const downloadText = (text, type, filename) => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke once the click has been handled, or the download can be cancelled.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const exportFormat = (format) => {
  const scale = computedTypographyScale.value;
  
  if (format === 'css') {
    let css = ':root {\n';
    Object.entries(scale).forEach(([name, value]) => {
      css += `  --font-size-${name}: ${value}px;\n`;
    });
    css += `  --line-height: ${lineHeight.value};\n`;
    css += '}\n\n';
    css += '/* Usage example */\n';
    css += '.text-h1 { font-size: var(--font-size-h1); }\n';
    css += '.text-h2 { font-size: var(--font-size-h2); }\n';
    css += '.text-body { font-size: var(--font-size-body); }\n';
    downloadText(css, 'text/css', `font-scale-${Date.now()}.css`);
  } else if (format === 'tailwind') {
    let config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      fontSize: {\n`;
    Object.entries(scale).forEach(([name, value]) => {
      config += `        '${name}': '${value}px',\n`;
    });
    config += `      },\n    },\n  },\n};\n`;
    downloadText(config, 'text/javascript', `font-scale-tailwind-${Date.now()}.js`);
  } else if (format === 'json') {
    const config = {
      type: 'font-scale',
      base: baseSize.value,
      ratio: currentRatio.value,
      ratioName: selectedRatio.value,
      lineHeight: lineHeight.value,
      letterSpacing: letterSpacing.value,
      scale: scale
    };
    downloadText(JSON.stringify(config, null, 2), 'application/json', `font-scale-${Date.now()}.json`);
  }
};
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

