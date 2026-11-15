<template>
  <PageShell>
    <PageHero
      eyebrow="Build"
      title="Components"
      lead="Reusable UI components designed for accessibility, consistency and flexibility, with the tools to build, test, document and ship them."
      spot="foundations/components"
    />

    <PageSection title="Browse components" description="Live documentation, playgrounds and code for each component.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="card in components" :key="card.to" :to="card.to" :title="card.title" :spot="card.art" compact>{{ card.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Build and ship" description="Create new components and get them ready for release." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="card in buildTools" :key="card.to" :to="card.to" :title="card.title" :spot="card.art" compact>{{ card.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Generators" description="Generate styled component code from a few settings." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="card in generators" :key="card.to" :to="card.to" :title="card.title" :spot="card.art" compact>{{ card.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Track and inspect" description="Follow each component's lifecycle and look at components in place." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="card in trackTools" :key="card.to" :to="card.to" :title="card.title" :spot="card.art" compact>{{ card.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiCard } from '../components/ui';

const components = [
  { title: 'Button', to: '/components/buttons', art: 'foundations/component-button', body: 'Primary, secondary and tertiary variants, sizes and states.' },
  { title: 'Color picker', to: '/components/color-picker', art: 'foundations/component-color-picker', body: 'A colour picker with a gradient selector and several colour formats.' },
];

const buildTools = [
  { title: 'Component scaffolding wizard', to: '/components/scaffold', art: 'foundations/component-scaffolding-wizard', body: 'Create a new Stencil.js component step by step.' },
  { title: 'Component composition', to: '/components/composition', art: 'foundations/component-composition', body: 'Build compositions from primitives and save them to a workspace.' },
  { title: 'Testing framework', to: '/components/testing', art: 'foundations/component-testing', body: 'Generate tests and run accessibility checks on components.' },
  { title: 'Documentation generator', to: '/components/documentation', art: 'tools/documentation-generator', body: 'Generate documentation from code comments.' },
  { title: 'Library export', to: '/components/export', art: 'foundations/components', body: 'Export components as Storybook, PDF, Markdown and more.' },
];

const generators = [
  { title: 'Badge generator', to: '/components/badge-generator', art: 'tools/badge-generator', body: 'Badges and status labels with your colours and shapes.' },
  { title: 'Progress generator', to: '/components/progress-generator', art: 'tools/progress-generator', body: 'Progress bars and rings.' },
  { title: 'Loading spinner generator', to: '/components/loading-generator', art: 'tools/loading-spinner-generator', body: 'Loading spinners and indicators.' },
];

const trackTools = [
  { title: 'Component status', to: '/components/status', art: 'admin/component-status', body: 'Where each component is in its lifecycle.' },
  { title: 'Dependency graph', to: '/admin/dependencies', art: 'foundations/component-dependency-graph', body: 'Which components use which, and what a change affects.' },
  { title: 'Deprecation manager', to: '/components/deprecation', art: 'admin/deprecation-manager', body: 'Deprecate components and guide teams to replacements.' },
  { title: 'Loupe', to: '/components/loupe', art: 'tools/loupe-tool', body: 'Inspect design system components on any page.' },
];
</script>
