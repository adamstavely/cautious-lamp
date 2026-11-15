<template>
  <PageShell>
    <PageHero
      eyebrow="Foundations"
      title="Design tokens"
      lead="The building blocks of the design system: colours, spacing, type, shadows and borders, kept consistent across every platform."
      spot="foundations/tokens"
    />

    <PageSection title="Browse tokens" description="Each kind of token and the tool that builds it.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="kind in kinds" :key="kind.to" :to="kind.to" :title="kind.title" :spot="kind.art" compact>{{ kind.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Token tools" description="Create, test, save and sync tokens." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        <UiLinkRow v-for="tool in tools" :key="tool.to" :to="tool.to" :title="tool.title" :body="tool.body" :spot="tool.art" />
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiCard, UiLinkRow } from '../components/ui';

const kinds = [
  { title: 'Colors', to: '/tokens/color-palettes', art: 'foundations/colors', body: 'Color palettes and semantic color tokens.' },
  { title: 'Typography', to: '/fonts', art: 'foundations/typography', body: 'Font families, sizes, weights and line heights.' },
  { title: 'Spacing', to: '/tools/spacing-scale', art: 'foundations/spacing', body: 'A consistent spacing scale for margins and padding.' },
  { title: 'Shadows', to: '/tools/box-shadow', art: 'foundations/shadows', body: 'Elevation and depth through shadow tokens.' },
  { title: 'Borders', to: '/tools/border-radius', art: 'tools/border-radius-generator', body: 'Border width, style and radius.' },
  { title: 'AI tokens', to: '/tokens/ai-builder', art: 'ai/ai-token-builder', body: 'Tokens for AI agents and generative AI interfaces.' },
];

const tools = [
  { title: 'Palette builder', to: '/palette-builder', art: 'foundations/color-palettes', body: 'Create and manage color palettes.' },
  { title: 'Token studio', to: '/tokens/studio', art: 'foundations/token-studio', body: 'Create DTCG design tokens and export them to any platform.' },
  { title: 'Token playground', to: '/tokens/playground', art: 'foundations/token-playground', body: 'Try the design system’s tokens together in a live preview.' },
  { title: 'Style library', to: '/tokens/library', art: 'foundations/design-themes', body: 'Browse, export and retire the style dictionaries saved in your workspaces.' },
  { title: 'Token sync', to: '/tokens/sync', art: 'foundations/token-sync', body: 'Pull tokens from Figma or Penpot, review the differences and apply the ones you choose.' },
  { title: 'Design extractor', to: '/tokens/extract', art: 'tools/design-extractor', body: 'Extract tokens from a website and save them as a style dictionary.' },
  { title: 'Token migration', to: '/tokens/migration', art: 'foundations/token-migration', body: 'Map old token names to new ones and rewrite code that uses them.' },
];
</script>
