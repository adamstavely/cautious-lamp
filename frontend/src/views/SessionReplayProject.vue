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
                @click="navigateToSessionsTab"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="activeTab === 'sessions'
                  ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                  : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
              >
                Sessions
                <div 
                  v-if="activeTab === 'sessions'"
                  class="absolute bottom-0 left-0 right-0 h-0.5"
                  :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
                ></div>
              </button>
              <button
                @click="activeTab = 'heatmaps'"
                class="px-6 py-3 font-medium transition-colors relative"
                :class="activeTab === 'heatmaps'
                  ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                  : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
              >
                Heatmaps
                <div 
                  v-if="activeTab === 'heatmaps'"
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
                <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Sessions</div>
                <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ sessions.length }}</div>
              </div>
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Sessions with Errors</div>
                <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ sessionsWithErrors }}</div>
              </div>
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Live Sessions</div>
                <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ liveSessions }}</div>
              </div>
            </div>

            <!-- Integration Code -->
            <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Integration Code</h3>
                <button
                  @click="copyIntegrationCode"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-base">content_copy</span>
                  Copy Code
                </button>
              </div>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Add this code to your application's HTML to start recording sessions.
              </p>
              <div class="relative">
                <pre class="p-4 rounded-lg overflow-x-auto text-xs font-mono" :class="isDarkMode ? 'bg-slate-900 text-gray-300 border border-gray-700' : 'bg-gray-50 text-gray-900 border border-gray-200'"><code>{{ integrationCode }}</code></pre>
              </div>
            </div>

            <!-- Project Configuration -->
            <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Project Configuration</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">OpenReplay Project Key</div>
                  <div class="text-sm font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ project.openreplayProjectKey }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">OpenReplay Base URL</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ project.openreplayBaseUrl }}</div>
                </div>
                <div v-if="project.applicationUrl">
                  <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Application URL</div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ project.applicationUrl }}</div>
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

          <!-- Sessions Tab -->
          <div v-if="activeTab === 'sessions'">
            <div class="mb-6 flex items-center gap-4">
              <div class="flex-1 relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search sessions..."
                  class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode 
                    ? 'bg-slate-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                />
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              </div>
              <button
                @click="loadSessions"
                class="px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                :class="isDarkMode 
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'"
              >
                <span class="material-symbols-outlined text-base">refresh</span>
                Refresh
              </button>
            </div>

            <div v-if="sessionsLoading" class="text-center py-12">
              <div class="flex justify-center mb-4">
                <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading sessions...</p>
            </div>

            <div v-else-if="filteredSessions.length === 0" class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">videocam_off</span>
              <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">No sessions found</p>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Sessions will appear here once your application starts recording</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="session in filteredSessions"
                :key="session.sessionId"
                @click="navigateToSession(session.sessionId)"
                class="rounded-lg border p-6 cursor-pointer transition-all hover:shadow-lg"
                :class="isDarkMode 
                  ? 'bg-slate-800 border-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-gray-200 hover:border-indigo-500'"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <span 
                      class="px-3 py-1 text-sm rounded-full font-medium"
                      :class="session.errorsCount > 0 
                        ? (isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
                        : (isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700')"
                    >
                      {{ session.errorsCount > 0 ? `${session.errorsCount} Errors` : 'No Errors' }}
                    </span>
                    <span v-if="session.live" class="px-3 py-1 text-sm rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Live
                    </span>
                    <span class="text-sm font-mono" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ session.sessionId.substring(0, 8) }}
                    </span>
                  </div>
                  <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">chevron_right</span>
                </div>
                <div class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ formatDate(session.startTime) }}
                </div>
                <div class="grid grid-cols-4 gap-4 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <div>
                    <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Duration</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ formatDuration(session.duration) }}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Pages</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ session.pagesCount }}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Events</div>
                    <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ session.eventsCount }}</div>
                  </div>
                  <div>
                    <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Issue Score</div>
                    <div class="text-lg font-semibold" :class="session.issueScore > 50 ? 'text-red-600' : (isDarkMode ? 'text-white' : 'text-gray-900')">
                      {{ session.issueScore }}
                    </div>
                  </div>
                </div>
                <div v-if="session.userEmail" class="mt-2 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  User: {{ session.userEmail }}
                </div>
              </div>
            </div>
          </div>

          <!-- Heatmaps Tab -->
          <div v-if="activeTab === 'heatmaps'">
            <div v-if="heatmapsUrlLoading" class="text-center py-12">
              <div class="flex justify-center mb-4">
                <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading heatmaps...</p>
            </div>

            <div v-else-if="heatmapsUrl" class="space-y-6">
              <!-- Info Card -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex items-start gap-4">
                  <span class="material-symbols-outlined text-3xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">insights</span>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Heatmaps</h3>
                    <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Visualize user interactions across your application. Heatmaps show where users click, scroll, and move their mouse, helping you identify engagement hotspots and areas that need optimization.
                    </p>
                    <div class="flex items-center gap-3">
                      <a
                        :href="heatmapsUrl"
                        target="_blank"
                        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <span class="material-symbols-outlined text-base">open_in_new</span>
                        Open in OpenReplay
                      </a>
                      <button
                        @click="copyHeatmapsUrl"
                        class="px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        :class="isDarkMode 
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      >
                        <span class="material-symbols-outlined text-base">content_copy</span>
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Embedded Heatmap Viewer -->
              <div class="rounded-lg border overflow-hidden" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="p-4 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Heatmap Viewer</h3>
                  <a
                    :href="heatmapsUrl"
                    target="_blank"
                    class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                  >
                    Open Full Screen
                    <span class="material-symbols-outlined text-base">open_in_new</span>
                  </a>
                </div>
                <div class="p-4">
                  <iframe
                    :src="heatmapsUrl"
                    class="w-full h-[800px] border rounded-lg"
                    :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                    frameborder="0"
                    allow="fullscreen"
                    title="OpenReplay Heatmaps"
                  ></iframe>
                  <p class="text-xs mt-2 text-center" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    If the heatmap viewer doesn't load, click "Open in OpenReplay" to view in a new window. Make sure you're authenticated in OpenReplay.
                  </p>
                </div>
              </div>

              <!-- Help Section -->
              <div class="rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">How to Use Heatmaps</h3>
                <div class="space-y-4">
                  <div>
                    <h4 class="font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">1. Create a Heatmap</h4>
                    <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Click "Open in OpenReplay" to access the full heatmap interface. Create a new heatmap by specifying the URL pattern you want to analyze.
                    </p>
                  </div>
                  <div>
                    <h4 class="font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">2. Configure Filters</h4>
                    <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      Apply filters to segment your data by user attributes, session characteristics, or specific issues like click rage.
                    </p>
                  </div>
                  <div>
                    <h4 class="font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">3. Analyze Results</h4>
                    <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      View click, scroll, and mouse movement heatmaps to identify engagement hotspots and areas that need optimization.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
              <span class="material-symbols-outlined text-6xl mb-4 block" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">insights</span>
              <p class="text-lg font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Unable to load heatmaps</p>
              <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                Make sure your OpenReplay instance is configured correctly and accessible.
              </p>
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
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Application URL</label>
                <input
                  v-model="projectForm.applicationUrl"
                  type="url"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :class="isDarkMode ? 'bg-slate-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'"
                />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
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
const sessions = ref([]);
const sessionsLoading = ref(false);
const searchQuery = ref('');
const saving = ref(false);
const integrationCode = ref('');
const heatmapsUrl = ref('');
const heatmapsUrlLoading = ref(false);

const projectForm = ref({
  name: '',
  description: '',
  applicationUrl: '',
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
    const response = await axios.get(`${API_BASE_URL}/session-replay/projects/${route.params.id}`);
    project.value = response.data;
    projectForm.value = {
      name: project.value.name,
      description: project.value.description || '',
      applicationUrl: project.value.applicationUrl || '',
    };
    await loadIntegrationCode();
    if (activeTab.value === 'sessions') {
      await loadSessions();
    }
  } catch (error) {
    console.error('Failed to load project:', error);
    window.showToast?.('Failed to load project', 'error');
  } finally {
    loading.value = false;
  }
};

const loadIntegrationCode = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/session-replay/projects/${route.params.id}/integration-code`);
    integrationCode.value = response.data.code;
  } catch (error) {
    console.error('Failed to load integration code:', error);
    window.showToast?.('Failed to load integration code', 'error');
  }
};

const copyIntegrationCode = async () => {
  try {
    await navigator.clipboard.writeText(integrationCode.value);
    window.showToast?.('Integration code copied to clipboard', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    window.showToast?.('Failed to copy code', 'error');
  }
};

const loadSessions = async () => {
  sessionsLoading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/session-replay/projects/${route.params.id}/sessions`);
    sessions.value = response.data.sessions || [];
  } catch (error) {
    console.error('Failed to load sessions:', error);
    window.showToast?.('Failed to load sessions. Make sure API key is configured.', 'error');
    sessions.value = [];
  } finally {
    sessionsLoading.value = false;
  }
};

const updateProject = async () => {
  saving.value = true;
  try {
    await axios.put(`${API_BASE_URL}/session-replay/projects/${route.params.id}`, projectForm.value);
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
      applicationUrl: project.value.applicationUrl || '',
    };
  }
};

const navigateToSessionsTab = () => {
  router.push(`/hcd/session-replay/${route.params.id}/sessions`);
};

const navigateToSession = (sessionId) => {
  router.push(`/hcd/session-replay/${route.params.id}/sessions/${sessionId}`);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
};

const filteredSessions = computed(() => {
  if (!searchQuery.value.trim()) {
    return sessions.value;
  }
  const query = searchQuery.value.toLowerCase();
  return sessions.value.filter(s => 
    s.sessionId.toLowerCase().includes(query) ||
    (s.userEmail && s.userEmail.toLowerCase().includes(query)) ||
    (s.userDisplayName && s.userDisplayName.toLowerCase().includes(query))
  );
});

const sessionsWithErrors = computed(() => {
  return sessions.value.filter(s => s.errorsCount > 0).length;
});

const liveSessions = computed(() => {
  return sessions.value.filter(s => s.live).length;
});

const loadHeatmapsUrl = async () => {
  heatmapsUrlLoading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/session-replay/projects/${route.params.id}/heatmaps-url`);
    heatmapsUrl.value = response.data.url;
  } catch (error) {
    console.error('Failed to load heatmaps URL:', error);
    window.showToast?.('Failed to load heatmaps URL', 'error');
    heatmapsUrl.value = '';
  } finally {
    heatmapsUrlLoading.value = false;
  }
};

const copyHeatmapsUrl = async () => {
  try {
    await navigator.clipboard.writeText(heatmapsUrl.value);
    window.showToast?.('Heatmaps URL copied to clipboard', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    window.showToast?.('Failed to copy URL', 'error');
  }
};

watch(activeTab, (newTab) => {
  if (newTab === 'sessions' && sessions.value.length === 0) {
    loadSessions();
  }
  if (newTab === 'heatmaps' && !heatmapsUrl.value) {
    loadHeatmapsUrl();
  }
});

let darkModeObserver = null;

onMounted(() => {
  loadProject();
  
  // Set active tab based on route
  if (route.path.includes('/sessions') && !route.params.sessionId) {
    activeTab.value = 'sessions';
  } else if (route.path.includes('/heatmaps')) {
    activeTab.value = 'heatmaps';
  } else if (route.path.includes('/settings')) {
    activeTab.value = 'settings';
  }

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

