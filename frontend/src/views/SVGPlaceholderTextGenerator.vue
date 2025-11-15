<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex transition-colors duration-300">
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
            <div class="hero-section rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden transition-all duration-300">
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <div class="flex items-center gap-4 mb-4">
                    <h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
                      SVG Placeholder Text Generator
                    </h1>
                  </div>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-4">
                    Generate placeholder SVG text for your designs. Create customizable text placeholders with alignment, spacing, and styling options.
                  </p>
                  <div class="flex items-center gap-4 text-sm text-white/70">
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">image</span>
                      SVG Generator
                    </span>
                    <span class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-base">update</span>
                      Updated {{ new Date().toLocaleDateString() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Tool Section -->
          <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Control Panel -->
              <div class="lg:col-span-1">
                <div 
                  class="control-panel rounded-2xl shadow-lg p-6 transition-colors duration-300"
                  :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
                >
                  <h2 
                    class="text-xl font-bold mb-6 transition-colors duration-300"
                    :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                  >
                    Take more control...
                  </h2>

                  <!-- Alignment -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300 transition-colors duration-300">Align</label>
                    <div class="flex gap-2">
                      <button
                        @click="alignment = 'left'"
                        class="w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center"
                        :class="alignment === 'left' 
                          ? 'border-indigo-600 bg-indigo-600 text-white' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'"
                      >
                        <span class="material-symbols-outlined text-lg">format_align_left</span>
                      </button>
                      <button
                        @click="alignment = 'center'"
                        class="w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center"
                        :class="alignment === 'center' 
                          ? 'border-indigo-600 bg-indigo-600 text-white' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'"
                      >
                        <span class="material-symbols-outlined text-lg">format_align_center</span>
                      </button>
                      <button
                        @click="alignment = 'right'"
                        class="w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center"
                        :class="alignment === 'right' 
                          ? 'border-indigo-600 bg-indigo-600 text-white' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'"
                      >
                        <span class="material-symbols-outlined text-lg">format_align_right</span>
                      </button>
                    </div>
                  </div>

                  <!-- Radius Slider -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Radius: {{ radius }}px
                    </label>
                    <input
                      type="range"
                      v-model.number="radius"
                      min="0"
                      max="20"
                      class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-colors duration-300"
                    />
                  </div>

                  <!-- Words Slider -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Words: {{ words }}
                    </label>
                    <input
                      type="range"
                      v-model.number="words"
                      min="1"
                      max="20"
                      class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-colors duration-300"
                    />
                  </div>

                  <!-- Lines Slider -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Lines: {{ lines }}
                    </label>
                    <input
                      type="range"
                      v-model.number="lines"
                      min="1"
                      max="10"
                      class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-colors duration-300"
                    />
                  </div>

                  <!-- Height Slider -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Height: {{ height }}px
                    </label>
                    <input
                      type="range"
                      v-model.number="height"
                      min="8"
                      max="40"
                      class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-colors duration-300"
                    />
                  </div>

                  <!-- Spacing Slider -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Spacing: {{ spacing }}px
                    </label>
                    <input
                      type="range"
                      v-model.number="spacing"
                      min="4"
                      max="32"
                      class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-colors duration-300"
                    />
                  </div>

                  <!-- Colors -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">Colors</label>
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 cursor-pointer transition-colors duration-300"
                        :style="{ backgroundColor: color }"
                        @click="showColorPicker = !showColorPicker"
                      ></div>
                      <input
                        v-if="showColorPicker"
                        type="color"
                        v-model="color"
                        class="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 cursor-pointer transition-colors duration-300"
                      />
                      <button
                        @click="showColorPicker = !showColorPicker"
                        class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
                      >
                        <span class="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-3">
                    <button
                      @click="refresh"
                      class="flex-1 px-4 py-2 rounded-full border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <span class="material-symbols-outlined text-lg">refresh</span>
                      Refresh
                    </button>
                    <button
                      @click="downloadSVG"
                      class="flex-1 px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span class="material-symbols-outlined text-lg">download</span>
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <!-- Preview Area -->
              <div class="lg:col-span-2">
                <div 
                  class="preview-area rounded-2xl shadow-lg p-6 transition-colors duration-300"
                  :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
                >
                  <div 
                    class="relative border-2 border-dashed rounded-xl p-8 min-h-[500px] transition-colors duration-300"
                    :class="isDarkMode 
                      ? 'border-indigo-600 bg-slate-900' 
                      : 'border-indigo-300 bg-gray-50'"
                  >
                    <button
                      @click="copySVG"
                      class="absolute top-4 right-4 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-300 flex items-center justify-center"
                      title="Copy SVG"
                    >
                      <span class="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                    
                    <div
                      class="w-full h-full"
                      :style="{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
                        alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
                        gap: spacing + 'px'
                      }"
                      v-html="svgContent"
                    ></div>
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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const alignment = ref('left');
const radius = ref(8);
const words = ref(8);
const lines = ref(3);
const height = ref(16);
const spacing = ref(8);
const color = ref('#9ca3af');
const showColorPicker = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Generate random word widths (simulating text)
const generateWordWidths = (numWords) => {
  const widths = [];
  for (let i = 0; i < numWords; i++) {
    // Random width between 30 and 100 pixels to simulate word lengths
    // Add some variation to make words more realistic
    widths.push(Math.random() * 70 + 30);
  }
  return widths;
};

// Store word widths to maintain consistency
const wordWidthsCache = ref([]);

// Generate SVG content
const svgContent = computed(() => {
  if (wordWidthsCache.value.length === 0) {
    wordWidthsCache.value = generateWordWidths(words.value * lines.value);
  }
  
  const svgLines = [];
  const maxLineWidth = 600; // Maximum width for a line
  const wordSpacing = 8; // Space between words
  let wordIndex = 0;
  
  for (let lineIndex = 0; lineIndex < lines.value; lineIndex++) {
    const lineWords = [];
    let currentLineWidth = 0;
    
    // Calculate target line width - vary it for each line to ensure different lengths
    // First line: 70-90% of max, second: 50-70%, third: 80-100%, etc.
    const lineWidthVariation = [0.7, 0.5, 0.8, 0.6, 0.9, 0.65, 0.75, 0.55, 0.85, 0.6];
    const targetLineWidth = maxLineWidth * (lineWidthVariation[lineIndex % lineWidthVariation.length] + Math.random() * 0.2);
    
    // Add words until we approach the target width (with some randomness)
    while (wordIndex < wordWidthsCache.value.length && currentLineWidth < targetLineWidth) {
      const wordWidth = wordWidthsCache.value[wordIndex];
      const wouldExceedMax = currentLineWidth + wordWidth + wordSpacing > maxLineWidth;
      
      // Stop if we'd exceed max width, or if we've reached a reasonable length
      if (wouldExceedMax && lineWords.length > 0) {
        break;
      }
      
      // Sometimes stop early to create shorter lines (30% chance after minimum 2 words)
      if (lineWords.length >= 2 && currentLineWidth >= targetLineWidth * 0.6 && Math.random() < 0.3) {
        break;
      }
      
      lineWords.push(wordWidth);
      currentLineWidth += wordWidth + wordSpacing;
      wordIndex++;
    }
    
    // Ensure each line has at least one word
    if (lineWords.length === 0 && wordIndex < wordWidthsCache.value.length) {
      lineWords.push(wordWidthsCache.value[wordIndex]);
      wordIndex++;
    }
    
    // Create HTML for this line
    let lineHTML = '<div style="display: flex; gap: 8px; align-items: center;">';
    lineWords.forEach((width) => {
      lineHTML += `<div style="width: ${width}px; height: ${height.value}px; background-color: ${color.value}; border-radius: ${radius.value}px;"></div>`;
    });
    lineHTML += '</div>';
    
    svgLines.push(lineHTML);
  }
  
  return svgLines.join('');
});

// Generate SVG as downloadable string
const generateSVGString = () => {
  // Use cached word widths or generate new ones
  const wordWidths = wordWidthsCache.value.length > 0 
    ? wordWidthsCache.value 
    : generateWordWidths(words.value * lines.value);
  
  const svgWidth = 800;
  const svgHeight = lines.value * (height.value + spacing.value) + spacing.value;
  
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
  
  let currentY = spacing.value;
  const maxLineWidth = svgWidth - 40;
  const wordSpacing = 8;
  let wordIndex = 0;
  
  for (let lineIndex = 0; lineIndex < lines.value; lineIndex++) {
    const lineWords = [];
    let currentLineWidth = 0;
    
    // Calculate target line width - vary it for each line to ensure different lengths
    const lineWidthVariation = [0.7, 0.5, 0.8, 0.6, 0.9, 0.65, 0.75, 0.55, 0.85, 0.6];
    const targetLineWidth = maxLineWidth * (lineWidthVariation[lineIndex % lineWidthVariation.length] + Math.random() * 0.2);
    
    // Add words until we approach the target width (with some randomness)
    while (wordIndex < wordWidths.length && currentLineWidth < targetLineWidth) {
      const wordWidth = wordWidths[wordIndex];
      const wouldExceedMax = currentLineWidth + wordWidth + wordSpacing > maxLineWidth;
      
      // Stop if we'd exceed max width, or if we've reached a reasonable length
      if (wouldExceedMax && lineWords.length > 0) {
        break;
      }
      
      // Sometimes stop early to create shorter lines (30% chance after minimum 2 words)
      if (lineWords.length >= 2 && currentLineWidth >= targetLineWidth * 0.6 && Math.random() < 0.3) {
        break;
      }
      
      lineWords.push(wordWidth);
      currentLineWidth += wordWidth + wordSpacing;
      wordIndex++;
    }
    
    // Ensure each line has at least one word
    if (lineWords.length === 0 && wordIndex < wordWidths.length) {
      lineWords.push(wordWidths[wordIndex]);
      wordIndex++;
    }
    
    const totalLineWidth = lineWords.reduce((sum, w) => sum + w, 0) + (lineWords.length - 1) * wordSpacing;
    
    let currentX = alignment.value === 'center' 
      ? (svgWidth - totalLineWidth) / 2
      : alignment.value === 'right'
      ? svgWidth - totalLineWidth - 20
      : 20;
    
    lineWords.forEach((width) => {
      svg += `<rect x="${currentX}" y="${currentY}" width="${width}" height="${height.value}" fill="${color.value}" rx="${radius.value}" ry="${radius.value}"/>`;
      currentX += width + wordSpacing;
    });
    
    currentY += height.value + spacing.value;
  }
  
  svg += '</svg>';
  return svg;
};

const refresh = () => {
  // Generate new random word widths
  wordWidthsCache.value = generateWordWidths(words.value * lines.value);
};

const copySVG = async () => {
  const svgString = generateSVGString();
  try {
    await navigator.clipboard.writeText(svgString);
    // Could add a toast notification here
    alert('SVG copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};

const downloadSVG = () => {
  const svgString = generateSVGString();
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'placeholder-text.svg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

let darkModeObserver = null;
let darkModeInterval = null;

// Watch for changes to words or lines value and regenerate
watch([words, lines], () => {
  wordWidthsCache.value = generateWordWidths(words.value * lines.value);
});

// Watch for dark mode changes and force update
watch(isDarkMode, () => {
  // Force a reactive update when dark mode changes
  // This ensures all computed properties and styles update immediately
  nextTick(() => {
    // Trigger any necessary re-renders
  });
});

onMounted(() => {
  // Initialize word widths
  wordWidthsCache.value = generateWordWidths(words.value * lines.value);
  
  // Improved dark mode detection with immediate callback
  const updateDarkMode = () => {
    const wasDark = isDarkMode.value;
    isDarkMode.value = document.documentElement.classList.contains('dark');
    // Force update if state changed
    if (wasDark !== isDarkMode.value) {
      // Trigger reactivity
      nextTick(() => {});
    }
  };
  
  darkModeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        updateDarkMode();
      }
    });
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
    attributeOldValue: true
  });
  
  // Initial check
  updateDarkMode();
  
  // Fallback interval check (less frequent)
  darkModeInterval = setInterval(updateDarkMode, 50);
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
/* Force transitions on all background color changes - use attribute selectors to catch both light and dark classes */
[class*="bg-white"][class*="dark:bg-slate-800"],
[class*="bg-gray-50"][class*="dark:bg-slate-900"] {
  transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* More specific targeting for the card elements */
.control-panel,
.preview-area {
  transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Target nested divs with background colors */
.control-panel > div[class*="bg-"],
.preview-area > div[class*="bg-"] {
  transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Universal rule for all elements in these containers */
.control-panel *,
.preview-area * {
  transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
}
</style>

<style scoped>
/* Ensure smooth transitions for key elements */
.control-panel,
.preview-area,
.hero-section {
  transition-property: background-color, border-color, color !important;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
  transition-duration: 300ms !important;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  border: none;
}
</style>

