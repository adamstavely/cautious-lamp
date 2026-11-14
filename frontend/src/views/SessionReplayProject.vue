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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <UiStat label="Total sessions" :value="sessions.length" />
              <UiStat label="Sessions with errors" :value="sessionsWithErrors" />
              <UiStat label="Live sessions" :value="liveSessions" />
            </div>

            <UiPanel title="Integration code" heading-tag="h3" description="Add this code to your application's HTML to start recording sessions.">
              <UiCodeBlock :code="integrationCode" label="HTML" @copied="onIntegrationCodeCopied" @copy-failed="onIntegrationCodeCopyFailed" />
            </UiPanel>

            <UiPanel title="Project configuration" heading-tag="h3">
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">OpenReplay project key</dt>
                  <dd class="font-code text-ink">{{ project.openreplayProjectKey }}</dd>
                </div>
                <div>
                  <dt class="font-medium mb-1 text-ink-secondary">OpenReplay base URL</dt>
                  <dd class="break-all text-ink">{{ project.openreplayBaseUrl }}</dd>
                </div>
                <div v-if="project.applicationUrl">
                  <dt class="font-medium mb-1 text-ink-secondary">Application URL</dt>
                  <dd class="break-all text-ink">{{ project.applicationUrl }}</dd>
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

        <template #sessions>
          <div class="mb-6 flex flex-wrap items-end gap-4">
            <div class="flex-1 min-w-0">
              <UiInput v-model="searchQuery" type="search" label="Search sessions" icon="search" placeholder="Search sessions…" />
            </div>
            <UiButton icon="refresh" @click="loadSessions">Refresh</UiButton>
          </div>

          <UiSpinner v-if="sessionsLoading" label="Loading sessions…" class="py-12" />

          <UiEmptyState
            v-else-if="sessionsProblem"
            :title="sessionsProblem.notConfigured ? 'OpenReplay isn\'t connected' : 'Sessions could not be loaded'"
            :body="sessionsProblem.message"
            :spot="sessionsProblem.notConfigured ? 'site/session-replay' : 'patterns/error-handling'"
          >
            <template v-if="sessionsProblem.notConfigured" #actions>
              <UiButton variant="primary" icon="settings" @click="selectTab('settings')">Open settings</UiButton>
            </template>
          </UiEmptyState>

          <UiEmptyState
            v-else-if="filteredSessions.length === 0"
            title="No sessions found"
            body="Sessions will appear here once your application starts recording"
            spot="patterns/empty-loading-states"
          />

          <UiPanel v-else flush>
            <UiTable caption="Recorded sessions">
              <thead>
                <tr>
                  <th scope="col">Session</th>
                  <th scope="col">Started</th>
                  <th scope="col">Errors</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Pages</th>
                  <th scope="col">Events</th>
                  <th scope="col">Issue score</th>
                  <th scope="col">User</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="session in filteredSessions" :key="session.sessionId">
                  <td>
                    <span class="flex items-center gap-2">
                      <UiLink :to="sessionLink(session.sessionId)" class="font-code">
                        {{ session.sessionId.substring(0, 8) }}<span class="sr-only"> (open replay)</span>
                      </UiLink>
                      <UiChip v-if="session.live" tone="info">Live</UiChip>
                    </span>
                  </td>
                  <td class="whitespace-nowrap">{{ formatDate(session.startTime) }}</td>
                  <td>
                    <UiChip :tone="session.errorsCount > 0 ? 'danger' : 'success'">
                      {{ session.errorsCount > 0 ? `${session.errorsCount} errors` : 'No errors' }}
                    </UiChip>
                  </td>
                  <td>{{ formatDuration(session.duration) }}</td>
                  <td>{{ session.pagesCount }}</td>
                  <td>{{ session.eventsCount }}</td>
                  <td :class="{ 'text-danger font-semibold': session.issueScore > 50 }">{{ session.issueScore }}</td>
                  <td class="text-ink-secondary">{{ session.userEmail || '—' }}</td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>
        </template>

        <template #heatmaps>
          <UiSpinner v-if="heatmapsUrlLoading" label="Loading heatmaps…" class="py-12" />

          <div v-else-if="heatmapsUrl" class="space-y-6">
            <UiPanel
              title="Heatmaps"
              heading-tag="h3"
              description="Visualize user interactions across your application. Heatmaps show where users click, scroll, and move their mouse, helping you identify engagement hotspots and areas that need optimization."
            >
              <div class="flex flex-wrap items-center gap-3">
                <UiButton variant="primary" icon="open_in_new" :href="heatmapsUrl" target="_blank" rel="noopener noreferrer">Open in OpenReplay</UiButton>
                <UiButton icon="content_copy" @click="copyHeatmapsUrl">Copy link</UiButton>
              </div>
            </UiPanel>

            <UiPanel title="Heatmap viewer" heading-tag="h3">
              <template #actions>
                <UiLink :href="heatmapsUrl" external>Open full screen</UiLink>
              </template>
              <iframe
                :src="heatmapsUrl"
                class="w-full h-embed rounded-tile border border-line"
                allow="fullscreen"
                title="OpenReplay Heatmaps"
              ></iframe>
              <p class="mt-2 text-center text-xs text-ink-muted">
                If the heatmap viewer doesn't load, click "Open in OpenReplay" to view in a new window. Make sure you're authenticated in OpenReplay.
              </p>
            </UiPanel>

            <UiPanel title="How to use heatmaps" heading-tag="h3">
              <ol class="space-y-4">
                <li v-for="(step, index) in heatmapSteps" :key="step.title">
                  <h4 class="mb-1 font-medium text-ink-strong">{{ index + 1 }}. {{ step.title }}</h4>
                  <p class="text-sm text-ink-secondary">{{ step.body }}</p>
                </li>
              </ol>
            </UiPanel>
          </div>

          <UiEmptyState
            v-else
            title="Unable to load heatmaps"
            body="Make sure your OpenReplay instance is configured correctly and accessible."
            spot="foundations/data-viz"
          />
        </template>

        <template #settings>
          <UiPanel title="Project settings" heading-tag="h3">
            <form id="replay-project-settings" class="space-y-5" @submit.prevent="updateProject">
              <UiInput v-model="projectForm.name" label="Project name" />
              <UiTextarea v-model="projectForm.description" label="Description" :rows="3" />
              <UiInput v-model="projectForm.applicationUrl" type="url" label="Application URL" />
              <UiInput
                id="openreplay-project-id"
                v-model="projectForm.openreplayProjectKey"
                label="OpenReplay project ID"
                inputmode="numeric"
                hint="The numeric ID from the project's settings in OpenReplay."
              />
              <UiInput
                id="openreplay-api-key"
                v-model="projectForm.openreplayApiKey"
                type="password"
                autocomplete="off"
                label="OpenReplay API key"
                :placeholder="project?.hasApiKey ? 'Saved. Leave blank to keep it' : 'Not set: sessions can\'t be shown'"
                hint="Used to list sessions. It's checked against OpenReplay when you save, stored encrypted, and never shown again."
              />
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
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  PageHero,
  PageShell,
  UiButton,
  UiChip,
  UiCodeBlock,
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
import apiClient from '../services/api.js';

const route = useRoute();
const router = useRouter();
const project = ref(null);
const loading = ref(false);
const activeTab = ref('overview');
const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'heatmaps', label: 'Heatmaps' },
  { value: 'settings', label: 'Settings' },
];
const sessions = ref([]);
const sessionsLoading = ref(false);
/** Why sessions can't be shown: OpenReplay not connected (503 OPENREPLAY_NOT_CONFIGURED) or another error */
const sessionsProblem = ref(null);
const searchQuery = ref('');
const saving = ref(false);
const integrationCode = ref('');
const heatmapsUrl = ref('');
const heatmapsUrlLoading = ref(false);

const projectForm = ref({
  name: '',
  description: '',
  applicationUrl: '',
  openreplayProjectKey: '',
  // Write-only: blank keeps the saved key
  openreplayApiKey: '',
});

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

const loadProject = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(`${API_BASE_URL}/session-replay/projects/${route.params.id}`);
    project.value = response.data;
    projectForm.value = {
      name: project.value.name,
      description: project.value.description || '',
      applicationUrl: project.value.applicationUrl || '',
      openreplayProjectKey: project.value.openreplayProjectKey || '',
      openreplayApiKey: '',
    };
    await loadIntegrationCode();
    if (activeTab.value === 'sessions') {
      await loadSessions();
    }
  } catch (error) {
    console.error('Failed to load project:', error);
    window.showToast?.('Failed to load project', 'error');
  } finally {
    loading.value = false;
  }
};

const loadIntegrationCode = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/session-replay/projects/${route.params.id}/integration-code`);
    integrationCode.value = response.data.code;
  } catch (error) {
    console.error('Failed to load integration code:', error);
    window.showToast?.('Failed to load integration code', 'error');
  }
};

// UiCodeBlock copies the code; these report how it went
const onIntegrationCodeCopied = () => window.showToast?.('Integration code copied to clipboard', 'success');
const onIntegrationCodeCopyFailed = () => window.showToast?.('Failed to copy code', 'error');

const loadSessions = async () => {
  sessionsLoading.value = true;
  try {
    sessionsProblem.value = null;
    const response = await apiClient.get(`${API_BASE_URL}/session-replay/projects/${route.params.id}/sessions`);
    sessions.value = response.data.sessions || [];
  } catch (error) {
    const data = error.response?.data;
    sessionsProblem.value = {
      notConfigured: data?.code === 'OPENREPLAY_NOT_CONFIGURED',
      message: data?.message || 'The sessions could not be loaded. Try again later.',
    };
    sessions.value = [];
  } finally {
    sessionsLoading.value = false;
  }
};

const updateProject = async () => {
  saving.value = true;
  try {
    // The server re-checks the OpenReplay connection when these are sent, so only send changes
    const { openreplayApiKey, openreplayProjectKey, ...payload } = projectForm.value;
    if (openreplayProjectKey.trim() !== (project.value.openreplayProjectKey || '')) payload.openreplayProjectKey = openreplayProjectKey.trim();
    if (openreplayApiKey.trim()) payload.openreplayApiKey = openreplayApiKey.trim();
    await apiClient.put(`${API_BASE_URL}/session-replay/projects/${route.params.id}`, payload);
    window.showToast?.('Project updated successfully', 'success');
    await loadProject();
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update project';
    window.showToast?.(errorMsg, 'error');
    console.error('Failed to update project:', error);
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  if (project.value) {
    projectForm.value = {
      name: project.value.name,
      description: project.value.description || '',
      applicationUrl: project.value.applicationUrl || '',
      openreplayProjectKey: project.value.openreplayProjectKey || '',
      openreplayApiKey: '',
    };
  }
};

const navigateToSessionsTab = () => {
  router.push(`/hcd/session-replay/${route.params.id}/sessions`);
};

const sessionLink = (sessionId) => `/hcd/session-replay/${route.params.id}/sessions/${sessionId}`;

// The Sessions tab has its own address; the other tabs switch in place
const selectTab = (tab) => {
  activeTab.value = tab;
  if (tab === 'sessions') navigateToSessionsTab();
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};

const filteredSessions = computed(() => {
  if (!searchQuery.value.trim()) {
    return sessions.value;
  }
  const query = searchQuery.value.toLowerCase();
  return sessions.value.filter(s => 
    s.sessionId.toLowerCase().includes(query) ||
    (s.userEmail && s.userEmail.toLowerCase().includes(query)) ||
    (s.userDisplayName && s.userDisplayName.toLowerCase().includes(query))
  );
});

const sessionsWithErrors = computed(() => {
  return sessions.value.filter(s => s.errorsCount > 0).length;
});

const liveSessions = computed(() => {
  return sessions.value.filter(s => s.live).length;
});

const loadHeatmapsUrl = async () => {
  heatmapsUrlLoading.value = true;
  try {
    const response = await apiClient.get(`${API_BASE_URL}/session-replay/projects/${route.params.id}/heatmaps-url`);
    heatmapsUrl.value = response.data.url;
  } catch (error) {
    console.error('Failed to load heatmaps URL:', error);
    window.showToast?.('Failed to load heatmaps URL', 'error');
    heatmapsUrl.value = '';
  } finally {
    heatmapsUrlLoading.value = false;
  }
};

const copyHeatmapsUrl = async () => {
  try {
    await navigator.clipboard.writeText(heatmapsUrl.value);
    window.showToast?.('Heatmaps URL copied to clipboard', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    window.showToast?.('Failed to copy URL', 'error');
  }
};

watch(activeTab, (newTab) => {
  if (newTab === 'sessions' && sessions.value.length === 0) {
    loadSessions();
  }
  if (newTab === 'heatmaps' && !heatmapsUrl.value) {
    loadHeatmapsUrl();
  }
});

const heatmapSteps = [
  {
    title: 'Create a heatmap',
    body: 'Click "Open in OpenReplay" to access the full heatmap interface. Create a new heatmap by specifying the URL pattern you want to analyze.',
  },
  {
    title: 'Configure filters',
    body: 'Apply filters to segment your data by user attributes, session characteristics, or specific issues like click rage.',
  },
  {
    title: 'Analyze results',
    body: 'View click, scroll, and mouse movement heatmaps to identify engagement hotspots and areas that need optimization.',
  },
];

onMounted(() => {
  loadProject();

  // Set active tab based on route
  if (route.path.includes('/sessions') && !route.params.sessionId) {
    activeTab.value = 'sessions';
  } else if (route.path.includes('/heatmaps')) {
    activeTab.value = 'heatmaps';
  } else if (route.path.includes('/settings')) {
    activeTab.value = 'settings';
  }
});
</script>
