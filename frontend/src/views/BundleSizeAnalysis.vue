<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/admin/performance', label: 'Performance analysis' }"
      title="Bundle size analysis"
      lead="Measure the actual file size of each component (Vue and React versions) including dependencies. Identify which components are largest and find opportunities to reduce bundle size."
      spot="admin/performance-analysis"
      size="tool"
    >
      <template #actions>
        <UiButton variant="primary" icon="refresh" :loading="loading" @click="loadAnalysis">Refresh analysis</UiButton>
      </template>
    </PageHero>

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <UiSpinner v-if="loading" label="Analyzing bundle sizes…" />

    <template v-if="analysis">
      <PageSection title="Summary">
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UiStat label="Total components" :value="analysis.summary.totalComponents" />
          <UiStat label="Total size" :value="formatSize(analysis.summary.totalSize)" />
          <UiStat label="Average size" :value="formatSize(analysis.summary.averageSize)" />
          <UiStat
            label="Largest component"
            :value="analysis.summary.largestComponent?.componentName"
            :hint="formatSize(analysis.summary.largestComponent?.totalSize)"
          />
        </div>
      </PageSection>

      <PageSection title="Component analysis" divided>
        <UiPanel flush>
          <UiTable caption="Bundle size per component">
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Vue size</th>
                <th scope="col">React size</th>
                <th scope="col">Total size</th>
                <th scope="col">Gzipped</th>
                <th scope="col">Status</th>
                <th scope="col"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="component in analysis.components" :key="component.componentId">
                <td class="whitespace-nowrap">
                  <div class="font-medium text-ink-strong">{{ component.componentName }}</div>
                  <div class="text-sm text-ink-muted">{{ component.componentId }}</div>
                </td>
                <td class="whitespace-nowrap">{{ formatSize(component.vueSize) }}</td>
                <td class="whitespace-nowrap">{{ formatSize(component.reactSize) }}</td>
                <td class="whitespace-nowrap">
                  <div class="font-semibold text-ink-strong">{{ formatSize(component.totalSize) }}</div>
                  <div class="text-xs text-ink-muted">+ {{ formatSize(component.dependenciesSize) }} deps</div>
                </td>
                <td class="whitespace-nowrap">{{ formatSize(component.gzippedSize) }}</td>
                <td class="whitespace-nowrap">
                  <UiChip :tone="statusTone(component.status)">{{ component.status }}</UiChip>
                </td>
                <td class="whitespace-nowrap">
                  <UiButton variant="ghost" size="sm" @click="analyzeComponent(component.componentId)">Analyze</UiButton>
                </td>
              </tr>
            </tbody>
          </UiTable>
        </UiPanel>
      </PageSection>
    </template>

    <UiDialog v-model:open="detailsOpen" :title="details ? details.componentName : 'Component'">
      <dl v-if="details" class="grid grid-cols-aside-content gap-x-6 gap-y-2 text-sm">
        <dt class="text-ink-muted">Total size</dt>
        <dd class="text-ink">{{ formatSize(details.totalSize) }}</dd>
        <dt class="text-ink-muted">With dependencies</dt>
        <dd class="text-ink">{{ formatSize(details.totalWithDeps) }}</dd>
        <dt class="text-ink-muted">Gzipped</dt>
        <dd class="text-ink">{{ formatSize(details.gzippedSize) }}</dd>
        <dt class="text-ink-muted">Dependencies</dt>
        <dd class="text-ink">{{ details.dependencies?.join(', ') || 'None' }}</dd>
      </dl>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiChip, UiDialog, UiPanel, UiSpinner, UiStat, UiTable } from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';

const analysis = ref(null);
const loading = ref(false);
const details = ref(null);
const detailsOpen = ref(false);
const { notice, showNotice, clearNotice } = useNotice();

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const statusTone = (status) => {
  if (status === 'error') return 'danger';
  if (status === 'warning') return 'warning';
  return 'success';
};

const loadAnalysis = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(`${API_BASE_URL}/performance/bundle-analysis`);
    analysis.value = response.data;
  } catch (error) {
    console.error('Error loading analysis:', error);
    showNotice('Error loading bundle analysis. Please try again.', 'error');
  } finally {
    loading.value = false;
  }
};

const analyzeComponent = async (componentId) => {
  try {
    const response = await apiClient.post(`${API_BASE_URL}/performance/bundle-analysis/analyze`, {
      componentId,
      includeDependencies: true,
    });
    details.value = response.data;
    detailsOpen.value = true;
  } catch (error) {
    console.error('Error analyzing component:', error);
    showNotice('Error analyzing component. Please try again.', 'error');
  }
};

onMounted(loadAnalysis);
</script>
