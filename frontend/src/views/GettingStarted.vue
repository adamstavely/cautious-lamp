<template>
  <PageShell>
    <PageHero
      eyebrow="New to the design system"
      title="Getting started"
      lead="Welcome to the design system. Learn the fundamentals, explore key concepts, and start building with confidence."
      spot="site/getting-started"
    >
      <template #actions>
        <UiButton variant="primary" to="/getting-started/quick-start" trailing-icon="arrow-right">Quick start</UiButton>
        <UiButton to="/getting-started/installation" icon="download">Installation</UiButton>
      </template>
    </PageHero>

    <PageSection title="Start here" description="The guides most people read first.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        <UiLinkRow v-for="item in featured" :key="item.to" :to="item.to" :title="item.title" :body="item.body" :spot="item.art" />
      </div>
    </PageSection>

    <PageSection title="Browse getting started" description="Everything in this section, from the case for a design system to adopting it." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <UiCard v-for="item in guides" :key="item.to" :to="item.to" :title="item.title" :spot="item.art" compact>{{ item.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiButton, UiCard, UiLinkRow } from '../components/ui';

const guides = [
  { title: 'Why a design system?', to: '/getting-started/why-design-system', art: 'site/why-design-system', body: 'Understand the value and philosophy behind our design system.' },
  { title: 'Quick start', to: '/getting-started/quick-start', art: 'site/quick-start', body: 'Get up and running in minutes with our quick start guide.' },
  { title: 'Design principles', to: '/getting-started/principles', art: 'principles/design-principles', body: 'Understand the core principles that guide our design decisions.' },
  { title: 'Contribute', to: '/getting-started/contribute', art: 'site/contribute', body: 'Learn how to contribute components, patterns, and improvements.' },
  { title: 'Installation', to: '/getting-started/installation', art: 'site/installation', body: 'Install and configure the design system in your project.' },
  { title: 'Best practices', to: '/getting-started/best-practices', art: 'site/best-practices', body: 'Learn the recommended practices for using the design system effectively.' },
  { title: 'Resources', to: '/getting-started/resources', art: 'site/resources', body: 'Access tutorials, examples, and helpful resources to accelerate your learning.' },
  { title: 'Support', to: '/getting-started/support', art: 'site/support', body: 'Get help from the community or reach out to our team for assistance.' },
  { title: 'Purpose and benefits', to: '/getting-started/purpose-and-benefits', art: 'site/purpose-and-benefits', body: 'Discover the core purpose of our design system and the tangible benefits it brings.' },
  { title: 'Get in touch', to: '/getting-started/get-in-touch', art: 'site/get-in-touch', body: "Have questions, feedback, or need support? We're here to help." },
  { title: 'Adopt', to: '/getting-started/adopt', art: 'site/adopt', body: 'Learn how to successfully adopt the design system in your organization.' },
  {
    title: 'Improving UX through acquisition',
    to: '/getting-started/improving-ux-through-acquisition',
    art: 'research/improving-ux-through-acquisition',
    body: 'Learn how design system adoption and user acquisition strategies work together.',
  },
];

// The old "Getting started resources" band named these three guides without linking them
const featured = [
  { title: 'Quick start guide', to: '/getting-started/quick-start', art: 'site/quick-start', body: 'Step-by-step setup and installation instructions.' },
  { title: 'Design principles', to: '/getting-started/principles', art: 'principles/design-principles', body: 'The principles and themes behind consistent experiences.' },
  { title: 'Contribution guide', to: '/getting-started/contribute', art: 'site/contribute', body: 'Contribute components, patterns, docs and feedback.' },
];
</script>
