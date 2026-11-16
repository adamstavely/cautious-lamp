<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="SVG placeholder text"
      lead="Generate placeholder SVG text for your designs, with control over alignment, spacing, size and color."
      spot="guidelines/text-graphics"
      size="tool"
    />

    <PageSection>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UiPanel title="Take more control..." class="lg:col-span-1">
          <UiSegmented v-model="alignment" label="Align" :options="alignOptions" />
          <UiRange v-model="radius" label="Radius" :min="0" :max="20" unit="px" />
          <UiRange v-model="words" label="Words per line" :min="1" :max="20" />
          <UiRange v-model="lines" label="Lines" :min="1" :max="10" />
          <UiRange v-model="height" label="Height" :min="8" :max="40" unit="px" />
          <UiRange v-model="spacing" label="Spacing" :min="4" :max="32" unit="px" />
          <UiInput v-model="color" type="color" label="Color" />
          <div class="flex gap-3">
            <UiButton icon="refresh-cw" class="flex-1" @click="refresh">Refresh</UiButton>
            <UiButton variant="primary" icon="download" class="flex-1" @click="downloadSVG">Download</UiButton>
          </div>
        </UiPanel>

        <UiPanel title="Preview" class="lg:col-span-2">
          <template #actions>
            <UiButton variant="ghost" size="sm" icon="copy" icon-only label="Copy SVG" @click="copySVG" />
          </template>
          <InlineNotice :notice="notice" @dismiss="clearNotice" />
          <div class="preview-well">
            <svg
              class="w-full h-auto"
              :viewBox="`0 0 ${svgModel.width} ${svgModel.height}`"
              role="img"
              aria-label="Placeholder text preview"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                v-for="(rect, index) in svgModel.rects"
                :key="index"
                :x="rect.x"
                :y="rect.y"
                :width="rect.width"
                :height="rect.height"
                :rx="rect.r"
                :ry="rect.r"
                :fill="svgModel.fill"
              />
            </svg>
          </div>
        </UiPanel>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import { PageHero, PageSection, PageShell, UiButton, UiInput, UiPanel, UiRange, UiSegmented } from '../components/ui';
import { layoutPlaceholderLines, lineWidth } from '../utils/placeholderLayout.js';

const { notice, showNotice, clearNotice } = useNotice();
const alignment = ref('left');
const radius = ref(8);
const words = ref(8);
const lines = ref(3);
const height = ref(16);
const spacing = ref(8);
const color = ref('#9ca3af');

const alignOptions = [
  { value: 'left', label: 'Left', icon: 'align-left' },
  { value: 'center', label: 'Center', icon: 'align-center' },
  { value: 'right', label: 'Right', icon: 'align-right' },
];

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

// Lines of word widths: exactly `words` per line. Generated once per refresh
// so the preview, the copied SVG and the downloaded SVG are all the same layout.
const layout = ref([]);

const generateLayout = () => {
  layout.value = layoutPlaceholderLines({
    words: safeNumber(words.value, 1, 20, 8),
    lines: safeNumber(lines.value, 1, 10, 3),
    maxWidth: MAX_LINE_WIDTH,
    wordSpacing: WORD_SPACING,
  });
};

// The SVG from the current layout: the preview draws it and Copy/Download
// write it out. All values are numbers or a validated hex color, so nothing
// user-typed is interpolated unescaped.
const svgModel = computed(() => {
  const h = safeNumber(height.value, 8, 40, 16);
  const gap = safeNumber(spacing.value, 4, 32, 8);
  const r = safeNumber(radius.value, 0, 20, 8);
  const lineRows = layout.value;
  const svgHeight = lineRows.length * (h + gap) + gap;
  const rects = [];
  let currentY = gap;

  lineRows.forEach((lineWords) => {
    const totalLineWidth = lineWidth(lineWords, WORD_SPACING);
    let currentX =
      alignment.value === 'center'
        ? (SVG_WIDTH - totalLineWidth) / 2
        : alignment.value === 'right'
        ? SVG_WIDTH - totalLineWidth - SVG_MARGIN
        : SVG_MARGIN;

    lineWords.forEach((width) => {
      rects.push({ x: currentX, y: currentY, width, height: h, r });
      currentX += width + WORD_SPACING;
    });
    currentY += h + gap;
  });

  return { width: SVG_WIDTH, height: svgHeight, fill: safeColor.value, rects };
});

const generateSVGString = () => {
  const { width, height: svgHeight, fill, rects } = svgModel.value;
  let svg = `<svg width="${width}" height="${svgHeight}" viewBox="0 0 ${width} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
  rects.forEach((rect) => {
    svg += `<rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="${fill}" rx="${rect.r}" ry="${rect.r}"/>`;
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
.preview-well {
  @apply flex items-center p-8 min-h-96 rounded-tile border border-dashed border-line-control bg-surface-sunken;
}
</style>
