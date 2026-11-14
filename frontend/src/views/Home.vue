<template>
  <div class="home">
    <div class="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
      <PageHero
        eyebrow="The Agency's design system"
        title="Unifying the mission, by design."
        lead="Guidelines, components, tokens, patterns and assets for building digital experiences that look, work and feel like one Agency."
        spot="site/compass-rose"
      >
        <template #actions>
          <UiButton variant="primary" to="/getting-started" trailing-icon="arrow_forward">Get started</UiButton>
          <UiButton to="/components">Browse components</UiButton>
          <UiButton variant="ghost" to="/search" icon="search">Search</UiButton>
        </template>
      </PageHero>

      <PageSection title="Start with the foundations" description="The building blocks every product shares.">
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <UiCard v-for="item in foundations" :key="item.to" :to="item.to" :title="item.title" :spot="item.art">{{ item.body }}</UiCard>
        </div>
      </PageSection>

      <PageSection title="Made for how you work" description="Paths through the system for each discipline." divided>
        <div class="grid md:grid-cols-3 gap-4">
          <router-link v-for="role in roles" :key="role.to" :to="role.to" class="role group">
            <SpotArt :name="role.art" size="lg" class="mb-4" />
            <h3 class="role-title">{{ role.title }}</h3>
            <p class="role-body">{{ role.body }}</p>
            <span class="role-cta">
              {{ role.cta }}
              <span class="material-symbols-outlined role-arrow" aria-hidden="true">arrow_forward</span>
            </span>
          </router-link>
        </div>
      </PageSection>

      <PageSection
        title="What you see is what you build"
        description="These components use the same tokens the products ship with, so the docs can't drift from production."
        divided
      >
        <div class="grid lg:grid-cols-2 gap-4">
          <UiPanel>
            <!-- Specimens: the real components, shown rather than used -->
            <div class="flex flex-wrap items-center gap-3" inert>
              <UiButton variant="primary">Primary</UiButton>
              <UiButton>Secondary</UiButton>
              <UiButton variant="ghost" icon="download">Ghost</UiButton>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <UiChip tone="accent">Stable</UiChip>
              <UiChip tone="warning">Beta</UiChip>
              <UiChip>Deprecated</UiChip>
              <UiChip icon="accessibility_new">WCAG 2.1 AA</UiChip>
            </div>
            <router-link to="/components/buttons" class="specimen group">
              <div class="flex items-start gap-3">
                <SpotArt name="foundations/component-button" size="sm" class="-m-1" />
                <div class="min-w-0 flex-1">
                  <h3 class="specimen-title">Button</h3>
                  <p class="font-code text-xs text-ink-muted">@design-system/button</p>
                </div>
                <UiChip tone="accent">Stable</UiChip>
              </div>
              <p class="text-sm leading-relaxed text-ink-secondary">Triggers an action. Primary, secondary and ghost variants in three sizes, with loading and icon states.</p>
              <div class="flex flex-wrap gap-1.5">
                <UiCode>variant</UiCode>
                <UiCode>size</UiCode>
                <UiCode>loading</UiCode>
              </div>
            </router-link>
            <template #footer>
              <span>Live components</span>
              <UiLink to="/components" arrow>Browse components</UiLink>
            </template>
          </UiPanel>

          <UiPanel>
            <UiCallout tone="info">
              Color is <strong class="text-ink-strong">information, not decoration.</strong> Every color in the system is a named token with one job, from text and surfaces to status and focus.
            </UiCallout>
            <ol class="steps">
              <li><span><strong>Install the tokens</strong> so color, type and space come from one place.</span></li>
              <li><span><strong>Compose the components</strong> rather than restyling them, and pass props like <UiCode>variant</UiCode> and <UiCode>size</UiCode>.</span></li>
              <li><span><strong>Check accessibility</strong> with the contrast and APCA tools before you ship.</span></li>
            </ol>
            <template #footer>
              <span>Getting started</span>
              <UiLink to="/getting-started/quick-start" arrow>Read the guide</UiLink>
            </template>
          </UiPanel>
        </div>
      </PageSection>

      <PageSection title="Popular tools" description="Check, generate and convert without leaving the system." divided>
        <template #actions>
          <UiLink to="/tools" arrow>All tools</UiLink>
        </template>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          <UiLinkRow v-for="tool in tools" :key="tool.to" :to="tool.to" :title="tool.title" :body="tool.body" :spot="tool.art" />
        </div>
      </PageSection>

      <PageSection title="Go further" divided>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UiCard v-for="item in more" :key="item.to" :to="item.to" :title="item.title" :spot="item.art" compact>{{ item.body }}</UiCard>
        </div>
      </PageSection>
    </div>
  </div>
</template>

<script setup>
import { PageHero, PageSection, SpotArt, UiButton, UiCallout, UiCard, UiChip, UiCode, UiLink, UiLinkRow, UiPanel } from '../components/ui';

const foundations = [
  { title: 'Guidelines', to: '/guidelines', art: 'site/guidelines', body: 'Principles and best practices for consistent, accessible interfaces.' },
  { title: 'Components', to: '/components', art: 'foundations/components', body: 'Reusable UI built with accessibility and consistency in mind.' },
  { title: 'Tokens', to: '/tokens', art: 'foundations/tokens', body: 'Color, spacing, type and motion as shared design decisions.' },
  { title: 'Patterns', to: '/patterns', art: 'foundations/patterns', body: 'Proven solutions for navigation, forms, feedback and data.' },
  { title: 'Fonts', to: '/fonts', art: 'foundations/fonts', body: 'Typefaces, stacks and scales for clear, readable text.' },
  { title: 'Design assets', to: '/design-assets', art: 'foundations/design-assets', body: 'Icons, seals, flags, logos, photos and illustrations.' },
];

const roles = [
  { title: 'For designers', to: '/for-designers', art: 'site/for-designers', cta: 'Explore designer tools', body: 'Visual tools, design assets and a smooth path from design to code.' },
  { title: 'For developers', to: '/for-developers', art: 'site/for-developers', cta: 'Explore developer tools', body: 'Components, APIs, snippets and testing to build faster.' },
  { title: 'For researchers', to: '/for-researchers', art: 'research/for-researchers', cta: 'Explore research tools', body: 'HCD methods, studies and insights that inform design decisions.' },
];

const tools = [
  { title: 'Color contrast checker', to: '/tools/color-contrast', art: 'tools/color-contrast-checker', body: 'Check color pairs against WCAG.' },
  { title: 'APCA calculator', to: '/tools/apca-calculator', art: 'tools/apca-calculator', body: 'Perceptual contrast for modern readability.' },
  { title: 'Color scale generator', to: '/tools/color-scale', art: 'tools/color-scale-generator', body: 'Build even, accessible tonal ramps.' },
  { title: 'Font scale', to: '/tools/font-scale', art: 'tools/font-scale', body: 'Generate a modular type scale.' },
  { title: 'Chart builder', to: '/tools/chart-builder', art: 'tools/chart-builder', body: 'Make on-brand charts from your data.' },
  { title: 'Gradient generator', to: '/tools/gradient-generator', art: 'tools/gradient-generator', body: 'Compose gradients from system colors.' },
];

const more = [
  { title: 'AI', to: '/ai', art: 'ai/artificial-intelligence', body: 'Patterns and components for AI experiences.' },
  { title: 'Laws of UX', to: '/hcd/laws-of-ux', art: 'site/laws-of-ux', body: 'The psychology behind good interfaces.' },
  { title: 'Contribute', to: '/getting-started/contribute', art: 'site/contribute', body: 'Propose, build and improve the system.' },
  { title: 'Roadmap', to: '/roadmap', art: 'site/roadmap-feedback', body: "See what's next and share feedback." },
];
</script>

<style scoped>
.home {
  @apply min-h-full bg-surface text-ink;
}

/* A path per discipline: centred, on a sunken tile that takes the accent on hover */
.role {
  @apply flex flex-col items-center p-8 rounded-card border border-transparent bg-surface-sunken text-center transition-all;
  @apply hover:border-accent-highlight hover:bg-accent-subtle;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.role-title {
  @apply mb-1.5 text-lg font-semibold text-ink-strong;
}
.role-body {
  @apply mb-4 text-sm leading-relaxed text-ink-secondary;
}
.role-cta {
  @apply inline-flex items-center gap-1 text-sm font-medium text-accent-text group-hover:underline underline-offset-4;
}
.role-arrow {
  @apply text-base transition-transform group-hover:translate-x-1;
}

/* A component's catalogue entry */
.specimen {
  @apply flex flex-col gap-3 p-4 rounded-tile border border-line transition-all hover:border-accent-border;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.specimen-title {
  @apply font-semibold text-ink-strong transition-colors group-hover:text-accent-text;
}

/* Numbered steps */
.steps {
  @apply flex flex-col gap-4 text-sm leading-relaxed text-ink-secondary;
  counter-reset: step;
}
.steps li {
  @apply flex gap-3;
  counter-increment: step;
}
.steps li::before {
  @apply flex-none grid place-items-center w-7 h-7 rounded-pill bg-accent text-xs font-semibold text-ink-on-accent;
  content: counter(step);
}
.steps strong {
  @apply font-semibold text-ink-strong;
}
</style>
