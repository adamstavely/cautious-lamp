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
                      Badge & Ribbon Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create customizable badges, labels, ribbons, and tags. Generate React or Vue components with all variants and states.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">label</span>
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
                        <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Badge representations -->
                      <rect x="40" y="80" width="120" height="40" rx="8" fill="url(#badgeGradient)" opacity="0.7"/>
                      <rect x="50" y="90" width="100" height="20" rx="4" fill="white" opacity="0.9"/>
                      <circle cx="60" cy="100" r="6" fill="url(#badgeGradient)"/>
                      <rect x="80" y="100" width="60" height="8" rx="2" fill="white" opacity="0.8"/>
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

                  <!-- Style Selector -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Style
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        v-for="style in badgeStyles"
                        :key="style.value"
                        @click="config.style = style.value"
                        class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        :class="config.style === style.value
                          ? (isDarkMode 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-indigo-600 text-white')
                          : (isDarkMode
                            ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                      >
                        {{ style.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Text Input -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Text
                    </label>
                    <input
                      v-model="config.text"
                      type="text"
                      placeholder="Badge text"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                    />
                  </div>

                  <!-- State Selector -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      State
                    </label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        v-for="state in badgeStates"
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
                      <option value="xs">Extra Small</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                    </select>
                  </div>

                  <!-- Icon Configuration -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Icon
                    </label>
                    <select
                      v-model="config.icon"
                      class="w-full px-4 py-2 rounded-lg border mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'"
                    >
                      <option value="">None</option>
                      <option value="check">Check</option>
                      <option value="close">Close</option>
                      <option value="star">Star</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                    </select>
                    <select
                      v-if="config.icon"
                      v-model="config.iconPosition"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <!-- Color Pickers -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Background Color
                    </label>
                    <div class="flex gap-2">
                      <input
                        v-model="config.backgroundColor"
                        type="color"
                        class="w-16 h-10 rounded border cursor-pointer"
                        :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                      />
                      <input
                        v-model="config.backgroundColor"
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
                      Text Color
                    </label>
                    <div class="flex gap-2">
                      <input
                        v-model="config.textColor"
                        type="color"
                        class="w-16 h-10 rounded border cursor-pointer"
                        :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                      />
                      <input
                        v-model="config.textColor"
                        type="text"
                        placeholder="#ffffff"
                        class="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors font-mono text-sm"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                      />
                    </div>
                  </div>

                  <!-- Border Radius -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Border Radius: {{ config.borderRadius }}px
                    </label>
                    <input
                      v-model.number="config.borderRadius"
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      :class="isDarkMode ? 'bg-slate-700 accent-indigo-500' : 'bg-gray-200 accent-indigo-600'"
                    />
                  </div>

                  <!-- Shadow Toggle -->
                  <div class="mb-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        v-model="config.hasShadow"
                        type="checkbox"
                        class="w-4 h-4"
                        :class="isDarkMode ? 'accent-indigo-500' : 'accent-indigo-600'"
                      />
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Enable Shadow</span>
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
                  
                  <div class="flex flex-wrap items-center gap-4 p-8 rounded-lg"
                    :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
                  >
                    <!-- Main Badge Preview -->
                    <div
                      :class="getBadgeClasses()"
                      :style="getBadgeStyles()"
                    >
                      <span v-if="config.icon && config.iconPosition === 'left'" class="material-symbols-outlined text-sm mr-1">
                        {{ getIconName() }}
                      </span>
                      <span>{{ config.text || 'Badge' }}</span>
                      <span v-if="config.icon && config.iconPosition === 'right'" class="material-symbols-outlined text-sm ml-1">
                        {{ getIconName() }}
                      </span>
                    </div>

                    <!-- State Examples -->
                    <div class="w-full mt-6 pt-6 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                      <p class="text-sm font-medium mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">State Examples:</p>
                      <div class="flex flex-wrap gap-3">
                        <div
                          v-for="state in badgeStates"
                          :key="state.value"
                          :class="getBadgeClasses(state.value)"
                          :style="getBadgeStyles(state.value)"
                        >
                          {{ state.label }}
                        </div>
                      </div>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);

const badgeStyles = [
  { label: 'Rounded', value: 'rounded' },
  { label: 'Pill', value: 'pill' },
  { label: 'Ribbon', value: 'ribbon' },
  { label: 'Medal', value: 'medal' },
  { label: 'Tag', value: 'tag' }
];

const badgeStates = [
  { label: 'Default', value: 'default' },
  { label: 'Success', value: 'success' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Info', value: 'info' }
];

const exportFormats = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'CSS', value: 'css' }
];

const config = ref({
  style: 'rounded',
  text: 'Badge',
  state: 'default',
  size: 'md',
  icon: '',
  iconPosition: 'left',
  backgroundColor: '#6366f1',
  textColor: '#ffffff',
  borderRadius: 8,
  hasShadow: false
});

const selectedExportFormat = ref('react');

const getIconName = () => {
  const iconMap = {
    check: 'check',
    close: 'close',
    star: 'star',
    info: 'info',
    warning: 'warning'
  };
  return iconMap[config.value.icon] || 'check';
};

const getStateColors = (state = null) => {
  const stateToUse = state || config.value.state;
  const colorMap = {
    default: { bg: config.value.backgroundColor, text: config.value.textColor },
    success: { bg: '#10b981', text: '#ffffff' },
    warning: { bg: '#f59e0b', text: '#ffffff' },
    error: { bg: '#ef4444', text: '#ffffff' },
    info: { bg: '#3b82f6', text: '#ffffff' }
  };
  return colorMap[stateToUse] || colorMap.default;
};

const getBadgeClasses = (stateOverride = null) => {
  const state = stateOverride || config.value.state;
  const sizeMap = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-sm px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
    xl: 'text-lg px-5 py-2.5'
  };
  
  const styleMap = {
    rounded: 'rounded-lg',
    pill: 'rounded-full',
    ribbon: 'rounded-lg',
    medal: 'rounded-full',
    tag: 'rounded'
  };
  
  return `inline-flex items-center font-medium ${sizeMap[config.value.size]} ${styleMap[config.value.style]}`;
};

const getBadgeStyles = (stateOverride = null) => {
  const colors = getStateColors(stateOverride);
  const styles = {
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: config.value.style === 'pill' ? '9999px' : `${config.value.borderRadius}px`
  };
  
  if (config.value.hasShadow) {
    styles.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
  }
  
  return styles;
};

const generatedCode = computed(() => {
  const colors = getStateColors();
  
  if (selectedExportFormat.value === 'react') {
    return `import React from 'react';

export interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: 'check' | 'close' | 'star' | 'info' | 'warning' | '';
  iconPosition?: 'left' | 'right';
  style?: 'rounded' | 'pill' | 'ribbon' | 'medal' | 'tag';
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  hasShadow?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = '${config.value.state}',
  size = '${config.value.size}',
  icon = '${config.value.icon || ''}',
  iconPosition = '${config.value.iconPosition}',
  style = '${config.value.style}',
  backgroundColor = '${colors.bg}',
  textColor = '${colors.text}',
  borderRadius = ${config.value.borderRadius},
  hasShadow = ${config.value.hasShadow}
}) => {
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-sm px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
    xl: 'text-lg px-5 py-2.5'
  };
  
  const styleClasses = {
    rounded: 'rounded-lg',
    pill: 'rounded-full',
    ribbon: 'rounded-lg',
    medal: 'rounded-full',
    tag: 'rounded'
  };
  
  const iconMap = {
    check: '✓',
    close: '✕',
    star: '★',
    info: 'ℹ',
    warning: '⚠'
  };
  
  return (
    <span
      className={\`inline-flex items-center font-medium \${sizeClasses[size]} \${styleClasses[style]}\`}
      style={{
        backgroundColor,
        color: textColor,
        borderRadius: style === 'pill' ? '9999px' : \`\${borderRadius}px\`,
        boxShadow: hasShadow ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none'
      }}
    >
      {icon && iconPosition === 'left' && <span className="mr-1">{iconMap[icon]}</span>}
      {text}
      {icon && iconPosition === 'right' && <span className="ml-1">{iconMap[icon]}</span>}
    </span>
  );
};`;
  } else if (selectedExportFormat.value === 'vue') {
    return `<template>
  <span
    :class="badgeClasses"
    :style="badgeStyles"
  >
    <span v-if="icon && iconPosition === 'left'" class="material-symbols-outlined text-sm mr-1">
      {{ iconName }}
    </span>
    {{ text }}
    <span v-if="icon && iconPosition === 'right'" class="material-symbols-outlined text-sm ml-1">
      {{ iconName }}
    </span>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: '${config.value.state}',
    validator: (value) => ['default', 'success', 'warning', 'error', 'info'].includes(value)
  },
  size: {
    type: String,
    default: '${config.value.size}',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  icon: {
    type: String,
    default: '${config.value.icon || ''}',
    validator: (value) => ['', 'check', 'close', 'star', 'info', 'warning'].includes(value)
  },
  iconPosition: {
    type: String,
    default: '${config.value.iconPosition}',
    validator: (value) => ['left', 'right'].includes(value)
  },
  style: {
    type: String,
    default: '${config.value.style}',
    validator: (value) => ['rounded', 'pill', 'ribbon', 'medal', 'tag'].includes(value)
  },
  backgroundColor: {
    type: String,
    default: '${colors.bg}'
  },
  textColor: {
    type: String,
    default: '${colors.text}'
  },
  borderRadius: {
    type: Number,
    default: ${config.value.borderRadius}
  },
  hasShadow: {
    type: Boolean,
    default: ${config.value.hasShadow}
  }
});

const sizeClasses = {
  xs: 'text-xs px-2 py-0.5',
  sm: 'text-sm px-2.5 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
  xl: 'text-lg px-5 py-2.5'
};

const styleClasses = {
  rounded: 'rounded-lg',
  pill: 'rounded-full',
  ribbon: 'rounded-lg',
  medal: 'rounded-full',
  tag: 'rounded'
};

const iconMap = {
  check: 'check',
  close: 'close',
  star: 'star',
  info: 'info',
  warning: 'warning'
};

const badgeClasses = computed(() => {
  return \`inline-flex items-center font-medium \${sizeClasses[props.size]} \${styleClasses[props.style]}\`;
});

const badgeStyles = computed(() => {
  return {
    backgroundColor: props.backgroundColor,
    color: props.textColor,
    borderRadius: props.style === 'pill' ? '9999px' : \`\${props.borderRadius}px\`,
    boxShadow: props.hasShadow ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' : 'none'
  };
});

const iconName = computed(() => {
  return props.icon ? iconMap[props.icon] : '';
});
</script>`;
  } else {
    return `.badge {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  background-color: ${colors.bg};
  color: ${colors.text};
  border-radius: ${config.value.style === 'pill' ? '9999px' : `${config.value.borderRadius}px`};
  ${config.value.hasShadow ? 'box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);' : ''}
}

.badge-xs {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
}

.badge-sm {
  font-size: 0.875rem;
  padding: 0.25rem 0.625rem;
}

.badge-md {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
}

.badge-lg {
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.badge-xl {
  font-size: 1.125rem;
  padding: 0.625rem 1.25rem;
}`;
  }
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
    // Could add toast notification here
  } catch (error) {
    console.error('Copy failed:', error);
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

