<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="System Usability Scale"
      lead="A quick and reliable tool for measuring the usability of a system. Answer 10 questions to get a usability score from 0-100."
      spot="research/system-usability-scale"
      size="tool"
    />

    <PageSection>
      <form class="space-y-6" @submit.prevent="submitForm">
        <UiPanel title="The system" description="What you assessed.">
          <UiSelect v-model="form.systemName" label="System / application" :options="systemOptions" placeholder="Select a system or application" required />
        </UiPanel>

        <UiPanel title="Rate your agreement with each statement" description="1 = strongly disagree, 5 = strongly agree.">
          <ol class="divide-y divide-line-faint">
            <li v-for="(question, index) in questions" :key="index" class="py-4 first:pt-0 last:pb-0">
              <UiSegmented
                v-model="form[`q${index + 1}`]"
                :label="`${index + 1}. ${question}`"
                :options="ratingOptions"
                :hint="getRatingLabel(form[`q${index + 1}`]) || '1 = strongly disagree, 5 = strongly agree'"
              />
            </li>
          </ol>
        </UiPanel>

        <UiCallout v-if="hasAllAnswers" tone="info" role="status" icon="analytics" :title="`Estimated SUS score: ${calculateScore()}`">
          {{ getScoreInterpretation(calculateScore()) }}
        </UiCallout>

        <InlineNotice :notice="notice" @dismiss="clearNotice" />

        <div class="flex justify-end">
          <UiButton type="submit" variant="primary" icon="save" :loading="isSubmitting">
            {{ isSubmitting ? 'Submitting...' : 'Submit assessment' }}
          </UiButton>
        </div>
      </form>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiPanel, UiSegmented, UiSelect } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';
import { authState } from '../services/auth.js';

const { notice, showNotice, clearNotice } = useNotice();
const isSubmitting = ref(false);

// A user-facing reason the submission failed.
const describeSubmitError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message;
  const detail = Array.isArray(message) ? message.join(' ') : message;
  if (status === 503) {
    return `Storage is unavailable, so the assessment was not saved. Please try again later.${detail ? ` (${detail})` : ''}`;
  }
  if (detail) return `The assessment was not saved: ${detail}`;
  if (status) return `The assessment was not saved (HTTP ${status}). Please try again.`;
  return 'Could not reach the server, so the assessment was not saved. Check your connection and try again.';
};

const form = ref({
  systemName: '',
  q1: null,
  q2: null,
  q3: null,
  q4: null,
  q5: null,
  q6: null,
  q7: null,
  q8: null,
  q9: null,
  q10: null,
});

const questions = [
  'I think that I would like to use this system frequently.',
  'I found the system unnecessarily complex.',
  'I thought the system was easy to use.',
  'I think that I would need the support of a technical person to be able to use this system.',
  'I found the various functions in this system were well integrated.',
  'I thought there was too much inconsistency in this system.',
  'I would imagine that most people would learn to use this system very quickly.',
  'I found the system very cumbersome to use.',
  'I felt very confident using the system.',
  'I needed to learn a lot of things before I could get going with this system.',
];

const systemOptions = ref([
  { value: 'Marketing Site', label: 'Marketing Site' },
  { value: 'Admin Dashboard', label: 'Admin Dashboard' },
  { value: 'Mobile App', label: 'Mobile App' },
  { value: 'Design System', label: 'Design System' },
  { value: 'Other', label: 'Other' },
]);

const ratingOptions = [1, 2, 3, 4, 5].map((value) => ({ value, label: String(value) }));

const isRating = (value) => Number.isInteger(value) && value >= 1 && value <= 5;

const unansweredQuestions = computed(() =>
  questions.map((_, i) => i + 1).filter((n) => !isRating(form.value[`q${n}`]))
);

const hasAllAnswers = computed(() => {
  return Boolean(form.value.systemName) && unansweredQuestions.value.length === 0;
});

const getRatingLabel = (rating) => {
  if (!rating) return '';
  const labels = {
    1: 'Strongly Disagree',
    2: 'Disagree',
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree',
  };
  return labels[rating] || '';
};

const calculateScore = () => {
  if (!hasAllAnswers.value) return 0;
  
  let score = 0;
  // Odd questions: score - 1
  score += (form.value.q1 - 1) + (form.value.q3 - 1) + (form.value.q5 - 1) + (form.value.q7 - 1) + (form.value.q9 - 1);
  // Even questions: 5 - score
  score += (5 - form.value.q2) + (5 - form.value.q4) + (5 - form.value.q6) + (5 - form.value.q8) + (5 - form.value.q10);
  score *= 2.5; // Convert to 0-100 scale
  
  return Math.round(score * 10) / 10;
};

const getScoreInterpretation = (score) => {
  if (score >= 80) return 'Excellent - The system has excellent usability.';
  if (score >= 68) return 'Good - The system has good usability.';
  if (score >= 51) return 'OK - The system has acceptable usability but could be improved.';
  return 'Poor - The system has poor usability and needs significant improvement.';
};

const submitForm = async () => {
  if (!form.value.systemName) {
    showNotice('Choose the system or application you are assessing.', 'error');
    return;
  }
  if (unansweredQuestions.value.length > 0) {
    showNotice(`Answer every statement before submitting (missing: ${unansweredQuestions.value.join(', ')}).`, 'error');
    return;
  }

  isSubmitting.value = true;
  clearNotice();

  try {
    const user = authState.user?.name || authState.user?.email || 'Anonymous User';
    const localScore = calculateScore();
    
    const payload = {
      ...form.value,
      user,
    };

    const response = await apiClient.post('/api/v1/sus', payload);

    const score = typeof response.data?.score === 'number' ? response.data.score : localScore;
    showNotice(`Assessment submitted and saved. SUS score: ${score}.`, 'success');
    
    // Reset form
    form.value = {
      systemName: '',
      q1: null,
      q2: null,
      q3: null,
      q4: null,
      q5: null,
      q6: null,
      q7: null,
      q8: null,
      q9: null,
      q10: null,
    };
  } catch (error) {
    console.error('Failed to submit SUS:', error);
    showNotice(describeSubmitError(error), 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
