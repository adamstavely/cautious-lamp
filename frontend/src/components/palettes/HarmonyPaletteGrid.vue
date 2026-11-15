<template>
  <div>
    <div class="mb-6 md:w-96">
      <UiInput v-model="searchQuery" type="search" icon="search" label="Search color families" placeholder="Search color families..." />
    </div>

    <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />

    <p v-if="!Object.keys(filteredColors).length" class="text-sm text-ink-muted mb-8">No color families match “{{ searchQuery }}”.</p>
    <UiPanel v-else flush class="mb-8">
      <UiTable :caption="caption" compact>
        <thead>
          <tr>
            <th scope="col" class="sticky left-0 z-20 bg-surface-raised">Color</th>
            <th v-for="shade in SHADE_LEVELS" :key="shade" scope="col" class="text-center min-w-32">
              <div class="text-base font-bold text-ink-strong mb-1">Level {{ shade }}</div>
              <div class="text-xs font-normal">Contrast: {{ CONTRAST[shade] }}</div>
              <div class="text-xs font-normal">Chroma: {{ CHROMA[shade] }}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(colors, familyName) in filteredColors" :key="familyName">
            <th scope="row" class="sticky left-0 z-10 bg-surface-raised font-semibold capitalize whitespace-nowrap text-ink-strong">
              {{ familyName }}
            </th>
            <td v-for="shade in SHADE_LEVELS" :key="`${familyName}-${shade}`" class="p-0">
              <UiColorSample
                v-if="colors[shade]"
                tag="button"
                class="palette-cell group"
                :color="colors[shade]"
                :text-color="cell(familyName, shade).textColor"
                :aria-label="`Copy ${familyName} ${shade}: ${colors[shade]}`"
                @click="copy(colors[shade], `${familyName} ${shade}`)"
              >
                <span class="text-3xl font-bold mb-2 leading-none">{{ CONTRAST[shade] }}</span>
                <span class="text-xs font-code mb-1">{{ cell(familyName, shade).hex || 'OKLCH' }}</span>
                <span v-if="showWcag && cell(familyName, shade).ratio" class="text-xs">
                  Text {{ cell(familyName, shade).ratio.toFixed(1) }}:1 {{ wcagLevel(cell(familyName, shade).ratio) }}
                </span>
                <span class="absolute top-2 right-2 px-1 min-w-6 h-6 rounded-pill border border-current flex items-center justify-center text-xs font-bold" aria-hidden="true">
                  {{ GUIDELINE_ICON[shade] }}
                </span>
                <span class="palette-cell-copy" aria-hidden="true">
                  <AppIcon :name="copied === `${familyName} ${shade}` ? 'check' : 'copy'" class="text-xl" />
                </span>
              </UiColorSample>
              <div v-else class="palette-cell bg-surface-sunken">
                <span class="sr-only">No {{ familyName }} {{ shade }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </UiTable>
    </UiPanel>

    <UiPanel title="Usage guidelines" heading-tag="h3">
      <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <li v-for="(guideline, index) in USAGE_GUIDELINES" :key="index" class="flex items-center gap-2">
          <UiColorSample
            tag="span"
            class="w-8 h-8 shrink-0 rounded-pill border flex items-center justify-center text-xs font-bold"
            :color="guideline.color"
            :text-color="guidelineText[index]"
          >
            {{ guideline.icon }}
          </UiColorSample>
          <span>
            <span class="block text-sm font-medium text-ink-strong">{{ guideline.label }}</span>
            <span class="block text-xs text-ink-secondary">Contrast {{ guideline.contrast }}, {{ guideline.fontSize }}, {{ guideline.lineHeight }}</span>
          </span>
        </li>
      </ul>
    </UiPanel>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue';
import harmonyPalette from '@evilmartians/harmony/base';
import InlineNotice from '../InlineNotice.vue';
import { UiColorSample, UiInput, UiPanel, UiTable } from '../ui';
import { useNotice } from '../../composables/useNotice.js';
import { contrastRatio, readableOn, wcagLevel } from '../../utils/contrast.js';
import { oklchToHex } from '../../utils/oklch.js';

/**
 * The Harmony palette (Evil Martians) as a grid: one row per colour family,
 * one column per shade level with its APCA contrast level and chroma. Select
 * a cell to copy its OKLCH value. `families` picks the rows (Harmony pages
 * show them all; Neutral backgrounds only the neutrals); `showWcag` adds the
 * WCAG ratio of the text colour on each cell.
 */
const props = defineProps({
  families: { type: Array, required: true },
  caption: { type: String, required: true },
  showWcag: { type: Boolean, default: false },
});

const SHADE_LEVELS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
// Harmony's APCA contrast per level, mirrored around 500, and its chroma
const CONTRAST = { 50: 105, 100: 100, 200: 90, 300: 77, 400: 65, 500: 54, 600: 65, 700: 77, 800: 90, 900: 100, 950: 105 };
const CHROMA = { 50: 0.005, 100: 0.02, 200: 0.04, 300: 0.08, 400: 0.11, 500: 0.15, 600: 0.14, 700: 0.12, 800: 0.09, 900: 0.07, 950: 0.04 };
const GUIDELINE_ICON = { 50: 'P1', 100: 'P2', 200: 'P3', 300: 'P4', 400: 'P5', 500: 'P6', 600: 'P7', 700: 'P8', 800: 'P9', 900: 'P10', 950: 'P10' };
const USAGE_GUIDELINES = [
  { label: 'Any text', contrast: 105, fontSize: '16px', lineHeight: '24px', icon: 'P1', color: 'oklch(0.98 0.005 0)' },
  { label: 'Any text', contrast: 100, fontSize: '18px', lineHeight: '28px', icon: 'P2', color: 'oklch(0.95 0.02 0)' },
  { label: 'Any text', contrast: 90, fontSize: '20px', lineHeight: '32px', icon: 'P3', color: 'oklch(0.90 0.04 0)' },
  { label: 'Body text', contrast: 77, fontSize: '24px', lineHeight: '36px', icon: 'P4', color: 'oklch(0.80 0.08 0)' },
  { label: 'Content text', contrast: 65, fontSize: '32px', lineHeight: '40px', icon: 'P5', color: 'oklch(0.65 0.11 0)' },
  { label: 'Headline', contrast: 54, fontSize: '48px', lineHeight: '56px', icon: 'P6', color: 'oklch(0.50 0.15 0)' },
  { label: 'Content text', contrast: 65, fontSize: '32px', lineHeight: '40px', icon: 'P7', color: 'oklch(0.35 0.14 0)' },
  { label: 'Body text', contrast: 77, fontSize: '24px', lineHeight: '36px', icon: 'P8', color: 'oklch(0.20 0.12 0)' },
  { label: 'Any text', contrast: 100, fontSize: '18px', lineHeight: '28px', icon: 'P9', color: 'oklch(0.10 0.07 0)' },
  { label: 'Any text', contrast: 105, fontSize: '16px', lineHeight: '24px', icon: 'P10', color: 'oklch(0.05 0.04 0)' },
];

const { notice, showNotice, clearNotice } = useNotice();
const searchQuery = ref('');
const copied = ref(null);

const colors = computed(() => {
  const out = {};
  for (const family of props.families) {
    const shades = harmonyPalette[family];
    if (!shades || typeof shades !== 'object') continue;
    out[family] = {};
    for (const shade of SHADE_LEVELS) {
      if (typeof shades[shade] === 'string' && shades[shade].startsWith('oklch')) out[family][shade] = shades[shade];
    }
  }
  return out;
});

const filteredColors = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return colors.value;
  return Object.fromEntries(
    Object.entries(colors.value).filter(([family, shades]) => family.includes(query) || Object.keys(shades).some((shade) => shade.includes(query))),
  );
});

// Hex, readable text colour (black or white, whichever contrasts more) and its WCAG ratio, per cell
const cells = computed(() => {
  const info = {};
  for (const [family, shades] of Object.entries(colors.value)) {
    for (const [shade, value] of Object.entries(shades)) {
      const hex = oklchToHex(value);
      const textColor = hex ? readableOn(hex) : Number(shade) >= 600 ? '#ffffff' : '#000000';
      info[`${family}-${shade}`] = { hex, textColor, ratio: hex ? contrastRatio(hex, textColor) : null };
    }
  }
  return info;
});
const cell = (family, shade) => cells.value[`${family}-${shade}`] ?? {};

const guidelineText = USAGE_GUIDELINES.map((g) => {
  const hex = oklchToHex(g.color);
  return hex ? readableOn(hex) : '#000000';
});

let copiedTimer = null;
const copy = async (value, name) => {
  try {
    await navigator.clipboard.writeText(value);
    copied.value = name;
    showNotice(`Copied ${name}: ${value}`, 'success');
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      copied.value = null;
    }, 2000);
  } catch {
    showNotice('Could not copy to the clipboard.', 'error');
  }
};

onBeforeUnmount(() => clearTimeout(copiedTimer));
</script>

<style scoped>
.palette-cell {
  @apply relative flex flex-col items-center justify-center w-full h-full min-h-28 px-3 pb-3 pt-9 text-center;
}
.palette-cell-copy {
  @apply absolute bottom-2 right-2 flex items-center justify-center rounded-pill bg-surface-overlay text-ink shadow-control p-1 opacity-0 transition-opacity;
}
.group:hover .palette-cell-copy,
.group:focus-visible .palette-cell-copy {
  @apply opacity-100;
}
</style>
