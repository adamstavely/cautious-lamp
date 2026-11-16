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
          <UiButton icon="refresh-cw" :loading="refreshing" @click="refreshRuns">Check Argos for builds</UiButton>
          <UiButton variant="primary" icon="terminal" @click="activeTab = 'ci'">Set up CI</UiButton>
        </template>
      </PageHero>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

      <UiTabs v-model="activeTab" :tabs="tabs" label="Project views">
        <template #overview>
          <div class="space-y-6">
            <UiPanel title="Period" heading-tag="h3" description="Limits the analytics below and the test runs list to builds started in these days.">
              <div class="grid gap-4 sm:grid-cols-3 items-end">
                <UiInput v-model="range.from" type="date" label="From" :max="range.to || undefined" />
                <UiInput v-model="range.to" type="date" label="To" :min="range.from || undefined" />
                <div>
                  <UiButton v-if="range.from || range.to" variant="ghost" @click="range = { from: '', to: '' }">Clear dates</UiButton>
                </div>
              </div>
            </UiPanel>

            <UiSpinner v-if="analyticsLoading && !analytics" label="Loading analytics…" class="py-8" />
            <InlineNotice v-else-if="analyticsNotice" :notice="analyticsNotice" @dismiss="clearAnalyticsNotice" />
            <template v-else-if="analytics">
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <UiStat label="Builds" :value="analytics.totalRuns" />
                <UiStat label="Passed" tone="success" :value="analytics.passedRuns" hint="No changes, or changes accepted" />
                <UiStat label="To review" tone="warning" :value="analytics.changedRuns" hint="Changes detected" />
                <UiStat label="Failed" tone="danger" :value="analytics.failedRuns" hint="Rejected, or the build failed" />
                <UiStat label="Average test time" :value="analytics.averageDuration ? formatDuration(analytics.averageDuration) : '—'" />
              </div>

              <UiPanel v-if="analytics.trends.length" title="By day" heading-tag="h3" flush>
                <UiTable caption="Builds per day by outcome">
                  <thead>
                    <tr>
                      <th scope="col">Day</th>
                      <th scope="col">Passed</th>
                      <th scope="col">To review</th>
                      <th scope="col">Failed</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="day in analytics.trends" :key="day.date">
                      <td class="whitespace-nowrap">{{ formatDay(day.date) }}</td>
                      <td class="text-success">{{ day.passed }}</td>
                      <td class="text-warning">{{ day.changed }}</td>
                      <td class="text-danger">{{ day.failed }}</td>
                    </tr>
                  </tbody>
                </UiTable>
              </UiPanel>
              <p v-else class="text-sm text-ink-secondary">No builds in this period.</p>
            </template>

            <UiPanel title="Project configuration" heading-tag="h3">
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Argos project</dt>
                  <dd class="font-code text-ink">{{ project.argosProjectId }}</dd>
                </div>
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Compared against</dt>
                  <dd class="text-ink">{{ project.currentBaselineId ? 'The current baseline' : `Latest approved build on ${project.argosBranch}` }}</dd>
                </div>
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Team</dt>
                  <dd class="text-ink">{{ project.teamId }}</dd>
                </div>
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Created</dt>
                  <dd class="text-ink">{{ formatDateTime(project.createdAt) }}</dd>
                </div>
              </dl>
            </UiPanel>
          </div>
        </template>

        <template #runs>
          <p v-if="range.from || range.to" class="mb-4 text-sm text-ink-secondary" role="status">
            Showing builds started {{ rangeText }}.
            <UiButton size="sm" variant="ghost" @click="range = { from: '', to: '' }">Show all</UiButton>
          </p>
          <UiEmptyState
            v-if="testRuns.length === 0"
            :title="range.from || range.to ? 'No builds in this period' : 'No builds yet'"
            body="Builds appear here once your CI uploads screenshots to Argos."
            spot="admin/visual-regression"
          >
            <template #actions>
              <UiButton variant="primary" icon="terminal" @click="activeTab = 'ci'">Set up CI</UiButton>
            </template>
          </UiEmptyState>

          <UiPanel v-else flush>
            <UiTable caption="Builds, newest first">
              <thead>
                <tr>
                  <th scope="col">Build</th>
                  <th scope="col">Status</th>
                  <th scope="col">Branch</th>
                  <th scope="col">Commit</th>
                  <th scope="col">Started</th>
                  <th scope="col">Total</th>
                  <th scope="col">Changed</th>
                  <th scope="col">New</th>
                  <th scope="col"><span class="sr-only">Results</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="run in testRuns" :key="run.id">
                  <td>{{ run.argosBuildNumber !== undefined ? `#${run.argosBuildNumber}` : '—' }}</td>
                  <td><UiChip :tone="runTone(run)">{{ runStatusLabel(run) }}</UiChip></td>
                  <td>{{ run.branch || '—' }}</td>
                  <td class="font-code">{{ run.commitSha ? run.commitSha.substring(0, 7) : '—' }}</td>
                  <td class="whitespace-nowrap">{{ formatDateTime(run.startedAt) }}</td>
                  <td>{{ run.resultsSummary?.total ?? '—' }}</td>
                  <td class="text-danger">{{ run.resultsSummary?.failed ?? '—' }}</td>
                  <td class="text-warning">{{ run.resultsSummary?.new ?? '—' }}</td>
                  <td class="text-right">
                    <UiLink :to="`/tools/visual-regression/${route.params.id}/runs/${run.id}`" arrow>
                      View results<span class="sr-only"> for build {{ run.argosBuildNumber ?? run.id }}</span>
                    </UiLink>
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>
        </template>

        <template #baselines>
          <VrBaselines :project-path="projectPath()" :runs="allRuns" @changed="onBaselineChanged" />
        </template>

        <template #ci>
          <VrCiSetup :project-path="projectPath()" :version="setupVersion" />
        </template>

        <template #settings>
          <div class="space-y-6">
            <UiPanel title="Project settings" heading-tag="h3">
              <form id="vr-project-settings" class="space-y-5" @submit.prevent="updateProject">
                <UiInput v-model="projectForm.name" label="Project name" />
                <UiTextarea v-model="projectForm.description" label="Description" :rows="3" />
                <UiInput
                  v-model="projectForm.argosBranch"
                  label="Base branch"
                  placeholder="develop"
                  hint="Builds are compared against the latest approved build on this branch until a baseline is recorded."
                />
                <UiInput
                  v-model="projectForm.argosBaseUrl"
                  type="url"
                  label="Argos API URL"
                  placeholder="https://api.argos-ci.com/v2"
                  hint="Only for a self-hosted Argos. Must be on the server's allow-list."
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

            <VrTestSettings :project="project" :project-path="projectPath()" @saved="onTestSettingsSaved" />

            <VrSharing :project="project" :project-path="projectPath()" />

            <UiPanel
              title="Build notifications"
              heading-tag="h3"
              description="Argos doesn't send webhooks, so new builds are read from its API when runs are listed. With a secret, your CI can report each upload so it shows up at once (the command is under Set up CI)."
            >
              <dl class="grid gap-4 sm:grid-cols-2 mb-5 text-sm">
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Status</dt>
                  <dd class="text-ink">{{ project.hasWebhookSecret ? 'Secret set: notifications are accepted' : 'No secret: notifications are refused' }}</dd>
                </div>
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">Notification URL</dt>
                  <dd class="font-code break-all text-ink">{{ webhookUrl }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="font-medium mb-1 text-ink-secondary">Signature</dt>
                  <dd class="text-ink">
                    <UiCode>x-argos-signature: sha256=&lt;HMAC-SHA256 of the request body&gt;</UiCode>
                  </dd>
                </div>
              </dl>

              <div v-if="revealedSecret" class="mb-5 flex flex-wrap items-end gap-2 rounded-tile border border-warning-border bg-warning-bg p-4">
                <div class="flex-1 min-w-0">
                  <UiInput
                    id="webhook-secret"
                    :model-value="revealedSecret"
                    label="Store this as ARGOS_WEBHOOK_SECRET in your CI now. It won't be shown again."
                    readonly
                    mono
                    @focus="$event.target.select()"
                  />
                </div>
                <UiButton :icon="secretCopied ? 'check' : 'copy'" @click="copySecret">{{ secretCopied ? 'Copied' : 'Copy' }}</UiButton>
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

            <VrNotificationSettings :project-id="project.id" />

            <UiPanel
              title="Delete project"
              heading-tag="h3"
              description="Removes this project with its runs, results and baselines here. The project in Argos is not touched."
            >
              <UiButton variant="danger" icon="trash-2" @click="openDeleteDialog">Delete project</UiButton>
            </UiPanel>
          </div>
        </template>
      </UiTabs>

      <UiDialog
        :open="deleteDialogOpen"
        :title="`Delete ${project.name}?`"
        size="sm"
        @update:open="(open) => { if (!open) closeDeleteDialog(); }"
      >
        <p>
          The project <strong class="text-ink-strong">{{ project.name }}</strong> and its runs, results and baselines will be
          deleted. This can't be undone.
        </p>
        <UiCallout v-if="deleteError" tone="danger" role="alert">{{ deleteError }}</UiCallout>
        <template #footer>
          <UiButton :disabled="deleting" @click="closeDeleteDialog">Cancel</UiButton>
          <UiButton variant="danger" icon="trash-2" :loading="deleting" @click="deleteProject">
            {{ deleting ? 'Deleting…' : 'Delete project' }}
          </UiButton>
        </template>
      </UiDialog>
    </template>
  </PageShell>
</template>

<script setup>
import { confirmDialog } from '../composables/useConfirm.js';
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import VrBaselines from '../components/visual-regression/VrBaselines.vue';
import VrCiSetup from '../components/visual-regression/VrCiSetup.vue';
import VrSharing from '../components/visual-regression/VrSharing.vue';
import VrTestSettings from '../components/visual-regression/VrTestSettings.vue';
import { VR_API_PATH, formatDateTime, setListNotice, vrErrorMessage } from '../components/visual-regression/vrApi.js';
import VrNotificationSettings from '../components/visual-regression/VrNotificationSettings.vue';
import {
  PageHero,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiCode,
  UiDialog,
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
import { ARGOS_STATUS_LABELS } from '../utils/visualRegressionReport.js';

const route = useRoute();
const router = useRouter();
const { notice, showNotice, clearNotice } = useNotice();
const { notice: settingsNotice, showNotice: showSettingsNotice, clearNotice: clearSettingsNotice } = useNotice();
const { notice: analyticsNotice, showNotice: showAnalyticsNotice, clearNotice: clearAnalyticsNotice } = useNotice();
const project = ref(null);
const loading = ref(false);
const loadError = ref('');
const activeTab = ref('overview');
// Runs in the chosen period (the Test runs tab) and every run (to pick a baseline)
const testRuns = ref([]);
const allRuns = ref([]);
const totalRunCount = ref(0);
const refreshing = ref(false);
const saving = ref(false);
const analytics = ref(null);
const analyticsLoading = ref(false);
/** Days (YYYY-MM-DD) limiting the analytics and the runs list */
const range = ref({ from: '', to: '' });
/** Bumped when the CI setup's inputs change */
const setupVersion = ref(0);

const tabs = computed(() => [
  { value: 'overview', label: 'Overview' },
  { value: 'runs', label: 'Test runs', count: totalRunCount.value },
  { value: 'baselines', label: 'Baselines' },
  { value: 'ci', label: 'CI setup' },
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

// Argos sends nothing, so the page asks for runs again: often while a build
// is still being compared, now and then otherwise to pick up new uploads.
const ACTIVE_POLL_MS = 10_000;
const IDLE_POLL_MS = 60_000;
let pollTimer = null;
let unmounted = false;

const projectPath = () => `${VR_API_PATH}/projects/${encodeURIComponent(route.params.id)}`;

const formFromProject = (p) => ({
  name: p.name,
  description: p.description || '',
  argosBranch: p.argosBranch || 'develop',
  argosBaseUrl: p.argosBaseUrl || '',
});

const rangeParams = () => ({
  ...(range.value.from ? { from: range.value.from } : {}),
  ...(range.value.to ? { to: range.value.to } : {}),
});

const rangeText = computed(() => {
  const { from, to } = range.value;
  if (from && to) return `from ${formatDay(from)} to ${formatDay(to)}`;
  return from ? `on or after ${formatDay(from)}` : `on or before ${formatDay(to)}`;
});

const loadProject = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const response = await apiClient.get(projectPath());
    project.value = response.data;
    projectForm.value = formFromProject(project.value);
    await Promise.all([loadTestRuns(), loadAnalytics()]);
    schedulePoll();
  } catch (error) {
    console.error('Failed to load project:', error);
    project.value = null;
    loadError.value = error?.response?.status === 404
      ? 'This project does not exist or was deleted.'
      : vrErrorMessage(error, 'Failed to load project.');
  } finally {
    loading.value = false;
  }
};

const listRuns = async (params) => {
  const body = (await apiClient.get(`${projectPath()}/runs`, { params: { page: 1, limit: 100, ...params } })).data;
  // The endpoint is paginated: { data, pagination }
  const runs = Array.isArray(body) ? body : body?.data ?? [];
  return { runs, total: body?.pagination?.total ?? runs.length };
};

const loadTestRuns = async () => {
  try {
    const filtered = rangeParams();
    const all = await listRuns({});
    allRuns.value = all.runs;
    if (Object.keys(filtered).length) {
      const inRange = await listRuns(filtered);
      testRuns.value = inRange.runs;
      totalRunCount.value = inRange.total;
    } else {
      testRuns.value = all.runs;
      totalRunCount.value = all.total;
    }
  } catch (error) {
    console.error('Failed to load test runs:', error);
    showNotice(vrErrorMessage(error, 'Failed to load test runs.'), 'error');
  }
};

const loadAnalytics = async () => {
  analyticsLoading.value = true;
  clearAnalyticsNotice();
  try {
    const params = {};
    if (range.value.from) params.startDate = range.value.from;
    if (range.value.to) params.endDate = range.value.to;
    analytics.value = (await apiClient.get(`${projectPath()}/analytics`, { params })).data;
  } catch (error) {
    analytics.value = null;
    showAnalyticsNotice(vrErrorMessage(error, 'Analytics could not be loaded.'), 'error');
  } finally {
    analyticsLoading.value = false;
  }
};

const hasActiveRun = () => allRuns.value.some((run) => run.status === 'pending' || run.status === 'running');

const stopPolling = () => {
  clearTimeout(pollTimer);
  pollTimer = null;
};

const schedulePoll = () => {
  stopPolling();
  if (unmounted) return;
  pollTimer = setTimeout(async () => {
    if (unmounted) return;
    await loadTestRuns();
    schedulePoll();
  }, hasActiveRun() ? ACTIVE_POLL_MS : IDLE_POLL_MS);
};

const refreshRuns = async () => {
  refreshing.value = true;
  try {
    await Promise.all([loadTestRuns(), loadAnalytics()]);
    schedulePoll();
  } finally {
    refreshing.value = false;
  }
};

watch(range, () => {
  if (!project.value) return;
  loadTestRuns();
  loadAnalytics();
}, { deep: true });

const onBaselineChanged = async () => {
  setupVersion.value += 1;
  try {
    project.value = (await apiClient.get(projectPath())).data;
  } catch {
    // The baseline list already shows the change
  }
};

const onTestSettingsSaved = (updated) => {
  project.value = updated;
  setupVersion.value += 1;
};

// Where CI posts build notifications: the API's own origin
const webhookUrl = computed(() => {
  const base = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/+$/, '');
  return `${base}${VR_API_PATH}/webhooks/argos`;
});

const generateWebhookSecret = async () => {
  if (!project.value) return;
  if (project.value.hasWebhookSecret && !(await confirmDialog({ title: 'Replace the webhook secret?', message: 'CI must be updated with the new one, or its notifications will be refused.', confirmLabel: 'Replace secret', danger: true }))) return;
  webhookBusy.value = true;
  clearWebhookNotice();
  secretCopied.value = false;
  try {
    const { data } = await apiClient.post(`${projectPath()}/webhook-secret`, {});
    revealedSecret.value = data.secret;
    project.value = { ...project.value, hasWebhookSecret: true };
    setupVersion.value += 1;
  } catch (error) {
    showWebhookNotice(vrErrorMessage(error, 'The secret could not be set.'), 'error');
  } finally {
    webhookBusy.value = false;
  }
};

const removeWebhookSecret = async () => {
  if (!project.value || !(await confirmDialog({ title: 'Remove the webhook secret?', message: 'Build notifications from CI will be refused.', confirmLabel: 'Remove secret', danger: true }))) return;
  webhookBusy.value = true;
  clearWebhookNotice();
  try {
    await apiClient.delete(`${projectPath()}/webhook-secret`);
    revealedSecret.value = '';
    project.value = { ...project.value, hasWebhookSecret: false };
    setupVersion.value += 1;
    showWebhookNotice('Secret removed.', 'success');
  } catch (error) {
    showWebhookNotice(vrErrorMessage(error, 'The secret could not be removed.'), 'error');
  } finally {
    webhookBusy.value = false;
  }
};

const copySecret = async () => {
  try {
    await navigator.clipboard.writeText(revealedSecret.value);
    secretCopied.value = true;
  } catch {
    showWebhookNotice('Copy failed. Select the secret and copy it yourself.', 'error');
  }
};

// Deleting the project: confirmed in a dialog naming it, then back to the list
const deleteDialogOpen = ref(false);
const deleting = ref(false);
const deleteError = ref('');

const openDeleteDialog = () => {
  deleteError.value = '';
  deleteDialogOpen.value = true;
};

const closeDeleteDialog = () => {
  if (deleting.value) return;
  deleteDialogOpen.value = false;
  deleteError.value = '';
};

const deleteProject = async () => {
  if (!project.value || deleting.value) return;
  const name = project.value.name;
  deleting.value = true;
  deleteError.value = '';
  try {
    await apiClient.delete(projectPath());
    stopPolling();
    deleteDialogOpen.value = false;
    setListNotice(`Project "${name}" deleted.`);
    await router.push('/tools/visual-regression');
  } catch (error) {
    console.error('Failed to delete project:', error);
    deleteError.value = vrErrorMessage(error, 'Failed to delete the project. Please try again.');
  } finally {
    deleting.value = false;
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
    const { data } = await apiClient.put(projectPath(), payload);
    project.value = data;
    projectForm.value = formFromProject(data);
    setupVersion.value += 1;
    showSettingsNotice('Project updated successfully.', 'success');
  } catch (error) {
    console.error('Failed to update project:', error);
    showSettingsNotice(vrErrorMessage(error, 'Failed to update project.'), 'error');
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

const runStatusLabel = (run) => ARGOS_STATUS_LABELS[run.argosStatus] ?? run.status;

const runTone = (run) => {
  if (run.status === 'failed' || run.argosStatus === 'rejected') return 'danger';
  if (run.argosStatus === 'changes-detected') return 'warning';
  if (run.status === 'completed') return 'success';
  return run.status === 'running' ? 'info' : 'warning';
};

const formatDay = (day) => {
  const date = new Date(`${day}T00:00:00`);
  return Number.isNaN(date.getTime()) ? day : date.toLocaleDateString();
};

const formatDuration = (ms) => {
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
};

// Navigating from one project to another reuses this component.
watch(() => route.params.id, (id, oldId) => {
  if (id && id !== oldId) {
    stopPolling();
    revealedSecret.value = '';
    secretCopied.value = false;
    clearWebhookNotice();
    activeTab.value = 'overview';
    range.value = { from: '', to: '' };
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
