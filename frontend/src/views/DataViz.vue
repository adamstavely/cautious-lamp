<template>
  <PageShell v-model:doc-link="docLink">
    <PageHero
      eyebrow="Charts, maps, timelines, tables"
      title="Data visualization"
      lead="Create interactive charts, timelines, tables, and data visualizations to effectively communicate insights and information."
      spot="foundations/data-viz"
    />

    <PageSection title="Data visualization tools" description="Build a chart, map, timeline or table and copy the code.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="tool in tools" :key="tool.to" :to="tool.to" :title="tool.title" :spot="tool.art" compact>{{ tool.body }}</UiCard>
      </div>
    </PageSection>

    <PageSection title="Dashboard guidance" description="How to plan, lay out and design dashboards." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="guide in guidanceLinks" :key="guide.link" :to="guide.link" :title="guide.text" :spot="guide.art" compact>
          {{ guide.description }}
        </UiCard>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { PageHero, PageSection, PageShell, UiCard } from '../components/ui';

const route = useRoute();

// /data-viz/<slug> shows that guidance document (public/docs/data-viz) in place of the page
const docLink = ref(null);
watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/data-viz/')) docLink.value = path;
    else if (path === '/data-viz') docLink.value = null;
  },
  { immediate: true },
);

const tools = [
  { title: 'Chart builder', to: '/tools/chart-builder', art: 'tools/chart-builder', body: 'Create interactive charts and graphs including line, bar, pie, doughnut, scatter plots, treemaps, and more.' },
  { title: 'Map maker', to: '/tools/map-maker', art: 'tools/map-maker', body: 'Create interactive choropleth and flow maps with accurate geographic boundaries using TopoJSON data.' },
  { title: 'Timeline generator', to: '/tools/timeline-generator', art: 'tools/timeline-generator', body: 'Create interactive timelines with events, dates, and custom styling for historical or project visualization.' },
  { title: 'Table generator', to: '/tools/table-generator', art: 'tools/table-generator', body: 'Generate data tables with sorting, filtering, pagination, and customizable styling options.' },
  { title: 'Color scale generator', to: '/tools/color-scale', art: 'tools/color-scale-generator', body: "Generate accessible color scales using Adobe's Leonardo Color for data visualization." },
];

const guidanceLinks = [
  {
    text: 'Types of dashboards',
    link: '/data-viz/types-of-dashboards',
    art: 'foundations/dashboard-types',
    description: 'Curated versus data-collection dashboards, when to use each, and the design tradeoffs between them.',
  },
  {
    text: 'Dashboard patterns',
    link: '/data-viz/dashboard-patterns',
    art: 'foundations/dashboard-patterns',
    description: 'Patterns for data, meta information, visual representations, layout, interaction and color.',
  },
  {
    text: 'Dashboard design',
    link: '/data-viz/dashboard-design',
    art: 'patterns/data-visualization',
    description: 'A short overview of curated and data-collection dashboards and their goals.',
  },
];
</script>
