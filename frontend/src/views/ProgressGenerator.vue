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
                      Progress Indicator Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create customizable progress bars, circular progress indicators, and step indicators. Generate React or Vue components with animations.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">trending_up</span>
                      Component Utility
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
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Progress bar representation -->
                      <rect x="30" y="80" width="140" height="20" rx="10" fill="url(#progressGradient)" opacity="0.3"/>
                      <rect x="30" y="80" width="84" height="20" rx="10" fill="url(#progressGradient)" opacity="0.8"/>
                      <!-- Circular progress -->
                      <circle cx="100" cy="140" r="30" fill="none" stroke="url(#progressGradient)" stroke-width="8" opacity="0.3"/>
                      <circle cx="100" cy="140" r="30" fill="none" stroke="url(#progressGradient)" stroke-width="8" opacity="0.8" stroke-dasharray="94.25" stroke-dashoffset="47.125" transform="rotate(-90 100 140)"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Configuration Panel -->
              <div class="lg:col-span-1">
                <div 
                  class="rounded-lg shadow-sm border p-6 mb-6 sticky top-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">tune</span>
                    Configuration
                  </h2>

                  <!-- Type Selector -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Type
                    </label>
                    <div class="grid grid-cols-1 gap-2">
                      <button
                        v-for="type in progressTypes"
                        :key="type.value"
                        @click="config.type = type.value"
                        class="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left"
                        :class="config.type === type.value
                          ? (isDarkMode 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-indigo-600 text-white')
                          : (isDarkMode
                            ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                      >
                        <span class="material-symbols-outlined text-base mr-2 align-middle">{{ type.icon }}</span>
                        {{ type.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Value Input -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Value: {{ config.value }}%
                    </label>
                    <input
                      v-model.number="config.value"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      :class="isDarkMode ? 'bg-slate-700 accent-indigo-500' : 'bg-gray-200 accent-indigo-600'"
                    />
                    <div class="flex justify-between text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <!-- State Selector -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      State
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        v-for="state in progressStates"
                        :key="state.value"
                        @click="config.state = state.value"
                        class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        :class="config.state === state.value
                          ? (isDarkMode 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-indigo-600 text-white')
                          : (isDarkMode
                            ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                      >
                        {{ state.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Size Selector -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Size
                    </label>
                    <select
                      v-model="config.size"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'"
                    >
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                    </select>
                  </div>

                  <!-- Color Pickers -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Fill Color
                    </label>
                    <div class="flex gap-2">
                      <input
                        v-model="config.fillColor"
                        type="color"
                        class="w-16 h-10 rounded border cursor-pointer"
                        :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                      />
                      <input
                        v-model="config.fillColor"
                        type="text"
                        placeholder="#6366f1"
                        class="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors font-mono text-sm"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                      />
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Track Color
                    </label>
                    <div class="flex gap-2">
                      <input
                        v-model="config.trackColor"
                        type="color"
                        class="w-16 h-10 rounded border cursor-pointer"
                        :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                      />
                      <input
                        v-model="config.trackColor"
                        type="text"
                        placeholder="#e5e7eb"
                        class="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors font-mono text-sm"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                      />
                    </div>
                  </div>

                  <!-- Label Configuration -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Label
                    </label>
                    <input
                      v-model="config.label"
                      type="text"
                      placeholder="Loading..."
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors mb-2"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                    />
                    <select
                      v-model="config.labelPosition"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'"
                    >
                      <option value="inside">Inside</option>
                      <option value="outside">Outside</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  <!-- Animation Toggle -->
                  <div class="mb-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="config.animated"
                        type="checkbox"
                        class="w-4 h-4"
                        :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Animated</span>
                    </label>
                  </div>

                  <!-- Striped Pattern Toggle -->
                  <div v-if="config.type === 'linear'" class="mb-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="config.striped"
                        type="checkbox"
                        class="w-4 h-4"
                        :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Striped Pattern</span>
                    </label>
                  </div>

                  <!-- Show Percentage Toggle -->
                  <div class="mb-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="config.showPercentage"
                        type="checkbox"
                        class="w-4 h-4"
                        :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Show Percentage</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Preview and Export Panel -->
              <div class="lg:col-span-2">
                <!-- Preview Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6 mb-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">preview</span>
                    Preview
                  </h2>
                  
                  <div class="space-y-8 p-8 rounded-lg"
                    :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
                  >
                    <!-- Linear Progress -->
                    <div v-if="config.type === 'linear'">
                      <div
                        class="relative"
                        :style="getLinearProgressStyles()"
                        role="progressbar"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        :aria-valuenow="progressValue"
                        :aria-label="config.label || 'Progress'"
                      >
                        <div 
                          class="h-full rounded-full"
                          :style="getLinearProgressFillStyles()"
                        >
                          <span v-if="config.labelPosition === 'inside' && config.label" 
                            class="absolute inset-0 flex items-center justify-center text-xs font-medium z-10"
                            :style="{ color: getTextColor() }"
                          >
                            {{ config.label }} {{ config.showPercentage ? `${config.value}%` : '' }}
                          </span>
                        </div>
                      </div>
                      <p v-if="config.labelPosition === 'outside' && config.label" 
                        class="text-sm mt-2"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        {{ config.label }} {{ config.showPercentage ? `${config.value}%` : '' }}
                      </p>
                    </div>

                    <!-- Circular Progress -->
                    <div v-if="config.type === 'circular'" class="flex justify-center">
                      <div
                        class="relative"
                        :style="getCircularProgressStyles()"
                        role="progressbar"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        :aria-valuenow="progressValue"
                        :aria-label="config.label || 'Progress'"
                      >
                        <svg :width="getCircularSize()" :height="getCircularSize()" class="transform -rotate-90">
                          <circle
                            :cx="getCircularSize() / 2"
                            :cy="getCircularSize() / 2"
                            :r="(getCircularSize() - 16) / 2"
                            fill="none"
                            :stroke="getStateColors().track"
                            stroke-width="8"
                          />
                          <circle
                            :cx="getCircularSize() / 2"
                            :cy="getCircularSize() / 2"
                            :r="(getCircularSize() - 16) / 2"
                            fill="none"
                            :stroke="getStateColors().fill"
                            stroke-width="8"
                            :stroke-dasharray="getCircularCircumference()"
                            :stroke-dashoffset="getCircularOffset()"
                            :style="config.animated ? { transition: 'stroke-dashoffset 0.3s ease' } : {}"
                          />
                        </svg>
                        <div v-if="config.labelPosition !== 'none'" 
                          class="absolute inset-0 flex items-center justify-center flex-col"
                        >
                          <span v-if="config.label" 
                            class="text-sm font-medium"
                            :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                          >
                            {{ config.label }}
                          </span>
                          <span v-if="config.showPercentage" 
                            class="text-lg font-bold"
                            :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                          >
                            {{ config.value }}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Step Indicator -->
                    <div v-if="config.type === 'steps'" class="space-y-4">
                      <div
                        class="flex items-center justify-between"
                        role="progressbar"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        :aria-valuenow="progressValue"
                        :aria-valuetext="`Step ${completedSteps} of ${STEP_COUNT} complete`"
                        :aria-label="config.label || 'Progress'"
                      >
                        <div 
                          v-for="(step, index) in STEP_COUNT"
                          :key="index"
                          class="flex items-center"
                        >
                          <div 
                            class="rounded-full flex items-center justify-center font-medium"
                            :style="getStepStyles(index)"
                          >
                            <span v-if="index < completedSteps" class="material-symbols-outlined text-sm">check</span>
                            <span v-else class="text-xs">{{ index + 1 }}</span>
                          </div>
                          <div 
                            v-if="index < STEP_COUNT - 1"
                            class="h-1 mx-1"
                            :style="{ 
                              width: '40px',
                              backgroundColor: index < completedSteps ? getStateColors().fill : getStateColors().track
                            }"
                          ></div>
                        </div>
                      </div>
                      <p v-if="config.label" 
                        class="text-sm text-center"
                        :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                      >
                        {{ config.label }} {{ config.showPercentage ? `${config.value}%` : '' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Export Section -->
                <div 
                  class="rounded-lg shadow-sm border p-6"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-700' 
                    : 'bg-white border-gray-200'"
                >
                  <h2 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">download</span>
                    Export
                  </h2>

                  <div class="space-y-4">
                    <!-- Export Format Selector -->
                    <div>
                      <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Export Format
                      </label>
                      <div class="flex gap-2">
                        <button
                          v-for="format in exportFormats"
                          :key="format.value"
                          @click="selectedExportFormat = format.value"
                          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          :class="selectedExportFormat === format.value
                            ? (isDarkMode 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-indigo-600 text-white')
                            : (isDarkMode
                              ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                        >
                          {{ format.label }}
                        </button>
                      </div>
                    </div>

                    <!-- Code Preview -->
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Generated Code
                        </label>
                        <button
                          @click="copyCode"
                          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                          :class="isDarkMode 
                            ? 'bg-indigo-500 text-white hover:bg-indigo-400' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'"
                        >
                          <span class="material-symbols-outlined text-sm mr-1 align-middle">content_copy</span>
                          Copy
                        </button>
                      </div>
                      <InlineNotice :notice="notice" class="mb-2" @dismiss="clearNotice" />
                      <textarea
                        :value="generatedCode"
                        readonly
                        class="w-full h-64 px-4 py-3 border rounded-lg font-mono text-sm resize-none"
                        :class="isDarkMode 
                          ? 'bg-slate-950 text-gray-100 border-gray-700' 
                          : 'bg-gray-50 text-gray-900 border-gray-300'"
                      ></textarea>
                    </div>
                  </div>
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
import { ref, computed } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';

const isDarkMode = useDarkMode();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const { notice, showNotice, clearNotice } = useNotice();
const STEP_COUNT = 5;

const progressTypes = [
  { label: 'Linear Bar', value: 'linear', icon: 'linear_scale' },
  { label: 'Circular', value: 'circular', icon: 'radio_button_checked' },
  { label: 'Step Indicator', value: 'steps', icon: 'steps' }
];

const progressStates = [
  { label: 'Default', value: 'default' },
  { label: 'Success', value: 'success' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' }
];

const exportFormats = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'CSS', value: 'css' }
];

const config = ref({
  type: 'linear',
  value: 65,
  state: 'default',
  size: 'md',
  fillColor: '#6366f1',
  trackColor: '#e5e7eb',
  label: 'Loading...',
  labelPosition: 'inside',
  animated: false,
  striped: false,
  showPercentage: true
});

const selectedExportFormat = ref('react');

// 0-100, whatever the input gives.
const progressValue = computed(() => {
  const n = Number(config.value.value);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
});

const completedSteps = computed(() => Math.floor(progressValue.value / (100 / STEP_COUNT)));

const getStateColors = () => {
  const stateMap = {
    default: { fill: config.value.fillColor, track: config.value.trackColor },
    success: { fill: '#10b981', track: '#d1fae5' },
    warning: { fill: '#f59e0b', track: '#fef3c7' },
    error: { fill: '#ef4444', track: '#fee2e2' }
  };
  return stateMap[config.value.state] || stateMap.default;
};

const getTextColor = () => {
  return config.value.labelPosition === 'inside' ? '#ffffff' : (isDarkMode.value ? '#e5e7eb' : '#374151');
};

const getLinearProgressStyles = () => {
  const sizeMap = {
    sm: { height: '8px' },
    md: { height: '12px' },
    lg: { height: '16px' }
  };
  return {
    width: '100%',
    backgroundColor: getStateColors().track,
    borderRadius: '9999px',
    overflow: 'hidden',
    ...sizeMap[config.value.size]
  };
};

const getLinearProgressFillStyles = () => {
  const colors = getStateColors();
  const styles = {
    width: `${progressValue.value}%`,
    height: '100%',
    borderRadius: '9999px',
    transition: config.value.animated ? 'width 0.3s ease' : 'none',
    backgroundColor: colors.fill
  };
  
  // Apply striped pattern via inline styles to ensure it works
  if (config.value.striped) {
    // Subtle white semi-transparent stripes at 45 degrees (matching screenshot style)
    styles.backgroundImage = `linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    )`;
    styles.backgroundSize = '1rem 1rem';
    styles.backgroundRepeat = 'repeat';
    
    // Add animation when both striped and animated are enabled
    if (config.value.animated) {
      styles.animation = 'progress-stripes 1s linear infinite';
    }
  } else {
    styles.backgroundImage = 'none';
  }
  
  return styles;
};

const getCircularSize = () => {
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 160
  };
  return sizeMap[config.value.size];
};

const getCircularCircumference = () => {
  const radius = (getCircularSize() - 16) / 2;
  return 2 * Math.PI * radius;
};

const getCircularOffset = () => {
  const circumference = getCircularCircumference();
  return circumference - (progressValue.value / 100) * circumference;
};

const getCircularProgressStyles = () => {
  return {
    width: `${getCircularSize()}px`,
    height: `${getCircularSize()}px`
  };
};

const getStepStyles = (index) => {
  const colors = getStateColors();
  const isCompleted = index < completedSteps.value;
  const sizeMap = {
    sm: { width: '32px', height: '32px', fontSize: '12px' },
    md: { width: '40px', height: '40px', fontSize: '14px' },
    lg: { width: '48px', height: '48px', fontSize: '16px' }
  };
  
  return {
    ...sizeMap[config.value.size],
    backgroundColor: isCompleted ? colors.fill : colors.track,
    color: isCompleted ? '#ffffff' : (isDarkMode.value ? '#9ca3af' : '#6b7280')
  };
};

const STRIPES = 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)';

const generatedCode = computed(() => {
  const c = config.value;
  const colors = getStateColors();
  // Strings go through JSON.stringify so quotes in the label can't break the code.
  const q = (value) => JSON.stringify(String(value ?? ''));
  const value = progressValue.value;

  if (selectedExportFormat.value === 'react') {
    if (c.type === 'linear') {
      return `import React from 'react';

// Needs this keyframe once in your CSS for animated stripes:
// @keyframes progress-stripes { from { background-position: 1rem 0; } to { background-position: 0 0; } }

export interface ProgressProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  fillColor?: string;
  trackColor?: string;
  label?: string;
  labelPosition?: 'inside' | 'outside' | 'none';
  animated?: boolean;
  striped?: boolean;
  showPercentage?: boolean;
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { height: '8px' },
  md: { height: '12px' },
  lg: { height: '16px' }
};

export const Progress: React.FC<ProgressProps> = ({
  value = ${value},
  size = ${q(c.size)},
  fillColor = ${q(colors.fill)},
  trackColor = ${q(colors.track)},
  label = ${q(c.label)},
  labelPosition = ${q(c.labelPosition)},
  animated = ${Boolean(c.animated)},
  striped = ${Boolean(c.striped)},
  showPercentage = ${Boolean(c.showPercentage)}
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const text = [label, showPercentage ? \`\${clamped}%\` : ''].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      <div
        className="relative rounded-full overflow-hidden"
        style={{ width: '100%', backgroundColor: trackColor, ...sizeStyles[size] }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label || 'Progress'}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: \`\${clamped}%\`,
            backgroundColor: fillColor,
            transition: animated ? 'width 0.3s ease' : 'none',
            backgroundImage: striped ? '${STRIPES}' : 'none',
            backgroundSize: striped ? '1rem 1rem' : 'auto',
            animation: striped && animated ? 'progress-stripes 1s linear infinite' : 'none'
          }}
        />
        {labelPosition === 'inside' && text && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
            {text}
          </span>
        )}
      </div>
      {labelPosition === 'outside' && text && <p className="text-sm mt-2">{text}</p>}
    </div>
  );
};`;
    } else if (c.type === 'circular') {
      return `import React from 'react';

export interface CircularProgressProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  fillColor?: string;
  trackColor?: string;
  label?: string;
  labelPosition?: 'inside' | 'outside' | 'none';
  animated?: boolean;
  showPercentage?: boolean;
}

const sizeMap: Record<string, number> = { sm: 80, md: 120, lg: 160 };

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = ${value},
  size = ${q(c.size)},
  fillColor = ${q(colors.fill)},
  trackColor = ${q(colors.track)},
  label = ${q(c.label)},
  labelPosition = ${q(c.labelPosition)},
  animated = ${Boolean(c.animated)},
  showPercentage = ${Boolean(c.showPercentage)}
}) => {
  const clamped = Math.min(100, Math.max(0, value));
  const diameter = sizeMap[size];
  const radius = (diameter - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative"
      style={{ width: \`\${diameter}px\`, height: \`\${diameter}px\` }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label || 'Progress'}
    >
      <svg width={diameter} height={diameter} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={diameter / 2} cy={diameter / 2} r={radius} fill="none" stroke={trackColor} strokeWidth="8" />
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: animated ? 'stroke-dashoffset 0.3s ease' : 'none' }}
        />
      </svg>
      {labelPosition !== 'none' && (
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showPercentage && <span className="text-lg font-bold">{clamped}%</span>}
        </div>
      )}
    </div>
  );
};`;
    } else {
      return `import React from 'react';

export interface StepProgressProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
  fillColor?: string;
  trackColor?: string;
  label?: string;
  showPercentage?: boolean;
  steps?: number;
}

const sizeMap: Record<string, React.CSSProperties> = {
  sm: { width: '32px', height: '32px', fontSize: '12px' },
  md: { width: '40px', height: '40px', fontSize: '14px' },
  lg: { width: '48px', height: '48px', fontSize: '16px' }
};

export const StepProgress: React.FC<StepProgressProps> = ({
  value = ${value},
  size = ${q(c.size)},
  fillColor = ${q(colors.fill)},
  trackColor = ${q(colors.track)},
  label = ${q(c.label)},
  showPercentage = ${Boolean(c.showPercentage)},
  steps = ${STEP_COUNT}
}) => {
  const stepCount = Math.max(1, Math.floor(steps));
  const clamped = Math.min(100, Math.max(0, value));
  const completedSteps = Math.floor(clamped / (100 / stepCount));

  return (
    <div className="w-full">
      <div
        className="flex items-center justify-between"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-valuetext={\`Step \${completedSteps} of \${stepCount} complete\`}
        aria-label={label || 'Progress'}
      >
        {Array.from({ length: stepCount }).map((_, index) => (
          <React.Fragment key={index}>
            <div
              className="rounded-full flex items-center justify-center font-medium"
              style={{
                ...sizeMap[size],
                backgroundColor: index < completedSteps ? fillColor : trackColor,
                color: index < completedSteps ? '#ffffff' : '#6b7280'
              }}
            >
              {index < completedSteps ? '✓' : index + 1}
            </div>
            {index < stepCount - 1 && (
              <div
                className="h-1 mx-1"
                style={{ width: '40px', backgroundColor: index < completedSteps ? fillColor : trackColor }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      {label && (
        <p className="text-sm text-center mt-4">
          {label} {showPercentage && \`\${clamped}%\`}
        </p>
      )}
    </div>
  );
};`;
    }
  } else if (selectedExportFormat.value === 'vue') {
    const templateOpen = String.fromCharCode(60) + 'template' + String.fromCharCode(62);
    const templateClose = String.fromCharCode(60) + '/' + 'template' + String.fromCharCode(62);
    const scriptSetupOpen = String.fromCharCode(60) + 'script setup' + String.fromCharCode(62);
    const scriptClose = String.fromCharCode(60) + '/' + 'script' + String.fromCharCode(62);

    let template;
    if (c.type === 'linear') {
      template = `
  <div class="w-full">
    <div
      class="relative rounded-full overflow-hidden"
      :style="{ width: '100%', backgroundColor: trackColor, height: heights[size] }"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="clamped"
      :aria-label="label || 'Progress'"
    >
      <div class="h-full rounded-full" :style="fillStyle"></div>
      <span
        v-if="labelPosition === 'inside' && text"
        class="absolute inset-0 flex items-center justify-center text-xs font-medium text-white"
      >{{ text }}</span>
    </div>
    <p v-if="labelPosition === 'outside' && text" class="text-sm mt-2">{{ text }}</p>
  </div>
`;
    } else if (c.type === 'circular') {
      template = `
  <div
    class="relative"
    :style="{ width: diameter + 'px', height: diameter + 'px' }"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="clamped"
    :aria-label="label || 'Progress'"
  >
    <svg :width="diameter" :height="diameter" style="transform: rotate(-90deg)" aria-hidden="true">
      <circle :cx="diameter / 2" :cy="diameter / 2" :r="radius" fill="none" :stroke="trackColor" stroke-width="8" />
      <circle
        :cx="diameter / 2"
        :cy="diameter / 2"
        :r="radius"
        fill="none"
        :stroke="fillColor"
        stroke-width="8"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="circumference - (clamped / 100) * circumference"
        :style="{ transition: animated ? 'stroke-dashoffset 0.3s ease' : 'none' }"
      />
    </svg>
    <div v-if="labelPosition !== 'none'" class="absolute inset-0 flex items-center justify-center flex-col">
      <span v-if="label" class="text-sm font-medium">{{ label }}</span>
      <span v-if="showPercentage" class="text-lg font-bold">{{ clamped }}%</span>
    </div>
  </div>
`;
    } else {
      template = `
  <div class="w-full">
    <div
      class="flex items-center justify-between"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="clamped"
      :aria-valuetext="\`Step \${completedSteps} of \${steps} complete\`"
      :aria-label="label || 'Progress'"
    >
      <template v-for="(step, index) in steps" :key="index">
        <div
          class="rounded-full flex items-center justify-center font-medium"
          :style="{
            ...stepSizes[size],
            backgroundColor: index < completedSteps ? fillColor : trackColor,
            color: index < completedSteps ? '#ffffff' : '#6b7280'
          }"
        >{{ index < completedSteps ? '✓' : index + 1 }}</div>
        <div
          v-if="index < steps - 1"
          class="h-1 mx-1"
          :style="{ width: '40px', backgroundColor: index < completedSteps ? fillColor : trackColor }"
        ></div>
      </template>
    </div>
    <p v-if="text" class="text-sm text-center mt-4">{{ text }}</p>
  </div>
`;
    }

    return templateOpen + template + templateClose + `

` + scriptSetupOpen + `
import { computed } from 'vue';

const props = defineProps({
  value: { type: Number, default: ${value} },
  size: { type: String, default: ${q(c.size)} },
  fillColor: { type: String, default: ${q(colors.fill)} },
  trackColor: { type: String, default: ${q(colors.track)} },
  label: { type: String, default: ${q(c.label)} },
  labelPosition: { type: String, default: ${q(c.labelPosition)} },
  animated: { type: Boolean, default: ${Boolean(c.animated)} },
  striped: { type: Boolean, default: ${Boolean(c.striped)} },
  showPercentage: { type: Boolean, default: ${Boolean(c.showPercentage)} },
  steps: { type: Number, default: ${STEP_COUNT} }
});

const heights = { sm: '8px', md: '12px', lg: '16px' };
const stepSizes = {
  sm: { width: '32px', height: '32px', fontSize: '12px' },
  md: { width: '40px', height: '40px', fontSize: '14px' },
  lg: { width: '48px', height: '48px', fontSize: '16px' }
};
const diameters = { sm: 80, md: 120, lg: 160 };

const clamped = computed(() => Math.min(100, Math.max(0, props.value)));
const text = computed(() => [props.label, props.showPercentage ? \`\${clamped.value}%\` : ''].filter(Boolean).join(' '));
const diameter = computed(() => diameters[props.size]);
const radius = computed(() => (diameter.value - 16) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const completedSteps = computed(() => Math.floor(clamped.value / (100 / Math.max(1, props.steps))));

const fillStyle = computed(() => ({
  width: \`\${clamped.value}%\`,
  backgroundColor: props.fillColor,
  transition: props.animated ? 'width 0.3s ease' : 'none',
  backgroundImage: props.striped ? '${STRIPES}' : 'none',
  backgroundSize: props.striped ? '1rem 1rem' : 'auto',
  animation: props.striped && props.animated ? 'progress-stripes 1s linear infinite' : 'none'
}));
` + scriptClose + `

<style>
@keyframes progress-stripes {
  from { background-position: 1rem 0; }
  to { background-position: 0 0; }
}
</style>`;
  } else {
    const heights = { sm: '8px', md: '12px', lg: '16px' };
    return `/* CSS for Progress Indicator */
.progress-linear {
  position: relative;
  width: 100%;
  height: ${heights[c.size] || '12px'};
  background-color: ${colors.track};
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  width: ${value}%; /* set from your progress value */
  height: 100%;
  background-color: ${colors.fill};
  border-radius: 9999px;
  transition: ${c.animated ? 'width 0.3s ease' : 'none'};
}

.progress-fill.progress-striped {
  background-image: ${STRIPES};
  background-size: 1rem 1rem;
}

.progress-fill.progress-striped.progress-animated {
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  from { background-position: 1rem 0; }
  to { background-position: 0 0; }
}

/* Usage:
<div class="progress-linear" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}">
  <div class="progress-fill${c.striped ? ' progress-striped' : ''}${c.striped && c.animated ? ' progress-animated' : ''}"></div>
</div>
*/`;
  }
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
    showNotice('Code copied to clipboard.', 'success');
  } catch (error) {
    console.error('Copy failed:', error);
    showNotice('Could not copy to the clipboard. Select the code and copy it manually.', 'error');
  }
};





</script>

<style>
/* Global keyframes for progress animations */
@keyframes progress-stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 1rem 0;
  }
}

/* Global styles for progress striped pattern */
.progress-striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  ) !important;
  background-size: 1rem 1rem !important;
  background-repeat: repeat !important;
}

.progress-animated {
  animation: progress-stripes 1s linear infinite !important;
}
</style>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

