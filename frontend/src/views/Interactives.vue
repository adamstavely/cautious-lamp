<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design assets"
      title="Interactives"
      lead="Prototypes, demos and sandboxes you can open and try, to see how a pattern or flow behaves before you build it."
      spot="foundations/interactives"
    />

    <PageSection title="Browse interactives" description="Interactives from your workspaces and interactives shared with everyone.">
      <ResourceLibrary kind="interactives" noun="interactives" singular="interactive" :filter="{ key: 'type', label: 'Type' }" spot="foundations/interactives" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell } from '../components/ui';
</script>
