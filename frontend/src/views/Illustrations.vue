<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design assets"
      title="Illustrations"
      lead="Illustrations for empty states, onboarding and explanations, grouped by style so a product stays consistent."
      spot="foundations/illustrations"
    />

    <PageSection title="Browse illustrations" description="Illustrations from your workspaces and illustrations shared with everyone.">
      <ResourceLibrary kind="illustrations" noun="illustrations" singular="illustration" :filter="{ key: 'style', label: 'Style' }" spot="foundations/illustrations" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell } from '../components/ui';
</script>
