<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design assets"
      title="Country flags"
      lead="Flag artwork for maps, forms and country pickers, with ISO 3166-1 codes so you can match them to your data."
      spot="foundations/country-flags"
    />

    <PageSection title="Browse flags" description="Flags from your workspaces and flags shared with everyone.">
      <UiCallout tone="info" title="Naming countries" class="mb-6">Use the country names and codes your agency has approved. The U.S. Department of State's list of independent states is a common reference. Never show a flag on its own to stand for a language.</UiCallout>
      <ResourceLibrary kind="country-flags" noun="country flags" singular="country flag" :filter="{ key: 'region', label: 'Region' }" spot="foundations/country-flags" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell, UiCallout } from '../components/ui';
</script>
