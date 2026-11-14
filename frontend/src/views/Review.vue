<template>
  <PageShell>
    <PageHero
      eyebrow="Design review"
      title="Review"
      lead="Collaborate on design reviews with your team. Share designs, gather feedback, track approvals, and streamline your design workflow."
      spot="site/review"
    >
      <template #actions>
        <UiButton variant="primary" icon="add_circle" @click="openRequestReviewModal">Request review</UiButton>
      </template>
    </PageHero>

    <PageSection title="Browse review" description="Start a review, follow the ones you've asked for, or manage them.">
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Opens a dialog, so it's a button rather than a link card -->
        <button type="button" class="request-card group" @click="openRequestReviewModal">
          <SpotArt name="research/user-studies" size="md" class="-ml-1 mb-2" />
          <span class="request-card-title">Request review</span>
          <span class="request-card-body">Upload your design files and request feedback from your team.</span>
        </button>
        <UiCard to="/review/my-requests" title="My requested reviews" spot="site/review-kanban">
          View all the reviews you've requested as the designer.
        </UiCard>
        <UiCard to="/review/management" title="Review management" spot="admin/admin-dashboard">
          Manage reviews, users, and system settings.
        </UiCard>
      </div>
    </PageSection>

    <PageSection title="Start reviewing" description="What the review tools cover." divided>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="feature in features" :key="feature.title" :title="feature.title" :spot="feature.spot" compact>{{ feature.body }}</UiCard>
      </div>
    </PageSection>

    <!-- Request a review -->
    <RequestReviewDialog v-model="showRequestReview" />
  </PageShell>
</template>

<script setup>
import { ref } from 'vue';
import RequestReviewDialog from '../components/review-ui/RequestReviewDialog.vue';
import { PageHero, PageSection, PageShell, SpotArt, UiButton, UiCard } from '../components/ui';

const showRequestReview = ref(false);

const openRequestReviewModal = () => {
  showRequestReview.value = true;
};

const features = [
  { title: 'Upload designs', spot: 'foundations/design-assets', body: 'Upload your design files and share them with your team for collaborative review and feedback.' },
  { title: 'Track workflow', spot: 'research/hcd-process', body: 'Monitor the approval process with workflow tracking from draft to final approval.' },
  { title: 'Version control', spot: 'foundations/token-sync', body: 'Manage multiple versions of your designs and compare changes side by side.' },
];
</script>

<style scoped>
/* Matches UiCard's link card, as a button */
.request-card {
  @apply flex flex-col items-start rounded-card border border-line bg-surface-raised p-6 text-left transition-shadow;
  @apply hover:border-accent-border hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.request-card-title {
  @apply mb-1 text-lg font-semibold text-ink-strong group-hover:text-accent-text;
}
.request-card-body {
  @apply text-sm text-ink-secondary;
}
</style>
