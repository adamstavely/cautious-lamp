<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="Design system governance"
      lead="Enforce design system rules and check compliance. Monitor both the design system itself and applications using it."
      spot="admin/governance"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <div class="grid lg:grid-cols-3 gap-6 items-start">
      <!-- Left column: rules -->
      <UiPanel title="Rules">
        <UiSelect v-model="ruleFilter" label="Filter rules by category" :options="[{ value: 'all', label: 'All rules' }, ...CATEGORY_OPTIONS]" />

        <UiSpinner v-if="rulesLoading" label="Loading rules…" />
        <UiCallout v-else-if="rulesError" tone="danger">
          Rules could not be loaded.
          <template #actions>
            <UiButton size="sm" variant="ghost" @click="loadRules">Retry</UiButton>
          </template>
        </UiCallout>
        <p v-else-if="filteredRules.length === 0" class="text-sm text-ink-secondary">No rules in this category.</p>
        <ul v-else class="space-y-3">
          <li
            v-for="rule in filteredRules"
            :key="rule.id"
            class="rule-item"
            :class="editingRule?.id === rule.id ? 'rule-item-selected' : rule.enabled ? 'rule-item-on' : 'rule-item-off'"
          >
            <input
              type="checkbox"
              :checked="rule.enabled"
              :disabled="!canAdmin || togglingId === rule.id"
              :aria-label="`${rule.enabled ? 'Disable' : 'Enable'} ${rule.name}`"
              class="mt-1 accent-accent"
              @change="toggleRule(rule, $event.target.checked)"
            />
            <button type="button" class="rule-select" :aria-pressed="editingRule?.id === rule.id" @click="selectRule(rule)">
              <span class="block text-sm font-medium text-ink-strong">{{ rule.name }}</span>
              <span class="block text-xs mt-1 text-ink-secondary">{{ rule.description }}</span>
              <span class="mt-2 flex flex-wrap items-center gap-2">
                <UiChip :tone="severityTone(rule.severity)">{{ rule.severity }}</UiChip>
                <UiChip>{{ categoryLabel(rule.category) }}</UiChip>
                <span class="text-xs text-ink-muted">{{ typeLabel(rule.type) }} · v{{ rule.version }}</span>
              </span>
            </button>
          </li>
        </ul>

        <template #footer>
          <div v-if="canAdmin" class="flex flex-wrap gap-2 w-full">
            <UiButton size="sm" icon="add" @click="newRule">Add rule</UiButton>
            <UiButton size="sm" variant="ghost" icon="upload" @click="importInput?.click()">Import</UiButton>
            <input ref="importInput" type="file" accept="application/json,.json" class="sr-only" tabindex="-1" aria-hidden="true" @change="importRules" />
            <UiButton size="sm" variant="ghost" icon="download" @click="exportRules">Export</UiButton>
          </div>
          <UiButton v-else size="sm" variant="ghost" icon="download" @click="exportRules">Export rules</UiButton>
        </template>
      </UiPanel>

      <!-- Right column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Compliance checker -->
        <UiPanel title="Compliance checker">
          <template #actions>
            <UiButton variant="primary" icon="play_arrow" :loading="scanning" :disabled="!canRunScan" @click="runScan">
              {{ scanning ? 'Scanning…' : 'Run check' }}
            </UiButton>
          </template>

          <fieldset class="flex flex-wrap items-center gap-4">
            <legend class="sr-only">What to check</legend>
            <label class="radio-option">
              <input v-model="scope" type="radio" value="design-system" class="accent-accent" />
              Design system
            </label>
            <label class="radio-option" :class="{ 'text-ink-disabled cursor-not-allowed': !canAdmin }">
              <input v-model="scope" type="radio" value="application" class="accent-accent" :disabled="!canAdmin" />
              Application
            </label>
          </fieldset>

          <UiCallout v-if="scope === 'design-system'">
            Runs the enabled rules over every design system component's template, styles and scripts.
          </UiCallout>

          <template v-else>
            <UiCallout>
              Paste the application's HTML, CSS and JavaScript, or give a public URL: the server fetches that page and checks its HTML and inline styles and scripts (scripts are read, never run).
            </UiCallout>
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <UiSelect
                  id="gov-app"
                  v-model="selectedApplicationId"
                  label="Application"
                  :placeholder="applications.length ? 'Select an application' : 'No applications registered'"
                  :options="applications.map((app) => ({ value: app.id, label: app.name }))"
                />
                <p class="text-xs mt-1 text-ink-muted">
                  <UiLink to="/admin/applications/register">Register an application</UiLink>
                  <span v-if="selectedApplication?.lastScanned"> · Last scanned {{ formatDate(selectedApplication.lastScanned) }}</span>
                </p>
              </div>
              <UiSegmented v-model="source" label="Scan" :options="SOURCE_OPTIONS" />
            </div>
            <UiInput v-if="source === 'url'" id="gov-url" :model-value="scanUrl" type="url" @update:model-value="scanUrl = String($event).trim()" label="Page URL" placeholder="https://app.example.com" />
            <div v-else class="grid gap-3">
              <UiTextarea
                v-for="field in CODE_FIELDS"
                :id="`gov-code-${field.key}`"
                :key="field.key"
                v-model="codebase[field.key]"
                :label="field.label"
                rows="4"
                spellcheck="false"
                mono
              />
              <p class="text-xs text-ink-muted">Up to 256 KB per field and 512 KB in total (the server's request size limit may be lower).</p>
            </div>
          </template>

          <div v-if="scanResult" class="space-y-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <UiStat v-for="tile in summaryTiles" :key="tile.label" :label="tile.label" :value="tile.value" :tone="tile.tone" />
            </div>
            <p class="text-xs text-ink-muted">
              {{ scanResult.scope === 'design-system' ? 'Design system' : scanResult.applicationName }}
              · {{ formatDate(scanResult.createdAt) }}
              <span v-if="scanResult.url"> · {{ scanResult.url }}</span>
              <span v-if="skippedRules.length"> · {{ skippedRules.length }} rule(s) skipped: {{ skippedRules.map((r) => `${r.name} (${r.reason})`).join('; ') }}</span>
              <span v-if="incompleteRules.length"> · {{ incompleteRules.length }} rule(s) not fully checked (not a pass): {{ incompleteRules.map((r) => `${r.name} (${r.reason})`).join('; ') }}</span>
              <span v-if="scanResult.truncated"> · Only the first {{ scanResult.checks.length }} results were kept.</span>
            </p>
            <ul class="space-y-2 max-h-96 overflow-y-auto">
              <li v-for="check in scanResult.checks" :key="check.id" class="check-card" :class="statusCard(check.status)">
                <div class="flex items-center gap-2 mb-1">
                  <span class="material-symbols-outlined text-sm" :class="statusIconClass(check.status)" aria-hidden="true">{{ statusIcon(check.status) }}</span>
                  <span class="text-sm font-medium text-ink-strong">{{ check.rule }}</span>
                  <span class="sr-only">({{ check.status }})</span>
                </div>
                <div class="text-xs mt-1 text-ink-secondary">{{ check.message }}</div>
                <div v-if="check.component" class="text-xs mt-2 font-code text-ink-secondary">Component: {{ check.component }}</div>
                <div v-if="check.file || check.line" class="text-xs mt-1 font-code text-ink-muted">
                  {{ check.file || 'Line' }}{{ check.line ? `:${check.line}` : '' }}
                </div>
                <pre v-if="check.element" class="check-element"><code>{{ check.element }}</code></pre>
              </li>
            </ul>
          </div>
        </UiPanel>

        <!-- Rule editor -->
        <UiPanel :title="editingRule ? (editingRule.id ? 'Rule' : 'New rule') : 'Rule configuration'">
          <template v-if="editingRule?.builtIn" #actions>
            <UiChip>built-in</UiChip>
          </template>

          <form v-if="editingRule" class="space-y-4" @submit.prevent="saveRule">
            <fieldset :disabled="!canAdmin || saving" class="space-y-4">
              <p v-if="!canAdmin" class="text-xs text-ink-muted">You can view rules; changing them needs the admin:governance permission.</p>
              <div class="grid md:grid-cols-2 gap-4 items-end">
                <UiInput id="rule-name" v-model="editingRule.name" label="Name" required maxlength="120" />
                <UiCheckbox v-model="editingRule.enabled" label="Enabled" class="pb-2" />
              </div>
              <UiTextarea id="rule-description" v-model="editingRule.description" label="Description" rows="2" maxlength="1000" />
              <div class="grid md:grid-cols-2 gap-4">
                <UiSelect id="rule-category" v-model="editingRule.category" label="Category" :options="CATEGORY_OPTIONS" />
                <UiSelect id="rule-severity" v-model="editingRule.severity" label="Severity" :options="SEVERITY_OPTIONS" />
                <UiSelect id="rule-type" :model-value="editingRule.type" label="Check" :options="TYPE_OPTIONS" @update:model-value="setType" />
                <UiSelect
                  id="rule-target"
                  v-model="editingRule.target"
                  label="Applies to"
                  :options="TARGETS_BY_TYPE[editingRule.type].map((target) => ({ value: target, label: TARGET_LABELS[target] }))"
                />
              </div>

              <!-- Type-specific fields -->
              <UiInput
                v-if="usesSelector"
                id="rule-selector"
                v-model="editingRule.selector"
                label="CSS selector"
                required
                maxlength="300"
                placeholder='img:not([role="presentation"])'
                mono
              />
              <UiInput
                v-if="editingRule.type === 'selector-attribute'"
                id="rule-attribute"
                v-model="editingRule.attribute"
                label="Required attribute (separate alternatives with |)"
                required
                placeholder="alt or aria-label|aria-labelledby"
                mono
              />
              <div v-if="editingRule.type === 'selector-count'" class="grid grid-cols-2 gap-4">
                <UiInput id="rule-min" v-model="editingRule.min" type="number" label="At least" min="0" max="10000" step="1" />
                <UiInput id="rule-max" v-model="editingRule.max" type="number" label="At most" min="0" max="10000" step="1" />
              </div>
              <div v-if="usesPattern" class="space-y-2">
                <UiInput
                  id="rule-pattern"
                  v-model="editingRule.pattern"
                  :label="editingRule.type === 'selector-attribute' ? 'Attribute value must match (optional regular expression)' : 'Regular expression'"
                  maxlength="300"
                  :required="editingRule.type !== 'selector-attribute'"
                  hint="Up to 300 characters. Backreferences, lookbehind and repeated groups that contain quantifiers or alternatives are refused; each match has a time limit."
                  mono
                />
                <fieldset class="flex flex-wrap items-center gap-4">
                  <legend class="sr-only">Regular expression flags</legend>
                  <UiCheckbox v-for="flag in FLAGS" :key="flag.value" v-model="editingRule.flagList" :value="flag.value" :label="flag.label" />
                </fieldset>
              </div>
              <template v-if="editingRule.type === 'token-usage'">
                <UiInput
                  id="rule-properties"
                  v-model="editingRule.propertiesText"
                  label="CSS properties (comma-separated; a trailing * matches a prefix)"
                  required
                  placeholder="color, background-color, margin*"
                  mono
                />
                <UiInput
                  id="rule-allowed"
                  v-model="editingRule.allowedValuesText"
                  label="Also allowed (comma-separated)"
                  placeholder="4px, 8px, 16px"
                  hint="var(--…), design token values and keywords such as inherit or transparent are always allowed."
                  mono
                />
              </template>
              <UiSelect v-if="editingRule.type === 'builtin'" id="rule-builtin" v-model="editingRule.builtin" label="Built-in check" :options="BUILTIN_OPTIONS" />
              <UiInput id="rule-message" v-model="editingRule.message" label="Message for each violation" required maxlength="500" />
            </fieldset>

            <!-- Test against sample -->
            <details class="test-details" :open="!!testResult">
              <summary class="text-sm font-medium cursor-pointer text-ink-strong">Test against sample code</summary>
              <div class="mt-3 space-y-3">
                <UiTextarea
                  id="test-sample"
                  v-model="testSample[editingRule.target]"
                  :label="`Sample ${TARGET_LABELS[editingRule.target]}`"
                  rows="5"
                  spellcheck="false"
                  mono
                />
                <UiButton size="sm" variant="primary" :loading="testing" :disabled="!canAdmin" @click="testRule">
                  {{ testing ? 'Testing…' : 'Test' }}
                </UiButton>
                <p v-if="!canAdmin" class="text-xs text-ink-muted">Testing rules needs admin:governance.</p>
                <div v-if="testResult" class="space-y-2" role="status">
                  <p class="text-sm text-ink-strong">
                    Result: <strong>{{ OUTCOME_LABELS[testResult.outcome] }}</strong>
                    <span v-if="testResult.reason" class="text-ink-secondary"> — {{ testResult.reason }}</span>
                  </p>
                  <ul class="space-y-1">
                    <li v-for="check in testResult.checks" :key="check.id" class="check-card text-xs" :class="statusCard(check.status)">
                      {{ check.message }}<span v-if="check.line"> (line {{ check.line }})</span>
                      <code v-if="check.element" class="block mt-1 font-code text-ink-secondary">{{ check.element }}</code>
                    </li>
                  </ul>
                </div>
              </div>
            </details>

            <div class="flex flex-wrap items-center gap-2">
              <UiButton v-if="canAdmin" type="submit" variant="primary" :loading="saving">
                {{ saving ? 'Saving…' : editingRule.id ? 'Save rule' : 'Create rule' }}
              </UiButton>
              <UiButton @click="closeEditor">{{ canAdmin ? 'Cancel' : 'Close' }}</UiButton>
              <template v-if="canAdmin && editingRule.id">
                <UiButton v-if="confirmDelete" class="ml-auto" variant="danger" @click="deleteRule">Confirm delete</UiButton>
                <UiButton v-else class="ml-auto" variant="ghost" icon="delete" @click="confirmDelete = true">Delete</UiButton>
              </template>
            </div>
          </form>
          <p v-else class="text-sm text-center py-8 text-ink-secondary">
            Select a rule to see or change it{{ canAdmin ? ', or add a new one' : '' }}.
          </p>
        </UiPanel>

        <!-- Scan history -->
        <UiPanel
          title="Scan history"
          :description="scope === 'application' && selectedApplication ? selectedApplication.name : ''"
        >
          <template #actions>
            <UiButton size="sm" variant="ghost" icon="refresh" @click="loadHistory">Refresh</UiButton>
          </template>
          <UiSpinner v-if="historyLoading" />
          <p v-else-if="history.length === 0" class="text-sm text-ink-secondary">No scans yet.</p>
          <ul v-else class="space-y-2">
            <li v-for="scan in history" :key="scan.id">
              <button
                type="button"
                class="scan-row"
                :class="{ 'scan-row-on': scanResult?.id === scan.id }"
                :aria-pressed="scanResult?.id === scan.id"
                @click="openScan(scan.id)"
              >
                <span>
                  <span class="block text-sm font-medium text-ink-strong">
                    {{ scan.scope === 'design-system' ? 'Design system' : scan.applicationName }}
                    <span class="text-xs font-normal text-ink-muted">· {{ SOURCE_LABELS[scan.source] }}</span>
                  </span>
                  <span class="block text-xs text-ink-muted">{{ formatDate(scan.createdAt) }} · {{ scan.createdBy?.name }} · {{ scan.rules.length }} rules</span>
                </span>
                <span class="flex flex-wrap items-center gap-3 text-xs">
                  <span class="text-success">{{ scan.summary.passed }} passed</span>
                  <span class="text-warning">{{ scan.summary.warnings }} warnings</span>
                  <span class="text-danger">{{ scan.summary.errors }} errors</span>
                  <span class="text-info">{{ scan.summary.info }} info</span>
                </span>
              </button>
            </li>
          </ul>
        </UiPanel>
      </div>
    </div>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageShell,
  UiButton,
  UiCallout,
  UiCheckbox,
  UiChip,
  UiInput,
  UiLink,
  UiPanel,
  UiSegmented,
  UiSelect,
  UiSpinner,
  UiStat,
  UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import { useAuth } from '../composables/useAuth.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

// Rules are declarative (docs/GOVERNANCE.md): this page edits data and the
// server runs it. Nothing here evaluates code.

const CATEGORY_OPTIONS = [
  { value: 'design-system', label: 'Design System' },
  { value: 'ux-hcd', label: 'UX / HCD' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'custom', label: 'Custom' },
];
const TYPE_OPTIONS = [
  { value: 'regex-absent', label: 'Pattern must not appear' },
  { value: 'regex-present', label: 'Pattern must appear' },
  { value: 'selector-attribute', label: 'Elements need an attribute' },
  { value: 'selector-count', label: 'Number of elements' },
  { value: 'token-usage', label: 'CSS uses design tokens' },
  { value: 'builtin', label: 'Built-in check' },
];
const TARGETS_BY_TYPE = {
  'regex-present': ['html', 'css', 'javascript'],
  'regex-absent': ['html', 'css', 'javascript'],
  'selector-attribute': ['html'],
  'selector-count': ['html'],
  'token-usage': ['css'],
  builtin: ['html'],
};
const TARGET_LABELS = { html: 'HTML', css: 'CSS', javascript: 'JavaScript' };
const BUILTIN_OPTIONS = [
  { value: 'axe', label: 'axe-core accessibility scan (WCAG A/AA)' },
  { value: 'form-labels', label: 'Form fields have labels' },
  { value: 'heading-order', label: 'Heading levels do not skip' },
  { value: 'component-naming', label: 'Component names are PascalCase (design system scans)' },
];
const FLAGS = [
  { value: 'i', label: 'Ignore case' },
  { value: 'm', label: 'Multiline' },
  { value: 's', label: 'Dot matches newline' },
];
const CODE_FIELDS = [
  { key: 'html', label: 'HTML' },
  { key: 'css', label: 'CSS' },
  { key: 'javascript', label: 'JavaScript' },
];
const SEVERITY_OPTIONS = [
  { value: 'error', label: 'Error' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];
const SOURCE_OPTIONS = [
  { value: 'code', label: 'Pasted code' },
  { value: 'url', label: 'Public URL' },
];
const OUTCOME_LABELS = { pass: 'Pass', fail: 'Violations found', skipped: 'Skipped', error: 'Could not run', incomplete: 'Not fully checked' };
const SOURCE_LABELS = { 'design-system': 'components', codebase: 'pasted code', url: 'URL' };

const { notice, showNotice, clearNotice } = useNotice();
const { hasPermission } = useAuth();
const canAdmin = computed(() => hasPermission('admin:governance'));

const rules = ref([]);
const rulesLoading = ref(false);
const rulesError = ref(false);
const ruleFilter = ref('all');
const togglingId = ref(null);

const applications = ref([]);
const scope = ref('design-system');
const selectedApplicationId = ref('');
const source = ref('code');
const scanUrl = ref('');
const codebase = ref({ html: '', css: '', javascript: '' });
const scanning = ref(false);
const scanResult = ref(null);

const editingRule = ref(null);
const saving = ref(false);
const confirmDelete = ref(false);
const testing = ref(false);
const testResult = ref(null);
const testSample = ref({ html: '', css: '', javascript: '' });

const importInput = ref(null);

const history = ref([]);
const historyLoading = ref(false);

// ---------- Presentation helpers ----------
const categoryLabel = (value) => CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value;
const typeLabel = (value) => TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;

const severityTone = (severity) => ({ error: 'danger', warning: 'warning' })[severity] ?? 'info';
const statusCard = (status) =>
  ({
    pass: 'border-success-border bg-success-bg',
    warning: 'border-warning-border bg-warning-bg',
    error: 'border-danger-border bg-danger-bg',
    info: 'border-info-border bg-info-bg',
  })[status];
const statusIcon = (status) => ({ pass: 'check_circle', warning: 'warning', error: 'error', info: 'info' })[status];
const statusIconClass = (status) => ({ pass: 'text-success', warning: 'text-warning', error: 'text-danger', info: 'text-info' })[status];

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const filteredRules = computed(() => (ruleFilter.value === 'all' ? rules.value : rules.value.filter((r) => r.category === ruleFilter.value)));
const selectedApplication = computed(() => applications.value.find((a) => a.id === selectedApplicationId.value) ?? null);
const usesSelector = computed(() => ['selector-attribute', 'selector-count'].includes(editingRule.value?.type));
const usesPattern = computed(() => ['regex-present', 'regex-absent', 'selector-attribute'].includes(editingRule.value?.type));
const skippedRules = computed(() => (scanResult.value?.ruleResults ?? []).filter((r) => r.outcome === 'skipped'));
const incompleteRules = computed(() => (scanResult.value?.ruleResults ?? []).filter((r) => r.outcome === 'incomplete'));
const summaryTiles = computed(() => {
  const s = scanResult.value?.summary ?? {};
  return [
    { label: 'Passed', value: s.passed ?? 0, tone: 'success' },
    { label: 'Warnings', value: s.warnings ?? 0, tone: 'warning' },
    { label: 'Errors', value: s.errors ?? 0, tone: 'danger' },
    { label: 'Info', value: s.info ?? 0, tone: 'accent' },
  ];
});
const canRunScan = computed(() => {
  if (scope.value === 'design-system') return true;
  if (!canAdmin.value || !selectedApplicationId.value) return false;
  if (source.value === 'url') return !!scanUrl.value;
  return Object.values(codebase.value).some((v) => v.trim());
});

// ---------- Loading ----------
const loadRules = async () => {
  rulesLoading.value = true;
  rulesError.value = false;
  try {
    const { data } = await apiClient.get('/api/v1/governance/rules');
    rules.value = data.rules ?? [];
  } catch (error) {
    rulesError.value = true;
    showNotice(apiErrorMessage(error, 'Could not load the rules.'), 'error');
  } finally {
    rulesLoading.value = false;
  }
};

const loadApplications = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/applications');
    applications.value = data.applications ?? [];
  } catch (error) {
    applications.value = [];
    showNotice(apiErrorMessage(error, 'Could not load applications.'), 'error');
  }
};

const loadHistory = async () => {
  historyLoading.value = true;
  try {
    const params = { limit: 20 };
    if (scope.value === 'design-system') params.scope = 'design-system';
    else if (selectedApplicationId.value) params.applicationId = selectedApplicationId.value;
    else params.scope = 'application';
    const { data } = await apiClient.get('/api/v1/governance/scans', { params });
    history.value = data.scans ?? [];
  } catch (error) {
    history.value = [];
    showNotice(apiErrorMessage(error, 'Could not load scan history.'), 'error');
  } finally {
    historyLoading.value = false;
  }
};

const openScan = async (id) => {
  try {
    const { data } = await apiClient.get(`/api/v1/governance/scans/${encodeURIComponent(id)}`);
    scanResult.value = data;
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Could not load that scan.'), 'error');
  }
};

// ---------- Scans ----------
const runScan = async () => {
  scanning.value = true;
  try {
    const body = { scope: scope.value };
    if (scope.value === 'application') {
      body.applicationId = selectedApplicationId.value;
      if (source.value === 'url') body.url = scanUrl.value;
      else body.codebase = Object.fromEntries(Object.entries(codebase.value).filter(([, v]) => v.trim()));
    }
    const { data } = await apiClient.post('/api/v1/governance/scans', body);
    scanResult.value = data;
    showNotice(`Scan finished: ${data.summary.errors} errors, ${data.summary.warnings} warnings.`, 'success');
    await Promise.all([loadHistory(), scope.value === 'application' ? loadApplications() : null]);
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The scan failed.'), 'error');
  } finally {
    scanning.value = false;
  }
};

// ---------- Rule editor ----------
const toForm = (rule) => ({
  ...rule,
  description: rule.description ?? '',
  pattern: rule.pattern ?? '',
  selector: rule.selector ?? '',
  attribute: rule.attribute ?? '',
  min: rule.min ?? '',
  max: rule.max ?? '',
  builtin: rule.builtin ?? 'axe',
  flagList: (rule.flags ?? '').split('').filter(Boolean),
  propertiesText: (rule.properties ?? []).join(', '),
  allowedValuesText: (rule.allowedValues ?? []).join(', '),
});

const splitList = (text) => String(text ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const toNumber = (value) => (value === '' || value === null || value === undefined ? undefined : Number(value));

/** Only the fields the rule's type uses; the server rejects anything else */
const toPayload = (form) => {
  const payload = {
    name: form.name,
    description: form.description,
    category: form.category,
    severity: form.severity,
    enabled: !!form.enabled,
    type: form.type,
    target: form.target,
    message: form.message,
  };
  const flags = form.flagList.join('');
  if (['regex-present', 'regex-absent'].includes(form.type) || (form.type === 'selector-attribute' && form.pattern)) {
    payload.pattern = form.pattern;
    if (flags) payload.flags = flags;
  }
  if (form.type === 'selector-attribute' || form.type === 'selector-count') payload.selector = form.selector;
  if (form.type === 'selector-attribute') payload.attribute = form.attribute;
  if (form.type === 'selector-count') {
    if (toNumber(form.min) !== undefined) payload.min = toNumber(form.min);
    if (toNumber(form.max) !== undefined) payload.max = toNumber(form.max);
  }
  if (form.type === 'token-usage') {
    payload.properties = splitList(form.propertiesText);
    const allowed = splitList(form.allowedValuesText);
    if (allowed.length) payload.allowedValues = allowed;
  }
  if (form.type === 'builtin') payload.builtin = form.builtin;
  return payload;
};

const selectRule = (rule) => {
  editingRule.value = toForm(rule);
  confirmDelete.value = false;
  testResult.value = null;
};

const newRule = () => {
  editingRule.value = toForm({
    name: '',
    description: '',
    category: 'custom',
    severity: 'warning',
    enabled: true,
    type: 'regex-absent',
    target: 'html',
    message: '',
  });
  confirmDelete.value = false;
  testResult.value = null;
};

const setType = (type) => {
  editingRule.value.type = type;
  onTypeChange();
};

const onTypeChange = () => {
  const allowed = TARGETS_BY_TYPE[editingRule.value.type];
  if (!allowed.includes(editingRule.value.target)) editingRule.value.target = allowed[0];
};

const closeEditor = () => {
  editingRule.value = null;
  testResult.value = null;
  confirmDelete.value = false;
};

const upsertRule = (rule) => {
  const index = rules.value.findIndex((r) => r.id === rule.id);
  if (index === -1) rules.value.push(rule);
  else rules.value.splice(index, 1, rule);
};

const saveRule = async () => {
  saving.value = true;
  try {
    const form = editingRule.value;
    const payload = toPayload(form);
    const { data } = form.id
      ? await apiClient.put(`/api/v1/governance/rules/${encodeURIComponent(form.id)}`, { ...payload, version: form.version })
      : await apiClient.post('/api/v1/governance/rules', payload);
    upsertRule(data);
    editingRule.value = toForm(data);
    showNotice(`Saved "${data.name}" (version ${data.version}).`, 'success');
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Could not save the rule.'), 'error');
    if (error?.response?.status === 409) await loadRules();
  } finally {
    saving.value = false;
  }
};

const toggleRule = async (rule, enabled) => {
  togglingId.value = rule.id;
  try {
    const { data } = await apiClient.patch(`/api/v1/governance/rules/${encodeURIComponent(rule.id)}`, { enabled, version: rule.version });
    upsertRule(data);
    if (editingRule.value?.id === data.id) editingRule.value = toForm(data);
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Could not change the rule.'), 'error');
    await loadRules();
  } finally {
    togglingId.value = null;
  }
};

const deleteRule = async () => {
  const rule = editingRule.value;
  try {
    await apiClient.delete(`/api/v1/governance/rules/${encodeURIComponent(rule.id)}`);
    rules.value = rules.value.filter((r) => r.id !== rule.id);
    closeEditor();
    showNotice(`Deleted "${rule.name}".`, 'success');
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Could not delete the rule.'), 'error');
  } finally {
    confirmDelete.value = false;
  }
};

const testRule = async () => {
  testing.value = true;
  testResult.value = null;
  try {
    const target = editingRule.value.target;
    const { data } = await apiClient.post('/api/v1/governance/rules/test', {
      rule: toPayload(editingRule.value),
      sample: { [target]: testSample.value[target] ?? '' },
    });
    testResult.value = data;
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The rule could not be tested.'), 'error');
  } finally {
    testing.value = false;
  }
};

// ---------- Import / export ----------
const exportRules = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/governance/rules/export');
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `governance-rules-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    showNotice(apiErrorMessage(error, 'Could not export the rules.'), 'error');
  }
};

const importRules = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    showNotice('That file is not valid JSON.', 'error');
    return;
  }
  const list = Array.isArray(parsed) ? parsed : parsed?.rules;
  if (!Array.isArray(list)) {
    showNotice('The file has no "rules" list.', 'error');
    return;
  }
  try {
    const { data } = await apiClient.post('/api/v1/governance/rules/import', { rules: list, mode: 'merge' });
    showNotice(`Imported: ${data.created} created, ${data.updated} updated.`, 'success');
    await loadRules();
  } catch (error) {
    showNotice(apiErrorMessage(error, 'The import failed; nothing was changed.'), 'error');
  }
};

watch(selectedApplicationId, (id) => {
  const app = applications.value.find((a) => a.id === id);
  if (app?.applicationUrl && !scanUrl.value) scanUrl.value = app.applicationUrl;
  loadHistory();
});
watch(scope, () => {
  scanResult.value = null;
  loadHistory();
});

onMounted(() => {
  loadRules();
  loadApplications();
  loadHistory();
});
</script>

<style scoped>
.rule-item {
  @apply flex items-start gap-3 p-3 rounded-tile border transition-colors;
}
.rule-item-selected {
  @apply bg-accent-subtle border-accent-highlight;
}
.rule-item-on {
  @apply bg-surface-raised border-line;
}
.rule-item-off {
  @apply bg-surface-sunken border-line-faint;
}
.rule-select {
  @apply flex-1 text-left rounded-control focus-visible:outline focus-visible:outline-2 outline-focus;
}
.radio-option {
  @apply flex items-center gap-2 text-sm text-ink cursor-pointer;
}
.check-card {
  @apply p-4 rounded-tile border;
}
.check-element {
  @apply text-xs mt-2 p-2 rounded-control overflow-x-auto bg-surface-raised text-ink font-code;
}
.test-details {
  @apply rounded-tile border border-line p-4;
}
.scan-row {
  @apply w-full text-left p-3 rounded-tile border border-line bg-surface-raised flex flex-wrap items-center justify-between gap-2 transition-colors hover:bg-fill-hover focus-visible:outline focus-visible:outline-2 outline-focus;
}
.scan-row-on {
  @apply bg-accent-subtle border-accent-highlight;
}
</style>
