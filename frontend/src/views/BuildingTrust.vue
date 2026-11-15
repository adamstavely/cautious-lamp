<template>
  <PageShell>
    <PageHero
      :back="{ to: '/getting-started', label: 'Getting started' }"
      title="Building trust"
      lead="Trust is the foundation of great user experiences. Learn how to build trust through consistent design, clear communication, and reliable interactions."
      spot="site/building-trust"
    />

    <PageSection title="Principles of building trust" description="Trust is earned through consistent, reliable, and transparent interactions. Our design system helps you build trust by providing predictable patterns and clear communication.">
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
    title: 'Consistency',
    icon: 'repeat',
    body: 'Consistent design patterns create familiarity and predictability. When users know what to expect, they feel more confident and trusting of your interface.',
  },
  {
    title: 'Transparency',
    icon: 'eye',
    body: 'Clear communication about actions, states, and outcomes builds trust. Users should always understand what\'s happening and what will happen next.',
  },
  {
    title: 'Reliability',
    icon: 'badge-check',
    body: 'Interfaces that work consistently and handle errors gracefully demonstrate reliability. Users trust systems that they can depend on.',
  },
  {
    title: 'Security and privacy',
    icon: 'lock',
    body: 'Visual indicators of security and clear privacy policies help users feel safe. Trust is built when users know their data and interactions are protected.',
  },
];

const otherFoundations = [
  { title: 'Atomic design', to: '/getting-started/foundations/atomic-design', spot: 'site/atomic-design', body: 'Build interfaces from atoms up to full pages.' },
  { title: 'Responsiveness', to: '/getting-started/foundations/responsiveness', spot: 'site/responsiveness', body: 'Adapt layouts to every device and screen size.' },
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
