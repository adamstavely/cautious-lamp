<template>
  <div class="w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative flex">
    <!-- Drawer -->
    <DocumentationDrawer :isOpen="drawerOpen" @close="closeDrawer" @toggle="toggleDrawer" />
    
    <!-- Main Content Area -->
    <div 
      class="flex-1 h-full transition-all duration-300 relative overflow-hidden"
      :style="drawerOpen ? 'margin-left: 256px;' : 'margin-left: 48px;'"
    >
      <!-- Breadcrumbs -->
      <Breadcrumbs />
      
      <div class="h-full overflow-y-auto">
        <div class="p-8">
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
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Dashboard/grid representing system health -->
                    <rect x="35" y="40" width="35" height="35" rx="4" fill="url(#healthGradient)" opacity="0.4"/>
                    <rect x="82.5" y="40" width="35" height="35" rx="4" fill="url(#healthGradient)" opacity="0.6"/>
                    <rect x="130" y="40" width="35" height="35" rx="4" fill="url(#healthGradient)" opacity="0.5"/>
                    <rect x="35" y="90" width="35" height="35" rx="4" fill="url(#healthGradient)" opacity="0.3"/>
                    <rect x="82.5" y="90" width="35" height="35" rx="4" fill="url(#healthGradient)" opacity="0.5"/>
                    <rect x="130" y="90" width="35" height="35" rx="4" fill="url(#healthGradient)" opacity="0.4"/>
                    <!-- Heartbeat/pulse line representing health monitoring -->
                    <path d="M 30 150 Q 50 140, 70 150 T 110 150 T 150 150 T 170 150" fill="none" stroke="url(#healthGradient)" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
                  </svg>
                </div>
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
                <h3 class="text-sm font-medium flex items-center gap-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">check_circle</span>
                  Overall Health
                </h3>
                <div v-if="healthScore?.trend" class="flex items-center gap-1">
                  <span 
                    class="material-symbols-outlined text-sm"
                    :class="healthScore.trend.direction === 'up' 
                      ? 'text-green-500' 
                      : healthScore.trend.direction === 'down' 
                      ? 'text-red-500' 
                      : 'text-gray-500'"
                  >
                    {{ healthScore.trend.direction === 'up' ? 'trending_up' : healthScore.trend.direction === 'down' ? 'trending_down' : 'trending_flat' }}
                  </span>
                  <span 
                    class="text-xs font-medium"
                    :class="healthScore.trend.direction === 'up' 
                      ? 'text-green-500' 
                      : healthScore.trend.direction === 'down' 
                      ? 'text-red-500' 
                      : 'text-gray-500'"
                  >
                    {{ healthScore.trend.change >= 0 ? '+' : '' }}{{ healthScore.trend.change.toFixed(1) }}
                  </span>
                </div>
              </div>
              <div class="text-4xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                {{ overallHealth.toFixed(1) }}%
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                <div 
                  class="h-2 rounded-full transition-all"
                  :class="overallHealth >= 80 ? 'bg-green-500' : overallHealth >= 60 ? 'bg-yellow-500' : 'bg-red-500'"
                  :style="{ width: `${Math.min(100, overallHealth)}%` }"
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
                <h3 class="text-sm font-medium flex items-center gap-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-indigo-400' : 'text-indigo-600'">widgets</span>
                  Components
                </h3>
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
                <h3 class="text-sm font-medium flex items-center gap-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-purple-400' : 'text-purple-600'">style</span>
                  Design Tokens
                </h3>
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
                <h3 class="text-sm font-medium flex items-center gap-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-base" :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'">accessibility</span>
                  Accessibility
                </h3>
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
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">info</span>
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
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">category</span>
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
                    <div class="w-32 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
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

        <!-- Health Score Factors -->
        <div v-if="healthScore" class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">analytics</span>
                Health Score Factors
              </h3>
              <p class="text-sm mt-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Weighted factors contributing to overall health score
              </p>
            </div>
            <div class="p-6">
              <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-2 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Component Coverage</div>
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ healthScore.factors.componentCoverage.toFixed(1) }}%
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Weight: 25%</div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-2 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Adoption Rate</div>
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ healthScore.factors.adoptionRate.toFixed(1) }}%
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Weight: 25%</div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-2 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Compliance</div>
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ healthScore.factors.compliance.toFixed(1) }}%
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Weight: 20%</div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-2 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Maintenance</div>
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ healthScore.factors.maintenance.toFixed(1) }}%
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Weight: 15%</div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-2 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Accessibility</div>
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ healthScore.factors.accessibility.toFixed(1) }}%
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">Weight: 15%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Health Score Trends -->
        <div v-if="healthScoreTrends.length > 0" class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">show_chart</span>
                Health Score Trends (Last 30 Days)
              </h3>
            </div>
            <div class="p-6">
              <div class="h-64 flex items-end gap-1">
                <div
                  v-for="(trend, index) in healthScoreTrends"
                  :key="index"
                  class="flex-1 group relative"
                >
                  <div
                    class="w-full rounded-t transition-all hover:opacity-80 cursor-pointer"
                    :class="trend.score >= 80 ? 'bg-green-500' : trend.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'"
                    :style="{ height: `${(trend.score / 100) * 100}%` }"
                    :title="`${new Date(trend.date).toLocaleDateString()}: ${trend.score.toFixed(1)}%`"
                  ></div>
                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div class="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {{ trend.score.toFixed(1) }}%
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex justify-between mt-4 text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                <span>{{ healthScoreTrends.length > 0 ? new Date(healthScoreTrends[0].date).toLocaleDateString() : '' }}</span>
                <span>{{ healthScoreTrends.length > 0 ? new Date(healthScoreTrends[healthScoreTrends.length - 1].date).toLocaleDateString() : '' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Health Score Recommendations -->
        <div v-if="healthScoreRecommendations.length > 0" class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">lightbulb</span>
                Recommendations to Improve Health Score
              </h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div
                  v-for="rec in healthScoreRecommendations"
                  :key="rec.id"
                  class="p-4 rounded-lg border"
                  :class="rec.priority === 'high'
                    ? (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                    : rec.priority === 'medium'
                    ? (isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200')
                    : (isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200')"
                >
                  <div class="flex items-start gap-3">
                    <span 
                      class="material-symbols-outlined flex-shrink-0 mt-0.5"
                      :class="rec.priority === 'high' ? 'text-red-400' : rec.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'"
                    >
                      {{ rec.priority === 'high' ? 'priority_high' : 'info' }}
                    </span>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-semibold" :class="rec.priority === 'high' 
                          ? (isDarkMode ? 'text-red-300' : 'text-red-900')
                          : rec.priority === 'medium'
                          ? (isDarkMode ? 'text-yellow-300' : 'text-yellow-900')
                          : (isDarkMode ? 'text-blue-300' : 'text-blue-900')">
                          {{ rec.title }}
                        </h4>
                        <span class="px-2 py-0.5 rounded text-xs font-medium"
                          :class="rec.priority === 'high'
                            ? (isDarkMode ? 'bg-red-700 text-red-200' : 'bg-red-100 text-red-700')
                            : rec.priority === 'medium'
                            ? (isDarkMode ? 'bg-yellow-700 text-yellow-200' : 'bg-yellow-100 text-yellow-700')
                            : (isDarkMode ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700')"
                        >
                          {{ rec.priority.toUpperCase() }}
                        </span>
                      </div>
                      <p class="text-sm mb-2" :class="rec.priority === 'high' 
                        ? (isDarkMode ? 'text-red-200' : 'text-red-800')
                        : rec.priority === 'medium'
                        ? (isDarkMode ? 'text-yellow-200' : 'text-yellow-800')
                        : (isDarkMode ? 'text-blue-200' : 'text-blue-800')">
                        {{ rec.description }}
                      </p>
                      <p class="text-xs mb-2 font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Impact: {{ rec.impact }}
                      </p>
                      <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ rec.action }}
                      </p>
                    </div>
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
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">warning</span>
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
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">trending_up</span>
                Component Adoption
              </h3>
              <Dropdown
                :model-value="adoptionTimeframe"
                @update:model-value="adoptionTimeframe = $event"
                :options="[
                  { value: '7d', label: 'Last 7 days' },
                  { value: '30d', label: 'Last 30 days' },
                  { value: '90d', label: 'Last 90 days' },
                  { value: 'all', label: 'All time' }
                ]"
                :is-dark-mode="isDarkMode"
                label="Select timeframe"
              />
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
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">analytics</span>
                Design System Analytics
              </h3>
            </div>
            <div class="p-6">
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <!-- Most Used Components -->
                <div>
                  <h4 class="text-sm font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <span class="material-symbols-outlined text-base text-indigo-600">star</span>
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
                  <h4 class="text-sm font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <span class="material-symbols-outlined text-base text-indigo-600">pattern</span>
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
                  <h4 class="text-sm font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                    <span class="material-symbols-outlined text-base text-indigo-600">speed</span>
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
                <h4 class="text-sm font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  <span class="material-symbols-outlined text-base text-indigo-600">show_chart</span>
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

        <!-- Design Debt Metrics -->
        <div v-if="designDebtMetrics" class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">construction</span>
                Design Debt Metrics
              </h3>
            </div>
            <div class="p-6">
              <div class="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Deprecated Components in Use
                  </div>
                  <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ designDebtMetrics.deprecatedComponentsInUse }}
                  </div>
                </div>
                <div>
                  <div class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Custom Components
                  </div>
                  <div class="text-3xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ designDebtMetrics.customComponentCount }}
                  </div>
                </div>
                <div>
                  <div class="text-sm mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Technical Debt Score
                  </div>
                  <div class="text-3xl font-bold" 
                    :class="designDebtMetrics.technicalDebtScore >= 70 
                      ? 'text-red-500' 
                      : designDebtMetrics.technicalDebtScore >= 40 
                      ? 'text-yellow-500' 
                      : 'text-green-500'"
                  >
                    {{ designDebtMetrics.technicalDebtScore }}/100
                  </div>
                </div>
              </div>
              <div v-if="designDebtMetrics.recommendations && designDebtMetrics.recommendations.length > 0">
                <h4 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                  Recommendations
                </h4>
                <ul class="space-y-2">
                  <li 
                    v-for="(rec, index) in designDebtMetrics.recommendations"
                    :key="index"
                    class="flex items-start gap-2 text-sm"
                    :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                  >
                    <span class="material-symbols-outlined text-indigo-600 text-base">check_circle</span>
                    {{ rec }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Cross-Application Comparison -->
        <div v-if="crossApplicationComparison.length > 0" class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">compare_arrows</span>
                Cross-Application Comparison
              </h3>
            </div>
            <div class="p-6">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                      <th class="text-left py-3 px-4 text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Application
                      </th>
                      <th class="text-left py-3 px-4 text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Components Used
                      </th>
                      <th class="text-left py-3 px-4 text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Adoption Rate
                      </th>
                      <th class="text-left py-3 px-4 text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        Shared Components
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="app in crossApplicationComparison"
                      :key="app.applicationId"
                      class="border-b"
                      :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
                    >
                      <td class="py-3 px-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ app.applicationName }}
                      </td>
                      <td class="py-3 px-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ app.uniqueComponents }}
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <div class="w-24 bg-gray-200 rounded-full h-2" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
                            <div 
                              class="bg-indigo-500 h-2 rounded-full"
                              :style="{ width: `${app.adoptionRate}%` }"
                            ></div>
                          </div>
                          <span class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                            {{ app.adoptionRate.toFixed(1) }}%
                          </span>
                        </div>
                      </td>
                      <td class="py-3 px-4" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ app.sharedComponents.length }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit Reports Section -->
        <div class="max-w-7xl mx-auto mb-8">
          <div 
            class="rounded-lg shadow-sm border"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    <span class="material-symbols-outlined text-indigo-600">description</span>
                    Audit Reports
                  </h3>
                  <p class="text-sm mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    Generate comprehensive audit reports for stakeholders, compliance, and planning
                  </p>
                </div>
                <button
                  @click="generateAuditReport"
                  :disabled="generatingReport"
                  class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  :class="generatingReport
                    ? (isDarkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed')
                    : (isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white')"
                >
                  <span v-if="generatingReport" class="material-symbols-outlined text-base animate-spin">refresh</span>
                  <span v-else class="material-symbols-outlined text-base">add</span>
                  {{ generatingReport ? 'Generating...' : 'Generate Report' }}
                </button>
              </div>
            </div>

            <!-- Executive Summary -->
            <div v-if="auditReport" class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <h4 class="text-md font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-base text-indigo-600">summarize</span>
                Executive Summary
              </h4>
              <div class="grid md:grid-cols-3 gap-4 mb-6">
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Overall Health Score</div>
                  <div class="text-3xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ auditReport.executiveSummary.overallHealthScore.toFixed(1) }}%
                  </div>
                  <div class="text-sm font-semibold" :class="getHealthGradeColor(auditReport.executiveSummary.healthGrade)">
                    Grade: {{ auditReport.executiveSummary.healthGrade }}
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Components</div>
                  <div class="text-3xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ auditReport.components.total }}
                  </div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ auditReport.components.byStatus.production.length }} production ready
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-xs mb-1 font-medium" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Accessibility</div>
                  <div class="text-3xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ auditReport.detailedMetrics.accessibility.score.toFixed(1) }}%
                  </div>
                  <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    WCAG {{ auditReport.detailedMetrics.accessibility.wcagLevel }}
                  </div>
                </div>
              </div>

              <!-- Key Findings -->
              <div class="mb-6">
                <h5 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Key Findings</h5>
                <ul class="space-y-2">
                  <li 
                    v-for="(finding, idx) in auditReport.executiveSummary.keyFindings" 
                    :key="idx"
                    class="flex items-start gap-2 text-sm"
                    :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                  >
                    <span class="material-symbols-outlined text-base text-indigo-600 mt-0.5">check_circle</span>
                    {{ finding }}
                  </li>
                </ul>
              </div>

              <!-- Export Options -->
              <div class="flex items-center gap-3 pt-4 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                <span class="text-sm font-medium" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Export Report:</span>
                <button
                  @click="exportReport('json')"
                  class="px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2"
                  :class="isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'"
                >
                  <span class="material-symbols-outlined text-base">code</span>
                  JSON
                </button>
                <button
                  @click="exportReport('csv')"
                  class="px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2"
                  :class="isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'"
                >
                  <span class="material-symbols-outlined text-base">table_chart</span>
                  CSV
                </button>
                <button
                  @click="exportReport('pdf')"
                  class="px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2"
                  :class="isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white border border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'"
                >
                  <span class="material-symbols-outlined text-base">picture_as_pdf</span>
                  PDF
                </button>
              </div>
            </div>

            <!-- Detailed Report Sections -->
            <div v-if="auditReport && showDetailedReport" class="p-6 space-y-6">
              <!-- Detailed Metrics -->
              <div>
                <h4 class="text-md font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Detailed Metrics</h4>
                <div class="grid md:grid-cols-2 gap-4">
                  <div class="p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <h5 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Component Metrics</h5>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Production Ready:</span>
                        <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ auditReport.detailedMetrics.components.production }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">In Progress:</span>
                        <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ auditReport.detailedMetrics.components.inProgress }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Deprecated:</span>
                        <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ auditReport.detailedMetrics.components.deprecated }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-gray-50 border-gray-200'">
                    <h5 class="text-sm font-semibold mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Compliance Metrics</h5>
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Compliance Score:</span>
                        <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ auditReport.detailedMetrics.compliance.score.toFixed(1) }}%</span>
                      </div>
                      <div class="flex justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Level:</span>
                        <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ auditReport.detailedMetrics.compliance.level }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">WCAG Compliant:</span>
                        <span :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ auditReport.detailedMetrics.compliance.wcagCompliance ? 'Yes' : 'No' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Next Steps -->
              <div>
                <h4 class="text-md font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">Recommended Next Steps</h4>
                <ul class="space-y-2">
                  <li 
                    v-for="(step, idx) in auditReport.nextSteps" 
                    :key="idx"
                    class="flex items-start gap-2 text-sm p-3 rounded-lg"
                    :class="isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-indigo-50 text-gray-700'"
                  >
                    <span class="material-symbols-outlined text-base text-indigo-600 mt-0.5">arrow_forward</span>
                    {{ step }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Toggle Detailed Report -->
            <div v-if="auditReport" class="p-6 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <button
                @click="showDetailedReport = !showDetailedReport"
                class="text-sm font-medium flex items-center gap-2 transition-colors"
                :class="isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'"
              >
                <span class="material-symbols-outlined text-base">
                  {{ showDetailedReport ? 'expand_less' : 'expand_more' }}
                </span>
                {{ showDetailedReport ? 'Hide' : 'Show' }} Detailed Report
              </button>
            </div>

            <!-- Empty State -->
            <div v-if="!auditReport && !generatingReport" class="p-12 text-center">
              <span class="material-symbols-outlined text-5xl mb-4" :class="isDarkMode ? 'text-gray-600' : 'text-gray-300'">
                description
              </span>
              <p class="text-sm mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Generate a comprehensive audit report to document your design system's current state
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import Dropdown from '../components/Dropdown.vue';

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

// Enhanced health score data from API
const healthScore = ref(null);
const healthScoreTrends = ref([]);
const healthScoreAlerts = ref([]);
const healthScoreRecommendations = ref([]);
const loadingHealthScore = ref(false);

// Audit report state
const auditReport = ref(null);
const generatingReport = ref(false);
const showDetailedReport = ref(false);

// Load health score data from API
const loadHealthScore = async () => {
  loadingHealthScore.value = true;
  try {
    const response = await axios.get('/api/v1/system-health/score');
    healthScore.value = response.data;
    healthScoreAlerts.value = response.data.alerts || [];
    healthScoreRecommendations.value = response.data.recommendations || [];
  } catch (error) {
    console.error('Error loading health score:', error);
    // Fallback to computed value if API fails
  } finally {
    loadingHealthScore.value = false;
  }
};

// Load health score trends
const loadHealthScoreTrends = async (days = 30) => {
  try {
    const response = await axios.get(`/api/v1/system-health/trends?days=${days}`);
    healthScoreTrends.value = response.data;
  } catch (error) {
    console.error('Error loading health score trends:', error);
  }
};

// Computed overall health - use API data if available, otherwise fallback
const overallHealth = computed(() => {
  if (healthScore.value) {
    return healthScore.value.score;
  }
  // Fallback calculation
  const componentScore = (metrics.value.components.productionReady / metrics.value.components.total) * 100;
  const accessibilityScore = metrics.value.accessibility.score;
  const deprecatedPenalty = (metrics.value.components.deprecated / metrics.value.components.total) * 20;
  
  return Math.round((componentScore + accessibilityScore) / 2 - deprecatedPenalty);
});

// Combined alerts - merge API alerts with static alerts
const alerts = computed(() => {
  const staticAlerts = [
    {
      id: 'static-1',
      severity: 'medium',
      title: '4 Components In Progress',
      message: 'Some components are still in development and may have breaking changes.',
      action: 'View Components',
      actionPath: '/components/status',
    },
  ];
  
  // Add health score alerts from API
  const healthAlerts = healthScoreAlerts.value.map((alert, index) => ({
    id: `health-${alert.severity}-${index}`,
    severity: alert.severity,
    title: 'Health Score Alert',
    message: alert.message,
    action: null,
    actionPath: null,
  }));
  
  return [...healthAlerts, ...staticAlerts];
});

const topComponents = ref([]);
const mostUsedComponents = ref([]);
const applicationAdoption = ref([]);
const designDebtMetrics = ref(null);
const crossApplicationComparison = ref([]);
const loadingAnalytics = ref(false);

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

const usageTrends = ref([]);

const loadAnalytics = async () => {
  loadingAnalytics.value = true;
  try {
    // Load component popularity
    const popularityResponse = await axios.get(`/api/v1/analytics/component-popularity?timeframe=${adoptionTimeframe.value}`);
    const popularity = popularityResponse.data || [];
    
    // Update top components with real data
    topComponents.value = popularity.slice(0, 6).map(comp => ({
      name: comp.componentName,
      status: 'Production Ready', // TODO: Get from component status
      adoption: comp.adoptionRate,
      usage: comp.totalUsage,
    }));

    // Update most used components
    mostUsedComponents.value = popularity.slice(0, 5).map(comp => ({
      name: comp.componentName,
      usage: comp.totalUsage,
    }));

    // Load application adoption
    const adoptionResponse = await axios.get('/api/v1/analytics/application-adoption');
    applicationAdoption.value = adoptionResponse.data || [];

    // Load usage trends
    const trendsResponse = await axios.get('/api/v1/analytics/usage-trends?days=30');
    const trends = trendsResponse.data || [];
    const maxUsage = Math.max(...trends.map(t => t.totalUsage), 1);
    usageTrends.value = trends.map(trend => {
      const date = new Date(trend.date);
      return {
        date: trend.date,
        usage: trend.totalUsage,
        percentage: (trend.totalUsage / maxUsage) * 100,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      };
    });

    // Load design debt metrics
    const debtResponse = await axios.get('/api/v1/analytics/design-debt');
    designDebtMetrics.value = debtResponse.data;

    // Load cross-application comparison
    const comparisonResponse = await axios.get('/api/v1/analytics/cross-application-comparison');
    crossApplicationComparison.value = comparisonResponse.data || [];
  } catch (error) {
    console.error('Error loading analytics:', error);
    // Keep mock data as fallback
  } finally {
    loadingAnalytics.value = false;
  }
};

watch(adoptionTimeframe, () => {
  loadAnalytics();
});

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

onMounted(async () => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }

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

  // Load health score data
  await loadHealthScore();
  await loadHealthScoreTrends(30);
  await loadAnalytics();
});

onBeforeUnmount(() => {
  if (darkModeObserver) {
    darkModeObserver.disconnect();
  }
  if (darkModeInterval) {
    clearInterval(darkModeInterval);
  }
});

// Generate audit report
const generateAuditReport = async () => {
  generatingReport.value = true;
  try {
    const response = await axios.get('/api/v1/system-health/audit-report');
    auditReport.value = response.data;
    showDetailedReport.value = false; // Start with summary view
  } catch (error) {
    console.error('Error generating audit report:', error);
    alert('Failed to generate audit report. Please try again.');
  } finally {
    generatingReport.value = false;
  }
};

// Export report in different formats
const exportReport = (format) => {
  if (!auditReport.value) return;

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `design-system-audit-${timestamp}`;

  if (format === 'json') {
    const dataStr = JSON.stringify(auditReport.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } else if (format === 'csv') {
    // Convert key metrics to CSV
    const csvRows = [
      ['Metric', 'Value'],
      ['Overall Health Score', auditReport.value.executiveSummary.overallHealthScore.toFixed(1) + '%'],
      ['Health Grade', auditReport.value.executiveSummary.healthGrade],
      ['Total Components', auditReport.value.components.total],
      ['Production Ready', auditReport.value.components.byStatus.production.length],
      ['In Progress', auditReport.value.components.byStatus.inProgress.length],
      ['Deprecated', auditReport.value.components.byStatus.deprecated.length],
      ['Accessibility Score', auditReport.value.detailedMetrics.accessibility.score.toFixed(1) + '%'],
      ['WCAG Level', auditReport.value.detailedMetrics.accessibility.wcagLevel],
      ['Compliance Score', auditReport.value.detailedMetrics.compliance.score.toFixed(1) + '%'],
      ['Adoption Rate', auditReport.value.detailedMetrics.adoption.overallRate.toFixed(1) + '%'],
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } else if (format === 'pdf') {
    // For PDF, we'd need a library like jsPDF or html2pdf
    // For now, show a message that PDF export requires additional setup
    alert('PDF export requires additional setup. Please use JSON or CSV export for now.');
  }
};

// Get health grade color
const getHealthGradeColor = (grade) => {
  const colors = {
    'A': isDarkMode.value ? 'text-green-400' : 'text-green-600',
    'B': isDarkMode.value ? 'text-blue-400' : 'text-blue-600',
    'C': isDarkMode.value ? 'text-yellow-400' : 'text-yellow-600',
    'D': isDarkMode.value ? 'text-orange-400' : 'text-orange-600',
    'F': isDarkMode.value ? 'text-red-400' : 'text-red-600',
  };
  return colors[grade] || (isDarkMode.value ? 'text-gray-400' : 'text-gray-600');
};
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

