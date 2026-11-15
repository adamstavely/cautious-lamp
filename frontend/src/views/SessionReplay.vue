<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Human-centered design"
      title="Session replay"
      lead="See exactly what users experience. Debug issues with full context using OpenReplay session replay for your applications."
      spot="site/session-replay"
    >
      <template #actions>
        <UiButton variant="primary" icon="plus" @click="openCreateProjectModal">Create new project</UiButton>
      </template>
    </PageHero>

    <PageSection title="Projects" :description="loading ? '' : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`">
      <template #actions>
        <UiButton icon="plus" @click="openCreateProjectModal">New project</UiButton>
      </template>

      <UiSpinner v-if="loading" label="Loading projects…" class="py-12" />

      <UiEmptyState
        v-else-if="projects.length === 0"
        title="No projects yet"
        body="Create your first session replay project to get started"
        spot="site/session-replay"
      >
        <template #actions>
          <UiButton variant="primary" @click="openCreateProjectModal">Create project</UiButton>
        </template>
      </UiEmptyState>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UiCard v-for="project in projects" :key="project.id" :to="`/hcd/session-replay/${project.id}`" :title="project.name">
          {{ project.description || 'No description' }}
          <template #footer>
            <span v-if="project.applicationUrl" class="flex items-center gap-1 text-xs">
              <AppIcon name="link" class="text-base text-ink-muted" />
              {{ getHostname(project.applicationUrl) }}
            </span>
            <UiChip v-if="!project.openreplayProjectKey" tone="warning">Needs project key</UiChip>
            <UiChip v-else-if="!project.hasApiKey" tone="neutral">No API key</UiChip>
            <span class="flex items-center gap-1 text-xs">
              <AppIcon name="users" class="text-base text-ink-muted" />
              <span class="sr-only">Team</span>
              {{ project.teamId }}
            </span>
          </template>
        </UiCard>
      </div>
    </PageSection>

    <UiDialog :open="showCreateModal" title="Create new project" size="lg" @update:open="(open) => !open && closeCreateProjectModal()">
      <form id="create-replay-project" class="space-y-5" @submit.prevent="createProject">
        <UiInput v-model="newProject.name" label="Project name" required placeholder="My Application" />
        <UiTextarea v-model="newProject.description" label="Description" :rows="3" placeholder="Session replay for our main application" />
        <UiSelect
          v-model="newProject.workspaceId"
          id="project-workspace"
          label="Workspace"
          :options="workspaceOptions"
          hint="Workspace members can see the project (viewers), run it (editors) and change it. Without a workspace only you can."
        />
        <UiInput
          v-model="newProject.applicationUrl"
          type="url"
          label="Application URL"
          placeholder="https://myapp.example.com"
          hint="The URL of the application you want to record"
        />
        <UiInput
          v-model="newProject.openreplayBaseUrl"
          type="url"
          label="OpenReplay base URL"
          placeholder="https://api.openreplay.com"
          hint="Leave blank for OpenReplay Cloud, or enter your self-hosted instance (e.g. https://openreplay.example.com)."
        />
        <div class="grid md:grid-cols-2 gap-5">
          <UiInput
            v-model="newProject.openreplayProjectKey"
            id="new-openreplay-project-key"
            label="OpenReplay project key"
            required
            mono
            placeholder="e.g. 9ihBzyeAkjDfK2rEXPBb"
            hint="In OpenReplay's project settings. The tracker uses it."
          />
          <UiInput
            v-model="newProject.openreplayProjectId"
            id="new-openreplay-project-id"
            label="OpenReplay project ID (optional)"
            inputmode="numeric"
            placeholder="e.g. 42"
            hint="The number in OpenReplay's address bar, for links to replays. Filled in for you when you add an API key."
          />
        </div>
        <UiInput
          v-model="newProject.openreplayApiKey"
          type="password"
          autocomplete="off"
          label="OpenReplay API key (optional)"
          placeholder="Organization API key"
          hint="Needed to list sessions here. Checked against OpenReplay and stored encrypted."
        />
        <CaptureSettingsFields v-model="newCapture" id-prefix="new-project" />
      </form>
      <template #footer>
        <UiButton @click="closeCreateProjectModal">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="create-replay-project" :loading="creating">
          {{ creating ? 'Creating…' : 'Create project' }}
        </UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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
  UiTextarea,
} from '../components/ui';
import apiClient from '../services/api.js';
import { REPLAY_API, replayProblem } from '../components/session-replay/replayApi.js';
import CaptureSettingsFields from '../components/session-replay/CaptureSettingsFields.vue';
import { captureForm, capturePayload } from '../components/session-replay/captureSettings.js';

const projects = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const creating = ref(false);

const emptyProject = () => ({
  name: '',
  description: '',
  workspaceId: '',
  applicationUrl: '',
  openreplayBaseUrl: '',
  openreplayProjectKey: '',
  openreplayProjectId: '',
  openreplayApiKey: '',
});
const newProject = ref(emptyProject());
const newCapture = ref(captureForm());


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

const loadProjects = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(`${REPLAY_API}/projects`);
    projects.value = response.data;
  } catch (error) {
    console.error('Failed to load projects:', error);
    window.showToast?.('Failed to load projects', 'error');
  } finally {
    loading.value = false;
  }
};

const openCreateProjectModal = () => {
  showCreateModal.value = true;
};

const closeCreateProjectModal = () => {
  showCreateModal.value = false;
  newProject.value = emptyProject();
  newCapture.value = captureForm();
};

/** The create request: blank optional fields are left out */
const createPayload = () => {
  const { openreplayProjectId, ...fields } = newProject.value;
  const payload = { workspaceId: fields.workspaceId || null, name: fields.name.trim(), openreplayProjectKey: fields.openreplayProjectKey.trim() };
  for (const key of ['description', 'applicationUrl', 'openreplayBaseUrl', 'openreplayApiKey']) {
    if (fields[key].trim()) payload[key] = fields[key].trim();
  }
  if (String(openreplayProjectId).trim()) payload.openreplayProjectId = Number(openreplayProjectId);
  return { ...payload, ...capturePayload(newCapture.value) };
};

const createProject = async () => {
  creating.value = true;
  try {
    await apiClient.post(`${REPLAY_API}/projects`, createPayload());
    window.showToast?.('Project created', 'success');
    await loadProjects();
    closeCreateProjectModal();
  } catch (error) {
    window.showToast?.(replayProblem(error, 'The project could not be created. Check the OpenReplay settings.').message, 'error');
    console.error('Failed to create project:', error);
  } finally {
    creating.value = false;
  }
};

const getHostname = (url) => {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch (e) {
    // If URL parsing fails, try to extract hostname manually
    try {
      const match = url.match(/^https?:\/\/([^\/]+)/);
      return match ? match[1] : url;
    } catch {
      return url;
    }
  }
};


onMounted(() => {
  loadWorkspaces();
  loadProjects();
});
</script>
