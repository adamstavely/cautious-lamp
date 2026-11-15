<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design and code"
      title="Design sync"
      lead="Compare the components in a Figma or Penpot file with your component library: what matches, what was renamed, and what is missing in code or in design. Link a component to its design node so the two stay paired."
      spot="site/design-sync"
    />

    <UiCallout tone="info" title="What design sync does" class="mb-4">
      It reads design files and reports differences. It doesn't change the design file or generate component code.
      Tokens from the same file are pulled on the <UiLink to="/tokens/sync">token sync</UiLink> page.
    </UiCallout>
    <UiCallout v-if="loadError" tone="danger" role="alert" class="mb-4">{{ loadError }}</UiCallout>
    <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />

    <PageSection title="Connections">
      <template #actions>
        <UiButton variant="primary" icon="plus" @click="openCreate">New connection</UiButton>
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
              <dt class="text-ink-secondary">File</dt>
              <dd class="truncate text-ink">{{ connection.fileId }}</dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">Access token</dt>
              <dd><UiChip :tone="connection.hasApiKey ? 'success' : 'warning'">{{ connection.hasApiKey ? 'Saved' : 'Missing' }}</UiChip></dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">Scheduled compare</dt>
              <dd><UiChip :tone="connection.autoSync ? 'info' : 'neutral'">{{ connection.autoSync ? `Every ${intervalLabel(connection.syncIntervalHours)}` : 'Off' }}</UiChip></dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">Last compared</dt>
              <dd class="text-ink">{{ connection.lastSync ? formatDate(connection.lastSync) : 'Never' }}</dd>
            </div>
            <div v-if="connection.lastSyncVersion" class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">File version</dt>
              <dd class="text-ink">{{ connection.lastSyncVersion }}</dd>
            </div>
          </dl>
          <template #footer>
            <div class="flex flex-wrap items-center gap-2">
              <UiButton
                size="sm"
                icon="git-compare"
                :loading="comparing.has(connection.id)"
                :disabled="comparing.has(connection.id) || !connection.enabled"
                @click="compare(connection)"
              >
                Compare
              </UiButton>
              <UiButton size="sm" variant="ghost" icon="eye" :disabled="!connection.enabled" @click="viewDesignFile(connection)">View file</UiButton>
              <UiButton size="sm" variant="ghost" icon="history" @click="showHistory(connection)">History</UiButton>
              <UiButton size="sm" variant="ghost" icon="pencil" @click="editConnection(connection)">Edit</UiButton>
              <UiButton size="sm" variant="ghost" icon="trash-2" icon-only :label="`Delete ${connection.name}`" @click="deleteConnection(connection)" />
            </div>
          </template>
        </UiPanel>
      </div>

      <UiEmptyState
        v-else
        title="No connections yet"
        body="Connect a Figma or Penpot file to compare its components with the library."
        spot="site/design-sync"
      >
        <template #actions>
          <UiButton variant="primary" @click="openCreate">Create first connection</UiButton>
        </template>
      </UiEmptyState>
    </PageSection>

    <PageSection v-if="report" title="Comparison" :description="reportDescription" divided>
      <UiCallout v-if="report.warnings?.length" tone="info" title="Notes from reading the file" class="mb-4">
        <ul class="list-disc list-inside space-y-1">
          <li v-for="(warning, index) in report.warnings" :key="index">{{ warning }}</li>
        </ul>
      </UiCallout>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <UiStat label="Matched" tone="success" :value="report.counts.matched ?? 0" />
        <UiStat label="Renamed" tone="accent" :value="report.counts.renamed ?? 0" />
        <UiStat label="Missing in code" tone="warning" :value="report.counts['missing-in-code'] ?? 0" />
        <UiStat label="Missing in design" tone="warning" :value="report.counts['missing-in-design'] ?? 0" />
      </div>

      <UiEmptyState v-if="!report.componentItems?.length" title="Nothing to compare" body="The design file has no components, and the library has none either." :bordered="false" />
      <UiPanel v-else flush>
        <UiTable caption="Design components compared with library components">
          <thead>
            <tr>
              <th scope="col">In the design file</th>
              <th scope="col">In code</th>
              <th scope="col">Result</th>
              <th scope="col">Link</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in report.componentItems" :key="`${item.designId ?? ''}:${item.componentId ?? ''}:${index}`">
              <th scope="row">
                <template v-if="item.designName">
                  <UiLink v-if="item.designUrl" :href="item.designUrl" external>{{ item.designName }}</UiLink>
                  <span v-else>{{ item.designName }}</span>
                  <span v-if="item.designPath" class="block text-xs font-normal text-ink-muted">{{ item.designPath }}</span>
                  <span v-if="item.variants?.length" class="block text-xs font-normal text-ink-muted">{{ item.variants.length }} variant{{ item.variants.length === 1 ? '' : 's' }}</span>
                </template>
                <span v-else class="text-ink-muted">None</span>
              </th>
              <td>
                <span v-if="item.componentId">{{ item.componentName }}</span>
                <span v-else class="text-ink-muted">None</span>
              </td>
              <td>
                <UiChip :tone="RESULT_TONES[item.kind]">{{ RESULT_LABELS[item.kind] }}</UiChip>
                <span v-if="item.note" class="block mt-1 text-xs text-ink-muted">{{ item.note }}</span>
              </td>
              <td>
                <UiButton v-if="item.linked" size="sm" variant="ghost" icon="x" @click="setLink(item.componentId, null)">Unlink</UiButton>
                <div v-else-if="item.kind === 'missing-in-code' && unmatchedCode.length" class="flex items-center gap-2">
                  <UiSelect
                    v-model="linkTargets[item.designId]"
                    :options="unmatchedCode"
                    :label="`Library component for ${item.designName}`"
                    hide-label
                    size="sm"
                    placeholder="Choose a component"
                  />
                  <UiButton size="sm" icon="link" :disabled="!linkTargets[item.designId]" @click="setLink(linkTargets[item.designId], item.designId)">Link</UiButton>
                </div>
                <UiButton
                  v-else-if="item.kind === 'renamed' && item.componentId && item.designId"
                  size="sm"
                  variant="ghost"
                  icon="link"
                  @click="setLink(item.componentId, item.designId)"
                >
                  Confirm link
                </UiButton>
              </td>
            </tr>
          </tbody>
        </UiTable>
      </UiPanel>
    </PageSection>

    <PageSection v-if="historyFor" :title="`History: ${historyFor.name}`" divided>
      <UiEmptyState v-if="!history.length" title="No compares yet" body="Each compare, scheduled or by hand, is recorded here." :bordered="false" />
      <UiPanel v-else flush>
        <UiTable caption="Compares on this connection, newest first">
          <thead>
            <tr>
              <th scope="col">When</th>
              <th scope="col">Started by</th>
              <th scope="col">File version</th>
              <th scope="col">Result</th>
              <th scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in history" :key="entry.id">
              <th scope="row">{{ formatDate(entry.startedAt) }}</th>
              <td>{{ entry.trigger === 'scheduled' ? 'Schedule' : entry.startedBy.name }}</td>
              <td>{{ entry.fileVersion || 'Unknown' }}</td>
              <td>
                <span v-if="entry.status === 'failed'" class="text-danger">{{ entry.error }}</span>
                <span v-else class="text-ink-secondary">
                  {{ entry.counts.matched ?? 0 }} matched, {{ entry.counts.renamed ?? 0 }} renamed, {{ entry.counts['missing-in-code'] ?? 0 }} missing in code,
                  {{ entry.counts['missing-in-design'] ?? 0 }} missing in design
                </span>
              </td>
              <td>
                <UiButton v-if="entry.status !== 'failed'" size="sm" variant="ghost" @click="openRun(entry.id)">View</UiButton>
              </td>
            </tr>
          </tbody>
        </UiTable>
      </UiPanel>
    </PageSection>

    <!-- Design file -->
    <UiDialog
      :open="!!designFile"
      :title="designFile?.name || 'Design file'"
      size="lg"
      @update:open="(open) => !open && (designFile = null)"
    >
      <div v-if="designFile" class="space-y-6">
        <dl class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-ink-secondary">Version</dt>
            <dd class="font-medium text-ink-strong">{{ designFile.version || 'Unknown' }}</dd>
          </div>
          <div>
            <dt class="text-ink-secondary">Last modified</dt>
            <dd class="font-medium text-ink-strong">{{ formatDate(designFile.lastModified) }}</dd>
          </div>
          <div>
            <dt class="text-ink-secondary">Components</dt>
            <dd class="font-medium text-ink-strong">{{ designFile.components.length }}</dd>
          </div>
          <div>
            <dt class="text-ink-secondary">Tokens</dt>
            <dd class="font-medium text-ink-strong">{{ designFile.tokenCount }}</dd>
          </div>
        </dl>
        <UiCallout v-if="designFile.variables?.status === 'unavailable'" tone="warning" title="Figma variables weren't read">{{ designFile.variables.message }}</UiCallout>
        <section>
          <h3 class="mb-3 text-base font-semibold text-ink-strong">Components</h3>
          <p v-if="!designFile.components.length" class="text-sm text-ink-secondary">This file has no components.</p>
          <ul v-else class="space-y-3">
            <li v-for="component in designFile.components" :key="component.id" class="rounded-tile border border-line bg-surface-sunken p-4">
              <p class="font-semibold text-ink-strong">
                <UiLink v-if="component.url" :href="component.url" external>{{ component.name }}</UiLink>
                <span v-else>{{ component.name }}</span>
              </p>
              <p v-if="component.path" class="text-xs text-ink-muted">{{ component.path }}</p>
              <p class="text-sm text-ink-secondary">{{ component.description || 'No description' }}</p>
              <p v-if="component.variants.length" class="mt-1 text-xs text-ink-muted">Variants: {{ component.variants.join('; ') }}</p>
            </li>
          </ul>
        </section>
      </div>
    </UiDialog>

    <!-- Create / edit connection -->
    <UiDialog
      :open="connectionModalOpen"
      :title="editingConnection ? 'Edit connection' : 'New connection'"
      @update:open="(open) => !open && closeModal()"
    >
      <form id="design-sync-connection" class="space-y-5" @submit.prevent="saveConnection">
        <InlineNotice :notice="formNotice" @dismiss="clearFormNotice" />
        <UiInput v-model="connectionForm.name" label="Connection name" required placeholder="e.g., Product components" />
        <UiSelect v-model="connectionForm.tool" :options="toolOptions" label="Design tool" />
        <UiInput
          v-model="connectionForm.apiKey"
          type="password"
          :label="connectionForm.tool === 'figma' ? 'Figma personal access token' : 'Penpot access token'"
          autocomplete="off"
          hint="Read access is enough. Stored encrypted and never shown again."
          :placeholder="editingConnection?.hasApiKey ? 'Saved (leave blank to keep it)' : 'Paste the token'"
        />
        <UiInput
          v-model="connectionForm.fileId"
          :label="connectionForm.tool === 'figma' ? 'File key or URL' : 'File id or workspace URL'"
          required
          :placeholder="connectionForm.tool === 'figma' ? 'https://www.figma.com/design/…' : 'https://design.penpot.app/#/workspace?…&file-id=…'"
        />
        <UiInput
          v-if="connectionForm.tool === 'penpot'"
          v-model="connectionForm.fileUrl"
          type="url"
          label="Penpot instance (optional)"
          hint="For self-hosted Penpot. It must be reachable on the public internet: private addresses are refused."
          placeholder="https://penpot.example.com"
        />
        <UiCheckbox v-model="connectionForm.enabled" label="Enable connection" />
        <UiSwitch v-model="connectionForm.autoSync" label="Compare on a schedule" hint="Each scheduled compare is recorded in the history." />
        <UiSelect v-if="connectionForm.autoSync" v-model="connectionForm.syncIntervalHours" :options="intervalOptions" label="How often" />
      </form>
      <template #footer>
        <UiButton @click="closeModal">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="design-sync-connection">
          {{ editingConnection ? 'Update connection' : 'Create connection' }}
        </UiButton>
      </template>
    </UiDialog>

    <ConfirmDialog :state="confirmState" />
  </PageShell>
</template>

<script setup>
import { computed, ref, onMounted, reactive } from 'vue';
import apiClient from '../services/api.js';
import InlineNotice from '../components/InlineNotice.vue';
import ConfirmDialog from '../components/workspaces/ConfirmDialog.vue';
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
  UiLink,
  UiPanel,
  UiSelect,
  UiStat,
  UiSwitch,
  UiTable,
} from '../components/ui';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import { useNotice } from '../composables/useNotice.js';

const API = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/design-sync`;

const RESULT_LABELS = { matched: 'Matched', renamed: 'Renamed', 'missing-in-code': 'Missing in code', 'missing-in-design': 'Missing in design' };
const RESULT_TONES = { matched: 'success', renamed: 'accent', 'missing-in-code': 'warning', 'missing-in-design': 'warning' };

const errorMessage = (error, fallback) => {
  const message = error?.response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || fallback;
};

const { notice, showNotice, clearNotice } = useNotice();
// Errors from saving show inside the connection dialog
const { notice: formNotice, showNotice: showFormNotice, clearNotice: clearFormNotice } = useNotice();
const { confirmState, askConfirm } = useConfirmDialog();

const loadError = ref('');
const connections = ref([]);
const comparing = ref(new Set());
const report = ref(null);
const linkTargets = reactive({});
const historyFor = ref(null);
const history = ref([]);
const designFile = ref(null);
const showCreateModal = ref(false);
const editingConnection = ref(null);

const blankForm = () => ({ name: '', tool: 'figma', apiKey: '', fileId: '', fileUrl: '', enabled: true, autoSync: false, syncIntervalHours: 24 });
const connectionForm = reactive(blankForm());

const toolOptions = [
  { value: 'figma', label: 'Figma' },
  { value: 'penpot', label: 'Penpot' },
];
const intervalOptions = [
  { value: 6, label: 'Every 6 hours' },
  { value: 12, label: 'Every 12 hours' },
  { value: 24, label: 'Every day' },
  { value: 72, label: 'Every 3 days' },
  { value: 168, label: 'Every week' },
];

const formatDate = (value) => (value ? new Date(value).toLocaleString() : 'Unknown');
const toolLabel = (tool) => toolOptions.find((o) => o.value === tool)?.label ?? tool;
const intervalLabel = (hours = 24) => (hours === 24 ? 'day' : hours === 168 ? 'week' : `${hours} hours`);

const reportDescription = computed(() => {
  const r = report.value;
  if (!r) return '';
  const file = r.fileName ? `${r.fileName}${r.fileVersion ? ` (version ${r.fileVersion})` : ''}` : 'The design file';
  return `${file}, compared ${formatDate(r.startedAt)}${r.trigger === 'scheduled' ? ' on schedule' : ` by ${r.startedBy.name}`}.`;
});
/** Library components no design node matched: the candidates to link a design component to */
const unmatchedCode = computed(() =>
  (report.value?.componentItems ?? []).filter((i) => i.kind === 'missing-in-design').map((i) => ({ value: i.componentId, label: i.componentName })),
);

const showReport = (data) => {
  report.value = data;
  for (const key of Object.keys(linkTargets)) delete linkTargets[key];
};

const loadConnections = async () => {
  try {
    connections.value = (await apiClient.get(`${API}/connections`)).data || [];
    loadError.value = '';
  } catch (error) {
    connections.value = [];
    loadError.value = errorMessage(error, 'Failed to load connections.');
  }
};

const loadHistory = async (connection) => {
  try {
    history.value = (await apiClient.get(`${API}/connections/${connection.id}/runs`)).data ?? [];
  } catch (error) {
    history.value = [];
    showNotice(errorMessage(error, 'Failed to load the history.'), 'error');
  }
};

const showHistory = async (connection) => {
  historyFor.value = connection;
  await loadHistory(connection);
};

const compare = async (connection) => {
  comparing.value.add(connection.id);
  clearNotice();
  try {
    showReport((await apiClient.post(`${API}/connections/${connection.id}/sync`, {})).data);
    await loadConnections();
  } catch (error) {
    showNotice(errorMessage(error, 'Failed to compare the design file.'), 'error');
  } finally {
    comparing.value.delete(connection.id);
    if (historyFor.value?.id === connection.id) await loadHistory(connection);
  }
};

const openRun = async (runId) => {
  try {
    showReport((await apiClient.get(`${API}/runs/${runId}`)).data);
  } catch (error) {
    showNotice(errorMessage(error, 'Failed to load the comparison.'), 'error');
  }
};

const viewDesignFile = async (connection) => {
  clearNotice();
  try {
    designFile.value = (await apiClient.get(`${API}/connections/${connection.id}/file`)).data;
  } catch (error) {
    showNotice(errorMessage(error, 'Failed to read the design file.'), 'error');
  }
};

/** Links a library component to a design node (null unlinks), then compares again so the table shows it */
const setLink = async (componentId, designNodeId) => {
  const connection = connections.value.find((c) => c.id === report.value?.connectionId);
  if (!connection || !componentId) return;
  try {
    await apiClient.put(`${API}/connections/${connection.id}/links`, { componentId, designNodeId });
    showNotice(designNodeId ? 'Linked. Comparing again…' : 'Unlinked. Comparing again…', 'info');
    await compare(connection);
  } catch (error) {
    showNotice(errorMessage(error, 'Failed to save the link.'), 'error');
  }
};

const openCreate = () => {
  closeModal();
  showCreateModal.value = true;
};

const editConnection = (connection) => {
  editingConnection.value = connection;
  Object.assign(connectionForm, {
    name: connection.name,
    tool: connection.tool,
    // The saved token is never sent back; leaving this blank keeps it
    apiKey: '',
    fileId: connection.fileId,
    fileUrl: connection.fileUrl || '',
    enabled: connection.enabled,
    autoSync: !!connection.autoSync,
    syncIntervalHours: connection.syncIntervalHours ?? 24,
  });
  showCreateModal.value = true;
};

const deleteConnection = async (connection) => {
  const ok = await askConfirm({ title: `Delete ${connection.name}?`, message: 'Its saved token, links and compare history are deleted too.', confirmText: 'Delete', danger: true });
  if (!ok) return;
  try {
    await apiClient.delete(`${API}/connections/${connection.id}`);
    if (historyFor.value?.id === connection.id) historyFor.value = null;
    if (report.value?.connectionId === connection.id) report.value = null;
    await loadConnections();
  } catch (error) {
    showNotice(errorMessage(error, 'Failed to delete the connection.'), 'error');
  }
};

const saveConnection = async () => {
  clearFormNotice();
  try {
    const data = {
      name: connectionForm.name,
      tool: connectionForm.tool,
      fileId: connectionForm.fileId,
      fileUrl: connectionForm.tool === 'penpot' ? connectionForm.fileUrl || null : null,
      enabled: connectionForm.enabled,
      autoSync: connectionForm.autoSync,
      ...(connectionForm.autoSync ? { syncIntervalHours: Number(connectionForm.syncIntervalHours) } : {}),
    };
    // Blank keeps the saved token
    if (connectionForm.apiKey) data.apiKey = connectionForm.apiKey;
    if (editingConnection.value) await apiClient.put(`${API}/connections/${editingConnection.value.id}`, data);
    else await apiClient.post(`${API}/connections`, data);
    closeModal();
    await loadConnections();
  } catch (error) {
    showFormNotice(errorMessage(error, 'Failed to save the connection.'), 'error');
  }
};

const connectionModalOpen = computed(() => showCreateModal.value || !!editingConnection.value);

const closeModal = () => {
  showCreateModal.value = false;
  editingConnection.value = null;
  clearFormNotice();
  Object.assign(connectionForm, blankForm());
};

onMounted(loadConnections);
</script>
