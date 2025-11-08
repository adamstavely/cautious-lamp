<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-y-auto">
        <Breadcrumbs />

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

          <!-- Search and Filters -->
          <div class="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
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
            
            <!-- Filters -->
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
                  : ''
              ]"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
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

              <!-- View Mode Toggle -->
              <div class="mb-4 flex items-center gap-2">
                <button
                  @click="viewModes[result.id] = 'slider'"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  :class="(viewModes[result.id] || 'slider') === 'slider'
                    ? 'bg-indigo-600 text-white'
                    : (isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  <span class="material-symbols-outlined text-base align-middle">compare</span>
                  Slider
                </button>
                <button
                  @click="viewModes[result.id] = 'grid'"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  :class="(viewModes[result.id] || 'slider') === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : (isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')"
                >
                  <span class="material-symbols-outlined text-base align-middle">grid_view</span>
                  Grid
                </button>
              </div>

              <!-- Image Comparison -->
              <div v-if="(viewModes[result.id] || 'slider') === 'slider' && result.baselineImageUrl && result.currentImageUrl">
                <ImageComparisonSlider
                  :baseline-image="result.baselineImageUrl"
                  :current-image="result.currentImageUrl"
                  :diff-image="result.diffImageUrl"
                  :alt-text="result.testName"
                  :height="400"
                />
              </div>
              
              <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-if="result.baselineImageUrl" class="space-y-2">
                  <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Baseline</div>
                  <div class="rounded-lg border overflow-hidden" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <img :src="result.baselineImageUrl" :alt="`Baseline for ${result.testName}`" class="w-full h-auto" />
                  </div>
                </div>
                <div v-if="result.diffImageUrl" class="space-y-2">
                  <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Diff</div>
                  <div class="rounded-lg border overflow-hidden" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <img :src="result.diffImageUrl" :alt="`Diff for ${result.testName}`" class="w-full h-auto" />
                  </div>
                </div>
                <div v-if="result.currentImageUrl" class="space-y-2">
                  <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Current</div>
                  <div class="rounded-lg border overflow-hidden" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <img :src="result.currentImageUrl" :alt="`Current for ${result.testName}`" class="w-full h-auto" />
                  </div>
                </div>
              </div>

              <div v-if="result.diffPercentage !== undefined" class="mt-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Diff Percentage: <span class="font-semibold">{{ result.diffPercentage }}%</span>
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
import Breadcrumbs from '../components/Breadcrumbs.vue';
import ImageComparisonSlider from '../components/ImageComparisonSlider.vue';
import axios from 'axios';

const route = useRoute();
const drawerOpen = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
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
let refreshInterval = null;
let previousStatus = null;

const filters = ['All', 'Passed', 'Failed', 'New', 'Removed'];

const API_BASE_URL = 'http://localhost:3000/api/v1';

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const loadResults = async () => {
  loading.value = true;
  error.value = null;
  try {
    const [runResponse, resultsResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/visual-regression/runs/${route.params.runId}`),
      axios.get(`${API_BASE_URL}/visual-regression/runs/${route.params.runId}/results`),
    ]);
    testRun.value = runResponse.data;
    results.value = resultsResponse.data;
    
    // Check if status changed and show notification
    if (previousStatus && previousStatus !== testRun.value.status) {
      if (testRun.value.status === 'completed') {
        window.showToast?.('Test run completed!', 'success');
      } else if (testRun.value.status === 'failed') {
        window.showToast?.('Test run failed', 'error');
      }
    }
    previousStatus = testRun.value.status;
    
    // Stop auto-refresh if completed
    if (testRun.value.status === 'completed' || testRun.value.status === 'failed') {
      autoRefresh.value = false;
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Failed to load results';
    console.error('Failed to load results:', err);
    window.showToast?.(error.value, 'error');
  } finally {
    loading.value = false;
  }
};

const approveDiff = async (resultId) => {
  if (processing.value) return;
  processing.value = true;
  try {
    await axios.post(`${API_BASE_URL}/visual-regression/results/${resultId}/approve`);
    window.showToast?.('Diff approved successfully', 'success');
    await loadResults();
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to approve diff';
    window.showToast?.(errorMsg, 'error');
    console.error('Failed to approve diff:', err);
  } finally {
    processing.value = false;
  }
};

const rejectDiff = async (resultId) => {
  if (processing.value) return;
  processing.value = true;
  try {
    await axios.post(`${API_BASE_URL}/visual-regression/results/${resultId}/reject`);
    window.showToast?.('Diff rejected', 'info');
    await loadResults();
  } catch (err) {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to reject diff';
    window.showToast?.(errorMsg, 'error');
    console.error('Failed to reject diff:', err);
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
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(r => r.testName.toLowerCase().includes(query));
  }
  
  return filtered;
});

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
  return date.toLocaleString();
};

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  if (autoRefresh.value) {
    refreshInterval = setInterval(() => {
      if (testRun.value && (testRun.value.status === 'running' || testRun.value.status === 'pending')) {
        loadResults();
      }
    }, 5000);
    window.showToast?.('Auto-refresh enabled', 'info');
  } else {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
    window.showToast?.('Auto-refresh disabled', 'info');
  }
};

const exportResults = () => {
  try {
    const data = {
      testRun: {
        id: testRun.value.id,
        status: testRun.value.status,
        branch: testRun.value.branch,
        commitSha: testRun.value.commitSha,
        startedAt: testRun.value.startedAt,
        completedAt: testRun.value.completedAt,
      },
      results: filteredResults.value.map(r => ({
        testName: r.testName,
        status: r.status,
        diffPercentage: r.diffPercentage,
        approved: r.approved,
      })),
      summary: testRun.value.resultsSummary,
    };
    
    // Create CSV
    const csvRows = [
      ['Test Name', 'Status', 'Diff %', 'Approved'].join(','),
      ...filteredResults.value.map(r => [
        `"${r.testName}"`,
        r.status,
        r.diffPercentage || 0,
        r.approved ? 'Yes' : 'No',
      ].join(','))
    ];
    
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visual-regression-results-${testRun.value.id}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    window.showToast?.('Results exported successfully', 'success');
  } catch (err) {
    window.showToast?.('Failed to export results', 'error');
    console.error('Export failed:', err);
  }
};

// Keyboard shortcuts
const handleKeydown = (e) => {
  // Don't handle shortcuts when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    if (e.key === '/') {
      e.preventDefault();
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (searchInput) searchInput.focus();
    }
    return;
  }
  
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
    case '/':
      e.preventDefault();
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (searchInput) searchInput.focus();
      break;
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

// Watch for filter/search changes to reset selection
watch([activeFilter, searchQuery], () => {
  selectedIndex.value = -1;
});

let darkModeObserver = null;

onMounted(() => {
  loadResults();
  document.addEventListener('keydown', handleKeydown);

  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
