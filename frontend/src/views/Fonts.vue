<template>
  <PageShell>
    <PageHero
      eyebrow="Foundations"
      title="Typography"
      lead="Preview fonts, compare typefaces, and build type scales and font stacks for a cohesive typographic hierarchy."
      spot="foundations/typography"
    />

    <PageSection title="Typography tools" description="Find a font, then size it and give it fallbacks.">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UiCard v-for="tool in tools" :key="tool.to" :to="tool.to" :title="tool.title" :spot="tool.spot">{{ tool.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiCard } from '../components/ui';
import fontData from '../assets/fonts.json';

const tools = [
  {
    title: 'Font library',
    to: '/design-assets/font-library',
    spot: 'foundations/font-library',
    body: `Preview and compare the ${fontData.length} Google Fonts families in the library with your own text.`,
  },
  {
    title: 'Font scale',
    to: '/tools/font-scale',
    spot: 'tools/font-scale',
    body: 'Create type scales from a ratio for consistent heading and body sizes.',
  },
  {
    title: 'Font stack and subsetting',
    to: '/tools/font-stack',
    spot: 'foundations/font-stack',
    body: 'Build font stacks with fallbacks, and smaller Google Fonts URLs by subsetting character sets.',
  },
];
</script>
