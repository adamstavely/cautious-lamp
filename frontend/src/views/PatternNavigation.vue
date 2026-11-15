<template>
  <PageShell>
    <PageHero :back="{ to: '/patterns', label: 'Patterns' }" :title="guide.title" :lead="guide.lead" :spot="guide.spot" size="tool">
      <template #actions>
        <UiButton variant="primary" icon="code" to="/patterns/responsive-navigation">See the code</UiButton>
      </template>
    </PageHero>

    <PageSection
      v-for="(pattern, index) in PATTERNS"
      :key="pattern.id"
      :title="pattern.title"
      :description="pattern.summary"
      :divided="index > 0"
    >
      <div class="grid lg:grid-cols-2 gap-6 items-start">
        <figure class="nav-example">
          <figcaption class="nav-example-caption">Example</figcaption>

          <!-- Sidebar beside the content -->
          <div v-if="pattern.id === 'sidebar'" class="flex min-h-48" aria-hidden="true">
            <div class="nav-example-sidebar">
              <span v-for="(item, i) in ['Dashboard', 'Projects', 'Settings', 'Profile']" :key="item" class="nav-example-item" :class="{ 'nav-example-item-on': i === 0 }">{{ item }}</span>
            </div>
            <div class="nav-example-content">Page content</div>
          </div>

          <!-- Bar across the top -->
          <div v-else-if="pattern.id === 'top'" aria-hidden="true">
            <div class="nav-example-bar">
              <span class="font-semibold text-ink-strong">Logo</span>
              <span class="hidden sm:flex gap-4">
                <span v-for="(item, i) in ['Home', 'About', 'Services', 'Contact']" :key="item" :class="i === 0 ? 'text-accent-text font-medium' : 'text-ink-secondary'">{{ item }}</span>
              </span>
              <span class="nav-example-pill">Sign in</span>
            </div>
            <div class="nav-example-content min-h-32">Page content</div>
          </div>

          <!-- Breadcrumb trail above the page -->
          <div v-else class="p-4" aria-hidden="true">
            <div class="flex flex-wrap items-center gap-2 text-sm mb-4">
              <template v-for="(crumb, i) in ['Home', 'Products', 'Electronics']" :key="crumb">
                <span class="text-accent-text underline underline-offset-4">{{ crumb }}</span>
                <AppIcon name="chevron-right" class="text-ink-muted" />
                <span v-if="i === 2" class="font-medium text-ink-strong">Smartphones</span>
              </template>
            </div>
            <div class="nav-example-content min-h-32">Page content</div>
          </div>
        </figure>

        <UiPanel title="Best practices" heading-tag="h3">
          <ul class="practice-list">
            <li v-for="practice in pattern.practices" :key="practice">
              <AppIcon name="check" class="practice-icon" />
              <span>{{ practice }}</span>
            </li>
          </ul>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection title="Accessibility" description="Navigation is how keyboard and screen reader users find their way; get these right on every pattern above." divided>
      <ul class="practice-list max-w-3xl">
        <li v-for="item in ACCESSIBILITY" :key="item">
          <AppIcon name="accessibility" class="practice-icon" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </PageSection>

    <PageSection title="Related patterns" description="Patterns and code that work alongside navigation." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="card in related" :key="card.to" :to="card.to" :title="card.title" :spot="card.spot" compact>{{ card.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { PageHero, PageSection, PageShell, UiButton, UiCard, UiPanel } from '../components/ui';
import { guideForSlug, relatedCards } from '../data/patternGuides.js';

/** Navigation patterns: sidebar, top bar and breadcrumbs, with an example and best practices for each */
const guide = guideForSlug('navigation');
const related = relatedCards(['responsive-navigation', ...guide.related]);

const PATTERNS = [
  {
    id: 'sidebar',
    title: 'Sidebar navigation',
    summary: 'A vertical list of the main sections, always visible on the left (or right) of the page.',
    practices: [
      'Group items logically and keep the most used ones at the top',
      'Use clear labels; add an icon only alongside a label',
      'Highlight the current section',
      'Let it collapse to icons or a menu button on narrow screens',
    ],
  },
  {
    id: 'top',
    title: 'Top navigation',
    summary: 'A horizontal bar across the top of the page for a few primary sections and global actions.',
    practices: [
      'Limit it to five to seven top-level items',
      'Use short, specific labels',
      'Show which item is current, and give hover and focus feedback',
      'Collapse it into a menu button on small screens',
    ],
  },
  {
    id: 'breadcrumbs',
    title: 'Breadcrumbs',
    summary: "A trail that shows where the page sits in the site's hierarchy, with a link to each level above it.",
    practices: [
      'Use them for hierarchies three or more levels deep',
      'Link every level except the current page',
      'Keep each label short, matching the page titles',
      'Show them above the page title, not in place of it',
    ],
  },
];

const ACCESSIBILITY = [
  'Wrap each navigation area in a <nav> landmark with its own name (aria-label="Main", "Breadcrumb").',
  'Mark the current page with aria-current="page" as well as a visual highlight.',
  'Keep a logical tab order and a clearly visible focus indicator on every link.',
  'Provide a "Skip to main content" link before repeated navigation.',
  'Keep link text and backgrounds at 4.5:1 contrast or more, and never show the current item by colour alone.',
  'Give a collapsed menu button an accessible name and aria-expanded.',
];
</script>

<style scoped>
.nav-example {
  @apply rounded-card border border-line bg-surface-sunken overflow-hidden;
}
.nav-example-caption {
  @apply px-4 py-2 border-b border-line text-xs font-medium uppercase tracking-wider text-ink-muted;
}
.nav-example-sidebar {
  @apply w-36 sm:w-44 shrink-0 flex flex-col gap-1 p-3 border-r border-line bg-surface-raised;
}
.nav-example-item {
  @apply rounded-control px-3 py-2 text-sm text-ink-secondary;
}
.nav-example-item-on {
  @apply bg-accent-subtle text-accent-text font-medium;
}
.nav-example-bar {
  @apply flex items-center justify-between gap-4 px-4 py-3 border-b border-line bg-surface-raised text-sm;
}
.nav-example-pill {
  @apply rounded-pill bg-accent px-3 py-1 text-xs font-medium text-ink-on-accent;
}
.nav-example-content {
  @apply flex-1 m-4 flex items-center justify-center rounded-tile border-2 border-dashed border-line text-sm text-ink-muted;
}
.practice-list {
  @apply flex flex-col gap-3 text-ink;
}
.practice-list li {
  @apply flex items-start gap-3;
}
.practice-icon {
  @apply mt-0.5 shrink-0 text-lg text-accent-text;
}
</style>
