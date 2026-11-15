<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/tokens/color-palettes', label: 'Color palettes' }"
      title="Neutral backgrounds"
      lead="Neutral shades for backgrounds instead of pure black or white: subtle options for light and dark themes, from the Harmony palette."
      spot="foundations/design-themes"
      size="tool"
    >
      <template #actions>
        <UiChip v-for="feature in features" :key="feature" tone="accent">{{ feature }}</UiChip>
      </template>
    </PageHero>

    <PageSection title="Choosing a background">
      <UiCallout tone="info" title="Neutral background options">
        <p class="mb-2">
          Each neutral family has a range of shades for depth and hierarchy. Each cell shows black or white text, whichever contrasts more, and that text's WCAG contrast ratio, so you can see which shades carry body text (AA needs 4.5:1).
        </p>
        <ul class="list-disc list-inside space-y-1">
          <li>Light backgrounds (50–400): subtle neutrals for light themes</li>
          <li>Mid-tone backgrounds (500–600): balanced neutrals for cards and surfaces</li>
          <li>Dark backgrounds (700–950): deep neutrals for dark themes</li>
        </ul>
      </UiCallout>
    </PageSection>

    <PageSection title="Neutral background palette" description="Select a cell to copy its OKLCH value." divided>
      <HarmonyPaletteGrid
        :families="neutralFamilies"
        caption="Neutral background palette: neutral color families by shade level, with APCA contrast, chroma and the WCAG ratio of text on each shade"
        show-wcag
      />
    </PageSection>
  </PageShell>
</template>

<script setup>
import HarmonyPaletteGrid from '../components/palettes/HarmonyPaletteGrid.vue';
import { PageHero, PageSection, PageShell, UiCallout, UiChip } from '../components/ui';

// Neutral color families only (for backgrounds)
const neutralFamilies = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'sand'];

const features = ['Neutrals', 'Backgrounds', 'WCAG ratio per shade'];
</script>
