<template>
  <PageShell>
    <PageHero
      :back="{ to: '/getting-started', label: 'Getting started' }"
      title="Purpose and benefits"
      lead="Discover the core purpose of our design system and the tangible benefits it brings to your team, products, and users."
      spot="site/purpose-and-benefits"
    />

    <PageSection title="Our purpose">
      <div class="prose-block">
        <p>
          The design system exists to empower teams to build exceptional digital experiences that serve our users effectively. We provide a comprehensive foundation of components, patterns, and guidelines that enable
          consistency, quality, and innovation at scale.
        </p>
        <p>
          Our purpose is to eliminate redundant work, reduce decision fatigue, and ensure that every product we build meets our high standards for accessibility, usability, and design excellence. By centralizing our
          design language, we create a shared understanding that bridges design and engineering, enabling faster iteration and better outcomes.
        </p>
      </div>
    </PageSection>

    <PageSection title="Key benefits" description="What the system gives your team, your products and your users." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="benefit in benefits" :key="benefit.title" :title="benefit.title">
          <template #media>
            <span class="feature-icon"><AppIcon :name="benefit.icon" /></span>
          </template>
          {{ benefit.body }}
        </UiCard>
      </div>
    </PageSection>

    <PageSection title="Ready to experience the benefits?" description="Start using the design system today and see how it transforms your development workflow." divided>
      <div class="flex flex-wrap gap-3">
        <UiButton variant="primary" to="/getting-started/quick-start" trailing-icon="arrow-right">Get started</UiButton>
        <UiButton to="/getting-started/adopt">Learn about adoption</UiButton>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiButton, UiCard } from '../components/ui';

const benefits = [
  {
    icon: 'zap',
    title: 'Increased efficiency',
    body: 'Reduce development time by up to 50% with pre-built, tested components. Teams can focus on solving unique problems instead of rebuilding common patterns.',
  },
  {
    icon: 'sliders-horizontal',
    title: 'Design consistency',
    body: 'Ensure visual and functional consistency across all products and platforms, creating a cohesive user experience that builds trust and reduces cognitive load.',
  },
  { icon: 'badge-check', title: 'Built-in quality', body: 'Every component includes accessibility features, performance optimizations, and best practices, ensuring quality from the start.' },
  { icon: 'handshake', title: 'Better collaboration', body: 'Create a shared language between design and engineering teams, reducing miscommunication and enabling faster iteration cycles.' },
  { icon: 'trending-up', title: 'Scalability', body: 'Scale your design and development efforts efficiently as your organization grows, with components and patterns that work across teams and products.' },
  { icon: 'piggy-bank', title: 'Cost savings', body: 'Reduce maintenance costs and technical debt by centralizing design decisions and component updates in one place.' },
];
</script>

<style scoped>
.prose-block {
  @apply max-w-3xl flex flex-col gap-4 text-lg leading-relaxed text-ink-secondary;
}

/* An icon on an accent tile, leading a card */
.feature-icon {
  @apply grid place-items-center w-11 h-11 mb-4 rounded-tile bg-accent-subtle text-xl text-accent-text;
}
</style>
