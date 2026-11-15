<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Research"
      title="User studies"
      lead="Interviews, surveys, observations and workshops: the studies behind our design decisions, with links to their notes and data."
      spot="research/user-studies"
    />

    <PageSection title="Browse studies" description="Studies from your workspaces and studies shared with everyone.">
      <ResourceLibrary kind="research-artifacts" noun="user studies" singular="user study" :filter="{ key: 'artifactType', label: 'Method' }" spot="research/user-studies" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell } from '../components/ui';
</script>
