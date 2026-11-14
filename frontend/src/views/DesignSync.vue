<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design and code"
      title="Design-to-code sync"
      lead="Sync components and tokens from Figma and Penpot directly into your design system. Automatically generate component code and keep everything in sync with bidirectional synchronization."
      spot="site/design-sync"
    />

    <UiCallout tone="warning" title="Sync isn't available yet" role="status" class="mb-4">
      Reading design files and syncing are not available yet: this server has no Figma or Penpot integration.
      You can save connections (their access tokens are stored encrypted and never shown again), but View File and Sync are turned off until an integration exists.
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
              <dt class="text-ink-secondary">Sync direction</dt>
              <dd><UiChip tone="info" class="capitalize">{{ connection.syncDirection.replace('-', ' ') }}</UiChip></dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">Auto sync</dt>
              <dd><UiChip :tone="connection.autoSync ? 'info' : 'neutral'">{{ connection.autoSync ? 'On' : 'Off' }}</UiChip></dd>
            </div>
            <div v-if="connection.lastSync" class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">Last sync</dt>
              <dd class="text-ink">{{ formatDate(connection.lastSync) }}</dd>
            </div>
            <div v-if="connection.lastSyncVersion" class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">Version</dt>
              <dd class="text-ink">{{ connection.lastSyncVersion }}</dd>
            </div>
          </dl>
          <template #footer>
            <div class="flex flex-wrap items-center gap-2">
              <UiButton
                size="sm"
                :disabled="!SYNC_AVAILABLE"
                title="Not available: no Figma or Penpot integration on this server"
                @click="viewDesignFile(connection.id)"
              >
                View file
              </UiButton>
              <UiButton
                size="sm"
                icon="sync"
                :disabled="!SYNC_AVAILABLE || syncingConnections.has(connection.id)"
                title="Not available: no Figma or Penpot integration on this server"
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
        body="Connect your design tools to start syncing components and tokens automatically."
        spot="site/design-sync"
      >
        <template #actions>
          <UiButton variant="primary" @click="showCreateModal = true">Create first connection</UiButton>
        </template>
      </UiEmptyState>
    </PageSection>

    <PageSection v-if="lastSyncResult" title="Last sync results" divided>
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <UiStat label="Components added" tone="success" :value="lastSyncResult.components.added.length" />
        <UiStat label="Components updated" tone="accent" :value="lastSyncResult.components.updated.length" />
        <UiStat label="Components removed" tone="warning" :value="lastSyncResult.components.removed.length" />
        <UiStat label="Tokens added" tone="success" :value="lastSyncResult.tokens.added.length" />
        <UiStat label="Tokens updated" tone="accent" :value="lastSyncResult.tokens.updated.length" />
        <UiStat label="Tokens removed" tone="warning" :value="lastSyncResult.tokens.removed.length" />
      </div>
      <UiCallout v-if="lastSyncResult.errors.length > 0" tone="danger" title="Errors" class="mb-4">
        <ul class="list-disc list-inside">
          <li v-for="(error, index) in lastSyncResult.errors" :key="index">{{ error }}</li>
        </ul>
      </UiCallout>
      <UiCallout v-if="lastSyncResult.warnings.length > 0" tone="warning" title="Warnings">
        <ul class="list-disc list-inside">
          <li v-for="(warning, index) in lastSyncResult.warnings" :key="index">{{ warning }}</li>
        </ul>
      </UiCallout>
    </PageSection>

    <!-- Design file -->
    <UiDialog
      :open="showDesignFileModal && !!selectedDesignFile"
      :title="selectedDesignFile?.name || 'Design file'"
      size="lg"
      @update:open="(open) => !open && closeDesignFileModal()"
    >
      <div v-if="selectedDesignFile" class="space-y-6">
        <section>
          <h3 class="mb-3 text-base font-semibold text-ink-strong">File information</h3>
          <dl class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt class="text-ink-secondary">Version</dt>
              <dd class="font-medium text-ink-strong">{{ selectedDesignFile.version }}</dd>
            </div>
            <div>
              <dt class="text-ink-secondary">Last modified</dt>
              <dd class="font-medium text-ink-strong">{{ formatDate(selectedDesignFile.lastModified) }}</dd>
            </div>
            <div>
              <dt class="text-ink-secondary">Components</dt>
              <dd class="font-medium text-ink-strong">{{ selectedDesignFile.components.length }}</dd>
            </div>
            <div>
              <dt class="text-ink-secondary">Tokens</dt>
              <dd class="font-medium text-ink-strong">{{ selectedDesignFile.tokens.length }}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h3 class="mb-3 text-base font-semibold text-ink-strong">Components ({{ selectedDesignFile.components.length }})</h3>
          <ul class="space-y-3">
            <li
              v-for="component in selectedDesignFile.components"
              :key="component.id"
              class="flex items-start justify-between gap-3 rounded-tile border border-line bg-surface-sunken p-4"
            >
              <div class="min-w-0">
                <p class="font-semibold text-ink-strong">{{ component.name }}</p>
                <p class="text-sm text-ink-secondary">{{ component.description || 'No description' }}</p>
                <p class="mt-1 text-xs text-ink-muted">{{ component.properties.length }} properties</p>
              </div>
              <UiButton size="sm" icon="code" @click="generateComponentCode(component)">Generate code</UiButton>
            </li>
          </ul>
        </section>

        <section>
          <h3 class="mb-3 text-base font-semibold text-ink-strong">Tokens ({{ selectedDesignFile.tokens.length }})</h3>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li v-for="token in selectedDesignFile.tokens" :key="token.id" class="rounded-tile border border-line bg-surface-sunken p-3">
              <p class="text-sm font-medium text-ink-strong">{{ token.name }}</p>
              <p class="text-xs text-ink-secondary">{{ token.value }} • {{ token.type }}</p>
            </li>
          </ul>
        </section>
      </div>
    </UiDialog>

    <!-- Generated component code -->
    <UiDialog
      :open="showCodeModal && !!selectedComponent"
      :title="`Generated code: ${selectedComponent?.name || ''}`"
      size="lg"
      @update:open="(open) => !open && closeCodeModal()"
    >
      <UiSegmented v-model="selectedFramework" :options="frameworkOptions" label="Framework" class="mb-4" />
      <UiCodeBlock :code="generatedCode" :label="frameworkLabel" />
      <template #footer>
        <UiButton @click="closeCodeModal">Close</UiButton>
      </template>
    </UiDialog>

    <!-- Create / edit connection -->
    <UiDialog
      :open="connectionModalOpen"
      :title="editingConnection ? 'Edit connection' : 'New connection'"
      @update:open="(open) => !open && closeModal()"
    >
      <form id="design-sync-connection" class="space-y-5" @submit.prevent="saveConnection">
        <InlineNotice :notice="formNotice" @dismiss="clearFormNotice" />
        <UiInput v-model="connectionForm.name" label="Connection name" required placeholder="e.g., Figma Design System" />
        <UiSelect v-model="connectionForm.tool" :options="toolOptions" label="Design tool" placeholder="Select a design tool" />
        <UiSelect v-model="connectionForm.syncDirection" :options="syncDirectionOptions" label="Sync direction" placeholder="Select sync direction" />
        <UiInput
          v-model="connectionForm.apiKey"
          type="password"
          label="API key / access token"
          autocomplete="off"
          :placeholder="editingConnection?.hasApiKey ? 'Saved (leave blank to keep it)' : 'Enter your API key or access token'"
        />
        <UiInput v-model="connectionForm.fileId" label="File ID / URL" required placeholder="Enter file ID or URL" />
        <UiInput v-model="connectionForm.fileUrl" type="url" label="File URL (optional)" placeholder="https://..." />
        <UiCheckbox
          v-model="connectionForm.enabled"
          label="Enable connection"
          hint="Automatic sync is not available yet (no design tool integration or scheduler on this server)."
        />
      </form>
      <template #footer>
        <UiButton @click="closeModal">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="design-sync-connection">
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
  UiCodeBlock,
  UiDialog,
  UiEmptyState,
  UiInput,
  UiPanel,
  UiSegmented,
  UiSelect,
  UiStat,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;
// The server has no Figma or Penpot integration: file and sync routes answer 501
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
const showDesignFileModal = ref(false);
const selectedDesignFile = ref(null);
const showCodeModal = ref(false);
const selectedComponent = ref(null);
const selectedFramework = ref('vue');
const generatedCode = ref('');
const currentConnectionId = ref(null);

const connectionForm = reactive({
  name: '',
  tool: 'figma',
  syncDirection: 'bidirectional',
  apiKey: '',
  fileId: '',
  fileUrl: '',
  enabled: true,
});

const toolOptions = [
  { value: 'figma', label: 'Figma' },
  { value: 'penpot', label: 'Penpot' },
];

const syncDirectionOptions = [
  { value: 'design-to-code', label: 'Design to Code' },
  { value: 'code-to-design', label: 'Code to Design' },
  { value: 'bidirectional', label: 'Bidirectional' },
];

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const loadConnections = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/design-sync/connections`);
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
    const connection = connections.value.find(c => c.id === connectionId);
    const response = await apiClient.post(
      `${API_BASE_URL}/design-sync/connections/${connectionId}/sync`,
      { direction: connection?.syncDirection || 'bidirectional' }
    );
    lastSyncResult.value = response.data;
    await loadConnections();
  } catch (error) {
    console.error('Error syncing connection:', error);
    showNotice(errorMessage(error, 'Failed to sync. Please try again.'), 'error');
  } finally {
    syncingConnections.value.delete(connectionId);
  }
};

const viewDesignFile = async (connectionId) => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/design-sync/connections/${connectionId}/file`);
    selectedDesignFile.value = response.data;
    currentConnectionId.value = connectionId;
    showDesignFileModal.value = true;
  } catch (error) {
    console.error('Error loading design file:', error);
    showNotice(errorMessage(error, 'Failed to load design file. Please try again.'), 'error');
  }
};

const generateComponentCode = async (component) => {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/design-sync/components/${component.id}/generate`,
      { framework: selectedFramework.value, connectionId: currentConnectionId.value }
    );
    generatedCode.value = response.data.code;
    selectedComponent.value = component;
    showCodeModal.value = true;
  } catch (error) {
    console.error('Error generating code:', error);
    showNotice(errorMessage(error, 'Failed to generate code. Please try again.'), 'error');
  }
};

const frameworkOptions = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'html', label: 'HTML' },
];

const closeCodeModal = () => {
  showCodeModal.value = false;
  selectedComponent.value = null;
  generatedCode.value = '';
};

const closeDesignFileModal = () => {
  showDesignFileModal.value = false;
  selectedDesignFile.value = null;
  currentConnectionId.value = null;
};

const editConnection = (connection) => {
  editingConnection.value = connection;
  Object.assign(connectionForm, {
    name: connection.name,
    tool: connection.tool,
    syncDirection: connection.syncDirection,
    // The saved token is never sent back; leaving this blank keeps it
    apiKey: '',
    fileId: connection.fileId,
    fileUrl: connection.fileUrl || '',
    enabled: connection.enabled,
  });
  showCreateModal.value = true;
};

const deleteConnection = async (connectionId) => {
  if (!confirm('Are you sure you want to delete this connection?')) return;
  
  try {
    await apiClient.delete(`${API_BASE_URL}/design-sync/connections/${connectionId}`);
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
      syncDirection: connectionForm.syncDirection,
      fileId: connectionForm.fileId,
      fileUrl: connectionForm.fileUrl || null,
      enabled: connectionForm.enabled,
    };
    // Blank keeps the saved token
    if (connectionForm.apiKey) connectionData.apiKey = connectionForm.apiKey;

    if (editingConnection.value) {
      await apiClient.put(
        `${API_BASE_URL}/design-sync/connections/${editingConnection.value.id}`,
        connectionData
      );
    } else {
      await apiClient.post(
        `${API_BASE_URL}/design-sync/connections`,
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
    syncDirection: 'bidirectional',
    apiKey: '',
    fileId: '',
    fileUrl: '',
    enabled: true,
  });
};

const toolLabel = (tool) => toolOptions.find((option) => option.value === tool)?.label ?? tool;
const frameworkLabel = computed(() => frameworkOptions.find((option) => option.value === selectedFramework.value)?.label ?? 'Code');

onMounted(() => {
  loadConnections();
});
</script>
