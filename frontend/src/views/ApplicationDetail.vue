<template>
  <PageShell width="wide">
    <!-- Loading the application -->
    <template v-if="loading && !app">
      <PageHero :back="backLink" title="Application" spot="admin/application-management" />
      <UiSpinner label="Loading application…" />
    </template>

    <!-- 404: missing, or in a workspace this user can't read (the server doesn't say which) -->
    <template v-else-if="notFound">
      <PageHero :back="backLink" title="Application not found" spot="admin/application-management" />
      <UiEmptyState
        spot="admin/application-management"
        title="This application doesn't exist or isn't visible to you."
        body="It may have been deleted, or it belongs to a workspace you're not a member of."
      >
        <template #actions>
          <UiButton variant="primary" icon="arrow-left" to="/admin/applications">Back to applications</UiButton>
        </template>
      </UiEmptyState>
    </template>

    <template v-else-if="loadError">
      <PageHero :back="backLink" title="Application" spot="admin/application-management" />
      <UiCallout tone="danger" role="alert">
        {{ loadError }}
        <template #actions>
          <UiButton size="sm" @click="loadApplication">Try again</UiButton>
        </template>
      </UiCallout>
    </template>

    <template v-else-if="app">
      <PageHero :back="backLink" :title="app.name" :lead="app.description" spot="admin/application-management">
        <template v-if="canWrite" #actions>
          <UiButton icon="pencil" :to="editLink">Edit</UiButton>
          <UiButton variant="danger" icon="trash-2" :loading="deleting" @click="deleteApplication">Delete</UiButton>
        </template>
      </PageHero>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

      <PageSection title="Overview" description="Where the application lives, what it's built with and who registered it.">
        <UiPanel>
          <dl class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 text-sm">
            <div>
              <dt class="mb-1 font-medium text-ink-secondary">Workspace</dt>
              <dd>
                <UiChip v-if="app.workspaceId" tone="info">{{ workspaceName }}</UiChip>
                <UiChip v-else>No workspace</UiChip>
              </dd>
            </div>
            <div>
              <dt class="mb-1 font-medium text-ink-secondary">Team</dt>
              <dd class="text-ink">{{ app.teamId || 'Not set' }}</dd>
            </div>
            <div>
              <dt class="mb-1 font-medium text-ink-secondary">Environment</dt>
              <dd class="text-ink capitalize">{{ app.metadata?.environment || 'Not set' }}</dd>
            </div>
            <div>
              <dt class="mb-1 font-medium text-ink-secondary">Framework</dt>
              <dd class="text-ink">{{ app.metadata?.framework || 'Not set' }}</dd>
            </div>
            <div>
              <dt class="mb-1 font-medium text-ink-secondary">Language</dt>
              <dd class="text-ink">{{ app.metadata?.language || 'Not set' }}</dd>
            </div>
            <div>
              <dt class="mb-1 font-medium text-ink-secondary">Version</dt>
              <dd class="text-ink">{{ app.version || 'Not set' }}</dd>
            </div>
            <div>
              <dt class="mb-1 font-medium text-ink-secondary">Design system version</dt>
              <dd class="flex flex-wrap items-center gap-2">
                <span v-if="app.designSystemVersion" class="font-medium text-ink-strong">v{{ app.designSystemVersion }}</span>
                <span v-else class="text-ink-muted">Not set</span>
                <UiChip v-if="upgradeAvailable" tone="warning" icon="triangle-alert">Upgrade available: v{{ currentVersion }}</UiChip>
                <UiChip v-else-if="currentVersion && app.designSystemVersion" tone="success" icon="circle-check">Up to date</UiChip>
              </dd>
            </div>
            <div>
              <dt class="mb-1 font-medium text-ink-secondary">Repository</dt>
              <dd>
                <UiLink v-if="safeHttpUrl(app.repository)" :href="safeHttpUrl(app.repository)" external class="break-all">{{ app.repository }}</UiLink>
                <span v-else class="text-ink-muted">Not set</span>
              </dd>
            </div>
            <div>
              <dt class="mb-1 font-medium text-ink-secondary">Application URL</dt>
              <dd>
                <UiLink v-if="safeHttpUrl(app.applicationUrl)" :href="safeHttpUrl(app.applicationUrl)" external class="break-all">{{ app.applicationUrl }}</UiLink>
                <span v-else class="text-ink-muted">Not set</span>
              </dd>
            </div>
            <div class="sm:col-span-2 lg:col-span-3">
              <dt class="mb-1 font-medium text-ink-secondary">Tags</dt>
              <dd>
                <div v-if="app.metadata?.tags?.length" class="flex flex-wrap gap-2">
                  <UiChip v-for="tag in app.metadata.tags" :key="tag">{{ tag }}</UiChip>
                </div>
                <span v-else class="text-ink-muted">No tags</span>
              </dd>
            </div>
            <div>
              <dt class="mb-1 font-medium text-ink-secondary">Registered</dt>
              <dd class="text-ink">{{ actorAndTime(app.registeredBy, app.registeredAt) }}</dd>
            </div>
            <div>
              <dt class="mb-1 font-medium text-ink-secondary">Updated</dt>
              <dd class="text-ink">{{ actorAndTime(app.updatedBy, app.updatedAt) }}</dd>
            </div>
          </dl>
        </UiPanel>
      </PageSection>

      <PageSection title="Status" description="The latest results from each capability. Each one loads on its own." divided>
        <div class="grid lg:grid-cols-2 gap-6">
          <!-- Governance -->
          <UiPanel title="Governance" heading-tag="h3" :description="governanceDescription">
            <template #actions>
              <UiButton
                v-if="canWrite"
                variant="primary"
                size="sm"
                icon="scan-search"
                :disabled="!isGovernance"
                :loading="scanning"
                @click="runScan"
              >
                Run scan
              </UiButton>
            </template>

            <p v-if="canWrite && !isGovernance" class="mb-4 text-sm text-ink-secondary">Running a scan needs the admin:governance permission.</p>
            <p v-else-if="canWrite && !app.applicationUrl" class="mb-4 text-sm text-ink-secondary">There's no application URL, so a scan has nothing to fetch until one is set.</p>

            <UiCallout v-if="scanError" tone="danger" role="alert" class="mb-4">{{ scanError }}</UiCallout>

            <UiSpinner v-if="scans.loading" label="Loading scans…" />
            <UiCallout v-else-if="scans.error" tone="warning">{{ scans.error }}</UiCallout>
            <template v-else>
              <template v-if="latestScan">
                <p class="mb-3 text-sm text-ink-secondary">Latest scan, {{ formatDateTime(latestScan.createdAt) }}</p>
                <dl class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <div v-for="figure in summaryFigures(latestScan.summary)" :key="figure.label" class="flex flex-col-reverse">
                    <dt class="text-xs text-ink-muted">{{ figure.label }}</dt>
                    <dd class="text-2xl font-semibold" :class="figure.class">{{ figure.value }}</dd>
                  </div>
                </dl>
                <h4 class="mb-2 text-sm font-semibold text-ink-strong">Recent scans</h4>
                <ul class="flex flex-col divide-y divide-line-faint text-sm">
                  <li v-for="scan in scans.data.scans" :key="scan.id" class="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
                    <span class="text-ink">{{ formatDateTime(scan.createdAt) }} <span class="text-ink-muted">· {{ SOURCE_LABEL[scan.source] ?? scan.source }}</span></span>
                    <span class="text-ink-secondary">{{ scan.summary?.passed ?? 0 }} passed, {{ scan.summary?.warnings ?? 0 }} warnings, {{ scan.summary?.errors ?? 0 }} errors</span>
                  </li>
                </ul>
                <p v-if="scans.data.total > scans.data.scans.length" class="mt-2 text-xs text-ink-muted">Showing {{ scans.data.scans.length }} of {{ scans.data.total }} scans.</p>
              </template>
              <p v-else class="text-sm text-ink-secondary">No governance scans yet.</p>
            </template>
          </UiPanel>

          <!-- Accessibility -->
          <UiPanel title="Accessibility" heading-tag="h3" description="The latest automated accessibility report.">
            <template #actions>
              <UiLink to="/admin/accessibility-reports" arrow>Accessibility reports</UiLink>
            </template>
            <UiSpinner v-if="reports.loading" label="Loading accessibility reports…" />
            <UiCallout v-else-if="reports.error" tone="warning">{{ reports.error }}</UiCallout>
            <template v-else-if="latestReport">
              <div class="grid sm:grid-cols-2 gap-4">
                <UiStat
                  label="Compliance score"
                  icon="circle-gauge"
                  :value="`${latestReport.complianceScore}%`"
                  :tone="scoreTone(latestReport.complianceScore)"
                  :hint="levelLabel(latestReport.wcagLevel)"
                />
                <UiStat label="Reports" icon="file-text" :value="reports.data.length" :hint="`Latest ${formatDateTime(latestReport.generatedAt)}`" />
              </div>
              <UiCallout v-if="latestReport.conformance" :tone="CONFORMANCE[latestReport.conformance.status]?.tone ?? 'info'" class="mt-4">
                {{ CONFORMANCE[latestReport.conformance.status]?.title ?? latestReport.conformance.status }}. Automated checks can't prove WCAG conformance.
              </UiCallout>
            </template>
            <p v-else class="text-sm text-ink-secondary">No accessibility reports yet.</p>
          </UiPanel>

          <!-- Visual regression -->
          <UiPanel title="Visual regression" heading-tag="h3" description="Screenshot comparisons against approved baselines.">
            <template v-if="vrProjectId" #actions>
              <UiButton size="sm" icon="images" :to="`/tools/visual-regression/${encodeURIComponent(vrProjectId)}`">View test runs</UiButton>
            </template>
            <p v-if="!vrProjectId" class="text-sm text-ink-secondary">
              {{ app.capabilities?.visualRegression?.enabled ? 'Enabled, but no project has been created yet.' : 'Not enabled for this application.' }}
            </p>
            <UiSpinner v-else-if="runs.loading" label="Loading test runs…" />
            <UiCallout v-else-if="runs.error" tone="warning">{{ runs.error }}</UiCallout>
            <div v-else class="grid sm:grid-cols-2 gap-4">
              <UiStat label="Test runs" icon="images" :value="runs.data?.total ?? 0" />
              <UiStat
                label="Latest run"
                icon="clock"
                :value="latestRun ? RUN_STATUS[latestRun.status] ?? latestRun.status : 'None yet'"
                :tone="latestRun ? RUN_TONE[latestRun.status] ?? 'neutral' : 'neutral'"
                :hint="latestRun ? runHint(latestRun) : ''"
              />
            </div>
          </UiPanel>

          <!-- Session replay -->
          <UiPanel title="Session replay" heading-tag="h3" description="Recorded user sessions from OpenReplay.">
            <template v-if="srProjectId" #actions>
              <UiButton size="sm" icon="video" :to="`/hcd/session-replay/${encodeURIComponent(srProjectId)}/sessions`">View sessions</UiButton>
            </template>
            <p v-if="!srProjectId" class="text-sm text-ink-secondary">
              {{ app.capabilities?.sessionReplay?.enabled ? 'Enabled, but no project has been created yet.' : 'Not enabled for this application.' }}
            </p>
            <UiSpinner v-else-if="sessions.loading" label="Loading sessions…" />
            <UiCallout v-else-if="sessions.error" tone="warning">{{ sessions.error }}</UiCallout>
            <UiStat v-else label="Sessions" icon="video" :value="sessions.data?.total ?? 0" :hint="`In the last ${SESSION_DAYS} days`" />
          </UiPanel>
        </div>
      </PageSection>
    </template>

    <ConfirmDialog :state="confirmState" />
  </PageShell>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { useBreadcrumbLabel } from '../composables/useBreadcrumbLabel.js';
import { useRoute, useRouter } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiCallout, UiChip, UiEmptyState, UiLink, UiPanel, UiSpinner, UiStat } from '../components/ui';
import ConfirmDialog from '../components/workspaces/ConfirmDialog.vue';
import { safeHttpUrl } from '../components/workspaces/safeContent.js';
import { atLeast } from '../components/workspaces/ui.js';
import { useAuth } from '../composables/useAuth.js';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import { useNotice } from '../composables/useNotice.js';
import apiClient, { apiErrorMessage, errorStatus } from '../services/api.js';
import { compareVersions, parseVersion } from '../utils/semver.js';

/**
 * One registered application (docs/APPLICATION_REGISTRATION.md, "Application
 * Management Page"): its details, the latest result from each capability and
 * the actions on it. Reads are scoped by the server, so a 404 means missing or
 * not visible. Writes need admin:governance or the admin role in the
 * application's workspace; application scans need admin:governance. The
 * server enforces both, and its 403s are shown.
 */
const route = useRoute();
const router = useRouter();
const { hasPermission } = useAuth();
const { notice, showNotice, clearNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

const backLink = { to: '/admin/applications', label: 'Applications' };
const SESSION_DAYS = 30;
const SOURCE_LABEL = { url: 'URL', codebase: 'Code', 'design-system': 'Design system' };
const RUN_STATUS = { pending: 'Pending', running: 'Running', completed: 'Completed', failed: 'Failed' };
const RUN_TONE = { completed: 'success', failed: 'danger', running: 'accent', pending: 'neutral' };
const SCHEDULE_LABEL = { manual: 'Manual', daily: 'Daily', weekly: 'Weekly' };
/** conformance.status, as AccessibilityReports.vue shows it (never a conformance claim) */
const CONFORMANCE = {
  failing: { tone: 'danger', title: 'Automated checks found failures' },
  'needs-review': { tone: 'warning', title: 'Needs manual review' },
  'no-automated-failures': { tone: 'success', title: 'No automated failures' },
};

const app = ref(null);
useBreadcrumbLabel(() => route.path, () => app.value?.name);
const loading = ref(false);
const notFound = ref(false);
const loadError = ref(null);
const workspaces = ref([]);
const currentVersion = ref(null);
const scanning = ref(false);
const scanError = ref(null);
const deleting = ref(false);

/** One status panel's state; each loads on its own so one failure doesn't blank the rest */
const statusState = () => reactive({ loading: false, error: null, data: null });
const scans = statusState();
const reports = statusState();
const runs = statusState();
const sessions = statusState();

const applicationId = computed(() => String(route.params.id ?? ''));
const base = computed(() => `/api/v1/applications/${encodeURIComponent(applicationId.value)}`);
const editLink = computed(() => ({ path: '/admin/applications', query: { edit: applicationId.value } }));

const isGovernance = computed(() => hasPermission('admin:governance'));
const workspace = computed(() => workspaces.value.find((ws) => ws.id === app.value?.workspaceId) ?? null);
const workspaceName = computed(() => workspace.value?.name ?? 'Another workspace');
const canWrite = computed(() => isGovernance.value || (!!app.value?.workspaceId && atLeast(workspace.value?.effectiveRole, 'admin')));

const upgradeAvailable = computed(() => {
  const version = app.value?.designSystemVersion;
  return !!currentVersion.value && !!version && (!parseVersion(version) || compareVersions(version, currentVersion.value) < 0);
});

const vrProjectId = computed(() => app.value?.capabilities?.visualRegression?.projectId ?? null);
const srProjectId = computed(() => app.value?.capabilities?.sessionReplay?.projectId ?? null);
const latestScan = computed(() => scans.data?.scans?.[0] ?? null);
const latestReport = computed(() => (Array.isArray(reports.data) ? reports.data[0] : null) ?? null);
const latestRun = computed(() => runs.data?.data?.[0] ?? null);

const governanceDescription = computed(() => {
  const gov = app.value?.capabilities?.governance;
  if (!gov?.enabled) return 'Not enabled: no scheduled scans. You can still scan by hand.';
  const lastScan = gov.lastScan ? `last scan ${formatDateTime(gov.lastScan)}` : 'no scan yet';
  return `Enabled · ${SCHEDULE_LABEL[gov.scanSchedule] ?? 'Manual'} scans · ${lastScan}`;
});

// ---------- Presentation ----------
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '');
const actorAndTime = (actor, at) => [actor?.name, at ? formatDateTime(at) : ''].filter(Boolean).join(', ') || 'Unknown';

const summaryFigures = (summary = {}) => [
  { label: 'Passed', value: summary.passed ?? 0, class: 'text-success' },
  { label: 'Warnings', value: summary.warnings ?? 0, class: summary.warnings ? 'text-warning' : 'text-ink-strong' },
  { label: 'Errors', value: summary.errors ?? 0, class: summary.errors ? 'text-danger' : 'text-ink-strong' },
  { label: 'Info', value: summary.info ?? 0, class: 'text-ink-strong' },
];

/** As AccessibilityReports.vue: 95+ success, 85+ accent, 70+ warning, below that danger */
const scoreTone = (score) => (score >= 95 ? 'success' : score >= 85 ? 'accent' : score >= 70 ? 'warning' : 'danger');
/** wcagLevel is the level the automated checks verified, not a conformance claim */
const levelLabel = (level) =>
  ({ 'Non-Compliant': 'Fails WCAG A', Unverified: 'Level A not verified: needs review' })[level] ?? `Automated WCAG ${level} checks pass`;

const runHint = (run) => {
  const when = formatDateTime(run.completedAt ?? run.startedAt);
  const results = run.resultsSummary ? `${run.resultsSummary.passed} passed, ${run.resultsSummary.failed} changed` : '';
  return [when, results].filter(Boolean).join(' · ');
};

// ---------- Loading ----------
// Bumped on every load, so answers for an application the page has left are dropped
let generation = 0;

const loadStatus = async (state, gen, request, fallback) => {
  state.loading = true;
  state.error = null;
  try {
    const data = await request();
    if (gen !== generation) return;
    state.data = data;
  } catch (error) {
    if (gen !== generation) return;
    state.data = null;
    state.error = apiErrorMessage(error, fallback);
  } finally {
    if (gen === generation) state.loading = false;
  }
};

const loadStatuses = (gen) => {
  const id = applicationId.value;
  loadStatus(scans, gen, async () => (await apiClient.get('/api/v1/governance/scans', { params: { applicationId: id, limit: 5 } })).data, 'Governance scans could not be loaded.');
  loadStatus(
    reports,
    gen,
    async () => (await apiClient.get('/api/v1/accessibility-reports/reports', { params: { applicationId: id } })).data ?? [],
    'Accessibility reports could not be loaded.',
  );
  if (vrProjectId.value) {
    const url = `/api/v1/visual-regression/projects/${encodeURIComponent(vrProjectId.value)}/runs`;
    loadStatus(
      runs,
      gen,
      async () => {
        const data = (await apiClient.get(url, { params: { limit: 1 } })).data ?? {};
        return { data: data.data ?? [], total: data.pagination?.total ?? (data.data ?? []).length };
      },
      'Test runs could not be loaded.',
    );
  }
  if (srProjectId.value) {
    const url = `/api/v1/session-replay/projects/${encodeURIComponent(srProjectId.value)}/sessions`;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - SESSION_DAYS * 24 * 60 * 60 * 1000);
    loadStatus(
      sessions,
      gen,
      async () => {
        const params = { startDate: startDate.toISOString(), endDate: endDate.toISOString(), limit: 1 };
        const data = (await apiClient.get(url, { params })).data ?? {};
        return { total: data.total ?? (data.sessions ?? []).length };
      },
      'Sessions could not be loaded.',
    );
  }
};

const loadWorkspaces = async (gen) => {
  try {
    const data = (await apiClient.get('/api/v1/workspaces')).data ?? [];
    if (gen === generation) workspaces.value = data;
  } catch {
    if (gen === generation) workspaces.value = [];
  }
};

const loadCurrentVersion = async (gen) => {
  try {
    const data = (await apiClient.get('/api/v1/design-system/current-version')).data;
    if (gen === generation) currentVersion.value = data?.version ?? null;
  } catch {
    // Without it the page just doesn't say whether an upgrade is available
    if (gen === generation) currentVersion.value = null;
  }
};

const loadApplication = async () => {
  const gen = ++generation;
  loading.value = true;
  notFound.value = false;
  loadError.value = null;
  scanError.value = null;
  app.value = null;
  for (const state of [scans, reports, runs, sessions]) Object.assign(state, { loading: false, error: null, data: null });
  loadWorkspaces(gen);
  loadCurrentVersion(gen);
  try {
    const data = (await apiClient.get(base.value)).data;
    if (gen !== generation) return;
    app.value = data;
    loadStatuses(gen);
  } catch (error) {
    if (gen !== generation) return;
    if (errorStatus(error) === 404) notFound.value = true;
    else loadError.value = apiErrorMessage(error, 'The application could not be loaded.');
  } finally {
    if (gen === generation) loading.value = false;
  }
};

watch(applicationId, loadApplication, { immediate: true });

// ---------- Actions ----------
const runScan = async () => {
  const current = app.value;
  const gen = generation;
  scanning.value = true;
  scanError.value = null;
  try {
    const result = (await apiClient.post('/api/v1/governance/scans', { scope: 'application', applicationId: current.id })).data;
    if (gen !== generation) return;
    const scan = { id: result.id, createdAt: result.createdAt, source: result.source, summary: result.summary };
    const previous = scans.data ?? { scans: [], total: 0 };
    scans.data = { scans: [scan, ...previous.scans.filter((s) => s.id !== scan.id)].slice(0, 5), total: previous.total + 1 };
    scans.error = null;
    // The server records it as the application's last scan
    if (current.capabilities?.governance) current.capabilities.governance.lastScan = result.createdAt;
    const s = result.summary ?? {};
    showNotice(`Scan finished: ${s.passed ?? 0} passed, ${s.warnings ?? 0} warnings, ${s.errors ?? 0} errors.`, 'success');
  } catch (error) {
    if (gen === generation) scanError.value = apiErrorMessage(error, 'The scan could not be run.');
  } finally {
    scanning.value = false;
  }
};

const deleteApplication = async () => {
  const current = app.value;
  const linked = [
    current.capabilities?.visualRegression?.projectId ? 'its visual-regression project' : '',
    current.capabilities?.sessionReplay?.projectId ? 'its session-replay project' : '',
  ].filter(Boolean);
  const ok = await askConfirm({
    title: 'Delete application?',
    message: `"${current.name}"${linked.length ? `, ${linked.join(', ')},` : ''} and its accessibility schedules and SLA will be deleted. Its governance scans and accessibility reports are kept as a record. This can't be undone.`,
    confirmText: 'Delete',
    danger: true,
  });
  if (!ok) return;
  deleting.value = true;
  try {
    await apiClient.delete(`/api/v1/applications/${encodeURIComponent(current.id)}`);
    router.push('/admin/applications');
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The application could not be deleted.'), 'error');
  } finally {
    deleting.value = false;
  }
};
</script>
