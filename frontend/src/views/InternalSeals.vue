<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design assets"
      title="Internal seals"
      lead="The agency's own seals and emblems, with the approved versions and the terms under which each one may be used."
      spot="foundations/internal-seals"
    />

    <PageSection title="Browse seals" description="Seals from your workspaces and seals shared with everyone.">
      <UiCallout tone="info" title="Before you use a seal" class="mb-6">Use only the approved artwork, unaltered, and only where its usage terms allow. Seals mark official communications; ask your communications office before putting one on anything else.</UiCallout>
      <ResourceLibrary kind="internal-seals" noun="internal seals" singular="seal" :filter="{ key: 'organization', label: 'Organization' }" spot="foundations/internal-seals" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell, UiCallout } from '../components/ui';
</script>
