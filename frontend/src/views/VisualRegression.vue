<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/tools', label: 'Tools' }"
      title="Visual regression testing"
      lead="Catch visual bugs before they reach production. Automated visual testing powered by Argos for your applications."
      spot="admin/visual-regression"
      size="tool"
    >
      <template #actions>
        <UiButton variant="primary" icon="add" @click="openCreateProjectModal">Create new project</UiButton>
      </template>
    </PageHero>

    <PageSection title="Overview" description="Across the latest runs of every project you can see.">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <UiStat label="Total projects" icon="folder" :value="projects.length" />
        <UiStat label="Pass rate" icon="check_circle" :value="`${overallPassRate}%`" />
        <UiStat label="Total runs" icon="play_arrow" :value="totalRuns" />
        <UiStat label="Pending diffs" icon="warning" :value="pendingDiffs" />
      </div>
    </PageSection>

    <PageSection title="Projects" divided>
      <template #actions>
        <UiButton icon="add" @click="openCreateProjectModal">New project</UiButton>
      </template>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

      <UiSpinner v-if="loading" label="Loading projects…" class="py-12" />

      <UiEmptyState
        v-else-if="projects.length === 0"
        title="No projects yet"
        body="Create your first visual regression testing project to get started"
        spot="admin/visual-regression"
      >
        <template #actions>
          <UiButton variant="primary" @click="openCreateProjectModal">Create project</UiButton>
        </template>
      </UiEmptyState>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UiCard
          v-for="project in projects"
          :key="project.id"
          :to="`/tools/visual-regression/${project.id}`"
          :title="project.name"
        >
          <p>{{ project.description || 'No description' }}</p>
          <dl class="flex flex-wrap items-center gap-4 mt-3 text-sm text-ink-secondary">
            <div class="flex items-center gap-1">
              <dt><span class="material-symbols-outlined text-base text-ink-muted" aria-hidden="true">code</span><span class="sr-only">Branch</span></dt>
              <dd>{{ project.argosBranch }}</dd>
            </div>
            <div class="flex items-center gap-1">
              <dt><span class="material-symbols-outlined text-base text-ink-muted" aria-hidden="true">group</span><span class="sr-only">Team</span></dt>
              <dd>{{ project.teamId }}</dd>
            </div>
          </dl>
          <template #footer>
            <div class="flex items-center justify-between gap-2">
              <UiChip :tone="statusTone(getProjectStatus(project))">{{ getProjectStatus(project) }}</UiChip>
              <span class="text-xs text-ink-muted">{{ formatDate(project.updatedAt) }}</span>
            </div>
          </template>
        </UiCard>
      </div>
    </PageSection>

    <UiDialog :open="showCreateModal" title="Create new project" size="lg" @update:open="(open) => !open && closeCreateProjectModal()">
      <form id="create-vr-project" class="space-y-5" @submit.prevent="createProject">
        <InlineNotice :notice="createNotice" @dismiss="clearCreateNotice" />
        <UiInput v-model="newProject.name" label="Project name" required placeholder="My Application" />
        <UiTextarea v-model="newProject.description" label="Description" :rows="3" placeholder="Visual regression testing for our main application" />
        <UiSelect
          v-model="newProject.workspaceId"
          id="project-workspace"
          label="Workspace"
          :options="workspaceOptions"
          hint="Workspace members can see the project (viewers), run it (editors) and change it. Without a workspace only you can."
        />
        <UiInput v-model="newProject.argosProjectId" label="Argos project ID" required placeholder="your-org/your-project" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiInput v-model="newProject.argosBranch" label="Branch" placeholder="develop" />
          <UiInput v-model="newProject.argosBaseUrl" type="url" label="Argos URL" :placeholder="defaultArgosUrl" hint="Self-hosted Argos URLs must be on the server's allow-list." />
        </div>
        <UiInput
          v-model="newProject.argosToken"
          type="password"
          label="Argos API token"
          required
          placeholder="Enter your Argos API token"
          hint="Your Argos API token (stored securely)"
        />
      </form>
      <template #footer>
        <UiButton @click="closeCreateProjectModal">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="create-vr-project" :loading="creating">
          {{ creating ? 'Creating…' : 'Create project' }}
        </UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCard,
  UiChip,
  UiDialog,
  UiEmptyState,
  UiInput,
  UiSelect,
  UiSpinner,
  UiStat,
  UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';

const { notice, showNotice, clearNotice } = useNotice();
const { notice: createNotice, showNotice: showCreateNotice, clearNotice: clearCreateNotice } = useNotice();
const projects = ref([]);
// Latest runs per project id ({ runs, total }), used for the status and stats
const projectRuns = ref({});
const loading = ref(false);
const showCreateModal = ref(false);
const creating = ref(false);

const defaultArgosUrl = 'https://app.argos-ci.com';

const emptyProject = () => ({
  name: '',
  description: '',
  workspaceId: '',
  argosBaseUrl: defaultArgosUrl,
  argosProjectId: '',
  argosToken: '',
  argosBranch: 'develop',
});

const newProject = ref(emptyProject());

const API_PATH = '/api/v1/visual-regression';

// Workspaces the caller can create projects in (editor or above)
const editableWorkspaces = ref([]);
const workspaceOptions = computed(() => [
  { value: '', label: 'Only me (no workspace)' },
  ...editableWorkspaces.value.map((ws) => ({ value: ws.id, label: ws.name })),
]);
const loadWorkspaces = async () => {
  try {
    const list = (await apiClient.get('/api/v1/workspaces')).data ?? [];
    editableWorkspaces.value = list.filter((ws) => ['owner', 'admin', 'editor'].includes(ws.effectiveRole));
  } catch (error) {
    console.error('Failed to load workspaces:', error);
    editableWorkspaces.value = [];
  }
};

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

const loadProjectRuns = async (list) => {
  const entries = await Promise.allSettled(
    list.map(async (project) => {
      const response = await apiClient.get(`${API_PATH}/projects/${encodeURIComponent(project.id)}/runs`, {
        params: { page: 1, limit: 100 },
      });
      const body = response.data;
      const runs = Array.isArray(body) ? body : body?.data ?? [];
      return [project.id, { runs, total: body?.pagination?.total ?? runs.length }];
    })
  );
  projectRuns.value = Object.fromEntries(
    entries.filter((entry) => entry.status === 'fulfilled').map((entry) => entry.value)
  );
};

const loadProjects = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(`${API_PATH}/projects`);
    projects.value = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
    loadProjectRuns(projects.value);
  } catch (error) {
    console.error('Failed to load projects:', error);
    showNotice(apiErrorMessage(error, 'Failed to load projects.'), 'error');
  } finally {
    loading.value = false;
  }
};

const openCreateProjectModal = () => {
  clearCreateNotice();
  showCreateModal.value = true;
};

const closeCreateProjectModal = () => {
  showCreateModal.value = false;
  clearCreateNotice();
  newProject.value = emptyProject();
};

const createProject = async () => {
  creating.value = true;
  clearCreateNotice();
  try {
    const payload = {
      ...newProject.value,
      workspaceId: newProject.value.workspaceId || null,
      name: newProject.value.name.trim(),
      argosProjectId: newProject.value.argosProjectId.trim(),
      argosBaseUrl: newProject.value.argosBaseUrl.trim() || defaultArgosUrl,
      argosBranch: newProject.value.argosBranch.trim() || 'develop',
    };
    await apiClient.post(`${API_PATH}/projects`, payload);
    closeCreateProjectModal();
    showNotice('Project created successfully.', 'success');
    await loadProjects();
  } catch (error) {
    // e.g. a 400 for an Argos URL that isn't allow-listed, or bad credentials
    console.error('Failed to create project:', error);
    showCreateNotice(
      apiErrorMessage(error, 'Failed to create project. Please check your Argos connection settings.'),
      'error'
    );
  } finally {
    creating.value = false;
  }
};

const latestRun = (project) => projectRuns.value[project.id]?.runs?.[0] ?? null;

const getProjectStatus = (project) => {
  const run = latestRun(project);
  if (!run) return 'No runs';
  if (run.status === 'pending' || run.status === 'running') return 'Running';
  if (run.status === 'failed') return 'Failed';
  const summary = run.resultsSummary;
  if (summary && (summary.failed > 0 || summary.new > 0)) return 'Changes';
  return 'Passing';
};

const statusTone = (status) =>
  ({ Passing: 'success', Running: 'info', Changes: 'warning', Failed: 'danger' })[status] ?? 'neutral';

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? 'Never' : date.toLocaleDateString();
};

const allLoadedRuns = computed(() => Object.values(projectRuns.value).flatMap((entry) => entry.runs));

// Share of compared screenshots that passed, across the loaded runs
const overallPassRate = computed(() => {
  let passed = 0;
  let total = 0;
  allLoadedRuns.value.forEach((run) => {
    if (run.resultsSummary?.total) {
      passed += run.resultsSummary.passed || 0;
      total += run.resultsSummary.total;
    }
  });
  return total > 0 ? Math.round((passed / total) * 100) : 0;
});

const totalRuns = computed(() =>
  Object.values(projectRuns.value).reduce((sum, entry) => sum + (entry.total || 0), 0)
);

// Changed or new screenshots in each project's latest run, awaiting review
const pendingDiffs = computed(() =>
  projects.value.reduce((sum, project) => {
    const summary = latestRun(project)?.resultsSummary;
    return sum + (summary ? (summary.failed || 0) + (summary.new || 0) : 0);
  }, 0)
);

onMounted(() => {
  loadWorkspaces();
  loadProjects();
});
</script>
