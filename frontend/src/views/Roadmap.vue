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
                  Design System Roadmap
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Public roadmap for design system evolution. See what's planned, in progress, and completed.
                </p>
              </div>
              <button
                @click="showCreateModal = true"
                class="px-6 py-3 bg-white text-slate-800 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <span class="material-symbols-outlined">add</span>
                Add Item
              </button>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="max-w-7xl mx-auto mb-6">
          <div class="flex flex-wrap gap-3">
            <button
              v-for="status in ['all', 'planned', 'in-progress', 'completed', 'cancelled']"
              :key="status"
              @click="statusFilter = status"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              :class="statusFilter === status
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                : isDarkMode
                  ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'"
            >
              {{ status.charAt(0).toUpperCase() + status.slice(1) }}
            </button>
          </div>
        </div>

        <!-- Roadmap Items -->
        <div class="max-w-7xl mx-auto">
          <div class="grid gap-6">
            <div 
              v-for="item in filteredItems"
              :key="item.id"
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ item.title }}
                    </h3>
                    <span 
                      class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="getStatusClass(item.status)"
                    >
                      {{ item.status }}
                    </span>
                    <span 
                      class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="getPriorityClass(item.priority)"
                    >
                      {{ item.priority }} priority
                    </span>
                    <span 
                      class="px-2 py-1 text-xs rounded-full font-medium"
                      :class="getCategoryClass(item.category)"
                    >
                      {{ item.category }}
                    </span>
                  </div>
                  <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ item.description }}
                  </p>
                  <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    <span v-if="item.targetDate">
                      <span class="material-symbols-outlined text-sm align-middle">schedule</span>
                      Target: {{ formatDate(item.targetDate) }}
                    </span>
                    <span v-if="item.votes !== undefined">
                      <span class="material-symbols-outlined text-sm align-middle">thumb_up</span>
                      {{ item.votes }} votes
                    </span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="editItem(item)"
                    class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                  >
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button
                    @click="deleteItem(item.id)"
                    class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div 
              v-if="filteredItems.length === 0"
              class="rounded-lg shadow-sm border p-12 text-center"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <span class="material-symbols-outlined text-6xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">
                timeline
              </span>
              <h3 class="text-xl font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                No Roadmap Items
              </h3>
              <p class="text-sm mb-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ statusFilter === 'all' ? 'Create your first roadmap item to get started.' : `No items with status "${statusFilter}".` }}
              </p>
              <button
                v-if="statusFilter === 'all'"
                @click="showCreateModal = true"
                class="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingItem"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div 
        class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="roadmap-modal-title"
      >
        <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center justify-between">
            <h2 id="roadmap-modal-title" class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              {{ editingItem ? 'Edit Roadmap Item' : 'Create Roadmap Item' }}
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
        
        <form @submit.prevent="saveItem" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Title
            </label>
            <input
              v-model="itemForm.title"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="e.g., Dark Mode Support"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Description
            </label>
            <textarea
              v-model="itemForm.description"
              required
              rows="4"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="Describe the roadmap item..."
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Category
              </label>
              <select
                v-model="itemForm.category"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
                <option value="bug-fix">Bug Fix</option>
                <option value="deprecation">Deprecation</option>
                <option value="integration">Integration</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Priority
              </label>
              <select
                v-model="itemForm.priority"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Status
              </label>
              <select
                v-model="itemForm.status"
                required
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Target Date
              </label>
              <input
                v-model="itemForm.targetDate"
                type="date"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
          
          <div class="flex items-center gap-4 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors font-medium"
            >
              {{ editingItem ? 'Update Item' : 'Create Item' }}
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
const roadmapItems = ref([]);
const statusFilter = ref('all');
const showCreateModal = ref(false);
const editingItem = ref(null);

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

const itemForm = ref({
  title: '',
  description: '',
  category: 'feature',
  priority: 'medium',
  status: 'planned',
  targetDate: ''
});

const filteredItems = computed(() => {
  if (statusFilter.value === 'all') return roadmapItems.value;
  return roadmapItems.value.filter(item => item.status === statusFilter.value);
});

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const getStatusClass = (status) => {
  const classes = {
    'planned': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'in-progress': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    'completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'cancelled': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  };
  return classes[status] || classes.planned;
};

const getPriorityClass = (priority) => {
  const classes = {
    'high': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'medium': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    'low': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  };
  return classes[priority] || classes.medium;
};

const getCategoryClass = (category) => {
  const classes = {
    'feature': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    'improvement': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    'bug-fix': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'deprecation': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    'integration': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
  };
  return classes[category] || classes.feature;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const loadRoadmap = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/roadmap`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    roadmapItems.value = response.data;
  } catch (error) {
    console.error('Error loading roadmap:', error);
  }
};

const saveItem = async () => {
  try {
    if (editingItem.value) {
      await axios.put(
        `${API_BASE_URL}/roadmap/items/${editingItem.value.id}`,
        itemForm.value,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
    } else {
      await axios.post(
        `${API_BASE_URL}/roadmap/items`,
        itemForm.value,
        { headers: { Authorization: `Bearer ${API_KEY}` } }
      );
    }
    closeModal();
    loadRoadmap();
  } catch (error) {
    console.error('Error saving item:', error);
    alert('Error saving roadmap item. Please try again.');
  }
};

const editItem = (item) => {
  editingItem.value = item;
  itemForm.value = {
    title: item.title,
    description: item.description,
    category: item.category,
    priority: item.priority,
    status: item.status,
    targetDate: item.targetDate || ''
  };
  showCreateModal.value = true;
};

const deleteItem = async (id) => {
  if (!confirm('Are you sure you want to delete this roadmap item?')) return;
  
  try {
    await axios.delete(`${API_BASE_URL}/roadmap/items/${id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    loadRoadmap();
  } catch (error) {
    console.error('Error deleting item:', error);
    alert('Error deleting roadmap item. Please try again.');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingItem.value = null;
  itemForm.value = {
    title: '',
    description: '',
    category: 'feature',
    priority: 'medium',
    status: 'planned',
    targetDate: ''
  };
};

// Handle Escape key
const handleEscape = (e) => {
  if (e.key === 'Escape' && (showCreateModal.value || editingItem.value)) {
    closeModal();
  }
};

onMounted(() => {
  loadRoadmap();
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

