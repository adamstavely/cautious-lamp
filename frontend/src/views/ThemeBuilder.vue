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
                  Theme Builder
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Visually customize your design system theme. Adjust colors, typography, spacing, and more in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <!-- Left Column: Theme Controls -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Colors -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Colors
              </h3>
              <div class="space-y-3">
                <div v-for="color in themeColors" :key="color.name">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ color.label }}
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="color.value"
                      type="color"
                      class="w-12 h-10 rounded border"
                      :class="isDarkMode ? 'border-gray-600' : 'border-gray-300'"
                    />
                    <input
                      v-model="color.value"
                      type="text"
                      class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                      :class="isDarkMode 
                        ? 'border-gray-600 bg-slate-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Typography -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Typography
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Font Family
                  </label>
                  <select
                    v-model="typography.fontFamily"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="System">System</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Base Font Size: {{ typography.baseSize }}px
                  </label>
                  <input
                    v-model.number="typography.baseSize"
                    type="range"
                    min="12"
                    max="20"
                    class="w-full accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            <!-- Spacing -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Spacing Scale
              </h3>
              <div class="space-y-2">
                <div v-for="spacing in spacingScale" :key="spacing.name" class="flex items-center justify-between">
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ spacing.name }}</span>
                  <input
                    v-model.number="spacing.value"
                    type="number"
                    class="w-20 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    :class="isDarkMode 
                      ? 'border-gray-600 bg-slate-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'"
                  />
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button
                @click="exportTheme"
                class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
              >
                Export Theme
              </button>
              <button
                @click="resetTheme"
                class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
              >
                Reset
              </button>
            </div>
          </div>

          <!-- Right Column: Live Preview -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Live Preview -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Live Preview
              </h3>
              <div 
                class="rounded-lg p-8"
                :style="getPreviewStyle()"
              >
                <h2 :style="{ fontFamily: typography.fontFamily, fontSize: `${typography.baseSize * 1.5}px`, color: themeColors.find(c => c.name === 'text').value }">
                  Heading Example
                </h2>
                <p :style="{ fontFamily: typography.fontFamily, fontSize: `${typography.baseSize}px`, color: themeColors.find(c => c.name === 'text').value, marginTop: `${spacingScale.find(s => s.name === 'md').value}px` }">
                  This is a paragraph example showing how your theme looks.
                </p>
                <div :style="{ marginTop: `${spacingScale.find(s => s.name === 'lg').value}px` }">
                  <button 
                    class="px-6 py-2 rounded-lg font-medium"
                    :style="{ 
                      backgroundColor: themeColors.find(c => c.name === 'primary').value,
                      color: '#fff',
                      marginRight: `${spacingScale.find(s => s.name === 'sm').value}px`
                    }"
                  >
                    Primary Button
                  </button>
                  <button 
                    class="px-6 py-2 rounded-lg font-medium border-2"
                    :style="{ 
                      borderColor: themeColors.find(c => c.name === 'primary').value,
                      color: themeColors.find(c => c.name === 'primary').value,
                      backgroundColor: 'transparent'
                    }"
                  >
                    Secondary Button
                  </button>
                </div>
              </div>
            </div>

            <!-- Theme Code -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Theme Code
                </h3>
                <select
                  v-model="codeFormat"
                  class="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  :class="isDarkMode 
                    ? 'border-gray-600 bg-slate-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'"
                >
                  <option value="css">CSS</option>
                  <option value="scss">SCSS</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div class="rounded-lg overflow-hidden" :class="isDarkMode ? 'bg-slate-950' : 'bg-gray-900'">
                <div class="p-4 overflow-x-auto">
                  <pre class="text-sm text-green-400 font-mono"><code>{{ getThemeCode() }}</code></pre>
                </div>
                <div class="p-3 border-t flex items-center justify-end gap-2" :class="isDarkMode ? 'border-gray-800' : 'border-gray-800'">
                  <button
                    @click="copyThemeCode"
                    class="px-3 py-1 rounded text-sm font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    Copy
                  </button>
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
const codeFormat = ref('css');

const themeColors = ref([
  { name: 'primary', label: 'Primary', value: '#4f46e5' },
  { name: 'secondary', label: 'Secondary', value: '#6366f1' },
  { name: 'background', label: 'Background', value: '#ffffff' },
  { name: 'surface', label: 'Surface', value: '#f9fafb' },
  { name: 'text', label: 'Text', value: '#111827' }
]);

const typography = ref({
  fontFamily: 'Inter',
  baseSize: 16
});

const spacingScale = ref([
  { name: 'xs', value: 4 },
  { name: 'sm', value: 8 },
  { name: 'md', value: 16 },
  { name: 'lg', value: 24 },
  { name: 'xl', value: 32 }
]);

const getPreviewStyle = () => {
  return {
    backgroundColor: themeColors.value.find(c => c.name === 'background').value,
    color: themeColors.value.find(c => c.name === 'text').value
  };
};

const getThemeCode = () => {
  if (codeFormat.value === 'css') {
    return `:root {
  --color-primary: ${themeColors.value.find(c => c.name === 'primary').value};
  --color-secondary: ${themeColors.value.find(c => c.name === 'secondary').value};
  --color-background: ${themeColors.value.find(c => c.name === 'background').value};
  --color-surface: ${themeColors.value.find(c => c.name === 'surface').value};
  --color-text: ${themeColors.value.find(c => c.name === 'text').value};
  --font-family: ${typography.value.fontFamily};
  --font-size-base: ${typography.value.baseSize}px;
  --spacing-xs: ${spacingScale.value.find(s => s.name === 'xs').value}px;
  --spacing-sm: ${spacingScale.value.find(s => s.name === 'sm').value}px;
  --spacing-md: ${spacingScale.value.find(s => s.name === 'md').value}px;
  --spacing-lg: ${spacingScale.value.find(s => s.name === 'lg').value}px;
  --spacing-xl: ${spacingScale.value.find(s => s.name === 'xl').value}px;
}`;
  } else if (codeFormat.value === 'scss') {
    return `$colors: (
  primary: ${themeColors.value.find(c => c.name === 'primary').value},
  secondary: ${themeColors.value.find(c => c.name === 'secondary').value},
  background: ${themeColors.value.find(c => c.name === 'background').value},
  surface: ${themeColors.value.find(c => c.name === 'surface').value},
  text: ${themeColors.value.find(c => c.name === 'text').value}
);

$typography: (
  font-family: ${typography.value.fontFamily},
  base-size: ${typography.value.baseSize}px
);

$spacing: (
  xs: ${spacingScale.value.find(s => s.name === 'xs').value}px,
  sm: ${spacingScale.value.find(s => s.name === 'sm').value}px,
  md: ${spacingScale.value.find(s => s.name === 'md').value}px,
  lg: ${spacingScale.value.find(s => s.name === 'lg').value}px,
  xl: ${spacingScale.value.find(s => s.name === 'xl').value}px
);`;
  } else {
    return JSON.stringify({
      colors: themeColors.value.reduce((acc, c) => {
        acc[c.name] = c.value;
        return acc;
      }, {}),
      typography: typography.value,
      spacing: spacingScale.value.reduce((acc, s) => {
        acc[s.name] = `${s.value}px`;
        return acc;
      }, {})
    }, null, 2);
  }
};

const copyThemeCode = async () => {
  try {
    await navigator.clipboard.writeText(getThemeCode());
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const exportTheme = () => {
  const extension = codeFormat.value === 'json' ? 'json' : codeFormat.value === 'scss' ? 'scss' : 'css';
  const filename = `theme.${extension}`;
  
  const blob = new Blob([getThemeCode()], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const resetTheme = () => {
  themeColors.value = [
    { name: 'primary', label: 'Primary', value: '#4f46e5' },
    { name: 'secondary', label: 'Secondary', value: '#6366f1' },
    { name: 'background', label: 'Background', value: '#ffffff' },
    { name: 'surface', label: 'Surface', value: '#f9fafb' },
    { name: 'text', label: 'Text', value: '#111827' }
  ];
  typography.value = { fontFamily: 'Inter', baseSize: 16 };
  spacingScale.value = [
    { name: 'xs', value: 4 },
    { name: 'sm', value: 8 },
    { name: 'md', value: 16 },
    { name: 'lg', value: 24 },
    { name: 'xl', value: 32 }
  ];
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

