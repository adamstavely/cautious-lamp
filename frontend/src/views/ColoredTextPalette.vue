<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-y-auto"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8">
        <!-- Back Button -->
        <div class="max-w-7xl mx-auto mb-8">
          <router-link
            to="/tokens/color-palettes"
            class="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            :class="isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'"
          >
            <span class="material-symbols-outlined text-base">arrow_back</span>
            Back to Color Palettes
          </router-link>
        </div>

        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 flex items-center justify-center">
                    <span class="material-symbols-outlined text-white text-5xl">layers</span>
                  </div>
                  <h1 class="text-4xl md:text-5xl font-bold text-white">
                    Neutral Backgrounds
                  </h1>
                </div>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Explore neutral color palettes designed for backgrounds. Instead of using pure black or white, these neutral shades provide subtle, accessible background options that work beautifully in both light and dark themes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Colored Text Palette Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="mb-8">
            <!-- Features Badges -->
            <div class="flex flex-wrap gap-2 mb-6">
              <span 
                class="px-3 py-1.5 rounded-lg text-sm font-medium"
                :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
              >
                Neutral Colors
              </span>
              <span 
                class="px-3 py-1.5 rounded-lg text-sm font-medium"
                :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
              >
                Background Focused
              </span>
              <span 
                class="px-3 py-1.5 rounded-lg text-sm font-medium"
                :class="isDarkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700'"
              >
                WCAG Compliant
              </span>
            </div>

            <!-- Info Box -->
            <div class="p-6 rounded-lg border mb-8" :class="isDarkMode ? 'bg-indigo-900/20 border-indigo-700' : 'bg-indigo-50 border-indigo-200'">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">info</span>
                <div>
                  <h4 class="font-semibold mb-2" :class="isDarkMode ? 'text-indigo-300' : 'text-indigo-900'">
                    Neutral Background Options
                  </h4>
                  <p class="text-sm mb-3" :class="isDarkMode ? 'text-indigo-200' : 'text-indigo-800'">
                    Instead of using pure black (#000000) or pure white (#FFFFFF) for backgrounds, these neutral palettes provide subtle, sophisticated alternatives. Each neutral family offers a range of shades perfect for creating depth and visual hierarchy while maintaining excellent contrast for text and UI elements.
                  </p>
                  <ul class="text-sm space-y-1 list-disc list-inside" :class="isDarkMode ? 'text-indigo-200' : 'text-indigo-800'">
                    <li>Light backgrounds (50-400): Subtle, warm neutrals for light themes</li>
                    <li>Mid-tone backgrounds (500-600): Balanced neutrals for cards and surfaces</li>
                    <li>Dark backgrounds (700-950): Rich, deep neutrals for dark themes</li>
                    <li>All shades maintain WCAG AA contrast requirements for text</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Neutral Background Palette Grid -->
            <div class="mb-12">
              <h3 class="text-2xl font-semibold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Neutral Background Palette
              </h3>
              
              <!-- Search/Filter -->
              <div class="mb-6">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search neutral color families..."
                  class="w-full md:w-96 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  :class="isDarkMode ? 'bg-slate-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'"
                />
              </div>

              <!-- Palette Grid Table -->
              <div class="overflow-x-auto mb-8 rounded-lg border" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-300 bg-white'">
                <table class="w-full border-collapse">
                  <!-- Header Row -->
                  <thead>
                    <tr>
                      <th class="sticky left-0 z-20 p-3 text-left font-semibold border-b-2" :class="isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-400 text-gray-900'">
                        <div class="min-w-[100px]">Color</div>
                      </th>
                      <th 
                        v-for="shade in shadeLevels" 
                        :key="shade"
                        class="p-3 text-center font-semibold border-b-2 min-w-[120px]" 
                        :class="isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-400 text-gray-900'"
                      >
                        <div class="text-base font-bold mb-1">Level {{ shade }}</div>
                        <div class="text-xs mt-1 font-normal opacity-90">Contrast: {{ getContrastForShade(shade) }}</div>
                        <div class="text-xs font-normal opacity-90">Chroma: {{ getChromaForShade(shade) }}</div>
                      </th>
                    </tr>
                  </thead>
                  
                  <!-- Color Family Rows -->
                  <tbody>
                    <tr
                      v-for="(colors, familyName) in filteredColors"
                      :key="familyName"
                      class="border-b transition-colors"
                      :class="isDarkMode ? 'border-gray-700 hover:bg-slate-700/50' : 'border-gray-200 hover:bg-gray-50'"
                    >
                      <!-- Color Family Name -->
                      <td class="sticky left-0 z-10 p-3 font-semibold capitalize border-r-2 whitespace-nowrap" :class="isDarkMode ? 'bg-slate-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'">
                        {{ familyName }}
                      </td>
                      
                      <!-- Color Cells -->
                      <td
                        v-for="shade in shadeLevels"
                        :key="`${familyName}-${shade}`"
                        class="p-3 border-r text-center relative group cursor-pointer min-h-[120px]"
                        :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                        :style="{ backgroundColor: colors[shade] || (isDarkMode ? '#1e293b' : '#f9fafb') }"
                        @click="copyToClipboard(colors[shade], `${familyName}-${shade}`)"
                      >
                        <!-- Contrast Number (Large) -->
                        <div 
                          class="text-3xl font-bold mb-2 leading-none"
                          :style="getTextColorForCell(colors[shade], `${familyName}-${shade}`)"
                        >
                          {{ getContrastForShade(shade) }}
                        </div>
                        
                        <!-- Color Value -->
                        <div 
                          class="text-xs font-mono mb-1"
                          :style="{ ...getTextColorForCell(colors[shade], `${familyName}-${shade}`), opacity: 0.95 }"
                        >
                          {{ hexCache[`${familyName}-${shade}`] || 'OKLCH' }}
                        </div>
                        
                        <!-- Usage Guideline Icon -->
                        <div 
                          class="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm"
                          :style="getUsageIconStyle(colors[shade], shade)"
                        >
                          {{ getUsageGuidelineIcon(shade) }}
                        </div>
                        
                        <!-- Copy Indicator on Hover -->
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded">
                          <span class="material-symbols-outlined text-white drop-shadow-lg text-2xl">content_copy</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Usage Guidelines Legend -->
              <div class="mt-8 p-6 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                <h4 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Usage Guidelines
                </h4>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div 
                    v-for="(guideline, index) in usageGuidelines" 
                    :key="index"
                    class="flex items-center gap-2"
                  >
                    <div 
                      class="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                      :style="{ backgroundColor: guideline.color }"
                      :class="getTextColorForGuideline(guideline.color) === 'white' ? 'text-white' : 'text-black'"
                    >
                      {{ guideline.icon }}
                    </div>
                    <div>
                      <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-200' : 'text-gray-900'">
                        {{ guideline.label }}
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Contrast {{ guideline.contrast }}, {{ guideline.fontSize }}, {{ guideline.lineHeight }}
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { RouterLink } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import { useDrawer } from '../composables/useDrawer.js';
import harmonyPalette from '@evilmartians/harmony/base';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const searchQuery = ref('');
const copiedColor = ref(null);

// Shade levels in Harmony palette
const shadeLevels = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

// Contrast values for each shade (APCA contrast, mirrored around 500)
const contrastValues = {
  '50': 105,
  '100': 100,
  '200': 90,
  '300': 77,
  '400': 65,
  '500': 54,
  '600': 65,
  '700': 77,
  '800': 90,
  '900': 100,
  '950': 105
};

// Chroma values for each shade
const chromaValues = {
  '50': 0.005,
  '100': 0.02,
  '200': 0.04,
  '300': 0.08,
  '400': 0.11,
  '500': 0.15,
  '600': 0.14,
  '700': 0.12,
  '800': 0.09,
  '900': 0.07,
  '950': 0.04
};

// Usage guidelines mapping
const usageGuidelines = [
  { label: 'Any Text', contrast: 105, fontSize: '16px', lineHeight: '24px', icon: 'P1', color: 'oklch(0.98 0.005 0)' },
  { label: 'Any Text', contrast: 100, fontSize: '18px', lineHeight: '28px', icon: 'P2', color: 'oklch(0.95 0.02 0)' },
  { label: 'Any Text', contrast: 90, fontSize: '20px', lineHeight: '32px', icon: 'P3', color: 'oklch(0.90 0.04 0)' },
  { label: 'Body Text', contrast: 77, fontSize: '24px', lineHeight: '36px', icon: 'P4', color: 'oklch(0.80 0.08 0)' },
  { label: 'Content Text', contrast: 65, fontSize: '32px', lineHeight: '40px', icon: 'P5', color: 'oklch(0.65 0.11 0)' },
  { label: 'Headline', contrast: 54, fontSize: '48px', lineHeight: '56px', icon: 'P6', color: 'oklch(0.50 0.15 0)' },
  { label: 'Content Text', contrast: 65, fontSize: '32px', lineHeight: '40px', icon: 'P7', color: 'oklch(0.35 0.14 0)' },
  { label: 'Body Text', contrast: 77, fontSize: '24px', lineHeight: '36px', icon: 'P8', color: 'oklch(0.20 0.12 0)' },
  { label: 'Any Text', contrast: 100, fontSize: '18px', lineHeight: '28px', icon: 'P9', color: 'oklch(0.10 0.07 0)' },
  { label: 'Any Text', contrast: 105, fontSize: '16px', lineHeight: '24px', icon: 'P10', color: 'oklch(0.05 0.04 0)' }
];





// Neutral color families only (for backgrounds)
const neutralColorFamilies = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'sand'];

// Process Harmony colors - only neutrals
const harmonyColors = computed(() => {
  const colors = {};
  
  // Process only neutral color families
  neutralColorFamilies.forEach(colorName => {
    if (harmonyPalette[colorName] && typeof harmonyPalette[colorName] === 'object') {
      colors[colorName] = {};
      // Ensure shades are in correct order
      shadeLevels.forEach(shade => {
        const oklchValue = harmonyPalette[colorName][shade];
        if (typeof oklchValue === 'string' && oklchValue.startsWith('oklch')) {
          colors[colorName][shade] = oklchValue;
        }
      });
    }
  });
  
  return colors;
});

// Filter colors based on search query
const filteredColors = computed(() => {
  if (!searchQuery.value.trim()) {
    return harmonyColors.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  const filtered = {};
  
  Object.keys(harmonyColors.value).forEach(familyName => {
    if (familyName.toLowerCase().includes(query)) {
      filtered[familyName] = harmonyColors.value[familyName];
    } else {
      // Check if any shade matches
      const shades = Object.keys(harmonyColors.value[familyName]);
      if (shades.some(shade => shade.includes(query))) {
        filtered[familyName] = harmonyColors.value[familyName];
      }
    }
  });
  
  return filtered;
});

// Store computed hex values
const hexCache = ref({});

// Store computed text colors for each color/shade combination
const textColorCache = ref({});

// Convert OKLCH to hex for display (using computed style)
const computeHexFromOklch = (oklchValue, cacheKey) => {
  if (hexCache.value[cacheKey]) {
    return;
  }
  
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    try {
      const tempEl = document.createElement('div');
      tempEl.style.backgroundColor = oklchValue;
      tempEl.style.position = 'absolute';
      tempEl.style.visibility = 'hidden';
      tempEl.style.width = '1px';
      tempEl.style.height = '1px';
      document.body.appendChild(tempEl);
      
      const computedColor = window.getComputedStyle(tempEl).backgroundColor;
      document.body.removeChild(tempEl);
      
      // Extract RGB from computed color (format: rgb(r, g, b) or rgba(r, g, b, a))
      const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        const hex = '#' + [r, g, b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('').toUpperCase();
        hexCache.value[cacheKey] = hex;
      }
    } catch (error) {
      console.error('Error converting OKLCH:', error);
    }
  });
};

// Get contrast value for shade
const getContrastForShade = (shade) => {
  return contrastValues[shade] || '';
};

// Get chroma value for shade
const getChromaForShade = (shade) => {
  return chromaValues[shade] || '';
};

// Get usage guideline icon for shade
const getUsageGuidelineIcon = (shade) => {
  const mapping = {
    '50': 'P1',
    '100': 'P2',
    '200': 'P3',
    '300': 'P4',
    '400': 'P5',
    '500': 'P6',
    '600': 'P7',
    '700': 'P8',
    '800': 'P9',
    '900': 'P10',
    '950': 'P10'
  };
  return mapping[shade] || '';
};

// Calculate relative luminance (WCAG standard)
const calculateLuminance = (r, g, b) => {
  const [rNorm, gNorm, bNorm] = [r / 255, g / 255, b / 255].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
};

// Get text color for cell (white or black based on background with WCAG compliance)
const getTextColorForCell = (oklchValue, cacheKey) => {
  if (!oklchValue) return { color: 'transparent' };
  
  // Check cache first
  if (cacheKey && textColorCache.value[cacheKey]) {
    return textColorCache.value[cacheKey];
  }
  
  // If not in cache yet, return a default and it will be computed
  // For dark shades (600-950), default to white; for light shades (50-500), default to black
  if (cacheKey) {
    const shade = cacheKey.split('-').pop();
    const shadeNum = parseInt(shade);
    const defaultColor = shadeNum >= 600 ? { color: '#ffffff' } : { color: '#000000' };
    textColorCache.value[cacheKey] = defaultColor;
    return defaultColor;
  }
  
  return { color: '#000000' };
};

// Get usage icon style
const getUsageIconStyle = (oklchValue, shade) => {
  if (!oklchValue) {
    return {
      backgroundColor: isDarkMode.value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      color: isDarkMode.value ? '#ffffff' : '#000000'
    };
  }
  
  try {
    // Create temporary element to get computed RGB
    const tempEl = document.createElement('div');
    tempEl.style.backgroundColor = oklchValue;
    tempEl.style.position = 'absolute';
    tempEl.style.visibility = 'hidden';
    tempEl.style.width = '1px';
    tempEl.style.height = '1px';
    document.body.appendChild(tempEl);
    
    const computedColor = window.getComputedStyle(tempEl).backgroundColor;
    document.body.removeChild(tempEl);
    
    const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      
      const bgLuminance = calculateLuminance(r, g, b);
      
      // Use white text on dark backgrounds, black on light
      if (bgLuminance < 0.5) {
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        };
      } else {
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          color: '#000000',
          border: '1px solid rgba(0, 0, 0, 0.3)'
        };
      }
    }
  } catch (error) {
    console.error('Error calculating icon style:', error);
  }
  
  return {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    color: '#000000'
  };
};

// Get text color for guideline
const getTextColorForGuideline = (backgroundColor) => {
  try {
    const tempEl = document.createElement('div');
    tempEl.style.backgroundColor = backgroundColor;
    tempEl.style.position = 'absolute';
    tempEl.style.visibility = 'hidden';
    tempEl.style.width = '1px';
    tempEl.style.height = '1px';
    document.body.appendChild(tempEl);
    
    const computedColor = window.getComputedStyle(tempEl).backgroundColor;
    document.body.removeChild(tempEl);
    
    const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      
      const luminance = calculateLuminance(r, g, b);
      
      // Use white text on dark backgrounds, black on light
      return luminance < 0.5 ? 'white' : 'black';
    }
  } catch (error) {
    console.error('Error calculating guideline text color:', error);
  }
  
  return 'black';
};

// Copy to clipboard
const copyToClipboard = async (value, colorName) => {
  if (!value) return;
  
  try {
    await navigator.clipboard.writeText(value);
    copiedColor.value = colorName;
    
    // Show feedback
    setTimeout(() => {
      copiedColor.value = null;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

// Compute text colors for all cells
const computeAllTextColors = () => {
  // Use nextTick to ensure DOM is ready
  setTimeout(() => {
    Object.keys(harmonyColors.value).forEach(familyName => {
      shadeLevels.forEach(shade => {
        const oklchValue = harmonyColors.value[familyName][shade];
        if (!oklchValue) return;
        
        const cacheKey = `${familyName}-${shade}`;
        
        // Skip if already cached
        if (textColorCache.value[cacheKey]) return;
        
        try {
          // Create temporary element to get computed RGB
          const tempEl = document.createElement('div');
          tempEl.style.backgroundColor = oklchValue;
          tempEl.style.position = 'absolute';
          tempEl.style.visibility = 'hidden';
          tempEl.style.width = '1px';
          tempEl.style.height = '1px';
          document.body.appendChild(tempEl);
          
          const computedColor = window.getComputedStyle(tempEl).backgroundColor;
          document.body.removeChild(tempEl);
          
          const rgbMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            
            const bgLuminance = calculateLuminance(r, g, b);
            const textColor = bgLuminance < 0.5 ? '#ffffff' : '#000000';
            
            textColorCache.value[cacheKey] = { color: textColor };
          }
        } catch (error) {
          console.error(`Error computing text color for ${cacheKey}:`, error);
          textColorCache.value[cacheKey] = { color: '#000000' };
        }
      });
    });
  }, 100);
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  // Compute hex values for all colors
  Object.keys(harmonyColors.value).forEach(familyName => {
    Object.keys(harmonyColors.value[familyName]).forEach(shade => {
      const oklchValue = harmonyColors.value[familyName][shade];
      const cacheKey = `${familyName}-${shade}`;
      computeHexFromOklch(oklchValue, cacheKey);
    });
  });
  
  // Compute text colors for all cells
  computeAllTextColors();
  
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

