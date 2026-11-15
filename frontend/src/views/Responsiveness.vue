<template>
  <PageShell>
    <PageHero
      :back="{ to: '/getting-started', label: 'Getting started' }"
      title="Responsiveness"
      lead="Create interfaces that adapt seamlessly across all devices and screen sizes. Our responsive design system ensures optimal experiences from mobile to desktop."
      spot="site/responsiveness"
    />

    <PageSection title="Responsive design principles" description="Responsive design ensures your interface works beautifully across all devices. Our design system provides breakpoints, flexible layouts, and adaptive components.">
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
    title: 'Mobile-first approach',
    icon: 'smartphone',
    body: 'Start with mobile designs and progressively enhance for larger screens. This approach ensures core functionality works on all devices and improves performance.',
  },
  {
    title: 'Flexible layouts',
    icon: 'layout-grid',
    body: 'Use flexible grids and containers that adapt to different screen sizes. Our spacing system and layout components automatically adjust to available space.',
  },
  {
    title: 'Breakpoint system',
    icon: 'ruler',
    body: 'Our standardized breakpoints ensure consistent responsive behavior across all components. Use these breakpoints to create layouts that adapt at key screen sizes.',
  },
  {
    title: 'Touch-friendly interactions',
    icon: 'hand',
    body: 'Design interactions that work well on touch devices. Ensure buttons and interactive elements are appropriately sized and spaced for touch targets.',
  },
];

const otherFoundations = [
  { title: 'Atomic design', to: '/getting-started/foundations/atomic-design', spot: 'site/atomic-design', body: 'Build interfaces from atoms up to full pages.' },
  { title: 'Building trust', to: '/getting-started/foundations/building-trust', spot: 'site/building-trust', body: 'Earn trust with consistent, clear, reliable interactions.' },
  { title: 'Usability', to: '/getting-started/foundations/usability', spot: 'research/usability', body: 'Make interfaces easy to learn, efficient and satisfying.' },
  { title: 'Writing and content', to: '/getting-started/foundations/writing-content', spot: 'site/writing-content', body: 'Write clear, concise copy that guides users.' },
];
</script>

<style scoped>
.foundation-grid {
  @apply grid gap-4 sm:grid-cols-2;
}
.foundation-icon {
  @apply inline-flex items-center justify-center w-10 h-10 mb-4 rounded-control bg-accent-subtle text-accent-text text-xl;
}
.foundation-links {
  @apply grid gap-x-8 gap-y-4 sm:grid-cols-2;
}
</style>
