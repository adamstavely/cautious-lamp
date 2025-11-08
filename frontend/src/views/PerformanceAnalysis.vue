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
                  Performance Analysis
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Analyze component bundle sizes and set performance budgets to monitor and prevent regressions. Measure what's large, then set limits to keep your design system fast.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400">
                    <defs>
                      <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Speedometer/gauge -->
                    <path d="M 40 160 A 80 80 0 0 1 160 160" fill="none" stroke="url(#performanceGradient)" stroke-width="8" opacity="0.3"/>
                    <path d="M 50 150 A 70 70 0 0 1 150 150" fill="none" stroke="url(#performanceGradient)" stroke-width="6" opacity="0.5"/>
                    <!-- Needle pointing to good performance -->
                    <line x1="100" y1="100" x2="140" y2="120" stroke="white" stroke-width="4" stroke-linecap="round" opacity="0.9"/>
                    <circle cx="100" cy="100" r="6" fill="white" opacity="0.9"/>
                    <!-- Chart bars representing analysis -->
                    <rect x="30" y="40" width="20" height="40" rx="2" fill="url(#performanceGradient)" opacity="0.4"/>
                    <rect x="60" y="30" width="20" height="50" rx="2" fill="url(#performanceGradient)" opacity="0.5"/>
                    <rect x="90" y="50" width="20" height="30" rx="2" fill="url(#performanceGradient)" opacity="0.6"/>
                    <rect x="120" y="35" width="20" height="45" rx="2" fill="url(#performanceGradient)" opacity="0.5"/>
                    <rect x="150" y="45" width="20" height="35" rx="2" fill="url(#performanceGradient)" opacity="0.4"/>
                    <!-- Speed lines -->
                    <line x1="50" y1="80" x2="70" y2="75" stroke="white" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
                    <line x1="130" y1="75" x2="150" y2="80" stroke="white" stroke-width="2" opacity="0.6" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="max-w-7xl mx-auto mb-8">
          <div class="flex gap-2 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <button
              @click="activeTab = 'bundle'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'bundle'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Bundle Analysis
              <div 
                v-if="activeTab === 'bundle'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
            <button
              @click="activeTab = 'budgets'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'budgets'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Performance Budgets
              <div 
                v-if="activeTab === 'budgets'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
          </div>
        </div>

        <!-- Bundle Analysis Tab -->
        <div v-if="activeTab === 'bundle'" class="max-w-7xl mx-auto">
          <!-- Summary Cards -->
          <div v-if="analysis" class="mb-8">
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">widgets</span>
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
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">storage</span>
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
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">calculate</span>
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
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-lg" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">expand_more</span>
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
          <div v-if="analysis">
            <div 
              class="rounded-lg shadow-sm border overflow-hidden"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <h2 class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">analytics</span>
                  Component Analysis
                </h2>
                <button
                  @click="loadAnalysis"
                  class="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors flex items-center gap-2 text-sm"
                >
                  <span class="material-symbols-outlined text-lg">refresh</span>
                  Refresh
                </button>
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
                    <tr v-if="!analysis.components || analysis.components.length === 0">
                      <td colspan="7" class="px-6 py-12 text-center">
                        <div class="flex flex-col items-center gap-3">
                          <span class="material-symbols-outlined text-4xl" :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'">widgets</span>
                          <p class="text-sm font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                            No components found
                          </p>
                          <p class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                            Component analysis data will appear here once components are available.
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr 
                      v-else
                      v-for="component in analysis.components"
                      :key="component.componentId"
                      class="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <td class="px-6 py-4 whitespace-nowrap">
                        <router-link
                          :to="getComponentRoute(component.componentId, component.componentName)"
                          class="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                          :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                        >
                          {{ component.componentName }}
                        </router-link>
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

        <!-- Performance Budgets Tab -->
        <div v-if="activeTab === 'budgets'" class="max-w-7xl mx-auto">
          <!-- Help Section -->
          <div 
            class="rounded-lg border p-6 mb-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'">
                  <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">info</span>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold mb-2 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  What are Performance Budgets?
                </h3>
                <p class="text-sm mb-3" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Performance budgets help you maintain fast, efficient components by setting limits on key metrics like bundle size, load time, and memory usage. When a component exceeds your budget threshold, you'll get an alert so you can optimize before it impacts users.
                </p>
                <div class="grid md:grid-cols-2 gap-4 mt-4">
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-lg flex-shrink-0" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">check_circle</span>
                    <div>
                      <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Prevent Regressions</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-600'">Catch performance issues before they reach production</div>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-lg flex-shrink-0" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">check_circle</span>
                    <div>
                      <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Set Clear Goals</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-600'">Define acceptable performance limits for your team</div>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-lg flex-shrink-0" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">check_circle</span>
                    <div>
                      <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Track Progress</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-600'">Monitor how components perform over time</div>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-lg flex-shrink-0" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">check_circle</span>
                    <div>
                      <div class="text-sm font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Get Alerts</div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-600'">Receive notifications when budgets are exceeded</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end mb-6">
            <button
              @click="showCreateModal = true"
              class="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined">add</span>
              Create Budget
            </button>
          </div>

          <!-- Budgets List -->
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
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ getMetricDisplayName(budget.metric) }}
                    </span>
                    <span class="text-xs px-2 py-0.5 rounded" :class="isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-gray-100 text-gray-600'">
                      {{ budget.metric }}
                    </span>
                  </div>
                  <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    <span class="font-medium">Threshold:</span> {{ budget.threshold }}{{ budget.unit }}
                    <span v-if="budget.alertThreshold" class="ml-2">
                      • <span class="font-medium">Alert:</span> {{ budget.alertThreshold }}{{ budget.unit }}
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
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-semibold" :class="getBudgetStatusColor(budget)">
                      {{ getCurrentValue(budget) }}{{ budget.unit }}
                    </span>
                    <span 
                      class="text-xs px-2 py-1 rounded-full font-medium"
                      :class="getBudgetStatusBadgeClass(budget)"
                    >
                      {{ getBudgetStatusText(budget) }}
                    </span>
                  </div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 relative" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                  <div 
                    class="h-3 rounded-full transition-all"
                    :class="getBudgetStatusClass(budget)"
                    :style="{ width: `${Math.min((getCurrentValue(budget) / budget.threshold) * 100, 100)}%` }"
                  ></div>
                  <div 
                    v-if="budget.alertThreshold && budget.alertThreshold < budget.threshold"
                    class="absolute top-0 h-3 w-0.5"
                    :style="{ left: `${(budget.alertThreshold / budget.threshold) * 100}%`, backgroundColor: '#fbbf24' }"
                    :title="`Alert threshold: ${budget.alertThreshold}${budget.unit}`"
                  ></div>
                </div>
                <div class="flex items-center justify-between mt-2 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                  <span>0{{ budget.unit }}</span>
                  <span class="flex items-center gap-4">
                    <span v-if="budget.alertThreshold && budget.alertThreshold < budget.threshold" class="flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
                      Alert: {{ budget.alertThreshold }}{{ budget.unit }}
                    </span>
                    <span class="font-medium">{{ budget.threshold }}{{ budget.unit }} (Limit)</span>
                  </span>
                </div>
                <div class="mt-3 pt-3 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                  <div class="flex items-center justify-between text-xs">
                    <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ getBudgetUsagePercentage(budget) }}% of budget used
                    </span>
                    <span v-if="getBudgetRemaining(budget) > 0" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ getBudgetRemaining(budget) }}{{ budget.unit }} remaining
                    </span>
                    <span v-else class="text-red-600 dark:text-red-400 font-medium">
                      Exceeded by {{ Math.abs(getBudgetRemaining(budget)) }}{{ budget.unit }}
                    </span>
                  </div>
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

    <!-- Create/Edit Budget Modal -->
    <div
      v-if="showCreateModal || editingBudget"
      class="fixed inset-0 z-50 flex items-center justify-center"
      style="background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px);"
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
            <h2 id="budget-modal-title" class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-2xl" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">speed</span>
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
              <span class="text-red-500">*</span>
            </label>
            <Dropdown
              :model-value="budgetForm.metric"
              @update:model-value="budgetForm.metric = $event"
              :options="[
                { value: 'bundle-size', label: 'Bundle Size - Total JavaScript bundle size' },
                { value: 'load-time', label: 'Load Time - Time to load component' },
                { value: 'render-time', label: 'Render Time - Time to render component' },
                { value: 'memory-usage', label: 'Memory Usage - RAM consumption' },
                { value: 'api-response-time', label: 'API Response Time - Backend API latency' }
              ]"
              :is-dark-mode="isDarkMode"
            />
            <p class="mt-1 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
              {{ getMetricDescription(budgetForm.metric) }}
            </p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Threshold
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="budgetForm.threshold"
                type="number"
                required
                min="0"
                step="0.01"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                :placeholder="getSuggestedThreshold(budgetForm.metric)"
              />
              <p class="mt-1 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                Suggested: {{ getSuggestedThreshold(budgetForm.metric) }}{{ getSuggestedUnit(budgetForm.metric) }}
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                Unit
                <span class="text-red-500">*</span>
              </label>
              <Dropdown
                :model-value="budgetForm.unit"
                @update:model-value="budgetForm.unit = $event"
                :options="[
                  { value: 'B', label: 'Bytes (B)' },
                  { value: 'KB', label: 'Kilobytes (KB)' },
                  { value: 'MB', label: 'Megabytes (MB)' },
                  { value: 'ms', label: 'Milliseconds (ms)' },
                  { value: 's', label: 'Seconds (s)' }
                ]"
                :is-dark-mode="isDarkMode"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Alert Threshold
              <span class="text-xs font-normal ml-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">(Optional)</span>
            </label>
            <input
              v-model.number="budgetForm.alertThreshold"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              placeholder="Leave empty to disable alerts"
            />
            <p class="mt-1 text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
              Get an early warning when this value is reached (should be less than threshold)
            </p>
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

    <!-- Component Analysis Modal -->
    <div
      v-if="showAnalysisModal && selectedComponent"
      class="fixed inset-0 z-50 flex items-center justify-center"
      style="background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px);"
      @click.self="closeAnalysisModal"
    >
      <div 
        class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="analysis-modal-title"
      >
        <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span 
                class="material-symbols-outlined text-3xl"
                :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'"
              >
                {{ getComponentIcon(selectedComponent.componentId) }}
              </span>
              <div>
                <h2 id="analysis-modal-title" class="text-2xl font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ selectedComponent.componentName }}
                </h2>
                <p class="text-sm mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Detailed Bundle Analysis
                </p>
              </div>
            </div>
            <button
              @click="closeAnalysisModal"
              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Close modal"
            >
              <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Size Breakdown Visualization -->
          <div>
            <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Size Breakdown
            </h3>
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Pie Chart Visualization -->
              <div class="space-y-4">
                <div class="relative w-48 h-48 mx-auto">
                  <svg viewBox="0 0 200 200" class="w-full h-full transform -rotate-90">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="currentColor"
                      :class="isDarkMode ? 'text-gray-700' : 'text-gray-200'"
                      stroke-width="40"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#818cf8"
                      stroke-width="40"
                      :stroke-dasharray="`${(selectedComponent.vueSize / selectedComponent.totalWithDeps) * 502.4} 502.4`"
                      stroke-dashoffset="0"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#6366f1"
                      stroke-width="40"
                      :stroke-dasharray="`${(selectedComponent.reactSize / selectedComponent.totalWithDeps) * 502.4} 502.4`"
                      :stroke-dashoffset="-(selectedComponent.vueSize / selectedComponent.totalWithDeps) * 502.4"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#f59e0b"
                      stroke-width="40"
                      :stroke-dasharray="`${(selectedComponent.dependenciesSize / selectedComponent.totalWithDeps) * 502.4} 502.4`"
                      :stroke-dashoffset="-((selectedComponent.vueSize + selectedComponent.reactSize) / selectedComponent.totalWithDeps) * 502.4"
                    />
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ formatSize(selectedComponent.totalWithDeps) }}
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        Total with deps
                      </div>
                    </div>
                  </div>
                </div>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded" style="background-color: #818cf8;"></div>
                    <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Vue: {{ formatSize(selectedComponent.vueSize) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded" style="background-color: #6366f1;"></div>
                    <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">React: {{ formatSize(selectedComponent.reactSize) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded" style="background-color: #f59e0b;"></div>
                    <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Dependencies: {{ formatSize(selectedComponent.dependenciesSize) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Size Metrics -->
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Component Only</div>
                    <div class="text-xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ formatSize(selectedComponent.totalSize) }}
                    </div>
                  </div>
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">With Dependencies</div>
                    <div class="text-xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ formatSize(selectedComponent.totalWithDeps) }}
                    </div>
                  </div>
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Gzipped</div>
                    <div class="text-xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ formatSize(selectedComponent.gzippedSize) }}
                    </div>
                  </div>
                  <div class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Compression Ratio</div>
                    <div class="text-xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ Math.round((selectedComponent.gzippedSize / selectedComponent.totalSize) * 100) }}%
                    </div>
                  </div>
                </div>
                
                <div v-if="getComponentPercentile(selectedComponent.totalSize)" class="rounded-lg border p-4" :class="isDarkMode ? 'bg-slate-900 border-gray-700' : 'bg-gray-50 border-gray-200'">
                  <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Size Percentile</div>
                  <div class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ getComponentPercentile(selectedComponent.totalSize) }}th percentile
                  </div>
                  <div class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                    Larger than {{ getComponentPercentile(selectedComponent.totalSize) }}% of components
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Dependencies -->
          <div v-if="selectedComponent.dependencies && selectedComponent.dependencies.length > 0">
            <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Dependencies ({{ selectedComponent.dependencies.length }})
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="depId in selectedComponent.dependencies"
                :key="depId"
                class="px-3 py-1 rounded-full text-sm"
                :class="isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-700'"
              >
                {{ depId }}
              </span>
            </div>
          </div>
          <div v-else>
            <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Dependencies
            </h3>
            <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              No dependencies
            </p>
          </div>

          <!-- Optimization Suggestions -->
          <div>
            <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              Optimization Suggestions
            </h3>
            <div class="space-y-3">
              <div
                v-for="(suggestion, index) in getOptimizationSuggestions(selectedComponent)"
                :key="index"
                class="rounded-lg border p-4"
                :class="{
                  'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800': suggestion.type === 'error',
                  'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800': suggestion.type === 'warning',
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800': suggestion.type === 'info',
                  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800': suggestion.type === 'success',
                }"
              >
                <div class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-lg mt-0.5"
                    :class="{
                      'text-red-600 dark:text-red-400': suggestion.type === 'error',
                      'text-yellow-600 dark:text-yellow-400': suggestion.type === 'warning',
                      'text-blue-600 dark:text-blue-400': suggestion.type === 'info',
                      'text-green-600 dark:text-green-400': suggestion.type === 'success',
                    }"
                  >
                    {{ suggestion.type === 'error' ? 'error' : suggestion.type === 'warning' ? 'warning' : suggestion.type === 'info' ? 'info' : 'check_circle' }}
                  </span>
                  <div class="flex-1">
                    <h4 class="font-semibold mb-1"
                      :class="{
                        'text-red-900 dark:text-red-300': suggestion.type === 'error',
                        'text-yellow-900 dark:text-yellow-300': suggestion.type === 'warning',
                        'text-blue-900 dark:text-blue-300': suggestion.type === 'info',
                        'text-green-900 dark:text-green-300': suggestion.type === 'success',
                      }"
                    >
                      {{ suggestion.title }}
                    </h4>
                    <p class="text-sm"
                      :class="{
                        'text-red-700 dark:text-red-400': suggestion.type === 'error',
                        'text-yellow-700 dark:text-yellow-400': suggestion.type === 'warning',
                        'text-blue-700 dark:text-blue-400': suggestion.type === 'info',
                        'text-green-700 dark:text-green-400': suggestion.type === 'success',
                      }"
                    >
                      {{ suggestion.description }}
                    </p>
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
import { ref, onMounted, onBeforeUnmount } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';
import { componentMetadataService } from '../services/componentMetadataService.js';

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const drawerOpen = ref(false);
const activeTab = ref('bundle');

// Bundle Analysis
const analysis = ref(null);
const loading = ref(false);

// Performance Budgets
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

// Bundle Analysis Functions
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
    const response = await axios.get(`${API_BASE_URL}/performance/bundle-analysis`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    // Ensure response data has the expected structure
    if (response.data && response.data.components && Array.isArray(response.data.components)) {
      analysis.value = response.data;
    } else {
      console.error('Invalid response structure:', response.data);
      analysis.value = null;
      alert('Received invalid data from server. Please try again.');
    }
  } catch (error) {
    console.error('Error loading analysis:', error);
    // Clear any stale data on error
    analysis.value = null;
    alert('Error loading bundle analysis. Please try again.');
  } finally {
    loading.value = false;
  }
};

const selectedComponent = ref(null);
const showAnalysisModal = ref(false);

const analyzeComponent = async (componentId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/performance/bundle-analysis/analyze`,
      { componentId, includeDependencies: true },
      { headers: { Authorization: `Bearer ${API_KEY}` } }
    );
    
    selectedComponent.value = response.data;
    showAnalysisModal.value = true;
  } catch (error) {
    console.error('Error analyzing component:', error);
    alert('Error analyzing component. Please try again.');
  }
};

const closeAnalysisModal = () => {
  showAnalysisModal.value = false;
  selectedComponent.value = null;
};

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

const getBudgetStatusColor = (budget) => {
  const current = getCurrentValue(budget);
  if (current > budget.threshold) return 'text-red-600 dark:text-red-400';
  if (budget.alertThreshold && current > budget.alertThreshold) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
};

const getBudgetStatusClass = (budget) => {
  const current = getCurrentValue(budget);
  if (current > budget.threshold) return 'bg-red-500';
  if (budget.alertThreshold && current > budget.alertThreshold) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getBudgetStatusBadgeClass = (budget) => {
  const current = getCurrentValue(budget);
  if (current > budget.threshold) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  if (budget.alertThreshold && current > budget.alertThreshold) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
  return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
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
  loadAnalysis();
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

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

