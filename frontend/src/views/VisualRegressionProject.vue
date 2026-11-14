<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-y-auto">
        <Breadcrumbs />

        <!-- Loading State -->
        <div v-if="loading" class="max-w-7xl mx-auto py-12 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading project...</p>
        </div>

        <!-- Load error / not found -->
        <div v-else-if="loadError" class="max-w-7xl mx-auto py-12 text-center">
          <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">error</span>
          <p class="text-lg font-medium mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ loadError }}</p>
          <button
            @click="router.push('/tools/visual-regression')"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to projects
          </button>
        </div>

        <!-- Project Content -->
        <div v-else-if="project" class="max-w-7xl mx-auto">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h1 class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ project.name }}</h1>
                <p class="text-lg" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ project.description || 'No description' }}</p>
              </div>
              <button
                @click="triggerTest"
                :disabled="testRunning"
                class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span class="material-symbols-outlined">play_arrow</span>
                {{ testRunning ? 'Running...' : 'Run Tests' }}
              </button>
            </div>
          </div>

          <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

          <!-- Tabs -->
          <div class="mb-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <div class="flex gap-2">
              <button
                @click="activeTab = 'overview'"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="activeTab === 'overview'
                  ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                  : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
              >
                Overview
                <div 
                  v-if="activeTab === 'overview'"
                  class="absolute bottom-0 left-0 right-0 h-0.5"
                  :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                ></div>
              </button>
              <button
                @click="activeTab = 'runs'"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="activeTab === 'runs'
                  ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                  : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
              >
                Test Runs
                <div 
                  v-if="activeTab === 'runs'"
                  class="absolute bottom-0 left-0 right-0 h-0.5"
                  :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                ></div>
              </button>
              <button
                @click="activeTab = 'settings'"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="activeTab === 'settings'
                  ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                  : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
              >
                Settings
                <div 
                  v-if="activeTab === 'settings'"
                  class="absolute bottom-0 left-0 right-0 h-0.5"
                  :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                ></div>
              </button>
            </div>
          </div>

          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Runs</div>
                <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ totalRunCount }}</div>
              </div>
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Last Run</div>
                <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ lastRun ? formatDate(lastRun.startedAt) : 'Never' }}
                </div>
              </div>
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Status</div>
                <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ lastRun?.status || 'No runs' }}
                </div>
              </div>
            </div>

            <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Project Configuration</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Argos Project ID</div>
                  <div class="text-sm font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ project.argosProjectId }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Branch</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ project.argosBranch }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Team</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ project.teamId }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Created</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ formatDate(project.createdAt) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Test Runs Tab -->
          <div v-if="activeTab === 'runs'">
            <div v-if="testRuns.length === 0" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">play_circle_outline</span>
              <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">No test runs yet</p>
              <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Run your first visual regression test to get started</p>
              <button
                @click="triggerTest"
                class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Run Tests
              </button>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="run in testRuns"
                :key="run.id"
                @click="navigateToResults(run.id)"
                class="rounded-lg border p-6 cursor-pointer transition-all hover:shadow-lg"
                :class="isDarkMode 
                  ? 'bg-slate-800 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
              >
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <div class="flex items-center gap-3 mb-2">
                      <span 
                        class="px-3 py-1 text-sm rounded-full font-medium"
                        :class="getStatusClass(run.status)"
                      >
                        {{ run.status }}
                      </span>
                      <span class="text-sm font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ run.commitSha ? run.commitSha.substring(0, 7) : 'N/A' }}
                      </span>
                    </div>
                    <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ formatDate(run.startedAt) }}
                    </div>
                  </div>
                  <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">chevron_right</span>
                </div>

                <div v-if="run.resultsSummary" class="grid grid-cols-4 gap-4 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <div>
                    <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Total</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ run.resultsSummary.total }}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium mb-1 text-green-600">Passed</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ run.resultsSummary.passed }}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium mb-1 text-red-600">Failed</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ run.resultsSummary.failed }}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium mb-1 text-orange-600">New</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ run.resultsSummary.new }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
            <h3 class="text-lg font-semibold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Project Settings</h3>
            <form @submit.prevent="updateProject" class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Project Name</label>
                <input
                  v-model="projectForm.name"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Description</label>
                <textarea
                  v-model="projectForm.description"
                  rows="3"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Argos Branch</label>
                <input
                  v-model="projectForm.argosBranch"
                  type="text"
                  placeholder="develop"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                />
                <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  The branch new test runs compare against (defaults to <strong>develop</strong>)
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Argos URL</label>
                <input
                  v-model="projectForm.argosBaseUrl"
                  type="url"
                  placeholder="https://app.argos-ci.com"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                />
                <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  Self-hosted Argos URLs must be on the server's allow-list.
                </p>
              </div>

              <InlineNotice :notice="settingsNotice" @dismiss="clearSettingsNotice" />

              <div class="flex justify-end gap-3 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <button
                  type="button"
                  @click="resetForm"
                  class="px-4 py-2 rounded-lg transition-colors"
                  :class="isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>

          <div v-if="activeTab === 'settings'" class="mt-6 rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
            <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Argos webhooks</h3>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Argos sends build results here. Webhooks are accepted only when they are signed with this project's secret.
            </p>
            <dl class="grid gap-3 sm:grid-cols-2 mb-4 text-sm">
              <div>
                <dt class="font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Status</dt>
                <dd :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">{{ project.hasWebhookSecret ? 'Secret set: webhooks are accepted' : 'No secret: webhooks are refused' }}</dd>
              </div>
              <div>
                <dt class="font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Webhook URL</dt>
                <dd class="font-mono break-all" :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">{{ webhookUrl }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Signature</dt>
                <dd :class="isDarkMode ? 'text-gray-200' : 'text-gray-800'">
                  <code>x-argos-signature: sha256=&lt;HMAC-SHA256 of the request body&gt;</code>, with the event name in <code>x-argos-event</code>
                </dd>
              </div>
            </dl>

            <div v-if="revealedSecret" class="mb-4 rounded-lg border p-4" :class="isDarkMode ? 'border-amber-700 bg-amber-950/40' : 'border-amber-300 bg-amber-50'">
              <label for="webhook-secret" class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-amber-200' : 'text-amber-900'">
                Copy this secret into Argos now. It won't be shown again.
              </label>
              <div class="flex gap-2">
                <input
                  id="webhook-secret"
                  :value="revealedSecret"
                  readonly
                  class="flex-1 min-w-0 px-3 py-2 border rounded-lg font-mono text-sm"
                  :class="isDarkMode ? 'bg-slate-900 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                  @focus="$event.target.select()"
                />
                <button
                  type="button"
                  class="px-3 py-2 rounded-lg border border-solid text-sm"
                  :class="isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'"
                  @click="copySecret"
                >
                  {{ secretCopied ? 'Copied' : 'Copy' }}
                </button>
              </div>
            </div>

            <InlineNotice :notice="webhookNotice" class="mb-4" @dismiss="clearWebhookNotice" />

            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                :disabled="webhookBusy"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                @click="generateWebhookSecret"
              >
                {{ project.hasWebhookSecret ? 'Replace secret' : 'Generate secret' }}
              </button>
              <button
                v-if="project.hasWebhookSecret"
                type="button"
                :disabled="webhookBusy"
                class="px-4 py-2 rounded-lg border border-solid transition-colors disabled:opacity-50"
                :class="isDarkMode ? 'border-red-800 text-red-300 hover:bg-red-950/40' : 'border-red-300 text-red-700 hover:bg-red-50'"
                @click="removeWebhookSecret"
              >
                Remove secret
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import apiClient from '../services/api.js';

const route = useRoute();
const router = useRouter();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const isDarkMode = useDarkMode();
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

const navigateToResults = (runId) => {
  router.push(`/tools/visual-regression/${route.params.id}/runs/${runId}`);
};

const getStatusClass = (status) => {
  const classes = {
    pending: isDarkMode.value ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    running: isDarkMode.value ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
    completed: isDarkMode.value ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
    failed: isDarkMode.value ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
  };
  return classes[status] || classes.pending;
};

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

