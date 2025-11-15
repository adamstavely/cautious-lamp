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
                      Loading Spinner Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Create customizable loading animations including spinners, dots, bars, skeleton loaders, and pulse effects. Generate React or Vue components with CSS animations.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">refresh</span>
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
                        <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Spinner representation -->
                      <circle cx="100" cy="100" r="40" fill="none" stroke="url(#spinnerGradient)" stroke-width="8" opacity="0.3"/>
                      <circle cx="100" cy="100" r="40" fill="none" stroke="url(#spinnerGradient)" stroke-width="8" opacity="0.8" stroke-dasharray="125.66" stroke-dashoffset="62.83" transform="rotate(-90 100 100)"/>
                      <!-- Dots representation -->
                      <circle cx="60" cy="60" r="6" fill="url(#spinnerGradient)" opacity="0.6"/>
                      <circle cx="100" cy="60" r="6" fill="url(#spinnerGradient)" opacity="0.8"/>
                      <circle cx="140" cy="60" r="6" fill="url(#spinnerGradient)" opacity="0.6"/>
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
                    <div class="grid grid-cols-1 gap-2">
                      <button
                        v-for="style in spinnerStyles"
                        :key="style.value"
                        @click="config.style = style.value"
                        class="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left"
                        :class="config.style === style.value
                          ? (isDarkMode 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-indigo-600 text-white')
                          : (isDarkMode
                            ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                      >
                        <span class="material-symbols-outlined text-base mr-2 align-middle">{{ style.icon }}</span>
                        {{ style.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Color Picker -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Color
                    </label>
                    <div class="flex gap-2">
                      <input
                        v-model="config.color"
                        type="color"
                        class="w-16 h-10 rounded border cursor-pointer"
                        :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                      />
                      <input
                        v-model="config.color"
                        type="text"
                        placeholder="#6366f1"
                        class="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors font-mono text-sm"
                        :class="isDarkMode 
                          ? 'bg-slate-800 border-gray-600 text-white placeholder-gray-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                      />
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

                  <!-- Speed/Duration Slider -->
                  <div class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Speed: {{ config.speed }}s
                    </label>
                    <input
                      v-model.number="config.speed"
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      class="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      :class="isDarkMode ? 'bg-slate-700 accent-indigo-500' : 'bg-gray-200 accent-indigo-600'"
                    />
                    <div class="flex justify-between text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      <span>Slow</span>
                      <span>Fast</span>
                    </div>
                  </div>

                  <!-- Skeleton Configuration (only for skeleton style) -->
                  <div v-if="config.style === 'skeleton'" class="mb-4">
                    <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Rows
                    </label>
                    <input
                      v-model.number="config.skeletonRows"
                      type="number"
                      min="1"
                      max="10"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'"
                    />
                    <label class="block text-sm font-medium mb-2 mt-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Columns
                    </label>
                    <input
                      v-model.number="config.skeletonColumns"
                      type="number"
                      min="1"
                      max="5"
                      class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                      :class="isDarkMode 
                        ? 'bg-slate-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'"
                    />
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
                  
                  <div class="flex items-center justify-center p-12 rounded-lg min-h-[300px]"
                    :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
                  >
                    <!-- Spinner -->
                    <div v-if="config.style === 'spinner'" 
                      :style="getSpinnerStyles()"
                    ></div>

                    <!-- Dots -->
                    <div v-if="config.style === 'dots'" 
                      class="flex gap-2"
                    >
                      <div 
                        v-for="i in 3"
                        :key="i"
                        :style="getDotStyles(i)"
                      ></div>
                    </div>

                    <!-- Bars -->
                    <div v-if="config.style === 'bars'" 
                      class="flex gap-1 items-end"
                    >
                      <div 
                        v-for="i in 5"
                        :key="i"
                        :style="getBarStyles(i)"
                      ></div>
                    </div>

                    <!-- Skeleton -->
                    <div v-if="config.style === 'skeleton'" 
                      class="w-full space-y-3"
                    >
                      <div 
                        v-for="row in config.skeletonRows"
                        :key="row"
                        class="flex gap-3"
                      >
                        <div 
                          v-for="col in config.skeletonColumns"
                          :key="col"
                          :style="getSkeletonStyles()"
                        ></div>
                      </div>
                    </div>

                    <!-- Pulse -->
                    <div v-if="config.style === 'pulse'" 
                      :style="getPulseStyles()"
                    ></div>
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

const spinnerStyles = [
  { label: 'Spinner', value: 'spinner', icon: 'refresh' },
  { label: 'Dots', value: 'dots', icon: 'more_horiz' },
  { label: 'Bars', value: 'bars', icon: 'equalizer' },
  { label: 'Skeleton', value: 'skeleton', icon: 'view_agenda' },
  { label: 'Pulse', value: 'pulse', icon: 'radio_button_checked' }
];

const exportFormats = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'CSS', value: 'css' }
];

const config = ref({
  style: 'spinner',
  color: '#6366f1',
  size: 'md',
  speed: 1,
  skeletonRows: 3,
  skeletonColumns: 2
});

const selectedExportFormat = ref('react');

const getSizeValue = () => {
  const sizeMap = {
    sm: { spinner: '32px', dot: '8px', bar: '4px', pulse: '32px' },
    md: { spinner: '48px', dot: '12px', bar: '6px', pulse: '48px' },
    lg: { spinner: '64px', dot: '16px', bar: '8px', pulse: '64px' }
  };
  return sizeMap[config.value.size];
};

const getSpinnerStyles = () => {
  const sizes = getSizeValue();
  return {
    width: sizes.spinner,
    height: sizes.spinner,
    border: `4px solid ${config.value.color}20`,
    borderTop: `4px solid ${config.value.color}`,
    borderRadius: '50%',
    animation: `spinner-rotate ${config.value.speed}s linear infinite`,
    '--spinner-color': config.value.color,
    '--spinner-speed': `${config.value.speed}s`
  };
};

const getDotStyles = (index) => {
  const sizes = getSizeValue();
  return {
    width: sizes.dot,
    height: sizes.dot,
    backgroundColor: config.value.color,
    borderRadius: '50%',
    animation: `spinner-dot-bounce ${config.value.speed}s ease-in-out infinite`,
    animationDelay: `${(index - 1) * 0.15}s`,
    '--spinner-color': config.value.color,
    '--spinner-speed': `${config.value.speed}s`
  };
};

const getBarStyles = (index) => {
  const sizes = getSizeValue();
  const heights = ['20%', '40%', '60%', '40%', '20%'];
  return {
    width: sizes.bar,
    height: heights[index - 1],
    backgroundColor: config.value.color,
    borderRadius: '2px',
    animation: `spinner-bar-bounce ${config.value.speed}s ease-in-out infinite`,
    animationDelay: `${(index - 1) * 0.1}s`,
    '--spinner-color': config.value.color,
    '--spinner-speed': `${config.value.speed}s`
  };
};

const getSkeletonStyles = () => {
  return {
    backgroundColor: config.value.color,
    opacity: 0.1,
    borderRadius: '4px',
    height: '60px',
    flex: 1,
    animation: `skeleton-pulse ${config.value.speed}s ease-in-out infinite`,
    '--spinner-color': config.value.color,
    '--spinner-speed': `${config.value.speed}s`
  };
};

const getPulseStyles = () => {
  const sizes = getSizeValue();
  return {
    width: sizes.pulse,
    height: sizes.pulse,
    backgroundColor: config.value.color,
    borderRadius: '50%',
    animation: `spinner-pulse-scale ${config.value.speed}s ease-in-out infinite`,
    '--spinner-color': config.value.color,
    '--spinner-speed': `${config.value.speed}s`
  };
};

const generatedCode = computed(() => {
  const sizes = getSizeValue();
  
  if (selectedExportFormat.value === 'react') {
    if (config.value.style === 'spinner') {
      return `import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  speed?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = '${config.value.size}',
  color = '${config.value.color}',
  speed = ${config.value.speed}
}) => {
  const sizeMap = {
    sm: '32px',
    md: '48px',
    lg: '64px'
  };
  
  return (
    <div
      className="inline-block rounded-full"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: \`4px solid \${color}20\`,
        borderTop: \`4px solid \${color}\`,
        animation: \`spinner-rotate \${speed}s linear infinite\`
      }}
    />
  );
};

<style jsx>{\`
  @keyframes spinner-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
\`}</style>`;
    } else if (config.value.style === 'dots') {
      return `import React from 'react';

export interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  speed?: number;
}

export const DotsSpinner: React.FC<DotsSpinnerProps> = ({
  size = '${config.value.size}',
  color = '${config.value.color}',
  speed = ${config.value.speed}
}) => {
  const sizeMap = {
    sm: '8px',
    md: '12px',
    lg: '16px'
  };
  
  return (
    <div className="flex gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: sizeMap[size],
            height: sizeMap[size],
            backgroundColor: color,
            animation: \`spinner-dot-bounce \${speed}s ease-in-out infinite\`,
            animationDelay: \`\${(i - 1) * 0.15}s\`
          }}
        />
      ))}
    </div>
  );
};

<style jsx>{\`
  @keyframes spinner-dot-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
    40% { transform: translateY(-10px); opacity: 1; }
  }
\`}</style>`;
    } else if (config.value.style === 'skeleton') {
      return `import React from 'react';

export interface SkeletonLoaderProps {
  rows?: number;
  columns?: number;
  color?: string;
  speed?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  rows = ${config.value.skeletonRows},
  columns = ${config.value.skeletonColumns},
  color = '${config.value.color}',
  speed = ${config.value.speed}
}) => {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="flex-1 rounded"
              style={{
                height: '60px',
                backgroundColor: color,
                opacity: 0.1,
                animation: \`skeleton-pulse \${speed}s ease-in-out infinite\`
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

<style jsx>{\`
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 0.1; }
    50% { opacity: 0.2; }
  }
\`}</style>`;
    } else {
      return `/* Similar structure for other spinner types */`;
    }
  } else if (selectedExportFormat.value === 'vue') {
    return `<!-- Vue component code - similar structure -->`;
  } else {
    return `/* CSS Animations for Loading Spinner */
@keyframes spinner-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spinner-dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
  40% { transform: translateY(-10px); opacity: 1; }
}

@keyframes spinner-bar-bounce {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.2; }
}

@keyframes spinner-pulse-scale {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.spinner {
  border: 4px solid ${config.value.color}20;
  border-top: 4px solid ${config.value.color};
  border-radius: 50%;
  animation: spinner-rotate ${config.value.speed}s linear infinite;
}`;
  }
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value);
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

<style>
/* Global keyframes for loading animations - must be global for inline styles to work */
@keyframes spinner-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spinner-dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
  40% { transform: translateY(-10px); opacity: 1; }
}

@keyframes spinner-bar-bounce {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.2; }
}

@keyframes spinner-pulse-scale {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}
</style>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

