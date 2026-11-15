<template>
  <PageShell>
    <PageHero
      eyebrow="Getting started"
      title="Adopt"
      lead="Learn how to successfully adopt the design system in your organization. Follow our proven approach to implementation and adoption."
      spot="site/adopt"
    />

    <PageSection title="Adoption overview">
      <div class="prose-block">
        <p>
          Successfully adopting a design system requires careful planning, clear communication, and a phased approach. Whether you're starting fresh or migrating from existing patterns, this guide will help you navigate the adoption process effectively.
        </p>
        <p>
          Our adoption strategy is designed to minimize disruption while maximizing value. We recommend starting small, demonstrating value, and gradually expanding usage across teams and products.
        </p>
      </div>
    </PageSection>

    <PageSection title="Adoption phases" description="Four stages, from a first audit to the whole organization." divided>
      <ol class="phases">
        <li v-for="(phase, index) in phases" :key="phase.title" class="phase">
          <span class="phase-number" aria-hidden="true">{{ index + 1 }}</span>
          <div class="min-w-0">
            <h3 class="phase-title"><span class="sr-only">Phase {{ index + 1 }}: </span>{{ phase.title }}</h3>
            <p class="phase-body">{{ phase.body }}</p>
            <ul class="phase-steps">
              <li v-for="step in phase.steps" :key="step">{{ step }}</li>
            </ul>
          </div>
        </li>
      </ol>
    </PageSection>

    <PageSection title="Adoption best practices" description="What helps adoption stick." divided>
      <div class="grid sm:grid-cols-2 gap-4">
        <UiCard v-for="practice in practices" :key="practice.title" :title="practice.title" :spot="practice.spot" compact>{{ practice.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection
      title="Ready to start adopting?"
      description="Begin your adoption journey today with our guides and resources."
      divided
    >
      <div class="flex flex-wrap gap-3">
        <UiButton variant="primary" to="/getting-started/quick-start" trailing-icon="arrow-right">Start the quick start guide</UiButton>
        <UiButton to="/getting-started/get-in-touch" icon="headset">Get adoption support</UiButton>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiButton, UiCard } from '../components/ui';

const phases = [
  {
    title: 'Discovery and planning',
    body: 'Understand your current state, identify opportunities, and create an adoption roadmap tailored to your organization.',
    steps: ['Audit existing components and patterns', 'Identify key stakeholders and champions', 'Define success metrics and goals', 'Create a phased rollout plan'],
  },
  {
    title: 'Pilot program',
    body: 'Start with a small pilot project to validate the approach, gather feedback, and demonstrate value.',
    steps: ['Select a pilot team or project', 'Set up the development environment', 'Build initial components or features', 'Collect feedback and measure impact'],
  },
  {
    title: 'Team expansion',
    body: 'Expand adoption to additional teams, providing training and support as you scale.',
    steps: ['Conduct training sessions', 'Establish design system governance', 'Create internal documentation', 'Set up support channels'],
  },
  {
    title: 'Organization-wide adoption',
    body: 'Scale adoption across the entire organization, establishing the design system as the standard.',
    steps: ['Migrate existing products', 'Establish the design system as the default', 'Create ongoing maintenance processes', 'Measure and optimize adoption metrics'],
  },
];

const practices = [
  { title: 'Build champions', spot: 'research/hcd-council', body: 'Identify and empower design system champions across teams who can advocate for adoption and help others get started.' },
  { title: 'Provide training', spot: 'site/quick-start', body: 'Offer training sessions, workshops, and documentation to help teams understand and use the design system effectively.' },
  { title: 'Gather feedback', spot: 'site/roadmap-feedback', body: 'Continuously collect feedback from teams using the design system and iterate based on their needs and experiences.' },
  { title: 'Measure success', spot: 'foundations/data-viz', body: 'Track adoption metrics, usage patterns, and impact to demonstrate value and identify areas for improvement.' },
];
</script>

<style scoped>
.prose-block {
  @apply flex flex-col gap-4 max-w-3xl text-base leading-relaxed text-ink-secondary;
}

/* Numbered phases */
.phases {
  @apply flex flex-col gap-4;
}
.phase {
  @apply flex items-start gap-4 rounded-card border border-line bg-surface-raised p-6;
}
.phase-number {
  @apply flex-none grid place-items-center w-10 h-10 rounded-pill bg-accent-subtle text-base font-semibold text-accent-text;
}
.phase-title {
  @apply mb-1.5 text-lg font-semibold text-ink-strong;
}
.phase-body {
  @apply mb-3 text-sm leading-relaxed text-ink-secondary;
}
.phase-steps {
  @apply list-disc pl-5 flex flex-col gap-1 text-sm leading-relaxed text-ink-secondary marker:text-ink-muted;
}
</style>
