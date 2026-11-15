<template>
  <PageShell>
    <PageHero
      eyebrow="Getting started"
      title="Improving UX through acquisition"
      lead="Learn how strategic design system adoption and user acquisition strategies work together to create exceptional user experiences that drive engagement and growth."
      spot="research/improving-ux-through-acquisition"
    />

    <PageSection title="The connection between UX and acquisition">
      <div class="prose-block">
        <p>
          User experience and user acquisition are deeply interconnected. A well-designed, consistent experience not only improves user satisfaction but also drives acquisition through word-of-mouth, reduced friction, and increased engagement. By adopting a design system, you create a foundation for exceptional UX that naturally supports acquisition goals.
        </p>
        <p>
          When users have positive experiences with your products, they're more likely to return, recommend your services, and become advocates. A design system ensures that every touchpoint delivers on this promise, creating a cohesive experience that builds trust and drives growth.
        </p>
      </div>
    </PageSection>

    <PageSection title="Key strategies" description="Where the design system moves acquisition." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="strategy in strategies" :key="strategy.title" :title="strategy.title" :spot="strategy.spot" compact>{{ strategy.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Implementation tips" description="Where to focus first." divided>
      <ul class="tips">
        <li v-for="tip in tips" :key="tip.title" class="tip">
          <span class="tip-icon" aria-hidden="true"><AppIcon :name="tip.icon" /></span>
          <div class="min-w-0">
            <h3 class="tip-title">{{ tip.title }}</h3>
            <p class="tip-body">{{ tip.body }}</p>
          </div>
        </li>
      </ul>
    </PageSection>

    <PageSection
      title="Start improving UX and acquisition today"
      description="Begin using the design system to create experiences that both delight users and drive acquisition."
      divided
    >
      <div class="flex flex-wrap gap-3">
        <UiButton variant="primary" to="/getting-started/adopt" trailing-icon="arrow-right">Learn about adoption</UiButton>
        <UiButton to="/components" icon="blocks">Explore components</UiButton>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiButton, UiCard } from '../components/ui';

const strategies = [
  { title: 'Optimize first impressions', spot: 'laws/aesthetic-usability-effect', body: 'Use design system components to create polished, professional first experiences that immediately communicate quality and build trust with new users.' },
  { title: 'Reduce friction', spot: 'laws/cognitive-load', body: 'Streamline user flows with consistent, well-tested components that reduce cognitive load and eliminate unnecessary steps in the acquisition process.' },
  { title: 'Ensure cross-platform consistency', spot: 'site/responsiveness', body: 'Deliver consistent experiences across all platforms and devices, ensuring users have a seamless experience regardless of how they access your products.' },
  { title: 'Build trust through quality', spot: 'site/building-trust', body: 'High-quality, accessible components demonstrate attention to detail and care for users, building trust that encourages engagement and referrals.' },
  { title: 'Enable rapid iteration', spot: 'principles/data-informed', body: 'Use design system components to quickly test and optimize acquisition flows, allowing you to iterate based on user data and feedback.' },
  { title: 'Encourage sharing', spot: 'laws/peak-end-rule', body: 'Create delightful experiences that users want to share, leveraging design system components to build shareable moments and features.' },
];

const tips = [
  { title: 'Focus on conversion points', icon: 'radar', body: 'Prioritize design system adoption for key conversion points in your user journey: landing pages, sign-up flows, onboarding experiences, and core product interactions. These are the moments that make or break acquisition.' },
  { title: 'Measure and optimize', icon: 'chart-no-axes-combined', body: 'Track acquisition metrics alongside UX metrics to understand how design system improvements impact user acquisition. Use A/B testing to validate improvements and iterate based on data.' },
  { title: 'Prioritize accessibility', icon: 'accessibility', body: "Accessible design expands your potential user base and improves SEO, both of which directly support acquisition goals. Design system components with built-in accessibility ensure you're not excluding potential users." },
  { title: 'Create delightful moments', icon: 'sparkles', body: 'Use design system components to create moments of delight throughout the user journey. Small, thoughtful interactions and polished details can significantly impact user perception and willingness to engage.' },
];
</script>

<style scoped>
.prose-block {
  @apply flex flex-col gap-4 max-w-3xl text-base leading-relaxed text-ink-secondary;
}

/* Tips: an icon tile beside a title and a paragraph */
.tips {
  @apply grid md:grid-cols-2 gap-4;
}
.tip {
  @apply flex items-start gap-4 rounded-card border border-line bg-surface-raised p-6;
}
.tip-icon {
  @apply flex-none grid place-items-center w-10 h-10 rounded-tile bg-accent-subtle text-xl text-accent-text;
}
.tip-title {
  @apply mb-1.5 text-lg font-semibold text-ink-strong;
}
.tip-body {
  @apply text-sm leading-relaxed text-ink-secondary;
}
</style>
