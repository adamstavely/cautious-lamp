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
                  Session Replay
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mb-6">
                  See exactly what users experience. Debug issues with full context using OpenReplay session replay for your applications.
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
                      <linearGradient id="sessionReplayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Browser window representation -->
                    <rect x="30" y="30" width="140" height="140" rx="4" fill="url(#sessionReplayGradient)" opacity="0.3"/>
                    <rect x="30" y="30" width="140" height="20" rx="4" fill="url(#sessionReplayGradient)" opacity="0.5"/>
                    <circle cx="45" cy="40" r="4" fill="rgba(255,255,255,0.6)"/>
                    <circle cx="60" cy="40" r="4" fill="rgba(255,255,255,0.6)"/>
                    <circle cx="75" cy="40" r="4" fill="rgba(255,255,255,0.6)"/>
                    <!-- Play button -->
                    <circle cx="100" cy="100" r="25" fill="rgba(255,255,255,0.8)"/>
                    <path d="M 92 90 L 92 110 L 110 100 Z" fill="url(#sessionReplayGradient)"/>
                    <!-- Timeline -->
                    <rect x="40" y="160" width="120" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
                    <circle cx="100" cy="162" r="6" fill="rgba(255,255,255,0.8)"/>
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
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">videocam</span>
                <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Sessions</div>
              </div>
              <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ totalSessions }}</div>
            </div>
            <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <div class="flex items-center gap-3 mb-2">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">error</span>
                <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Sessions with Errors</div>
              </div>
              <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ sessionsWithErrors }}</div>
            </div>
            <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <div class="flex items-center gap-3 mb-2">
                <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">live_tv</span>
                <div class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Live Sessions</div>
              </div>
              <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ liveSessions }}</div>
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
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined">add</span>
              New Project
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <div class="flex justify-center mb-4">
              <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading projects...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="projects.length === 0" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
            <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">videocam_off</span>
            <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">No projects yet</p>
            <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Create your first session replay project to get started</p>
            <button
              @click="openCreateProjectModal"
              class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Project
            </button>
          </div>

          <!-- Projects Grid -->
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
                  <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ project.name }}</h3>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ project.description || 'No description' }}</p>
                </div>
                <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">chevron_right</span>
              </div>
              <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                <span v-if="project.applicationUrl" class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-base">link</span>
                  {{ getHostname(project.applicationUrl) }}
                </span>
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-base">group</span>
                  {{ project.teamId }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      @click="closeCreateProjectModal"
    >
      <div
        class="rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
        @click.stop
      >
        <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Create New Project</h2>
          <button
            @click="closeCreateProjectModal"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
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
              placeholder="Session replay for our main application"
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
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Application URL</label>
            <input
              v-model="newProject.applicationUrl"
              type="url"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="https://myapp.example.com"
            />
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">The URL of the application you want to record</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">OpenReplay Base URL *</label>
            <input
              v-model="newProject.openreplayBaseUrl"
              type="url"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="https://openreplay.example.com"
            />
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Your self-hosted OpenReplay instance URL (e.g., https://openreplay.example.com)</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">OpenReplay Project Key *</label>
            <input
              v-model="newProject.openreplayProjectKey"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="your-project-key"
            />
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Your OpenReplay project key</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">OpenReplay API Key (Optional)</label>
            <input
              v-model="newProject.openreplayApiKey"
              type="password"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
              placeholder="Enter your OpenReplay API key"
            />
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Required for searching sessions via API (stored securely)</p>
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
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
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
  applicationUrl: '',
  openreplayBaseUrl: '',
  openreplayProjectKey: '',
  openreplayApiKey: '',
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
    const response = await axios.get(`${API_BASE_URL}/session-replay/projects`);
    projects.value = response.data;
  } catch (error) {
    console.error('Failed to load projects:', error);
    window.showToast?.('Failed to load projects', 'error');
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
    applicationUrl: '',
    openreplayBaseUrl: '',
    openreplayProjectKey: '',
    openreplayApiKey: '',
  };
};

const createProject = async () => {
  creating.value = true;
  try {
    await axios.post(`${API_BASE_URL}/session-replay/projects`, newProject.value);
    window.showToast?.('Project created successfully', 'success');
    await loadProjects();
    closeCreateProjectModal();
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Failed to create project. Please check your OpenReplay connection settings.';
    window.showToast?.(errorMsg, 'error');
    console.error('Failed to create project:', error);
  } finally {
    creating.value = false;
  }
};

const getHostname = (url) => {
  if (!url) return '';
  try {
    return new URL(url).hostname;
  } catch (e) {
    // If URL parsing fails, try to extract hostname manually
    try {
      const match = url.match(/^https?:\/\/([^\/]+)/);
      return match ? match[1] : url;
    } catch {
      return url;
    }
  }
};

const navigateToProject = (projectId) => {
  router.push(`/hcd/session-replay/${projectId}`);
};

const totalSessions = computed(() => {
  // Placeholder - would sum sessions from all projects
  return 0;
});

const sessionsWithErrors = computed(() => {
  // Placeholder - would count sessions with errors
  return 0;
});

const liveSessions = computed(() => {
  // Placeholder - would count live sessions
  return 0;
});

let darkModeObserver = null;

onMounted(() => {
  loadProjects();

  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

