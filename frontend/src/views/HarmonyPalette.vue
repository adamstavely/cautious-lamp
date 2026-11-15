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
      <HarmonyPaletteGrid :families="colorFamilyOrder" caption="Harmony palette: color families by shade level, with APCA contrast and chroma per level" />
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
import { PageHero, PageSection, PageShell, UiChip, UiCodeBlock, UiPanel } from '../components/ui';
import UiColorSample from '../components/ui/UiColorSample.vue';
import HarmonyPaletteGrid from '../components/palettes/HarmonyPaletteGrid.vue';
import harmonyPalette from '@evilmartians/harmony/base';

// Color family order matching the Harmony palette documentation
const colorFamilyOrder = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose', 'slate', 'gray', 'zinc',
  'neutral', 'stone', 'sand', 'olive', 'mauve'
];

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
</script>

<style scoped>
.demo-button {
  @apply inline-block px-4 py-2 rounded-pill text-sm font-medium;
}
</style>
