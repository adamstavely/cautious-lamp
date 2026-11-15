<template>
  <GuidanceDocPage
    v-if="guide"
    :key="guide.slug"
    eyebrow="Patterns"
    :title="guide.title"
    :lead="guide.lead"
    :spot="guide.spot"
    :doc-path="guide.to"
    :related="related"
    related-title="Related patterns"
    related-description="Patterns and code that work well alongside this one."
  />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import GuidanceDocPage from '../components/GuidanceDocPage.vue';
import { guideForSlug, relatedCards } from '../data/patternGuides.js';

/**
 * A core pattern guide (/patterns/layout, /forms, /feedback, /data-display):
 * its hero, links to related patterns, and its guidance from
 * public/docs/patterns/<slug>.md.
 */
const route = useRoute();

const guide = computed(() => guideForSlug(route.path.split('/').pop()));
const related = computed(() => (guide.value ? relatedCards(guide.value.related) : []));
</script>
