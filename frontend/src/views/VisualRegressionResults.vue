<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
          <!-- Loading State -->
        <div v-if="loading && !testRun" class="max-w-7xl mx-auto py-12 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading results...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="max-w-7xl mx-auto py-12">
          <div class="rounded-lg border p-6 text-center" :class="isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block text-red-600">error</span>
            <h2 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-red-400' : 'text-red-900'">Error Loading Results</h2>
            <p class="text-sm mb-4" :class="isDarkMode ? 'text-red-300' : 'text-red-700'">{{ error }}</p>
            <button
              @click="loadResults"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>

        <!-- Results Content -->
        <div v-else-if="testRun" class="max-w-7xl mx-auto">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h1 class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Test Run Results</h1>
                <div class="flex items-center gap-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span>Status: <span :class="getStatusClass(testRun.status)">{{ testRun.status }}</span></span>
                  <span v-if="testRun.commitSha">Commit: {{ testRun.commitSha.substring(0, 7) }}</span>
                  <span v-if="testRun.branch">Branch: {{ testRun.branch }}</span>
                  <span v-if="testRun.startedAt">{{ formatDate(testRun.startedAt) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="exportResults"
                  class="px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  :class="isDarkMode 
                    ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'"
                >
                  <span class="material-symbols-outlined text-base">download</span>
                  Export
                </button>
                <button
                  v-if="testRun.status === 'running' || testRun.status === 'pending'"
                  @click="toggleAutoRefresh"
                  class="px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  :class="autoRefresh
                    ? 'bg-indigo-600 text-white'
                    : (isDarkMode 
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200')"
                >
                  <span class="material-symbols-outlined text-base">{{ autoRefresh ? 'sync' : 'sync_disabled' }}</span>
                  {{ autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF' }}
                </button>
              </div>
            </div>

            <!-- Summary -->
            <div v-if="testRun.resultsSummary" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ testRun.resultsSummary.total }}</div>
              </div>
              <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-1 text-green-600">Passed</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ testRun.resultsSummary.passed }}</div>
              </div>
              <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-1 text-red-600">Failed</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ testRun.resultsSummary.failed }}</div>
              </div>
              <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-1 text-orange-600">New</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ testRun.resultsSummary.new }}</div>
              </div>
              <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-1 text-gray-600">Removed</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ testRun.resultsSummary.removed }}</div>
              </div>
            </div>
          </div>

          <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

          <!-- Search and Filters -->
          <div class="mb-6 space-y-4">
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <!-- Search -->
              <div class="flex-1 relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search test names..."
                  class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode 
                    ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                />
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              </div>
              
              <!-- Status Filters -->
              <div class="flex items-center gap-2 flex-wrap">
                <button
                  v-for="filter in filters"
                  :key="filter"
                  @click="activeFilter = filter"
                  class="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  :class="activeFilter === filter
                    ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white')
                    : (isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200')"
                >
                  {{ filter }}
                </button>
              </div>
            </div>

            <!-- Advanced Filters -->
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
              <!-- Date Range -->
              <div class="flex items-center gap-2">
                <label class="text-sm whitespace-nowrap" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">From:</label>
                <DatePicker
                  v-model="dateRange.from"
                  placeholder="Start date"
                  :max="dateRange.to || undefined"
                  :is-dark-mode="isDarkMode"
                />
              </div>
              <div class="flex items-center gap-2">
                <label class="text-sm whitespace-nowrap" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">To:</label>
                <DatePicker
                  v-model="dateRange.to"
                  placeholder="End date"
                  :min="dateRange.from || undefined"
                  :is-dark-mode="isDarkMode"
                />
              </div>

              <!-- Sort By -->
              <div class="flex items-center gap-2">
                <label class="text-sm whitespace-nowrap" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Sort:</label>
                <div class="flex items-center gap-2">
                  <Dropdown
                    v-model="sortBy"
                    :options="sortOptions"
                    :is-dark-mode="isDarkMode"
                  />
                  <button
                    @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
                    class="p-1.5 rounded-lg transition-colors"
                    :class="isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    :title="sortOrder === 'asc' ? 'Ascending' : 'Descending'"
                  >
                    <span class="material-symbols-outlined text-base">
                      {{ sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Bulk Operations -->
              <div v-if="selectedResults.length > 0" class="flex items-center gap-2">
                <span class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ selectedResults.length }} selected
                </span>
                <button
                  @click="bulkApprove"
                  :disabled="processing"
                  class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-base">check</span>
                  Approve All
                </button>
                <button
                  @click="bulkReject"
                  :disabled="processing"
                  class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-base">close</span>
                  Reject All
                </button>
                <button
                  @click="selectedResults = []"
                  class="px-3 py-1.5 rounded-lg text-sm transition-colors"
                  :class="isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <!-- Keyboard Shortcuts Hint -->
          <div v-if="filteredResults.length > 0" class="mb-4 text-xs flex items-center gap-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
            <span><kbd class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">J</kbd> / <kbd class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">K</kbd> Navigate</span>
            <span><kbd class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">A</kbd> Approve</span>
            <span><kbd class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">R</kbd> Reject</span>
            <span><kbd class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">/</kbd> Focus Search</span>
          </div>

          <!-- Results List -->
          <div v-if="filteredResults.length === 0" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">search_off</span>
            <p class="text-lg font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">No results found</p>
            <p class="text-sm mt-2" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Try adjusting your search or filters</p>
          </div>

          <div v-else class="space-y-6">
            <div
              v-for="(result, index) in filteredResults"
              :key="result.id"
              :ref="el => { if (el) resultRefs[index] = el }"
              class="rounded-lg border p-6 transition-all"
              :class="[
                isDarkMode 
                  ? 'bg-slate-800 border-gray-700' 
                  : 'bg-white border-gray-200',
                selectedIndex === index 
                  ? (isDarkMode ? 'ring-2 ring-indigo-400 border-indigo-400' : 'ring-2 ring-indigo-500 border-indigo-500')
                  : '',
                selectedResults.includes(result.id)
                  ? (isDarkMode ? 'ring-2 ring-green-400 border-green-400' : 'ring-2 ring-green-500 border-green-500')
                  : ''
              ]"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <!-- Selection Checkbox -->
                  <input
                    type="checkbox"
                    :checked="selectedResults.includes(result.id)"
                    @change="toggleResultSelection(result.id)"
                    class="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span 
                    class="px-3 py-1 text-sm rounded-full font-medium"
                    :class="getResultStatusClass(result.status)"
                  >
                    {{ result.status }}
                  </span>
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ result.testName }}</h3>
                  <span v-if="selectedIndex === index" class="text-xs px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                    Selected
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="result.status === 'failed' || result.status === 'new'"
                    @click="approveDiff(result.id)"
                    :disabled="result.approved || processing"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined text-base">check</span>
                    {{ result.approved ? 'Approved' : 'Approve' }}
                  </button>
                  <button
                    v-if="result.status === 'failed'"
                    @click="rejectDiff(result.id)"
                    :disabled="processing"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined text-base">close</span>
                    Reject
                  </button>
                </div>
              </div>


              <!-- Enhanced Image Comparison -->
              <EnhancedDiffViewer
                v-if="result.baselineImageUrl || result.currentImageUrl"
                :baseline-image="result.baselineImageUrl"
                :current-image="result.currentImageUrl"
                :diff-image="result.diffImageUrl"
                :alt-text="result.testName"
                :height="500"
              />

              <div v-if="result.diffPercentage !== undefined" class="mt-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Diff Percentage: <span class="font-semibold">{{ result.diffPercentage }}%</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import ImageComparisonSlider from '../components/ImageComparisonSlider.vue';
import EnhancedDiffViewer from '../components/EnhancedDiffViewer.vue';
import DatePicker from '../components/DatePicker.vue';
import Dropdown from '../components/Dropdown.vue';
import apiClient from '../services/api.js';

const route = useRoute();
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const isDarkMode = useDarkMode();
const { notice, showNotice, clearNotice } = useNotice();
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
const viewModes = ref({}); // Per-result view modes
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

const getStatusClass = (status) => {
  const classes = {
    pending: 'text-yellow-600',
    running: 'text-blue-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
  };
  return classes[status] || classes.pending;
};

const getResultStatusClass = (status) => {
  const classes = {
    passed: isDarkMode.value ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
    failed: isDarkMode.value ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
    new: isDarkMode.value ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700',
    removed: isDarkMode.value ? 'bg-gray-900/30 text-gray-400' : 'bg-gray-100 text-gray-700',
  };
  return classes[status] || classes.passed;
};

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
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (searchInput) searchInput.focus();
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
