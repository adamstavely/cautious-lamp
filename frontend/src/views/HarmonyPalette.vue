<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/tokens/color-palettes', label: 'Color palettes' }"
      title="Harmony"
      lead="Accessible UI color palette by Evil Martians. Uses OKLCH and APCA for highly consistent color shades with precise control over text and UI element contrast."
      spot="foundations/color-palettes"
      size="tool"
    >
      <template #actions>
        <UiChip v-for="feature in features" :key="feature" tone="accent">{{ feature }}</UiChip>
      </template>
    </PageHero>

    <PageSection title="Install">
      <UiCodeBlock code="npm install @evilmartians/harmony" label="Install" />
    </PageSection>

    <PageSection title="Color palette grid" description="Select a cell to copy its OKLCH value." divided>
      <div class="mb-6 md:w-96">
        <UiInput v-model="searchQuery" type="search" icon="search" label="Search color families" placeholder="Search color families..." />
      </div>

      <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />

      <UiPanel flush class="mb-8">
        <UiTable caption="Harmony palette: color families by shade level, with APCA contrast and chroma per level" compact>
          <thead>
            <tr>
              <th scope="col" class="sticky left-0 z-20 bg-surface-raised">Color</th>
              <th v-for="shade in shadeLevels" :key="shade" scope="col" class="text-center min-w-32">
                <div class="text-base font-bold text-ink-strong mb-1">Level {{ shade }}</div>
                <div class="text-xs font-normal">Contrast: {{ getContrastForShade(shade) }}</div>
                <div class="text-xs font-normal">Chroma: {{ getChromaForShade(shade) }}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(colors, familyName) in filteredColors" :key="familyName">
              <th scope="row" class="sticky left-0 z-10 bg-surface-raised font-semibold capitalize whitespace-nowrap text-ink-strong">
                {{ familyName }}
              </th>
              <td v-for="shade in shadeLevels" :key="`${familyName}-${shade}`" class="p-0">
                <UiColorSample
                  v-if="colors[shade]"
                  tag="button"
                  class="palette-cell group"
                  :color="colors[shade]"
                  :text-color="getTextColorForCell(colors[shade], `${familyName}-${shade}`)"
                  :aria-label="`Copy ${familyName} ${shade}: ${colors[shade]}`"
                  @click="copyToClipboard(colors[shade], `${familyName}-${shade}`)"
                >
                  <span class="text-3xl font-bold mb-2 leading-none">{{ getContrastForShade(shade) }}</span>
                  <span class="text-xs font-code mb-1">{{ colorInfo[`${familyName}-${shade}`]?.hex || 'OKLCH' }}</span>
                  <span class="absolute top-2 right-2 px-1 min-w-6 h-6 rounded-pill border border-current flex items-center justify-center text-xs font-bold" aria-hidden="true">
                    {{ getUsageGuidelineIcon(shade) }}
                  </span>
                  <span class="palette-cell-copy" aria-hidden="true">
                    <span class="material-symbols-outlined text-xl">{{ copiedColor === `${familyName}-${shade}` ? 'check' : 'content_copy' }}</span>
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
        <ul class="grid grid-cols-2 md:grid-cols-5 gap-4">
          <li v-for="(guideline, index) in usageGuidelines" :key="index" class="flex items-center gap-2">
            <UiColorSample
              tag="span"
              class="w-8 h-8 shrink-0 rounded-pill border flex items-center justify-center text-xs font-bold"
              :color="guideline.color"
              :text-color="guidelineTextColors[index]"
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
    </PageSection>

    <PageSection title="Usage guidelines" divided>
      <div class="space-y-12">
        <!-- Guideline 1: Accent Color Flexibility -->
        <section>
          <h3 class="text-xl font-semibold text-ink-strong mb-3">1. Set up and easily change the accent color later</h3>
          <p class="text-base text-ink mb-4">
            Harmony's equal contrast within level columns allows you to change accent colors (e.g., Blue 600 to another 600 color) while maintaining the same contrast level. This preserves accessibility and readability.
          </p>
          <p class="text-sm text-ink-secondary mb-6">
            Thanks to equal contrast within level columns, the contrast between text labels and buttons doesn't change when you swap accent colors.
          </p>
          <div class="grid md:grid-cols-2 gap-6">
            <UiPanel v-for="example in accentExamples" :key="example.key">
              <p class="text-sm font-medium text-ink mb-2">Document changed</p>
              <p class="text-sm text-ink-secondary mb-4">Do you want to save your edits?</p>
              <div class="flex gap-3" aria-hidden="true">
                <span class="demo-button border border-line-control text-ink">Cancel</span>
                <UiColorSample tag="span" class="demo-button" :color="example.accent" :text-color="demoColors.white">Save</UiColorSample>
              </div>
              <p class="mt-4 text-xs text-ink-muted">{{ example.note }}</p>
            </UiPanel>
          </div>
        </section>

        <!-- Guideline 2: Light and Dark Themes -->
        <section>
          <h3 class="text-xl font-semibold text-ink-strong mb-3">2. Establish both light and dark themes effortlessly</h3>
          <p class="text-base text-ink mb-4">
            Harmony's palette features mirrored contrast pairs. Every color column (except the central one) has a pair with the same level of contrast on the right (e.g., "65 and 65, 77 and 77").
          </p>
          <p class="text-sm text-ink-secondary mb-6">
            Consider level 500 as the central column, and other columns make up mirrored contrast pairs. 400 and 600 are one step away from 500. 300 and 700 are two steps away from the center.
          </p>

          <div class="mb-6 p-6 rounded-tile border border-line-faint bg-surface-sunken">
            <ul class="flex items-center justify-center gap-4 mb-4">
              <li v-for="pair in mirroredPairs" :key="pair.level" class="text-center">
                <span class="block text-2xl font-bold" :class="pair.center ? 'text-accent-text' : 'text-ink-strong'">{{ pair.contrast }}</span>
                <span class="block text-xs" :class="pair.center ? 'font-semibold text-accent-text' : 'text-ink-secondary'">{{ pair.level }}</span>
              </li>
            </ul>
            <p class="text-center text-xs text-ink-secondary">Mirrored contrast pairs around level 500</p>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <UiPanel>
              <p class="text-sm font-medium text-ink mb-2">Document changed</p>
              <p class="text-sm text-ink-secondary mb-4">Do you want to save your edits?</p>
              <div class="flex gap-3" aria-hidden="true">
                <span class="demo-button border border-line-control text-ink">Cancel</span>
                <UiColorSample tag="span" class="demo-button" :color="demoColors.blue600" :text-color="demoColors.white">Save</UiColorSample>
              </div>
              <p class="mt-4 text-xs text-ink-muted">Light theme: Slate 200, Blue 600, Blue 100</p>
            </UiPanel>

            <UiColorSample class="rounded-card border p-6" :color="demoColors.darkSurface" :text-color="demoColors.darkText" :border-color="demoColors.darkBorder">
              <p class="text-sm font-medium mb-2">Document changed</p>
              <p class="text-sm opacity-80 mb-4">Do you want to save your edits?</p>
              <div class="flex gap-3" aria-hidden="true">
                <UiColorSample tag="span" class="demo-button border" color="transparent" :border-color="demoColors.darkBorder">Cancel</UiColorSample>
                <UiColorSample tag="span" class="demo-button" :color="demoColors.blue400" :text-color="demoColors.white">Save</UiColorSample>
              </div>
              <p class="mt-4 text-xs opacity-70">Dark theme: Slate 800, Blue 400, Blue 900</p>
            </UiColorSample>
          </div>
        </section>

        <!-- Guideline 3: Consistent Object Coloring -->
        <section>
          <h3 class="text-xl font-semibold text-ink-strong mb-3">3. Set different colors within one column to similar objects</h3>
          <p class="text-base text-ink mb-4">
            Use colors from the same column for semantically similar but visually distinct objects, such as multicolored user avatars, tags, and notifications.
          </p>
          <p class="text-sm text-ink-secondary mb-6">
            Colors in every column have equal chroma and lightness, giving them a cohesive look that makes them seem like they belong to the same group. Also, as usual, the contrast level remains the same.
          </p>
          <ul class="flex flex-wrap gap-3">
            <li v-for="tag in exampleTags" :key="tag.label">
              <UiColorSample tag="span" class="inline-block px-4 py-2 rounded-pill text-sm font-medium" :color="tag.color" :text-color="demoColors.white">
                {{ tag.label }}
              </UiColorSample>
            </li>
          </ul>
          <p class="mt-4 text-xs text-ink-secondary">All tags use colors from the same column (600 level) with equal chroma and lightness</p>
        </section>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiChip, UiCodeBlock, UiInput, UiPanel, UiTable } from '../components/ui';
import UiColorSample from '../components/ui/UiColorSample.vue';
import { useNotice } from '../composables/useNotice.js';
import harmonyPalette from '@evilmartians/harmony/base';

// Note: much of this page (OKLCH grid, usage guidelines) duplicates
// ColoredTextPalette.vue; a shared palette-grid component would remove that.

const { notice, showNotice, clearNotice } = useNotice();
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





// Color family order matching the Harmony palette documentation
const colorFamilyOrder = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate', 'gray', 'zinc',
  'neutral', 'stone', 'sand', 'olive', 'mauve'
];

// Process Harmony colors
const harmonyColors = computed(() => {
  const colors = {};
  
  // Process colors in the specified order
  colorFamilyOrder.forEach(colorName => {
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

// OKLCH -> sRGB, computed directly. (Reading back getComputedStyle() doesn't
// work: current browsers report oklch colours as "oklch(...)", not rgb(), so
// the old regex never matched and hex values never appeared. It also forced a
// layout for every cell on every render.)
const parseOklch = (value) => {
  const match = /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)(%?)\s+([\d.]+)(?:deg)?/i.exec(String(value || ''));
  if (!match) return null;
  const L = match[2] ? parseFloat(match[1]) / 100 : parseFloat(match[1]);
  const C = match[4] ? (parseFloat(match[3]) / 100) * 0.4 : parseFloat(match[3]);
  const H = parseFloat(match[5]);
  return [L, C, H].every(Number.isFinite) ? { L, C, H } : null;
};

const oklchToRgb = (value) => {
  const parsed = parseOklch(value);
  if (!parsed) return null;
  const { L, C, H } = parsed;
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;

  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  ];

  return linear.map((channel) => {
    const c = Math.min(1, Math.max(0, channel));
    const encoded = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, encoded)) * 255);
  });
};

const toHex = ([r, g, b]) => '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();

// Calculate relative luminance (WCAG standard)
const calculateLuminance = (r, g, b) => {
  const [rNorm, gNorm, bNorm] = [r / 255, g / 255, b / 255].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
};

const isDarkColor = (value) => {
  const rgb = oklchToRgb(value);
  if (!rgb) return false;
  return calculateLuminance(...rgb) < 0.5;
};

// Hex value and readable text colour (black or white) for every cell, computed once.
const colorInfo = computed(() => {
  const info = {};
  Object.entries(harmonyColors.value).forEach(([familyName, shades]) => {
    Object.entries(shades).forEach(([shade, oklchValue]) => {
      const rgb = oklchToRgb(oklchValue);
      const dark = rgb ? calculateLuminance(...rgb) < 0.5 : Number(shade) >= 600;
      info[`${familyName}-${shade}`] = {
        hex: rgb ? toHex(rgb) : null,
        textColor: dark ? '#ffffff' : '#000000',
      };
    });
  });
  return info;
});

const guidelineTextColors = usageGuidelines.map((guideline) => (isDarkColor(guideline.color) ? '#ffffff' : '#000000'));

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

// Get text color for cell (white or black based on background luminance)
const getTextColorForCell = (oklchValue, cacheKey) => {
  if (!oklchValue) return '';
  return colorInfo.value[cacheKey]?.textColor || '#000000';
};

// Fixed demo colours for the usage examples (Harmony shades, shown as data)
const demoColors = {
  blue600: 'oklch(0.5 0.2 250)',
  teal600: 'oklch(0.5 0.2 180)',
  blue400: 'oklch(0.65 0.15 250)',
  darkSurface: harmonyPalette.slate?.['900'] || 'oklch(0.21 0.04 265)',
  darkBorder: harmonyPalette.slate?.['700'] || 'oklch(0.37 0.04 257)',
  darkText: harmonyPalette.slate?.['200'] || 'oklch(0.93 0.01 256)',
  white: '#ffffff',
};

const accentExamples = [
  { key: 'blue', accent: demoColors.blue600, note: 'Blue 600 accent' },
  { key: 'teal', accent: demoColors.teal600, note: 'Teal 600 accent (same contrast)' },
];

const mirroredPairs = [
  { contrast: 77, level: '300' },
  { contrast: 65, level: '400' },
  { contrast: 54, level: '500 (center)', center: true },
  { contrast: 65, level: '600' },
  { contrast: 77, level: '700' },
];

const exampleTags = [
  { label: 'Music', color: 'oklch(0.5 0.15 250)' },
  { label: 'Books', color: 'oklch(0.5 0.15 30)' },
  { label: 'Games', color: 'oklch(0.5 0.15 300)' },
  { label: 'Video', color: 'oklch(0.5 0.15 150)' },
  { label: 'Utilities', color: 'oklch(0.5 0.15 0)' },
];

const features = ['OKLCH', 'APCA', 'Tailwind Compatible', 'P3 Support'];

// Copy to clipboard
let copiedTimer = null;
const copyToClipboard = async (value, colorName) => {
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
    copiedColor.value = colorName;
    showNotice(`Copied ${colorName.replace('-', ' ')}: ${value}`, 'success');

    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => {
      copiedColor.value = null;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
    showNotice('Could not copy to the clipboard.', 'error');
  }
};

onBeforeUnmount(() => {
  clearTimeout(copiedTimer);
});
</script>

<style scoped>
.palette-cell {
  @apply relative flex flex-col items-center justify-center w-full h-full min-h-28 p-3 text-center;
}
.palette-cell-copy {
  @apply absolute bottom-2 right-2 flex items-center justify-center rounded-pill bg-surface-overlay text-ink shadow-control p-1 opacity-0 transition-opacity;
}
.group:hover .palette-cell-copy,
.group:focus-visible .palette-cell-copy {
  @apply opacity-100;
}
.demo-button {
  @apply inline-block px-4 py-2 rounded-pill text-sm font-medium;
}
</style>
