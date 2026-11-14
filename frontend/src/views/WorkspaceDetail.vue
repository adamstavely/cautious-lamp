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
          <!-- Loading State -->
          <div v-if="loading" class="max-w-7xl mx-auto py-12 text-center">
            <div class="flex justify-center mb-4">
              <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="text-sm" :class="c.muted">Loading workspace...</p>
          </div>

          <!-- Not found / failed -->
          <div v-else-if="!workspace" class="max-w-3xl mx-auto py-12 text-center rounded-lg border" :class="c.card">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'" aria-hidden="true">
              {{ loadError?.status === 404 ? 'folder_off' : 'cloud_off' }}
            </span>
            <h1 class="text-lg font-semibold mb-2" :class="c.heading">
              {{ loadError?.status === 404 ? 'Workspace not found' : 'The workspace could not be loaded' }}
            </h1>
            <p class="text-sm mb-4" :class="c.muted">
              {{ loadError?.status === 404 ? "It doesn't exist, or you aren't a member of it." : loadError?.message }}
            </p>
            <div class="flex justify-center gap-2">
              <button v-if="loadError?.status !== 404" type="button" class="px-4 py-2 rounded-lg font-medium" :class="c.primary" @click="loadWorkspace">Try again</button>
              <button type="button" class="px-4 py-2 rounded-lg font-medium" :class="c.secondary" @click="router.push('/admin/workspaces')">Back to Workspaces</button>
            </div>
          </div>

          <!-- Workspace Content -->
          <div v-else class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="mb-8">
              <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div class="flex items-center gap-3 min-w-0">
                  <span class="material-symbols-outlined text-indigo-600 text-3xl" aria-hidden="true">folder</span>
                  <div class="min-w-0">
                    <h1 class="text-4xl font-bold mb-2 break-words" :class="c.heading">{{ workspace.name }}</h1>
                    <p v-if="workspace.description" class="text-lg" :class="c.muted">{{ workspace.description }}</p>
                    <div class="flex items-center gap-2 mt-2 text-xs">
                      <span class="px-2 py-0.5 rounded capitalize" :class="c.roleBadge(workspace.myRole || 'viewer')">
                        {{ workspace.myRole ? `Your role: ${workspace.myRole}` : 'Administrator access' }}
                      </span>
                      <span :class="c.faint">/{{ workspace.slug }}</span>
                    </div>
                  </div>
                </div>
                <button type="button" class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1" :class="c.secondary" @click="router.push('/admin/workspaces')">
                  <span class="material-symbols-outlined" aria-hidden="true">arrow_back</span>
                  Back to Workspaces
                </button>
              </div>
            </div>

            <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

            <!-- Tabs -->
            <div class="mb-6 border-b" :class="c.border">
              <div class="flex gap-2 overflow-x-auto" role="tablist">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  type="button"
                  role="tab"
                  :aria-selected="activeTab === tab.id"
                  class="px-6 py-3 font-medium transition-colors relative whitespace-nowrap"
                  :class="c.tab(activeTab === tab.id)"
                  @click="setTab(tab.id)"
                >
                  {{ tab.label }}
                  <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5" :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"></div>
                </button>
              </div>
            </div>

            <!-- Overview Tab -->
            <div v-if="activeTab === 'overview'" class="space-y-8">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="card in statCards" :key="card.label" class="rounded-lg border p-4" :class="c.card">
                  <div class="text-sm mb-1" :class="c.muted">{{ card.label }}</div>
                  <div class="text-2xl font-bold" :class="card.class || c.heading">{{ card.value }}</div>
                  <div v-if="card.hint" class="text-xs mt-1" :class="c.faint">{{ card.hint }}</div>
                </div>
              </div>

              <!-- Components Section -->
              <div class="rounded-lg border p-6" :class="c.card">
                <h2 class="text-xl font-semibold mb-4" :class="c.heading">Components</h2>
                <div v-if="componentsError" class="text-center py-8 text-sm" :class="c.muted">{{ componentsError }}</div>
                <div v-else-if="components.length === 0" class="text-center py-8 text-sm" :class="c.muted">
                  No components belong to or are shared with this workspace yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="component in components" :key="component.id" class="p-4 rounded-lg border" :class="c.subCard">
                    <div class="flex items-start justify-between mb-2 gap-2">
                      <div class="min-w-0">
                        <h5 class="font-semibold" :class="c.heading">{{ component.name }}</h5>
                        <p v-if="component.description" class="text-xs mt-1" :class="c.muted">{{ component.description }}</p>
                      </div>
                      <span class="px-2 py-1 text-xs rounded shrink-0" :class="componentBadgeClass(component)">{{ componentBadge(component) }}</span>
                    </div>
                    <div class="text-xs" :class="c.faint">Status: {{ component.status }}</div>
                    <div v-if="component.workspaceId === workspace.id && canEdit" class="flex items-center gap-2 mt-3">
                      <button type="button" class="text-xs px-2 py-1 rounded transition-colors" :class="c.chip" @click="openComponentShare(component)">Share</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Applications Section -->
              <div class="rounded-lg border p-6" :class="c.card">
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-semibold" :class="c.heading">Applications</h2>
                  <router-link v-if="canAdmin" to="/admin/applications/register" class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors" :class="c.primary">
                    Register Application
                  </router-link>
                </div>
                <div v-if="applications.length === 0" class="text-center py-8 text-sm" :class="c.muted">No applications registered in this workspace</div>
                <ul v-else class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
                  <li v-for="app in applications" :key="app.id" class="py-3 flex items-center justify-between gap-4">
                    <div class="min-w-0">
                      <div class="font-medium" :class="c.heading">{{ app.name }}</div>
                      <div v-if="app.description" class="text-xs" :class="c.muted">{{ app.description }}</div>
                    </div>
                    <span class="text-xs shrink-0" :class="c.faint">{{ app.designSystemVersion ? `DS v${app.designSystemVersion}` : 'DS version not set' }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Items Tab -->
            <div v-if="activeTab === 'items'" class="space-y-6">
              <div class="flex flex-wrap gap-2" role="tablist" aria-label="Item kinds">
                <button
                  v-for="kind in RESOURCE_KINDS"
                  :key="kind.kind"
                  type="button"
                  role="tab"
                  :aria-selected="activeKind === kind.kind"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  :class="activeKind === kind.kind ? c.primary : c.chip"
                  @click="setKind(kind.kind)"
                >
                  <span class="material-symbols-outlined text-base" aria-hidden="true">{{ kind.icon }}</span>
                  {{ kind.label }}
                </button>
              </div>
              <WorkspaceResourceList
                :workspace="workspace"
                :kind="activeKind"
                :workspaces="allWorkspaces"
                :can-edit="canEdit"
                :can-admin="canAdmin"
                :is-dark-mode="isDarkMode"
              />
            </div>

            <!-- Members Tab -->
            <div v-if="activeTab === 'members'">
              <WorkspaceMembersPanel
                :workspace="workspace"
                :current-user-id="user?.id ?? null"
                :is-dark-mode="isDarkMode"
                @updated="onSaved"
                @left="router.push('/admin/workspaces')"
              />
            </div>

            <!-- Analytics Tab -->
            <div v-if="activeTab === 'analytics'" class="space-y-6">
              <div v-if="analyticsError" class="rounded-lg border p-6 text-sm" :class="[c.card, c.muted]">{{ analyticsError }}</div>
              <template v-else-if="analytics">
                <div v-if="!analytics.usageDataAvailable" class="rounded-lg border p-4 text-sm" :class="[c.card, c.muted]">
                  No component usage has been recorded for this workspace's applications yet, so adoption figures aren't available.
                  They appear once application scans record which components are used.
                </div>
                <div class="rounded-lg border p-6" :class="c.card">
                  <h4 class="font-semibold mb-4" :class="c.heading">Workspace Analytics</h4>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div v-for="metric in analyticsMetrics" :key="metric.label">
                      <div class="text-sm mb-1" :class="c.muted">{{ metric.label }}</div>
                      <div class="text-2xl font-bold" :class="c.heading">{{ metric.value }}</div>
                    </div>
                  </div>
                </div>
                <div class="grid md:grid-cols-2 gap-6">
                  <div class="rounded-lg border p-6" :class="c.card">
                    <h4 class="font-semibold mb-4" :class="c.heading">Components by Status</h4>
                    <p v-if="Object.keys(analytics.componentsByStatus).length === 0" class="text-sm" :class="c.muted">No components</p>
                    <div v-for="(count, status) in analytics.componentsByStatus" :key="status" class="flex justify-between text-sm py-1" :class="c.text">
                      <span class="capitalize">{{ status }}</span>
                      <span class="font-semibold">{{ count }}</span>
                    </div>
                  </div>
                  <div class="rounded-lg border p-6" :class="c.card">
                    <h4 class="font-semibold mb-4" :class="c.heading">Most Used Components</h4>
                    <p v-if="analytics.mostUsedComponents.length === 0" class="text-sm" :class="c.muted">No usage recorded</p>
                    <div v-for="component in analytics.mostUsedComponents" :key="component.id" class="flex justify-between text-sm py-1" :class="c.text">
                      <span>{{ component.name }}</span>
                      <span class="font-semibold">{{ component.usage }} uses · {{ component.applications }} app{{ component.applications === 1 ? '' : 's' }}</span>
                    </div>
                  </div>
                </div>
                <p class="text-xs" :class="c.faint">
                  Health score = 100 − 5 × deprecated components − 2 × in-progress components (shown only when the workspace has components).
                </p>
              </template>
              <div v-else class="text-sm" :class="c.muted">Loading analytics…</div>
            </div>

            <!-- Settings Tab -->
            <div v-if="activeTab === 'settings'" class="space-y-6">
              <WorkspaceSettingsForm :workspace="workspace" :is-dark-mode="isDarkMode" @saved="onSaved" />
              <div v-if="canDelete" class="rounded-lg border p-4" :class="isDarkMode ? 'border-red-900 bg-red-950/20' : 'border-red-200 bg-red-50'">
                <h4 class="font-semibold mb-1" :class="isDarkMode ? 'text-red-300' : 'text-red-700'">Delete workspace</h4>
                <p class="text-sm mb-3" :class="c.muted">
                  Deletes the workspace and its items. Applications and components that belong to it must be moved or deleted first.
                </p>
                <button type="button" class="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700" @click="deleteWorkspace">Delete workspace</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ShareDialog
      v-if="workspace"
      :open="componentShare.open"
      :item-name="componentShare.component?.name || ''"
      :sharing="componentShare.component ? { sharedWith: componentShare.component.sharedWith || [], isGlobal: !!componentShare.component.isGlobal } : undefined"
      :workspace="workspace"
      :workspaces="allWorkspaces"
      :is-admin="canAdmin"
      :is-dark-mode="isDarkMode"
      :busy="componentShare.saving"
      :error="componentShare.error"
      @close="componentShare.open = false"
      @clear-error="componentShare.error = null"
      @save="saveComponentShare"
    />
    <ConfirmDialog :state="confirmState" :is-dark-mode="isDarkMode" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import InlineNotice from '../components/InlineNotice.vue';
import ConfirmDialog from '../components/workspaces/ConfirmDialog.vue';
import ShareDialog from '../components/workspaces/ShareDialog.vue';
import WorkspaceMembersPanel from '../components/workspaces/WorkspaceMembersPanel.vue';
import WorkspaceResourceList from '../components/workspaces/WorkspaceResourceList.vue';
import WorkspaceSettingsForm from '../components/workspaces/WorkspaceSettingsForm.vue';
import { RESOURCE_KINDS } from '../components/workspaces/resourceKinds.js';
import { atLeast, ui } from '../components/workspaces/ui.js';
import { useAuth } from '../composables/useAuth.js';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useDrawer } from '../composables/useDrawer.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

/**
 * One workspace (docs/WORKSPACES.md): overview, items of every kind (one
 * kind loaded at a time), members, analytics and settings. Reloads when the
 * route's workspace id changes; the tab and item kind live in the query string.
 */
const route = useRoute();
const router = useRouter();
const isDarkMode = useDarkMode();
const c = computed(() => ui(isDarkMode.value));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const { user } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

const workspace = ref(null);
const loading = ref(true);
const loadError = ref(null);
const allWorkspaces = ref([]);
const components = ref([]);
const componentsError = ref(null);
const applications = ref([]);
const analytics = ref(null);
const analyticsError = ref(null);

const canEdit = computed(() => atLeast(workspace.value?.effectiveRole, 'editor'));
const canAdmin = computed(() => atLeast(workspace.value?.effectiveRole, 'admin'));
const canDelete = computed(() => atLeast(workspace.value?.effectiveRole, 'owner'));

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'items', label: 'Items' },
  { id: 'members', label: 'Members' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
];
const activeTab = computed(() => (tabs.some((t) => t.id === route.query.tab) ? route.query.tab : 'overview'));
const activeKind = computed(() => (RESOURCE_KINDS.some((k) => k.kind === route.query.kind) ? route.query.kind : RESOURCE_KINDS[0].kind));
const setTab = (tab) => router.replace({ query: { ...route.query, tab } });
const setKind = (kind) => router.replace({ query: { ...route.query, tab: 'items', kind } });

const fmt = (value, suffix = '') => (value === null || value === undefined ? '—' : `${value}${suffix}`);
const healthClass = (score) => {
  if (score === null || score === undefined) return c.value.heading;
  if (score >= 80) return isDarkMode.value ? 'text-green-400' : 'text-green-600';
  if (score >= 60) return isDarkMode.value ? 'text-yellow-400' : 'text-yellow-600';
  return isDarkMode.value ? 'text-red-400' : 'text-red-600';
};
const statCards = computed(() => [
  { label: 'Components', value: fmt(analytics.value?.totalComponents) },
  { label: 'Applications', value: fmt(analytics.value?.totalApplications) },
  {
    label: 'Adoption Rate',
    value: fmt(analytics.value?.adoptionRate, '%'),
    hint: analytics.value && !analytics.value.usageDataAvailable ? 'No usage data yet' : '',
  },
  { label: 'Health Score', value: fmt(analytics.value?.healthScore), class: healthClass(analytics.value?.healthScore) },
]);
const analyticsMetrics = computed(() => {
  const a = analytics.value;
  if (!a) return [];
  return [
    { label: 'Total Components', value: a.totalComponents },
    { label: 'Design Debt (deprecated)', value: a.designDebt },
    { label: 'Applications', value: a.totalApplications },
    { label: 'Adoption Rate', value: fmt(a.adoptionRate, '%') },
    {
      label: 'Production Components Adopted',
      value: a.adoptionMetrics.componentsAdopted === null ? '—' : `${a.adoptionMetrics.componentsAdopted} / ${a.adoptionMetrics.componentsAvailable}`,
    },
    { label: 'Avg. Components per App', value: fmt(a.adoptionMetrics.averageComponentsPerApp) },
  ];
});

const componentBadge = (component) =>
  component.isGlobal
    ? 'Global'
    : component.workspaceId !== workspace.value.id
      ? 'Shared'
      : component.sharedWith?.length
        ? `Shared ×${component.sharedWith.length}`
        : 'Workspace';
const componentBadgeClass = (component) =>
  component.isGlobal
    ? isDarkMode.value ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
    : isDarkMode.value ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700';

const id = () => encodeURIComponent(workspace.value?.id ?? route.params.id);

// Responses can arrive after the user has moved to another workspace (or
// reloaded this one, or asked again). Each load takes a ticket and only
// applies its result while the ticket is current: same workspace load
// (generation) and the latest request for that slot.
let generation = 0;
const latestRequest = {};
const ticket = (slot) => {
  const gen = generation;
  const n = (latestRequest[slot] = (latestRequest[slot] ?? 0) + 1);
  return () => gen === generation && latestRequest[slot] === n;
};

const loadAnalytics = async () => {
  const current = ticket('analytics');
  analyticsError.value = null;
  try {
    const data = (await apiClient.get(`/api/v1/workspaces/${id()}/analytics`)).data;
    if (current()) analytics.value = data;
  } catch (error) {
    if (!current()) return;
    analytics.value = null;
    analyticsError.value = apiErrorMessage(error, 'Analytics could not be loaded.');
  }
};

const loadComponents = async () => {
  const current = ticket('components');
  componentsError.value = null;
  try {
    const data = (await apiClient.get(`/api/v1/workspaces/${id()}/components`)).data.components ?? [];
    if (current()) components.value = data;
  } catch (error) {
    if (!current()) return;
    components.value = [];
    componentsError.value = apiErrorMessage(error, 'Components could not be loaded.');
  }
};

const loadApplications = async () => {
  const current = ticket('applications');
  try {
    const data = (await apiClient.get('/api/v1/applications', { params: { workspaceId: workspace.value.id } })).data.applications ?? [];
    if (current()) applications.value = data;
  } catch {
    if (current()) applications.value = [];
  }
};

/** Workspaces the user can see: share targets, and names for shared items */
const loadAllWorkspaces = async () => {
  const current = ticket('allWorkspaces');
  try {
    const data = (await apiClient.get('/api/v1/workspaces')).data.map((ws) => ({ id: ws.id, name: ws.name }));
    if (current()) allWorkspaces.value = data;
  } catch {
    if (current()) allWorkspaces.value = [];
  }
};

const loadWorkspace = async () => {
  const workspaceId = route.params.id;
  const gen = ++generation;
  loading.value = true;
  loadError.value = null;
  workspace.value = null;
  analytics.value = null;
  components.value = [];
  applications.value = [];
  clearNotice();
  try {
    const response = await apiClient.get(`/api/v1/workspaces/${encodeURIComponent(workspaceId)}`);
    // The route may have moved on while this was in flight
    if (gen !== generation) return;
    workspace.value = response.data;
  } catch (error) {
    if (gen !== generation) return;
    loadError.value = { status: error?.response?.status, message: apiErrorMessage(error, 'The workspace could not be loaded.') };
    return;
  } finally {
    if (gen === generation) loading.value = false;
  }
  await Promise.all([loadAnalytics(), loadComponents(), loadApplications(), loadAllWorkspaces()]);
};

watch(() => route.params.id, (next) => next && loadWorkspace(), { immediate: true });
// Nothing in flight may write to this page once it's gone
onBeforeUnmount(() => {
  generation += 1;
});
watch(activeTab, (tab) => {
  if (tab === 'analytics' && workspace.value) loadAnalytics();
});

// Members and settings save the workspace they were given; ignore a save
// that finishes after the page has moved to another workspace.
const onSaved = (updated) => {
  if (updated?.id && updated.id === workspace.value?.id) workspace.value = updated;
};

// ---------- Component sharing ----------
const componentShare = reactive({ open: false, component: null, saving: false, error: null });
const openComponentShare = (component) => Object.assign(componentShare, { open: true, component, saving: false, error: null });

const saveComponentShare = async (sharing) => {
  const gen = generation;
  componentShare.saving = true;
  componentShare.error = null;
  try {
    await apiClient.put(`/api/v1/workspaces/${id()}/components/${encodeURIComponent(componentShare.component.id)}/sharing`, sharing);
    // Saved, but the user has since opened another workspace: don't report it there
    if (gen !== generation) return;
    componentShare.open = false;
    showNotice('Component sharing updated.', 'success');
    await loadComponents();
  } catch (error) {
    if (gen !== generation) return;
    componentShare.error = apiErrorMessage(error, 'Could not change sharing.');
  } finally {
    componentShare.saving = false;
  }
};

// ---------- Delete ----------
const deleteWorkspace = async () => {
  const ok = await askConfirm({
    title: 'Delete workspace?',
    message: `"${workspace.value.name}" and all of its items will be deleted, and anything it shared will disappear from other workspaces. This can't be undone.`,
    confirmText: 'Delete workspace',
    danger: true,
  });
  if (!ok) return;
  try {
    await apiClient.delete(`/api/v1/workspaces/${id()}`);
    router.push('/admin/workspaces');
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The workspace could not be deleted.'), 'error');
  }
};
</script>
