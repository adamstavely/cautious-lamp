<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="NASA-TLX"
      lead="NASA Task Load Index: assess the workload of a task across six dimensions: mental demand, physical demand, temporal demand, performance, effort, and frustration."
      spot="research/nasa-tlx"
      size="tool"
    />

    <PageSection>
      <form class="space-y-6" @submit.prevent="submitForm">
        <UiPanel title="The task" description="What you assessed.">
          <div class="space-y-6">
            <UiSelect v-model="form.systemName" label="System / application" :options="systemOptions" placeholder="Select a system or application" required />
            <UiTextarea v-model="form.task" label="Task description" required rows="3" placeholder="Describe the task you are evaluating..." />
          </div>
        </UiPanel>

        <UiPanel title="Rate each dimension" description="0 = very low, 100 = very high (performance: 0 = perfect, 100 = failure).">
          <div class="grid gap-x-8 gap-y-6 md:grid-cols-2">
            <UiRange
              v-for="dimension in dimensions"
              :key="dimension.key"
              v-model="form[dimension.key]"
              :label="RATING_FIELDS[dimension.key]"
              :hint="`0 = ${dimension.low}, 100 = ${dimension.high}`"
              :min="0"
              :max="100"
              :step="1"
            />
          </div>
          <template #footer>
            <div class="flex flex-col gap-4">
              <InlineNotice :notice="notice" @dismiss="clearNotice" />
              <div class="flex justify-end">
                <UiButton type="submit" variant="primary" icon="save" :loading="isSubmitting">
                  {{ isSubmitting ? 'Submitting...' : 'Submit assessment' }}
                </UiButton>
              </div>
            </div>
          </template>
        </UiPanel>
      </form>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiPanel, UiRange, UiSelect, UiTextarea } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';
import { authState } from '../services/auth.js';

const { notice, showNotice, clearNotice } = useNotice();
const isSubmitting = ref(false);

const RATING_FIELDS = {
  mentalDemand: 'Mental demand',
  physicalDemand: 'Physical demand',
  temporalDemand: 'Temporal demand',
  performance: 'Performance',
  effort: 'Effort',
  frustration: 'Frustration',
};

// The scale's anchors for each dimension
const dimensions = [
  { key: 'mentalDemand', low: 'very low', high: 'very high' },
  { key: 'physicalDemand', low: 'very low', high: 'very high' },
  { key: 'temporalDemand', low: 'very low', high: 'very high' },
  { key: 'performance', low: 'perfect', high: 'failure' },
  { key: 'effort', low: 'very low', high: 'very high' },
  { key: 'frustration', low: 'very low', high: 'very high' },
];

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
  task: '',
  mentalDemand: 50,
  physicalDemand: 50,
  temporalDemand: 50,
  performance: 50,
  effort: 50,
  frustration: 50,
});

const systemOptions = ref([
  { value: 'Marketing Site', label: 'Marketing Site' },
  { value: 'Admin Dashboard', label: 'Admin Dashboard' },
  { value: 'Mobile App', label: 'Mobile App' },
  { value: 'Design System', label: 'Design System' },
  { value: 'Other', label: 'Other' },
]);

const validate = () => {
  if (!form.value.systemName) return 'Choose the system or application you are assessing.';
  if (!form.value.task.trim()) return 'Describe the task you are evaluating.';
  for (const [key, label] of Object.entries(RATING_FIELDS)) {
    const value = form.value[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
      return `${label} must be a rating from 0 to 100.`;
    }
  }
  return null;
};

const submitForm = async () => {
  const problem = validate();
  if (problem) {
    showNotice(problem, 'error');
    return;
  }

  isSubmitting.value = true;
  clearNotice();

  try {
    const user = authState.user?.name || authState.user?.email || 'Anonymous User';
    
    const payload = {
      ...form.value,
      task: form.value.task.trim(),
      user,
    };

    await apiClient.post('/api/v1/nasa-tlx', payload);

    showNotice('Assessment submitted and saved.', 'success');
    
    // Reset form
    form.value = {
      systemName: '',
      task: '',
      mentalDemand: 50,
      physicalDemand: 50,
      temporalDemand: 50,
      performance: 50,
      effort: 50,
      frustration: 50,
    };
  } catch (error) {
    console.error('Failed to submit NASA-TLX:', error);
    showNotice(describeSubmitError(error), 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
