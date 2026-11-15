<template>
  <GuidanceDocPage
    eyebrow="Human-centered design"
    title="User research"
    lead="Why and how we do user research: planning a study, running it ethically and making sure findings reach decisions."
    spot="research/hcd-research"
    doc-path="/hcd/research"
    :related="related"
    related-title="Research libraries"
    related-description="Studies, reports, insights and journey maps from teams across the agency."
  />
</template>

<script setup>
import GuidanceDocPage from '../components/GuidanceDocPage.vue';

const related = [
  { title: 'User studies', to: '/research/user-studies', spot: 'research/user-studies', body: 'Interviews, surveys, observations and workshops.' },
  { title: 'HCD reports', to: '/research/hcd-reports', spot: 'research/hcd-reports', body: 'Usability, accessibility and research reports.' },
  { title: 'Research insights', to: '/research/insights', spot: 'research/research-insights', body: 'Needs, pain points and opportunities from research.' },
  { title: 'Journey maps', to: '/research/journey-maps', spot: 'research/journey-maps', body: "People's experiences across stages and channels." },
];
</script>
