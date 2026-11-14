<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <!-- Background texture/grain effect -->
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Design Token Sync
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Sync design tokens from Figma, Penpot, and Adobe XD directly into your design system. Keep your tokens in sync automatically with conflict resolution and validation.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="syncGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Sync icon with arrows -->
                    <circle cx="100" cy="100" r="60" fill="none" stroke="url(#syncGradient)" stroke-width="3" opacity="0.3"/>
                    <path d="M 70 100 L 100 70 L 130 100" fill="none" stroke="url(#syncGradient)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M 130 100 L 100 130 L 70 100" fill="none" stroke="url(#syncGradient)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="100" cy="100" r="8" fill="url(#syncGradient)"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- What works today -->
        <div class="max-w-7xl mx-auto mb-8">
          <div
            class="rounded-2xl p-4 border flex items-start gap-3"
            role="status"
            :class="isDarkMode ? 'border-amber-700 bg-amber-900/20 text-amber-200' : 'border-amber-300 bg-amber-50 text-amber-900'"
          >
            <span class="material-symbols-outlined">info</span>
            <p class="text-sm">
              Token sync is not available yet: this server has no Figma, Penpot or Adobe XD integration to read tokens from.
              You can save connections (their access tokens are stored encrypted and never shown again), but Sync is turned off until an integration exists.
            </p>
          </div>
          <p v-if="loadError" class="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">{{ loadError }}</p>
        </div>

        <!-- Connections Section -->
        <div class="max-w-7xl mx-auto mb-16">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Connections
            </h2>
            <button 
              @click="showCreateModal = true"
              class="px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-lg">add</span>
              New Connection
            </button>
          </div>

          <!-- Connections Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="connections.length > 0">
            <div 
              v-for="connection in connections" 
              :key="connection.id"
              class="rounded-2xl p-6 border transition-all"
              :class="isDarkMode 
                ? 'border-gray-700 bg-slate-900 hover:border-indigo-400' 
                : 'border-gray-300 bg-white hover:border-indigo-500'"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center"
                    :class="isDarkMode ? 'bg-indigo-900/50' : 'bg-indigo-100'"
                  >
                    <span class="material-symbols-outlined text-2xl"
                      :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'"
                    >
                      {{ getToolIcon(connection.tool) }}
                    </span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ connection.name }}
                    </h3>
                    <p class="text-sm capitalize" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ connection.tool }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span 
                    class="w-3 h-3 rounded-full"
                    :class="connection.enabled ? 'bg-green-500' : 'bg-gray-400'"
                  ></span>
                </div>
              </div>

              <div class="space-y-2 mb-4">
                <div class="flex items-center justify-between text-sm">
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Status</span>
                  <span 
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="connection.enabled 
                      ? (isDarkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700')
                      : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600')"
                  >
                    {{ connection.enabled ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Auto Sync</span>
                  <span 
                    class="px-2 py-1 rounded text-xs font-medium"
                    :class="connection.autoSync 
                      ? (isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700')
                      : (isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600')"
                  >
                    {{ connection.autoSync ? 'On' : 'Off' }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-sm" v-if="connection.lastSync">
                  <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Last Sync</span>
                  <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ formatDate(connection.lastSync) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-4 border-t"
                :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
              >
                <button 
                  @click="syncConnection(connection.id)"
                  :disabled="!SYNC_AVAILABLE || syncingConnections.has(connection.id)"
                  title="Not available: no design tool integration on this server"
                  class="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="!SYNC_AVAILABLE || syncingConnections.has(connection.id)
                    ? (isDarkMode ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed')
                    : (isDarkMode ? 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800/50' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200')"
                >
                  {{ syncingConnections.has(connection.id) ? 'Syncing...' : 'Sync Now' }}
                </button>
                <button 
                  @click="editConnection(connection)"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="isDarkMode 
                    ? 'border border-gray-700 text-gray-300 hover:bg-gray-800' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'"
                >
                  Edit
                </button>
                <button 
                  @click="deleteConnection(connection.id)"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div 
            v-else
            class="rounded-2xl p-12 text-center border"
            :class="isDarkMode 
              ? 'border-gray-700 bg-slate-900' 
              : 'border-gray-300 bg-white'"
          >
            <span class="material-symbols-outlined text-6xl mb-4"
              :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'"
            >
              sync_disabled
            </span>
            <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              No connections yet
            </h3>
            <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Connect your design tools to start syncing tokens automatically.
            </p>
            <button 
              @click="showCreateModal = true"
              class="px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Create First Connection
            </button>
          </div>
        </div>

        <!-- Sync Results Section -->
        <div class="max-w-7xl mx-auto mb-16" v-if="lastSyncResult">
          <div class="rounded-2xl p-6 border"
            :class="isDarkMode 
              ? 'border-gray-700 bg-slate-900' 
              : 'border-gray-300 bg-white'"
          >
            <h3 class="text-2xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Last Sync Results
            </h3>
            <div class="grid md:grid-cols-4 gap-4 mb-6">
              <div class="p-4 rounded-lg"
                :class="isDarkMode ? 'bg-green-900/20' : 'bg-green-50'"
              >
                <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-green-400' : 'text-green-700'">
                  {{ lastSyncResult.tokensAdded }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-green-300' : 'text-green-600'">
                  Tokens Added
                </div>
              </div>
              <div class="p-4 rounded-lg"
                :class="isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'"
              >
                <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-blue-400' : 'text-blue-700'">
                  {{ lastSyncResult.tokensUpdated }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-blue-300' : 'text-blue-600'">
                  Tokens Updated
                </div>
              </div>
              <div class="p-4 rounded-lg"
                :class="isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'"
              >
                <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-700'">
                  {{ lastSyncResult.tokensSkipped }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-yellow-300' : 'text-yellow-600'">
                  Tokens Skipped
                </div>
              </div>
              <div class="p-4 rounded-lg"
                :class="isDarkMode ? 'bg-red-900/20' : 'bg-red-50'"
              >
                <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-red-400' : 'text-red-700'">
                  {{ lastSyncResult.conflicts.length }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-red-300' : 'text-red-600'">
                  Conflicts
                </div>
              </div>
            </div>

            <!-- Conflicts List -->
            <div v-if="lastSyncResult.conflicts.length > 0" class="mt-6">
              <h4 class="text-lg font-semibold mb-3" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Conflicts Requiring Resolution
              </h4>
              <div class="space-y-3">
                <div 
                  v-for="(conflict, index) in lastSyncResult.conflicts" 
                  :key="index"
                  class="p-4 rounded-lg border"
                  :class="isDarkMode 
                    ? 'border-red-800 bg-red-900/10' 
                    : 'border-red-200 bg-red-50'"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <div class="font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ conflict.designToolToken.name }}
                      </div>
                      <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ conflict.message }}
                      </div>
                    </div>
                    <span 
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="isDarkMode 
                        ? 'bg-red-900/50 text-red-400' 
                        : 'bg-red-100 text-red-700'"
                    >
                      {{ conflict.conflictType }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 mt-3">
                    <button 
                      @click="resolveConflict(conflict, 'use-design-tool')"
                      class="px-3 py-1 rounded text-sm font-medium transition-colors"
                      :class="isDarkMode 
                        ? 'bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800/50' 
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'"
                    >
                      Use Design Tool Value
                    </button>
                    <button 
                      @click="resolveConflict(conflict, 'use-system')"
                      class="px-3 py-1 rounded text-sm font-medium transition-colors"
                      :class="isDarkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    >
                      Keep System Value
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Create/Edit Connection Modal -->
        <div 
          v-if="showCreateModal || editingConnection"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="closeModal"
        >
          <div 
            class="rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto"
            :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ editingConnection ? 'Edit Connection' : 'New Connection' }}
              </h3>
              <button 
                @click="closeModal"
                class="p-2 rounded-lg transition-colors"
                :class="isDarkMode 
                  ? 'hover:bg-slate-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <form @submit.prevent="saveConnection" class="space-y-6">
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Connection Name
                </label>
                <input 
                  v-model="connectionForm.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-900 text-white focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'"
                  placeholder="e.g., Figma Design System"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Design Tool
                </label>
                <Dropdown
                  v-model="connectionForm.tool"
                  :options="toolOptions"
                  placeholder="Select a design tool"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  API Key / Access Token
                </label>
                <input 
                  v-model="connectionForm.apiKey"
                  type="password"
                  class="w-full px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-900 text-white focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'"
                  autocomplete="off"
                  :placeholder="editingConnection?.hasApiKey ? 'Saved (leave blank to keep it)' : 'Enter your API key or access token'"
                />
              </div>

              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  File ID / URL
                </label>
                <input 
                  v-model="connectionForm.fileId"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border transition-colors"
                  :class="isDarkMode 
                    ? 'border-gray-700 bg-slate-900 text-white focus:border-indigo-500' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'"
                  placeholder="Enter file ID or URL"
                />
              </div>

              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    v-model="connectionForm.enabled"
                    type="checkbox"
                    class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Enable Connection
                  </span>
                </label>
              </div>
              <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                Automatic sync is not available yet (no design tool integration or scheduler on this server).
              </p>

              <div class="flex items-center gap-3 pt-4">
                <button 
                  type="submit"
                  class="flex-1 px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium"
                >
                  {{ editingConnection ? 'Update Connection' : 'Create Connection' }}
                </button>
                <button 
                  type="button"
                  @click="closeModal"
                  class="px-6 py-3 rounded-lg border transition-colors font-medium"
                  :class="isDarkMode 
                    ? 'border-gray-700 text-gray-300 hover:bg-slate-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'"
                >
                  Cancel
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
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue';
import apiClient from '../services/api.js';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import { useDrawer } from '../composables/useDrawer.js';
import Dropdown from '../components/Dropdown.vue';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;
// The server has no design tool integration: sync answers 501
const SYNC_AVAILABLE = false;
const loadError = ref('');
const errorMessage = (error, fallback) => {
  const message = error?.response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || fallback;
};

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const connections = ref([]);
const syncingConnections = ref(new Set());
const lastSyncResult = ref(null);
const showCreateModal = ref(false);
const editingConnection = ref(null);

const connectionForm = reactive({
  name: '',
  tool: 'figma',
  apiKey: '',
  fileId: '',
  enabled: true,
});

const toolOptions = [
  { value: 'figma', label: 'Figma' },
  { value: 'penpot', label: 'Penpot' },
  { value: 'adobe-xd', label: 'Adobe XD' },
];





const getToolIcon = (tool) => {
  const icons = {
    figma: 'design_services',
    penpot: 'brush',
    'adobe-xd': 'palette',
  };
  return icons[tool] || 'sync';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const loadConnections = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/token-sync/connections`);
    connections.value = response.data || [];
    loadError.value = '';
  } catch (error) {
    console.error('Error loading connections:', error);
    connections.value = [];
    loadError.value = errorMessage(error, 'Failed to load connections.');
  }
};

const syncConnection = async (connectionId) => {
  syncingConnections.value.add(connectionId);
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/token-sync/connections/${connectionId}/sync`,
      {}
    );
    lastSyncResult.value = response.data;
    await loadConnections();
  } catch (error) {
    console.error('Error syncing connection:', error);
    alert(errorMessage(error, 'Failed to sync tokens. Please try again.'));
  } finally {
    syncingConnections.value.delete(connectionId);
  }
};

const editConnection = (connection) => {
  editingConnection.value = connection;
  Object.assign(connectionForm, {
    name: connection.name,
    tool: connection.tool,
    // The saved token is never sent back; leaving this blank keeps it
    apiKey: '',
    fileId: connection.fileId || '',
    enabled: connection.enabled,
  });
  showCreateModal.value = true;
};

const deleteConnection = async (connectionId) => {
  if (!confirm('Are you sure you want to delete this connection?')) return;
  
  try {
    await apiClient.delete(`${API_BASE_URL}/token-sync/connections/${connectionId}`);
    await loadConnections();
  } catch (error) {
    console.error('Error deleting connection:', error);
    alert(errorMessage(error, 'Failed to delete connection. Please try again.'));
  }
};

const saveConnection = async () => {
  try {
    const connectionData = {
      name: connectionForm.name,
      tool: connectionForm.tool,
      fileId: connectionForm.fileId || null,
      enabled: connectionForm.enabled,
    };
    // Blank keeps the saved token
    if (connectionForm.apiKey) connectionData.apiKey = connectionForm.apiKey;
    if (!editingConnection.value) connectionData.mappings = [];

    if (editingConnection.value) {
      await apiClient.put(
        `${API_BASE_URL}/token-sync/connections/${editingConnection.value.id}`,
        connectionData
      );
    } else {
      await apiClient.post(
        `${API_BASE_URL}/token-sync/connections`,
        connectionData
      );
    }

    closeModal();
    await loadConnections();
  } catch (error) {
    console.error('Error saving connection:', error);
    alert(errorMessage(error, 'Failed to save connection. Please try again.'));
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingConnection.value = null;
  Object.assign(connectionForm, {
    name: '',
    tool: 'figma',
    apiKey: '',
    fileId: '',
    enabled: true,
  });
};

const resolveConflict = async (conflict, resolution) => {
  try {
    await apiClient.post(
      `${API_BASE_URL}/token-sync/conflicts/${conflict.designToolToken.id}/resolve`,
      { resolution }
    );
    // Remove conflict from list
    if (lastSyncResult.value) {
      lastSyncResult.value.conflicts = lastSyncResult.value.conflicts.filter(
        c => c.designToolToken.id !== conflict.designToolToken.id
      );
    }
  } catch (error) {
    console.error('Error resolving conflict:', error);
    alert(errorMessage(error, 'Failed to resolve conflict. Please try again.'));
  }
};

let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  loadConnections();
  
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

