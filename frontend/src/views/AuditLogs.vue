<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Audit Logs
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Track and monitor all user actions, API calls, and system events with exportable audit trails.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="auditGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Clock/history icon representing audit logs -->
                    <circle cx="100" cy="100" r="60" fill="none" stroke="url(#auditGradient)" stroke-width="4" opacity="0.4"/>
                    <circle cx="100" cy="100" r="50" fill="none" stroke="url(#auditGradient)" stroke-width="3" opacity="0.6"/>
                    <line x1="100" y1="100" x2="100" y2="70" stroke="url(#auditGradient)" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
                    <line x1="100" y1="100" x2="125" y2="100" stroke="url(#auditGradient)" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
                    <!-- List/document lines representing logs -->
                    <line x1="40" y1="150" x2="160" y2="150" stroke="url(#auditGradient)" stroke-width="2" opacity="0.5"/>
                    <line x1="40" y1="165" x2="160" y2="165" stroke="url(#auditGradient)" stroke-width="2" opacity="0.5"/>
                    <line x1="40" y1="180" x2="160" y2="180" stroke="url(#auditGradient)" stroke-width="2" opacity="0.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="max-w-7xl mx-auto mb-8" v-if="stats">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Total Events
                </h3>
                <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  history
                </span>
              </div>
              <div class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ stats.total || 0 }}
              </div>
            </div>

            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Success Rate
                </h3>
                <span class="material-symbols-outlined" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
                  check_circle
                </span>
              </div>
              <div class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
                {{ stats.successRate ? stats.successRate.toFixed(1) : '0.0' }}%
              </div>
            </div>

            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Errors
                </h3>
                <span class="material-symbols-outlined" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                  error
                </span>
              </div>
              <div class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">
                {{ stats.errors || 0 }}
              </div>
            </div>

            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Unique Users
                </h3>
                <span class="material-symbols-outlined" :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'">
                  people
                </span>
              </div>
              <div class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'">
                {{ Object.keys(stats.byUser || {}).length }}
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Actions -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h2 class="text-xl font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Filters
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">User ID</label>
                <input
                  v-model="filters.userId"
                  type="text"
                  placeholder="Filter by user ID"
                  class="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-600 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Action</label>
                <Dropdown
                  :options="actionOptions"
                  :modelValue="filters.action"
                  @update:modelValue="filters.action = $event"
                  placeholder="All actions"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Resource Type</label>
                <input
                  v-model="filters.resourceType"
                  type="text"
                  placeholder="e.g., component, token"
                  class="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  :class="isDarkMode 
                    ? 'bg-slate-800 border-gray-600 text-gray-100' 
                    : 'bg-white border-gray-300 text-gray-900'"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Date Range</label>
                <div class="flex gap-2">
                  <input
                    v-model="filters.startDate"
                    type="date"
                    class="flex-1 px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'"
                  />
                  <input
                    v-model="filters.endDate"
                    type="date"
                    class="flex-1 px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    :class="isDarkMode 
                      ? 'bg-slate-800 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'"
                  />
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                @click="loadLogs"
                class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <span class="material-symbols-outlined text-lg">search</span>
                Search
              </button>
              <button
                @click="exportLogs('csv')"
                class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <span class="material-symbols-outlined text-lg">download</span>
                Export CSV
              </button>
              <button
                @click="exportLogs('json')"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <span class="material-symbols-outlined text-lg">download</span>
                Export JSON
              </button>
              <button
                @click="clearFilters"
                class="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Logs Table -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border overflow-hidden"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <tr>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Timestamp</th>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">User</th>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Action</th>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Resource</th>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hidden xl:table-cell" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Endpoint</th>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Status</th>
                    <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">Details</th>
                  </tr>
                </thead>
                <tbody class="divide-y" :class="isDarkMode ? 'divide-gray-700 bg-slate-900' : 'divide-gray-200 bg-white'">
                  <tr v-if="loading">
                    <td colspan="7" class="px-6 py-8 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      <div class="flex items-center justify-center gap-2">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                  <tr v-else-if="logs.length === 0">
                    <td colspan="7" class="px-6 py-8 text-center" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                      No audit logs found
                    </td>
                  </tr>
                  <tr
                    v-else
                    v-for="log in logs"
                    :key="log.id"
                    class="hover:bg-opacity-50 transition-colors"
                    :class="isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'"
                  >
                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-900'">
                      {{ formatDate(log.timestamp) }}
                    </td>
                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <div :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'">{{ log.userName || log.userId }}</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">{{ log.userEmail || log.userId }}</div>
                    </td>
                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        class="px-2 py-1 text-xs font-semibold rounded-full"
                        :class="getActionColor(log.action)"
                      >
                        {{ log.action }}
                      </span>
                    </td>
                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell">
                      <div :class="isDarkMode ? 'text-gray-300' : 'text-gray-900'">{{ log.resourceType }}</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'" v-if="log.resourceName">{{ log.resourceName }}</div>
                    </td>
                    <td class="px-4 sm:px-6 py-4 text-sm hidden xl:table-cell">
                      <div class="max-w-xs truncate" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">{{ log.endpoint }}</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">{{ log.method }}</div>
                    </td>
                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        class="px-2 py-1 text-xs font-semibold rounded-full"
                        :class="getStatusColor(log.success, log.responseStatus)"
                      >
                        {{ log.responseStatus || (log.success ? 'Success' : 'Error') }}
                      </span>
                    </td>
                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        @click="showDetails(log)"
                        class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination -->
            <div 
              v-if="total > 0"
              class="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t"
              :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'"
            >
              <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Showing {{ offset + 1 }} to {{ Math.min(offset + logs.length, total) }} of {{ total }} results
              </div>
              <div class="flex gap-2">
                <button
                  @click="previousPage"
                  :disabled="offset === 0"
                  class="px-4 py-2 border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-600 text-gray-300 hover:bg-slate-800 disabled:hover:bg-slate-900' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-white'"
                >
                  Previous
                </button>
                <button
                  @click="nextPage"
                  :disabled="offset + logs.length >= total"
                  class="px-4 py-2 border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="isDarkMode 
                    ? 'bg-slate-900 border-gray-600 text-gray-300 hover:bg-slate-800 disabled:hover:bg-slate-900' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:hover:bg-white'"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div
      v-if="selectedLog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="selectedLog = null"
    >
      <div 
        class="rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-slate-900' : 'bg-white'"
      >
        <div 
          class="p-6 border-b flex items-center justify-between"
          :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
        >
          <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Audit Log Details</h2>
          <button
            @click="selectedLog = null"
            class="p-2 rounded-lg transition-colors"
            :class="isDarkMode ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Timestamp</label>
            <div class="mt-1" :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'">{{ formatDate(selectedLog.timestamp) }}</div>
          </div>
          <div>
            <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">User</label>
            <div class="mt-1" :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'">{{ selectedLog.userName || selectedLog.userId }}</div>
            <div class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">{{ selectedLog.userEmail || selectedLog.userId }}</div>
          </div>
          <div>
            <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Action</label>
            <div class="mt-1">
              <span
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="getActionColor(selectedLog.action)"
              >
                {{ selectedLog.action }}
              </span>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Resource</label>
            <div class="mt-1" :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'">{{ selectedLog.resourceType }}</div>
            <div class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'" v-if="selectedLog.resourceId">ID: {{ selectedLog.resourceId }}</div>
            <div class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'" v-if="selectedLog.resourceName">Name: {{ selectedLog.resourceName }}</div>
          </div>
          <div>
            <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Request</label>
            <div class="mt-1" :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'">{{ selectedLog.method }} {{ selectedLog.endpoint }}</div>
            <div class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'" v-if="selectedLog.ipAddress">IP: {{ selectedLog.ipAddress }}</div>
            <div class="text-sm" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'" v-if="selectedLog.userAgent">User Agent: {{ selectedLog.userAgent }}</div>
          </div>
          <div v-if="selectedLog.changes && selectedLog.changes.length > 0">
            <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Changes</label>
            <div class="mt-1 space-y-2">
              <div
                v-for="(change, idx) in selectedLog.changes"
                :key="idx"
                class="p-3 rounded-lg"
                :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'"
              >
                <div class="font-medium" :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'">{{ change.field }}</div>
                <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="line-through" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">{{ JSON.stringify(change.oldValue) }}</span>
                  →
                  <span :class="isDarkMode ? 'text-green-400' : 'text-green-600'">{{ JSON.stringify(change.newValue) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="selectedLog.requestBody">
            <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Request Body</label>
            <pre class="mt-1 p-3 rounded-lg text-sm overflow-x-auto" :class="isDarkMode ? 'bg-slate-800 text-gray-100' : 'bg-gray-50 text-gray-900'">{{ JSON.stringify(selectedLog.requestBody, null, 2) }}</pre>
          </div>
          <div v-if="selectedLog.metadata">
            <label class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Metadata</label>
            <pre class="mt-1 p-3 rounded-lg text-sm overflow-x-auto" :class="isDarkMode ? 'bg-slate-800 text-gray-100' : 'bg-gray-50 text-gray-900'">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
          </div>
          <div v-if="selectedLog.errorMessage">
            <label class="text-sm font-medium" :class="isDarkMode ? 'text-red-400' : 'text-red-700'">Error</label>
            <div class="mt-1" :class="isDarkMode ? 'text-red-400' : 'text-red-600'">{{ selectedLog.errorMessage }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Dropdown from '../components/Dropdown.vue';

const route = useRoute();
const drawerOpen = ref(false);

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const isDarkMode = computed(() => {
  return document.documentElement.classList.contains('dark');
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const logs = ref([]);
const loading = ref(false);
const total = ref(0);
const offset = ref(0);
const limit = ref(100);
const stats = ref(null);
const selectedLog = ref(null);

const filters = ref({
  userId: '',
  action: '',
  resourceType: '',
  resourceId: '',
  startDate: '',
  endDate: '',
});

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'READ', label: 'Read' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'COMMENT', label: 'Comment' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
  { value: 'VOTE', label: 'Vote' },
  { value: 'ASSIGN', label: 'Assign' },
  { value: 'STATUS_CHANGE', label: 'Status Change' },
  { value: 'EXPORT', label: 'Export' },
  { value: 'IMPORT', label: 'Import' },
  { value: 'API_CALL', label: 'API Call' },
];

const loadLogs = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.value.userId) params.append('userId', filters.value.userId);
    if (filters.value.action) params.append('action', filters.value.action);
    if (filters.value.resourceType) params.append('resourceType', filters.value.resourceType);
    if (filters.value.resourceId) params.append('resourceId', filters.value.resourceId);
    if (filters.value.startDate) params.append('startDate', filters.value.startDate);
    if (filters.value.endDate) params.append('endDate', filters.value.endDate);
    params.append('limit', limit.value.toString());
    params.append('offset', offset.value.toString());

    const response = await fetch(`${API_BASE_URL}/api/v1/audit/logs?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    logs.value = data.logs || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error('Failed to load audit logs:', error);
    logs.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const params = new URLSearchParams();
    if (filters.value.startDate) params.append('startDate', filters.value.startDate);
    if (filters.value.endDate) params.append('endDate', filters.value.endDate);

    const response = await fetch(`${API_BASE_URL}/api/v1/audit/stats?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    stats.value = await response.json();
  } catch (error) {
    console.error('Failed to load stats:', error);
    stats.value = null;
  }
};

const exportLogs = async (format) => {
  try {
    const params = new URLSearchParams();
    if (filters.value.userId) params.append('userId', filters.value.userId);
    if (filters.value.action) params.append('action', filters.value.action);
    if (filters.value.resourceType) params.append('resourceType', filters.value.resourceType);
    if (filters.value.resourceId) params.append('resourceId', filters.value.resourceId);
    if (filters.value.startDate) params.append('startDate', filters.value.startDate);
    if (filters.value.endDate) params.append('endDate', filters.value.endDate);
    params.append('format', format);

    const response = await fetch(`${API_BASE_URL}/api/v1/audit/export?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Failed to export audit logs:', error);
    alert('Failed to export audit logs. Please try again.');
  }
};

const clearFilters = () => {
  filters.value = {
    userId: '',
    action: '',
    resourceType: '',
    resourceId: '',
    startDate: '',
    endDate: '',
  };
  offset.value = 0;
  loadLogs();
  loadStats();
};

const previousPage = () => {
  if (offset.value > 0) {
    offset.value = Math.max(0, offset.value - limit.value);
    loadLogs();
  }
};

const nextPage = () => {
  if (offset.value + logs.value.length < total.value) {
    offset.value += limit.value;
    loadLogs();
  }
};

const showDetails = (log) => {
  selectedLog.value = log;
};

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};

const getActionColor = (action) => {
  const colors = {
    CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    READ: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    UPDATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    COMMENT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    APPROVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    REJECT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    VOTE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    ASSIGN: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    STATUS_CHANGE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    EXPORT: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    IMPORT: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    API_CALL: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };
  return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
};

const getStatusColor = (success, status) => {
  if (!success || (status && status >= 400)) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
  if (status && status >= 300) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
  return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
};

onMounted(() => {
  loadLogs();
  loadStats();
});
</script>
