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
                  Design Tokens Playground
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Visualize and test design token combinations. See how tokens work together in real-time.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="playgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Playground/swatch representation -->
                    <rect x="40" y="40" width="120" height="120" rx="8" fill="url(#playgroundGradient)" opacity="0.2" stroke="url(#playgroundGradient)" stroke-width="2" stroke-opacity="0.4"/>
                    <!-- Color swatches -->
                    <rect x="60" y="60" width="30" height="30" rx="4" fill="url(#playgroundGradient)" opacity="0.5"/>
                    <rect x="100" y="60" width="30" height="30" rx="4" fill="url(#playgroundGradient)" opacity="0.6"/>
                    <rect x="140" y="60" width="30" height="30" rx="4" fill="url(#playgroundGradient)" opacity="0.4"/>
                    <rect x="60" y="100" width="30" height="30" rx="4" fill="url(#playgroundGradient)" opacity="0.6"/>
                    <rect x="100" y="100" width="30" height="30" rx="4" fill="url(#playgroundGradient)" opacity="0.5"/>
                    <rect x="140" y="100" width="30" height="30" rx="4" fill="url(#playgroundGradient)" opacity="0.4"/>
                    <!-- Play icon -->
                    <circle cx="100" cy="150" r="20" fill="url(#playgroundGradient)" opacity="0.5"/>
                    <path d="M 92 145 L 92 155 L 102 150 Z" fill="white" opacity="0.9"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Token Selector -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Token Categories -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-base text-indigo-600">folder</span>
                Token Categories
              </h3>
              <div class="space-y-2">
                <button
                  v-for="category in tokenCategories"
                  :key="category"
                  @click="selectedCategory = selectedCategory === category ? '' : category"
                  class="w-full px-4 py-2 rounded-lg text-left transition-colors text-sm"
                  :class="selectedCategory === category
                    ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                    : (isDarkMode ? 'bg-slate-800 text-gray-300 hover:bg-slate-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100')"
                >
                  {{ category }}
                </button>
              </div>
            </div>

            <!-- Selected Tokens -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-base text-indigo-600">check_circle</span>
                Selected Tokens
              </h3>
              <div v-if="selectedTokens.length === 0" class="text-sm text-center py-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                No tokens selected
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="token in selectedTokens"
                  :key="token.name"
                  class="flex items-center justify-between p-3 rounded-lg"
                  :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
                >
                  <div class="flex-1">
                    <div class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ token.name }}
                    </div>
                    <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ token.value }}
                    </div>
                  </div>
                  <button
                    @click="removeToken(token.name)"
                    class="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Remove token"
                  >
                    <span class="material-symbols-outlined text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Preview Area -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Token List -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-base text-indigo-600">style</span>
                  Available Tokens
                </h3>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base pointer-events-none">
                    search
                  </span>
                  <input
                    v-model="tokenSearch"
                    type="text"
                    placeholder="Search tokens..."
                    class="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'"
                  />
                </div>
              </div>
              <div class="grid md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                <div
                  v-for="token in filteredTokens"
                  :key="token.name"
                  @click="toggleToken(token)"
                  class="p-4 rounded-lg border cursor-pointer transition-all"
                  :class="isTokenSelected(token.name)
                    ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/30' : 'border-indigo-500 bg-indigo-50')
                    : (isDarkMode ? 'border-gray-700 bg-slate-800 hover:border-gray-600' : 'border-gray-200 bg-gray-50 hover:border-gray-300')"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <div class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ token.name }}
                      </div>
                      <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ token.category }}
                      </div>
                    </div>
                    <div
                      v-if="token.type === 'color'"
                      class="w-8 h-8 rounded border-2"
                      :style="{ backgroundColor: token.value, borderColor: isDarkMode ? '#374151' : '#e5e7eb' }"
                    ></div>
                  </div>
                  <div class="text-xs font-mono mt-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ token.value }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Live Preview -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-base text-indigo-600">preview</span>
                Live Preview
              </h3>
              <div class="space-y-6">
                <!-- Typography Preview -->
                <div>
                  <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Typography
                  </h4>
                  <div class="space-y-2">
                    <div 
                      v-for="size in ['h1', 'h2', 'h3', 'body', 'caption']"
                      :key="size"
                      :style="getTypographyStyle(size)"
                      class="p-4 rounded-lg border"
                      :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'"
                    >
                      {{ size === 'h1' ? 'Heading 1' : size === 'h2' ? 'Heading 2' : size === 'h3' ? 'Heading 3' : size === 'body' ? 'Body text example' : 'Caption text' }}
                    </div>
                  </div>
                </div>

                <!-- Color Preview -->
                <div>
                  <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Colors
                  </h4>
                  <div class="grid grid-cols-4 gap-3">
                    <div
                      v-for="colorToken in colorTokens"
                      :key="colorToken.name"
                      class="aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2"
                      :style="{ backgroundColor: colorToken.value, borderColor: isDarkMode ? '#374151' : '#e5e7eb' }"
                    >
                      <span class="text-xs font-medium" :style="{ color: getContrastColor(colorToken.value) }">
                        {{ colorToken.name.split('.').pop() }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Spacing Preview -->
                <div>
                  <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Spacing
                  </h4>
                  <div class="space-y-2">
                    <div
                      v-for="spacingToken in spacingTokens"
                      :key="spacingToken.name"
                      class="flex items-center gap-4"
                    >
                      <div class="text-xs font-mono w-24" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ spacingToken.name }}
                      </div>
                      <div 
                        class="h-8 rounded"
                        :style="{ width: spacingToken.value, backgroundColor: isDarkMode ? '#4f46e5' : '#6366f1' }"
                      ></div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ spacingToken.value }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Component Preview -->
                <div>
                  <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Component Preview
                  </h4>
                  <div 
                    class="p-6 rounded-lg border"
                    :style="getComponentStyle()"
                  >
                    <h3 class="text-xl font-bold mb-2">Card Title</h3>
                    <p class="text-sm mb-4">This is a preview card using your selected tokens.</p>
                    <button 
                      class="px-4 py-2 rounded-lg font-medium"
                      :style="getButtonStyle()"
                    >
                      Action Button
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Export Options -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-base text-indigo-600">download</span>
                Export Token Combination
              </h3>
              <div class="flex flex-wrap gap-3">
                <button
                  @click="exportCSS"
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'"
                >
                  Export CSS Variables
                </button>
                <button
                  @click="exportJSON"
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'"
                >
                  Export JSON
                </button>
                <button
                  @click="exportSCSS"
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'"
                >
                  Export SCSS
                </button>
                <button
                  @click="copyToClipboard"
                  class="px-4 py-2 rounded-lg font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'"
                >
                  Copy to Clipboard
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

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const selectedCategory = ref('');
const tokenSearch = ref('');
const selectedTokens = ref([]);

const tokenCategories = ['colors', 'typography', 'spacing', 'shadows', 'borders', 'opacity'];

// Mock token data - in production, this would come from an API
const allTokens = ref([
  // Colors
  { name: 'color.primary', value: '#4f46e5', type: 'color', category: 'colors' },
  { name: 'color.secondary', value: '#6366f1', type: 'color', category: 'colors' },
  { name: 'color.success', value: '#10b981', type: 'color', category: 'colors' },
  { name: 'color.error', value: '#ef4444', type: 'color', category: 'colors' },
  { name: 'color.warning', value: '#f59e0b', type: 'color', category: 'colors' },
  { name: 'color.info', value: '#3b82f6', type: 'color', category: 'colors' },
  { name: 'color.text.primary', value: '#111827', type: 'color', category: 'colors' },
  { name: 'color.text.secondary', value: '#6b7280', type: 'color', category: 'colors' },
  { name: 'color.background', value: '#ffffff', type: 'color', category: 'colors' },
  { name: 'color.surface', value: '#f9fafb', type: 'color', category: 'colors' },
  
  // Typography
  { name: 'typography.fontFamily.primary', value: 'Inter, sans-serif', type: 'fontFamily', category: 'typography' },
  { name: 'typography.fontSize.h1', value: '2.5rem', type: 'fontSize', category: 'typography' },
  { name: 'typography.fontSize.h2', value: '2rem', type: 'fontSize', category: 'typography' },
  { name: 'typography.fontSize.h3', value: '1.5rem', type: 'fontSize', category: 'typography' },
  { name: 'typography.fontSize.body', value: '1rem', type: 'fontSize', category: 'typography' },
  { name: 'typography.fontSize.caption', value: '0.875rem', type: 'fontSize', category: 'typography' },
  { name: 'typography.fontWeight.bold', value: '700', type: 'fontWeight', category: 'typography' },
  { name: 'typography.fontWeight.medium', value: '500', type: 'fontWeight', category: 'typography' },
  { name: 'typography.fontWeight.normal', value: '400', type: 'fontWeight', category: 'typography' },
  { name: 'typography.lineHeight.tight', value: '1.25', type: 'lineHeight', category: 'typography' },
  { name: 'typography.lineHeight.normal', value: '1.5', type: 'lineHeight', category: 'typography' },
  
  // Spacing
  { name: 'spacing.xs', value: '0.25rem', type: 'dimension', category: 'spacing' },
  { name: 'spacing.sm', value: '0.5rem', type: 'dimension', category: 'spacing' },
  { name: 'spacing.md', value: '1rem', type: 'dimension', category: 'spacing' },
  { name: 'spacing.lg', value: '1.5rem', type: 'dimension', category: 'spacing' },
  { name: 'spacing.xl', value: '2rem', type: 'dimension', category: 'spacing' },
  { name: 'spacing.2xl', value: '3rem', type: 'dimension', category: 'spacing' },
  
  // Shadows
  { name: 'shadow.sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', type: 'shadow', category: 'shadows' },
  { name: 'shadow.md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', type: 'shadow', category: 'shadows' },
  { name: 'shadow.lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', type: 'shadow', category: 'shadows' },
  
  // Borders
  { name: 'border.width.thin', value: '1px', type: 'dimension', category: 'borders' },
  { name: 'border.width.medium', value: '2px', type: 'dimension', category: 'borders' },
  { name: 'border.radius.sm', value: '0.25rem', type: 'dimension', category: 'borders' },
  { name: 'border.radius.md', value: '0.5rem', type: 'dimension', category: 'borders' },
  { name: 'border.radius.lg', value: '0.75rem', type: 'dimension', category: 'borders' },
]);

const filteredTokens = computed(() => {
  let result = allTokens.value;

  if (selectedCategory.value) {
    result = result.filter(t => t.category === selectedCategory.value);
  }

  if (tokenSearch.value.trim()) {
    const query = tokenSearch.value.toLowerCase();
    result = result.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.value.toLowerCase().includes(query)
    );
  }

  return result;
});

const colorTokens = computed(() => {
  return selectedTokens.value.filter(t => t.type === 'color');
});

const spacingTokens = computed(() => {
  return selectedTokens.value.filter(t => t.category === 'spacing');
});

const isTokenSelected = (tokenName) => {
  return selectedTokens.value.some(t => t.name === tokenName);
};

const toggleToken = (token) => {
  const index = selectedTokens.value.findIndex(t => t.name === token.name);
  if (index > -1) {
    selectedTokens.value.splice(index, 1);
  } else {
    selectedTokens.value.push(token);
  }
};

const removeToken = (tokenName) => {
  const index = selectedTokens.value.findIndex(t => t.name === tokenName);
  if (index > -1) {
    selectedTokens.value.splice(index, 1);
  }
};

const getTokenValue = (tokenName) => {
  const token = selectedTokens.value.find(t => t.name === tokenName);
  return token ? token.value : null;
};

const getTypographyStyle = (size) => {
  const fontSize = getTokenValue(`typography.fontSize.${size}`) || (size === 'h1' ? '2.5rem' : size === 'h2' ? '2rem' : size === 'h3' ? '1.5rem' : size === 'body' ? '1rem' : '0.875rem');
  const fontFamily = getTokenValue('typography.fontFamily.primary') || 'Inter, sans-serif';
  const fontWeight = size === 'h1' || size === 'h2' || size === 'h3' 
    ? (getTokenValue('typography.fontWeight.bold') || '700')
    : (getTokenValue('typography.fontWeight.normal') || '400');
  const lineHeight = getTokenValue('typography.lineHeight.normal') || '1.5';
  const color = getTokenValue('color.text.primary') || (isDarkMode.value ? '#f3f4f6' : '#111827');
  
  return {
    fontSize,
    fontFamily,
    fontWeight,
    lineHeight,
    color
  };
};

const getComponentStyle = () => {
  const backgroundColor = getTokenValue('color.surface') || (isDarkMode.value ? '#1e293b' : '#f9fafb');
  const padding = getTokenValue('spacing.lg') || '1.5rem';
  const borderRadius = getTokenValue('border.radius.md') || '0.5rem';
  const borderWidth = getTokenValue('border.width.thin') || '1px';
  const borderColor = isDarkMode.value ? '#374151' : '#e5e7eb';
  const shadow = getTokenValue('shadow.md') || '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
  
  return {
    backgroundColor,
    padding,
    borderRadius,
    border: `${borderWidth} solid ${borderColor}`,
    boxShadow: shadow
  };
};

const getButtonStyle = () => {
  const backgroundColor = getTokenValue('color.primary') || '#4f46e5';
  const color = '#ffffff';
  const padding = `${getTokenValue('spacing.sm') || '0.5rem'} ${getTokenValue('spacing.md') || '1rem'}`;
  const borderRadius = getTokenValue('border.radius.md') || '0.5rem';
  
  return {
    backgroundColor,
    color,
    padding,
    borderRadius,
    border: 'none',
    cursor: 'pointer'
  };
};

const getContrastColor = (hexColor) => {
  // Simple contrast calculation - return white or black based on luminance
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

const exportCSS = () => {
  const css = selectedTokens.value.map(token => {
    const varName = `--${token.name.replace(/\./g, '-')}`;
    return `  ${varName}: ${token.value};`;
  }).join('\n');
  
  const fullCSS = `:root {\n${css}\n}`;
  downloadFile(fullCSS, 'tokens.css', 'text/css');
};

const exportJSON = () => {
  const json = JSON.stringify(
    selectedTokens.value.reduce((acc, token) => {
      acc[token.name] = token.value;
      return acc;
    }, {}),
    null,
    2
  );
  downloadFile(json, 'tokens.json', 'application/json');
};

const exportSCSS = () => {
  const scss = selectedTokens.value.map(token => {
    const varName = `$${token.name.replace(/\./g, '-')}`;
    return `${varName}: ${token.value};`;
  }).join('\n');
  
  downloadFile(scss, 'tokens.scss', 'text/scss');
};

const copyToClipboard = async () => {
  const css = selectedTokens.value.map(token => {
    const varName = `--${token.name.replace(/\./g, '-')}`;
    return `  ${varName}: ${token.value};`;
  }).join('\n');
  
  const fullCSS = `:root {\n${css}\n}`;
  try {
    await navigator.clipboard.writeText(fullCSS);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

