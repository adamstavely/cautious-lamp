<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design assets"
      title="US Government seals"
      lead="Official seals and emblems of US Government organizations, with the terms under which each one may be used."
      spot="foundations/usg-seals"
    />

    <PageSection title="Browse seals" description="Seals from your workspaces and seals shared with everyone.">
      <UiCallout tone="info" title="Before you use a seal" class="mb-6">Official seals may only be used as authorized. Using one to suggest government sponsorship or approval is against the law (for example, 18 U.S.C. § 713 covers the Great Seal and the seals of the President and Vice President). Read each seal's usage terms, and ask your legal or communications office when in doubt.</UiCallout>
      <ResourceLibrary kind="usg-seals" noun="US Government seals" singular="seal" :filter="{ key: 'organization', label: 'Organization' }" spot="foundations/usg-seals" />
    </PageSection>
  </PageShell>
</template>

<script setup>
import ResourceLibrary from '../components/workspaces/ResourceLibrary.vue';
import { PageHero, PageSection, PageShell, UiCallout } from '../components/ui';
</script>
