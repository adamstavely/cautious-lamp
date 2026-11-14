<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="Team workspaces"
      lead="Create isolated workspaces for different teams. Manage team-specific components, access control, and collaboration."
      spot="admin/workspace-management"
    >
      <template v-if="isUser" #actions>
        <UiButton variant="primary" icon="add" @click="openCreate">Create workspace</UiButton>
      </template>
    </PageHero>

    <PageSection title="Workspaces" description="Your workspaces, with what each holds and how healthy its components are.">
      <template v-if="isSuperuser" #actions>
        <UiSwitch v-model="onlyMine" label="Only workspaces I'm a member of" />
      </template>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

      <UiSpinner v-if="loading" label="Loading workspaces…" />

      <UiEmptyState v-else-if="loadError" spot="admin/workspace-management" title="Workspaces could not be loaded" :body="loadError">
        <template #actions>
          <UiButton variant="primary" @click="loadWorkspaces">Try again</UiButton>
        </template>
      </UiEmptyState>

      <UiEmptyState
        v-else-if="workspaces.length === 0"
        spot="admin/workspace-management"
        title="No workspaces yet"
        :body="isUser ? 'Create your first workspace, or ask a workspace admin to add you.' : 'Workspaces belong to people; sign in as a user to create one.'"
      >
        <template v-if="isUser" #actions>
          <UiButton variant="primary" @click="openCreate">Create workspace</UiButton>
        </template>
      </UiEmptyState>

      <ul v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <li v-for="workspace in workspaces" :key="workspace.id" class="workspace-card">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-semibold text-ink-strong break-words">{{ workspace.name }}</h3>
              <p v-if="workspace.description" class="mt-1 text-sm text-ink-secondary line-clamp-2">{{ workspace.description }}</p>
              <p class="flex flex-wrap items-center gap-2 mt-2 text-xs text-ink-muted">
                <span class="material-symbols-outlined text-sm" aria-hidden="true">people</span>
                <span>{{ memberCount(workspace) }} member{{ memberCount(workspace) !== 1 ? 's' : '' }}</span>
                <UiChip :tone="roleTone(workspace.myRole || 'viewer')" class="capitalize">{{ workspace.myRole || 'admin access' }}</UiChip>
              </p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <UiButton variant="ghost" size="sm" icon="visibility" icon-only :label="`View ${workspace.name}`" @click="viewWorkspace(workspace.id)" />
              <UiButton
                v-if="atLeast(workspace.effectiveRole, 'admin')"
                variant="ghost"
                size="sm"
                icon="edit"
                icon-only
                :label="`Edit ${workspace.name}`"
                @click="openPanel(workspace, 'settings')"
              />
            </div>
          </div>

          <dl class="grid grid-cols-2 gap-3">
            <div class="rounded-tile bg-fill-subtle p-3">
              <dt class="text-xs text-ink-muted">Components</dt>
              <dd class="text-lg font-semibold text-ink-strong">{{ workspace.summary?.componentCount ?? 0 }}</dd>
            </div>
            <div class="rounded-tile bg-fill-subtle p-3">
              <dt class="text-xs text-ink-muted">Applications</dt>
              <dd class="text-lg font-semibold text-ink-strong">{{ workspace.summary?.applicationCount ?? 0 }}</dd>
            </div>
          </dl>

          <div>
            <p class="flex items-center justify-between mb-1 text-xs">
              <span class="text-ink-muted">Health score</span>
              <span v-if="workspace.summary?.healthScore != null" class="font-semibold" :class="healthText[healthTone(workspace.summary.healthScore)]">
                {{ workspace.summary.healthScore }}/100
              </span>
              <span v-else class="text-ink-muted">No components yet</span>
            </p>
            <WorkspaceHealthBar :score="workspace.summary?.healthScore ?? 0" />
          </div>

          <div class="flex items-center gap-2 pt-4 mt-auto border-t border-line">
            <UiButton variant="primary" size="sm" class="flex-1" @click="viewWorkspace(workspace.id)">View details</UiButton>
            <UiButton size="sm" icon="group" icon-only :label="`Members of ${workspace.name}`" @click="openPanel(workspace, 'members')" />
            <UiButton
              v-if="atLeast(workspace.effectiveRole, 'owner')"
              variant="danger"
              size="sm"
              icon="delete"
              icon-only
              :label="`Delete ${workspace.name}`"
              @click="deleteWorkspace(workspace)"
            />
          </div>
        </li>
      </ul>
    </PageSection>

    <!-- Create Workspace Modal -->
    <WorkspaceModal :open="create.open" title="Create workspace" :busy="create.saving" size="sm" @close="create.open = false">
      <form id="create-workspace-form" class="flex flex-col gap-5" @submit.prevent="createWorkspace">
        <InlineNotice :notice="create.error ? { type: 'error', message: create.error } : null" @dismiss="create.error = null" />
        <UiInput v-model="create.name" label="Workspace name" required maxlength="100" placeholder="e.g., Marketing Team, Product Team" />
        <UiTextarea v-model="create.description" label="Description" :rows="3" maxlength="2000" placeholder="Describe the workspace purpose..." />
      </form>
      <template #footer>
        <UiButton :disabled="create.saving" @click="create.open = false">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="create-workspace-form" :disabled="!create.name.trim()" :loading="create.saving">
          {{ create.saving ? 'Creating…' : 'Create workspace' }}
        </UiButton>
      </template>
    </WorkspaceModal>

    <!-- Members / Settings Modal -->
    <WorkspaceModal :open="!!panel.workspace" :title="panel.workspace?.name || 'Workspace'" size="lg" @close="panel.workspace = null">
      <UiTabs v-if="panel.workspace" v-model="panel.tab" :tabs="panelTabs" label="Workspace">
        <WorkspaceMembersPanel
          v-if="panel.tab === 'members'"
          :workspace="panel.workspace"
          :current-user-id="user?.id ?? null"
          @updated="onWorkspaceUpdated"
          @left="onLeft"
        />
        <WorkspaceSettingsForm v-else :workspace="panel.workspace" @saved="onWorkspaceUpdated" />
      </UiTabs>
    </WorkspaceModal>

    <ConfirmDialog :state="confirmState" />
  </PageShell>
</template>

<script setup>
import { onMounted, reactive, ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiChip,
  UiEmptyState,
  UiInput,
  UiSpinner,
  UiSwitch,
  UiTabs,
  UiTextarea,
} from '../components/ui';
import ConfirmDialog from '../components/workspaces/ConfirmDialog.vue';
import WorkspaceHealthBar from '../components/workspaces/WorkspaceHealthBar.vue';
import WorkspaceMembersPanel from '../components/workspaces/WorkspaceMembersPanel.vue';
import WorkspaceModal from '../components/workspaces/WorkspaceModal.vue';
import WorkspaceSettingsForm from '../components/workspaces/WorkspaceSettingsForm.vue';
import { atLeast, healthTone, roleTone } from '../components/workspaces/ui.js';
import { useAuth } from '../composables/useAuth.js';
import { useNotice } from '../composables/useNotice.js';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

/**
 * Team workspaces (docs/WORKSPACES.md). The list shows the caller's
 * workspaces (every workspace for admin:users holders) with counts from the
 * server; what a person can do in each comes from its `effectiveRole`.
 */
const router = useRouter();
const { user, hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

const isUser = computed(() => user.value?.type !== 'service');
const isSuperuser = computed(() => hasPermission('admin:users'));
const onlyMine = ref(false);

const workspaces = ref([]);
const loading = ref(false);
const loadError = ref(null);

const healthText = { neutral: 'text-ink-strong', success: 'text-success', warning: 'text-warning', danger: 'text-danger' };
const memberCount = (workspace) => workspace.summary?.memberCount ?? workspace.members.length;

const loadWorkspaces = async () => {
  loading.value = true;
  loadError.value = null;
  try {
    const response = await apiClient.get('/api/v1/workspaces', { params: onlyMine.value ? { mine: 'true' } : {} });
    workspaces.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    workspaces.value = [];
    loadError.value = apiErrorMessage(error, 'Workspaces could not be loaded.');
  } finally {
    loading.value = false;
  }
};

watch(onlyMine, loadWorkspaces);

// ---------- Create ----------
const create = reactive({ open: false, name: '', description: '', saving: false, error: null });
const openCreate = () => Object.assign(create, { open: true, name: '', description: '', saving: false, error: null });

const createWorkspace = async () => {
  create.saving = true;
  create.error = null;
  try {
    const response = await apiClient.post('/api/v1/workspaces', {
      name: create.name.trim(),
      ...(create.description.trim() ? { description: create.description.trim() } : {}),
    });
    create.open = false;
    showNotice(`Workspace "${response.data.name}" created.`, 'success');
    await loadWorkspaces();
  } catch (error) {
    create.error = apiErrorMessage(error, 'The workspace could not be created.');
  } finally {
    create.saving = false;
  }
};

// ---------- Members and settings ----------
const panel = reactive({ workspace: null, tab: 'members' });
const panelTabs = [
  { value: 'members', label: 'Members' },
  { value: 'settings', label: 'Settings' },
];

const openPanel = (workspace, tab) => {
  panel.workspace = workspace;
  panel.tab = tab;
};

/** A member or settings change returns the updated workspace */
const onWorkspaceUpdated = (updated) => {
  if (!updated?.id) return;
  const existing = workspaces.value.find((w) => w.id === updated.id);
  const merged = { ...updated, summary: existing?.summary ? { ...existing.summary, memberCount: updated.members.length } : undefined };
  workspaces.value = workspaces.value.map((w) => (w.id === updated.id ? merged : w));
  if (panel.workspace?.id === updated.id) panel.workspace = merged;
};

const onLeft = () => {
  const name = panel.workspace?.name;
  panel.workspace = null;
  showNotice(`You left ${name}.`, 'success');
  loadWorkspaces();
};

// ---------- Delete ----------
const deleteWorkspace = async (workspace) => {
  const ok = await askConfirm({
    title: 'Delete workspace?',
    message: `"${workspace.name}" and all of its items will be deleted, and anything it shared will disappear from other workspaces. This can't be undone.`,
    confirmText: 'Delete workspace',
    danger: true,
  });
  if (!ok) return;
  try {
    await apiClient.delete(`/api/v1/workspaces/${encodeURIComponent(workspace.id)}`);
    showNotice(`Workspace "${workspace.name}" deleted.`, 'success');
    await loadWorkspaces();
  } catch (error) {
    // 409 explains what still belongs to it (applications or components)
    showNotice(apiErrorMessage(error, 'The workspace could not be deleted.'), 'error');
  }
};

const viewWorkspace = (workspaceId) => router.push(`/admin/workspaces/${encodeURIComponent(workspaceId)}`);

onMounted(loadWorkspaces);
</script>

<style scoped>
.workspace-card {
  @apply flex flex-col gap-4 rounded-card border border-line bg-surface-raised p-6 transition-shadow;
  @apply hover:shadow-card-hover hover:border-accent-border;
}
</style>
