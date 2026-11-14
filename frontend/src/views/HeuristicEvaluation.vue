<template>
  <PageShell>
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Heuristic evaluation"
      lead="Evaluate interfaces using Nielsen's 10 Usability Heuristics. Identify usability issues and prioritize improvements based on severity ratings."
      spot="research/heuristic-evaluation"
      size="tool"
    />

    <PageSection>
      <form class="space-y-6" @submit.prevent="submitEvaluation">
        <UiPanel title="The evaluation" description="What you evaluated, and who evaluated it.">
          <div class="grid gap-6 md:grid-cols-2">
            <UiSelect v-model="form.systemName" label="System / application" :options="systemOptions" placeholder="Select a system or application" required />
            <UiInput v-model="form.evaluator" label="Evaluator name" required placeholder="Enter your name" />
          </div>
        </UiPanel>

        <PageSection title="Nielsen's 10 usability heuristics" description="Note any issues and rate how severe they are.">
          <ol class="space-y-4">
            <li v-for="(heuristic, index) in heuristics" :key="index">
              <UiPanel :title="`${index + 1}. ${heuristic.name}`" :description="heuristic.description" heading-tag="h3">
                <div class="space-y-4">
                  <UiTextarea
                    v-model="form.heuristics[index].issues"
                    label="Issues found"
                    rows="3"
                    :placeholder="`Describe any issues related to ${heuristic.name.toLowerCase()}...`"
                  />
                  <UiSegmented v-model="form.heuristics[index].severity" label="Severity rating" :options="severityOptions" />
                </div>
              </UiPanel>
            </li>
          </ol>
        </PageSection>

        <UiPanel>
          <UiTextarea v-model="form.overallAssessment" label="Overall assessment" rows="4" placeholder="Provide an overall assessment and recommendations..." />
          <template #footer>
            <div class="flex flex-col gap-4">
              <InlineNotice :notice="notice" @dismiss="clearNotice" />
              <div class="flex justify-end gap-3">
                <UiButton variant="secondary" @click="resetForm">Reset</UiButton>
                <UiButton type="submit" variant="primary" :loading="isSubmitting">
                  {{ isSubmitting ? 'Submitting...' : 'Submit evaluation' }}
                </UiButton>
              </div>
            </div>
          </template>
        </UiPanel>
      </form>
    </PageSection>

    <PageSection v-if="results" title="Evaluation summary" divided>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UiStat label="Total issues" :value="results.totalIssues" />
        <UiStat label="Critical issues" :value="results.criticalIssues" :tone="results.criticalIssues > 0 ? 'danger' : 'neutral'" />
        <UiStat label="Overall score" :value="`${results.overallScore}/10`" tone="accent" />
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, reactive } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiInput, UiPanel, UiSegmented, UiSelect, UiStat, UiTextarea } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';

const { notice, showNotice, clearNotice } = useNotice();

// A user-facing reason the submission failed.
const describeSubmitError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message;
  const detail = Array.isArray(message) ? message.join(' ') : message;
  if (status === 503) {
    return `Storage is unavailable, so the evaluation was not saved. Please try again later.${detail ? ` (${detail})` : ''}`;
  }
  if (detail) return `The evaluation was not saved: ${detail}`;
  if (status) return `The evaluation was not saved (HTTP ${status}). Please try again.`;
  return 'Could not reach the server, so the evaluation was not saved. Check your connection and try again.';
};
const isSubmitting = ref(false);
const results = ref(null);

const systemOptions = [
  { value: 'design-system', label: 'Design System' },
  { value: 'web-app', label: 'Web Application' },
  { value: 'mobile-app', label: 'Mobile Application' },
  { value: 'admin-panel', label: 'Admin Panel' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'other', label: 'Other' }
];

const severityOptions = [
  { value: 0, label: 'No Issues' },
  { value: 1, label: 'Cosmetic' },
  { value: 2, label: 'Minor' },
  { value: 3, label: 'Major' },
  { value: 4, label: 'Critical' }
];

const heuristics = [
  {
    name: 'Visibility of System Status',
    description: 'The system should always keep users informed about what is going on, through appropriate feedback within reasonable time.'
  },
  {
    name: 'Match Between System and Real World',
    description: 'The system should speak the users\' language, with words, phrases and concepts familiar to the user, rather than system-oriented terms.'
  },
  {
    name: 'User Control and Freedom',
    description: 'Users often choose system functions by mistake and will need a clearly marked "emergency exit" to leave the unwanted state.'
  },
  {
    name: 'Consistency and Standards',
    description: 'Users should not have to wonder whether different words, situations, or actions mean the same thing.'
  },
  {
    name: 'Error Prevention',
    description: 'Even better than good error messages is a careful design which prevents a problem from occurring in the first place.'
  },
  {
    name: 'Recognition Rather Than Recall',
    description: 'Minimize the user\'s memory load by making objects, actions, and options visible.'
  },
  {
    name: 'Flexibility and Efficiency of Use',
    description: 'Accelerators — unseen by the novice user — may often speed up the interaction for the expert user.'
  },
  {
    name: 'Aesthetic and Minimalist Design',
    description: 'Dialogues should not contain information which is irrelevant or rarely needed.'
  },
  {
    name: 'Help Users Recognize, Diagnose, and Recover from Errors',
    description: 'Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.'
  },
  {
    name: 'Help and Documentation',
    description: 'Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation.'
  }
];

const form = reactive({
  systemName: '',
  evaluator: '',
  heuristics: heuristics.map(() => ({
    issues: '',
    severity: 0
  })),
  overallAssessment: ''
});

const resetForm = () => {
  form.systemName = '';
  form.evaluator = '';
  form.heuristics = heuristics.map(() => ({
    issues: '',
    severity: 0
  }));
  form.overallAssessment = '';
  results.value = null;
  clearNotice();
};

const calculateResults = () => {
  const totalIssues = form.heuristics.filter(h => h.issues.trim().length > 0).length;
  const criticalIssues = form.heuristics.filter(h => h.severity === 4).length;
  
  // Overall score 0-10: average severity (0-4) mapped so 0 -> 10 and 4 -> 0
  const severities = form.heuristics.map(h => h.severity);
  const avgSeverity = severities.reduce((a, b) => a + b, 0) / severities.length;
  const overallScore = Math.max(0, Math.min(10, 10 - avgSeverity * 2.5));
  
  return {
    totalIssues,
    criticalIssues,
    overallScore: Math.round(overallScore * 10) / 10
  };
};

const validate = () => {
  if (!form.systemName) return 'Choose the system or application you evaluated.';
  if (!form.evaluator.trim()) return 'Enter the evaluator name.';
  const undescribed = form.heuristics
    .map((h, index) => (h.severity > 0 && !h.issues.trim() ? heuristics[index].name : null))
    .filter(Boolean);
  if (undescribed.length > 0) {
    return `Describe the issues for every heuristic rated above "No Issues" (${undescribed.join('; ')}).`;
  }
  return null;
};

const submitEvaluation = async () => {
  const problem = validate();
  if (problem) {
    showNotice(problem, 'error');
    return;
  }

  isSubmitting.value = true;
  clearNotice();
  
  try {
    const evaluationData = {
      systemName: form.systemName,
      evaluator: form.evaluator.trim(),
      heuristics: form.heuristics.map((h, index) => ({
        heuristic: heuristics[index].name,
        issues: h.issues.trim(),
        severity: h.severity
      })),
      overallAssessment: form.overallAssessment.trim(),
      timestamp: new Date().toISOString()
    };
    
    await apiClient.post('/api/v1/heuristic-evaluation', evaluationData);
    
    results.value = calculateResults();
    showNotice('Evaluation submitted and saved.', 'success');
  } catch (error) {
    console.error('Failed to submit evaluation:', error);
    // The summary below is still shown, but nothing was stored.
    results.value = calculateResults();
    showNotice(describeSubmitError(error), 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
