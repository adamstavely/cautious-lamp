<template>
  <PageShell>
    <PageHero
      eyebrow="Getting started"
      title="Design principles"
      lead="The core principles that guide our design decisions and ensure we create extraordinary experiences for all users."
      spot="principles/design-principles"
    />

    <PageSection title="Why they matter">
      <p class="mission">The user experience of our capabilities directly impacts the success of the mission.</p>
    </PageSection>

    <PageSection title="Our principles" description="Five commitments, and what each one means in practice." divided>
      <ol class="principles">
        <li v-for="principle in principles" :key="principle.title" class="principle">
          <SpotArt :name="principle.art" size="lg" />
          <div class="min-w-0">
            <h3 class="principle-title">{{ principle.title }}</h3>
            <p class="principle-label">What this means</p>
            <ul class="principle-list">
              <li v-for="point in principle.points" :key="point">{{ point }}</li>
            </ul>
          </div>
        </li>
      </ol>
    </PageSection>

    <PageSection title="Explore design themes" description="Actionable themes that expand on these principles and guide day-to-day design decisions." divided>
      <UiButton variant="primary" to="/getting-started/themes" trailing-icon="arrow-right">View design themes</UiButton>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, SpotArt, UiButton } from '../components/ui';

const principles = [
  {
    title: 'A user-centric organization',
    art: 'principles/user-centric',
    points: [
      'Our users are the experts; we listen to, conduct research with, collaborate, and explore their needs, pain points, and goals, early and often.',
      'We are driven to meet users and mission where they are, providing extraordinary experiences regardless of geographic location.',
    ],
  },
  {
    title: 'Utilize data-informed design processes',
    art: 'principles/data-informed',
    points: [
      'Our design decisions are directly informed by user feedback; we acknowledge design mistakes and communicate decisions transparently with stakeholders.',
      'We leverage industry-leading qualitative and quantitative mechanisms to gain user insights, continuously iterating based on feedback and results.',
    ],
  },
  {
    title: 'Design for all people and abilities',
    art: 'principles/design-for-all',
    points: [
      'Accessibility is foundational to the development process, integrated from the beginning to ensure our capabilities work for everyone.',
      'We understand our users come from a wide variety of experiences and demographics; we don’t just build for the “average” user.',
    ],
  },
  {
    title: 'Create consistent, integrated experiences',
    art: 'principles/consistent-and-integrated',
    points: [
      'We intentionally work across organizational bounds to ensure our capabilities work together, engaging mission partners to provide expertise in their fields.',
      'Our capabilities are living products, flexible and enduring, accounting for shifting mission priorities, security requirements, and user needs.',
    ],
  },
  {
    title: 'Raise the expectation for digital capabilities',
    art: 'principles/raise-expectations',
    points: [
      'We understand that people’s experiences with well-designed products can change their perception of engaging with Enterprise IT service providers.',
      'Our role as a service provider compels us to set the standard and train mission partners on best practices for designing capabilities.',
    ],
  },
];
</script>

<style scoped>
.mission {
  @apply max-w-3xl text-xl md:text-2xl font-semibold leading-snug text-ink-strong;
}
.principles {
  @apply flex flex-col gap-4;
}
.principle {
  @apply flex flex-col sm:flex-row gap-6 rounded-card border border-line bg-surface-raised p-6;
}
.principle-title {
  @apply mb-3 text-xl font-semibold text-ink-strong;
}
.principle-label {
  @apply mb-2 text-sm font-medium text-ink-muted;
}
.principle-list {
  @apply flex flex-col gap-2 pl-5 list-disc leading-relaxed text-ink-secondary;
}
</style>
