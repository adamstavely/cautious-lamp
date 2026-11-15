<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Research"
      title="HCD reports"
      lead="Usability, accessibility, heuristic and user research reports, so findings outlive the project that produced them."
      spot="research/hcd-reports"
    />

    <PageSection title="Browse reports" description="Reports from your workspaces and reports shared with everyone.">
      <ResourceLibrary kind="hcd-reports" noun="HCD reports" singular="HCD report" :filter="{ key: 'reportType', label: 'Report type' }" spot="research/hcd-reports" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell } from '../components/ui';
</script>
