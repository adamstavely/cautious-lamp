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
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
              <div class="flex-1">
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  System Health
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Monitor your design system's health, track component adoption, and identify areas for improvement.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Health Overview Cards -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Overall Health Score -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Overall Health
                </h3>
                <span class="material-symbols-outlined" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
                  check_circle
                </span>
              </div>
              <div class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ overallHealth }}%
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                <div 
                  class="bg-green-500 h-2 rounded-full transition-all"
                  :style="{ width: `${overallHealth}%` }"
                ></div>
              </div>
            </div>

            <!-- Component Count -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Components
                </h3>
                <span class="material-symbols-outlined" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">
                  widgets
                </span>
              </div>
              <div class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ metrics.components.total }}
              </div>
              <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ metrics.components.productionReady }} production ready
              </div>
            </div>

            <!-- Token Count -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Design Tokens
                </h3>
                <span class="material-symbols-outlined" :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'">
                  style
                </span>
              </div>
              <div class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ metrics.tokens.total }}
              </div>
              <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                {{ metrics.tokens.categories }} categories
              </div>
            </div>

            <!-- Accessibility Score -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Accessibility
                </h3>
                <span class="material-symbols-outlined" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">
                  accessibility
                </span>
              </div>
              <div class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ metrics.accessibility.score }}%
              </div>
              <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                WCAG 2.1 AA compliant
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Metrics -->
        <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 mb-8">
          <!-- Component Status Breakdown -->
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Component Status
              </h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div v-for="status in componentStatuses" :key="status.type" class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-3 h-3 rounded-full"
                      :class="status.color"
                    ></div>
                    <span class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ status.label }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="w-32 bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                      <div 
                        class="h-2 rounded-full transition-all"
                        :class="status.color"
                        :style="{ width: `${status.percentage}%` }"
                      ></div>
                    </div>
                    <span class="text-sm font-semibold w-8 text-right" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ status.count }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Token Usage -->
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Token Usage by Category
              </h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div v-for="category in tokenCategories" :key="category.name" class="flex items-center justify-between">
                  <span class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    {{ category.name }}
                  </span>
                  <div class="flex items-center gap-4">
                    <div class="w-32 bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                      <div 
                        class="h-2 rounded-full transition-all bg-indigo-500"
                        :style="{ width: `${category.percentage}%` }"
                      ></div>
                    </div>
                    <span class="text-sm font-semibold w-8 text-right" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ category.count }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Alerts and Warnings -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Alerts & Warnings
              </h3>
            </div>
            <div class="p-6">
              <div v-if="alerts.length === 0" class="text-center py-8">
                <span class="material-symbols-outlined text-5xl mb-4" :class="isDarkMode ? 'text-green-600' : 'text-green-500'">
                  check_circle
                </span>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  No alerts. Your design system is healthy!
                </p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="alert in alerts"
                  :key="alert.id"
                  class="p-4 rounded-lg border flex items-start gap-3"
                  :class="[
                    alert.severity === 'high' 
                      ? (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                      : alert.severity === 'medium'
                      ? (isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200')
                      : (isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200')
                  ]"
                >
                  <span 
                    class="material-symbols-outlined flex-shrink-0 mt-0.5"
                    :class="alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'"
                  >
                    {{ alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info' }}
                  </span>
                  <div class="flex-1">
                    <h4 class="font-semibold mb-1"
                      :class="alert.severity === 'high' 
                        ? (isDarkMode ? 'text-red-300' : 'text-red-900')
                        : alert.severity === 'medium'
                        ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-900')
                        : (isDarkMode ? 'text-blue-300' : 'text-blue-900')"
                    >
                      {{ alert.title }}
                    </h4>
                    <p class="text-sm"
                      :class="alert.severity === 'high' 
                        ? (isDarkMode ? 'text-red-200' : 'text-red-800')
                        : alert.severity === 'medium'
                        ? (isDarkMode ? 'text-yellow-200' : 'text-yellow-800')
                        : (isDarkMode ? 'text-blue-200' : 'text-blue-800')"
                    >
                      {{ alert.message }}
                    </p>
                    <button
                      v-if="alert.action"
                      @click="handleAlertAction(alert)"
                      class="mt-2 text-xs font-medium underline"
                      :class="alert.severity === 'high' 
                        ? (isDarkMode ? 'text-red-300' : 'text-red-700')
                        : alert.severity === 'medium'
                        ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-700')
                        : (isDarkMode ? 'text-blue-300' : 'text-blue-700')"
                    >
                      {{ alert.action }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Component Adoption -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Component Adoption
              </h3>
              <select
                v-model="adoptionTimeframe"
                class="px-3 py-1 border rounded text-sm"
                :class="isDarkMode 
                  ? 'border-gray-600 bg-slate-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div
                  v-for="component in topComponents"
                  :key="component.name"
                  class="flex items-center justify-between"
                >
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-1">
                      <span class="text-sm font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ component.name }}
                      </span>
                      <span 
                        class="px-2 py-0.5 rounded text-xs font-medium"
                        :class="getStatusBadgeClass(component.status)"
                      >
                        {{ component.status }}
                      </span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                      <div 
                        class="bg-indigo-500 h-2 rounded-full transition-all"
                        :style="{ width: `${component.adoption}%` }"
                      ></div>
                    </div>
                  </div>
                  <div class="ml-4 text-right">
                    <div class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ component.adoption }}%
                    </div>
                    <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ component.usage }} uses
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Design System Analytics -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Design System Analytics
              </h3>
            </div>
            <div class="p-6">
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <!-- Most Used Components -->
                <div>
                  <h4 class="text-sm font-semibold mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Most Used Components
                  </h4>
                  <div class="space-y-3">
                    <div
                      v-for="(comp, index) in mostUsedComponents"
                      :key="comp.name"
                      class="flex items-center justify-between"
                    >
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-medium w-6" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          {{ index + 1 }}.
                        </span>
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          {{ comp.name }}
                        </span>
                      </div>
                      <span class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ comp.usage }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Token Usage Patterns -->
                <div>
                  <h4 class="text-sm font-semibold mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Token Usage Patterns
                  </h4>
                  <div class="space-y-3">
                    <div
                      v-for="pattern in tokenUsagePatterns"
                      :key="pattern.category"
                      class="flex items-center justify-between"
                    >
                      <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ pattern.category }}
                      </span>
                      <div class="flex items-center gap-2">
                        <div class="w-20 bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                          <div 
                            class="bg-purple-500 h-2 rounded-full"
                            :style="{ width: `${pattern.percentage}%` }"
                          ></div>
                        </div>
                        <span class="text-sm font-semibold w-8 text-right" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ pattern.count }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Performance Metrics -->
                <div>
                  <h4 class="text-sm font-semibold mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    Performance Metrics
                  </h4>
                  <div class="space-y-4">
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Avg Load Time
                        </span>
                        <span class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ performanceMetrics.avgLoadTime }}ms
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                        <div 
                          class="bg-green-500 h-2 rounded-full"
                          :style="{ width: `${100 - (performanceMetrics.avgLoadTime / 10)}%` }"
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Bundle Size
                        </span>
                        <span class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ performanceMetrics.bundleSize }}KB
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                        <div 
                          class="bg-blue-500 h-2 rounded-full"
                          :style="{ width: `${100 - (performanceMetrics.bundleSize / 20)}%` }"
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                          Accessibility Score
                        </span>
                        <span class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ performanceMetrics.accessibilityScore }}%
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                        <div 
                          class="bg-indigo-500 h-2 rounded-full"
                          :style="{ width: `${performanceMetrics.accessibilityScore}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Usage Trends -->
              <div class="mt-6 pt-6 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h4 class="text-sm font-semibold mb-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Usage Trends (Last 30 Days)
                </h4>
                <div class="flex items-end gap-2 h-32">
                  <div
                    v-for="(day, index) in usageTrends"
                    :key="index"
                    class="flex-1 flex flex-col items-center justify-end"
                  >
                    <div
                      class="w-full rounded-t transition-all hover:opacity-80"
                      :class="isDarkMode ? 'bg-indigo-500' : 'bg-indigo-500'"
                      :style="{ height: `${day.percentage}%` }"
                      :title="`${day.date}: ${day.usage} uses`"
                    ></div>
                    <span class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      {{ day.label }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';

const router = useRouter();
const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const adoptionTimeframe = ref('30d');

// Sample metrics data - in a real app, this would come from an API
const metrics = ref({
  components: {
    total: 24,
    productionReady: 18,
    inProgress: 4,
    planned: 2,
    deprecated: 0,
  },
  tokens: {
    total: 156,
    categories: 8,
  },
  accessibility: {
    score: 95,
    wcagCompliant: true,
  },
});

const componentStatuses = computed(() => {
  const total = metrics.value.components.total;
  return [
    {
      type: 'production',
      label: 'Production Ready',
      count: metrics.value.components.productionReady,
      percentage: (metrics.value.components.productionReady / total) * 100,
      color: 'bg-green-500',
    },
    {
      type: 'progress',
      label: 'In Progress',
      count: metrics.value.components.inProgress,
      percentage: (metrics.value.components.inProgress / total) * 100,
      color: 'bg-yellow-500',
    },
    {
      type: 'planned',
      label: 'Planned',
      count: metrics.value.components.planned,
      percentage: (metrics.value.components.planned / total) * 100,
      color: 'bg-blue-500',
    },
    {
      type: 'deprecated',
      label: 'Deprecated',
      count: metrics.value.components.deprecated,
      percentage: (metrics.value.components.deprecated / total) * 100,
      color: 'bg-red-500',
    },
  ];
});

const tokenCategories = computed(() => {
  const total = metrics.value.tokens.total;
  const categories = [
    { name: 'Colors', count: 48 },
    { name: 'Spacing', count: 24 },
    { name: 'Typography', count: 32 },
    { name: 'Shadows', count: 16 },
    { name: 'Borders', count: 12 },
    { name: 'Other', count: 24 },
  ];
  return categories.map(cat => ({
    ...cat,
    percentage: (cat.count / total) * 100,
  }));
});

const overallHealth = computed(() => {
  const componentScore = (metrics.value.components.productionReady / metrics.value.components.total) * 100;
  const accessibilityScore = metrics.value.accessibility.score;
  const deprecatedPenalty = (metrics.value.components.deprecated / metrics.value.components.total) * 20;
  
  return Math.round((componentScore + accessibilityScore) / 2 - deprecatedPenalty);
});

const alerts = ref([
  {
    id: 1,
    severity: 'medium',
    title: '4 Components In Progress',
    message: 'Some components are still in development and may have breaking changes.',
    action: 'View Components',
    actionPath: '/components/status',
  },
  {
    id: 2,
    severity: 'low',
    title: 'Token Usage Optimization',
    message: '24 tokens are unused and could be removed to simplify the system.',
    action: 'Review Tokens',
    actionPath: '/tokens',
  },
]);

const topComponents = ref([
  { name: 'Button', status: 'Production Ready', adoption: 95, usage: 1247 },
  { name: 'Card', status: 'Production Ready', adoption: 87, usage: 892 },
  { name: 'Input', status: 'Production Ready', adoption: 82, usage: 654 },
  { name: 'Select', status: 'Production Ready', adoption: 76, usage: 432 },
  { name: 'Checkbox', status: 'Production Ready', adoption: 71, usage: 389 },
  { name: 'Alert', status: 'In Progress', adoption: 45, usage: 156 },
]);

const mostUsedComponents = ref([
  { name: 'Button', usage: 1247 },
  { name: 'Card', usage: 892 },
  { name: 'Input', usage: 654 },
  { name: 'Select', usage: 432 },
  { name: 'Checkbox', usage: 389 },
]);

const tokenUsagePatterns = ref([
  { category: 'Colors', count: 48, percentage: 85 },
  { category: 'Spacing', count: 24, percentage: 72 },
  { category: 'Typography', count: 32, percentage: 68 },
  { category: 'Shadows', count: 16, percentage: 45 },
  { category: 'Borders', count: 12, percentage: 38 },
]);

const performanceMetrics = ref({
  avgLoadTime: 45,
  bundleSize: 125,
  accessibilityScore: 95,
});

const usageTrends = ref([
  { date: '2024-01-01', usage: 120, percentage: 60, label: 'M' },
  { date: '2024-01-02', usage: 145, percentage: 72, label: 'T' },
  { date: '2024-01-03', usage: 180, percentage: 90, label: 'W' },
  { date: '2024-01-04', usage: 165, percentage: 82, label: 'T' },
  { date: '2024-01-05', usage: 200, percentage: 100, label: 'F' },
  { date: '2024-01-06', usage: 90, percentage: 45, label: 'S' },
  { date: '2024-01-07', usage: 75, percentage: 37, label: 'S' },
  { date: '2024-01-08', usage: 130, percentage: 65, label: 'M' },
  { date: '2024-01-09', usage: 155, percentage: 77, label: 'T' },
  { date: '2024-01-10', usage: 175, percentage: 87, label: 'W' },
  { date: '2024-01-11', usage: 190, percentage: 95, label: 'T' },
  { date: '2024-01-12', usage: 210, percentage: 100, label: 'F' },
  { date: '2024-01-13', usage: 95, percentage: 47, label: 'S' },
  { date: '2024-01-14', usage: 80, percentage: 40, label: 'S' },
]);

const getStatusBadgeClass = (status) => {
  const classes = {
    'Production Ready': isDarkMode.value ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700',
    'In Progress': isDarkMode.value ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700',
    'Planned': isDarkMode.value ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700',
    'Deprecated': isDarkMode.value ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700',
  };
  return classes[status] || (isDarkMode.value ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');
};

const handleAlertAction = (alert) => {
  if (alert.actionPath) {
    router.push(alert.actionPath);
  }
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

// Watch for dark mode changes
let darkModeObserver = null;
let darkModeInterval = null;

onMounted(() => {
  darkModeObserver = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  darkModeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  const checkDarkMode = () => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  };
  
  checkDarkMode();
  darkModeInterval = setInterval(checkDarkMode, 100);
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

