<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/review', label: 'Review' }"
      title="My requested reviews"
      lead="Track your design review requests on a board. See where each review is in the workflow and open it to act on it."
      spot="site/review-kanban"
      size="tool"
    >
      <template #actions>
        <DemoDataBadge />
        <span class="text-sm text-ink-muted" aria-live="polite">{{ loading ? 'Loading…' : loadedAt ? `Updated ${loadedAt.toLocaleTimeString()}` : '' }}</span>
      </template>
    </PageHero>

    <PageSection>
      <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <section v-for="column in columns" :key="column.key" class="kanban-column" :aria-labelledby="`column-${column.key}`">
          <header class="kanban-column-head">
            <h2 :id="`column-${column.key}`" class="font-semibold text-ink-strong">{{ column.title }}</h2>
            <UiChip :tone="column.tone">
              <span class="sr-only">{{ column.reviews.length }} reviews</span>
              <span aria-hidden="true">{{ column.reviews.length }}</span>
            </UiChip>
          </header>
          <ul v-if="column.reviews.length" class="kanban-column-body">
            <li v-for="review in column.reviews" :key="review.id">
              <router-link :to="reviewLink(review)" class="kanban-card">
                <span class="kanban-card-title">{{ review.filename }}</span>
                <UiChip :tone="workflowTone(review.workflowState || 'draft')">{{ workflowLabel(review.workflowState || 'draft') }}</UiChip>
                <span class="text-xs text-ink-muted">{{ formatDate(review.createdAt) }}</span>
              </router-link>
            </li>
          </ul>
          <p v-else class="kanban-column-empty">{{ column.empty }}</p>
        </section>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useNotice } from '../composables/useNotice.js';
import InlineNotice from '../components/InlineNotice.vue';
import DemoDataBadge from '../components/review-ui/DemoDataBadge.vue';
import { workflowLabel, workflowTone } from '../components/review-ui/workflow.js';
import { PageHero, PageSection, PageShell, UiChip } from '../components/ui';
import { getCurrentUser, isMockMode } from '../mockData.js';
import { reviewAPI, apiErrorMessage } from '../services/api.js';

const { notice, showNotice, clearNotice } = useNotice();
const reviews = ref([]);
const loading = ref(false);
const loadedAt = ref(null);

// The acting user, read once when the board opens
const user = getCurrentUser();

// Filter reviews by state. Drafts that were sent back show under Changes Requested instead.
const getReviewsByState = (state) => {
  return reviews.value.filter(review =>
    (review.workflowState || 'draft') === state && !(state === 'draft' && review.changesRequested));
};

const getReviewsInReview = () => {
  return reviews.value.filter(review => {
    const state = review.workflowState || 'draft';
    return ['client_review', 'art_director_review', 'creative_director_review'].includes(state);
  });
};

// A rejection returns the review to draft; the API flags it with changesRequested.
const getReviewsChangesRequested = () => {
  return reviews.value.filter(review => {
    const state = review.workflowState || 'draft';
    return (state === 'draft' && review.changesRequested) || ['ad_changes_requested', 'cd_changes_requested'].includes(state);
  });
};

const getReviewsApproved = () => {
  return reviews.value.filter(review => {
    const state = review.workflowState || 'draft';
    return ['client_approved', 'art_director_approved', 'approved'].includes(state);
  });
};

const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'No date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const reviewLink = (review) => `/review/${encodeURIComponent(review.reviewId || review.id)}`;

// The board's columns; each review appears in one
const columns = computed(() => [
  { key: 'draft', title: 'Draft', tone: 'neutral', reviews: getReviewsByState('draft'), empty: 'No drafts' },
  { key: 'in-review', title: 'In review', tone: 'info', reviews: getReviewsInReview(), empty: 'No reviews in progress' },
  { key: 'changes', title: 'Changes requested', tone: 'warning', reviews: getReviewsChangesRequested(), empty: 'No changes requested' },
  { key: 'approved', title: 'Approved', tone: 'success', reviews: getReviewsApproved(), empty: 'No approved reviews' },
]);

const loadReviews = async () => {
  loading.value = true;
  try {
    // The server returns only the reviews this user may see
    const { reviews: list } = await reviewAPI.listReviews();
    let visible = list || [];
    // Demo data isn't scoped by a server; show a designer only their own reviews
    if (isMockMode() && user.role === 'designer') {
      visible = visible.filter(review => review.designerEmail === user.email);
    }
    reviews.value = visible.map(review => ({
      id: review.id,
      reviewId: review.id,
      filename: review.filename || `Review ${review.id}`,
      workflowState: review.workflowState || 'draft',
      changesRequested: !!review.changesRequested,
      createdAt: review.createdAt,
      completed: !!review.completed
    }));
    loadedAt.value = new Date();
    clearNotice();
  } catch (error) {
    console.error('Error loading reviews:', error);
    showNotice(apiErrorMessage(error, 'Failed to load reviews.'), 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(loadReviews);
</script>

<style scoped>
.kanban-column {
  @apply flex flex-col rounded-card border border-line bg-surface-sunken;
}
.kanban-column-head {
  @apply flex items-center justify-between gap-2 px-4 py-3 border-b border-line;
}
.kanban-column-body {
  @apply flex flex-col gap-3 p-3 overflow-y-auto;
  min-height: 400px;
  max-height: calc(100vh - 300px);
}
.kanban-column-empty {
  @apply px-4 py-8 text-center text-sm text-ink-muted;
  min-height: 400px;
}
.kanban-card {
  @apply flex flex-col items-start gap-2 rounded-tile border border-line bg-surface-raised p-4 transition-shadow;
  @apply hover:border-accent-border hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus;
}
.kanban-card-title {
  @apply font-medium text-ink-strong break-words;
}
</style>
