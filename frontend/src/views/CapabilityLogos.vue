<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design assets"
      title="Capability logos"
      lead="Logos for the agency’s capabilities and services, in the approved formats."
      spot="foundations/capability-logos"
    />

    <PageSection title="Browse logos" description="Logos from your workspaces and logos shared with everyone.">
      <ResourceLibrary kind="capability-logos" noun="capability logos" singular="capability logo" :filter="{ key: 'capability', label: 'Capability' }" spot="foundations/capability-logos" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell } from '../components/ui';
</script>
