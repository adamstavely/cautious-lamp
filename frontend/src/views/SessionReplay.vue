<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Human-centered design"
      title="Session replay"
      lead="See exactly what users experience. Debug issues with full context using OpenReplay session replay for your applications."
      spot="site/session-replay"
    >
      <template #actions>
        <UiButton variant="primary" icon="add" @click="openCreateProjectModal">Create new project</UiButton>
      </template>
    </PageHero>

    <PageSection title="Projects" :description="loading ? '' : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`">
      <template #actions>
        <UiButton icon="add" @click="openCreateProjectModal">New project</UiButton>
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
              <span class="material-symbols-outlined text-base text-ink-muted" aria-hidden="true">link</span>
              {{ getHostname(project.applicationUrl) }}
            </span>
            <span class="flex items-center gap-1 text-xs">
              <span class="material-symbols-outlined text-base text-ink-muted" aria-hidden="true">group</span>
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
          required
          placeholder="https://openreplay.example.com"
          hint="Your self-hosted OpenReplay instance URL (e.g., https://openreplay.example.com)"
        />
        <UiInput
          v-model="newProject.openreplayProjectKey"
          label="OpenReplay project key"
          required
          placeholder="your-project-key"
          hint="Your OpenReplay project key"
        />
        <UiInput
          v-model="newProject.openreplayApiKey"
          type="password"
          label="OpenReplay API key (optional)"
          placeholder="Enter your OpenReplay API key"
          hint="Required for searching sessions via API (stored securely)"
        />
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
  UiDialog,
  UiEmptyState,
  UiInput,
  UiSelect,
  UiSpinner,
  UiTextarea,
} from '../components/ui';
import apiClient from '../services/api.js';

const projects = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const creating = ref(false);

const newProject = ref({
  name: '',
  description: '',
  workspaceId: '',
  applicationUrl: '',
  openreplayBaseUrl: '',
  openreplayProjectKey: '',
  openreplayApiKey: '',
});

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

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
    const response = await apiClient.get(`${API_BASE_URL}/session-replay/projects`);
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
  newProject.value = {
    name: '',
    description: '',
    workspaceId: '',
    applicationUrl: '',
    openreplayBaseUrl: '',
    openreplayProjectKey: '',
    openreplayApiKey: '',
  };
};

const createProject = async () => {
  creating.value = true;
  try {
    await apiClient.post(`${API_BASE_URL}/session-replay/projects`, {
      ...newProject.value,
      workspaceId: newProject.value.workspaceId || null,
    });
    window.showToast?.('Project created successfully', 'success');
    await loadProjects();
    closeCreateProjectModal();
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create project. Please check your OpenReplay connection settings.';
    window.showToast?.(errorMsg, 'error');
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
