<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design assets"
      title="Company logos"
      lead="Logos of partner companies and organizations, with the terms under which each one may be used."
      spot="foundations/company-logos"
    />

    <PageSection title="Browse logos" description="Logos from your workspaces and logos shared with everyone.">
      <UiCallout tone="info" title="Using company logos" class="mb-6">Logos are trademarks. Use one only as its owner and your agreement allow, and never in a way that suggests the agency endorses a company or its products. Your ethics office can advise.</UiCallout>
      <ResourceLibrary kind="company-logos" noun="company logos" singular="company logo" :filter="{ key: 'company', label: 'Company' }" spot="foundations/company-logos" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell, UiCallout } from '../components/ui';
</script>
