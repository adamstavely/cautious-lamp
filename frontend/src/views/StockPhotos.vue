<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design assets"
      title="Stock photos"
      lead="Photography cleared for use in agency products, with the photographer and license for each image."
      spot="site/stock-photos"
    />

    <PageSection title="Browse photos" description="Photos from your workspaces and photos shared with everyone.">
      <UiCallout tone="info" title="Using photos" class="mb-6">Check the license before you publish, and credit the photographer when it asks you to. Write alt text that says what the photo shows in context, or leave alt empty when it is only decorative.</UiCallout>
      <ResourceLibrary kind="stock-photos" noun="stock photos" singular="stock photo" :filter="{ key: 'license', label: 'License' }" spot="site/stock-photos" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell, UiCallout } from '../components/ui';
</script>
