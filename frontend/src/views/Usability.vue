<template>
  <PageShell>
    <PageHero
      :back="{ to: '/getting-started', label: 'Getting started' }"
      title="Usability"
      lead="Create interfaces that are intuitive, efficient, and accessible. Usability ensures users can accomplish their goals with ease and satisfaction."
      spot="research/usability"
    />

    <PageSection title="Usability principles" description="Usability is about making interfaces easy to learn, efficient to use, and satisfying for users. Our design system incorporates usability best practices throughout.">
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
    title: 'Learnability',
    icon: 'graduation-cap',
    body: 'Interfaces should be easy to learn for new users. Use familiar patterns, clear labels, and helpful guidance to reduce the learning curve.',
  },
  {
    title: 'Efficiency',
    icon: 'zap',
    body: 'Once learned, interfaces should allow users to accomplish tasks quickly. Optimize workflows, reduce steps, and provide shortcuts for experienced users.',
  },
  {
    title: 'Memorability',
    icon: 'brain',
    body: 'Users should be able to remember how to use the interface after a period of not using it. Consistent patterns and clear visual hierarchy aid memorability.',
  },
  {
    title: 'Error prevention and recovery',
    icon: 'undo-2',
    body: 'Design to prevent errors and provide clear paths to recovery when errors occur. Validation, confirmation dialogs, and undo functionality improve usability.',
  },
  {
    title: 'Satisfaction',
    icon: 'smile',
    body: 'Users should find the interface pleasant and satisfying to use. Thoughtful design, smooth interactions, and positive feedback contribute to user satisfaction.',
  },
];

const otherFoundations = [
  { title: 'Atomic design', to: '/getting-started/foundations/atomic-design', spot: 'site/atomic-design', body: 'Build interfaces from atoms up to full pages.' },
  { title: 'Building trust', to: '/getting-started/foundations/building-trust', spot: 'site/building-trust', body: 'Earn trust with consistent, clear, reliable interactions.' },
  { title: 'Responsiveness', to: '/getting-started/foundations/responsiveness', spot: 'site/responsiveness', body: 'Adapt layouts to every device and screen size.' },
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
