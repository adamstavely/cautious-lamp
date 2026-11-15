<template>
  <PageShell>
    <PageHero
      eyebrow="For developers"
      title="Build with the system"
      lead="The component library, a REST API with a JavaScript SDK and CLI, and tools to scaffold, test, document and migrate."
      spot="site/for-developers"
    >
      <template #actions>
        <UiButton to="/getting-started/installation" variant="primary" trailing-icon="arrow-right">Install</UiButton>
        <UiButton to="/api">API reference</UiButton>
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
    title: 'Components',
    description: 'Find a component, then scaffold, test and document your own.',
    items: [
      { title: 'Component library', to: '/components', spot: 'foundations/components', body: 'Every component with its documentation, status and code.' },
      { title: 'Scaffolding wizard', to: '/components/scaffold', spot: 'foundations/component-scaffolding-wizard', body: 'Generate a Stencil.js web component with tests, docs and framework wrappers.' },
      { title: 'Component testing', to: '/components/testing', spot: 'foundations/component-testing', body: 'Generate unit, accessibility and visual tests, with CI configuration.' },
      { title: 'Documentation generator', to: '/components/documentation', spot: 'tools/documentation-generator', body: "Read props, events and slots from a Vue component with Vue's own compiler." },
      { title: 'Loupe', to: '/components/loupe', spot: 'tools/loupe-tool', body: 'Inspect the design-system components on any page with a keyboard shortcut.' },
    ],
  },
  {
    title: 'API and integration',
    description: 'Read tokens and components from your own tools and pipelines.',
    items: [
      { title: 'Design system API', to: '/api', spot: 'site/design-system-api', body: 'The REST routes on this server, plus the JavaScript SDK and the ds command line tool.' },
      { title: 'Token migration', to: '/tokens/migration', spot: 'foundations/token-migration', body: 'Rename token references across your code and download the changed files.' },
      { title: 'Design extractor', to: '/tokens/extract', spot: 'tools/design-extractor', body: 'Extract tokens from a website and import them as DTCG tokens.' },
      { title: 'Change notifications', to: '/notifications', spot: 'foundations/pattern-notifications', body: 'Hear about changes by email, Slack, Teams or signed webhooks.' },
    ],
  },
  {
    title: 'Quality checks',
    description: 'Catch problems before they ship.',
    items: [
      { title: 'AI suggestions', to: '/ai-suggestions', spot: 'ai/ai-components', body: 'Paste component code and Claude suggests the components, tokens and accessibility fixes to use.' },
      { title: 'Visual regression', to: '/tools/visual-regression', spot: 'admin/visual-regression', body: 'Run Argos screenshot comparisons in CI and review the diffs.' },
      { title: 'Design-dev handoff', to: '/review/handoff', spot: 'site/handoff-tools', body: 'Turn a design into specs matched to design-system tokens.' },
    ],
  },
];
</script>
