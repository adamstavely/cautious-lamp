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
                  Bundle Size Analysis
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Analyze component bundle sizes to optimize performance and identify optimization opportunities.
                </p>
              </div>
              <button
                @click="loadAnalysis"
                class="px-6 py-3 bg-white text-slate-800 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <span class="material-symbols-outlined">refresh</span>
                Refresh Analysis
              </button>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div v-if="analysis" class="max-w-7xl mx-auto mb-8">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Total Components
              </div>
              <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ analysis.summary.totalComponents }}
              </div>
            </div>
            
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Total Size
              </div>
              <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ formatSize(analysis.summary.totalSize) }}
              </div>
            </div>
            
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Average Size
              </div>
              <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ formatSize(analysis.summary.averageSize) }}
              </div>
            </div>
            
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Largest Component
              </div>
              <div class="text-lg font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ analysis.summary.largestComponent?.componentName }}
              </div>
              <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ formatSize(analysis.summary.largestComponent?.totalSize) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Components Table -->
        <div v-if="analysis" class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border overflow-hidden"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h2 class="text-xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Component Analysis
              </h2>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b" :class="isDarkMode ? 'border-gray-700 bg-slate-800' : 'border-gray-200 bg-gray-50'">
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Component
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Vue Size
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      React Size
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Total Size
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Gzipped
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
                  <tr 
                    v-for="component in analysis.components"
                    :key="component.componentId"
                    class="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ component.componentName }}
                      </div>
                      <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
                        {{ component.componentId }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ formatSize(component.vueSize) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ formatSize(component.reactSize) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ formatSize(component.totalSize) }}
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                        + {{ formatSize(component.dependenciesSize) }} deps
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ formatSize(component.gzippedSize) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span 
                        class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="getStatusClass(component.status)"
                      >
                        {{ component.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <button
                        @click="analyzeComponent(component.componentId)"
                        class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
                      >
                        Analyze
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border p-12 text-center"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex justify-center mb-4">
              <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Analyzing bundle sizes...
            </p>
          </div>
        </div>
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
const analysis = ref(null);
const loading = ref(false);

const API_BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'test-api-key-123';

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getStatusClass = (status) => {
  if (status === 'error') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  if (status === 'warning') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
};

const loadAnalysis = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/performance/bundle-analysis`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    analysis.value = response.data;
  } catch (error) {
    console.error('Error loading analysis:', error);
    alert('Error loading bundle analysis. Please try again.');
  } finally {
    loading.value = false;
  }
};

const analyzeComponent = async (componentId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/performance/bundle-analysis/analyze`,
      { componentId, includeDependencies: true },
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    
    const details = response.data;
    alert(
      `Component: ${details.componentName}\n` +
      `Total Size: ${formatSize(details.totalSize)}\n` +
      `With Dependencies: ${formatSize(details.totalWithDeps)}\n` +
      `Gzipped: ${formatSize(details.gzippedSize)}\n` +
      `Dependencies: ${details.dependencies.join(', ') || 'None'}`
    );
  } catch (error) {
    console.error('Error analyzing component:', error);
    alert('Error analyzing component. Please try again.');
  }
};

onMounted(() => {
  loadAnalysis();
  
  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});
</script>

