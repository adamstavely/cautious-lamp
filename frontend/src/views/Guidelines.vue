<template>
  <PageShell v-model:doc-link="docLink" :doc-trail="docLink ? route.path : null">
    <PageHero
      eyebrow="Design and build"
      title="Guidelines"
      lead="Guidance for designing and building with the design system: foundations, accessibility, content and interaction, written with design experts so every team can build with purpose."
      spot="site/guidelines"
    />

    <PageSection title="Browse topics" description="Each topic has its own guidance, examples and tools.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="topic in topics" :key="topic.to" :to="topic.to" :title="topic.title" :spot="topic.art" compact>{{ topic.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Foundations" description="Colour, type, space, depth and access: the base every component builds on." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        <UiLinkRow v-for="page in foundations" :key="page.to" :to="page.to" :title="page.title" :body="page.body" :spot="page.art" />
      </div>
    </PageSection>

    <PageSection title="Guideline pages" description="Focused guidance on accessibility, content, layout and interaction." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        <UiLinkRow v-for="page in guidelinePages" :key="page.to" :to="page.to" :title="page.title" :spot="page.art" />
      </div>
    </PageSection>

    <PageSection title="Building with design systems" description="Where to start, and how the pieces fit together." divided>
      <div class="grid md:grid-cols-3 gap-4">
        <UiCard v-for="article in articles" :key="article.to" :to="article.to" :title="article.title" :spot="article.art" compact>{{ article.body }}</UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { PageHero, PageSection, PageShell, UiCard, UiLinkRow } from '../components/ui';

const route = useRoute();

// /guidelines/<page> shows that guideline document in place of the index.
// The document path drops the /guidelines prefix (/guidelines/colors → /colors).
const docLink = ref(null);
watch(
  () => route.path,
  (path) => {
    docLink.value = path.startsWith('/guidelines/') ? path.replace(/^\/guidelines/, '') : null;
  },
  { immediate: true },
);

const topics = [
  { title: 'Artificial intelligence', to: '/ai', art: 'ai/artificial-intelligence', body: 'Designing AI interfaces, agents and generative features responsibly.' },
  { title: 'Human-centered design', to: '/hcd/principles', art: 'research/hcd-principles', body: 'Research, personas and processes that start from people’s needs.' },
  { title: 'Components', to: '/components', art: 'foundations/components', body: 'Reusable UI components with usage guidance and live examples.' },
  { title: 'Patterns', to: '/patterns', art: 'foundations/patterns', body: 'Design patterns and interaction models for common problems.' },
  { title: 'Voice and tone', to: '/guidelines/voice-and-tone', art: 'site/voice-and-tone', body: 'How we sound, and how that changes with the moment.' },
  { title: 'Terminal UI (TUI) guidance', to: '/guidelines/tui-guidance', art: 'foundations/tui-guidance', body: 'Standards for command-line and console applications.' },
];

const foundations = [
  { title: 'Colors', to: '/guidelines/colors', art: 'foundations/colors', body: 'The palette and how to use it.' },
  { title: 'Typography', to: '/guidelines/typography', art: 'foundations/typography', body: 'Type scale, families and hierarchy.' },
  { title: 'Spacing', to: '/guidelines/spacing', art: 'foundations/spacing', body: 'The spacing scale and layout rhythm.' },
  { title: 'Shadows', to: '/guidelines/shadows', art: 'foundations/shadows', body: 'Elevation and depth.' },
  { title: 'Accessibility', to: '/guidelines/accessibility', art: 'foundations/accessibility', body: 'Inclusive experiences that meet WCAG.' },
];

const guidelinePages = [
  { title: 'Color contrast', to: '/guidelines/color-contrast', art: 'guidelines/color-contrast' },
  { title: 'Content organization and navigation', to: '/guidelines/content-organization-navigation', art: 'guidelines/content-organization-navigation' },
  { title: 'CSS grid layout', to: '/guidelines/css-grid-layout', art: 'guidelines/css-grid-layout' },
  { title: 'Flashing', to: '/guidelines/flashing', art: 'guidelines/flashing' },
  { title: 'Focus', to: '/guidelines/focus', art: 'guidelines/focus' },
  { title: 'Iconography', to: '/guidelines/iconography', art: 'guidelines/iconography' },
  { title: 'Information architecture', to: '/guidelines/information-architecture', art: 'guidelines/information-architecture' },
  { title: 'Keyboard and gestures', to: '/guidelines/keyboard-gestures', art: 'guidelines/keyboard-gestures' },
  { title: 'Metadata and SEO', to: '/guidelines/metadata-seo', art: 'guidelines/metadata-seo' },
  { title: 'Multimedia and animation', to: '/guidelines/multimedia-animation', art: 'guidelines/multimedia-animation' },
  { title: 'Text in graphics', to: '/guidelines/text-graphics', art: 'guidelines/text-graphics' },
  { title: 'Time limits', to: '/guidelines/time', art: 'guidelines/time' },
];

const articles = [
  { title: 'Getting started', to: '/getting-started', art: 'site/getting-started', body: 'The fundamentals of design systems, and how to start using ours.' },
  { title: 'Design tokens', to: '/tokens', art: 'foundations/tokens', body: 'Create and manage tokens for a consistent design system.' },
  { title: 'Component architecture', to: '/getting-started/foundations/atomic-design', art: 'site/atomic-design', body: 'Structure and organize components with atomic design.' },
];
</script>
