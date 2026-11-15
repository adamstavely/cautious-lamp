<template>
  <PageShell>
    <PageHero
      :back="{ to: '/getting-started', label: 'Getting started' }"
      title="Why a design system?"
      lead="A design system is more than a collection of components—it's a shared language that enables teams to build better products faster, while ensuring consistency and quality at scale."
      spot="site/why-design-system"
    />

    <PageSection title="Our philosophy">
      <div class="prose-block">
        <p>
          A design system is a living, breathing foundation that empowers teams to create extraordinary digital experiences. It's not just about consistency—it's about enabling innovation, reducing friction, and
          ensuring that every interaction we build serves our users and mission effectively.
        </p>
        <p>
          We believe that great design systems don't constrain creativity—they amplify it. By providing a shared vocabulary, reusable components, and clear guidelines, we free teams to focus on solving real problems
          rather than reinventing the wheel. This system is built for scale, designed for collaboration, and committed to accessibility and excellence.
        </p>
      </div>
    </PageSection>

    <PageSection title="The value of a design system" description="What teams gain when they build on shared foundations." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="benefit in benefits" :key="benefit.title" :title="benefit.title">
          <template #media>
            <span class="feature-icon"><AppIcon :name="benefit.icon" /></span>
          </template>
          {{ benefit.body }}
        </UiCard>
      </div>
    </PageSection>

    <PageSection title="What makes this system different" divided>
      <ul class="traits">
        <li v-for="trait in traits" :key="trait.title" class="trait">
          <span class="feature-icon"><AppIcon :name="trait.icon" /></span>
          <div class="min-w-0">
            <h3 class="trait-title">{{ trait.title }}</h3>
            <p class="trait-body">{{ trait.body }}</p>
          </div>
        </li>
      </ul>
    </PageSection>

    <PageSection title="Ready to get started?" description="Explore our design principles, components, and patterns to begin building with the design system." divided>
      <div class="flex flex-wrap gap-3">
        <UiButton variant="primary" to="/getting-started/principles" trailing-icon="arrow-right">View design principles</UiButton>
        <UiButton to="/components">Browse components</UiButton>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiButton, UiCard } from '../components/ui';

const benefits = [
  { icon: 'gauge', title: 'Build faster', body: 'Pre-built components and patterns mean less time spent on repetitive tasks. Teams can ship features faster while maintaining quality and consistency.' },
  { icon: 'layout-grid', title: 'Ensure consistency', body: 'Shared components and design tokens create a unified experience across all products and platforms, building trust and reducing cognitive load for users.' },
  { icon: 'badge-check', title: 'Maintain quality', body: 'Built-in accessibility, performance optimizations, and best practices ensure that every component meets our high standards from day one.' },
  { icon: 'users-round', title: 'Enable collaboration', body: 'A shared language and common components break down silos between design and engineering, enabling seamless collaboration and faster iteration.' },
  {
    icon: 'trending-up',
    title: 'Scale with confidence',
    body: 'As your organization grows, the design system scales with you. New teams can onboard quickly, and existing teams can maintain consistency across expanding product portfolios.',
  },
  { icon: 'lightbulb', title: 'Focus on innovation', body: 'By handling the fundamentals, the design system frees teams to focus on solving unique problems and creating innovative solutions that matter.' },
];

const traits = [
  {
    icon: 'user',
    title: 'User-centric by design',
    body: "Every component, pattern, and guideline is informed by real user research and testing. We don't design in a vacuum—we design with and for our users, ensuring that every element serves a real need and solves a real problem.",
  },
  {
    icon: 'accessibility',
    title: 'Accessibility built in',
    body: "Accessibility isn't an afterthought—it's foundational. Every component meets WCAG 2.1 AA standards, ensuring that our capabilities work for everyone, regardless of ability or context.",
  },
  {
    icon: 'refresh-cw',
    title: 'Living and evolving',
    body: 'This system is not static. It evolves based on user feedback, changing needs, and new technologies. We continuously iterate, improve, and expand the system to serve our mission better.',
  },
  {
    icon: 'flag',
    title: 'Mission-aligned',
    body: 'The user experience of our capabilities directly impacts the success of the mission. This system is designed to support that mission by enabling teams to build exceptional experiences that serve users effectively, regardless of geographic location or context.',
  },
];
</script>

<style scoped>
.prose-block {
  @apply max-w-3xl flex flex-col gap-4 text-lg leading-relaxed text-ink-secondary;
}

/* An icon on an accent tile, leading a card or list item */
.feature-icon {
  @apply flex-none grid place-items-center w-11 h-11 mb-4 rounded-tile bg-accent-subtle text-xl text-accent-text;
}

.traits {
  @apply grid md:grid-cols-2 gap-x-10 gap-y-8;
}
.trait {
  @apply flex gap-4;
}
.trait-title {
  @apply mb-1.5 text-lg font-semibold text-ink-strong;
}
.trait-body {
  @apply text-sm leading-relaxed text-ink-secondary;
}
</style>
