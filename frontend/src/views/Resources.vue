<template>
  <PageShell>
    <PageHero
      eyebrow="Getting started"
      title="Resources"
      lead="Helpful resources, tools and links to help you work effectively with the design system."
      spot="site/resources"
    />

    <PageSection
      v-for="(group, index) in groups"
      :key="group.title"
      :title="group.title"
      :description="group.description"
      :divided="index > 0"
    >
      <div class="grid sm:grid-cols-2 gap-4">
        <UiCard v-for="item in group.items" :key="item.title" :title="item.title" :spot="item.spot" :to="item.to" compact>
          <p>{{ item.body }}</p>
          <UiCodeBlock v-if="item.command" :code="item.command" label="Terminal" class="mt-4" />
          <template v-if="item.pending" #footer>
            <UiChip icon="clock">Link not available yet</UiChip>
          </template>
        </UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiCard, UiChip, UiCodeBlock } from '../components/ui';

// `pending` marks resources whose destination isn't published yet: they used to
// link to "#", so they say so instead of pretending to go somewhere.
const groups = [
  {
    title: 'Design resources',
    description: 'Libraries, tokens, icons and color for your design tools.',
    items: [
      { title: 'Penpot library', spot: 'references/penpot-for-beginners', pending: true, body: 'Access our Penpot component library with all design system components, patterns and styles.' },
      { title: 'Design tokens', spot: 'foundations/tokens', to: '/tokens', body: 'Download design tokens in various formats (JSON, CSS, SCSS) for use in your design tools.' },
      { title: 'Icon library', spot: 'foundations/icon-library', to: '/design-assets/icons', body: 'Browse and download icons from the Material Icons and Lucide sets.' },
      { title: 'Color palette', spot: 'foundations/color-palettes', to: '/tokens/color-palettes', body: 'Explore our color system, including accessibility guidelines and usage examples.' },
    ],
  },
  {
    title: 'Development resources',
    description: 'Packages, tooling and APIs for building with the system.',
    items: [
      { title: 'GitHub repository', spot: 'site/contribute', pending: true, body: 'Access the source code, file issues and contribute to the design system.' },
      { title: 'npm package', spot: 'site/installation', command: 'npm install @design-system/core', body: 'Install the design system package from npm.' },
      { title: 'CLI tool', spot: 'foundations/component-scaffolding-wizard', command: 'npm install -g @design-system/cli', body: 'Use our CLI tool to scaffold components, validate code and manage design tokens.' },
      { title: 'SDK and API', spot: 'site/design-system-api', to: '/api', body: 'Integrate with our REST API or use the JavaScript SDK for programmatic access.' },
      { title: 'VS Code extension', spot: 'foundations/pattern-code-snippet', pending: true, body: 'Enhance your development workflow with autocomplete, hover info and snippets.' },
      { title: 'ESLint plugin', spot: 'admin/governance', command: 'npm install eslint-plugin-design-system', body: 'Enforce design system rules and best practices in your code with our ESLint plugin.' },
    ],
  },
  {
    title: 'Learning resources',
    description: 'Tutorials, examples and places to talk with other teams.',
    items: [
      { title: 'Video tutorials', spot: 'guidelines/multimedia-animation', pending: true, body: 'Watch video tutorials covering component usage, theming and advanced patterns.' },
      { title: 'Code examples', spot: 'foundations/components', to: '/components', body: 'Browse code examples and sample implementations for common use cases.' },
      { title: 'Design system blog', spot: 'research/research-reports', pending: true, body: 'Read articles about design system best practices, updates and case studies.' },
      { title: 'Community forum', spot: 'research/hcd-council', pending: true, body: 'Join discussions, ask questions and share knowledge with other design system users.' },
    ],
  },
];
</script>
