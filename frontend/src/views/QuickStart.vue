<template>
  <PageShell>
    <PageHero
      :back="{ to: '/getting-started', label: 'Getting started' }"
      title="Quick start"
      lead="Get up and running with the design system in minutes. Follow these steps to start building with our components, tokens, and patterns."
      spot="site/quick-start"
    />

    <PageSection title="Four steps to your first component">
      <ol class="steps">
        <li class="step">
          <div class="step-content">
            <h3 class="step-title">Install the design system</h3>
            <p class="step-body">Install the design system package in your project using npm or Yarn.</p>
            <UiTabs v-model="manager" :tabs="managers" label="Package manager">
              <template #npm><UiCodeBlock label="npm" code="npm install @design-system/core" /></template>
              <template #yarn><UiCodeBlock label="Yarn" code="yarn add @design-system/core" /></template>
            </UiTabs>
            <p><UiLink to="/getting-started/installation" arrow>View the detailed installation guide</UiLink></p>
          </div>
        </li>

        <li class="step">
          <div class="step-content">
            <h3 class="step-title">Import components</h3>
            <p class="step-body">Import the components and styles you need in your application.</p>
            <UiCodeBlock label="JavaScript" :code="importCode" />
          </div>
        </li>

        <li class="step">
          <div class="step-content">
            <h3 class="step-title">Start building</h3>
            <p class="step-body">Use components in your application. Here's a simple example:</p>
            <UiCodeBlock label="Template" :code="buildCode" />
            <p><UiLink to="/components" arrow>Browse all components</UiLink></p>
          </div>
        </li>

        <li class="step">
          <div class="step-content">
            <h3 class="step-title">Use design tokens</h3>
            <p class="step-body">Access design tokens for colors, spacing, typography, and more in your styles.</p>
            <UiCodeBlock label="JavaScript" :code="tokenCode" />
            <p><UiLink to="/tokens" arrow>Explore design tokens</UiLink></p>
          </div>
        </li>
      </ol>
    </PageSection>

    <PageSection title="Next steps" divided>
      <div class="grid md:grid-cols-2 gap-4">
        <UiPanel v-for="group in nextSteps" :key="group.title" :title="group.title" heading-tag="h3">
          <ul class="flex flex-col gap-1">
            <li v-for="link in group.links" :key="link.to">
              <UiLink :to="link.to" arrow>{{ link.label }}</UiLink>
            </li>
          </ul>
        </UiPanel>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref } from 'vue';
import { PageHero, PageSection, PageShell, UiCodeBlock, UiLink, UiPanel, UiTabs } from '../components/ui';

const manager = ref('npm');
const managers = [
  { value: 'npm', label: 'npm' },
  { value: 'yarn', label: 'Yarn' },
];

const importCode = `import { Button, Card, Input } from '@design-system/core';
import '@design-system/core/dist/styles.css';`;

const buildCode = `<Button variant="primary">
  Click me
</Button>`;

// Numeric token keys need bracket access in JavaScript
const tokenCode = `import { tokens } from '@design-system/core';

const styles = {
  color: tokens.color.indigo[600],
  padding: tokens.spacing[4],
};`;

const nextSteps = [
  {
    title: 'Learn more',
    links: [
      { to: '/getting-started/principles', label: 'Design principles' },
      { to: '/getting-started/best-practices', label: 'Best practices' },
      { to: '/components', label: 'Component library' },
    ],
  },
  {
    title: 'Get help',
    links: [
      { to: '/getting-started/support', label: 'Support and help' },
      { to: '/getting-started/resources', label: 'Resources' },
      { to: '/getting-started/contribute', label: 'Contribute' },
    ],
  },
];
</script>

<style scoped>
/* Numbered steps down a rail */
.steps {
  @apply flex flex-col gap-10;
  counter-reset: step;
}
.step {
  @apply flex gap-5;
  counter-increment: step;
}
.step::before {
  @apply flex-none grid place-items-center w-10 h-10 rounded-pill bg-accent text-base font-semibold text-ink-on-accent;
  content: counter(step);
}
.step-content {
  @apply min-w-0 flex-1 flex flex-col gap-4;
}
.step-title {
  @apply pt-1.5 text-xl font-semibold text-ink-strong;
}
.step-body {
  @apply text-ink-secondary;
}
</style>
