<template>
  <PageShell width="wide">
    <UiSpinner v-if="loading" label="Loading project…" class="py-12" />

    <template v-else-if="project">
      <PageHero
        :back="{ to: '/hcd/session-replay', label: 'Session replay' }"
        :title="project.name"
        :lead="project.description || 'No description'"
        spot="site/session-replay"
        size="tool"
      />

      <UiTabs :model-value="activeTab" :tabs="tabs" label="Project views" @update:model-value="selectTab">
        <template #overview>
          <div class="space-y-6">
            <UiCallout v-if="setupGaps.length" tone="warning" title="Finish setting up this project">
              <ul class="list-disc space-y-1 pl-5">
                <li v-for="gap in setupGaps" :key="gap">{{ gap }}</li>
              </ul>
              <div class="mt-3">
                <UiButton size="sm" icon="settings" @click="selectTab('settings')">Open settings</UiButton>
              </div>
            </UiCallout>

            <UiPanel
              title="Install the tracker"
              heading-tag="h3"
              description="Add OpenReplay's tracker to your application. The code carries this project's privacy and capture settings."
            >
              <UiSpinner v-if="integrationLoading" label="Loading integration code…" />
              <UiCallout v-else-if="integrationProblem" tone="warning">{{ integrationProblem.message }}</UiCallout>
              <div v-else-if="integration" class="space-y-4">
                <UiSegmented v-model="installMethod" :options="installOptions" label="Install with" />
                <template v-if="installMethod === 'script'">
                  <p class="text-sm text-ink-secondary">Paste this into the &lt;head&gt; of every page. It loads openreplay.js from OpenReplay's CDN.</p>
                  <UiCodeBlock :code="integration.script" label="HTML" @copied="onCopied" @copy-failed="onCopyFailed" />
                </template>
                <template v-else>
                  <UiCodeBlock :code="integration.npmInstall" label="Terminal" @copied="onCopied" @copy-failed="onCopyFailed" />
                  <UiCodeBlock :code="integration.npm" label="JavaScript" @copied="onCopied" @copy-failed="onCopyFailed" />
                </template>
                <p class="text-sm text-ink-secondary">
                  Sessions are listed here by user, so give the tracker the signed-in user's ID (setUserID) once you know it.
                </p>
              </div>
            </UiPanel>

            <UiPanel title="Project configuration" heading-tag="h3">
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div v-for="item in configuration" :key="item.label">
                  <dt class="mb-1 font-medium text-ink-secondary">{{ item.label }}</dt>
                  <dd class="break-all text-ink" :class="{ 'font-code': item.mono }">{{ item.value }}</dd>
                </div>
              </dl>
            </UiPanel>
          </div>
        </template>

        <template #sessions>
          <UiPanel
            title="Find sessions"
            heading-tag="h3"
            description="OpenReplay's API lists sessions one user at a time: enter the ID your app gives the tracker with setUserID."
          >
            <form class="grid gap-4 md:grid-cols-6 md:items-end" @submit.prevent="searchSessions(1)">
              <div class="md:col-span-2">
                <UiInput v-model="filters.userId" id="session-user-id" label="User ID" required icon="search" placeholder="e.g. user-1234" />
              </div>
              <UiInput v-model="filters.startDate" id="session-start-date" type="date" label="From" />
              <UiInput v-model="filters.endDate" id="session-end-date" type="date" label="To" />
              <div class="md:col-span-2">
                <UiSelect v-model="filters.sortOrder" id="session-sort" label="Order" :options="sortOptions" />
              </div>
              <div class="flex gap-3 md:col-span-6">
                <UiButton variant="primary" type="submit" icon="search" :loading="sessionsLoading">Find sessions</UiButton>
                <UiButton v-if="sessionsPage" icon="refresh-cw" @click="searchSessions(sessionsPage.page)">Refresh</UiButton>
              </div>
            </form>
          </UiPanel>

          <div class="mt-6">
            <UiSpinner v-if="sessionsLoading" label="Loading sessions…" class="py-12" />

            <UiEmptyState
              v-else-if="sessionsProblem"
              :title="problemTitle(sessionsProblem)"
              :body="sessionsProblem.message"
              :spot="sessionsProblem.code === 'OPENREPLAY_ERROR' || !sessionsProblem.code ? 'patterns/error-handling' : 'site/session-replay'"
            >
              <template v-if="needsSettings(sessionsProblem)" #actions>
                <UiButton variant="primary" icon="settings" @click="selectTab('settings')">Open settings</UiButton>
              </template>
            </UiEmptyState>

            <UiEmptyState
              v-else-if="!sessionsPage"
              title="Search for a user's sessions"
              body="Enter a user ID to see that user's recorded sessions. Without dates, the last 7 days are searched."
              spot="patterns/empty-loading-states"
            />

            <UiEmptyState
              v-else-if="sessionsPage.items.length === 0"
              title="No sessions found"
              :body="`OpenReplay has no sessions for ${sessionsPage.userId} between ${formatDay(sessionsPage.startDate)} and ${formatDay(sessionsPage.endDate)}.`"
              spot="patterns/empty-loading-states"
            />

            <UiPanel v-else flush>
              <UiTable :caption="`Sessions for ${sessionsPage.userId}`">
                <thead>
                  <tr>
                    <th scope="col">Session</th>
                    <th scope="col">Started</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Events</th>
                    <th scope="col">Replay</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="session in sessionsPage.items" :key="session.sessionId">
                    <td>
                      <UiLink :to="sessionLink(session)" class="font-code">
                        {{ session.sessionId }}<span class="sr-only"> (details)</span>
                      </UiLink>
                    </td>
                    <td class="whitespace-nowrap">{{ formatDate(session.startTime) }}</td>
                    <td>{{ formatDuration(session.duration) }}</td>
                    <td>{{ session.eventsCount ?? '—' }}</td>
                    <td>
                      <UiLink v-if="session.replayUrl" :href="session.replayUrl" external>
                        Watch<span class="sr-only"> session {{ session.sessionId }} in OpenReplay</span>
                      </UiLink>
                      <span v-else class="text-ink-muted">Needs project ID</span>
                    </td>
                  </tr>
                </tbody>
              </UiTable>
              <nav class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3" aria-label="Session pages">
                <p class="text-sm text-ink-secondary" aria-live="polite">{{ pageSummary }}</p>
                <div class="flex gap-2">
                  <UiButton size="sm" icon="chevron-left" :disabled="sessionsPage.page <= 1" @click="searchSessions(sessionsPage.page - 1)">Previous</UiButton>
                  <UiButton size="sm" trailing-icon="chevron-right" :disabled="!hasNextPage" @click="searchSessions(sessionsPage.page + 1)">Next</UiButton>
                </div>
              </nav>
            </UiPanel>
          </div>
        </template>

        <template #heatmaps>
          <UiPanel
            title="Heatmaps"
            heading-tag="h3"
            description="OpenReplay keeps heatmaps as cards in its dashboard. They open there, where you're signed in to OpenReplay."
          >
            <UiSpinner v-if="heatmapsLoading" label="Loading the heatmaps link…" />
            <UiCallout v-else-if="heatmapsProblem" tone="warning">
              {{ heatmapsProblem.message }}
              <div v-if="needsSettings(heatmapsProblem)" class="mt-3">
                <UiButton size="sm" icon="settings" @click="selectTab('settings')">Open settings</UiButton>
              </div>
            </UiCallout>
            <div v-else-if="heatmapsUrl" class="flex flex-wrap items-center gap-3">
              <UiButton variant="primary" icon="external-link" :href="heatmapsUrl" target="_blank" rel="noopener noreferrer">Open heatmaps in OpenReplay</UiButton>
              <UiButton icon="copy" @click="copyHeatmapsUrl">Copy link</UiButton>
            </div>
          </UiPanel>
        </template>

        <template #settings>
          <UiPanel title="Project settings" heading-tag="h3">
            <form id="replay-project-settings" class="space-y-6" @submit.prevent="updateProject">
              <UiInput v-model="projectForm.name" id="settings-name" label="Project name" required />
              <UiTextarea v-model="projectForm.description" id="settings-description" label="Description" :rows="3" />
              <UiInput v-model="projectForm.applicationUrl" id="settings-application-url" type="url" label="Application URL" />

              <fieldset class="flex flex-col gap-5">
                <legend class="mb-1 text-sm font-medium text-ink-strong">OpenReplay connection</legend>
                <UiInput
                  v-model="projectForm.openreplayBaseUrl"
                  id="openreplay-base-url"
                  type="url"
                  label="OpenReplay base URL"
                  placeholder="https://api.openreplay.com"
                  hint="OpenReplay Cloud, or your self-hosted instance."
                />
                <div class="grid md:grid-cols-2 gap-5">
                  <UiInput
                    v-model="projectForm.openreplayProjectKey"
                    id="openreplay-project-key"
                    label="OpenReplay project key"
                    required
                    mono
                    hint="In OpenReplay's project settings. The tracker and the API use it."
                  />
                  <UiInput
                    v-model="projectForm.openreplayProjectId"
                    id="openreplay-project-id"
                    label="OpenReplay project ID"
                    inputmode="numeric"
                    hint="The number in OpenReplay's address bar, for links to replays and heatmaps. Filled in when an API key is saved."
                  />
                </div>
                <UiInput
                  v-model="projectForm.openreplayApiKey"
                  id="openreplay-api-key"
                  type="password"
                  autocomplete="off"
                  label="OpenReplay API key"
                  :placeholder="project.hasApiKey ? 'Saved. Leave blank to keep it' : 'Not set: sessions can\'t be listed'"
                  hint="The organization API key. Checked against OpenReplay when you save, stored encrypted, and never shown again."
                />
              </fieldset>

              <CaptureSettingsFields v-model="captureSettings" id-prefix="settings" />
            </form>
            <template #footer>
              <div class="flex justify-end gap-3">
                <UiButton @click="resetForm">Cancel</UiButton>
                <UiButton variant="primary" type="submit" form="replay-project-settings" :loading="saving">
                  {{ saving ? 'Saving…' : 'Save changes' }}
                </UiButton>
              </div>
            </template>
          </UiPanel>
        </template>
      </UiTabs>
    </template>

    <UiEmptyState v-else-if="loadProblem" title="This project could not be loaded" :body="loadProblem.message" spot="patterns/error-handling" />
  </PageShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  PageHero,
  PageShell,
  UiButton,
  UiCallout,
  UiCodeBlock,
  UiEmptyState,
  UiInput,
  UiLink,
  UiPanel,
  UiSegmented,
  UiSelect,
  UiSpinner,
  UiTable,
  UiTabs,
  UiTextarea,
} from '../components/ui';
import CaptureSettingsFields from '../components/session-replay/CaptureSettingsFields.vue';
import { captureForm, capturePayload } from '../components/session-replay/captureSettings.js';
import { REPLAY_API, replayProblem } from '../components/session-replay/replayApi.js';
import apiClient from '../services/api.js';

const route = useRoute();
const router = useRouter();
const project = ref(null);
const loading = ref(false);
const loadProblem = ref(null);
const activeTab = ref('overview');
const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'heatmaps', label: 'Heatmaps' },
  { value: 'settings', label: 'Settings' },
];

const projectPath = () => `${REPLAY_API}/projects/${encodeURIComponent(route.params.id)}`;

// ---------- Overview ----------

const integration = ref(null);
const integrationLoading = ref(false);
const integrationProblem = ref(null);
const installMethod = ref('script');
const installOptions = [
  { value: 'script', label: 'Script tag' },
  { value: 'npm', label: 'npm package' },
];

const setupGaps = computed(() => {
  const p = project.value;
  if (!p) return [];
  return [
    !p.openreplayProjectKey && 'Add the OpenReplay project key: the tracker needs it to record sessions.',
    !p.hasApiKey && 'Add an OpenReplay API key to list sessions here.',
    !p.openreplayProjectId && 'Add the OpenReplay project ID to link to replays and heatmaps.',
  ].filter(Boolean);
});

const configuration = computed(() => {
  const p = project.value;
  return [
    { label: 'OpenReplay project key', value: p.openreplayProjectKey || 'Not set', mono: !!p.openreplayProjectKey },
    { label: 'OpenReplay project ID', value: p.openreplayProjectId ?? 'Not set', mono: !!p.openreplayProjectId },
    { label: 'OpenReplay base URL', value: p.openreplayBaseUrl || 'OpenReplay Cloud' },
    { label: 'API key', value: p.hasApiKey ? 'Saved (encrypted)' : 'Not set' },
    { label: 'Application URL', value: p.applicationUrl || 'Not set' },
    { label: 'Team', value: p.teamId },
    { label: 'Created', value: formatDate(p.createdAt) },
  ];
});

const loadIntegrationCode = async () => {
  integrationLoading.value = true;
  integrationProblem.value = null;
  try {
    integration.value = (await apiClient.get(`${projectPath()}/integration-code`)).data;
  } catch (error) {
    integration.value = null;
    integrationProblem.value = replayProblem(error, 'The integration code could not be loaded. Try again later.');
  } finally {
    integrationLoading.value = false;
  }
};

// UiCodeBlock copies the code; these report how it went
const onCopied = () => window.showToast?.('Copied to clipboard', 'success');
const onCopyFailed = () => window.showToast?.('Failed to copy code', 'error');

// ---------- Sessions ----------

const sortOptions = [
  { value: 'desc', label: 'Newest first' },
  { value: 'asc', label: 'Oldest first' },
];
const filters = reactive({ userId: '', startDate: '', endDate: '', sortOrder: 'desc' });
const sessionsPage = ref(null);
const sessionsLoading = ref(false);
/** Why sessions can't be shown, with the server's code (OPENREPLAY_NOT_CONFIGURED and the like) */
const sessionsProblem = ref(null);
const PAGE_SIZE = 20;

const hasNextPage = computed(() => !!sessionsPage.value && sessionsPage.value.page * sessionsPage.value.limit < sessionsPage.value.total);
const pageSummary = computed(() => {
  const p = sessionsPage.value;
  if (!p || !p.items.length) return '';
  const first = (p.page - 1) * p.limit + 1;
  return `Sessions ${first}–${first + p.items.length - 1} of ${p.total}`;
});

/** The filters as query parameters: blank ones are left out, so the server's defaults apply */
const sessionParams = (page) => {
  const params = { userId: filters.userId.trim(), page, limit: PAGE_SIZE, sortOrder: filters.sortOrder };
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  return params;
};

const searchSessions = async (page = 1) => {
  if (!filters.userId.trim()) return;
  const params = sessionParams(page);
  // The search is part of the address, so it can be shared and survives a reload
  const { limit, ...query } = params;
  router.replace({ query: Object.fromEntries(Object.entries(query).map(([k, v]) => [k, String(v)])) });
  sessionsLoading.value = true;
  sessionsProblem.value = null;
  try {
    const data = (await apiClient.get(`${projectPath()}/sessions`, { params })).data;
    sessionsPage.value = { ...data, userId: params.userId };
  } catch (error) {
    sessionsPage.value = null;
    sessionsProblem.value = replayProblem(error, 'The sessions could not be loaded. Try again later.');
  } finally {
    sessionsLoading.value = false;
  }
};

const problemTitle = (problem) =>
  ({
    OPENREPLAY_NOT_CONFIGURED: "OpenReplay isn't connected",
    OPENREPLAY_PROJECT_KEY_MISSING: 'This project needs its OpenReplay project key',
    OPENREPLAY_ERROR: 'OpenReplay returned an error',
  })[problem.code] ?? 'Sessions could not be loaded';
const needsSettings = (problem) => ['OPENREPLAY_NOT_CONFIGURED', 'OPENREPLAY_PROJECT_KEY_MISSING', 'OPENREPLAY_PROJECT_ID_MISSING'].includes(problem?.code);

/** The session page, with the time window to fetch its events in */
const sessionLink = (session) => {
  const start = new Date(session.startTime).getTime();
  const end = session.endTime ? new Date(session.endTime).getTime() : start + 24 * 60 * 60 * 1000;
  return {
    path: `/hcd/session-replay/${route.params.id}/sessions/${encodeURIComponent(session.sessionId)}`,
    query: { userId: session.userId, start: new Date(start).toISOString(), end: new Date(Math.max(end, start + 1000)).toISOString() },
  };
};

// ---------- Heatmaps ----------

const heatmapsUrl = ref('');
const heatmapsLoading = ref(false);
const heatmapsProblem = ref(null);

const loadHeatmapsUrl = async () => {
  heatmapsLoading.value = true;
  heatmapsProblem.value = null;
  try {
    heatmapsUrl.value = (await apiClient.get(`${projectPath()}/heatmaps-url`)).data.url;
  } catch (error) {
    heatmapsUrl.value = '';
    heatmapsProblem.value = replayProblem(error, 'The heatmaps link could not be made. Try again later.');
  } finally {
    heatmapsLoading.value = false;
  }
};

const copyHeatmapsUrl = async () => {
  try {
    await navigator.clipboard.writeText(heatmapsUrl.value);
    window.showToast?.('Heatmaps link copied to clipboard', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    window.showToast?.('Failed to copy the link', 'error');
  }
};

// ---------- Settings ----------

const saving = ref(false);
const projectForm = ref({});
const captureSettings = ref(captureForm());

const resetForm = () => {
  const p = project.value;
  if (!p) return;
  projectForm.value = {
    name: p.name,
    description: p.description || '',
    applicationUrl: p.applicationUrl || '',
    openreplayBaseUrl: p.openreplayBaseUrl || '',
    openreplayProjectKey: p.openreplayProjectKey || '',
    openreplayProjectId: p.openreplayProjectId ? String(p.openreplayProjectId) : '',
    // Write-only: blank keeps the saved key
    openreplayApiKey: '',
  };
  captureSettings.value = captureForm(p);
};

/** The update request. Connection fields go only when changed, since the server re-checks them with OpenReplay. */
const updatePayload = () => {
  const p = project.value;
  const form = projectForm.value;
  const payload = {
    name: form.name.trim(),
    description: form.description,
    applicationUrl: form.applicationUrl.trim(),
    ...capturePayload(captureSettings.value),
  };
  const key = form.openreplayProjectKey.trim();
  if (key !== (p.openreplayProjectKey || '')) payload.openreplayProjectKey = key;
  const id = String(form.openreplayProjectId).trim();
  if (id !== (p.openreplayProjectId ? String(p.openreplayProjectId) : '')) payload.openreplayProjectId = id ? Number(id) : null;
  const baseUrl = form.openreplayBaseUrl.trim();
  if (baseUrl && baseUrl !== (p.openreplayBaseUrl || '')) payload.openreplayBaseUrl = baseUrl;
  if (form.openreplayApiKey.trim()) payload.openreplayApiKey = form.openreplayApiKey.trim();
  return payload;
};

const updateProject = async () => {
  saving.value = true;
  try {
    project.value = (await apiClient.put(projectPath(), updatePayload())).data;
    resetForm();
    window.showToast?.('Project updated', 'success');
    heatmapsUrl.value = '';
    await loadIntegrationCode();
  } catch (error) {
    window.showToast?.(replayProblem(error, 'The project could not be updated.').message, 'error');
    console.error('Failed to update project:', error);
  } finally {
    saving.value = false;
  }
};

// ---------- Page ----------

const loadProject = async () => {
  loading.value = true;
  loadProblem.value = null;
  try {
    project.value = (await apiClient.get(projectPath())).data;
    resetForm();
    await loadIntegrationCode();
  } catch (error) {
    loadProblem.value = replayProblem(error, 'Try again later.');
  } finally {
    loading.value = false;
  }
};

// The Sessions tab has its own address; the other tabs switch in place
const selectTab = (tab) => {
  activeTab.value = tab;
  if (tab === 'sessions' && !route.path.endsWith('/sessions')) router.push(`/hcd/session-replay/${route.params.id}/sessions`);
};

watch(activeTab, (tab) => {
  if (tab === 'heatmaps' && !heatmapsUrl.value) loadHeatmapsUrl();
});

const formatDate = (value) => (value ? new Date(value).toLocaleString() : 'Never');
const formatDay = (value) => new Date(value).toLocaleDateString();
const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return '—';
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

onMounted(async () => {
  if (route.path.endsWith('/sessions')) activeTab.value = 'sessions';
  await loadProject();
  // A shared search address runs its search
  const q = route.query;
  if (activeTab.value === 'sessions' && q.userId) {
    Object.assign(filters, {
      userId: String(q.userId),
      startDate: q.startDate ? String(q.startDate) : '',
      endDate: q.endDate ? String(q.endDate) : '',
      sortOrder: q.sortOrder === 'asc' ? 'asc' : 'desc',
    });
    await searchSessions(Number(q.page) > 0 ? Number(q.page) : 1);
  }
});
</script>
