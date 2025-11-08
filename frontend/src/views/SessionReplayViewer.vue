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
          <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading session...</p>
        </div>

        <!-- Session Content -->
        <div v-else-if="session" class="max-w-7xl mx-auto">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h1 class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Session Replay</h1>
                <div class="flex items-center gap-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span>Session ID: <span class="font-mono">{{ session.sessionId }}</span></span>
                  <span v-if="session.userEmail">User: {{ session.userEmail }}</span>
                  <span>{{ formatDate(session.startTime) }}</span>
                  <span v-if="session.live" class="px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium">
                    Live
                  </span>
                </div>
              </div>
              <a
                :href="session.replayUrl"
                target="_blank"
                class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <span class="material-symbols-outlined">open_in_new</span>
                Open in OpenReplay
              </a>
            </div>

            <!-- Summary -->
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Duration</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ formatDuration(session.duration) }}</div>
              </div>
              <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Pages</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ session.pagesCount }}</div>
              </div>
              <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Events</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ session.eventsCount }}</div>
              </div>
              <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-1 text-red-600">Errors</div>
                <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ session.errorsCount }}</div>
              </div>
              <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Issue Score</div>
                <div class="text-2xl font-bold" :class="session.issueScore > 50 ? 'text-red-600' : (isDarkMode ? 'text-white' : 'text-gray-900')">
                  {{ session.issueScore }}
                </div>
              </div>
            </div>
          </div>

          <!-- Session Replay Embed -->
          <div class="rounded-lg border overflow-hidden" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
            <div class="p-4 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h2 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Session Replay</h2>
              <a
                :href="session.replayUrl"
                target="_blank"
                class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
              >
                Open Full Screen
                <span class="material-symbols-outlined text-base">open_in_new</span>
              </a>
            </div>
            <div class="p-4">
              <iframe
                :src="session.replayUrl"
                class="w-full h-[600px] border rounded-lg"
                :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                frameborder="0"
                allow="fullscreen"
              ></iframe>
              <p class="text-xs mt-2 text-center" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                If the replay doesn't load, click "Open in OpenReplay" to view in a new window
              </p>
            </div>
          </div>

          <!-- Issue Types -->
          <div v-if="session.issueTypes && session.issueTypes.length > 0" class="mt-6 rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
            <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Issue Types</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="issueType in session.issueTypes"
                :key="issueType"
                class="px-3 py-1 text-sm rounded-full font-medium"
                :class="isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'"
              >
                {{ issueType }}
              </span>
            </div>
          </div>

          <!-- Metadata -->
          <div v-if="session.metadata && Object.keys(session.metadata).length > 0" class="mt-6 rounded-lg border p-6" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
            <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Session Metadata</h3>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="(value, key) in session.metadata" :key="key">
                <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">{{ key }}</div>
                <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import axios from 'axios';

const route = useRoute();
const drawerOpen = ref(false);
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const session = ref(null);
const loading = ref(false);

const API_BASE_URL = 'http://localhost:3000/api/v1';

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const loadSession = async () => {
  loading.value = true;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/session-replay/projects/${route.params.id}/sessions/${route.params.sessionId}`
    );
    session.value = response.data;
  } catch (error) {
    console.error('Failed to load session:', error);
    window.showToast?.('Failed to load session', 'error');
  } finally {
    loading.value = false;
  }
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

let darkModeObserver = null;

onMounted(() => {
  loadSession();

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

