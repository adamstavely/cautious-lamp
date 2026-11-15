<template>
  <PageShell :breadcrumbs="false">
    <PageHero
      eyebrow="Page not found"
      title="We can't find that page"
      spot="site/not-found"
    >
      <template #lead>
        Nothing lives at <UiCode>{{ route.fullPath }}</UiCode>. It may have moved, or the link may have a typo.
      </template>
      <template #actions>
        <UiButton to="/" variant="primary" icon="house">Go home</UiButton>
        <UiButton icon="search" @click="focusSearch">Search the design system</UiButton>
      </template>
    </PageHero>

    <PageSection title="Popular pages">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        <UiLinkRow v-for="page in popular" :key="page.to" :to="page.to" :title="page.title" :body="page.body" :spot="page.spot" />
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { PageHero, PageSection, PageShell, UiButton, UiCode, UiLinkRow } from '../components/ui';

const route = useRoute();

// The search box lives in the top bar on every page; move focus straight to it
const focusSearch = () => {
  document.querySelector('input[aria-label="Search design system"]')?.focus();
};

const popular = [
  { title: 'Getting started', to: '/getting-started', spot: 'site/getting-started', body: 'Learn the fundamentals and start building.' },
  { title: 'Components', to: '/components', spot: 'foundations/components', body: 'Every component, with docs and code.' },
  { title: 'Tokens', to: '/tokens', spot: 'foundations/tokens', body: 'Color, type, spacing and more.' },
  { title: 'Patterns', to: '/patterns', spot: 'foundations/patterns', body: 'Proven solutions to common problems.' },
  { title: 'Guidelines', to: '/guidelines', spot: 'site/guidelines', body: 'Accessibility, content and visual design.' },
  { title: 'Tools', to: '/tools', spot: 'site/tools', body: 'Generators, converters and checkers.' },
];
</script>
