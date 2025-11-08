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
        <div v-if="loading" class="max-w-7xl mx-auto py-12 text-center">
          <div class="flex justify-center mb-4">
            <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading project...</p>
        </div>

        <!-- Project Content -->
        <div v-else-if="project" class="max-w-7xl mx-auto">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h1 class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ project.name }}</h1>
                <p class="text-lg" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ project.description || 'No description' }}</p>
              </div>
              <button
                @click="triggerTest"
                :disabled="testRunning"
                class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span class="material-symbols-outlined">play_arrow</span>
                {{ testRunning ? 'Running...' : 'Run Tests' }}
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mb-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <div class="flex gap-2">
              <button
                @click="activeTab = 'overview'"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="activeTab === 'overview'
                  ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                  : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
              >
                Overview
                <div 
                  v-if="activeTab === 'overview'"
                  class="absolute bottom-0 left-0 right-0 h-0.5"
                  :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                ></div>
              </button>
              <button
                @click="activeTab = 'runs'"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="activeTab === 'runs'
                  ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                  : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
              >
                Test Runs
                <div 
                  v-if="activeTab === 'runs'"
                  class="absolute bottom-0 left-0 right-0 h-0.5"
                  :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                ></div>
              </button>
              <button
                @click="activeTab = 'settings'"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="activeTab === 'settings'
                  ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                  : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
              >
                Settings
                <div 
                  v-if="activeTab === 'settings'"
                  class="absolute bottom-0 left-0 right-0 h-0.5"
                  :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                ></div>
              </button>
            </div>
          </div>

          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Runs</div>
                <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ testRuns.length }}</div>
              </div>
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Last Run</div>
                <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ lastRun ? formatDate(lastRun.startedAt) : 'Never' }}
                </div>
              </div>
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Status</div>
                <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ lastRun?.status || 'No runs' }}
                </div>
              </div>
            </div>

            <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Project Configuration</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Argos Project ID</div>
                  <div class="text-sm font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ project.argosProjectId }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Branch</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ project.argosBranch }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Team</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ project.teamId }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Created</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ formatDate(project.createdAt) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Test Runs Tab -->
          <div v-if="activeTab === 'runs'">
            <div v-if="testRuns.length === 0" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">play_circle_outline</span>
              <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">No test runs yet</p>
              <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Run your first visual regression test to get started</p>
              <button
                @click="triggerTest"
                class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Run Tests
              </button>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="run in testRuns"
                :key="run.id"
                @click="navigateToResults(run.id)"
                class="rounded-lg border p-6 cursor-pointer transition-all hover:shadow-lg"
                :class="isDarkMode 
                  ? 'bg-slate-800 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
              >
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <div class="flex items-center gap-3 mb-2">
                      <span 
                        class="px-3 py-1 text-sm rounded-full font-medium"
                        :class="getStatusClass(run.status)"
                      >
                        {{ run.status }}
                      </span>
                      <span class="text-sm font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ run.commitSha ? run.commitSha.substring(0, 7) : 'N/A' }}
                      </span>
                    </div>
                    <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ formatDate(run.startedAt) }}
                    </div>
                  </div>
                  <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">chevron_right</span>
                </div>

                <div v-if="run.resultsSummary" class="grid grid-cols-4 gap-4 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <div>
                    <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Total</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ run.resultsSummary.total }}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium mb-1 text-green-600">Passed</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ run.resultsSummary.passed }}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium mb-1 text-red-600">Failed</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ run.resultsSummary.failed }}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium mb-1 text-orange-600">New</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ run.resultsSummary.new }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
            <h3 class="text-lg font-semibold mb-6" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Project Settings</h3>
            <form @submit.prevent="updateProject" class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Project Name</label>
                <input
                  v-model="projectForm.name"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Description</label>
                <textarea
                  v-model="projectForm.description"
                  rows="3"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Argos Branch</label>
                <input
                  v-model="projectForm.argosBranch"
                  type="text"
                  readonly
                  class="w-full px-4 py-2 border rounded-lg bg-gray-100 dark:bg-slate-600 cursor-not-allowed"
                  :class="isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'"
                />
                <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  Branch is set to <strong>develop</strong> by default for all projects
                </p>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <button
                  type="button"
                  @click="resetForm"
                  class="px-4 py-2 rounded-lg transition-colors"
                  :class="isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const drawerOpen = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const project = ref(null);
const loading = ref(false);
const activeTab = ref('overview');
const testRuns = ref([]);
const testRunning = ref(false);
const saving = ref(false);

const projectForm = ref({
  name: '',
  description: '',
  argosBranch: 'develop',
});

const API_BASE_URL = 'http://localhost:3000/api/v1';

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const loadProject = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/visual-regression/projects/${route.params.id}`);
    project.value = response.data;
    projectForm.value = {
      name: project.value.name,
      description: project.value.description || '',
      argosBranch: project.value.argosBranch || 'develop',
    };
    await loadTestRuns();
  } catch (error) {
    console.error('Failed to load project:', error);
  } finally {
    loading.value = false;
  }
};

const loadTestRuns = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/visual-regression/projects/${route.params.id}/runs`);
    testRuns.value = response.data;
  } catch (error) {
    console.error('Failed to load test runs:', error);
  }
};

const triggerTest = async () => {
  testRunning.value = true;
  try {
    const response = await axios.post(`${API_BASE_URL}/visual-regression/projects/${route.params.id}/runs`, {
      branch: project.value.argosBranch || 'develop',
    });
    window.showToast?.('Test run started successfully', 'success');
    // Poll for updates
    setTimeout(() => {
      loadTestRuns();
      testRunning.value = false;
    }, 2000);
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to trigger test';
    window.showToast?.(errorMsg, 'error');
    console.error('Failed to trigger test:', error);
    testRunning.value = false;
  }
};

const updateProject = async () => {
  saving.value = true;
  try {
    await axios.put(`${API_BASE_URL}/visual-regression/projects/${route.params.id}`, projectForm.value);
    window.showToast?.('Project updated successfully', 'success');
    await loadProject();
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to update project';
    window.showToast?.(errorMsg, 'error');
    console.error('Failed to update project:', error);
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  if (project.value) {
    projectForm.value = {
      name: project.value.name,
      description: project.value.description || '',
      argosBranch: project.value.argosBranch || 'develop',
    };
  }
};

const navigateToResults = (runId) => {
  router.push(`/tools/visual-regression/${route.params.id}/runs/${runId}`);
};

const getStatusClass = (status) => {
  const classes = {
    pending: isDarkMode.value ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700',
    running: isDarkMode.value ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700',
    completed: isDarkMode.value ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700',
    failed: isDarkMode.value ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700',
  };
  return classes[status] || classes.pending;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const lastRun = computed(() => {
  return testRuns.value.length > 0 ? testRuns.value[0] : null;
});

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  loadProject();

  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

