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
      <form class="space-y-6" novalidate @submit.prevent="submitForm">
        <UiPanel title="The task" description="What you assessed.">
          <div class="space-y-6">
            <UiSelect
              id="tlx-system"
              v-model="form.systemName"
              label="System / application"
              :options="systemOptions"
              placeholder="Select a system or application"
              required
              :error="errors.systemName"
            />
            <UiTextarea
              id="tlx-task"
              v-model="form.task"
              label="Task description"
              required
              rows="3"
              placeholder="Describe the task you are evaluating..."
              :error="errors.task"
            />
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
              :valuetext="`${form[dimension.key]} of 100 (0 ${dimension.low}, 100 ${dimension.high})`"
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

    <PageSection v-if="workload" title="Workload score" divided>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UiStat
          label="Raw TLX (unweighted)"
          :value="`${workload.rawTlx}/100`"
          hint="The mean of the six ratings, with no pairwise weighting. Higher means a heavier workload."
          tone="accent"
        />
        <UiStat label="Task" :value="workload.task" />
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { computed, ref } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiPanel, UiRange, UiSelect, UiStat, UiTextarea } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import { focusSoon } from '../utils/focusAfterRemoval.js';
import apiClient from '../services/api.js';
import { authState } from '../services/auth.js';

const { notice, showNotice, clearNotice } = useNotice();
const isSubmitting = ref(false);
// The last submitted assessment's raw TLX, shown under the form
const workload = ref(null);

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

// Raw (unweighted) TLX: the mean of the six 0-100 ratings, to one decimal
const rawTlx = (ratings) => {
  const sum = Object.keys(RATING_FIELDS).reduce((total, key) => total + ratings[key], 0);
  return Math.round((sum / 6) * 10) / 10;
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

// Errors show next to each field once the person has tried to submit
const attempted = ref(false);
const errors = computed(() => {
  if (!attempted.value) return {};
  return {
    systemName: form.value.systemName ? '' : 'Choose the system or application you are assessing.',
    task: form.value.task.trim() ? '' : 'Describe the task you are evaluating.',
  };
});

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
  attempted.value = true;
  const problem = validate();
  if (problem) {
    showNotice(problem, 'error');
    if (errors.value.systemName) focusSoon('#tlx-system');
    else if (errors.value.task) focusSoon('#tlx-task');
    return;
  }

  isSubmitting.value = true;
  clearNotice();

  workload.value = null;

  try {
    const user = authState.user?.name || authState.user?.email || 'Anonymous User';
    
    const payload = {
      ...form.value,
      task: form.value.task.trim(),
      user,
    };

    const response = await apiClient.post('/api/v1/nasa-tlx', payload);

    // Show the score the server stored; fall back to our own only if it sent none
    const stored = response?.data?.rawTlx;
    workload.value = {
      task: payload.task,
      rawTlx: typeof stored === 'number' ? stored : rawTlx(payload),
    };
    showNotice('Assessment submitted and saved.', 'success');
    attempted.value = false;
    
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
