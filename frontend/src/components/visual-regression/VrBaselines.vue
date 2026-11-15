<template>
  <div class="space-y-6">
    <UiPanel
      title="Record a baseline"
      heading-tag="h3"
      description="A baseline fixes the build later uploads are compared against. Recording one makes it current; earlier ones are kept, so you can roll back."
    >
      <form v-if="runOptions.length" id="vr-new-baseline" class="grid gap-4 md:grid-cols-2" @submit.prevent="record">
        <UiSelect v-model="draft.runId" id="baseline-run" label="Build" :options="runOptions" required />
        <UiInput v-model="draft.name" label="Name" required placeholder="Release 2.4" maxlength="200" />
        <div class="md:col-span-2">
          <UiTextarea v-model="draft.description" label="Description" :rows="2" />
        </div>
      </form>
      <p v-else class="text-sm text-ink-secondary">Finished builds with a commit can be recorded as baselines. None has been read from Argos yet.</p>
      <template v-if="runOptions.length" #footer>
        <div class="flex justify-end">
          <UiButton variant="primary" type="submit" form="vr-new-baseline" :loading="busy">Record baseline</UiButton>
        </div>
      </template>
    </UiPanel>

    <InlineNotice :notice="notice" @dismiss="clearNotice" />

    <UiSpinner v-if="loading" label="Loading baselines…" class="py-8" />
    <UiEmptyState
      v-else-if="baselines.length === 0"
      title="No baselines yet"
      body="Until one is recorded, builds are compared against the latest approved build on the project's branch."
      spot="admin/visual-regression"
    />
    <UiPanel v-else flush>
      <UiTable caption="Baseline versions, newest first">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Build</th>
            <th scope="col">Commit</th>
            <th scope="col">Recorded</th>
            <th scope="col"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="baseline in baselines" :key="baseline.id">
            <td>
              <span class="font-medium text-ink">{{ baseline.name }}</span>
              <UiChip v-if="baseline.current" tone="success" class="ml-2">Current</UiChip>
              <p v-if="baseline.description" class="text-xs text-ink-secondary">{{ baseline.description }}</p>
            </td>
            <td>{{ baseline.argosBuildNumber !== undefined ? `#${baseline.argosBuildNumber}` : '—' }}</td>
            <td class="font-code">{{ baseline.commitSha ? baseline.commitSha.slice(0, 7) : '—' }}</td>
            <td class="whitespace-nowrap">{{ formatDateTime(baseline.createdAt) }}</td>
            <td class="text-right">
              <UiButton v-if="!baseline.current" size="sm" icon="rotate-ccw" :disabled="busy" @click="rollback(baseline)">
                Roll back<span class="sr-only"> to {{ baseline.name }}</span>
              </UiButton>
            </td>
          </tr>
        </tbody>
      </UiTable>
    </UiPanel>

    <UiPanel v-if="history.length" title="Baseline history" heading-tag="h3">
      <ol class="space-y-2 text-sm">
        <li v-for="(event, index) in history" :key="index" class="flex flex-wrap gap-x-2">
          <span class="text-ink-secondary whitespace-nowrap">{{ formatDateTime(event.at) }}</span>
          <span class="text-ink">{{ describe(event) }}</span>
        </li>
      </ol>
    </UiPanel>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import InlineNotice from '../InlineNotice.vue';
import { UiButton, UiChip, UiEmptyState, UiInput, UiPanel, UiSelect, UiSpinner, UiTable, UiTextarea } from '../ui';
import { useNotice } from '../../composables/useNotice.js';
import apiClient from '../../services/api.js';
import { formatDateTime, vrErrorMessage } from './vrApi.js';

const props = defineProps({
  projectPath: { type: String, required: true },
  /** The project's runs, for choosing a build */
  runs: { type: Array, default: () => [] },
});
const emit = defineEmits(['changed']);

const { notice, showNotice, clearNotice } = useNotice();
const baselines = ref([]);
const history = ref([]);
const loading = ref(false);
const busy = ref(false);
const draft = ref({ runId: '', name: '', description: '' });

const runOptions = computed(() =>
  props.runs
    .filter((run) => run.status === 'completed' && run.commitSha)
    .map((run) => ({
      value: run.id,
      label: `${run.argosBuildNumber !== undefined ? `Build #${run.argosBuildNumber}` : run.id} · ${run.branch ?? ''} ${run.commitSha.slice(0, 7)}`.trim(),
    }))
);

const nameOf = (id) => baselines.value.find((b) => b.id === id)?.name ?? 'a removed baseline';
const describe = (event) =>
  event.action === 'created'
    ? `Recorded “${nameOf(event.baselineId)}”`
    : `Rolled back to “${nameOf(event.baselineId)}”${event.previousBaselineId ? ` from “${nameOf(event.previousBaselineId)}”` : ''}`;

const load = async () => {
  loading.value = true;
  try {
    const [list, events] = await Promise.all([
      apiClient.get(`${props.projectPath}/baselines`),
      apiClient.get(`${props.projectPath}/baselines/history`),
    ]);
    baselines.value = list.data ?? [];
    history.value = events.data ?? [];
  } catch (error) {
    showNotice(vrErrorMessage(error, 'Baselines could not be loaded.'), 'error');
  } finally {
    loading.value = false;
  }
};

const record = async () => {
  if (!draft.value.runId || !draft.value.name.trim()) {
    showNotice('Choose a build and name the baseline.', 'error');
    return;
  }
  busy.value = true;
  clearNotice();
  try {
    await apiClient.post(`${props.projectPath}/baselines`, {
      runId: draft.value.runId,
      name: draft.value.name.trim(),
      ...(draft.value.description.trim() ? { description: draft.value.description.trim() } : {}),
    });
    draft.value = { runId: '', name: '', description: '' };
    showNotice('Baseline recorded. Uploads now compare against it.', 'success');
    await load();
    emit('changed');
  } catch (error) {
    showNotice(vrErrorMessage(error, 'The baseline could not be recorded.'), 'error');
  } finally {
    busy.value = false;
  }
};

const rollback = async (baseline) => {
  if (!window.confirm(`Roll back to “${baseline.name}”? Later uploads will be compared against its commit. Newer baselines are kept.`)) return;
  busy.value = true;
  clearNotice();
  try {
    await apiClient.post(`${props.projectPath}/baselines/${encodeURIComponent(baseline.id)}/rollback`);
    showNotice(`“${baseline.name}” is the current baseline again.`, 'success');
    await load();
    emit('changed');
  } catch (error) {
    showNotice(vrErrorMessage(error, 'The rollback failed.'), 'error');
  } finally {
    busy.value = false;
  }
};

watch(() => props.projectPath, load);
onMounted(load);
</script>
