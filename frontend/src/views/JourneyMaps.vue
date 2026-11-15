<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Research"
      title="Journey maps"
      lead="Journey maps from teams across the agency: the stages people go through to reach a goal, what they do and where they get stuck."
      spot="research/journey-maps"
    />

    <PageSection title="Browse journey maps" description="Maps from your workspaces and maps shared with everyone. Open one to see its stages.">
      <ResourceLibrary kind="journey-maps" noun="journey maps" singular="journey map" spot="research/journey-maps" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell } from '../components/ui';
</script>
