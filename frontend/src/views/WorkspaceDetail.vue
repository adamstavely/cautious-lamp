<template>
  <PageShell width="wide">
    <!-- Loading -->
    <template v-if="loading">
      <PageHero :back="{ to: '/admin/workspaces', label: 'Workspaces' }" title="Workspace" size="tool" />
      <UiSpinner label="Loading workspace…" />
    </template>

    <!-- Not found / failed -->
    <template v-else-if="!workspace">
      <PageHero
        :back="{ to: '/admin/workspaces', label: 'Workspaces' }"
        :title="loadError?.status === 404 ? 'Workspace not found' : 'The workspace could not be loaded'"
        :lead="loadError?.status === 404 ? `It doesn't exist, or you aren't a member of it.` : loadError?.message"
        spot="admin/workspace-management"
        size="tool"
      >
        <template #actions>
          <UiButton v-if="loadError?.status !== 404" variant="primary" @click="loadWorkspace">Try again</UiButton>
          <UiButton to="/admin/workspaces">Back to Workspaces</UiButton>
        </template>
      </PageHero>
    </template>

    <!-- Workspace Content -->
    <template v-else>
      <PageHero
        :back="{ to: '/admin/workspaces', label: 'Workspaces' }"
        :title="workspace.name"
        :lead="workspace.description || ''"
        spot="admin/workspace-management"
        size="tool"
      >
        <template #actions>
          <UiChip :tone="roleTone(workspace.myRole || 'viewer')" class="capitalize">
            {{ workspace.myRole ? `Your role: ${workspace.myRole}` : 'Administrator access' }}
          </UiChip>
          <span class="text-xs text-ink-muted">/{{ workspace.slug }}</span>
        </template>
      </PageHero>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

      <UiTabs :model-value="activeTab" :tabs="tabs" label="Workspace sections" @update:model-value="setTab">
        <!-- Overview -->
        <template #overview>
          <div class="flex flex-col gap-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <UiStat v-for="card in statCards" :key="card.label" :label="card.label" :value="card.value" :hint="card.hint" :tone="card.tone" />
            </div>

            <UiPanel title="Components">
              <UiCallout v-if="componentsError" tone="danger">{{ componentsError }}</UiCallout>
              <p v-else-if="components.length === 0" class="py-6 text-center text-sm text-ink-muted">
                No components belong to or are shared with this workspace yet
              </p>
              <ul v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <li v-for="component in components" :key="component.id" class="flex flex-col gap-2 rounded-tile border border-line bg-surface-sunken p-4">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <h3 class="font-semibold text-ink-strong">{{ component.name }}</h3>
                      <p v-if="component.description" class="mt-1 text-xs text-ink-secondary">{{ component.description }}</p>
                    </div>
                    <UiChip :tone="component.isGlobal ? 'success' : 'info'" class="shrink-0">{{ componentBadge(component) }}</UiChip>
                  </div>
                  <p class="text-xs text-ink-muted">Status: {{ component.status }}</p>
                  <div v-if="component.workspaceId === workspace.id && canEdit">
                    <UiButton size="sm" icon="share" @click="openComponentShare(component)">Share</UiButton>
                  </div>
                </li>
              </ul>
            </UiPanel>

            <UiPanel title="Applications">
              <template v-if="canAdmin" #actions>
                <UiButton variant="primary" size="sm" icon="add" to="/admin/applications/register">Register application</UiButton>
              </template>
              <p v-if="applications.length === 0" class="py-6 text-center text-sm text-ink-muted">No applications registered in this workspace</p>
              <ul v-else class="divide-y divide-line-faint">
                <li v-for="app in applications" :key="app.id" class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div class="min-w-0">
                    <p class="font-medium text-ink-strong">{{ app.name }}</p>
                    <p v-if="app.description" class="text-xs text-ink-secondary">{{ app.description }}</p>
                  </div>
                  <span class="shrink-0 text-xs text-ink-muted">{{ app.designSystemVersion ? `DS v${app.designSystemVersion}` : 'DS version not set' }}</span>
                </li>
              </ul>
            </UiPanel>
          </div>
        </template>

        <!-- Items -->
        <template #items>
          <UiTabs :model-value="activeKind" :tabs="kindTabs" label="Item kinds" @update:model-value="setKind">
            <WorkspaceResourceList
              :workspace="workspace"
              :kind="activeKind"
              :workspaces="allWorkspaces"
              :can-edit="canEdit"
              :can-admin="canAdmin"
            />
          </UiTabs>
        </template>

        <!-- Members -->
        <template #members>
          <WorkspaceMembersPanel
            :workspace="workspace"
            :current-user-id="user?.id ?? null"
            @updated="onSaved"
            @left="router.push('/admin/workspaces')"
          />
        </template>

        <!-- Analytics -->
        <template #analytics>
          <div class="flex flex-col gap-6">
            <UiCallout v-if="analyticsError" tone="danger">{{ analyticsError }}</UiCallout>
            <template v-else-if="analytics">
              <UiCallout v-if="!analytics.usageDataAvailable" tone="info">
                No component usage has been recorded for this workspace's applications yet, so adoption figures aren't available.
                They appear once application scans record which components are used.
              </UiCallout>
              <section aria-labelledby="ws-analytics-heading" class="flex flex-col gap-4">
                <h2 id="ws-analytics-heading" class="text-lg font-semibold text-ink-strong">Workspace analytics</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <UiStat v-for="metric in analyticsMetrics" :key="metric.label" :label="metric.label" :value="metric.value" />
                </div>
              </section>
              <div class="grid md:grid-cols-2 gap-6">
                <UiPanel title="Components by status" heading-tag="h3">
                  <p v-if="Object.keys(analytics.componentsByStatus).length === 0" class="text-sm text-ink-muted">No components</p>
                  <dl v-else class="flex flex-col gap-2 text-sm">
                    <div v-for="(count, status) in analytics.componentsByStatus" :key="status" class="flex justify-between">
                      <dt class="capitalize text-ink-secondary">{{ status }}</dt>
                      <dd class="font-semibold text-ink-strong">{{ count }}</dd>
                    </div>
                  </dl>
                </UiPanel>
                <UiPanel title="Most used components" heading-tag="h3">
                  <p v-if="analytics.mostUsedComponents.length === 0" class="text-sm text-ink-muted">No usage recorded</p>
                  <dl v-else class="flex flex-col gap-2 text-sm">
                    <div v-for="component in analytics.mostUsedComponents" :key="component.id" class="flex justify-between gap-4">
                      <dt class="text-ink-secondary">{{ component.name }}</dt>
                      <dd class="font-semibold text-ink-strong">{{ component.usage }} uses · {{ component.applications }} app{{ component.applications === 1 ? '' : 's' }}</dd>
                    </div>
                  </dl>
                </UiPanel>
              </div>
              <p class="text-xs text-ink-muted">
                Health score = 100 − 5 × deprecated components − 2 × in-progress components (shown only when the workspace has components).
              </p>
            </template>
            <UiSpinner v-else label="Loading analytics…" />
          </div>
        </template>

        <!-- Settings -->
        <template #settings>
          <div class="flex flex-col gap-6">
            <WorkspaceSettingsForm :workspace="workspace" @saved="onSaved" />
            <UiCallout v-if="canDelete" tone="danger" title="Delete workspace">
              Deletes the workspace and its items. Applications and components that belong to it must be moved or deleted first.
              <template #actions>
                <UiButton variant="danger" icon="delete" @click="deleteWorkspace">Delete workspace</UiButton>
              </template>
            </UiCallout>
          </div>
        </template>
      </UiTabs>
    </template>

    <ShareDialog
      v-if="workspace"
      :open="componentShare.open"
      :item-name="componentShare.component?.name || ''"
      :sharing="componentShare.component ? { sharedWith: componentShare.component.sharedWith || [], isGlobal: !!componentShare.component.isGlobal } : undefined"
      :workspace="workspace"
      :workspaces="allWorkspaces"
      :is-admin="canAdmin"
      :busy="componentShare.saving"
      :error="componentShare.error"
      @close="componentShare.open = false"
      @clear-error="componentShare.error = null"
      @save="saveComponentShare"
    />
    <ConfirmDialog :state="confirmState" />
  </PageShell>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageShell, UiButton, UiCallout, UiChip, UiPanel, UiSpinner, UiStat, UiTabs } from '../components/ui';
import ConfirmDialog from '../components/workspaces/ConfirmDialog.vue';
import ShareDialog from '../components/workspaces/ShareDialog.vue';
import WorkspaceMembersPanel from '../components/workspaces/WorkspaceMembersPanel.vue';
import WorkspaceResourceList from '../components/workspaces/WorkspaceResourceList.vue';
import WorkspaceSettingsForm from '../components/workspaces/WorkspaceSettingsForm.vue';
import { RESOURCE_KINDS } from '../components/workspaces/resourceKinds.js';
import { atLeast, healthTone, roleTone } from '../components/workspaces/ui.js';
import { useAuth } from '../composables/useAuth.js';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

/**
 * One workspace (docs/WORKSPACES.md): overview, items of every kind (one
 * kind loaded at a time), members, analytics and settings. Reloads when the
 * route's workspace id changes; the tab and item kind live in the query string.
 */
const route = useRoute();
const router = useRouter();
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
  { value: 'overview', label: 'Overview' },
  { value: 'items', label: 'Items' },
  { value: 'members', label: 'Members' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'settings', label: 'Settings' },
];
const kindTabs = RESOURCE_KINDS.map((k) => ({ value: k.kind, label: k.label, icon: k.icon }));
const activeTab = computed(() => (tabs.some((t) => t.value === route.query.tab) ? route.query.tab : 'overview'));
const activeKind = computed(() => (RESOURCE_KINDS.some((k) => k.kind === route.query.kind) ? route.query.kind : RESOURCE_KINDS[0].kind));
const setTab = (tab) => router.replace({ query: { ...route.query, tab } });
const setKind = (kind) => router.replace({ query: { ...route.query, tab: 'items', kind } });

const fmt = (value, suffix = '') => (value === null || value === undefined ? '—' : `${value}${suffix}`);
const statCards = computed(() => [
  { label: 'Components', value: fmt(analytics.value?.totalComponents) },
  { label: 'Applications', value: fmt(analytics.value?.totalApplications) },
  {
    label: 'Adoption rate',
    value: fmt(analytics.value?.adoptionRate, '%'),
    hint: analytics.value && !analytics.value.usageDataAvailable ? 'No usage data yet' : '',
  },
  { label: 'Health score', value: fmt(analytics.value?.healthScore), tone: healthTone(analytics.value?.healthScore) },
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
