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
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="themeBuilderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Palette representation -->
                    <circle cx="50" cy="50" r="25" fill="url(#themeBuilderGradient)" opacity="0.6"/>
                    <circle cx="150" cy="50" r="25" fill="url(#themeBuilderGradient)" opacity="0.5"/>
                    <circle cx="50" cy="150" r="25" fill="url(#themeBuilderGradient)" opacity="0.4"/>
                    <circle cx="150" cy="150" r="25" fill="url(#themeBuilderGradient)" opacity="0.5"/>
                    <!-- Typography representation -->
                    <rect x="80" y="80" width="40" height="8" rx="2" fill="white" opacity="0.7"/>
                    <rect x="80" y="95" width="30" height="6" rx="1" fill="white" opacity="0.6"/>
                    <rect x="80" y="105" width="35" height="6" rx="1" fill="white" opacity="0.6"/>
                  </svg>
                </div>
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
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">palette</span>
                Colors
              </h3>
              <div class="space-y-3">
                <div v-for="color in themeColors" :key="color.name" class="relative">
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ color.label }}
                  </label>
                  <div class="flex items-center gap-2">
                    <button
                      @click="openColorPicker(color.name, $event)"
                      class="w-12 h-10 rounded border-2 cursor-pointer transition-colors flex-shrink-0"
                      :class="isDarkMode 
                        ? 'border-gray-600 hover:border-indigo-400' 
                        : 'border-gray-300 hover:border-indigo-500'"
                      :style="{ backgroundColor: color.value }"
                      :title="`Pick ${color.label.toLowerCase()} color`"
                    ></button>
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
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">text_fields</span>
                Typography
              </h3>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Font Family
                  </label>
                  <FontFamilyDropdown v-model="typography.fontFamily" />
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
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">space_bar</span>
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
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">preview</span>
                  Live Preview
                </h3>
                <button
                  @click="previewDarkMode = !previewDarkMode"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  :class="previewDarkMode
                    ? (isDarkMode 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-indigo-600 text-white')
                    : (isDarkMode 
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  <span class="material-symbols-outlined text-base">{{ previewDarkMode ? 'dark_mode' : 'light_mode' }}</span>
                  {{ previewDarkMode ? 'Dark' : 'Light' }}
                </button>
              </div>
              <div 
                class="rounded-lg p-8"
                :class="previewDarkMode ? 'dark' : ''"
                :style="getPreviewStyle()"
              >
                <h2 :style="{ fontFamily: typography.fontFamily, fontSize: `${typography.baseSize * 1.5}px`, color: previewDarkMode ? '#f1f5f9' : themeColors.find(c => c.name === 'text').value }">
                  Heading Example
                </h2>
                <p :style="{ fontFamily: typography.fontFamily, fontSize: `${typography.baseSize}px`, color: previewDarkMode ? '#f1f5f9' : themeColors.find(c => c.name === 'text').value, marginTop: `${spacingScale.find(s => s.name === 'md').value}px` }">
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
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">code</span>
                  Theme Code
                </h3>
                <CodeFormatDropdown v-model="codeFormat" />
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

    <!-- Color Picker -->
    <ColorPicker
      :show="showColorPicker"
      :initial-color="pickerColor"
      :position="pickerPosition"
      @update:show="showColorPicker = $event"
      @apply="handleColorPickerApply"
      @cancel="showColorPicker = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import ColorPicker from '../components/ColorPicker.vue';
import FontFamilyDropdown from '../components/FontFamilyDropdown.vue';
import CodeFormatDropdown from '../components/CodeFormatDropdown.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const codeFormat = ref('css');
const showColorPicker = ref(false);
const currentColorName = ref(null);
const pickerColor = ref('#000000');
const pickerPosition = ref({ left: 0, top: 0 });
const previewDarkMode = ref(false);

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
  const bgColor = themeColors.value.find(c => c.name === 'background').value;
  const textColor = themeColors.value.find(c => c.name === 'text').value;
  
  // If preview is in dark mode, use darker background and lighter text
  if (previewDarkMode.value) {
    return {
      backgroundColor: '#1e293b', // slate-800
      color: '#f1f5f9' // slate-100
    };
  }
  
  return {
    backgroundColor: bgColor,
    color: textColor
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

const openColorPicker = (colorName, event) => {
  event.stopPropagation();
  currentColorName.value = colorName;
  const color = themeColors.value.find(c => c.name === colorName);
  pickerColor.value = color ? color.value : '#000000';
  
  // Calculate position near the color swatch button
  const rect = event.target.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  const pickerWidth = 280;
  const pickerHeight = 400;
  const padding = 10;
  
  let left = rect.left + scrollLeft + rect.width + padding;
  let top = rect.top + scrollTop;
  
  // Adjust if picker would go off right edge
  if (left + pickerWidth > window.innerWidth + scrollLeft) {
    left = rect.left + scrollLeft - pickerWidth - padding;
  }
  
  // Adjust if picker would go off bottom edge
  if (top + pickerHeight > window.innerHeight + scrollTop) {
    top = window.innerHeight + scrollTop - pickerHeight - padding;
  }
  
  // Ensure picker doesn't go off top edge
  if (top < scrollTop + padding) {
    top = scrollTop + padding;
  }
  
  // Ensure picker doesn't go off left edge
  if (left < scrollLeft + padding) {
    left = scrollLeft + padding;
  }
  
  pickerPosition.value = { left: `${left}px`, top: `${top}px` };
  showColorPicker.value = true;
};

const handleColorPickerApply = (color) => {
  if (currentColorName.value) {
    const colorObj = themeColors.value.find(c => c.name === currentColorName.value);
    if (colorObj) {
      colorObj.value = color;
    }
  }
  showColorPicker.value = false;
  currentColorName.value = null;
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

