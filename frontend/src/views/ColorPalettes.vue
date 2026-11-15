<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tokens', label: 'Design tokens' }"
      title="Color palettes"
      lead="Palettes built for accessibility and consistency: shades with even contrast steps, and neutral backgrounds for light and dark themes."
      spot="foundations/color-palettes"
    />

    <PageSection title="Available palettes" description="Open a palette to see its shades and copy them.">
      <div class="grid md:grid-cols-2 gap-6">
        <UiCard v-for="palette in palettes" :key="palette.to" :to="palette.to" :title="palette.title" :spot="palette.art">
          {{ palette.body }}
          <template #footer>
            <div class="flex flex-wrap gap-2">
              <UiChip v-for="tag in palette.tags" :key="tag">{{ tag }}</UiChip>
            </div>
            <p v-if="palette.install" class="mt-3"><UiCode>{{ palette.install }}</UiCode></p>
          </template>
        </UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiCard, UiChip, UiCode } from '../components/ui';

const palettes = [
  {
    title: 'Harmony',
    to: '/tokens/color-palettes/harmony',
    art: 'foundations/colors',
    body: 'The accessible UI palette by Evil Martians. It uses OKLCH and APCA for consistent shades, with precise control over text and UI contrast.',
    tags: ['OKLCH', 'APCA', 'Tailwind', 'P3'],
    install: 'npm install @evilmartians/harmony',
  },
  {
    title: 'Neutral backgrounds',
    to: '/tokens/color-palettes/colored-text',
    art: 'foundations/design-themes',
    body: 'Neutral shades for backgrounds instead of pure black or white: subtle options that work in light and dark themes, with the contrast of text on each.',
    tags: ['Neutrals', 'Backgrounds', 'Contrast checked'],
  },
];
</script>
