<template>
  <PageShell width="wide">
    <UiSpinner v-if="loading" label="Loading project…" class="py-12" />

    <template v-else-if="loadError">
      <PageHero :back="{ to: '/tools/visual-regression', label: 'Visual regression' }" title="Project unavailable" size="tool" />
      <UiEmptyState title="This project couldn't be loaded" :body="loadError" spot="patterns/error-handling">
        <template #actions>
          <UiButton variant="primary" to="/tools/visual-regression">Back to projects</UiButton>
        </template>
      </UiEmptyState>
    </template>

    <template v-else-if="project">
      <PageHero
        :back="{ to: '/tools/visual-regression', label: 'Visual regression' }"
        :title="project.name"
        :lead="project.description || 'No description'"
        spot="admin/visual-regression"
        size="tool"
      >
        <template #actions>
          <UiButton variant="primary" icon="play_arrow" :disabled="testRunning" @click="triggerTest">
            {{ testRunning ? 'Running…' : 'Run tests' }}
          </UiButton>
        </template>
      </PageHero>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

      <UiTabs v-model="activeTab" :tabs="tabs" label="Project views">
        <template #overview>
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UiStat label="Total runs" :value="totalRunCount" />
              <UiStat label="Last run"><span class="text-lg">{{ lastRun ? formatDate(lastRun.startedAt) : 'Never' }}</span></UiStat>
              <UiStat label="Status"><span class="text-lg">{{ lastRun?.status || 'No runs' }}</span></UiStat>
            </div>

            <UiPanel title="Project configuration" heading-tag="h3">
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Argos project ID</dt>
                  <dd class="font-code text-ink">{{ project.argosProjectId }}</dd>
                </div>
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Branch</dt>
                  <dd class="text-ink">{{ project.argosBranch }}</dd>
                </div>
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Team</dt>
                  <dd class="text-ink">{{ project.teamId }}</dd>
                </div>
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Created</dt>
                  <dd class="text-ink">{{ formatDate(project.createdAt) }}</dd>
                </div>
              </dl>
            </UiPanel>
          </div>
        </template>

        <template #runs>
          <UiEmptyState
            v-if="testRuns.length === 0"
            title="No test runs yet"
            body="Run your first visual regression test to get started"
            spot="admin/visual-regression"
          >
            <template #actions>
              <UiButton variant="primary" icon="play_arrow" :disabled="testRunning" @click="triggerTest">Run tests</UiButton>
            </template>
          </UiEmptyState>

          <UiPanel v-else flush>
            <UiTable caption="Test runs, newest first">
              <thead>
                <tr>
                  <th scope="col">Status</th>
                  <th scope="col">Commit</th>
                  <th scope="col">Started</th>
                  <th scope="col">Total</th>
                  <th scope="col">Passed</th>
                  <th scope="col">Failed</th>
                  <th scope="col">New</th>
                  <th scope="col"><span class="sr-only">Results</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="run in testRuns" :key="run.id">
                  <td><UiChip :tone="statusTone(run.status)">{{ run.status }}</UiChip></td>
                  <td class="font-code">{{ run.commitSha ? run.commitSha.substring(0, 7) : 'N/A' }}</td>
                  <td class="whitespace-nowrap">{{ formatDate(run.startedAt) }}</td>
                  <td>{{ run.resultsSummary?.total ?? '—' }}</td>
                  <td class="text-success">{{ run.resultsSummary?.passed ?? '—' }}</td>
                  <td class="text-danger">{{ run.resultsSummary?.failed ?? '—' }}</td>
                  <td class="text-warning">{{ run.resultsSummary?.new ?? '—' }}</td>
                  <td class="text-right">
                    <UiLink :to="`/tools/visual-regression/${route.params.id}/runs/${run.id}`" arrow>
                      View results<span class="sr-only"> for the run started {{ formatDate(run.startedAt) }}</span>
                    </UiLink>
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>
        </template>

        <template #settings>
          <div class="space-y-6">
            <UiPanel title="Project settings" heading-tag="h3">
              <form id="vr-project-settings" class="space-y-5" @submit.prevent="updateProject">
                <UiInput v-model="projectForm.name" label="Project name" />
                <UiTextarea v-model="projectForm.description" label="Description" :rows="3" />
                <UiInput
                  v-model="projectForm.argosBranch"
                  label="Argos branch"
                  placeholder="develop"
                  hint="The branch new test runs compare against (defaults to develop)"
                />
                <UiInput
                  v-model="projectForm.argosBaseUrl"
                  type="url"
                  label="Argos URL"
                  placeholder="https://app.argos-ci.com"
                  hint="Self-hosted Argos URLs must be on the server's allow-list."
                />
                <InlineNotice :notice="settingsNotice" @dismiss="clearSettingsNotice" />
              </form>
              <template #footer>
                <div class="flex justify-end gap-3">
                  <UiButton @click="resetForm">Cancel</UiButton>
                  <UiButton variant="primary" type="submit" form="vr-project-settings" :loading="saving">
                    {{ saving ? 'Saving…' : 'Save changes' }}
                  </UiButton>
                </div>
              </template>
            </UiPanel>

            <UiPanel
              title="Argos webhooks"
              heading-tag="h3"
              description="Argos sends build results here. Webhooks are accepted only when they are signed with this project's secret."
            >
              <dl class="grid gap-4 sm:grid-cols-2 mb-5 text-sm">
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Status</dt>
                  <dd class="text-ink">{{ project.hasWebhookSecret ? 'Secret set: webhooks are accepted' : 'No secret: webhooks are refused' }}</dd>
                </div>
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Webhook URL</dt>
                  <dd class="font-code break-all text-ink">{{ webhookUrl }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="font-medium mb-1 text-ink-secondary">Signature</dt>
                  <dd class="text-ink">
                    <UiCode>x-argos-signature: sha256=&lt;HMAC-SHA256 of the request body&gt;</UiCode>, with the event name in <UiCode>x-argos-event</UiCode>
                  </dd>
                </div>
              </dl>

              <div v-if="revealedSecret" class="mb-5 flex flex-wrap items-end gap-2 rounded-tile border border-warning-border bg-warning-bg p-4">
                <div class="flex-1 min-w-0">
                  <UiInput
                    id="webhook-secret"
                    :model-value="revealedSecret"
                    label="Copy this secret into Argos now. It won't be shown again."
                    readonly
                    mono
                    @focus="$event.target.select()"
                  />
                </div>
                <UiButton :icon="secretCopied ? 'check' : 'content_copy'" @click="copySecret">{{ secretCopied ? 'Copied' : 'Copy' }}</UiButton>
              </div>

              <InlineNotice :notice="webhookNotice" class="mb-4" @dismiss="clearWebhookNotice" />

              <div class="flex flex-wrap gap-3">
                <UiButton variant="primary" :disabled="webhookBusy" @click="generateWebhookSecret">
                  {{ project.hasWebhookSecret ? 'Replace secret' : 'Generate secret' }}
                </UiButton>
                <UiButton v-if="project.hasWebhookSecret" variant="danger" :disabled="webhookBusy" @click="removeWebhookSecret">
                  Remove secret
                </UiButton>
              </div>
            </UiPanel>
          </div>
        </template>
      </UiTabs>
    </template>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageShell,
  UiButton,
  UiChip,
  UiCode,
  UiEmptyState,
  UiInput,
  UiLink,
  UiPanel,
  UiSpinner,
  UiStat,
  UiTable,
  UiTabs,
  UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';

const route = useRoute();
const { notice, showNotice, clearNotice } = useNotice();
const { notice: settingsNotice, showNotice: showSettingsNotice, clearNotice: clearSettingsNotice } = useNotice();
const project = ref(null);
const loading = ref(false);
const loadError = ref('');
const activeTab = ref('overview');
const testRuns = ref([]);
const totalRunCount = ref(0);
const testRunning = ref(false);
const saving = ref(false);

const tabs = computed(() => [
  { value: 'overview', label: 'Overview' },
  { value: 'runs', label: 'Test runs', count: totalRunCount.value },
  { value: 'settings', label: 'Settings' },
]);

const { notice: webhookNotice, showNotice: showWebhookNotice, clearNotice: clearWebhookNotice } = useNotice();
const webhookBusy = ref(false);
const revealedSecret = ref('');
const secretCopied = ref(false);

const projectForm = ref({
  name: '',
  description: '',
  argosBranch: 'develop',
  argosBaseUrl: '',
});

const API_PATH = '/api/v1/visual-regression';
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40; // stop polling after ~2 minutes
let pollTimer = null;
let pollCount = 0;
let unmounted = false;

// The server's message (e.g. the 400 for an Argos URL that isn't allow-listed)
// or a readable fallback.
const apiErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  if (status === 401) return 'You are not signed in, or your API key was rejected.';
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(' ');
  if (typeof message === 'string' && message) return message;
  if (!error?.response) return 'Could not reach the server. Check your connection and try again.';
  return fallback;
};

const projectPath = () => `${API_PATH}/projects/${encodeURIComponent(route.params.id)}`;

const formFromProject = (p) => ({
  name: p.name,
  description: p.description || '',
  argosBranch: p.argosBranch || 'develop',
  argosBaseUrl: p.argosBaseUrl || '',
});

const loadProject = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const response = await apiClient.get(projectPath());
    project.value = response.data;
    projectForm.value = formFromProject(project.value);
    await loadTestRuns();
  } catch (error) {
    console.error('Failed to load project:', error);
    project.value = null;
    loadError.value = error?.response?.status === 404
      ? 'This project does not exist or was deleted.'
      : apiErrorMessage(error, 'Failed to load project.');
  } finally {
    loading.value = false;
  }
};

const loadTestRuns = async () => {
  try {
    const response = await apiClient.get(`${projectPath()}/runs`, { params: { page: 1, limit: 100 } });
    // The endpoint is paginated: { data, pagination }
    const body = response.data;
    testRuns.value = Array.isArray(body) ? body : body?.data ?? [];
    totalRunCount.value = body?.pagination?.total ?? testRuns.value.length;
  } catch (error) {
    console.error('Failed to load test runs:', error);
    showNotice(apiErrorMessage(error, 'Failed to load test runs.'), 'error');
  }
};

const hasActiveRun = () => testRuns.value.some((run) => run.status === 'pending' || run.status === 'running');

const stopPolling = () => {
  clearTimeout(pollTimer);
  pollTimer = null;
};

// Refresh the run list until no run is pending/running (or we give up).
const pollRuns = () => {
  stopPolling();
  pollTimer = setTimeout(async () => {
    if (unmounted) return;
    await loadTestRuns();
    pollCount += 1;
    if (!unmounted && hasActiveRun() && pollCount < MAX_POLLS) {
      pollRuns();
    } else {
      testRunning.value = false;
    }
  }, POLL_INTERVAL_MS);
};

const triggerTest = async () => {
  if (!project.value) return;
  testRunning.value = true;
  try {
    await apiClient.post(`${projectPath()}/runs`, {
      branch: project.value.argosBranch || 'develop',
    });
    showNotice('Test run started.', 'success');
    pollCount = 0;
    pollRuns();
  } catch (error) {
    console.error('Failed to trigger test:', error);
    showNotice(apiErrorMessage(error, 'Failed to trigger test.'), 'error');
    testRunning.value = false;
  }
};

// Where Argos should send webhooks: the API's own origin
const webhookUrl = computed(() => {
  const base = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/+$/, '');
  return `${base}${API_PATH}/webhooks/argos`;
});

const generateWebhookSecret = async () => {
  if (!project.value) return;
  if (project.value.hasWebhookSecret && !window.confirm('Replace the webhook secret? Argos must be updated with the new one, or its webhooks will be refused.')) return;
  webhookBusy.value = true;
  clearWebhookNotice();
  secretCopied.value = false;
  try {
    const { data } = await apiClient.post(`${projectPath()}/webhook-secret`, {});
    revealedSecret.value = data.secret;
    project.value = { ...project.value, hasWebhookSecret: true };
  } catch (error) {
    showWebhookNotice(apiErrorMessage(error, 'The webhook secret could not be set.'), 'error');
  } finally {
    webhookBusy.value = false;
  }
};

const removeWebhookSecret = async () => {
  if (!project.value || !window.confirm('Remove the webhook secret? Argos webhooks for this project will be refused.')) return;
  webhookBusy.value = true;
  clearWebhookNotice();
  try {
    await apiClient.delete(`${projectPath()}/webhook-secret`);
    revealedSecret.value = '';
    project.value = { ...project.value, hasWebhookSecret: false };
    showWebhookNotice('Webhook secret removed.', 'success');
  } catch (error) {
    showWebhookNotice(apiErrorMessage(error, 'The webhook secret could not be removed.'), 'error');
  } finally {
    webhookBusy.value = false;
  }
};

// A shown secret belongs to one project
watch(() => route.params.id, () => {
  revealedSecret.value = '';
  secretCopied.value = false;
  clearWebhookNotice();
});

const copySecret = async () => {
  try {
    await navigator.clipboard.writeText(revealedSecret.value);
    secretCopied.value = true;
  } catch {
    showWebhookNotice('Copy failed. Select the secret and copy it yourself.', 'error');
  }
};

const updateProject = async () => {
  if (!project.value) return;
  const name = projectForm.value.name.trim();
  if (!name) {
    showSettingsNotice('Project name is required.', 'error');
    return;
  }
  saving.value = true;
  clearSettingsNotice();
  try {
    const payload = {
      name,
      description: projectForm.value.description,
      argosBranch: projectForm.value.argosBranch.trim() || 'develop',
    };
    // Only send the Argos URL when it changed: the server re-checks the
    // connection (and its allow-list) whenever it is present.
    const baseUrl = projectForm.value.argosBaseUrl.trim();
    if (baseUrl && baseUrl !== (project.value.argosBaseUrl || '')) {
      payload.argosBaseUrl = baseUrl;
    }
    await apiClient.put(projectPath(), payload);
    showSettingsNotice('Project updated successfully.', 'success');
    await loadProject();
  } catch (error) {
    console.error('Failed to update project:', error);
    showSettingsNotice(apiErrorMessage(error, 'Failed to update project.'), 'error');
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  if (project.value) {
    projectForm.value = formFromProject(project.value);
  }
  clearSettingsNotice();
};

const statusTone = (status) =>
  ({ pending: 'warning', running: 'info', completed: 'success', failed: 'danger' })[status] ?? 'warning';

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? 'Never' : date.toLocaleString();
};

// Runs come back newest first
const lastRun = computed(() => {
  return testRuns.value.length > 0 ? testRuns.value[0] : null;
});

// Navigating from one project to another reuses this component.
watch(() => route.params.id, (id, oldId) => {
  if (id && id !== oldId) {
    stopPolling();
    testRunning.value = false;
    activeTab.value = 'overview';
    loadProject();
  }
});

onMounted(() => {
  loadProject();
});

onBeforeUnmount(() => {
  unmounted = true;
  stopPolling();
});
</script>
