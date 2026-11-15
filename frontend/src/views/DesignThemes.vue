<template>
  <PageShell>
    <PageHero
      eyebrow="Getting started"
      title="Design themes"
      lead="Actionable design themes that expand on our principles. They guide day-to-day design decisions and help teams create consistent, user-centered experiences."
      spot="foundations/design-themes"
    />

    <PageSection title="What a theme is">
      <p class="intro">
        Design themes are specific, actionable guidelines that expand on our core principles. They provide concrete direction for design decisions,
        helping teams create experiences that are user-centric, accessible, consistent, and exceptional. Each theme connects to one or more of our
        design principles and offers practical guidance for implementation.
      </p>
    </PageSection>

    <PageSection v-for="group in groups" :key="group.title" :title="group.title" :description="group.principle" divided>
      <div class="grid md:grid-cols-2 gap-4">
        <UiCard v-for="theme in group.themes" :key="theme.title" :title="theme.title">
          <p class="mb-4">{{ theme.body }}</p>
          <p class="practices-label">Practices</p>
          <ul class="practices">
            <li v-for="practice in theme.practices" :key="practice">{{ practice }}</li>
          </ul>
        </UiCard>
      </div>
    </PageSection>

    <PageSection title="Built on design principles" description="These themes expand on our core design principles. Review the principles that guide all our design decisions." divided>
      <UiButton variant="primary" to="/getting-started/principles" trailing-icon="arrow-right">View design principles</UiButton>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiButton, UiCard } from '../components/ui';

const groups = [
  {
    title: 'User-centric themes',
    principle: 'From the principle: a user-centric organization.',
    themes: [
      {
        title: 'Research-driven design',
        body: 'Every design decision should be informed by user research, not assumptions. Conduct research early and often throughout the design process.',
        practices: [
          'Conduct user interviews and usability testing before, during, and after design',
          'Use quantitative data to validate qualitative insights',
          'Document research findings and make them accessible to the team',
          'Prioritize user needs over personal preferences or assumptions',
        ],
      },
      {
        title: 'Meet users where they are',
        body: 'Design experiences that accommodate users’ contexts, constraints, and environments, whether they’re in an office, in the field, or working remotely.',
        practices: [
          'Design for multiple devices and screen sizes',
          'Consider network conditions and offline capabilities',
          'Account for different work environments and contexts',
          'Provide flexible workflows that adapt to user preferences',
        ],
      },
    ],
  },
  {
    title: 'Data-informed themes',
    principle: 'From the principle: utilize data-informed design processes.',
    themes: [
      {
        title: 'Transparent decision-making',
        body: 'Acknowledge when designs don’t work as expected and communicate the reasoning behind decisions to stakeholders and users.',
        practices: [
          'Document design decisions and the data that informed them',
          'Share learnings from failed experiments with the team',
          'Be honest about limitations and trade-offs',
          'Create feedback loops for continuous improvement',
        ],
      },
      {
        title: 'Continuous iteration',
        body: 'Use qualitative and quantitative data to continuously improve designs. No design is ever “done”: it evolves based on user feedback and changing needs.',
        practices: [
          'Set up analytics and monitoring from day one',
          'Regularly review user feedback and usage patterns',
          'Plan for iterative releases rather than big-bang launches',
          'Use A/B testing and experimentation to validate improvements',
        ],
      },
    ],
  },
  {
    title: 'Design for all themes',
    principle: 'From the principle: design for all people and abilities.',
    themes: [
      {
        title: 'Accessibility first',
        body: 'Accessibility is not an afterthought. It’s integrated into every stage of the design and development process, ensuring our capabilities work for everyone.',
        practices: [
          'Test with assistive technologies throughout development',
          'Ensure WCAG 2.1 AA compliance as a minimum standard',
          'Design keyboard-accessible interfaces',
          'Provide alternative text, captions, and transcripts',
          'Use semantic HTML and ARIA attributes appropriately',
        ],
      },
      {
        title: 'Inclusive by design',
        body: 'Design for the full spectrum of human diversity: different abilities, backgrounds, experiences, and contexts. Don’t design for an “average” user that doesn’t exist.',
        practices: [
          'Include diverse users in research and testing',
          'Consider cultural, linguistic, and regional differences',
          'Design for various technical skill levels',
          'Provide multiple ways to accomplish tasks',
          'Use inclusive language and imagery',
        ],
      },
    ],
  },
  {
    title: 'Consistent, integrated themes',
    principle: 'From the principle: create consistent, integrated experiences.',
    themes: [
      {
        title: 'Cross-organizational collaboration',
        body: 'Work across organizational boundaries to ensure capabilities work together seamlessly. Engage mission partners to leverage their domain expertise.',
        practices: [
          'Establish shared design patterns and components',
          'Create clear APIs and integration points',
          'Document integration requirements and guidelines',
          'Regularly sync with partner teams on design decisions',
        ],
      },
      {
        title: 'Living products',
        body: 'Design flexible, enduring systems that can adapt to shifting mission priorities, security requirements, and user needs without requiring complete redesigns.',
        practices: [
          'Build modular, composable components',
          'Design for extensibility and customization',
          'Plan for versioning and migration paths',
          'Create flexible layouts that adapt to content',
          'Document deprecation policies and upgrade paths',
        ],
      },
    ],
  },
  {
    title: 'Raise expectations themes',
    principle: 'From the principle: raise the expectation for digital capabilities.',
    themes: [
      {
        title: 'Exceptional experiences',
        body: 'Well-designed products can transform how people perceive Enterprise IT. Every interaction should feel polished, thoughtful, and delightful, not just functional.',
        practices: [
          'Pay attention to micro-interactions and transitions',
          'Use thoughtful animations that enhance understanding',
          'Provide clear, helpful feedback for all user actions',
          'Design for emotional connection, not just efficiency',
          'Polish details that show care and attention',
        ],
      },
      {
        title: 'Setting the standard',
        body: 'As a service provider, we have a responsibility to set the standard for digital capabilities and train mission partners on design best practices.',
        practices: [
          'Document and share design patterns and best practices',
          'Provide training and resources for mission partners',
          'Create reusable components and templates',
          'Establish design review processes and guidelines',
          'Lead by example in all design work',
        ],
      },
    ],
  },
];
</script>

<style scoped>
.intro {
  @apply max-w-3xl text-lg leading-relaxed text-ink-secondary;
}
.practices-label {
  @apply mb-2 font-medium text-ink-muted;
}
.practices {
  @apply flex flex-col gap-1.5 pl-5 list-disc;
}
</style>
