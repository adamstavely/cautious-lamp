<template>
  <PageShell>
    <PageHero
      :back="{ to: '/getting-started', label: 'Getting started' }"
      title="Installation"
      lead="Install and configure the design system in your project. Choose the installation method that works best for your stack."
      spot="site/installation"
    />

    <PageSection title="Install the package" description="Use a package manager, or a CDN for quick prototypes.">
      <UiTabs v-model="method" :tabs="methods" label="Installation method">
        <template #npm>
          <div class="stack">
            <p class="text-ink-secondary">Install the design system package using npm:</p>
            <UiCodeBlock label="npm" code="npm install @design-system/core" />
            <p class="text-sm text-ink-muted">This will install the latest stable version of the design system.</p>
          </div>
        </template>
        <template #yarn>
          <div class="stack">
            <p class="text-ink-secondary">Install using Yarn:</p>
            <UiCodeBlock label="Yarn" code="yarn add @design-system/core" />
          </div>
        </template>
        <template #cdn>
          <div class="stack">
            <p class="text-ink-secondary">For quick prototyping or if you're not using a package manager, you can include the design system via CDN:</p>
            <UiCodeBlock label="HTML" :code="cdnCode" />
            <UiCallout tone="warning">CDN installation is not recommended for production applications.</UiCallout>
          </div>
        </template>
      </UiTabs>
    </PageSection>

    <PageSection title="Framework-specific installation" description="Packages and setup for Vue, React and Angular." divided>
      <UiTabs v-model="framework" :tabs="frameworks" label="Framework">
        <template v-for="item in frameworks" :key="item.value" #[item.value]>
          <div class="stack">
            <UiCodeBlock label="Install" :code="item.install" />
            <UiCodeBlock :label="item.setupLabel" :code="item.setup" />
          </div>
        </template>
      </UiTabs>
    </PageSection>

    <PageSection title="Configuration" description="After installation, you may need to configure the design system for your project." divided>
      <div class="stack max-w-3xl">
        <p class="text-ink-secondary">Common configuration options include:</p>
        <ul class="bullets">
          <li>Theme customization (colors, typography, spacing)</li>
          <li>Component default props and variants</li>
          <li>Internationalization (i18n) settings</li>
          <li>Accessibility preferences</li>
          <li>Build and bundling configuration</li>
        </ul>
        <p class="text-sm text-ink-secondary">
          See the
          <UiLink to="/getting-started/best-practices">best practices</UiLink>
          guide for detailed configuration examples.
        </p>
      </div>
    </PageSection>

    <PageSection title="Troubleshooting" divided>
      <template #actions>
        <UiButton to="/getting-started/support" icon="life-buoy">Contact support</UiButton>
      </template>
      <div class="grid md:grid-cols-3 gap-4">
        <UiCard v-for="issue in issues" :key="issue.title" :title="issue.title" compact>{{ issue.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref } from 'vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiCard, UiCodeBlock, UiLink, UiTabs } from '../components/ui';

const method = ref('npm');
const methods = [
  { value: 'npm', label: 'npm' },
  { value: 'yarn', label: 'Yarn' },
  { value: 'cdn', label: 'CDN' },
];

const cdnCode = `<link rel="stylesheet" href="https://cdn.design-system.com/core/latest/styles.css">
<script src="https://cdn.design-system.com/core/latest/index.js"><\/script>`;

const framework = ref('vue');
const frameworks = [
  {
    value: 'vue',
    label: 'Vue',
    install: 'npm install @design-system/vue',
    setupLabel: 'main.js',
    setup: `import { createApp } from 'vue';
import DesignSystem from '@design-system/vue';
import App from './App.vue';

const app = createApp(App);
app.use(DesignSystem);
app.mount('#app');`,
  },
  {
    value: 'react',
    label: 'React',
    install: 'npm install @design-system/react',
    setupLabel: 'JSX',
    setup: `import { Button } from '@design-system/react';

<Button variant="primary">Click me</Button>`,
  },
  {
    value: 'angular',
    label: 'Angular',
    install: 'npm install @design-system/angular',
    setupLabel: 'app.module.ts',
    setup: `import { NgModule } from '@angular/core';
import { DesignSystemModule } from '@design-system/angular';

@NgModule({ imports: [DesignSystemModule] })
export class AppModule {}`,
  },
];

const issues = [
  { title: 'Installation fails', body: "Ensure you're using a compatible Node.js version (v16 or higher). Clear your node_modules and package-lock.json, then reinstall." },
  { title: 'Components not rendering', body: "Verify that you've imported the CSS stylesheet. Check that your build process includes the design system assets." },
  { title: 'Type errors (TypeScript)', body: 'Ensure TypeScript definitions are installed. The design system includes built-in TypeScript support.' },
];
</script>

<style scoped>
.stack {
  @apply flex flex-col gap-4;
}
.bullets {
  @apply flex flex-col gap-2 pl-5 list-disc text-ink-secondary marker:text-ink-muted;
}
</style>
