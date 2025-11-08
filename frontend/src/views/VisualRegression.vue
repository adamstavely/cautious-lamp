<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-y-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Visual Regression Testing
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-6">
                  Catch visual bugs before they reach production. Automated visual testing powered by Argos for your applications.
                </p>
                <button
                  @click="openCreateProjectModal"
                  class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <span class="material-symbols-outlined">add</span>
                  Create New Project
                </button>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="visualRegressionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Visual diff representation -->
                    <rect x="20" y="20" width="70" height="70" rx="4" fill="url(#visualRegressionGradient)" opacity="0.4"/>
                    <rect x="110" y="20" width="70" height="70" rx="4" fill="url(#visualRegressionGradient)" opacity="0.6"/>
                    <rect x="65" y="110" width="70" height="70" rx="4" fill="url(#visualRegressionGradient)" opacity="0.5"/>
                    <path d="M 90 20 L 90 90 M 20 55 L 90 55" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round"/>
                    <path d="M 180 20 L 180 90 M 110 55 L 180 55" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round"/>
                    <path d="M 135 110 L 135 180 M 65 145 L 135 145" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="55" cy="55" r="8" fill="rgba(255,255,255,0.8)"/>
                    <circle cx="145" cy="55" r="8" fill="rgba(255,255,255,0.8)"/>
                    <circle cx="100" cy="145" r="8" fill="rgba(255,255,255,0.8)"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <div class="flex items-center gap-3 mb-2">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">folder</span>
                <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Projects</div>
              </div>
              <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ projects.length }}</div>
            </div>
            <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <div class="flex items-center gap-3 mb-2">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">check_circle</span>
                <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Pass Rate</div>
              </div>
              <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ overallPassRate }}%</div>
            </div>
            <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <div class="flex items-center gap-3 mb-2">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">play_arrow</span>
                <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Runs</div>
              </div>
              <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ totalRuns }}</div>
            </div>
            <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <div class="flex items-center gap-3 mb-2">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-orange-400' : 'text-orange-600'">warning</span>
                <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Pending Diffs</div>
              </div>
              <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ pendingDiffs }}</div>
            </div>
          </div>
        </div>

        <!-- Projects List -->
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-4xl md:text-5xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Projects
            </h2>
            <button 
              @click="openCreateProjectModal"
              class="px-6 py-2 rounded-full border transition-colors text-sm font-medium flex items-center gap-2"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'"
            >
              <span class="material-symbols-outlined text-base">add</span>
              New Project
            </button>
          </div>

          <div v-if="loading" class="text-center py-12">
            <div class="flex justify-center mb-4">
              <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading projects...</p>
          </div>

          <div v-else-if="projects.length === 0" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">folder_off</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">No projects yet</p>
            <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Create your first visual regression testing project to get started</p>
            <button
              @click="openCreateProjectModal"
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Project
            </button>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="project in projects"
              :key="project.id"
              @click="navigateToProject(project.id)"
              class="rounded-lg border p-6 cursor-pointer transition-all hover:shadow-lg"
              :class="isDarkMode 
                ? 'bg-slate-800 border-gray-700 hover:border-indigo-400' 
                : 'bg-white border-gray-200 hover:border-indigo-500'"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ project.name }}</h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ project.description || 'No description' }}</p>
                </div>
                <span class="material-symbols-outlined text-xl" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">chevron_right</span>
              </div>
              
              <div class="flex items-center gap-4 text-sm mb-4">
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">code</span>
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ project.argosBranch }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">group</span>
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ project.teamId }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <div class="flex items-center gap-2">
                  <span 
                    class="px-2 py-1 text-xs rounded-full font-medium"
                    :class="getProjectStatusClass(project)"
                  >
                    {{ getProjectStatus(project) }}
                  </span>
                </div>
                <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  {{ formatDate(project.updatedAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeCreateProjectModal"
    >
      <div 
        class="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
        @click.stop
      >
        <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Create New Project</h2>
          <button
            @click="closeCreateProjectModal"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <form @submit.prevent="createProject" class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Project Name *</label>
            <input
              v-model="newProject.name"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="My Application"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Description</label>
            <textarea
              v-model="newProject.description"
              rows="3"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="Visual regression testing for our main application"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Team ID</label>
            <input
              v-model="newProject.teamId"
              type="text"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="default-team"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Argos Base URL *</label>
            <input
              v-model="newProject.argosBaseUrl"
              type="url"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="https://argos.example.com"
            />
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Your self-hosted Argos instance URL (e.g., https://argos.example.com)</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Argos Project ID *</label>
            <input
              v-model="newProject.argosProjectId"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="your-org/your-project"
            />
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Your Argos project identifier</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Argos API Token *</label>
            <input
              v-model="newProject.argosToken"
              type="password"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="Enter your Argos API token"
            />
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Your Argos API token (stored securely)</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Branch</label>
            <input
              v-model="newProject.argosBranch"
              type="text"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="main"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              type="button"
              @click="closeCreateProjectModal"
              class="px-4 py-2 rounded-lg transition-colors"
              :class="isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ creating ? 'Creating...' : 'Create Project' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import axios from 'axios';

const router = useRouter();
const drawerOpen = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const projects = ref([]);
const loading = ref(false);
const showCreateModal = ref(false);
const creating = ref(false);

const newProject = ref({
  name: '',
  description: '',
  teamId: 'default-team',
  argosBaseUrl: '',
  argosProjectId: '',
  argosToken: '',
  argosBranch: 'main',
});

const API_BASE_URL = 'http://localhost:3000/api/v1';

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const loadProjects = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/visual-regression/projects`);
    projects.value = response.data;
  } catch (error) {
    console.error('Failed to load projects:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateProjectModal = () => {
  showCreateModal.value = true;
};

const closeCreateProjectModal = () => {
  showCreateModal.value = false;
  newProject.value = {
    name: '',
    description: '',
    teamId: 'default-team',
    argosBaseUrl: '',
    argosProjectId: '',
    argosToken: '',
    argosBranch: 'main',
  };
};

const createProject = async () => {
  creating.value = true;
  try {
    await axios.post(`${API_BASE_URL}/visual-regression/projects`, newProject.value);
    window.showToast?.('Project created successfully', 'success');
    await loadProjects();
    closeCreateProjectModal();
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create project. Please check your Argos connection settings.';
    window.showToast?.(errorMsg, 'error');
    console.error('Failed to create project:', error);
  } finally {
    creating.value = false;
  }
};

const navigateToProject = (projectId) => {
  router.push(`/tools/visual-regression/${projectId}`);
};

const getProjectStatus = (project) => {
  // In a real implementation, this would check the last test run status
  return 'Active';
};

const getProjectStatusClass = (project) => {
  return isDarkMode.value
    ? 'bg-green-900/30 text-green-400'
    : 'bg-green-100 text-green-700';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const overallPassRate = computed(() => {
  // Calculate from all test runs
  return 85; // Placeholder
});

const totalRuns = computed(() => {
  // Sum all runs across projects
  return 0; // Placeholder
});

const pendingDiffs = computed(() => {
  // Count unapproved diffs
  return 0; // Placeholder
});

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  loadProjects();

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

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

