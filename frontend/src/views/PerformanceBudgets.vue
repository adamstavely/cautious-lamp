<template>
  <PageShell>
    <PageHero
      :back="{ to: '/admin/performance', label: 'Performance analysis' }"
      title="Performance budgets"
      lead="Define performance limits (bundle size, load time, memory usage) and get alerts when components exceed thresholds. Prevent performance regressions before they impact users."
      spot="admin/performance-analysis"
      size="tool"
    >
      <template #actions>
        <UiButton variant="primary" icon="add" @click="openCreate">Create budget</UiButton>
      </template>
    </PageHero>

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <PageSection title="Budgets">
      <div v-if="budgets.length" class="grid gap-4">
        <UiPanel v-for="budget in budgets" :key="budget.id" :title="budget.name" heading-tag="h3">
          <template #actions>
            <UiChip :tone="budget.enabled ? 'success' : 'neutral'">{{ budget.enabled ? 'Active' : 'Disabled' }}</UiChip>
            <UiButton variant="ghost" size="sm" icon="edit" icon-only :label="`Edit ${budget.name}`" @click="editBudget(budget)" />
            <UiButton variant="ghost" size="sm" icon="delete" icon-only :label="`Delete ${budget.name}`" @click="deleteBudget(budget.id)" />
          </template>

          <p class="text-sm text-ink-secondary mb-4">
            {{ budget.metric }} - Threshold: {{ budget.threshold }}{{ budget.unit }}
            <span v-if="budget.alertThreshold">(Alert at {{ budget.alertThreshold }}{{ budget.unit }})</span>
          </p>

          <div class="flex items-center justify-between mb-2 text-sm">
            <span class="font-medium text-ink">Current value</span>
            <span class="font-semibold" :class="statusText[budgetStatus(budget)]">{{ getCurrentValue(budget) }}{{ budget.unit }}</span>
          </div>
          <UiMeter
            :value="getCurrentValue(budget)"
            :max="budget.threshold"
            :tone="budgetStatus(budget)"
            :label="`${budget.name}: current value against the threshold`"
            :value-text="`${getCurrentValue(budget)}${budget.unit} of ${budget.threshold}${budget.unit}`"
          />
          <div class="flex items-center justify-between mt-2 text-xs text-ink-muted">
            <span>0{{ budget.unit }}</span>
            <span>{{ budget.threshold }}{{ budget.unit }}</span>
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
          <UiButton variant="primary" @click="openCreate">Create budget</UiButton>
        </template>
      </UiEmptyState>
    </PageSection>

    <UiDialog v-model:open="modalOpen" :title="editingBudget ? 'Edit budget' : 'Create performance budget'">
      <form id="budget-form" class="space-y-4" @submit.prevent="saveBudget">
        <UiInput v-model="budgetForm.name" label="Budget name" required placeholder="e.g., Bundle Size Budget" />
        <UiSelect v-model="budgetForm.metric" label="Metric" required :options="metricOptions" />
        <div class="grid grid-cols-2 gap-4">
          <UiInput v-model="budgetForm.threshold" type="number" label="Threshold" required min="0" step="0.01" />
          <UiInput v-model="budgetForm.unit" label="Unit" required placeholder="KB, ms, MB" />
        </div>
        <UiInput
          v-model="budgetForm.alertThreshold"
          type="number"
          label="Alert threshold (optional)"
          min="0"
          step="0.01"
          placeholder="Optional warning threshold"
        />
      </form>
      <template #footer>
        <UiButton @click="closeModal">Cancel</UiButton>
        <UiButton variant="primary" type="submit" form="budget-form">{{ editingBudget ? 'Update budget' : 'Create budget' }}</UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import InlineNotice from '../components/InlineNotice.vue';
import { PageHero, PageSection, PageShell, UiButton, UiChip, UiDialog, UiEmptyState, UiInput, UiPanel, UiSelect } from '../components/ui';
import UiMeter from '../components/ui/UiMeter.vue';
import { useNotice } from '../composables/useNotice.js';
import apiClient from '../services/api.js';

const budgets = ref([]);
const showCreateModal = ref(false);
const editingBudget = ref(null);
const { notice, showNotice, clearNotice } = useNotice();

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1`;

const metricOptions = [
  { value: 'bundle-size', label: 'Bundle Size' },
  { value: 'load-time', label: 'Load Time' },
  { value: 'render-time', label: 'Render Time' },
  { value: 'memory-usage', label: 'Memory Usage' },
  { value: 'api-response-time', label: 'API Response Time' },
];

const emptyForm = () => ({
  name: '',
  metric: 'bundle-size',
  threshold: 100,
  unit: 'KB',
  alertThreshold: null,
});
const budgetForm = ref(emptyForm());

const modalOpen = computed({
  get: () => showCreateModal.value || !!editingBudget.value,
  set: (open) => {
    if (!open) closeModal();
  },
});

const statusText = { danger: 'text-danger', warning: 'text-warning', success: 'text-success' };

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
    'api-response-time': 200,
  };
  return mockValues[budget.metric] || 0;
};

const budgetStatus = (budget) => {
  const current = getCurrentValue(budget);
  if (current > budget.threshold) return 'danger';
  if (budget.alertThreshold && current > budget.alertThreshold) return 'warning';
  return 'success';
};

const openCreate = () => {
  showCreateModal.value = true;
};

const saveBudget = async () => {
  try {
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
    alertThreshold: budget.alertThreshold || null,
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

onMounted(loadBudgets);
</script>
