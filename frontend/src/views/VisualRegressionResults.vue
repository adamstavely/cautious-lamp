<template>
  <PageShell width="wide">
    <UiSpinner v-if="loading && !testRun" label="Loading results…" class="py-12" />

    <template v-else-if="error">
      <PageHero :back="backLink" title="Test run results" size="tool" />
      <UiEmptyState title="Error loading results" :body="error" spot="patterns/error-handling">
        <template #actions>
          <UiButton variant="primary" icon="refresh" @click="loadResults">Retry</UiButton>
        </template>
      </UiEmptyState>
    </template>

    <template v-else-if="testRun">
      <PageHero :back="backLink" title="Test run results" spot="admin/visual-regression" size="tool">
        <template #lead>
          <span class="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Status: <UiChip :tone="runTone(testRun.status)">{{ testRun.status }}</UiChip></span>
            <span v-if="testRun.commitSha">Commit: <span class="font-code">{{ testRun.commitSha.substring(0, 7) }}</span></span>
            <span v-if="testRun.branch">Branch: {{ testRun.branch }}</span>
            <span v-if="testRun.startedAt">{{ formatDate(testRun.startedAt) }}</span>
          </span>
        </template>
        <template #actions>
          <UiButton icon="download" @click="exportResults">Export</UiButton>
          <UiButton
            v-if="testRun.status === 'running' || testRun.status === 'pending'"
            :variant="autoRefresh ? 'primary' : 'secondary'"
            :icon="autoRefresh ? 'sync' : 'sync_disabled'"
            :aria-pressed="autoRefresh"
            @click="toggleAutoRefresh"
          >
            {{ autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off' }}
          </UiButton>
        </template>
      </PageHero>

      <div v-if="testRun.resultsSummary" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <UiStat label="Total" :value="testRun.resultsSummary.total" />
        <UiStat label="Passed" tone="success" :value="testRun.resultsSummary.passed" />
        <UiStat label="Failed" tone="danger" :value="testRun.resultsSummary.failed" />
        <UiStat label="New" tone="warning" :value="testRun.resultsSummary.new" />
        <UiStat label="Removed" :value="testRun.resultsSummary.removed" />
      </div>

      <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

      <UiPanel class="mb-6">
        <div class="grid gap-4 md:grid-cols-2">
          <UiInput ref="searchInput" v-model="searchQuery" type="search" label="Search" icon="search" placeholder="Search test names…" />
          <UiSegmented v-model="activeFilter" :options="filters" label="Status" />
        </div>
        <div class="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <UiInput v-model="dateRange.from" type="date" label="From" :max="dateRange.to || undefined" />
          <UiInput v-model="dateRange.to" type="date" label="To" :min="dateRange.from || undefined" />
          <UiSelect v-model="sortBy" :options="sortOptions" label="Sort by" />
          <div>
            <UiButton
              :icon="sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'"
              @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
            >
              {{ sortOrder === 'asc' ? 'Ascending' : 'Descending' }}
            </UiButton>
          </div>
        </div>
        <template v-if="selectedResults.length > 0" #footer>
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm text-ink-secondary" role="status">{{ selectedResults.length }} selected</span>
            <UiButton size="sm" variant="primary" icon="check" :disabled="processing" @click="bulkApprove">Approve all</UiButton>
            <UiButton size="sm" variant="danger" icon="close" :disabled="processing" @click="bulkReject">Reject all</UiButton>
            <UiButton size="sm" variant="ghost" @click="selectedResults = []">Clear</UiButton>
          </div>
        </template>
      </UiPanel>

      <p v-if="filteredResults.length > 0" class="mb-4 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
        <span><kbd class="result-kbd">J</kbd> / <kbd class="result-kbd">K</kbd> Navigate</span>
        <span><kbd class="result-kbd">A</kbd> Approve</span>
        <span><kbd class="result-kbd">R</kbd> Reject</span>
        <span><kbd class="result-kbd">/</kbd> Focus search</span>
      </p>

      <UiEmptyState
        v-if="filteredResults.length === 0"
        title="No results found"
        body="Try adjusting your search or filters"
        spot="patterns/empty-loading-states"
      />

      <div v-else class="space-y-6">
        <article
          v-for="(result, index) in filteredResults"
          :key="result.id"
          :ref="el => { if (el) resultRefs[index] = el }"
          class="result-card"
          :class="{
            'result-card-current': selectedIndex === index,
            'result-card-picked': selectedResults.includes(result.id),
          }"
          :aria-label="result.testName"
        >
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex flex-wrap items-center gap-3">
              <UiCheckbox
                :model-value="selectedResults.includes(result.id)"
                @update:model-value="toggleResultSelection(result.id)"
              >
                <span class="sr-only">Select {{ result.testName }}</span>
              </UiCheckbox>
              <UiChip :tone="resultTone(result.status)">{{ result.status }}</UiChip>
              <h3 class="text-lg font-semibold text-ink-strong">{{ result.testName }}</h3>
              <UiChip v-if="selectedIndex === index" tone="accent">Selected</UiChip>
            </div>
            <div class="flex items-center gap-2">
              <UiButton
                v-if="result.status === 'failed' || result.status === 'new'"
                size="sm"
                variant="primary"
                icon="check"
                :disabled="result.approved || processing"
                @click="approveDiff(result.id)"
              >
                {{ result.approved ? 'Approved' : 'Approve' }}
              </UiButton>
              <UiButton
                v-if="result.status === 'failed'"
                size="sm"
                variant="danger"
                icon="close"
                :disabled="processing"
                @click="rejectDiff(result.id)"
              >
                Reject
              </UiButton>
            </div>
          </div>

          <EnhancedDiffViewer
            v-if="result.baselineImageUrl || result.currentImageUrl"
            :baseline-image="result.baselineImageUrl"
            :current-image="result.currentImageUrl"
            :diff-image="result.diffImageUrl"
            :alt-text="result.testName"
            :height="500"
          />

          <p v-if="result.diffPercentage !== undefined" class="mt-4 text-sm text-ink-secondary">
            Diff percentage: <span class="font-semibold text-ink">{{ result.diffPercentage }}%</span>
          </p>
        </article>
      </div>
    </template>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import InlineNotice from '../components/InlineNotice.vue';
import EnhancedDiffViewer from '../components/EnhancedDiffViewer.vue';
import {
  PageHero,
  PageShell,
  UiButton,
  UiCheckbox,
  UiChip,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiSegmented,
  UiSelect,
  UiSpinner,
  UiStat,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';

const route = useRoute();
const backLink = computed(() => ({ to: `/tools/visual-regression/${route.params.id}`, label: 'Project' }));
const { notice, showNotice, clearNotice } = useNotice();
// The search field, focused by the "/" shortcut
const searchInput = ref(null);
const testRun = ref(null);
const results = ref([]);
const loading = ref(false);
const error = ref(null);
const activeFilter = ref('All');
const searchQuery = ref('');
const selectedIndex = ref(-1);
const resultRefs = ref([]);
const processing = ref(false);
const autoRefresh = ref(false);
const dateRange = ref({ from: '', to: '' });
const sortBy = ref('name');
const sortOrder = ref('asc');
const selectedResults = ref([]);
let refreshInterval = null;
let previousStatus = null;
let unmounted = false;
let loadSeq = 0;

const filters = ['All', 'Passed', 'Failed', 'New', 'Removed'];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'diffPercentage', label: 'Diff %' },
  { value: 'status', label: 'Status' },
  { value: 'date', label: 'Date' },
];

const API_PATH = '/api/v1/visual-regression';
const PAGE_LIMIT = 100; // the API's maximum page size
const MAX_PAGES = 50;

// The server's message or a readable fallback.
const apiErrorMessage = (err, fallback) => {
  const status = err?.response?.status;
  if (status === 401) return 'You are not signed in, or your API key was rejected.';
  if (status === 404) return 'This test run does not exist.';
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join(' ');
  if (typeof message === 'string' && message) return message;
  if (!err?.response) return 'Could not reach the server. Check your connection and try again.';
  return fallback;
};

const runPath = () => `${API_PATH}/runs/${encodeURIComponent(route.params.runId)}`;

// Results are paginated ({ data, pagination }); fetch every page.
const fetchAllResults = async () => {
  const all = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await apiClient.get(`${runPath()}/results`, { params: { page, limit: PAGE_LIMIT } });
    const body = response.data;
    if (Array.isArray(body)) return body;
    all.push(...(body?.data ?? []));
    if (!body?.pagination?.hasNext) break;
  }
  return all;
};

const stopAutoRefresh = () => {
  autoRefresh.value = false;
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

const loadResults = async () => {
  const seq = ++loadSeq;
  loading.value = true;
  try {
    const [runResponse, allResults] = await Promise.all([
      apiClient.get(runPath()),
      fetchAllResults(),
    ]);
    // Only the latest request wins (e.g. a reload after approving vs. an older
    // auto-refresh, or a run we've navigated away from).
    if (unmounted || seq !== loadSeq) return;
    testRun.value = runResponse.data;
    results.value = allResults;
    error.value = null;
    // Drop selections for results that no longer exist
    const ids = new Set(allResults.map((r) => r.id));
    selectedResults.value = selectedResults.value.filter((id) => ids.has(id));
    
    // Check if status changed and show notification
    if (previousStatus && previousStatus !== testRun.value.status) {
      if (testRun.value.status === 'completed') {
        showNotice('Test run completed.', 'success');
      } else if (testRun.value.status === 'failed') {
        showNotice('Test run failed.', 'error');
      }
    }
    previousStatus = testRun.value.status;
    
    // Stop auto-refresh if completed
    if (testRun.value.status === 'completed' || testRun.value.status === 'failed') {
      stopAutoRefresh();
    }
  } catch (err) {
    if (unmounted || seq !== loadSeq) return;
    console.error('Failed to load results:', err);
    const message = apiErrorMessage(err, 'Failed to load results.');
    if (testRun.value) {
      // Keep showing what we have; a background refresh failed.
      showNotice(message, 'error');
    } else {
      error.value = message;
    }
  } finally {
    if (seq === loadSeq) loading.value = false;
  }
};

// Single request helpers (no reload, no busy flag) shared by single and bulk actions
const requestApprove = (resultId) =>
  apiClient.post(`${API_PATH}/results/${encodeURIComponent(resultId)}/approve`);
const requestReject = (resultId) =>
  apiClient.post(`${API_PATH}/results/${encodeURIComponent(resultId)}/reject`);

const approveDiff = async (resultId) => {
  if (processing.value) return;
  processing.value = true;
  try {
    await requestApprove(resultId);
    showNotice('Diff approved.', 'success');
    await loadResults();
  } catch (err) {
    console.error('Failed to approve diff:', err);
    showNotice(apiErrorMessage(err, 'Failed to approve diff.'), 'error');
  } finally {
    processing.value = false;
  }
};

const rejectDiff = async (resultId) => {
  if (processing.value) return;
  processing.value = true;
  try {
    await requestReject(resultId);
    showNotice('Diff rejected.', 'info');
    await loadResults();
  } catch (err) {
    console.error('Failed to reject diff:', err);
    showNotice(apiErrorMessage(err, 'Failed to reject diff.'), 'error');
  } finally {
    processing.value = false;
  }
};

const filteredResults = computed(() => {
  let filtered = results.value;
  
  // Apply status filter
  if (activeFilter.value !== 'All') {
    const filterMap = {
      'Passed': 'passed',
      'Failed': 'failed',
      'New': 'new',
      'Removed': 'removed',
    };
    filtered = filtered.filter(r => r.status === filterMap[activeFilter.value]);
  }
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase();
    filtered = filtered.filter(r => (r.testName || '').toLowerCase().includes(query));
  }
  
  // Apply date range filter (if testRun has dates)
  if (dateRange.value.from || dateRange.value.to) {
    const fromDate = dateRange.value.from ? new Date(dateRange.value.from) : null;
    const toDate = dateRange.value.to ? new Date(dateRange.value.to) : null;
    
    filtered = filtered.filter(r => {
      // Use testRun date if available, otherwise skip date filtering
      if (!testRun.value?.startedAt) return true;
      const resultDate = new Date(testRun.value.startedAt);
      if (fromDate && resultDate < fromDate) return false;
      if (toDate && resultDate > toDate) return false;
      return true;
    });
  }
  
  // Apply sorting
  filtered = [...filtered].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy.value) {
      case 'name':
        comparison = (a.testName || '').localeCompare(b.testName || '');
        break;
      case 'diffPercentage':
        comparison = (a.diffPercentage || 0) - (b.diffPercentage || 0);
        break;
      case 'status':
        comparison = (a.status || '').localeCompare(b.status || '');
        break;
      case 'date':
        // Use testRun date if available
        if (testRun.value?.startedAt) {
          comparison = 0; // All results from same run have same date
        }
        break;
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
  
  return filtered;
});

// Run a request per selected result, then reload once and report how many succeeded.
const runBulk = async (eligible, request, verb) => {
  const ids = selectedResults.value.filter((id) => {
    const result = results.value.find((r) => r.id === id);
    return result && eligible(result);
  });
  if (ids.length === 0) {
    showNotice(`None of the selected results can be ${verb}.`, 'warning');
    return;
  }
  processing.value = true;
  try {
    const outcomes = await Promise.allSettled(ids.map((id) => request(id)));
    const failed = outcomes.filter((o) => o.status === 'rejected').length;
    const succeeded = ids.length - failed;
    if (failed > 0) {
      showNotice(`${verb[0].toUpperCase()}${verb.slice(1)} ${succeeded} of ${ids.length} results; ${failed} failed.`, 'error');
    } else {
      showNotice(`${verb[0].toUpperCase()}${verb.slice(1)} ${succeeded} result${succeeded === 1 ? '' : 's'}.`, 'success');
    }
    selectedResults.value = [];
    await loadResults();
  } finally {
    processing.value = false;
  }
};

const bulkApprove = async () => {
  if (selectedResults.value.length === 0 || processing.value) return;
  await runBulk((r) => (r.status === 'failed' || r.status === 'new') && !r.approved, requestApprove, 'approved');
};

const bulkReject = async () => {
  if (selectedResults.value.length === 0 || processing.value) return;
  await runBulk((r) => r.status === 'failed', requestReject, 'rejected');
};

const runTone = (status) =>
  ({ pending: 'warning', running: 'info', completed: 'success', failed: 'danger' })[status] ?? 'warning';

const resultTone = (status) =>
  ({ passed: 'success', failed: 'danger', new: 'warning', removed: 'neutral' })[status] ?? 'success';

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? 'Never' : date.toLocaleString();
};

const toggleAutoRefresh = () => {
  if (autoRefresh.value) {
    stopAutoRefresh();
    showNotice('Auto-refresh disabled.', 'info');
    return;
  }
  autoRefresh.value = true;
  refreshInterval = setInterval(() => {
    if (testRun.value && (testRun.value.status === 'running' || testRun.value.status === 'pending')) {
      loadResults();
    }
  }, 5000);
  showNotice('Auto-refresh enabled.', 'info');
};

// Quote a CSV field; prefix values that spreadsheets would run as formulas.
const csvField = (value) => {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const exportResults = () => {
  if (!testRun.value) return;
  try {
    const csvRows = [
      ['Test Name', 'Status', 'Diff %', 'Approved'].map(csvField).join(','),
      ...filteredResults.value.map(r => [
        r.testName,
        r.status,
        r.diffPercentage ?? 0,
        r.approved ? 'Yes' : 'No',
      ].map(csvField).join(','))
    ];
    
    const csv = csvRows.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeId = String(testRun.value.id).replace(/[^a-z0-9_-]/gi, '_');
    a.download = `visual-regression-results-${safeId}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
    
    showNotice('Results exported.', 'success');
  } catch (err) {
    showNotice('Failed to export results.', 'error');
    console.error('Export failed:', err);
  }
};

// Keyboard shortcuts
const handleKeydown = (e) => {
  // Leave browser/OS shortcuts (Cmd+R, Ctrl+A, ...) alone
  if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
  // Don't handle shortcuts while typing (so "/" etc. can be typed in the search box)
  const target = e.target;
  if (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  ) {
    return;
  }
  if (typeof e.key !== 'string') return;
  
  switch (e.key.toLowerCase()) {
    case 'j':
      e.preventDefault();
      if (selectedIndex.value < filteredResults.value.length - 1) {
        selectedIndex.value++;
        scrollToSelected();
      }
      break;
    case 'k':
      e.preventDefault();
      if (selectedIndex.value > 0) {
        selectedIndex.value--;
        scrollToSelected();
      }
      break;
    case 'a':
      e.preventDefault();
      if (selectedIndex.value >= 0 && selectedIndex.value < filteredResults.value.length) {
        const result = filteredResults.value[selectedIndex.value];
        if ((result.status === 'failed' || result.status === 'new') && !result.approved) {
          approveDiff(result.id);
        }
      }
      break;
    case 'r':
      e.preventDefault();
      if (selectedIndex.value >= 0 && selectedIndex.value < filteredResults.value.length) {
        const result = filteredResults.value[selectedIndex.value];
        if (result.status === 'failed') {
          rejectDiff(result.id);
        }
      }
      break;
    case '/': {
      e.preventDefault();
      searchInput.value?.focus();
      break;
    }
  }
};

const scrollToSelected = async () => {
  await nextTick();
  if (resultRefs.value[selectedIndex.value]) {
    resultRefs.value[selectedIndex.value].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
};

const toggleResultSelection = (resultId) => {
  const index = selectedResults.value.indexOf(resultId);
  if (index > -1) {
    selectedResults.value.splice(index, 1);
  } else {
    selectedResults.value.push(resultId);
  }
};

// Watch for filter/search changes to reset selection
watch([activeFilter, searchQuery, sortBy, sortOrder], () => {
  selectedIndex.value = -1;
  resultRefs.value = [];
});

// Navigating to another run reuses this component.
watch(() => route.params.runId, (id, oldId) => {
  if (!id || id === oldId) return;
  stopAutoRefresh();
  testRun.value = null;
  results.value = [];
  selectedResults.value = [];
  selectedIndex.value = -1;
  previousStatus = null;
  error.value = null;
  loadResults();
});

onMounted(() => {
  loadResults();
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  unmounted = true;
  document.removeEventListener('keydown', handleKeydown);
  stopAutoRefresh();
});
</script>

<style scoped>
.result-card {
  @apply rounded-card border border-line bg-surface-raised p-6 transition-all;
}
.result-card-picked {
  @apply border-success-border;
}
.result-card-current {
  @apply border-accent-highlight outline outline-2 outline-focus;
}
.result-kbd {
  @apply rounded-control bg-fill px-2 py-1 font-code text-ink;
}
</style>
