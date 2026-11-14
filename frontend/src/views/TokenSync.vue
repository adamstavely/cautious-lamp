<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design tokens"
      title="Design token sync"
      lead="Sync design tokens from Figma, Penpot, and Adobe XD directly into your design system. Keep your tokens in sync automatically with conflict resolution and validation."
      spot="foundations/token-sync"
    />

    <UiCallout tone="warning" title="Sync isn't available yet" role="status" class="mb-4">
      Token sync is not available yet: this server has no Figma, Penpot or Adobe XD integration to read tokens from.
      You can save connections (their access tokens are stored encrypted and never shown again), but Sync is turned off until an integration exists.
    </UiCallout>
    <UiCallout v-if="loadError" tone="danger" role="alert" class="mb-4">{{ loadError }}</UiCallout>
    <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />

    <PageSection title="Connections">
      <template #actions>
        <UiButton variant="primary" icon="add" @click="showCreateModal = true">New connection</UiButton>
      </template>

      <div v-if="connections.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UiPanel
          v-for="connection in connections"
          :key="connection.id"
          :title="connection.name"
          :description="toolLabel(connection.tool)"
          heading-tag="h3"
        >
          <template #actions>
            <UiChip :tone="connection.enabled ? 'success' : 'neutral'">{{ connection.enabled ? 'Enabled' : 'Disabled' }}</UiChip>
          </template>
          <dl class="space-y-2 text-sm">
            <div class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">Auto sync</dt>
              <dd><UiChip :tone="connection.autoSync ? 'info' : 'neutral'">{{ connection.autoSync ? 'On' : 'Off' }}</UiChip></dd>
            </div>
            <div v-if="connection.lastSync" class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">Last sync</dt>
              <dd class="text-ink">{{ formatDate(connection.lastSync) }}</dd>
            </div>
          </dl>
          <template #footer>
            <div class="flex flex-wrap items-center gap-2">
              <UiButton
                size="sm"
                icon="sync"
                :disabled="!SYNC_AVAILABLE || syncingConnections.has(connection.id)"
                title="Not available: no design tool integration on this server"
                @click="syncConnection(connection.id)"
              >
                {{ syncingConnections.has(connection.id) ? 'Syncing…' : 'Sync now' }}
              </UiButton>
              <UiButton size="sm" variant="ghost" icon="edit" @click="editConnection(connection)">Edit</UiButton>
              <UiButton size="sm" variant="ghost" icon="delete" icon-only :label="`Delete ${connection.name}`" @click="deleteConnection(connection.id)" />
            </div>
          </template>
        </UiPanel>
      </div>

      <UiEmptyState
        v-else
        title="No connections yet"
        body="Connect your design tools to start syncing tokens automatically."
        spot="foundations/token-sync"
      >
        <template #actions>
          <UiButton variant="primary" @click="showCreateModal = true">Create first connection</UiButton>
        </template>
      </UiEmptyState>
    </PageSection>

    <PageSection v-if="lastSyncResult" title="Last sync results" divided>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <UiStat label="Tokens added" tone="success" :value="lastSyncResult.tokensAdded" />
        <UiStat label="Tokens updated" tone="accent" :value="lastSyncResult.tokensUpdated" />
        <UiStat label="Tokens skipped" tone="warning" :value="lastSyncResult.tokensSkipped" />
        <UiStat label="Conflicts" tone="danger" :value="lastSyncResult.conflicts.length" />
      </div>

      <template v-if="lastSyncResult.conflicts.length > 0">
        <h3 class="mb-3 text-lg font-semibold text-ink-strong">Conflicts requiring resolution</h3>
        <ul class="space-y-3">
          <li
            v-for="(conflict, index) in lastSyncResult.conflicts"
            :key="index"
            class="rounded-tile border border-danger-border bg-danger-bg p-4"
          >
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <p class="mb-1 font-medium text-ink-strong">{{ conflict.designToolToken.name }}</p>
                <p class="text-sm text-ink-secondary">{{ conflict.message }}</p>
              </div>
              <UiChip tone="danger">{{ conflict.conflictType }}</UiChip>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <UiButton size="sm" variant="primary" @click="resolveConflict(conflict, 'use-design-tool')">Use design tool value</UiButton>
              <UiButton size="sm" @click="resolveConflict(conflict, 'use-system')">Keep system value</UiButton>
            </div>
          </li>
        </ul>
      </template>
    </PageSection>

    <UiDialog
      :open="connectionModalOpen"
      :title="editingConnection ? 'Edit connection' : 'New connection'"
      @update:open="(open) => !open && closeModal()"
    >
      <form id="token-sync-connection" class="space-y-5" @submit.prevent="saveConnection">
        <InlineNotice :notice="formNotice" @dismiss="clearFormNotice" />
        <UiInput v-model="connectionForm.name" label="Connection name" required placeholder="e.g., Figma Design System" />
        <UiSelect v-model="connectionForm.tool" :options="toolOptions" label="Design tool" placeholder="Select a design tool" />
        <UiInput
          v-model="connectionForm.apiKey"
          type="password"
          label="API key / access token"
          autocomplete="off"
          :placeholder="editingConnection?.hasApiKey ? 'Saved (leave blank to keep it)' : 'Enter your API key or access token'"
        />
        <UiInput v-model="connectionForm.fileId" label="File ID / URL" placeholder="Enter file ID or URL" />
        <UiCheckbox
          v-model="connectionForm.enabled"
          label="Enable connection"
          hint="Automatic sync is not available yet (no design tool integration or scheduler on this server)."
        />
      </form>
      <template #footer>
        <UiButton @click="closeModal">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="token-sync-connection">
          {{ editingConnection ? 'Update connection' : 'Create connection' }}
        </UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { computed, ref, onMounted, reactive } from 'vue';
import apiClient from '../services/api.js';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiCheckbox,
  UiChip,
  UiDialog,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiSelect,
  UiStat,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;
// The server has no design tool integration: sync answers 501
const SYNC_AVAILABLE = false;
const loadError = ref('');
const errorMessage = (error, fallback) => {
  const message = error?.response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || fallback;
};

const { notice, showNotice, clearNotice } = useNotice();
// Errors from saving show inside the connection dialog
const { notice: formNotice, showNotice: showFormNotice, clearNotice: clearFormNotice } = useNotice();
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
    showNotice(errorMessage(error, 'Failed to sync tokens. Please try again.'), 'error');
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
    showNotice(errorMessage(error, 'Failed to delete connection. Please try again.'), 'error');
  }
};

const saveConnection = async () => {
  clearFormNotice();
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
    showFormNotice(errorMessage(error, 'Failed to save connection. Please try again.'), 'error');
  }
};

const connectionModalOpen = computed(() => showCreateModal.value || !!editingConnection.value);

const closeModal = () => {
  showCreateModal.value = false;
  editingConnection.value = null;
  clearFormNotice();
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
    showNotice(errorMessage(error, 'Failed to resolve conflict. Please try again.'), 'error');
  }
};

const toolLabel = (tool) => toolOptions.find((option) => option.value === tool)?.label ?? tool;

onMounted(() => {
  loadConnections();
});
</script>
