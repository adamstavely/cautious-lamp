<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Hero Section -->
          <div class="max-w-7xl mx-auto mb-8">
            <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
              <!-- Background texture/grain effect -->
              <div class="absolute inset-0 opacity-10 texture-pattern"></div>
              
              <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div class="flex-1">
                  <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    Team Workspaces
                  </h1>
                  <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                    Create isolated workspaces for different teams. Manage team-specific components, access control, and collaboration.
                  </p>
                </div>
                <div class="hidden md:block flex-shrink-0">
                  <div class="w-64 h-64 relative">
                    <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="workspaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <!-- Team workspaces - interconnected but isolated -->
                      <!-- Team 1 Workspace -->
                      <g opacity="0.6">
                        <rect x="20" y="30" width="60" height="60" rx="6" fill="url(#workspaceGradient)" />
                        <circle cx="35" cy="45" r="4" fill="white" opacity="0.8"/>
                        <circle cx="50" cy="45" r="4" fill="white" opacity="0.8"/>
                        <circle cx="65" cy="45" r="4" fill="white" opacity="0.8"/>
                        <rect x="30" y="55" width="40" height="8" rx="2" fill="white" opacity="0.6"/>
                        <rect x="30" y="67" width="30" height="8" rx="2" fill="white" opacity="0.6"/>
                      </g>
                      <!-- Team 2 Workspace -->
                      <g opacity="0.7">
                        <rect x="120" y="30" width="60" height="60" rx="6" fill="url(#workspaceGradient)" />
                        <circle cx="135" cy="45" r="4" fill="white" opacity="0.8"/>
                        <circle cx="150" cy="45" r="4" fill="white" opacity="0.8"/>
                        <circle cx="165" cy="45" r="4" fill="white" opacity="0.8"/>
                        <rect x="130" y="55" width="40" height="8" rx="2" fill="white" opacity="0.6"/>
                        <rect x="130" y="67" width="35" height="8" rx="2" fill="white" opacity="0.6"/>
                      </g>
                      <!-- Team 3 Workspace -->
                      <g opacity="0.5">
                        <rect x="20" y="110" width="60" height="60" rx="6" fill="url(#workspaceGradient)" />
                        <circle cx="35" cy="125" r="4" fill="white" opacity="0.8"/>
                        <circle cx="50" cy="125" r="4" fill="white" opacity="0.8"/>
                        <circle cx="65" cy="125" r="4" fill="white" opacity="0.8"/>
                        <rect x="30" y="135" width="40" height="8" rx="2" fill="white" opacity="0.6"/>
                        <rect x="30" y="147" width="35" height="8" rx="2" fill="white" opacity="0.6"/>
                      </g>
                      <!-- Team 4 Workspace -->
                      <g opacity="0.8">
                        <rect x="120" y="110" width="60" height="60" rx="6" fill="url(#workspaceGradient)" />
                        <circle cx="135" cy="125" r="4" fill="white" opacity="0.8"/>
                        <circle cx="150" cy="125" r="4" fill="white" opacity="0.8"/>
                        <circle cx="165" cy="125" r="4" fill="white" opacity="0.8"/>
                        <rect x="130" y="135" width="40" height="8" rx="2" fill="white" opacity="0.6"/>
                        <rect x="130" y="147" width="30" height="8" rx="2" fill="white" opacity="0.6"/>
                      </g>
                      <!-- Connection lines showing collaboration/sharing -->
                      <path d="M 80 60 L 120 60" stroke="url(#workspaceGradient)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3"/>
                      <path d="M 80 140 L 120 140" stroke="url(#workspaceGradient)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3"/>
                      <path d="M 50 90 L 50 110" stroke="url(#workspaceGradient)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3"/>
                      <path d="M 150 90 L 150 110" stroke="url(#workspaceGradient)" stroke-width="2" opacity="0.3" stroke-dasharray="3,3"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions Bar -->
          <div class="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              v-if="isUser"
              type="button"
              class="px-4 py-2 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2"
              @click="openCreate"
            >
              <span class="material-symbols-outlined text-lg" aria-hidden="true">add</span>
              Create Workspace
            </button>
            <label v-if="isSuperuser" class="flex items-center gap-2 text-sm" :class="c.text">
              <input v-model="onlyMine" type="checkbox" class="w-4 h-4 rounded accent-indigo-600" />
              Only workspaces I'm a member of
            </label>
          </div>

          <div class="max-w-7xl mx-auto mb-6">
            <InlineNotice :notice="notice" @dismiss="clearNotice" />
          </div>

          <!-- Workspaces Grid -->
          <div class="max-w-7xl mx-auto">
            <div v-if="loading" class="text-center py-12" :class="c.muted">
              <div class="flex justify-center mb-4">
                <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              Loading workspaces...
            </div>

            <div v-else-if="loadError" class="text-center py-12 rounded-lg border" :class="c.card">
              <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'" aria-hidden="true">cloud_off</span>
              <h3 class="text-lg font-semibold mb-2" :class="c.heading">Workspaces could not be loaded</h3>
              <p class="text-sm mb-4" :class="c.muted">{{ loadError }}</p>
              <button type="button" class="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors" @click="loadWorkspaces">
                Try again
              </button>
            </div>

            <div v-else-if="workspaces.length === 0" class="text-center py-12 rounded-lg border" :class="c.card">
              <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'" aria-hidden="true">workspaces</span>
              <h3 class="text-lg font-semibold mb-2" :class="c.heading">No workspaces yet</h3>
              <p class="text-sm mb-4" :class="c.muted">
                {{ isUser ? 'Create your first workspace, or ask a workspace admin to add you.' : 'Workspaces belong to people; sign in as a user to create one.' }}
              </p>
              <button
                v-if="isUser"
                type="button"
                class="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                @click="openCreate"
              >
                Create Workspace
              </button>
            </div>

            <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="workspace in workspaces"
                :key="workspace.id"
                class="rounded-lg border p-6 transition-all hover:shadow-lg hover:border-indigo-500"
                :class="c.card"
              >
                <div class="flex items-start justify-between mb-4 gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold mb-1 break-words" :class="c.heading">{{ workspace.name }}</h3>
                    <p v-if="workspace.description" class="text-sm mb-2 line-clamp-2" :class="c.muted">{{ workspace.description }}</p>
                    <div class="flex items-center gap-2 text-xs" :class="c.faint">
                      <span class="material-symbols-outlined text-sm" aria-hidden="true">people</span>
                      <span>{{ workspace.summary?.memberCount ?? workspace.members.length }} member{{ (workspace.summary?.memberCount ?? workspace.members.length) !== 1 ? 's' : '' }}</span>
                      <span class="px-2 py-0.5 rounded capitalize" :class="c.roleBadge(workspace.myRole || 'viewer')">
                        {{ workspace.myRole || 'admin access' }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="p-2 rounded-lg transition-colors"
                      :class="c.chip"
                      title="View Workspace"
                      :aria-label="`View ${workspace.name}`"
                      @click="viewWorkspace(workspace.id)"
                    >
                      <span class="material-symbols-outlined text-base" aria-hidden="true">visibility</span>
                    </button>
                    <button
                      v-if="atLeast(workspace.effectiveRole, 'admin')"
                      type="button"
                      class="p-2 rounded-lg transition-colors"
                      :class="c.chip"
                      title="Edit Workspace"
                      :aria-label="`Edit ${workspace.name}`"
                      @click="openPanel(workspace, 'settings')"
                    >
                      <span class="material-symbols-outlined text-base" aria-hidden="true">edit</span>
                    </button>
                  </div>
                </div>

                <!-- Quick Stats -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-xs mb-1" :class="c.muted">Components</div>
                    <div class="text-lg font-semibold" :class="c.heading">{{ workspace.summary?.componentCount ?? 0 }}</div>
                  </div>
                  <div class="p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-xs mb-1" :class="c.muted">Applications</div>
                    <div class="text-lg font-semibold" :class="c.heading">{{ workspace.summary?.applicationCount ?? 0 }}</div>
                  </div>
                </div>

                <!-- Health Score -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs" :class="c.muted">Health Score</span>
                    <span v-if="workspace.summary?.healthScore != null" class="text-xs font-semibold" :class="getHealthScoreColor(workspace.summary.healthScore)">
                      {{ workspace.summary.healthScore }}/100
                    </span>
                    <span v-else class="text-xs" :class="c.faint">No components yet</span>
                  </div>
                  <div class="w-full rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                    <div
                      class="h-2 rounded-full transition-all"
                      :class="getHealthScoreBarColor(workspace.summary?.healthScore ?? 0)"
                      :style="`width: ${workspace.summary?.healthScore ?? 0}%`"
                    ></div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 pt-4 border-t" :class="c.border">
                  <button
                    type="button"
                    class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                    @click="viewWorkspace(workspace.id)"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    :class="c.chip"
                    title="Members"
                    :aria-label="`Members of ${workspace.name}`"
                    @click="openPanel(workspace, 'members')"
                  >
                    <span class="material-symbols-outlined text-base" aria-hidden="true">group</span>
                  </button>
                  <button
                    v-if="atLeast(workspace.effectiveRole, 'owner')"
                    type="button"
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    :class="c.danger"
                    title="Delete workspace"
                    :aria-label="`Delete ${workspace.name}`"
                    @click="deleteWorkspace(workspace)"
                  >
                    <span class="material-symbols-outlined text-base" aria-hidden="true">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Workspace Modal -->
    <WorkspaceModal :open="create.open" title="Create Workspace" icon="folder" :is-dark-mode="isDarkMode" :busy="create.saving" size="sm" @close="create.open = false">
      <form class="space-y-4" @submit.prevent="createWorkspace">
        <InlineNotice :notice="create.error ? { type: 'error', message: create.error } : null" @dismiss="create.error = null" />
        <div>
          <label for="new-ws-name" class="block text-sm mb-2" :class="c.label">Workspace Name *</label>
          <input
            id="new-ws-name"
            v-model="create.name"
            type="text"
            required
            maxlength="100"
            placeholder="e.g., Marketing Team, Product Team"
            :class="[inputClass, c.input]"
          />
        </div>
        <div>
          <label for="new-ws-desc" class="block text-sm mb-2" :class="c.label">Description</label>
          <textarea
            id="new-ws-desc"
            v-model="create.description"
            rows="3"
            maxlength="2000"
            placeholder="Describe the workspace purpose..."
            :class="[inputClass, c.input]"
          ></textarea>
        </div>
        <div class="flex items-center gap-2 pt-4 border-t" :class="c.border">
          <button
            type="submit"
            class="px-4 py-2 rounded-lg font-medium transition-colors flex-1"
            :class="create.name.trim() && !create.saving ? c.primary : c.disabled"
            :disabled="!create.name.trim() || create.saving"
          >
            {{ create.saving ? 'Creating...' : 'Create Workspace' }}
          </button>
          <button type="button" class="px-4 py-2 rounded-lg font-medium transition-colors" :class="c.secondary" :disabled="create.saving" @click="create.open = false">
            Cancel
          </button>
        </div>
      </form>
    </WorkspaceModal>

    <!-- Members / Settings Modal -->
    <WorkspaceModal
      :open="!!panel.workspace"
      :title="panel.workspace?.name || ''"
      icon="folder"
      :is-dark-mode="isDarkMode"
      size="lg"
      @close="panel.workspace = null"
    >
      <template v-if="panel.workspace">
        <div class="border-b mb-6" :class="c.border">
          <div class="flex items-center gap-4" role="tablist">
            <button
              v-for="tab in panelTabs"
              :key="tab.id"
              type="button"
              role="tab"
              :aria-selected="panel.tab === tab.id"
              class="px-4 py-2 border-b-2 transition-colors font-medium"
              :class="panel.tab === tab.id
                ? (isDarkMode ? 'border-indigo-400 text-indigo-400' : 'border-indigo-600 text-indigo-600')
                : (isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900')"
              @click="panel.tab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        <WorkspaceMembersPanel
          v-if="panel.tab === 'members'"
          :workspace="panel.workspace"
          :current-user-id="user?.id ?? null"
          :is-dark-mode="isDarkMode"
          @updated="onWorkspaceUpdated"
          @left="onLeft"
        />
        <WorkspaceSettingsForm
          v-else
          :workspace="panel.workspace"
          :is-dark-mode="isDarkMode"
          @saved="onWorkspaceUpdated"
        />
      </template>
    </WorkspaceModal>

    <ConfirmDialog :state="confirmState" :is-dark-mode="isDarkMode" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import InlineNotice from '../components/InlineNotice.vue';
import ConfirmDialog from '../components/workspaces/ConfirmDialog.vue';
import WorkspaceMembersPanel from '../components/workspaces/WorkspaceMembersPanel.vue';
import WorkspaceModal from '../components/workspaces/WorkspaceModal.vue';
import WorkspaceSettingsForm from '../components/workspaces/WorkspaceSettingsForm.vue';
import { atLeast, inputClass, ui } from '../components/workspaces/ui.js';
import { useDrawer } from '../composables/useDrawer.js';
import { useAuth } from '../composables/useAuth.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

/**
 * Team workspaces (docs/WORKSPACES.md). The list shows the caller's
 * workspaces (every workspace for admin:users holders) with counts from the
 * server; what a person can do in each comes from its `effectiveRole`.
 */
const router = useRouter();
const isDarkMode = useDarkMode();
const c = computed(() => ui(isDarkMode.value));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const { user, hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

const isUser = computed(() => user.value?.type !== 'service');
const isSuperuser = computed(() => hasPermission('admin:users'));
const onlyMine = ref(false);

const workspaces = ref([]);
const loading = ref(false);
const loadError = ref(null);

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
const panelTabs = computed(() => [
  { id: 'members', label: 'Members' },
  { id: 'settings', label: 'Settings' },
]);

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

const getHealthScoreColor = (score) => {
  if (score >= 80) return isDarkMode.value ? 'text-green-400' : 'text-green-600';
  if (score >= 60) return isDarkMode.value ? 'text-yellow-400' : 'text-yellow-600';
  return isDarkMode.value ? 'text-red-400' : 'text-red-600';
};

const getHealthScoreBarColor = (score) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

onMounted(loadWorkspaces);
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
