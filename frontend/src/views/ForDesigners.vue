<template>
  <PageShell>
    <PageHero
      eyebrow="For designers"
      title="Design with the system"
      lead="Color and type tools, design assets, and the sync, review and handoff workflows that keep design and code in step."
      spot="site/for-designers"
    >
      <template #actions>
        <UiButton to="/getting-started" variant="primary" trailing-icon="arrow-right">Get started</UiButton>
        <UiButton to="/guidelines">Read the guidelines</UiButton>
      </template>
    </PageHero>

    <PageSection v-for="(group, i) in groups" :key="group.title" :title="group.title" :description="group.description" :divided="i > 0">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="item in group.items" :key="item.to + item.title" :to="item.to" :title="item.title" :spot="item.spot" compact>{{ item.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiButton, UiCard } from '../components/ui';

const groups = [
  {
    title: 'Color and type',
    description: 'Build palettes, check contrast and set up a type scale.',
    items: [
      { title: 'Palette builder', to: '/palette-builder', spot: 'foundations/color-palettes', body: 'Build a palette, check its harmony and contrast, and assign color roles.' },
      { title: 'Color contrast checker', to: '/tools/color-contrast', spot: 'tools/color-contrast-checker', body: 'Check color pairs against WCAG.' },
      { title: 'Gradient generator', to: '/tools/gradient-generator', spot: 'tools/gradient-generator', body: 'Create CSS gradients with custom stops.' },
      { title: 'Color converter', to: '/tools/color-converter', spot: 'tools/color-converter', body: 'Convert colors between formats and color spaces.' },
      { title: 'Font library', to: '/design-assets/font-library', spot: 'foundations/font-library', body: 'Browse and preview Google Fonts.' },
      { title: 'Font scale', to: '/tools/font-scale', spot: 'tools/font-scale', body: 'Generate a type scale for your design system.' },
    ],
  },
  {
    title: 'Assets and tokens',
    description: 'The icons, illustrations and tokens your designs are built from.',
    items: [
      { title: 'Design assets', to: '/design-assets', spot: 'foundations/design-assets', body: 'Icons, fonts, flags, seals, photos, illustrations and logos.' },
      { title: 'Icon library', to: '/design-assets/icons', spot: 'foundations/icon-library', body: 'Search, customize and download icons, or upload your own sets.' },
      { title: 'Token studio', to: '/tokens/studio', spot: 'foundations/token-studio', body: 'Create and edit design tokens visually.' },
    ],
  },
  {
    title: 'Design and code in step',
    description: 'Connect Figma or Penpot, and hand off work developers can build from.',
    items: [
      { title: 'Design sync', to: '/design-sync', spot: 'site/design-sync', body: 'Compare a Figma or Penpot file with the component library: what matches, was renamed or is missing.' },
      { title: 'Token sync', to: '/tokens/sync', spot: 'foundations/token-sync', body: 'Pull tokens from Figma or Penpot, review the differences and apply the ones you choose.' },
      { title: 'Design-dev handoff', to: '/review/handoff', spot: 'site/handoff-tools', body: 'Read the specs from a design and match every value to a design-system token.' },
      { title: 'Component library export', to: '/components/export', spot: 'foundations/components', body: 'Export to Figma, Penpot, Adobe XD, Storybook, PDF, Markdown, npm or a static site.' },
    ],
  },
  {
    title: 'Review and keep watch',
    description: 'Get feedback on designs and hear when the system changes.',
    items: [
      { title: 'Design review', to: '/review', spot: 'site/review', body: 'Share designs, gather comments and track approvals.' },
      { title: 'Change notifications', to: '/notifications', spot: 'foundations/pattern-notifications', body: 'Follow components, tokens and patterns, by email, Slack, Teams or webhook.' },
      { title: 'Visual regression', to: '/tools/visual-regression', spot: 'admin/visual-regression', body: 'Catch unintended visual changes with Argos screenshots and baselines.' },
    ],
  },
];
</script>
