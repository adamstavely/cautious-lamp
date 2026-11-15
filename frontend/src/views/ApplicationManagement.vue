<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="Application management"
      lead="Register and manage applications with the design system. Enable scanners and capabilities for governance, visual regression, and session replay."
      spot="admin/application-management"
    >
      <template v-if="canRegister" #actions>
        <UiButton variant="primary" icon="plus" to="/admin/applications/register">Register new application</UiButton>
      </template>
    </PageHero>

    <PageSection title="Applications" description="Every registered application, its version and the capabilities it uses.">
      <div class="flex flex-wrap items-end gap-4 mb-6">
        <div class="w-full sm:w-72">
          <UiInput v-model="search" type="search" label="Search" icon="search" placeholder="Name, description, URL, team or tag" />
        </div>
        <div class="w-full sm:w-52">
          <UiSelect v-model="filterCapability" label="Capability" :options="capabilityFilterOptions" />
        </div>
        <div class="w-full sm:w-44">
          <UiSelect v-model="filterTeam" label="Team" :options="teamOptions" />
        </div>
        <div class="w-full sm:w-44">
          <UiSelect v-model="filterEnvironment" label="Environment" :options="environmentOptions" />
        </div>
        <!-- Workspace admins without admin:governance can only change their workspaces' applications -->
        <div v-if="!isGovernance" class="w-full sm:w-64">
          <UiSelect v-model="scope" label="Show applications from" :options="scopeOptions" />
        </div>
      </div>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

      <UiSpinner v-if="loading" label="Loading applications…" />

      <UiCallout v-else-if="loadError" tone="danger" role="alert">
        {{ loadError }}
        <template #actions>
          <UiButton size="sm" @click="loadAll">Try again</UiButton>
        </template>
      </UiCallout>

      <UiEmptyState
        v-else-if="filteredApplications.length === 0"
        spot="admin/application-management"
        :title="emptyTitle"
      >
        <template v-if="filtersActive" #actions>
          <UiButton @click="clearFilters">Clear filters</UiButton>
        </template>
        <template v-else-if="canRegister" #actions>
          <UiButton variant="primary" to="/admin/applications/register">Register your first application</UiButton>
        </template>
      </UiEmptyState>

      <UiPanel v-else flush>
        <UiTable caption="Registered applications">
          <thead>
            <tr>
              <th v-for="heading in tableHeadings" :key="heading" scope="col">{{ heading }}</th>
              <th scope="col" class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in pagedApplications" :key="app.id">
              <td>
                <router-link :to="`/admin/applications/${encodeURIComponent(app.id)}`" class="app-name-link">{{ app.name }}</router-link>
                <p v-if="app.description" class="text-ink-secondary">{{ app.description }}</p>
                <p v-if="safeHttpUrl(app.repository)" class="mt-1 text-xs">
                  <UiLink :href="safeHttpUrl(app.repository)" external class="break-all">{{ app.repository }}</UiLink>
                </p>
              </td>
              <td>
                <UiChip v-if="app.workspaceId" tone="info">{{ workspaceName(app.workspaceId) }}</UiChip>
                <UiChip v-else>No workspace</UiChip>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <span v-if="app.designSystemVersion" class="font-medium" :class="isBehind(app.designSystemVersion) ? 'text-warning' : 'text-success'">v{{ app.designSystemVersion }}</span>
                  <span v-else class="text-ink-muted">Not set</span>
                  <AppIcon name="triangle-alert" v-if="isBehind(app.designSystemVersion)" class="text-base text-warning" title="Needs upgrade" role="img" aria-label="Needs upgrade" />
                  <AppIcon name="circle-check" v-else-if="app.designSystemVersion" class="text-base text-success" title="Up to date" role="img" aria-label="Up to date" />
                </div>
                <UiButton
                  v-if="currentVersion && isBehind(app.designSystemVersion) && canWrite(app)"
                  variant="ghost"
                  size="sm"
                  class="mt-1 -ml-3"
                  @click="confirmVersionUpdate(app)"
                >
                  Update to v{{ currentVersion }}
                </UiButton>
              </td>
              <td>
                <div class="flex flex-wrap gap-2">
                  <UiChip v-for="cap in enabledCapabilities(app)" :key="cap.key" :tone="cap.tone">{{ cap.label }}</UiChip>
                  <UiChip v-if="enabledCapabilities(app).length === 0">No capabilities</UiChip>
                </div>
              </td>
              <td>
                <div class="flex flex-col gap-1 text-ink-secondary">
                  <p v-if="app.teamId"><span class="font-medium text-ink">Team:</span> {{ app.teamId }}</p>
                  <p v-if="app.metadata?.environment"><span class="font-medium text-ink">Env:</span> {{ app.metadata.environment }}</p>
                  <p v-if="app.metadata?.framework"><span class="font-medium text-ink">Framework:</span> {{ app.metadata.framework }}</p>
                  <div v-if="app.metadata?.tags?.length" class="flex flex-wrap gap-1 mt-1">
                    <UiChip v-for="tag in app.metadata.tags" :key="tag">{{ tag }}</UiChip>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap">{{ formatDate(app.registeredAt) }}</td>
              <td class="whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-1">
                  <UiButton variant="ghost" size="sm" icon="eye" icon-only :label="`View ${app.name}`" :to="`/admin/applications/${encodeURIComponent(app.id)}`" />
                  <UiButton
                    v-if="app.capabilities?.governance?.enabled && isGovernance"
                    variant="ghost"
                    size="sm"
                    icon="shield"
                    icon-only
                    :label="`Run a governance scan of ${app.name}`"
                    :loading="scanning === app.id"
                    @click="runScan(app)"
                  />
                  <UiButton
                    v-if="app.capabilities?.visualRegression?.projectId"
                    variant="ghost"
                    size="sm"
                    icon="images"
                    icon-only
                    :label="`View ${app.name}'s visual regression test runs`"
                    :to="`/tools/visual-regression/${encodeURIComponent(app.capabilities.visualRegression.projectId)}`"
                  />
                  <UiButton
                    v-if="app.capabilities?.sessionReplay?.projectId"
                    variant="ghost"
                    size="sm"
                    icon="video"
                    icon-only
                    :label="`View ${app.name}'s session replays`"
                    :to="`/hcd/session-replay/${encodeURIComponent(app.capabilities.sessionReplay.projectId)}/sessions`"
                  />
                  <template v-if="canWrite(app)">
                    <UiButton variant="ghost" size="sm" icon="pencil" icon-only :label="`Edit ${app.name}`" @click="openEdit(app)" />
                    <UiButton variant="danger" size="sm" icon="trash-2" icon-only :label="`Delete ${app.name}`" @click="deleteApplication(app)" />
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </UiTable>
        <nav v-if="pageCount > 1" class="app-pager" aria-label="Application pages">
          <span class="text-sm text-ink-secondary" aria-live="polite">
            Showing {{ pageStart + 1 }}–{{ Math.min(pageStart + PAGE_SIZE, filteredApplications.length) }} of {{ filteredApplications.length }}
          </span>
          <div class="flex gap-2">
            <UiButton size="sm" icon="chevron-left" :disabled="page === 1" @click="page -= 1">Previous</UiButton>
            <UiButton size="sm" trailing-icon="chevron-right" :disabled="page === pageCount" @click="page += 1">Next</UiButton>
          </div>
        </nav>
      </UiPanel>
    </PageSection>

    <PageSection title="Migration planning" description="Track design system versions and plan upgrades across applications." divided>
      <UiCallout v-if="migrationError" tone="warning" class="mb-6">{{ migrationError }}</UiCallout>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <UiStat
          label="Current DS version"
          :value="currentVersion ? `v${currentVersion}` : '—'"
          :hint="versionSource ? `From ${versionSource === 'DESIGN_SYSTEM_VERSION' ? 'the DESIGN_SYSTEM_VERSION setting' : `the backend's package version`}` : ''"
        />
        <UiStat label="Up to date" :value="migrationData?.upgradeSummary?.upToDate ?? 0" />
        <UiStat label="Needs upgrade" :value="migrationData?.upgradeSummary?.needsUpgrade ?? 0" />
        <UiStat
          label="Major upgrades"
          tone="danger"
          :value="migrationData?.upgradeSummary?.needsMajorUpgrade ?? 0"
          :hint="migrationData?.upgradeSummary?.unknownVersion ? `${migrationData.upgradeSummary.unknownVersion} more with no version recorded` : ''"
        />
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <UiPanel v-if="migrationData?.recommendedActions?.length" title="Recommended actions" heading-tag="h3">
          <ul class="flex flex-col gap-3">
            <li
              v-for="action in migrationData.recommendedActions.slice(0, 5)"
              :key="action.applicationId"
              class="flex items-center justify-between gap-4 rounded-tile border p-3"
              :class="action.priority === 'high' ? 'border-danger-border bg-danger-bg' : 'border-warning-border bg-warning-bg'"
            >
              <div class="min-w-0 flex-1">
                <p class="flex flex-wrap items-center gap-2 mb-1">
                  <span class="font-medium text-ink-strong">{{ action.applicationName }}</span>
                  <UiChip :tone="action.priority === 'high' ? 'danger' : 'warning'">{{ action.priority }}</UiChip>
                </p>
                <p class="text-xs text-ink-secondary">{{ action.reason }}</p>
                <p class="flex items-center gap-2 mt-1 text-xs text-ink-muted">
                  <span>{{ action.currentVersion === 'unknown' ? 'unknown' : `v${action.currentVersion}` }}</span>
                  <AppIcon name="arrow-right" class="text-base" />
                  <span class="sr-only">to</span>
                  <span>v{{ action.targetVersion }}</span>
                </p>
              </div>
              <UiButton
                v-if="canWriteId(action.applicationId)"
                size="sm"
                icon="refresh-ccw"
                :loading="updatingVersion === action.applicationId"
                @click="updateApplicationVersion(action.applicationId, action.targetVersion)"
              >
                Update
              </UiButton>
            </li>
          </ul>
        </UiPanel>

        <UiPanel title="Applications by version" heading-tag="h3">
          <p v-if="!migrationData || Object.keys(migrationData.applicationsByVersion).length === 0" class="text-sm text-ink-muted">No applications yet</p>
          <ul v-else class="flex flex-col divide-y divide-line-faint">
            <li v-for="(apps, version) in migrationData.applicationsByVersion" :key="version" class="py-4 first:pt-0 last:pb-0">
              <div class="flex items-center justify-between gap-2 mb-2">
                <p class="flex items-center gap-2">
                  <span class="font-medium text-ink-strong">{{ version === 'unknown' ? 'Version not set' : `v${version}` }}</span>
                  <UiChip v-if="version !== 'unknown' && compareVersions(version, currentVersion) === 0" tone="success">Current</UiChip>
                </p>
                <span class="text-xs text-ink-muted">{{ apps.length }} app{{ apps.length !== 1 ? 's' : '' }}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <UiChip v-for="app in apps" :key="app.id">{{ app.name }}</UiChip>
              </div>
            </li>
          </ul>
        </UiPanel>
      </div>
    </PageSection>

    <!-- Edit Application Modal -->
    <WorkspaceModal :open="!!edit.app" :title="edit.app ? `Edit ${edit.app.name}` : 'Edit application'" :busy="edit.saving" size="lg" @close="edit.app = null">
      <form v-if="edit.app" :id="editFormId" class="flex flex-col gap-5" @submit.prevent="saveEdit">
        <InlineNotice :notice="edit.error ? { type: 'error', message: edit.error } : null" @dismiss="edit.error = null" />
        <UiTabs v-model="edit.tab" :tabs="editTabs" label="Application settings">
          <div v-show="edit.tab === 'details'" class="flex flex-col gap-5">
            <ApplicationDetailsForm v-model="edit.details" />
            <UiSelect
              v-model="edit.workspaceId"
              label="Workspace"
              :options="moveOptions"
              hint="Moving needs the admin role in both workspaces (or admin:governance). Schedules and SLAs move with it; past scans and reports stay with the workspace they were made in."
            />
          </div>
          <div v-show="edit.tab === 'capabilities'">
            <ApplicationCapabilitiesForm v-model="edit.capabilities" />
          </div>
        </UiTabs>
      </form>
      <template #footer>
        <UiButton :disabled="edit.saving" @click="edit.app = null">Cancel</UiButton>
        <UiButton variant="primary" type="submit" :form="editFormId" :loading="edit.saving">{{ edit.saving ? 'Saving…' : 'Save changes' }}</UiButton>
      </template>
    </WorkspaceModal>

    <ConfirmDialog :state="confirmState" />
  </PageShell>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiEmptyState,
  UiInput,
  UiLink,
  UiPanel,
  UiSelect,
  UiSpinner,
  UiStat,
  UiTable,
  UiTabs,
} from '../components/ui';
import ApplicationCapabilitiesForm from '../components/applications/ApplicationCapabilitiesForm.vue';
import ApplicationDetailsForm from '../components/applications/ApplicationDetailsForm.vue';
import { capabilitiesForm, capabilitiesPayload } from '../components/applications/capabilities.js';
import { detailsForm, updateFields } from '../components/applications/details.js';
import ConfirmDialog from '../components/workspaces/ConfirmDialog.vue';
import WorkspaceModal from '../components/workspaces/WorkspaceModal.vue';
import { safeHttpUrl } from '../components/workspaces/safeContent.js';
import { atLeast, formatDate } from '../components/workspaces/ui.js';
import { useAuth } from '../composables/useAuth.js';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage } from '../services/api.js';
import { compareVersions, parseVersion } from '../utils/semver.js';

/**
 * Registered applications and migration planning (docs/WORKSPACES.md).
 * Anyone signed in can read; editing needs admin:governance or the admin role
 * in the application's workspace, which the server enforces. The route lets in
 * workspace admins (router/rbacGuards.js), who see their workspaces'
 * applications first and can switch to all of them read-only.
 */
const { hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();
const route = useRoute();
const router = useRouter();
const { confirmState, askConfirm } = useConfirmDialog();

const tableHeadings = ['Application', 'Workspace', 'Design system version', 'Capabilities', 'Metadata', 'Registered'];
const capabilityFilterOptions = [
  { value: '', label: 'Any capability' },
  { value: 'governance', label: 'With governance' },
  { value: 'visualRegression', label: 'With visual regression' },
  { value: 'sessionReplay', label: 'With session replay' },
];
const scopeOptions = [
  { value: 'mine', label: 'Workspaces I administer' },
  { value: 'all', label: 'All applications' },
];
const CAPABILITIES = [
  { key: 'governance', label: 'Governance', tone: 'success' },
  { key: 'visualRegression', label: 'Visual regression', tone: 'info' },
  { key: 'sessionReplay', label: 'Session replay', tone: 'accent' },
];
const enabledCapabilities = (app) => CAPABILITIES.filter((cap) => app.capabilities?.[cap.key]?.enabled);

const loading = ref(false);
const loadError = ref(null);
const applications = ref([]);
const workspaces = ref([]);
const filterCapability = ref('');
const filterTeam = ref('');
const filterEnvironment = ref('');
const search = ref('');
const facets = ref({ teams: [], environments: [] });
const ENVIRONMENTS = ['development', 'staging', 'production'];
const teamOptions = computed(() => [{ value: '', label: 'Any team' }, ...facets.value.teams.map((team) => ({ value: team, label: team }))]);
const environmentOptions = computed(() => [
  { value: '', label: 'Any environment' },
  ...[...new Set([...ENVIRONMENTS, ...facets.value.environments])].map((env) => ({ value: env, label: env.charAt(0).toUpperCase() + env.slice(1) })),
]);
const filtersActive = computed(() => !!(search.value.trim() || filterCapability.value || filterTeam.value || filterEnvironment.value));
const clearFilters = () => {
  search.value = '';
  filterCapability.value = '';
  filterTeam.value = '';
  filterEnvironment.value = '';
};
const scanning = ref(null);
// Without admin:governance, start with the applications this user can change
const scope = ref('mine');
const migrationData = ref(null);
const migrationError = ref(null);
const currentVersion = ref(null);
const versionSource = ref(null);
const updatingVersion = ref(null);

const isGovernance = computed(() => hasPermission('admin:governance'));
const adminWorkspaces = computed(() => workspaces.value.filter((ws) => atLeast(ws.effectiveRole, 'admin')));
const canRegister = computed(() => isGovernance.value || adminWorkspaces.value.length > 0);
const canWrite = (app) => isGovernance.value || (!!app.workspaceId && adminWorkspaces.value.some((ws) => ws.id === app.workspaceId));
const canWriteId = (id) => {
  const app = applications.value.find((a) => a.id === id);
  return !!app && canWrite(app);
};

// Search and filters run on the server; "workspaces I administer" is narrowed here
const filteredApplications = computed(() => applications.value.filter((app) => isGovernance.value || scope.value === 'all' || canWrite(app)));
const emptyTitle = computed(() => {
  if (filtersActive.value) return 'No applications match these filters.';
  return scope.value === 'mine' && !isGovernance.value ? 'No applications in the workspaces you administer.' : 'No applications found.';
});

// Paging
const PAGE_SIZE = 20;
const page = ref(1);
const pageCount = computed(() => Math.max(1, Math.ceil(filteredApplications.value.length / PAGE_SIZE)));
const pageStart = computed(() => (page.value - 1) * PAGE_SIZE);
const pagedApplications = computed(() => filteredApplications.value.slice(pageStart.value, pageStart.value + PAGE_SIZE));
watch(pageCount, (count) => {
  if (page.value > count) page.value = count;
});

const workspaceName = (id) => workspaces.value.find((ws) => ws.id === id)?.name ?? 'Another workspace';
const isBehind = (version) => !!currentVersion.value && (!parseVersion(version) || compareVersions(version, currentVersion.value) < 0);

const filterParams = () => {
  const params = {};
  if (search.value.trim()) params.search = search.value.trim();
  if (filterCapability.value) params.capability = filterCapability.value;
  if (filterTeam.value) params.teamId = filterTeam.value;
  if (filterEnvironment.value) params.environment = filterEnvironment.value;
  return params;
};

// Responses can come back out of order while typing: only the latest request's answer is shown
let listRequest = 0;
const loadApplications = async () => {
  const mine = ++listRequest;
  const response = await apiClient.get('/api/v1/applications', { params: filterParams() });
  if (mine !== listRequest) return;
  applications.value = response.data.applications ?? [];
  facets.value = response.data.facets ?? { teams: [], environments: [] };
};

// Filters reload from the server (search after a pause in typing) and go back to the first page
let searchTimer;
const reloadForFilters = () => {
  page.value = 1;
  loadApplications().catch((error) => showNotice(apiErrorMessage(error, 'Applications could not be loaded.'), 'error'));
};
watch([filterCapability, filterTeam, filterEnvironment], reloadForFilters);
watch(search, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(reloadForFilters, 300);
});
watch(scope, () => {
  page.value = 1;
});
onBeforeUnmount(() => clearTimeout(searchTimer));

const loadWorkspaces = async () => {
  try {
    workspaces.value = (await apiClient.get('/api/v1/workspaces')).data ?? [];
  } catch {
    workspaces.value = [];
  }
};

const loadMigrationData = async () => {
  migrationError.value = null;
  try {
    const [migration, version] = await Promise.all([
      apiClient.get('/api/v1/applications/version-tracking'),
      apiClient.get('/api/v1/design-system/current-version'),
    ]);
    migrationData.value = migration.data;
    currentVersion.value = version.data.version;
    versionSource.value = version.data.source;
  } catch (error) {
    migrationData.value = null;
    migrationError.value = apiErrorMessage(error, 'Migration data could not be loaded.');
  }
};

const loadAll = async () => {
  loading.value = true;
  loadError.value = null;
  try {
    await Promise.all([loadApplications(), loadWorkspaces(), loadMigrationData()]);
  } catch (error) {
    applications.value = [];
    loadError.value = apiErrorMessage(error, 'Applications could not be loaded.');
  } finally {
    loading.value = false;
  }
};

const refresh = async () => {
  try {
    await Promise.all([loadApplications(), loadMigrationData()]);
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Applications could not be reloaded.'), 'error');
  }
};

// ---------- Versions ----------
const updateApplicationVersion = async (applicationId, version) => {
  updatingVersion.value = applicationId;
  try {
    await apiClient.patch(`/api/v1/applications/${encodeURIComponent(applicationId)}/design-system-version`, { version });
    showNotice('Application version updated.', 'success');
    await refresh();
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The application version could not be updated.'), 'error');
  } finally {
    updatingVersion.value = null;
  }
};

const confirmVersionUpdate = async (app) => {
  const ok = await askConfirm({
    title: 'Update design system version?',
    message: `Record that ${app.name} now uses v${currentVersion.value}${app.designSystemVersion ? ` (was v${app.designSystemVersion})` : ''}.`,
    confirmText: 'Update',
  });
  if (ok) updateApplicationVersion(app.id, currentVersion.value);
};

// ---------- Edit ----------
const editFormId = 'edit-application-form';
const editTabs = [
  { value: 'details', label: 'Details' },
  { value: 'capabilities', label: 'Capabilities' },
];
const edit = reactive({ app: null, tab: 'details', details: detailsForm(), capabilities: capabilitiesForm(), workspaceId: '', saving: false, error: null });

const moveOptions = computed(() => {
  const options = adminWorkspaces.value.map((ws) => ({ value: ws.id, label: ws.name }));
  const current = edit.app?.workspaceId;
  if (current && !options.some((o) => o.value === current)) options.unshift({ value: current, label: workspaceName(current) });
  if (isGovernance.value || !current) options.unshift({ value: '', label: 'No workspace' });
  return options;
});

// ---------- Quick actions ----------
const runScan = async (app) => {
  scanning.value = app.id;
  try {
    const { data } = await apiClient.post('/api/v1/governance/scans', { scope: 'application', applicationId: app.id });
    const { errors = 0, warnings = 0, passed = 0 } = data.summary ?? {};
    showNotice(`${app.name} scanned: ${errors} error(s), ${warnings} warning(s), ${passed} passed.`, errors ? 'warning' : 'success');
    await refresh();
  } catch (error) {
    showNotice(apiErrorMessage(error, `${app.name} could not be scanned.`), 'error');
  } finally {
    scanning.value = null;
  }
};

const openEdit = (app) => {
  Object.assign(edit, {
    app,
    tab: 'details',
    details: detailsForm(app),
    capabilities: capabilitiesForm(app),
    workspaceId: app.workspaceId ?? '',
    saving: false,
    error: null,
  });
};

const saveEdit = async () => {
  const app = edit.app;
  const base = `/api/v1/applications/${encodeURIComponent(app.id)}`;
  const fields = updateFields(edit.details, app);
  const capabilities = capabilitiesPayload(edit.capabilities, app);
  const targetWorkspace = edit.workspaceId || null;
  edit.saving = true;
  edit.error = null;
  try {
    // Move first, so the other changes are checked against the workspace they'll live in
    if (targetWorkspace !== (app.workspaceId ?? null)) await apiClient.patch(`${base}/workspace`, { workspaceId: targetWorkspace });
    if (Object.keys(fields).length) await apiClient.put(base, fields);
    if (Object.keys(capabilities).length) await apiClient.patch(`${base}/capabilities`, capabilities);
    edit.app = null;
    showNotice(`${app.name} saved.`, 'success');
  } catch (error) {
    edit.error = apiErrorMessage(error, 'The changes could not be saved.');
  } finally {
    edit.saving = false;
    await refresh();
  }
};

// ---------- Delete ----------
const deleteApplication = async (app) => {
  const linked = [
    app.capabilities?.visualRegression?.projectId ? 'its visual-regression project' : '',
    app.capabilities?.sessionReplay?.projectId ? 'its session-replay project' : '',
  ].filter(Boolean);
  const ok = await askConfirm({
    title: 'Delete application?',
    message: `"${app.name}"${linked.length ? `, ${linked.join(', ')},` : ''} and its accessibility schedules and SLA will be deleted. Its governance scans and accessibility reports are kept as a record. This can't be undone.`,
    confirmText: 'Delete',
    danger: true,
  });
  if (!ok) return;
  try {
    await apiClient.delete(`/api/v1/applications/${encodeURIComponent(app.id)}`);
    showNotice(`${app.name} deleted.`, 'success');
    await refresh();
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The application could not be deleted.'), 'error');
  }
};

onMounted(async () => {
  // Arriving from registration: say it worked, then drop the query so a reload doesn't repeat it
  if (typeof route.query.registered === 'string') {
    showNotice(`${route.query.registered} registered.`, 'success');
    router.replace({ query: { ...route.query, registered: undefined } });
  }
  await loadAll();
  // The detail page's Edit opens the dialog here (?edit=<id>)
  if (typeof route.query.edit === 'string') {
    const id = route.query.edit;
    router.replace({ query: { ...route.query, edit: undefined } });
    try {
      const app = applications.value.find((a) => a.id === id) ?? (await apiClient.get(`/api/v1/applications/${encodeURIComponent(id)}`)).data;
      if (canWrite(app)) openEdit(app);
      else showNotice(`You can't edit ${app.name}.`, 'error');
    } catch (error) {
      showNotice(apiErrorMessage(error, 'That application could not be opened.'), 'error');
    }
  }
});
</script>

<style scoped>
.app-name-link {
  @apply font-medium text-ink-strong underline-offset-4 hover:text-accent-text hover:underline;
  @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus rounded-control;
}
.app-pager {
  @apply flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3;
}
</style>
