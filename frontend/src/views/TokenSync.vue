<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Design tokens"
      title="Design token sync"
      lead="Pull colours, typography, spacing, sizes and radii from a Figma or Penpot file, see how they differ from your tokens, and apply only the changes you choose."
      spot="foundations/token-sync"
    />

    <UiCallout tone="info" title="How a sync works" class="mb-4">
      <ul class="list-disc list-inside space-y-1">
        <li>Pull changes reads the design file and lists what's added, changed, removed or in conflict. Nothing changes until you apply.</li>
        <li>For each item, take the design value, keep the code value, or skip it for now. Applying needs the token create, edit or delete permission for the changes you pick.</li>
        <li>Figma variables need a full seat in a Figma Enterprise organization and a token with the file_variables:read scope. Without them, colour and text styles are still read.</li>
        <li>Adobe XD isn't supported: Adobe has discontinued the XD plugin and cloud document APIs.</li>
      </ul>
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
            <UiChip v-if="connection.tool === 'adobe-xd'" tone="warning">Not supported</UiChip>
            <UiChip v-else :tone="connection.enabled ? 'success' : 'neutral'">{{ connection.enabled ? 'Enabled' : 'Disabled' }}</UiChip>
          </template>
          <p v-if="connection.tool === 'adobe-xd'" class="text-sm text-ink-secondary">{{ XD_REASON }}</p>
          <dl v-else class="space-y-2 text-sm">
            <div class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">File</dt>
              <dd class="truncate text-ink">{{ connection.fileId || 'Not set' }}</dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">Access token</dt>
              <dd><UiChip :tone="connection.hasApiKey ? 'success' : 'warning'">{{ connection.hasApiKey ? 'Saved' : 'Missing' }}</UiChip></dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">Scheduled pull</dt>
              <dd>
                <UiChip :tone="connection.autoSync ? 'info' : 'neutral'">{{ connection.autoSync ? `Every ${intervalLabel(connection.syncIntervalHours)}` : 'Off' }}</UiChip>
              </dd>
            </div>
            <div class="flex items-center justify-between gap-2">
              <dt class="text-ink-secondary">Last applied</dt>
              <dd class="text-ink">{{ connection.lastSync ? formatDate(connection.lastSync) : 'Never' }}</dd>
            </div>
          </dl>
          <template #footer>
            <div class="flex flex-wrap items-center gap-2">
              <UiButton
                v-if="connection.tool !== 'adobe-xd'"
                size="sm"
                icon="refresh-cw"
                :loading="pulling.has(connection.id)"
                :disabled="pulling.has(connection.id) || !connection.enabled"
                @click="pull(connection)"
              >
                Pull changes
              </UiButton>
              <UiButton size="sm" variant="ghost" icon="history" @click="showHistory(connection)">History</UiButton>
              <UiButton v-if="connection.tool !== 'adobe-xd'" size="sm" variant="ghost" icon="pencil" @click="editConnection(connection)">Edit</UiButton>
              <UiButton size="sm" variant="ghost" icon="trash-2" icon-only :label="`Delete ${connection.name}`" @click="deleteConnection(connection)" />
            </div>
          </template>
        </UiPanel>
      </div>

      <UiEmptyState
        v-else
        title="No connections yet"
        body="Connect a Figma or Penpot file to pull its tokens."
        spot="foundations/token-sync"
      >
        <template #actions>
          <UiButton variant="primary" @click="openCreate">Create first connection</UiButton>
        </template>
      </UiEmptyState>
    </PageSection>

    <PageSection v-if="run" :title="runTitle" :description="runDescription" divided>
      <UiCallout v-if="run.variables?.status === 'unavailable'" tone="warning" title="Figma variables weren't read" role="status" class="mb-4">
        {{ run.variables.message }}
      </UiCallout>
      <UiCallout v-if="otherWarnings.length" tone="info" title="Notes from reading the file" class="mb-4">
        <ul class="list-disc list-inside space-y-1">
          <li v-for="(warning, index) in otherWarnings" :key="index">{{ warning }}</li>
        </ul>
      </UiCallout>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <UiStat label="Added" tone="success" :value="run.counts.added ?? 0" />
        <UiStat label="Changed" tone="accent" :value="run.counts.changed ?? 0" />
        <UiStat label="Removed" tone="warning" :value="run.counts.removed ?? 0" />
        <UiStat label="Conflicts" tone="danger" :value="run.counts.conflicts ?? 0" />
        <UiStat label="Unchanged" :value="run.counts.unchanged ?? 0" />
      </div>

      <UiEmptyState
        v-if="!run.tokenItems?.length"
        title="Up to date"
        body="Every token read from the design file already matches your tokens."
        :bordered="false"
      />

      <template v-else>
        <UiPanel flush>
          <UiTable caption="Differences between the design file and your tokens">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Difference</th>
                <th scope="col">In code</th>
                <th scope="col">In the design file</th>
                <th scope="col">{{ reviewable ? 'Choice' : 'Outcome' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in run.tokenItems" :key="item.id">
                <th scope="row">
                  <span class="font-code">{{ item.id }}</span>
                  <span v-if="item.designName" class="block text-xs font-normal text-ink-muted">{{ item.designName }}</span>
                </th>
                <td>
                  <UiChip :tone="KIND_TONES[item.kind]">{{ KIND_LABELS[item.kind] }}</UiChip>
                  <span class="block mt-1 text-xs text-ink-muted">{{ item.reason }}</span>
                </td>
                <td><TokenValue :value="item.codeValue" :type="item.type" /></td>
                <td><TokenValue :value="item.designValue" :type="item.type" /></td>
                <td>
                  <UiSegmented
                    v-if="reviewable"
                    v-model="choices[item.id]"
                    :options="choiceOptions(item)"
                    :aria-label="`What to do with ${item.id}`"
                  />
                  <template v-else-if="outcomeFor(item)">
                    <UiChip :tone="OUTCOME_TONES[outcomeFor(item).outcome]">{{ OUTCOME_LABELS[outcomeFor(item).outcome] }}</UiChip>
                    <span v-if="outcomeFor(item).error" class="block mt-1 text-xs text-danger">{{ outcomeFor(item).error }}</span>
                  </template>
                  <span v-else class="text-ink-muted">Not applied</span>
                </td>
              </tr>
            </tbody>
          </UiTable>
        </UiPanel>

        <div v-if="reviewable" class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-ink-secondary">{{ choiceSummary }}</p>
          <UiButton variant="primary" icon="check" :loading="applying" :disabled="applying" @click="apply">Apply choices</UiButton>
        </div>
        <UiCallout v-else-if="run.status === 'applying'" :tone="interrupted ? 'warning' : 'info'" :title="interrupted ? 'This apply stopped part-way' : 'Being applied'" role="status" class="mt-4">
          {{ interrupted
            ? `${run.claim?.by?.name ?? 'Someone'} started applying these changes, but it didn't finish. Finishing applies the remaining changes with the same choices; changes already written aren't written again.`
            : `${run.claim?.by?.name ?? 'Someone'} is applying these changes. Outcomes appear below as each is written.` }}
          <template v-if="interrupted" #actions>
            <UiButton variant="primary" size="sm" icon="check" :loading="applying" :disabled="applying" @click="apply">Finish applying</UiButton>
          </template>
        </UiCallout>
      </template>
    </PageSection>

    <PageSection v-if="historyFor" :title="`History: ${historyFor.name}`" divided>
      <UiEmptyState v-if="!history.length" title="No pulls yet" body="Each pull, scheduled or by hand, is recorded here with who applied what." :bordered="false" />
      <UiPanel v-else flush>
        <UiTable caption="Pulls from this connection, newest first">
          <thead>
            <tr>
              <th scope="col">When</th>
              <th scope="col">Started by</th>
              <th scope="col">Result</th>
              <th scope="col">Counts</th>
              <th scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in history" :key="entry.id">
              <th scope="row">{{ formatDate(entry.startedAt) }}</th>
              <td>{{ entry.trigger === 'scheduled' ? 'Schedule' : entry.startedBy.name }}</td>
              <td>
                <UiChip :tone="STATUS_TONES[entry.status]">{{ STATUS_LABELS[entry.status] }}</UiChip>
                <span v-if="entry.applied" class="block mt-1 text-xs text-ink-muted">Applied by {{ entry.applied.by.name }}, {{ formatDate(entry.applied.at) }}</span>
                <span v-if="entry.error" class="block mt-1 text-xs text-danger">{{ entry.error }}</span>
              </td>
              <td class="text-ink-secondary">{{ countsLabel(entry) }}</td>
              <td>
                <UiButton v-if="entry.status !== 'failed'" size="sm" variant="ghost" @click="openRun(entry.id)">
                  {{ entry.status === 'review' ? 'Review' : 'View' }}
                </UiButton>
              </td>
            </tr>
          </tbody>
        </UiTable>
      </UiPanel>
    </PageSection>

    <UiDialog
      :open="connectionModalOpen"
      :title="editingConnection ? 'Edit connection' : 'New connection'"
      @update:open="(open) => !open && closeModal()"
    >
      <form id="token-sync-connection" class="space-y-5" @submit.prevent="saveConnection">
        <InlineNotice :notice="formNotice" @dismiss="clearFormNotice" />
        <UiInput v-model="connectionForm.name" label="Connection name" required placeholder="e.g., Product design system" />
        <UiSelect v-model="connectionForm.tool" :options="toolOptions" label="Design tool" />
        <UiInput
          v-model="connectionForm.apiKey"
          type="password"
          :label="connectionForm.tool === 'figma' ? 'Figma personal access token' : 'Penpot access token'"
          autocomplete="off"
          :hint="tokenHint"
          :placeholder="editingConnection?.hasApiKey ? 'Saved (leave blank to keep it)' : 'Paste the token'"
        />
        <UiInput
          v-model="connectionForm.fileId"
          :label="connectionForm.tool === 'figma' ? 'File key or URL' : 'File id or workspace URL'"
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
        <UiSwitch
          v-model="connectionForm.autoSync"
          label="Pull on a schedule"
          hint="Scheduled pulls only prepare a diff for review here; nothing is applied until someone chooses."
        />
        <UiSelect v-if="connectionForm.autoSync" v-model="connectionForm.syncIntervalHours" :options="intervalOptions" label="How often" />
      </form>
      <template #footer>
        <UiButton @click="closeModal">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="token-sync-connection">
          {{ editingConnection ? 'Update connection' : 'Create connection' }}
        </UiButton>
      </template>
    </UiDialog>

    <ConfirmDialog :state="confirmState" />
  </PageShell>
</template>

<script setup>
import { computed, defineComponent, h, ref, onMounted, reactive } from 'vue';
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
  UiPanel,
  UiSegmented,
  UiSelect,
  UiStat,
  UiSwatch,
  UiSwitch,
  UiTable,
} from '../components/ui';
import { useConfirmDialog } from '../composables/useConfirmDialog.js';
import { useNotice } from '../composables/useNotice.js';

const API = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/token-sync`;
const XD_REASON = 'Adobe XD is not supported: Adobe has discontinued the XD plugin and cloud document APIs a sync would read from.';

const KIND_LABELS = { added: 'Added', changed: 'Changed', removed: 'Removed', conflict: 'Conflict' };
const KIND_TONES = { added: 'success', changed: 'accent', removed: 'warning', conflict: 'danger' };
const OUTCOME_LABELS = { created: 'Created', updated: 'Updated', deleted: 'Deleted', 'kept-code': 'Kept code', skipped: 'Skipped', failed: 'Failed' };
const OUTCOME_TONES = { created: 'success', updated: 'accent', deleted: 'warning', 'kept-code': 'neutral', skipped: 'neutral', failed: 'danger' };
const STATUS_LABELS = { review: 'Waiting for review', applying: 'Applying', applied: 'Applied', partial: 'Partly applied', failed: 'Failed', superseded: 'Replaced by a newer pull', compared: 'Compared' };
const STATUS_TONES = { review: 'info', applying: 'info', applied: 'success', partial: 'warning', failed: 'danger', superseded: 'neutral', compared: 'neutral' };

/** A token value, with a swatch when it is a colour */
const TokenValue = defineComponent({
  props: { value: { type: String, default: undefined }, type: { type: String, default: '' } },
  setup(props) {
    return () => {
      if (props.value === undefined) return h('span', { class: 'text-ink-muted' }, 'None');
      const isColor = props.type === 'color' && /^#[0-9a-f]{3,8}$/i.test(props.value);
      return h('span', { class: 'inline-flex items-center gap-2' }, [
        isColor ? h(UiSwatch, { color: props.value, size: 'sm', label: props.value }) : null,
        h('span', { class: 'font-code' }, props.value),
      ]);
    };
  },
});

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
const pulling = ref(new Set());
const run = ref(null);
const choices = reactive({});
const applying = ref(false);
const historyFor = ref(null);
const history = ref([]);
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

const tokenHint = computed(() =>
  connectionForm.tool === 'figma'
    ? 'Needs the file_content:read scope, and file_variables:read for variables. Stored encrypted and never shown again.'
    : 'Create one under Your account, Access tokens. Stored encrypted and never shown again.',
);

const formatDate = (value) => (value ? new Date(value).toLocaleString() : 'Never');
const toolLabel = (tool) => (tool === 'adobe-xd' ? 'Adobe XD' : toolOptions.find((o) => o.value === tool)?.label ?? tool);
const intervalLabel = (hours = 24) => (hours === 24 ? 'day' : hours === 168 ? 'week' : `${hours} hours`);

const reviewable = computed(() => run.value?.status === 'review');
const runTitle = computed(() => (reviewable.value ? 'Review changes' : 'Pull results'));
const runDescription = computed(() => {
  const r = run.value;
  if (!r) return '';
  const file = r.fileName ? `${r.fileName}${r.fileVersion ? ` (version ${r.fileVersion})` : ''}` : 'The design file';
  return `${file}, pulled ${formatDate(r.startedAt)}${r.trigger === 'scheduled' ? ' on schedule' : ` by ${r.startedBy.name}`}.`;
});
const otherWarnings = computed(() => (run.value?.warnings ?? []).filter((w) => w !== run.value?.variables?.message));

const choiceOptions = (item) => [
  { value: 'take-design', label: item.kind === 'removed' ? 'Delete' : 'Take design' },
  ...(item.kind === 'added' ? [] : [{ value: 'keep-code', label: 'Keep code' }]),
  { value: 'skip', label: 'Skip' },
];
const choiceSummary = computed(() => {
  const items = run.value?.tokenItems ?? [];
  const writes = items.filter((i) => choices[i.id] === 'take-design').length;
  return `${writes} of ${items.length} change${items.length === 1 ? '' : 's'} will be written. Removals and conflicts are skipped unless you choose otherwise.`;
});
const outcomeFor = (item) => (run.value?.applied?.results ?? run.value?.progress)?.find((r) => r.id === item.id);
// An apply whose claim lapsed (the server stopped mid-apply) can be finished by applying again
const interrupted = computed(() => run.value?.status === 'applying' && Date.parse(run.value.claim?.expiresAt ?? 0) <= Date.now());
const countsLabel = (entry) => {
  const c = entry.counts ?? {};
  if (entry.status === 'failed') return '';
  return `${c.added ?? 0} added, ${c.changed ?? 0} changed, ${c.removed ?? 0} removed, ${c.conflicts ?? 0} conflicts`;
};

const showRun = (data) => {
  run.value = data;
  for (const key of Object.keys(choices)) delete choices[key];
  for (const item of data.tokenItems ?? []) choices[item.id] = item.defaultChoice;
};

const loadConnections = async () => {
  try {
    const response = await apiClient.get(`${API}/connections`);
    connections.value = response.data || [];
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

const pull = async (connection) => {
  pulling.value.add(connection.id);
  clearNotice();
  try {
    showRun((await apiClient.post(`${API}/connections/${connection.id}/sync`, {})).data);
  } catch (error) {
    showNotice(errorMessage(error, 'Failed to pull the design file.'), 'error');
  } finally {
    pulling.value.delete(connection.id);
    if (historyFor.value?.id === connection.id) await loadHistory(connection);
  }
};

const openRun = async (runId) => {
  try {
    showRun((await apiClient.get(`${API}/runs/${runId}`)).data);
  } catch (error) {
    showNotice(errorMessage(error, 'Failed to load the pull.'), 'error');
  }
};

const apply = async () => {
  applying.value = true;
  try {
    const body = run.value.status === 'applying' ? {} : { choices: { ...choices } };
    const response = await apiClient.post(`${API}/runs/${run.value.id}/apply`, body);
    run.value = { ...run.value, ...response.data };
    const failed = response.data.applied?.counts?.failed ?? 0;
    showNotice(failed ? `Applied, but ${failed} change(s) failed: see the outcomes below.` : 'Your choices were applied.', failed ? 'warning' : 'success');
    await loadConnections();
    if (historyFor.value) await loadHistory(historyFor.value);
  } catch (error) {
    showNotice(errorMessage(error, 'Failed to apply the changes.'), 'error');
  } finally {
    applying.value = false;
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
    fileId: connection.fileId || '',
    fileUrl: connection.fileUrl || '',
    enabled: connection.enabled,
    autoSync: !!connection.autoSync,
    syncIntervalHours: connection.syncIntervalHours ?? 24,
  });
  showCreateModal.value = true;
};

const deleteConnection = async (connection) => {
  const ok = await askConfirm({ title: `Delete ${connection.name}?`, message: 'Its saved token and pull history are deleted too. Your tokens are not changed.', confirmText: 'Delete', danger: true });
  if (!ok) return;
  try {
    await apiClient.delete(`${API}/connections/${connection.id}`);
    if (historyFor.value?.id === connection.id) historyFor.value = null;
    if (run.value?.connectionId === connection.id) run.value = null;
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
      fileId: connectionForm.fileId || null,
      fileUrl: connectionForm.tool === 'penpot' ? connectionForm.fileUrl || null : null,
      enabled: connectionForm.enabled,
      autoSync: connectionForm.autoSync,
      ...(connectionForm.autoSync ? { syncIntervalHours: Number(connectionForm.syncIntervalHours) } : {}),
    };
    // Blank keeps the saved token
    if (connectionForm.apiKey) data.apiKey = connectionForm.apiKey;
    if (editingConnection.value) await apiClient.put(`${API}/connections/${editingConnection.value.id}`, data);
    else await apiClient.post(`${API}/connections`, { ...data, mappings: [] });
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
