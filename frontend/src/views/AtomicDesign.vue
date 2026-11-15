<template>
  <PageShell>
    <PageHero
      :back="{ to: '/getting-started', label: 'Getting started' }"
      title="Atomic design"
      lead="Build interfaces systematically using atomic design principles. Create reusable components from the smallest atoms to complete page templates."
      spot="site/atomic-design"
    />

    <PageSection title="Understanding atomic design" description="Atomic design is a methodology for creating design systems. It breaks interfaces down into fundamental building blocks that can be combined to create more complex components.">
      <ul class="foundation-grid">
        <li v-for="item in principles" :key="item.title">
          <UiCard :title="item.title" class="h-full">
            <template #media>
              <span class="foundation-icon"><AppIcon :name="item.icon" /></span>
            </template>
            {{ item.body }}
          </UiCard>
        </li>
      </ul>
    </PageSection>

    <PageSection title="More foundations" description="The other principles the design system is built on." divided>
      <div class="foundation-links">
        <UiLinkRow v-for="page in otherFoundations" :key="page.to" :to="page.to" :title="page.title" :body="page.body" :spot="page.spot" />
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiCard, UiLinkRow } from '../components/ui';

const principles = [
  {
    title: 'Atoms',
    icon: 'atom',
    body: 'The smallest building blocks of our design system. These include buttons, inputs, labels, and other basic HTML elements that cannot be broken down further.',
  },
  {
    title: 'Molecules',
    icon: 'shapes',
    body: 'Simple combinations of atoms that form functional units. Examples include form fields with labels, search bars, and navigation items.',
  },
  {
    title: 'Organisms',
    icon: 'blocks',
    body: 'Complex components made from molecules and atoms. These include headers, forms, card groups, and other substantial interface sections.',
  },
  {
    title: 'Templates',
    icon: 'layout-template',
    body: 'Page-level objects that combine organisms to create the structure of a page. Templates focus on content structure rather than final content.',
  },
  {
    title: 'Pages',
    icon: 'app-window',
    body: 'Specific instances of templates with real content. Pages are what users interact with and are essential for testing the effectiveness of the design system.',
  },
];

const otherFoundations = [
  { title: 'Building trust', to: '/getting-started/foundations/building-trust', spot: 'site/building-trust', body: 'Earn trust with consistent, clear, reliable interactions.' },
  { title: 'Responsiveness', to: '/getting-started/foundations/responsiveness', spot: 'site/responsiveness', body: 'Adapt layouts to every device and screen size.' },
  { title: 'Usability', to: '/getting-started/foundations/usability', spot: 'research/usability', body: 'Make interfaces easy to learn, efficient and satisfying.' },
  { title: 'Writing and content', to: '/getting-started/foundations/writing-content', spot: 'site/writing-content', body: 'Write clear, concise copy that guides users.' },
];
</script>

<style scoped>
.foundation-grid {
  @apply grid gap-4 sm:grid-cols-2 lg:grid-cols-3;
}
.foundation-icon {
  @apply inline-flex items-center justify-center w-10 h-10 mb-4 rounded-control bg-accent-subtle text-accent-text text-xl;
}
.foundation-links {
  @apply grid gap-x-8 gap-y-4 sm:grid-cols-2;
}
</style>
