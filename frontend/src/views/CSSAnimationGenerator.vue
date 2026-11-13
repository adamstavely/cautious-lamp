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
                      CSS Animation Generator
                    </h1>
                    <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                      Production Ready
                    </span>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create smooth CSS animations with keyframe editor. Generate animations for transform, opacity, colors, and more.
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
                        <linearGradient id="cssAnimationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Stylized animation icon -->
                      <circle cx="100" cy="100" r="40" fill="url(#cssAnimationGradient)" opacity="0.6">
                        <animate attributeName="r" values="40;50;40" dur="2s" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="max-w-6xl mx-auto">
            <!-- Animation Configuration -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <!-- Basic Settings -->
              <div 
                class="rounded-lg border p-6" 
                :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
              >
                <h4 
                  class="font-semibold mb-4 flex items-center gap-2" 
                  :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                >
                  <span class="material-symbols-outlined text-indigo-600">settings</span>
                  Animation Settings
                </h4>
                <div class="space-y-4">
                  <div>
                    <label 
                      class="text-sm font-medium mb-2 block"
                      :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                    >
                      Animation Name
                    </label>
                    <input 
                      v-model="animationName"
                      type="text"
                      placeholder="fadeIn"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label 
                        class="text-sm font-medium mb-2 block"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        Duration (ms)
                      </label>
                      <input 
                        v-model.number="duration"
                        type="number"
                        min="0"
                        step="100"
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
                        Delay (ms)
                      </label>
                      <input 
                        v-model.number="delay"
                        type="number"
                        min="0"
                        step="100"
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label 
                      class="text-sm font-medium mb-2 block"
                      :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                    >
                      Timing Function
                    </label>
                    <select
                      v-model="timingFunction"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    >
                      <option value="ease">ease</option>
                      <option value="linear">linear</option>
                      <option value="ease-in">ease-in</option>
                      <option value="ease-out">ease-out</option>
                      <option value="ease-in-out">ease-in-out</option>
                      <option value="cubic-bezier(0.4, 0, 0.2, 1)">cubic-bezier (default)</option>
                    </select>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label 
                        class="text-sm font-medium mb-2 block"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        Iteration Count
                      </label>
                      <input 
                        v-model="iterationCount"
                        type="text"
                        placeholder="1 or infinite"
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
                        Direction
                      </label>
                      <select
                        v-model="direction"
                        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-700 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      >
                        <option value="normal">normal</option>
                        <option value="reverse">reverse</option>
                        <option value="alternate">alternate</option>
                        <option value="alternate-reverse">alternate-reverse</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label 
                      class="text-sm font-medium mb-2 block"
                      :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                    >
                      Fill Mode
                    </label>
                    <select
                      v-model="fillMode"
                      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    >
                      <option value="none">none</option>
                      <option value="forwards">forwards</option>
                      <option value="backwards">backwards</option>
                      <option value="both">both</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Keyframes Editor -->
              <div 
                class="rounded-lg border p-6" 
                :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'"
              >
                <div class="flex items-center justify-between mb-4">
                  <h4 
                    class="font-semibold flex items-center gap-2" 
                    :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                  >
                    <span class="material-symbols-outlined text-indigo-600">timeline</span>
                    Keyframes
                  </h4>
                  <div class="flex gap-2">
                    <button
                      v-for="preset in presets"
                      :key="preset.name"
                      @click="loadPreset(preset)"
                      class="px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors"
                      :class="isDarkMode
                        ? 'bg-slate-700 border-gray-600 text-white hover:bg-slate-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
                    >
                      {{ preset.name }}
                    </button>
                  </div>
                </div>
                
                <div class="space-y-4">
                  <div 
                    v-for="(keyframe, index) in keyframes" 
                    :key="keyframe.id"
                    class="p-4 rounded-lg border"
                    :class="isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-gray-50 border-gray-200'"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <h5 
                        class="font-medium text-sm"
                        :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                      >
                        Keyframe {{ index === 0 ? 'From (0%)' : index === keyframes.length - 1 ? 'To (100%)' : `${formatOffset(keyframe.offset)}%` }}
                      </h5>
                      <button
                        v-if="keyframes.length > 2"
                        @click="removeKeyframe(index)"
                        class="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <span class="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                    
                    <div class="mb-3" v-if="index > 0 && index < keyframes.length - 1">
                      <label 
                        class="text-xs font-medium mb-1 block"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        Offset (0-1)
                      </label>
                      <input 
                        v-model.number="keyframe.offset"
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        :class="isDarkMode 
                          ? 'border-gray-600 bg-slate-600 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'"
                      />
                    </div>
                    
                    <div class="space-y-2">
                      <div 
                        v-for="property in animatableProperties" 
                        :key="property.name"
                        class="flex items-center gap-2"
                      >
                        <input 
                          :id="`kf-${keyframe.id}-${property.name}`"
                          type="checkbox"
                          :checked="keyframe.properties[property.name] !== undefined"
                          @change="toggleProperty(keyframe, property.name, $event.target.checked)"
                          class="rounded"
                        />
                        <label 
                          :for="`kf-${keyframe.id}-${property.name}`"
                          class="text-xs flex-1 cursor-pointer"
                          :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                        >
                          {{ property.label }}
                        </label>
                        <input 
                          v-if="keyframe.properties[property.name] !== undefined"
                          v-model="keyframe.properties[property.name]"
                          :type="property.type"
                          :placeholder="property.placeholder"
                          class="w-32 px-2 py-1 border rounded text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          :class="isDarkMode 
                            ? 'border-gray-600 bg-slate-600 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    @click="addKeyframe"
                    class="w-full px-4 py-2 text-sm rounded-lg border font-medium transition-colors flex items-center justify-center gap-2"
                    :class="isDarkMode
                      ? 'bg-slate-700 border-gray-600 text-white hover:bg-slate-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
                  >
                    <span class="material-symbols-outlined text-sm">add</span>
                    Add Keyframe
                  </button>
                </div>
              </div>
            </div>

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
                <button
                  type="button"
                  @click="replayPreview"
                  class="px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors flex items-center gap-1"
                  :class="isDarkMode
                    ? 'bg-slate-700 border-gray-600 text-white hover:bg-slate-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
                >
                  <span class="material-symbols-outlined text-sm">replay</span>
                  Replay
                </button>
              </div>
              <div 
                class="w-full h-64 rounded-lg flex items-center justify-center"
                :class="isDarkMode ? 'bg-slate-900' : 'bg-gray-100'"
              >
                <div 
                  :key="previewKey"
                  class="w-24 h-24 rounded-lg flex items-center justify-center font-medium"
                  :style="computedAnimationStyle"
                  :class="isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'"
                >
                  Preview
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
import { ref, computed, watchEffect, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { useDarkMode } from '../composables/useDarkMode.js';

const isDarkMode = useDarkMode();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const animationName = ref('fadeIn');
const duration = ref(300);
const delay = ref(0);
const timingFunction = ref('ease');
const iterationCount = ref('1');
const direction = ref('normal');
const fillMode = ref('forwards');

const animatableProperties = [
  { name: 'opacity', label: 'Opacity', type: 'number', placeholder: '0-1' },
  { name: 'transform', label: 'Transform', type: 'text', placeholder: 'translateX(10px)' },
  { name: 'backgroundColor', label: 'Background Color', type: 'color', placeholder: '#000000' },
  { name: 'color', label: 'Color', type: 'color', placeholder: '#000000' },
  { name: 'width', label: 'Width', type: 'text', placeholder: '100px' },
  { name: 'height', label: 'Height', type: 'text', placeholder: '100px' },
  { name: 'borderRadius', label: 'Border Radius', type: 'text', placeholder: '50%' },
  { name: 'boxShadow', label: 'Box Shadow', type: 'text', placeholder: '0 4px 6px rgba(0,0,0,0.1)' }
];

// Sensible starting values when a property is switched on (placeholders such
// as "0-1" are hints, not valid CSS values).
const propertyDefaults = {
  opacity: 1,
  transform: 'translateX(0)',
  backgroundColor: '#6366f1',
  color: '#ffffff',
  width: '96px',
  height: '96px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

let keyframeIdCounter = 0;
const withId = (kf) => ({ id: keyframeIdCounter++, offset: kf.offset, properties: { ...kf.properties } });

const keyframes = ref([
  { offset: 0, properties: { opacity: 0 } },
  { offset: 1, properties: { opacity: 1 } }
].map(withId));

const presets = [
  {
    name: 'Fade',
    keyframes: [
      { offset: 0, properties: { opacity: 0 } },
      { offset: 1, properties: { opacity: 1 } }
    ],
    duration: 300,
    timingFunction: 'ease'
  },
  {
    name: 'Slide',
    keyframes: [
      { offset: 0, properties: { transform: 'translateX(-100px)', opacity: 0 } },
      { offset: 1, properties: { transform: 'translateX(0)', opacity: 1 } }
    ],
    duration: 400,
    timingFunction: 'ease-out'
  },
  {
    name: 'Bounce',
    keyframes: [
      { offset: 0, properties: { transform: 'translateY(0)' } },
      { offset: 0.5, properties: { transform: 'translateY(-20px)' } },
      { offset: 1, properties: { transform: 'translateY(0)' } }
    ],
    duration: 600,
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite'
  },
  {
    name: 'Spin',
    keyframes: [
      { offset: 0, properties: { transform: 'rotate(0deg)' } },
      { offset: 1, properties: { transform: 'rotate(360deg)' } }
    ],
    duration: 1000,
    timingFunction: 'linear',
    iterationCount: 'infinite'
  },
  {
    name: 'Pulse',
    keyframes: [
      { offset: 0, properties: { transform: 'scale(1)' } },
      { offset: 0.5, properties: { transform: 'scale(1.1)' } },
      { offset: 1, properties: { transform: 'scale(1)' } }
    ],
    duration: 1000,
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite'
  },
  {
    name: 'Scale',
    keyframes: [
      { offset: 0, properties: { transform: 'scale(0)' } },
      { offset: 1, properties: { transform: 'scale(1)' } }
    ],
    duration: 300,
    timingFunction: 'ease-out'
  }
];

const toKebab = (key) => key.replace(/([A-Z])/g, '-$1').toLowerCase();

// The name is used as a CSS identifier: keep it to letters, digits, - and _,
// never starting with a digit, so it can't break out of the generated CSS.
const safeName = computed(() => {
  const cleaned = String(animationName.value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').replace(/^-+/, '');
  if (!cleaned) return 'animation';
  // Identifiers can't start with a digit; CSS-wide keywords and "none" aren't valid names.
  if (/^\d/.test(cleaned) || ['none', 'initial', 'inherit', 'unset', 'revert', 'default'].includes(cleaned.toLowerCase())) {
    return `anim-${cleaned}`;
  }
  return cleaned;
});

// Property values must not close the declaration/block they sit in.
const safeValue = (value) => String(value ?? '').replace(/[{};<>]/g, '').trim();

const clampOffset = (offset) => {
  const n = Number(offset);
  return offset === '' || !Number.isFinite(n) ? 0 : Math.min(1, Math.max(0, n));
};

const formatOffset = (offset) => Math.round(clampOffset(offset) * 10000) / 100;

const msValue = (value, { allowNegative = false } = {}) => {
  const n = Number(value);
  if (value === '' || value === null || !Number.isFinite(n)) return 0;
  return allowNegative ? n : Math.max(0, n);
};

// animation-iteration-count: "infinite" or a non-negative number.
const safeIterationCount = computed(() => {
  const raw = String(iterationCount.value ?? '').trim().toLowerCase();
  if (raw === 'infinite') return 'infinite';
  const n = Number(raw);
  return raw !== '' && Number.isFinite(n) && n >= 0 ? String(n) : '1';
});

// Keyframes in offset order, with only properties that have a value.
const orderedKeyframes = computed(() =>
  [...keyframes.value]
    .map((kf) => ({
      offset: formatOffset(kf.offset),
      properties: Object.entries(kf.properties)
        .map(([key, value]) => [key, safeValue(value)])
        .filter(([, value]) => value !== '')
    }))
    .sort((a, b) => a.offset - b.offset)
);

const animationShorthand = computed(() =>
  `${safeName.value} ${msValue(duration.value)}ms ${timingFunction.value} ${msValue(delay.value, { allowNegative: true })}ms ${safeIterationCount.value} ${direction.value} ${fillMode.value}`
);

const keyframesCss = (indent) =>
  orderedKeyframes.value.map((kf) => {
    const props = kf.properties
      .map(([key, value]) => `${indent}  ${toKebab(key)}: ${value};`)
      .join('\n');
    return `${indent}${kf.offset}% {\n${props}\n${indent}}`;
  }).join('\n\n');

// One <style> element for this page's preview, kept in sync and removed on unmount.
const styleEl = document.createElement('style');
styleEl.setAttribute('data-css-animation-generator', '');
document.head.appendChild(styleEl);

watchEffect(() => {
  styleEl.textContent = `@keyframes ${safeName.value} {\n${keyframesCss('  ')}\n}`;
});

onBeforeUnmount(() => {
  styleEl.remove();
});

const computedAnimationStyle = computed(() => {
  // Before the animation starts (with a delay), show the first keyframe.
  const inlineStyles = {};
  const first = orderedKeyframes.value[0];
  first?.properties.forEach(([key, value]) => {
    inlineStyles[toKebab(key)] = value;
  });

  return {
    ...inlineStyles,
    animation: animationShorthand.value
  };
});

const previewKey = ref(0);
const replayPreview = () => {
  previewKey.value++;
};

const toggleProperty = (keyframe, propertyName, enabled) => {
  if (enabled) {
    const property = animatableProperties.find(p => p.name === propertyName);
    keyframe.properties[propertyName] = propertyDefaults[propertyName] ?? property?.placeholder ?? '';
  } else {
    delete keyframe.properties[propertyName];
  }
};

const addKeyframe = () => {
  // Insert halfway between the last two keyframes (the end keyframe stays last).
  const list = keyframes.value;
  const before = clampOffset(list[list.length - 2]?.offset ?? 0);
  const after = clampOffset(list[list.length - 1]?.offset ?? 1);
  list.splice(list.length - 1, 0, withId({
    offset: Math.round(((before + after) / 2) * 100) / 100,
    properties: {}
  }));
};

const removeKeyframe = (index) => {
  if (keyframes.value.length > 2) {
    keyframes.value.splice(index, 1);
  }
};

const loadPreset = (preset) => {
  animationName.value = preset.name.toLowerCase().replace(/\s+/g, '');
  keyframes.value = preset.keyframes.map(withId);
  duration.value = preset.duration || 300;
  timingFunction.value = preset.timingFunction || 'ease';
  // Reset, so e.g. Bounce (infinite) followed by Fade doesn't stay infinite.
  iterationCount.value = preset.iterationCount || '1';
  replayPreview();
};

const downloadFile = (content, type, filename) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const exportFormat = (format) => {
  const name = safeName.value;

  if (format === 'css') {
    const css = `@keyframes ${name} {\n${keyframesCss('  ')}\n}\n\n.animated-element {\n  animation: ${animationShorthand.value};\n}\n`;
    downloadFile(css, 'text/css', `animation-${name}-${Date.now()}.css`);
  } else if (format === 'tailwind') {
    // Tailwind expects keyframes as a JS object: { '0%': { opacity: '0' } }.
    const keyframeObject = {};
    orderedKeyframes.value.forEach((kf) => {
      const props = {};
      kf.properties.forEach(([key, value]) => {
        props[key] = value;
      });
      keyframeObject[`${kf.offset}%`] = props;
    });
    const keyframesJs = JSON.stringify(keyframeObject, null, 2).replace(/\n/g, '\n        ');
    const config = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      keyframes: {\n        ${JSON.stringify(name)}: ${keyframesJs},\n      },\n      animation: {\n        ${JSON.stringify(name)}: ${JSON.stringify(animationShorthand.value)},\n      },\n    },\n  },\n};\n`;
    downloadFile(config, 'text/javascript', `animation-${name}-tailwind-${Date.now()}.js`);
  } else if (format === 'json') {
    const config = {
      type: 'css-animation',
      name,
      duration: msValue(duration.value),
      delay: msValue(delay.value, { allowNegative: true }),
      timingFunction: timingFunction.value,
      iterationCount: safeIterationCount.value,
      direction: direction.value,
      fillMode: fillMode.value,
      keyframes: orderedKeyframes.value.map((kf) => ({
        offset: kf.offset / 100,
        properties: Object.fromEntries(kf.properties)
      }))
    };
    downloadFile(JSON.stringify(config, null, 2), 'application/json', `animation-${name}-${Date.now()}.json`);
  }
};

</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

