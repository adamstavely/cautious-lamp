<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design assets"
      title="Font library"
      :lead="`Preview the ${fontData.length} Google Fonts families in the library with your own text, compare them side by side, and export the code to use them.`"
      spot="foundations/font-library"
    />
    <FontPreviewer />
  </PageShell>
</template>

<script setup>
import FontPreviewer from '../components/font-previewer/FontPreviewer.vue';
import { PageHero, PageShell } from '../components/ui';
import fontData from '../assets/fonts.json';
</script>
