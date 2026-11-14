<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="Audit logs"
      lead="Track and monitor all user actions, API calls, and system events with exportable audit trails."
      spot="admin/audit-logs"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <PageSection v-if="stats" title="Summary">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UiStat label="Total events" icon="history" :value="stats.total || 0" />
        <UiStat label="Success rate" icon="check_circle" tone="success" :value="`${stats.successRate ? stats.successRate.toFixed(1) : '0.0'}%`" />
        <UiStat label="Errors" icon="error" tone="danger" :value="stats.errors || 0" />
        <UiStat label="Unique users" icon="people" :value="Object.keys(stats.byUser || {}).length" />
      </div>
    </PageSection>

    <PageSection title="Filters" :divided="!!stats">
      <UiPanel>
        <form class="space-y-5" @submit.prevent="loadLogs">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <UiInput v-model="filters.userId" label="User ID" placeholder="Filter by user ID" />
            <UiSelect v-model="filters.action" label="Action" :options="actionOptions" />
            <UiInput v-model="filters.resourceType" label="Resource type" placeholder="e.g., component, token" />
            <div class="grid grid-cols-2 gap-2">
              <UiInput v-model="filters.startDate" type="date" label="From" />
              <UiInput v-model="filters.endDate" type="date" label="To" />
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <UiButton type="submit" variant="primary" icon="search">Search</UiButton>
            <UiButton icon="download" @click="exportLogs('csv')">Export CSV</UiButton>
            <UiButton icon="download" @click="exportLogs('json')">Export JSON</UiButton>
            <UiButton variant="ghost" @click="clearFilters">Clear filters</UiButton>
          </div>
        </form>
      </UiPanel>
    </PageSection>

    <PageSection title="Events" divided>
      <UiPanel flush>
        <UiSpinner v-if="loading" class="p-6" />
        <UiEmptyState v-else-if="logs.length === 0" title="No audit logs found" body="Try different filters or a wider date range." :bordered="false" />
        <UiTable v-else caption="Audit log events">
          <thead>
            <tr>
              <th scope="col">Timestamp</th>
              <th scope="col">User</th>
              <th scope="col">Action</th>
              <th scope="col" class="hidden lg:table-cell">Resource</th>
              <th scope="col" class="hidden xl:table-cell">Endpoint</th>
              <th scope="col">Status</th>
              <th scope="col"><span class="sr-only">Details</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td class="whitespace-nowrap">{{ formatDate(log.timestamp) }}</td>
              <td class="whitespace-nowrap">
                <div class="text-ink-strong">{{ log.userName || log.userId }}</div>
                <div class="text-xs text-ink-muted">{{ log.userEmail || log.userId }}</div>
              </td>
              <td class="whitespace-nowrap"><UiChip :tone="actionTone(log.action)">{{ log.action }}</UiChip></td>
              <td class="whitespace-nowrap hidden lg:table-cell">
                <div>{{ log.resourceType }}</div>
                <div v-if="log.resourceName" class="text-xs text-ink-muted">{{ log.resourceName }}</div>
              </td>
              <td class="hidden xl:table-cell">
                <div class="max-w-xs truncate text-ink-secondary">{{ log.endpoint }}</div>
                <div class="text-xs text-ink-muted">{{ log.method }}</div>
              </td>
              <td class="whitespace-nowrap">
                <UiChip :tone="statusTone(log.success, log.responseStatus)">{{ log.responseStatus || (log.success ? 'Success' : 'Error') }}</UiChip>
              </td>
              <td class="whitespace-nowrap">
                <UiButton size="sm" variant="ghost" @click="showDetails(log)">View<span class="sr-only"> details for {{ log.action }} at {{ formatDate(log.timestamp) }}</span></UiButton>
              </td>
            </tr>
          </tbody>
        </UiTable>
        <template v-if="total > 0" #footer>
          <span class="text-sm text-ink-secondary">Showing {{ offset + 1 }} to {{ Math.min(offset + logs.length, total) }} of {{ total }} results</span>
          <span class="flex gap-2">
            <UiButton size="sm" icon="chevron_left" :disabled="offset === 0" @click="previousPage">Previous</UiButton>
            <UiButton size="sm" trailing-icon="chevron_right" :disabled="offset + logs.length >= total" @click="nextPage">Next</UiButton>
          </span>
        </template>
      </UiPanel>
    </PageSection>

    <!-- Details -->
    <UiDialog :open="!!selectedLog" title="Audit log details" size="lg" @update:open="(open) => { if (!open) selectedLog = null; }">
      <dl v-if="selectedLog" class="space-y-4">
        <div>
          <dt class="detail-label">Timestamp</dt>
          <dd class="mt-1 text-ink">{{ formatDate(selectedLog.timestamp) }}</dd>
        </div>
        <div>
          <dt class="detail-label">User</dt>
          <dd class="mt-1 text-ink">{{ selectedLog.userName || selectedLog.userId }}</dd>
          <dd class="text-sm text-ink-muted">{{ selectedLog.userEmail || selectedLog.userId }}</dd>
        </div>
        <div>
          <dt class="detail-label">Action</dt>
          <dd class="mt-1"><UiChip :tone="actionTone(selectedLog.action)">{{ selectedLog.action }}</UiChip></dd>
        </div>
        <div>
          <dt class="detail-label">Resource</dt>
          <dd class="mt-1 text-ink">{{ selectedLog.resourceType }}</dd>
          <dd v-if="selectedLog.resourceId" class="text-sm text-ink-muted">ID: {{ selectedLog.resourceId }}</dd>
          <dd v-if="selectedLog.resourceName" class="text-sm text-ink-muted">Name: {{ selectedLog.resourceName }}</dd>
        </div>
        <div>
          <dt class="detail-label">Request</dt>
          <dd class="mt-1 text-ink">{{ selectedLog.method }} {{ selectedLog.endpoint }}</dd>
          <dd v-if="selectedLog.ipAddress" class="text-sm text-ink-muted">IP: {{ selectedLog.ipAddress }}</dd>
          <dd v-if="selectedLog.userAgent" class="text-sm text-ink-muted">User Agent: {{ selectedLog.userAgent }}</dd>
        </div>
        <div v-if="selectedLog.changes && selectedLog.changes.length > 0">
          <dt class="detail-label">Changes</dt>
          <dd class="mt-1 space-y-2">
            <div v-for="(change, idx) in selectedLog.changes" :key="idx" class="p-3 rounded-tile bg-surface-sunken">
              <div class="font-medium text-ink-strong">{{ change.field }}</div>
              <div class="text-sm text-ink-secondary">
                <del class="text-danger">{{ JSON.stringify(change.oldValue) }}</del>
                →
                <ins class="no-underline text-success">{{ JSON.stringify(change.newValue) }}</ins>
              </div>
            </div>
          </dd>
        </div>
        <div v-if="selectedLog.requestBody">
          <dt class="detail-label">Request body</dt>
          <dd><pre class="detail-pre">{{ JSON.stringify(selectedLog.requestBody, null, 2) }}</pre></dd>
        </div>
        <div v-if="selectedLog.metadata">
          <dt class="detail-label">Metadata</dt>
          <dd><pre class="detail-pre">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre></dd>
        </div>
        <div v-if="selectedLog.errorMessage">
          <dt class="detail-label text-danger">Error</dt>
          <dd class="mt-1 text-danger">{{ selectedLog.errorMessage }}</dd>
        </div>
      </dl>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiChip,
  UiDialog,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiSelect,
  UiSpinner,
  UiStat,
  UiTable,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import { authHeaders } from '../services/api.js';

const { notice, showNotice, clearNotice } = useNotice();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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

    const response = await fetch(`${API_BASE_URL}/api/v1/audit/logs?${params}`, { headers: authHeaders() });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    logs.value = data.logs || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error('Failed to load audit logs:', error);
    showNotice('The audit logs could not be loaded.', 'error');
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

    const response = await fetch(`${API_BASE_URL}/api/v1/audit/stats?${params}`, { headers: authHeaders() });
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

    const response = await fetch(`${API_BASE_URL}/api/v1/audit/export?${params}`, { headers: authHeaders() });
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
    showNotice('Failed to export audit logs. Please try again.', 'error');
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

const actionTone = (action) =>
  ({
    CREATE: 'success',
    APPROVE: 'success',
    READ: 'info',
    UPDATE: 'warning',
    STATUS_CHANGE: 'warning',
    DELETE: 'danger',
    REJECT: 'danger',
    COMMENT: 'accent',
    VOTE: 'accent',
    ASSIGN: 'accent',
    EXPORT: 'info',
    IMPORT: 'info',
  })[action] || 'neutral';

const statusTone = (success, status) => {
  if (!success || (status && status >= 400)) return 'danger';
  if (status && status >= 300) return 'warning';
  return 'success';
};

onMounted(() => {
  loadLogs();
  loadStats();
});
</script>

<style scoped>
.detail-label {
  @apply text-sm font-medium text-ink-secondary;
}
.detail-pre {
  @apply mt-1 p-3 rounded-tile text-sm overflow-x-auto bg-surface-sunken text-ink font-code;
}
</style>
