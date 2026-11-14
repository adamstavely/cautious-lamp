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
            <UiStat icon="widgets" label="Total components" :value="analysis.summary.totalComponents" />
            <UiStat icon="storage" label="Total size" :value="formatSize(analysis.summary.totalSize)" />
            <UiStat icon="calculate" label="Average size" :value="formatSize(analysis.summary.averageSize)" />
            <UiStat
              icon="expand_more"
              label="Largest component"
              :value="analysis.summary.largestComponent?.componentName"
              :hint="formatSize(analysis.summary.largestComponent?.totalSize)"
            />
          </div>

          <UiPanel title="Component analysis" flush>
            <template #actions>
              <UiButton variant="primary" size="sm" icon="refresh" :loading="loading" @click="loadAnalysis">Refresh</UiButton>
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
                    <UiLink :to="getComponentRoute(component.componentId, component.componentName)">{{ component.componentName }}</UiLink>
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
        </template>
      </template>

      <template #budgets>
        <UiCallout title="What are performance budgets?" class="mb-6">
          <p>
            Performance budgets help you maintain fast, efficient components by setting limits on key metrics like bundle size, load time, and memory usage. When a component exceeds your budget threshold, you'll get an alert so you can optimize before it impacts users.
          </p>
          <ul class="grid md:grid-cols-2 gap-3 mt-4">
            <li v-for="benefit in budgetBenefits" :key="benefit.title" class="flex items-start gap-2">
              <span class="material-symbols-outlined text-lg text-success" aria-hidden="true">check_circle</span>
              <span>
                <span class="block font-medium text-ink-strong">{{ benefit.title }}</span>
                <span class="block text-xs text-ink-secondary">{{ benefit.body }}</span>
              </span>
            </li>
          </ul>
        </UiCallout>

        <div class="flex justify-end mb-6">
          <UiButton variant="primary" icon="add" @click="showCreateModal = true">Create budget</UiButton>
        </div>

        <div v-if="budgets.length" class="grid gap-4">
          <UiPanel v-for="budget in budgets" :key="budget.id" :title="budget.name" heading-tag="h3">
            <template #actions>
              <UiChip :tone="budget.enabled ? 'success' : 'neutral'">{{ budget.enabled ? 'Active' : 'Disabled' }}</UiChip>
              <UiButton variant="ghost" size="sm" icon="edit" icon-only :label="`Edit ${budget.name}`" @click="editBudget(budget)" />
              <UiButton variant="ghost" size="sm" icon="delete" icon-only :label="`Delete ${budget.name}`" @click="deleteBudget(budget.id)" />
            </template>

            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-medium text-ink">{{ getMetricDisplayName(budget.metric) }}</span>
              <UiCode>{{ budget.metric }}</UiCode>
            </div>
            <p class="text-sm text-ink-secondary">
              <span class="font-medium">Threshold:</span> {{ budget.threshold }}{{ budget.unit }}
              <span v-if="budget.alertThreshold" class="ml-2">
                • <span class="font-medium">Alert:</span> {{ budget.alertThreshold }}{{ budget.unit }}
              </span>
            </p>

            <div class="mt-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-ink">Current value</span>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-semibold" :class="statusText[budgetStatus(budget)]">{{ getCurrentValue(budget) }}{{ budget.unit }}</span>
                  <UiChip :tone="budgetStatus(budget)">{{ getBudgetStatusText(budget) }}</UiChip>
                </div>
              </div>
              <UiMeter
                :value="getCurrentValue(budget)"
                :max="budget.threshold"
                :tone="budgetStatus(budget)"
                :marker="budget.alertThreshold || null"
                :marker-label="`Alert threshold: ${budget.alertThreshold}${budget.unit}`"
                :label="`${budget.name}: current value against the limit`"
                :value-text="`${getCurrentValue(budget)}${budget.unit} of ${budget.threshold}${budget.unit}`"
              />
              <div class="flex items-center justify-between mt-2 text-xs text-ink-muted">
                <span>0{{ budget.unit }}</span>
                <span class="flex items-center gap-4">
                  <span v-if="budget.alertThreshold && budget.alertThreshold < budget.threshold" class="flex items-center gap-1">
                    <span class="w-2 h-2 rounded-pill bg-warning-solid" aria-hidden="true"></span>
                    Alert: {{ budget.alertThreshold }}{{ budget.unit }}
                  </span>
                  <span class="font-medium">{{ budget.threshold }}{{ budget.unit }} (Limit)</span>
                </span>
              </div>
              <div class="mt-3 pt-3 border-t border-line-faint flex items-center justify-between text-xs text-ink-secondary">
                <span>{{ getBudgetUsagePercentage(budget) }}% of budget used</span>
                <span v-if="getBudgetRemaining(budget) > 0">{{ getBudgetRemaining(budget) }}{{ budget.unit }} remaining</span>
                <span v-else class="text-danger font-medium">Exceeded by {{ Math.abs(getBudgetRemaining(budget)) }}{{ budget.unit }}</span>
              </div>
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
            label="Threshold"
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
          label="Alert threshold (optional)"
          min="0"
          step="0.01"
          placeholder="Leave empty to disable alerts"
          hint="Get an early warning when this value is reached (should be less than threshold)"
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
          <span class="material-symbols-outlined text-xl text-accent-text" aria-hidden="true">{{ getComponentIcon(selectedComponent.componentId) }}</span>
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
import { ref, computed, onMounted } from 'vue';
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
import apiClient from '../services/api.js';
import { componentMetadataService } from '../services/componentMetadataService.js';

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

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

const emptyForm = () => ({
  name: '',
  metric: 'bundle-size',
  threshold: 100,
  unit: 'KB',
  alertThreshold: null,
});
const budgetForm = ref(emptyForm());

const metricOptions = [
  { value: 'bundle-size', label: 'Bundle Size - Total JavaScript bundle size' },
  { value: 'load-time', label: 'Load Time - Time to load component' },
  { value: 'render-time', label: 'Render Time - Time to render component' },
  { value: 'memory-usage', label: 'Memory Usage - RAM consumption' },
  { value: 'api-response-time', label: 'API Response Time - Backend API latency' },
];
const unitOptions = [
  { value: 'B', label: 'Bytes (B)' },
  { value: 'KB', label: 'Kilobytes (KB)' },
  { value: 'MB', label: 'Megabytes (MB)' },
  { value: 'ms', label: 'Milliseconds (ms)' },
  { value: 's', label: 'Seconds (s)' },
];

const budgetBenefits = [
  { title: 'Prevent regressions', body: 'Catch performance issues before they reach production' },
  { title: 'Set clear goals', body: 'Define acceptable performance limits for your team' },
  { title: 'Track progress', body: 'Monitor how components perform over time' },
  { title: 'Get alerts', body: 'Receive notifications when budgets are exceeded' },
];

const statusText = { danger: 'text-danger', warning: 'text-warning', success: 'text-success' };
const suggestionTone = { error: 'danger', warning: 'warning', info: 'info', success: 'success' };

const budgetModalOpen = computed({
  get: () => showCreateModal.value || !!editingBudget.value,
  set: (open) => {
    if (!open) closeModal();
  },
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

// Map componentId to component route
const getComponentRoute = (componentId, componentName) => {
  // Map componentId (from API) to route paths
  const idToRouteMap = {
    'button': '/components/buttons',
    'input': '/components/forms',
    'card': '/components/cards',
    'modal': '/components',
    'dropdown': '/components',
    'checkbox': '/components/forms',
    'radio': '/components/forms',
    'switch': '/components/forms',
    'color-picker': '/components/color-picker',
    'tabs': '/components/navigation',
    'accordion': '/components',
    'tooltip': '/components',
    'popover': '/components',
    'breadcrumbs': '/components/navigation',
    'pagination': '/components/navigation',
    'table': '/components/data-display',
    'select': '/components/forms',
  };
  
  // Try componentId first
  if (idToRouteMap[componentId]) {
    return idToRouteMap[componentId];
  }
  
  // Fallback: try componentName mapping (for cases where componentId doesn't match)
  const nameToRouteMap = {
    'Button': '/components/buttons',
    'Input': '/components/forms',
    'Card': '/components/cards',
    'Color Picker': '/components/color-picker',
    'Tabs': '/components/navigation',
    'Breadcrumbs': '/components/navigation',
    'Pagination': '/components/navigation',
    'Data Table': '/components/data-display',
  };
  
  if (componentName && nameToRouteMap[componentName]) {
    return nameToRouteMap[componentName];
  }
  
  // Final fallback: generate route from componentId
  const routeName = componentId.toLowerCase().replace(/\s+/g, '-');
  return `/components/${routeName}`;
};

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
  if (!componentId) return 'widgets';
  const metadata = componentMetadataService.getComponentMetadata(componentId);
  return metadata?.icon || 'widgets';
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

const getCurrentValue = (budget) => {
  // Mock current values - in production, this would come from actual metrics
  const mockValues = {
    'bundle-size': 85,
    'load-time': 120,
    'render-time': 45,
    'memory-usage': 12,
    'api-response-time': 200
  };
  return mockValues[budget.metric] || 0;
};

const budgetStatus = (budget) => {
  const current = getCurrentValue(budget);
  if (current > budget.threshold) return 'danger';
  if (budget.alertThreshold && current > budget.alertThreshold) return 'warning';
  return 'success';
};

const getBudgetStatusText = (budget) => {
  const current = getCurrentValue(budget);
  if (current > budget.threshold) return 'Exceeded';
  if (budget.alertThreshold && current > budget.alertThreshold) return 'Warning';
  return 'Within Budget';
};

const getBudgetUsagePercentage = (budget) => {
  const current = getCurrentValue(budget);
  return Math.min(Math.round((current / budget.threshold) * 100), 100);
};

const getBudgetRemaining = (budget) => {
  const current = getCurrentValue(budget);
  return budget.threshold - current;
};

const getMetricDisplayName = (metric) => {
  const names = {
    'bundle-size': 'Bundle Size',
    'load-time': 'Load Time',
    'render-time': 'Render Time',
    'memory-usage': 'Memory Usage',
    'api-response-time': 'API Response Time'
  };
  return names[metric] || metric;
};

const getMetricDescription = (metric) => {
  const descriptions = {
    'bundle-size': 'The total size of JavaScript code for this component. Smaller is better for faster page loads.',
    'load-time': 'How long it takes for the component to load and become interactive. Aim for under 1 second.',
    'render-time': 'How long it takes for the component to render on screen. Lower values mean snappier UI.',
    'memory-usage': 'The amount of RAM the component uses. Important for mobile devices and long-running apps.',
    'api-response-time': 'How long backend API calls take when using this component. Affects user experience.'
  };
  return descriptions[metric] || 'Performance metric for this component.';
};

const getSuggestedThreshold = (metric) => {
  const suggestions = {
    'bundle-size': 100,
    'load-time': 1000,
    'render-time': 100,
    'memory-usage': 10,
    'api-response-time': 500
  };
  return suggestions[metric] || 100;
};

const getSuggestedUnit = (metric) => {
  const units = {
    'bundle-size': 'KB',
    'load-time': 'ms',
    'render-time': 'ms',
    'memory-usage': 'MB',
    'api-response-time': 'ms'
  };
  return units[metric] || 'KB';
};

const saveBudget = async () => {
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
    closeModal();
    loadBudgets();
  } catch (error) {
    console.error('Error saving budget:', error);
    showNotice('Error saving budget. Please try again.', 'error');
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
  if (!confirm('Are you sure you want to delete this budget?')) return;
  
  try {
    await apiClient.delete(`${API_BASE_URL}/performance/budgets/${id}`);
    loadBudgets();
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
