<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <div class="h-full p-8 overflow-auto">
        <!-- Hero Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="rounded-3xl p-12 md:p-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 relative overflow-hidden">
            <div class="absolute inset-0 opacity-10 texture-pattern"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  Performance Budgets
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Set and monitor performance budgets to ensure your design system stays fast and efficient.
                </p>
              </div>
              <button
                @click="showCreateModal = true"
                class="px-6 py-3 bg-white text-slate-800 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <span class="material-symbols-outlined">add</span>
                Create Budget
              </button>
            </div>
          </div>
        </div>

        <!-- Budgets List -->
        <div class="max-w-7xl mx-auto">
          <div class="grid gap-6">
            <div 
              v-for="budget in budgets"
              :key="budget.id"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ budget.name }}
                    </h3>
                    <span 
                      v-if="budget.enabled"
                      class="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    >
                      Active
                    </span>
                    <span 
                      v-else
                      class="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      Disabled
                    </span>
                  </div>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ budget.metric }} - Threshold: {{ budget.threshold }}{{ budget.unit }}
                    <span v-if="budget.alertThreshold">
                      (Alert at {{ budget.alertThreshold }}{{ budget.unit }})
                    </span>
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="editBudget(budget)"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    @click="deleteBudget(budget.id)"
                    class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
              
              <!-- Current Value Visualization -->
              <div class="mt-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Current Value
                  </span>
                  <span class="text-sm font-semibold" :class="getStatusColor(budget)">
                    {{ getCurrentValue(budget) }}{{ budget.unit }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                  <div 
                    class="h-3 rounded-full transition-all"
                    :class="getStatusClass(budget)"
                    :style="{ width: `${Math.min((getCurrentValue(budget) / budget.threshold) * 100, 100)}%` }"
                  ></div>
                </div>
                <div class="flex items-center justify-between mt-2 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  <span>0{{ budget.unit }}</span>
                  <span>{{ budget.threshold }}{{ budget.unit }}</span>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div 
              v-if="budgets.length === 0"
              class="rounded-lg shadow-sm border p-12 text-center"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">
                speed
              </span>
              <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                No Performance Budgets Yet
              </h3>
              <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Create your first performance budget to start monitoring your design system's performance.
              </p>
              <button
                @click="showCreateModal = true"
                class="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors"
              >
                Create Budget
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingBudget"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div 
        class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
      >
        <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center justify-between">
            <h2 id="budget-modal-title" class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              {{ editingBudget ? 'Edit Budget' : 'Create Performance Budget' }}
            </h2>
            <button
              @click="closeModal"
              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Close modal"
            >
              <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
            </button>
          </div>
        </div>
        
        <form @submit.prevent="saveBudget" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Budget Name
            </label>
            <input
              v-model="budgetForm.name"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="e.g., Bundle Size Budget"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Metric
            </label>
            <select
              v-model="budgetForm.metric"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            >
              <option value="bundle-size">Bundle Size</option>
              <option value="load-time">Load Time</option>
              <option value="render-time">Render Time</option>
              <option value="memory-usage">Memory Usage</option>
              <option value="api-response-time">API Response Time</option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Threshold
              </label>
              <input
                v-model.number="budgetForm.threshold"
                type="number"
                required
                min="0"
                step="0.01"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Unit
              </label>
              <input
                v-model="budgetForm.unit"
                type="text"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                placeholder="KB, ms, MB"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Alert Threshold (Optional)
            </label>
            <input
              v-model.number="budgetForm.alertThreshold"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="Optional warning threshold"
            />
          </div>
          
          <div class="flex items-center gap-4 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors font-medium"
            >
              {{ editingBudget ? 'Update Budget' : 'Create Budget' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              :class="isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import axios from 'axios';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const budgets = ref([]);
const showCreateModal = ref(false);
const editingBudget = ref(null);

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

const budgetForm = ref({
  name: '',
  metric: 'bundle-size',
  threshold: 100,
  unit: 'KB',
  alertThreshold: null
});

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const loadBudgets = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/performance/budgets`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
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

const getStatusColor = (budget) => {
  const current = getCurrentValue(budget);
  if (current > budget.threshold) return 'text-red-600 dark:text-red-400';
  if (budget.alertThreshold && current > budget.alertThreshold) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
};

const getStatusClass = (budget) => {
  const current = getCurrentValue(budget);
  if (current > budget.threshold) return 'bg-red-500';
  if (budget.alertThreshold && current > budget.alertThreshold) return 'bg-yellow-500';
  return 'bg-green-500';
};

const saveBudget = async () => {
  try {
    if (editingBudget.value) {
      await axios.put(
        `${API_BASE_URL}/performance/budgets/${editingBudget.value.id}`,
        budgetForm.value,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
    } else {
      await axios.post(
        `${API_BASE_URL}/performance/budgets`,
        budgetForm.value,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
    }
    closeModal();
    loadBudgets();
  } catch (error) {
    console.error('Error saving budget:', error);
    alert('Error saving budget. Please try again.');
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
    await axios.delete(`${API_BASE_URL}/performance/budgets/${id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    loadBudgets();
  } catch (error) {
    console.error('Error deleting budget:', error);
    alert('Error deleting budget. Please try again.');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingBudget.value = null;
  budgetForm.value = {
    name: '',
    metric: 'bundle-size',
    threshold: 100,
    unit: 'KB',
    alertThreshold: null
  };
};

// Handle Escape key
const handleEscape = (e) => {
  if (e.key === 'Escape' && (showCreateModal.value || editingBudget.value)) {
    closeModal();
  }
};

onMounted(() => {
  loadBudgets();
  document.addEventListener('keydown', handleEscape);
  
  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>

