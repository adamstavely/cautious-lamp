<template>
  <PageShell width="wide">
    <PageHero
      :back="{ to: '/admin', label: 'Admin' }"
      title="Performance analysis"
      lead="Analyze component bundle sizes and set performance budgets to monitor and prevent regressions. Measure what's large, then set limits to keep your design system fast."
      spot="admin/performance-analysis"
      size="tool"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <UiTabs v-model="activeTab" :tabs="tabs" label="Performance analysis views">
      <template #bundle>
        <UiSpinner v-if="loading" label="Analyzing bundle sizes…" />

        <template v-if="analysis">
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <UiStat icon="blocks" label="Total components" :value="analysis.summary.totalComponents" />
            <UiStat icon="hard-drive" label="Total size" :value="formatSize(analysis.summary.totalSize)" />
            <UiStat icon="calculator" label="Average size" :value="formatSize(analysis.summary.averageSize)" />
            <UiStat
              icon="chevron-down"
              label="Largest component"
              :value="analysis.summary.largestComponent?.componentName"
              :hint="formatSize(analysis.summary.largestComponent?.totalSize)"
            />
          </div>

          <UiPanel title="Component analysis" flush>
            <template #actions>
              <UiButton variant="primary" size="sm" icon="refresh-cw" :loading="loading" @click="loadAnalysis">Refresh</UiButton>
            </template>
            <UiEmptyState
              v-if="!analysis.components || analysis.components.length === 0"
              title="No components found"
              body="Component analysis data will appear here once components are available."
              :bordered="false"
            />
            <UiTable v-else caption="Bundle size per component">
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
                    <UiLink :to="getComponentRoute(component.componentId)">{{ component.componentName }}</UiLink>
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
                    <UiButton variant="ghost" size="sm" @click="analyzeComponent(component.componentId)">Analyze<span class="sr-only"> {{ component.componentName }}</span></UiButton>
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>
        </template>
      </template>

      <template #budgets>
        <UiCallout title="What are performance budgets?" class="mb-6">
          <p>
            A performance budget sets a limit on a size the bundle analysis measures: the raw, gzip or brotli size of the components' source, or the largest single component. Each budget is compared with the latest analysis, and its status is shown here: within budget, warning (over the warning threshold) or exceeded. Nothing is sent anywhere when a budget is exceeded.
          </p>
          <ul class="grid md:grid-cols-2 gap-3 mt-4">
            <li v-for="benefit in budgetBenefits" :key="benefit.title" class="flex items-start gap-2">
              <AppIcon name="circle-check" class="text-lg text-success" />
              <span>
                <span class="block font-medium text-ink-strong">{{ benefit.title }}</span>
                <span class="block text-xs text-ink-secondary">{{ benefit.body }}</span>
              </span>
            </li>
          </ul>
        </UiCallout>

        <div class="flex justify-end mb-6">
          <UiButton ref="createBudgetButton" variant="primary" icon="plus" @click="showCreateModal = true">Create budget</UiButton>
        </div>

        <div v-if="budgets.length" ref="budgetList" class="grid gap-4">
          <UiPanel v-for="item in budgetViews" :key="item.budget.id" :title="item.budget.name" heading-tag="h3">
            <template #actions>
              <UiChip :tone="item.budget.enabled ? 'success' : 'neutral'">{{ item.budget.enabled ? 'Active' : 'Disabled' }}</UiChip>
              <UiButton variant="ghost" size="sm" icon="pencil" icon-only :label="`Edit ${item.budget.name}`" @click="editBudget(item.budget)" />
              <UiButton variant="ghost" size="sm" icon="trash-2" icon-only :label="`Delete ${item.budget.name}`" data-focus-after-remove @click="deleteBudget(item.budget.id)" />
            </template>

            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-medium text-ink">{{ metricLabel(item.budget.metric) }}</span>
              <UiCode>{{ item.budget.metric }}</UiCode>
            </div>
            <p class="text-sm text-ink-secondary">
              <span class="font-medium">Limit:</span> {{ item.budget.threshold }}{{ item.budget.unit }}
              <span v-if="hasWarning(item.budget)" class="ml-2">
                • <span class="font-medium">Warning:</span> {{ item.budget.alertThreshold }}{{ item.budget.unit }}
              </span>
            </p>

            <div v-if="item.measured" class="mt-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-ink">
                  Measured
                  <span v-if="item.status.subject" class="font-normal text-ink-secondary">({{ item.status.subject }})</span>
                </span>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-semibold" :class="statusText[item.state.tone]">{{ item.status.value }}{{ item.budget.unit }}</span>
                  <UiChip :tone="item.state.tone">{{ item.state.label }}</UiChip>
                </div>
              </div>
              <UiMeter
                :value="Math.min(item.status.value, item.budget.threshold)"
                :max="item.budget.threshold"
                :tone="item.state.tone"
                :marker="hasWarning(item.budget) ? Number(item.budget.alertThreshold) : null"
                :marker-label="`Warning threshold: ${item.budget.alertThreshold}${item.budget.unit}`"
                :label="`${item.budget.name}: measured value against the limit`"
                :value-text="`${item.status.value}${item.budget.unit} of ${item.budget.threshold}${item.budget.unit}`"
              />
              <div class="mt-3 pt-3 border-t border-line-faint flex items-center justify-between text-xs text-ink-secondary">
                <span>{{ item.status.percent }}% of budget used</span>
                <span v-if="item.status.remaining >= 0">{{ item.status.remaining }}{{ item.budget.unit }} remaining</span>
                <span v-else class="text-danger font-medium">Exceeded by {{ Math.abs(item.status.remaining) }}{{ item.budget.unit }}</span>
              </div>
            </div>
            <div v-else class="mt-4 flex flex-wrap items-center gap-3">
              <UiChip :tone="item.state.tone">{{ item.state.label }}</UiChip>
              <span class="text-sm text-ink-secondary">{{ item.status.reason }}</span>
            </div>
          </UiPanel>
        </div>

        <UiEmptyState
          v-else
          title="No performance budgets yet"
          body="Create your first performance budget to start monitoring your design system's performance."
          spot="admin/performance-analysis"
        >
          <template #actions>
            <UiButton variant="primary" @click="showCreateModal = true">Create budget</UiButton>
          </template>
        </UiEmptyState>
      </template>
    </UiTabs>

    <!-- Create/Edit Budget Modal -->
    <UiDialog v-model:open="budgetModalOpen" :title="editingBudget ? 'Edit budget' : 'Create performance budget'">
      <form id="performance-budget-form" class="space-y-4" @submit.prevent="saveBudget">
        <UiCallout v-if="saveError" tone="danger" role="alert">{{ saveError }}</UiCallout>
        <UiInput v-model="budgetForm.name" label="Budget name" required placeholder="e.g., Bundle Size Budget" />
        <UiSelect
          v-model="budgetForm.metric"
          label="Metric"
          required
          :hint="getMetricDescription(budgetForm.metric)"
          :options="metricOptions"
        />
        <div class="grid grid-cols-2 gap-4">
          <UiInput
            v-model="budgetForm.threshold"
            type="number"
            label="Limit"
            required
            min="0"
            step="0.01"
            :placeholder="String(getSuggestedThreshold(budgetForm.metric))"
            :hint="`Suggested: ${getSuggestedThreshold(budgetForm.metric)}${getSuggestedUnit(budgetForm.metric)}`"
          />
          <UiSelect v-model="budgetForm.unit" label="Unit" required :options="unitOptions" />
        </div>
        <UiInput
          v-model="budgetForm.alertThreshold"
          type="number"
          label="Warning threshold (optional)"
          min="0"
          step="0.01"
          placeholder="Leave empty for no warning"
          hint="Above this value the budget's status on this page turns to Warning. Keep it below the limit."
        />
      </form>
      <template #footer>
        <UiButton @click="closeModal">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="performance-budget-form">{{ editingBudget ? 'Update budget' : 'Create budget' }}</UiButton>
      </template>
    </UiDialog>

    <!-- Component Analysis Modal -->
    <UiDialog v-model:open="analysisModalOpen" :title="selectedComponent ? selectedComponent.componentName : 'Component'" size="lg">
      <div v-if="selectedComponent" class="space-y-6">
        <p class="flex items-center gap-2 text-sm text-ink-secondary">
          <AppIcon :name="getComponentIcon(selectedComponent.componentId)" class="text-xl text-accent-text" />
          Detailed bundle analysis
        </p>

        <section>
          <h3 class="text-lg font-semibold text-ink-strong mb-4">Size breakdown</h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="relative w-48 h-48 mx-auto">
                <svg viewBox="0 0 200 200" class="w-full h-full -rotate-90" role="img" :aria-label="`Size breakdown: ${breakdownSummary}`">
                  <circle cx="100" cy="100" r="80" fill="none" class="stroke-chart-neutral opacity-30" stroke-width="40" />
                  <circle
                    v-for="slice in breakdownSlices"
                    :key="slice.key"
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    :class="slice.stroke"
                    stroke-width="40"
                    :stroke-dasharray="`${slice.length} ${CIRCUMFERENCE}`"
                    :stroke-dashoffset="-slice.offset"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center text-center">
                  <div>
                    <div class="text-2xl font-bold text-ink-strong">{{ formatSize(selectedComponent.totalWithDeps) }}</div>
                    <div class="text-xs text-ink-secondary">Total with deps</div>
                  </div>
                </div>
              </div>
              <ul class="space-y-2 text-sm">
                <li v-for="slice in breakdownSlices" :key="slice.key" class="flex items-center gap-2 text-ink">
                  <span class="w-4 h-4 rounded-control" :class="slice.swatch" aria-hidden="true"></span>
                  {{ slice.label }}: {{ formatSize(slice.size) }}
                </li>
              </ul>
            </div>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <UiStat label="Component only" :value="formatSize(selectedComponent.totalSize)" />
                <UiStat label="With dependencies" :value="formatSize(selectedComponent.totalWithDeps)" />
                <UiStat label="Gzipped" :value="formatSize(selectedComponent.gzippedSize)" />
                <UiStat label="Compression ratio" :value="`${Math.round((selectedComponent.gzippedSize / selectedComponent.totalSize) * 100)}%`" />
              </div>
              <UiStat
                v-if="getComponentPercentile(selectedComponent.totalSize)"
                label="Size percentile"
                :value="`${getComponentPercentile(selectedComponent.totalSize)}th percentile`"
                :hint="`Larger than ${getComponentPercentile(selectedComponent.totalSize)}% of components`"
              />
            </div>
          </div>
        </section>

        <section>
          <template v-if="selectedComponent.dependencies && selectedComponent.dependencies.length > 0">
            <h3 class="text-lg font-semibold text-ink-strong mb-4">Dependencies ({{ selectedComponent.dependencies.length }})</h3>
            <div class="flex flex-wrap gap-2">
              <UiChip v-for="depId in selectedComponent.dependencies" :key="depId">{{ depId }}</UiChip>
            </div>
          </template>
          <template v-else>
            <h3 class="text-lg font-semibold text-ink-strong mb-4">Dependencies</h3>
            <p class="text-sm text-ink-secondary">No dependencies</p>
          </template>
        </section>

        <section>
          <h3 class="text-lg font-semibold text-ink-strong mb-4">Optimization suggestions</h3>
          <div class="space-y-3">
            <UiCallout
              v-for="(suggestion, index) in getOptimizationSuggestions(selectedComponent)"
              :key="index"
              :tone="suggestionTone[suggestion.type]"
              :title="suggestion.title"
            >
              {{ suggestion.description }}
            </UiCallout>
          </div>
        </section>
      </div>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { confirmDialog } from '../composables/useConfirm.js';
import { nextTick, ref, computed, onMounted, watch } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiCode,
  UiDialog,
  UiEmptyState,
  UiInput,
  UiLink,
  UiPanel,
  UiSelect,
  UiSpinner,
  UiStat,
  UiTable,
  UiTabs,
} from '../components/ui';
import UiMeter from '../components/ui/UiMeter.vue';
import { useNotice } from '../composables/useNotice.js';
import { focusAfterRemoval } from '../utils/focusAfterRemoval.js';
import apiClient from '../services/api.js';
import { componentMetadataService } from '../services/componentMetadataService.js';
import { BUDGET_STATES, MEASURED_METRICS, compareBudget, metricLabel } from '../utils/performanceBudgets.js';

const { notice, showNotice, clearNotice } = useNotice();
const activeTab = ref('bundle');
const tabs = [
  { value: 'bundle', label: 'Bundle analysis' },
  { value: 'budgets', label: 'Performance budgets' },
];

// Bundle Analysis
const analysis = ref(null);
const loading = ref(false);

// Performance Budgets
const budgets = ref([]);
const showCreateModal = ref(false);
const editingBudget = ref(null);
const budgetList = ref(null);
const createBudgetButton = ref(null);

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

const emptyForm = () => ({
  name: '',
  metric: 'bundle-size',
  threshold: 100,
  unit: 'KB',
  alertThreshold: null,
});
const budgetForm = ref(emptyForm());

// Only metrics the bundle analysis measures; budgets are compared with its numbers
const metricOptions = Object.entries(MEASURED_METRICS).map(([value, metric]) => ({ value, label: metric.label }));
const unitOptions = [
  { value: 'B', label: 'Bytes (B)' },
  { value: 'KB', label: 'Kilobytes (KB)' },
  { value: 'MB', label: 'Megabytes (MB)' },
];

const budgetBenefits = [
  { title: 'Prevent regressions', body: 'See when the components grow past the size you agreed on' },
  { title: 'Set clear goals', body: 'Define acceptable size limits for your team' },
  { title: 'Measured, not estimated', body: 'Each budget is compared with the latest bundle analysis' },
  { title: 'Status on this page', body: 'Within budget, warning or exceeded, shown on each budget' },
];

const statusText = { danger: 'text-danger', warning: 'text-warning', success: 'text-success', neutral: 'text-ink' };
const suggestionTone = { error: 'danger', warning: 'warning', info: 'info', success: 'success' };

const budgetModalOpen = computed({
  get: () => showCreateModal.value || !!editingBudget.value,
  set: (open) => {
    if (!open) closeModal();
  },
});

// Shown inside the budget dialog (the page behind it is inert); each opening starts without it
const saveError = ref('');
watch(budgetModalOpen, (open) => {
  if (open) saveError.value = '';
});

// Bundle Analysis Functions
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

// Component pages that exist; every other component links to the component library
const COMPONENT_ROUTES = { button: '/components/buttons', 'color-picker': '/components/color-picker' };
const getComponentRoute = (componentId) => COMPONENT_ROUTES[componentId] ?? '/components';

const loadAnalysis = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(`${API_BASE_URL}/performance/bundle-analysis`);
    // Ensure response data has the expected structure
    if (response.data && response.data.components && Array.isArray(response.data.components)) {
      analysis.value = response.data;
    } else {
      console.error('Invalid response structure:', response.data);
      analysis.value = null;
      showNotice('Received invalid data from server. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Error loading analysis:', error);
    // Clear any stale data on error
    analysis.value = null;
    showNotice('Error loading bundle analysis. Please try again.', 'error');
  } finally {
    loading.value = false;
  }
};

const selectedComponent = ref(null);
const showAnalysisModal = ref(false);

const analyzeComponent = async (componentId) => {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/performance/bundle-analysis/analyze`,
      { componentId, includeDependencies: true }
    );
    
    selectedComponent.value = response.data;
    showAnalysisModal.value = true;
  } catch (error) {
    console.error('Error analyzing component:', error);
    showNotice('Error analyzing component. Please try again.', 'error');
  }
};

const closeAnalysisModal = () => {
  showAnalysisModal.value = false;
  selectedComponent.value = null;
};

const analysisModalOpen = computed({
  get: () => showAnalysisModal.value && !!selectedComponent.value,
  set: (open) => {
    if (!open) closeAnalysisModal();
  },
});

// Donut chart of the selected component's size: Vue, React, dependencies
const CIRCUMFERENCE = 502.4;
const breakdownSlices = computed(() => {
  const c = selectedComponent.value;
  if (!c || !c.totalWithDeps) return [];
  const parts = [
    { key: 'vue', label: 'Vue', size: c.vueSize, stroke: 'stroke-chart-1', swatch: 'bg-chart-1' },
    { key: 'react', label: 'React', size: c.reactSize, stroke: 'stroke-chart-2', swatch: 'bg-chart-2' },
    { key: 'deps', label: 'Dependencies', size: c.dependenciesSize, stroke: 'stroke-chart-3', swatch: 'bg-chart-3' },
  ];
  let offset = 0;
  return parts.map((part) => {
    const length = ((part.size || 0) / c.totalWithDeps) * CIRCUMFERENCE;
    const slice = { ...part, length, offset };
    offset += length;
    return slice;
  });
});
const breakdownSummary = computed(() => breakdownSlices.value.map((s) => `${s.label} ${formatSize(s.size)}`).join(', '));

const getComponentIcon = (componentId) => {
  if (!componentId) return 'blocks';
  const metadata = componentMetadataService.getComponentMetadata(componentId);
  return metadata?.icon || 'blocks';
};

const getComponentPercentile = (componentSize) => {
  if (!analysis.value) return null;
  const sizes = analysis.value.components.map(c => c.totalSize).sort((a, b) => a - b);
  const percentile = (sizes.filter(s => s < componentSize).length / sizes.length) * 100;
  return Math.round(percentile);
};

const getOptimizationSuggestions = (component) => {
  const suggestions = [];
  
  if (component.totalSize > 100000) {
    suggestions.push({
      type: 'error',
      title: 'Component is very large',
      description: 'Consider splitting this component into smaller, more focused components.',
      priority: 'high'
    });
  } else if (component.totalSize > 50000) {
    suggestions.push({
      type: 'warning',
      title: 'Component is large',
      description: 'Consider code splitting or lazy loading if this component is not immediately needed.',
      priority: 'medium'
    });
  }
  
  if (component.dependenciesSize > component.totalSize * 0.5) {
    suggestions.push({
      type: 'warning',
      title: 'High dependency overhead',
      description: `Dependencies account for ${Math.round((component.dependenciesSize / component.totalWithDeps) * 100)}% of total size. Review if all dependencies are necessary.`,
      priority: 'medium'
    });
  }
  
  if (component.vueSize > component.reactSize * 2 || component.reactSize > component.vueSize * 2) {
    suggestions.push({
      type: 'info',
      title: 'Framework size imbalance',
      description: 'One framework version is significantly larger. Consider optimizing the larger implementation.',
      priority: 'low'
    });
  }
  
  if (component.gzippedSize / component.totalSize > 0.4) {
    suggestions.push({
      type: 'info',
      title: 'Low compression ratio',
      description: 'Component may benefit from minification or tree-shaking optimizations.',
      priority: 'low'
    });
  }
  
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'success',
      title: 'Component size is optimal',
      description: 'This component has a good size-to-functionality ratio.',
      priority: 'low'
    });
  }
  
  return suggestions;
};

// Performance Budgets Functions
const loadBudgets = async () => {
  try {
    const response = await apiClient.get(`${API_BASE_URL}/performance/budgets`);
    budgets.value = response.data;
  } catch (error) {
    console.error('Error loading budgets:', error);
  }
};

const hasWarning = (budget) => budget.alertThreshold !== null && budget.alertThreshold !== undefined && budget.alertThreshold !== '';

// Each budget with where it stands against the latest bundle analysis
const budgetViews = computed(() =>
  budgets.value.map((budget) => {
    const status = compareBudget(budget, analysis.value);
    return { budget, status, state: BUDGET_STATES[status.state], measured: 'value' in status };
  }),
);

const getMetricDescription = (metric) => MEASURED_METRICS[metric]?.description ?? '';

const getSuggestedThreshold = (metric) => (metric === 'component-size' ? 50 : metric === 'bundle-size' ? 500 : 100);

const getSuggestedUnit = () => 'KB';

const saveBudget = async () => {
  saveError.value = '';
  try {
    // An emptied number field comes back as '': send no alert threshold
    const payload = {
      ...budgetForm.value,
      alertThreshold: budgetForm.value.alertThreshold === '' ? null : budgetForm.value.alertThreshold,
    };
    if (editingBudget.value) {
      await apiClient.put(`${API_BASE_URL}/performance/budgets/${editingBudget.value.id}`, payload);
    } else {
      await apiClient.post(`${API_BASE_URL}/performance/budgets`, payload);
    }
    const wasEditing = Boolean(editingBudget.value);
    closeModal();
    showNotice(wasEditing ? 'Budget updated' : 'Budget created', 'success');
    loadBudgets();
  } catch (error) {
    console.error('Error saving budget:', error);
    saveError.value = 'Error saving budget. Please try again.';
  }
};

const editBudget = (budget) => {
  editingBudget.value = budget;
  budgetForm.value = {
    name: budget.name,
    metric: budget.metric,
    threshold: budget.threshold,
    unit: budget.unit,
    alertThreshold: budget.alertThreshold || null
  };
  showCreateModal.value = true;
};

const deleteBudget = async (id) => {
  if (!(await confirmDialog({ title: 'Delete this budget?', message: 'Components will no longer be checked against it.', confirmLabel: 'Delete budget', danger: true }))) return;
  const index = budgetViews.value.findIndex((item) => item.budget.id === id);

  try {
    await apiClient.delete(`${API_BASE_URL}/performance/budgets/${id}`);
    await loadBudgets();
    showNotice('Budget deleted', 'success');
    // Its Delete button went with it: focus the budget now in its place
    await nextTick();
    focusAfterRemoval(budgetList.value, index, { fallback: createBudgetButton.value });
  } catch (error) {
    console.error('Error deleting budget:', error);
    showNotice('Error deleting budget. Please try again.', 'error');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingBudget.value = null;
  budgetForm.value = emptyForm();
};

onMounted(() => {
  loadAnalysis();
  loadBudgets();
});
</script>
