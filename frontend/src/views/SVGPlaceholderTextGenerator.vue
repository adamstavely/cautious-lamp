<template>
  <div class="w-full h-full bg-[#fff] dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative flex">
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
        <div class="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
          <!-- Hero -->
          <section class="grid md:grid-cols-[1fr_auto] items-center gap-10 pb-12 mb-12 border-b border-slate-200 dark:border-slate-800">
            <div>
              <router-link to="/tools" class="inline-flex items-center gap-1 text-sm font-medium tracking-wide text-[#2f5ea8] dark:text-[#9dbcf0] mb-4 hover:underline underline-offset-4">
                <span class="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
                Tools
              </router-link>
              <h1 class="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] mb-5">SVG placeholder text</h1>
              <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Generate placeholder SVG text for your designs, with control over alignment, spacing,
                size and color.
              </p>
            </div>
            <div class="spot hidden md:block w-48 h-48 lg:w-56 lg:h-56" aria-hidden="true" v-html="spot('guidelines/text-graphics')"></div>
          </section>

          <!-- Main Tool Section -->
          <div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Control Panel -->
              <div class="lg:col-span-1">
                <div class="control-panel panel">
                  <h2 class="text-lg font-semibold tracking-tight mb-6">
                    Take more control...
                  </h2>

                  <!-- Alignment -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-3 text-slate-600 dark:text-slate-400">Align</label>
                    <div class="flex gap-2">
                      <button
                        @click="alignment = 'left'"
                        class="seg"
                        :class="{ on: alignment === 'left' }"
                        aria-label="Align left"
                      >
                        <span class="material-symbols-outlined text-lg">format_align_left</span>
                      </button>
                      <button
                        @click="alignment = 'center'"
                        class="seg"
                        :class="{ on: alignment === 'center' }"
                        aria-label="Align center"
                      >
                        <span class="material-symbols-outlined text-lg">format_align_center</span>
                      </button>
                      <button
                        @click="alignment = 'right'"
                        class="seg"
                        :class="{ on: alignment === 'right' }"
                        aria-label="Align right"
                      >
                        <span class="material-symbols-outlined text-lg">format_align_right</span>
                      </button>
                    </div>
                  </div>

                  <!-- Radius Slider -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                      Radius: {{ radius }}px
                    </label>
                    <input
                      type="range"
                      v-model.number="radius"
                      min="0"
                      max="20"
                      class="range"
                    />
                  </div>

                  <!-- Words Slider -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                      Words: {{ words }}
                    </label>
                    <input
                      type="range"
                      v-model.number="words"
                      min="1"
                      max="20"
                      class="range"
                    />
                  </div>

                  <!-- Lines Slider -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                      Lines: {{ lines }}
                    </label>
                    <input
                      type="range"
                      v-model.number="lines"
                      min="1"
                      max="10"
                      class="range"
                    />
                  </div>

                  <!-- Height Slider -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                      Height: {{ height }}px
                    </label>
                    <input
                      type="range"
                      v-model.number="height"
                      min="8"
                      max="40"
                      class="range"
                    />
                  </div>

                  <!-- Spacing Slider -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">
                      Spacing: {{ spacing }}px
                    </label>
                    <input
                      type="range"
                      v-model.number="spacing"
                      min="4"
                      max="32"
                      class="range"
                    />
                  </div>

                  <!-- Colors -->
                  <div class="mb-6">
                    <label class="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-400">Colors</label>
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer"
                        :style="{ backgroundColor: color }"
                        @click="showColorPicker = !showColorPicker"
                      ></div>
                      <input
                        v-if="showColorPicker"
                        type="color"
                        v-model="color"
                        class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer"
                      />
                      <button
                        @click="showColorPicker = !showColorPicker"
                        class="seg" aria-label="Pick a color"
                      >
                        <span class="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-3">
                    <button
                      @click="refresh"
                      class="btn btn-secondary flex-1"
                    >
                      <span class="material-symbols-outlined text-lg">refresh</span>
                      Refresh
                    </button>
                    <button
                      @click="downloadSVG"
                      class="btn btn-primary flex-1"
                    >
                      <span class="material-symbols-outlined text-lg">download</span>
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <!-- Preview Area -->
              <div class="lg:col-span-2">
                <div class="preview-area panel">
                  <div class="relative border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 min-h-[500px] bg-slate-50 dark:bg-slate-900">
                    <InlineNotice :notice="notice" class="mb-4 mr-14" @dismiss="clearNotice" />
                    <button
                      @click="copySVG"
                      class="seg absolute top-4 right-4"
                      title="Copy SVG"
                      aria-label="Copy SVG"
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
                    >
                      <div
                        v-for="(lineWords, lineIndex) in layout"
                        :key="lineIndex"
                        style="display: flex; gap: 8px; align-items: center;"
                      >
                        <div
                          v-for="(width, wordIndex) in lineWords"
                          :key="wordIndex"
                          :style="{
                            width: width + 'px',
                            height: safeNumber(height, 8, 40, 16) + 'px',
                            backgroundColor: safeColor,
                            borderRadius: safeNumber(radius, 0, 20, 8) + 'px',
                          }"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { spot } from '../utils/spotIllustrations.js';

const isDarkMode = useDarkMode();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const { notice, showNotice, clearNotice } = useNotice();
const alignment = ref('left');
const radius = ref(8);
const words = ref(8);
const lines = ref(3);
const height = ref(16);
const spacing = ref(8);
const color = ref('#9ca3af');
const showColorPicker = ref(false);

const MAX_LINE_WIDTH = 600; // Maximum width of a line, in px
const WORD_SPACING = 8; // Space between words, in px
const SVG_MARGIN = 20;
const SVG_WIDTH = MAX_LINE_WIDTH + SVG_MARGIN * 2;

// Clamp a slider value to its range (sliders can briefly hold '' or NaN).
const safeNumber = (value, min, max, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

// Only a hex color may reach the SVG/HTML output.
const safeColor = computed(() => (/^#[0-9a-f]{3,8}$/i.test(color.value) ? color.value : '#9ca3af'));

// Random word widths between 30 and 100px, to simulate text
const generateWordWidths = (numWords) =>
  Array.from({ length: numWords }, () => Math.round(Math.random() * 70 + 30));

// Lines of word widths. Generated once per refresh so the preview, the copied
// SVG and the downloaded SVG are all the same layout.
const layout = ref([]);

const generateLayout = () => {
  const lineCount = Math.round(safeNumber(lines.value, 1, 10, 3));
  const wordCount = Math.round(safeNumber(words.value, 1, 20, 8));
  const wordWidths = generateWordWidths(wordCount * lineCount);
  const lineWidthVariation = [0.7, 0.5, 0.8, 0.6, 0.9, 0.65, 0.75, 0.55, 0.85, 0.6];
  const result = [];
  let wordIndex = 0;

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineWords = [];
    let currentLineWidth = 0;
    // Vary the target width per line so lines have different lengths
    const targetLineWidth =
      MAX_LINE_WIDTH * Math.min(1, lineWidthVariation[lineIndex % lineWidthVariation.length] + Math.random() * 0.2);

    while (wordIndex < wordWidths.length && currentLineWidth < targetLineWidth) {
      const wordWidth = wordWidths[wordIndex];
      const extra = lineWords.length > 0 ? WORD_SPACING : 0;
      if (currentLineWidth + extra + wordWidth > MAX_LINE_WIDTH && lineWords.length > 0) break;
      // Sometimes stop early to create shorter lines (30% chance after minimum 2 words)
      if (lineWords.length >= 2 && currentLineWidth >= targetLineWidth * 0.6 && Math.random() < 0.3) break;
      lineWords.push(wordWidth);
      currentLineWidth += extra + wordWidth;
      wordIndex++;
    }

    // Ensure each line has at least one word
    if (lineWords.length === 0) {
      lineWords.push(wordWidths[wordIndex] ?? 60);
      wordIndex++;
    }
    result.push(lineWords);
  }
  layout.value = result;
};

// Build the SVG from the current layout. All values are numbers or a validated
// hex color, so nothing user-typed is interpolated unescaped.
const generateSVGString = () => {
  const h = safeNumber(height.value, 8, 40, 16);
  const gap = safeNumber(spacing.value, 4, 32, 8);
  const r = safeNumber(radius.value, 0, 20, 8);
  const fill = safeColor.value;
  const lineRows = layout.value;
  const svgHeight = lineRows.length * (h + gap) + gap;

  let svg = `<svg width="${SVG_WIDTH}" height="${svgHeight}" viewBox="0 0 ${SVG_WIDTH} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
  let currentY = gap;

  lineRows.forEach((lineWords) => {
    const totalLineWidth = lineWords.reduce((sum, w) => sum + w, 0) + (lineWords.length - 1) * WORD_SPACING;
    let currentX =
      alignment.value === 'center'
        ? (SVG_WIDTH - totalLineWidth) / 2
        : alignment.value === 'right'
        ? SVG_WIDTH - totalLineWidth - SVG_MARGIN
        : SVG_MARGIN;

    lineWords.forEach((width) => {
      svg += `<rect x="${currentX}" y="${currentY}" width="${width}" height="${h}" fill="${fill}" rx="${r}" ry="${r}"/>`;
      currentX += width + WORD_SPACING;
    });
    currentY += h + gap;
  });

  svg += '</svg>';
  return svg;
};

const refresh = () => {
  generateLayout();
};

const copySVG = async () => {
  try {
    await navigator.clipboard.writeText(generateSVGString());
    showNotice('SVG copied to clipboard.', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Could not copy to the clipboard. Use Download instead.', 'error');
  }
};

const downloadSVG = () => {
  const blob = new Blob([generateSVGString()], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'placeholder-text.svg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

// New word count or line count: lay out fresh lines
watch([words, lines], generateLayout);

onMounted(generateLayout);
</script>

<style scoped>
.spot :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.panel {
  @apply rounded-2xl border border-slate-200 bg-[#fff] p-6 dark:border-slate-800 dark:bg-slate-900/40;
}

.seg {
  @apply w-10 h-10 rounded-full border border-solid border-slate-200 bg-[#fff] text-slate-600 flex items-center justify-center transition-colors hover:border-[#8fb0e8] hover:text-[#2f5ea8] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-[#6f93d1] dark:hover:text-[#9dbcf0];
}
.seg.on {
  @apply border-[#2f5ea8] bg-[#2f5ea8] text-white dark:border-[#9dbcf0] dark:bg-[#9dbcf0] dark:text-slate-950;
}

.btn {
  @apply inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-sm font-medium transition-colors;
}
.btn-primary {
  @apply bg-[#2f5ea8] text-white hover:bg-[#264d8b] dark:bg-[#9dbcf0] dark:text-slate-950 dark:hover:bg-[#b8cff5];
}
.btn-secondary {
  @apply border border-solid border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900;
}

.range {
  @apply w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 cursor-pointer;
  -webkit-appearance: none;
  appearance: none;
}
.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2f5ea8;
  cursor: pointer;
}
.range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2f5ea8;
  cursor: pointer;
  border: none;
}
.range:is(.dark *)::-webkit-slider-thumb {
  background: #9dbcf0;
}
.range:is(.dark *)::-moz-range-thumb {
  background: #9dbcf0;
}
</style>
