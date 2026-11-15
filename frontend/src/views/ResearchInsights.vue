<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Research"
      title="Research insights"
      lead="User needs, pain points and opportunities drawn from research, tagged and prioritized so teams can act on them."
      spot="research/research-insights"
    />

    <PageSection title="Browse insights" description="Insights from your workspaces and insights shared with everyone.">
      <ResourceLibrary kind="insights" noun="insights" singular="insight" :filter="{ key: 'category', label: 'Category' }" spot="research/research-insights" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell } from '../components/ui';
</script>
