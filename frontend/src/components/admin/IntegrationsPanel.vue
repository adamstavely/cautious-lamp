<template>
  <UiPanel title="Integrations" description="The external tools and services features rely on, and what each still needs." flush>
    <template #actions>
      <UiButton size="sm" icon="sync" :loading="loading" @click="load(true)">
        {{ loading ? 'Checking…' : 'Check connections' }}
      </UiButton>
    </template>

    <p v-if="report" class="px-6 pt-4 text-sm text-ink-secondary">
      {{ report.connectionsChecked ? 'Argos and OpenReplay were contacted' : 'Setup only; Argos and OpenReplay were not contacted' }}
      ({{ checkedAtLabel }}).
    </p>

    <div v-if="error" class="p-6">
      <UiCallout tone="danger" role="alert">{{ error }}</UiCallout>
    </div>

    <ul v-else-if="report" class="divide-y divide-line-faint">
      <li v-for="item in items" :key="item.key" class="p-6 flex gap-4">
        <span
          class="material-symbols-outlined shrink-0"
          :class="stateStyle(item.status.state).icon"
          :aria-label="stateStyle(item.status.state).label"
          role="img"
        >{{ stateStyle(item.status.state).symbol }}</span>
        <div class="min-w-0">
          <div class="flex flex-wrap items-baseline gap-x-3">
            <span class="font-medium text-ink-strong">{{ item.label }}</span>
            <span class="text-xs text-ink-muted">{{ item.feature }}</span>
          </div>
          <p class="text-sm mt-1 text-ink">{{ item.status.summary }}</p>
          <p v-if="item.status.action" class="text-sm mt-1 text-warning">{{ item.status.action }}</p>
          <ul v-if="item.status.details?.unreachable?.length" class="text-sm mt-2 list-disc pl-5 text-ink-secondary">
            <li v-for="p in item.status.details.unreachable" :key="p.projectId">{{ p.name }}: {{ p.error }}</li>
          </ul>
        </div>
      </li>
    </ul>

    <div v-else class="p-6"><UiSpinner /></div>
  </UiPanel>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import apiClient from '../../services/api.js';
import { UiButton, UiCallout, UiPanel, UiSpinner } from '../ui';

const LABELS = [
  { key: 'elasticsearch', label: 'Elasticsearch', feature: 'Storage for everything' },
  { key: 'iris', label: 'IRIS', feature: 'Photosensitivity analysis' },
  { key: 'chromium', label: 'Chromium', feature: 'URL accessibility scans, design extraction' },
  { key: 'argos', label: 'Argos', feature: 'Visual regression' },
  { key: 'openreplay', label: 'OpenReplay', feature: 'Session replay' },
  { key: 'altText', label: 'Claude API', feature: 'Alt text generation' },
];

const report = ref(null);
const loading = ref(false);
const error = ref('');

const items = computed(() =>
  LABELS.filter((l) => report.value?.integrations?.[l.key]).map((l) => ({ ...l, status: report.value.integrations[l.key] })),
);
const checkedAtLabel = computed(() => (report.value ? new Date(report.value.checkedAt).toLocaleTimeString() : ''));

const stateStyle = (state) =>
  ({
    ok: { symbol: 'check_circle', icon: 'text-success', label: 'Working' },
    not_configured: { symbol: 'settings', icon: 'text-warning', label: 'Not set up' },
    unreachable: { symbol: 'error', icon: 'text-danger', label: 'Not answering' },
  })[state] ?? { symbol: 'help', icon: 'text-ink-muted', label: 'Unknown' };

const load = async (check = false) => {
  loading.value = true;
  error.value = '';
  try {
    report.value = (await apiClient.get(`/api/v1/integrations/status${check ? '?check=true' : ''}`)).data;
  } catch (err) {
    error.value = err.response?.data?.message || 'The integration status could not be loaded.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => load(false));
</script>
