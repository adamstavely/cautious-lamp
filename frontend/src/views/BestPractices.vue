<template>
  <PageShell>
    <PageHero
      eyebrow="Getting started"
      title="Best practices"
      lead="Recommended practices for using the design system effectively. Follow these guidelines to ensure consistency, accessibility, and maintainability."
      spot="site/best-practices"
    />

    <PageSection title="Use design tokens" description="Always use design tokens instead of hardcoded values. This keeps products consistent and makes it easier to update the design system globally.">
      <div class="grid md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-3">
          <div><UiChip tone="danger" icon="circle-x">Don’t</UiChip></div>
          <UiCodeBlock label="Hardcoded values" :code="tokensDont" />
        </div>
        <div class="flex flex-col gap-3">
          <div><UiChip tone="success" icon="circle-check">Do</UiChip></div>
          <UiCodeBlock label="Design tokens" :code="tokensDo" />
        </div>
      </div>
    </PageSection>

    <PageSection title="More practices" description="Habits that keep products accessible, fast, consistent and current." divided>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="practice in practices" :key="practice.title">
          <AppIcon :name="practice.icon" class="practice-icon" />
          <h3 class="practice-title">{{ practice.title }}</h3>
          <p class="mb-3">{{ practice.body }}</p>
          <ul class="practice-list">
            <li v-for="item in practice.items" :key="item">{{ item }}</li>
          </ul>
        </UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { AppIcon, PageHero, PageSection, PageShell, UiCard, UiChip, UiCodeBlock } from '../components/ui';

const tokensDont = ['color: #6366f1;', 'padding: 16px;', 'font-size: 14px;'].join('\n');
const tokensDo = ['color: tokens.color.text.accent;', 'padding: tokens.spacing.4;', 'font-size: tokens.typography.size.sm;'].join('\n');

const practices = [
  {
    title: 'Use existing components',
    icon: 'blocks',
    body: 'Before building custom components, check whether the design system already provides what you need. Customize with props and variants rather than creating new ones.',
    items: [
      'Browse the component library first',
      'Use component variants and props for customization',
      'Compose existing components to create new patterns',
      'Propose new components if there’s a clear gap',
    ],
  },
  {
    title: 'Prioritize accessibility',
    icon: 'accessibility',
    body: 'All components are built with accessibility in mind, but you must use them correctly.',
    items: [
      'Always provide labels for form inputs',
      'Use semantic HTML elements',
      'Ensure keyboard navigation works',
      'Maintain proper color contrast ratios',
      'Test with screen readers',
      'Provide alternative text for images',
    ],
  },
  {
    title: 'Optimize for performance',
    icon: 'gauge',
    body: 'Keep your applications fast and efficient.',
    items: [
      'Import only the components you need (tree-shaking)',
      'Lazy load components when possible',
      'Optimize images and assets',
      'Monitor bundle size',
      'Use code splitting for large applications',
    ],
  },
  {
    title: 'Maintain consistency',
    icon: 'layout-grid',
    body: 'Consistency is key to a great user experience.',
    items: [
      'Use consistent spacing and typography',
      'Follow established patterns and layouts',
      'Maintain consistent interaction patterns',
      'Use the same component variants across similar contexts',
      'Document any deviations from standard patterns',
    ],
  },
  {
    title: 'Stay up to date',
    icon: 'refresh-ccw',
    body: 'Keep your design system version current and plan for updates.',
    items: [
      'Regularly update to the latest stable version',
      'Review changelogs before upgrading',
      'Test updates in a development environment first',
      'Plan migration for breaking changes',
      'Subscribe to release notifications',
    ],
  },
  {
    title: 'Test thoroughly',
    icon: 'flask-conical',
    body: 'Make sure your implementations work correctly.',
    items: [
      'Write unit tests for custom implementations',
      'Test across different browsers and devices',
      'Verify accessibility with automated and manual testing',
      'Test with real users when possible',
      'Use visual regression testing for UI changes',
    ],
  },
];
</script>

<style scoped>
.practice-icon {
  @apply mb-3 text-2xl text-accent-text;
}
.practice-title {
  @apply mb-1.5 text-lg font-semibold text-ink-strong;
}
.practice-list {
  @apply flex flex-col gap-1.5 pl-5 list-disc;
}
</style>
