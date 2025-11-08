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
                  Accessibility Reports
                </h1>
                <p class="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
                  Automated WCAG compliance monitoring, trend tracking, and prioritized fix recommendations. Stay on top of accessibility across all your applications.
                </p>
              </div>
              <div class="hidden md:block flex-shrink-0">
                <div class="w-64 h-64 relative">
                  <svg viewBox="0 0 200 200" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="accessibilityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                    <!-- Accessibility icon - person with circle representing inclusion -->
                    <circle cx="100" cy="100" r="60" fill="none" stroke="url(#accessibilityGradient)" stroke-width="4" opacity="0.6"/>
                    <circle cx="100" cy="80" r="20" fill="url(#accessibilityGradient)" opacity="0.8"/>
                    <path d="M 100 100 L 100 140 M 80 120 L 120 120" stroke="url(#accessibilityGradient)" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
                    <!-- Checkmark representing compliance -->
                    <path d="M 50 50 L 70 70 L 90 50" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
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
              @click="activeTab = 'dashboard'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'dashboard'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Dashboard
              <div 
                v-if="activeTab === 'dashboard'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
            <button
              @click="activeTab = 'reports'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'reports'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Report History
              <div 
                v-if="activeTab === 'reports'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
            <button
              @click="activeTab = 'multi-app'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'multi-app'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Multi-Application
              <div 
                v-if="activeTab === 'multi-app'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
            <button
              @click="activeTab = 'schedules'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'schedules'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              Schedules
              <div 
                v-if="activeTab === 'schedules'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
            <button
              @click="activeTab = 'slas'"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === 'slas'
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
            >
              SLA Management
              <div 
                v-if="activeTab === 'slas'"
                class="absolute bottom-0 left-0 right-0 h-0.5"
                :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"
              ></div>
            </button>
          </div>
        </div>

        <!-- Dashboard Tab -->
        <div v-if="activeTab === 'dashboard'" class="max-w-7xl mx-auto space-y-6">
          <!-- Application Selector -->
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold mb-2 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">apps</span>
                  Select Application
                </h3>
                <p class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Choose an application to view accessibility reports
                </p>
              </div>
              <Dropdown
                v-if="applicationOptions.length > 0"
                v-model="selectedApplicationId"
                :options="applicationOptions"
                :is-dark-mode="isDarkMode"
                label="Application"
                class="min-w-[300px]"
                @update:model-value="loadReport"
              />
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Generating accessibility report...</p>
            </div>
          </div>

          <!-- Report Dashboard -->
          <div v-else-if="currentReport" class="space-y-6">
            <!-- WCAG Compliance Overview -->
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-lg" :class="getScoreColor(currentReport.complianceScore)">check_circle</span>
                  Compliance Score
                </div>
                <div class="text-4xl font-bold mb-2" :class="getScoreColor(currentReport.complianceScore)">
                  {{ currentReport.complianceScore }}%
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ currentReport.wcagLevel === 'AA' ? 'WCAG 2.1 AA' : currentReport.wcagLevel === 'AAA' ? 'WCAG 2.1 AAA' : currentReport.wcagLevel === 'A' ? 'WCAG 2.1 A' : 'Non-Compliant' }}
                </div>
              </div>

              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-lg text-red-500">error</span>
                  Critical Issues
                </div>
                <div class="text-4xl font-bold text-red-500">
                  {{ currentReport.criticalIssues }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  Blocking accessibility
                </div>
              </div>

              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-lg text-orange-500">warning</span>
                  Total Issues
                </div>
                <div class="text-4xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  {{ currentReport.totalIssues }}
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ currentReport.highIssues }} high, {{ currentReport.moderateIssues }} moderate, {{ currentReport.lowIssues }} low
                </div>
              </div>

              <div 
                class="rounded-lg shadow-sm border p-6"
                :class="isDarkMode 
                  ? 'bg-slate-900 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  <span class="material-symbols-outlined text-lg" :class="currentReport.trend.scoreChange >= 0 ? 'text-green-500' : 'text-red-500'">
                    {{ currentReport.trend.scoreChange >= 0 ? 'trending_up' : 'trending_down' }}
                  </span>
                  Trend
                </div>
                <div class="text-4xl font-bold" :class="currentReport.trend.scoreChange >= 0 ? 'text-green-500' : 'text-red-500'">
                  {{ currentReport.trend.scoreChange >= 0 ? '+' : '' }}{{ currentReport.trend.scoreChange.toFixed(1) }}%
                </div>
                <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                  {{ currentReport.trend.fixedIssues }} fixed, {{ currentReport.trend.newIssues }} new
                </div>
              </div>
            </div>

            <!-- Issues by Category -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">category</span>
                Issues by Category
              </h3>
              <div class="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div v-for="(count, category) in currentReport.issuesByCategory" :key="category" class="text-center">
                  <div class="text-2xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ count }}
                  </div>
                  <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                    {{ formatCategoryName(category) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Prioritized Fixes -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  <span class="material-symbols-outlined text-indigo-600">priority_high</span>
                  Prioritized Fixes
                </h3>
                <div class="flex items-center gap-2">
                  <button
                    @click="exportToPDF"
                    class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    :class="isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                  >
                    <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
                    Export PDF
                  </button>
                  <button
                    @click="generateReport"
                    class="px-4 py-2 rounded-lg font-medium transition-colors"
                    :class="isDarkMode 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
                  >
                    Generate New Report
                  </button>
                </div>
              </div>
              <div class="space-y-3">
                <div
                  v-for="fix in currentReport.prioritizedFixes.slice(0, 10)"
                  :key="fix.id"
                  class="p-4 rounded-lg border"
                  :class="getSeverityClass(fix.severity)"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="px-2 py-1 rounded text-xs font-medium" :class="getSeverityBadgeClass(fix.severity)">
                          {{ fix.severity ? String(fix.severity).toUpperCase() : 'UNKNOWN' }}
                        </span>
                        <span class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ fix.rule }}
                        </span>
                      </div>
                      <p class="text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ fix.description }}
                      </p>
                      <div class="flex items-center gap-4 text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        <span>WCAG {{ fix.wcagCriterion }}</span>
                        <span>{{ fix.affectedElements }} elements</span>
                        <span>Effort: {{ fix.effort }}</span>
                        <span>Priority: {{ fix.priority.toFixed(1) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 p-3 rounded" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Recommendation:
                    </div>
                    <div class="text-sm mb-3" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ fix.recommendation }}
                    </div>
                    
                    <!-- Code Examples -->
                    <div v-if="fix.codeExamples && fix.codeExamples.length > 0" class="mt-4 space-y-4">
                      <div class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        Code Examples
                      </div>
                      <div
                        v-for="(example, idx) in fix.codeExamples"
                        :key="idx"
                        class="space-y-2"
                      >
                        <p class="text-xs italic" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          {{ example.explanation }}
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-red-300' : 'text-red-600'">
                              Before
                            </p>
                            <pre class="text-xs p-2 rounded overflow-x-auto" :class="isDarkMode ? 'bg-slate-900 text-gray-300 border border-red-800' : 'bg-red-50 text-red-900 border border-red-200'"><code>{{ example.before }}</code></pre>
                          </div>
                          <div>
                            <p class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-green-300' : 'text-green-600'">
                              After
                            </p>
                            <pre class="text-xs p-2 rounded overflow-x-auto" :class="isDarkMode ? 'bg-slate-900 text-gray-300 border border-green-800' : 'bg-green-50 text-green-900 border border-green-200'"><code>{{ example.after }}</code></pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- WCAG Criteria Breakdown -->
            <div 
              class="rounded-lg shadow-sm border p-6"
              :class="isDarkMode 
                ? 'bg-slate-900 border-gray-700' 
                : 'bg-white border-gray-200'"
            >
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">checklist</span>
                WCAG Criteria Compliance
              </h3>
              <div class="space-y-4">
                <div
                  v-for="(criterion, key) in currentReport.wcagCriteria"
                  :key="key"
                  class="rounded-lg border p-4"
                  :class="criterion.status === 'pass' 
                    ? (isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
                    : criterion.status === 'fail'
                    ? (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                    : (isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200')"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-sm font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ criterion.criterion }}
                        </span>
                        <span class="px-2 py-0.5 rounded text-xs" :class="criterion.level === 'AAA' 
                          ? (isDarkMode ? 'bg-purple-700 text-purple-200' : 'bg-purple-100 text-purple-700')
                          : criterion.level === 'AA'
                          ? (isDarkMode ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700')
                          : (isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700')"
                        >
                          Level {{ criterion.level }}
                        </span>
                      </div>
                      <p class="text-xs mb-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ criterion.description }}
                      </p>
                    </div>
                    <div class="text-right ml-4">
                      <div class="text-lg font-bold" :class="criterion.status === 'pass' 
                        ? 'text-green-600' 
                        : criterion.status === 'fail'
                        ? 'text-red-600'
                        : 'text-yellow-600'"
                      >
                        {{ criterion.issues }}
                      </div>
                      <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ criterion.status === 'pass' ? 'Pass' : criterion.status === 'fail' ? 'Fail' : 'Warning' }}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Failing Elements -->
                  <div v-if="criterion.failingElements && Array.isArray(criterion.failingElements) && criterion.failingElements.length > 0" class="mt-3 pt-3 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <div class="text-xs font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      Failing Elements ({{ criterion.failingElements.length }}):
                    </div>
                    <div class="space-y-2">
                      <div
                        v-for="(element, idx) in criterion.failingElements"
                        :key="element.id || idx"
                        class="p-2 rounded text-xs"
                        :class="getElementImpactClass(element.impact)"
                      >
                        <div class="font-medium mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                          {{ element.message }}
                        </div>
                        <div class="flex items-center gap-3 text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                          <span v-if="element.file" class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">description</span>
                            {{ element.file }}
                            <span v-if="element.line">:{{ element.line }}</span>
                          </span>
                          <span v-if="element.impact" class="px-1.5 py-0.5 rounded text-xs font-medium" :class="getSeverityBadgeClass(element.impact)">
                            {{ element.impact }}
                          </span>
                        </div>
                        <div v-if="element.element" class="mt-1 font-mono text-xs p-1 rounded" :class="isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'">
                          {{ element.element }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Debug: Show if failingElements is missing or empty -->
                  <div v-else-if="criterion.issues > 0" class="mt-3 pt-3 border-t text-xs italic" :class="isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'">
                    No failing elements data available ({{ criterion.issues }} issues reported)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Report State -->
          <div v-else class="text-center py-12">
            <p class="text-lg mb-4" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              No report available. Generate a report to view accessibility metrics.
            </p>
            <button
              @click="generateReport"
              class="px-6 py-3 rounded-lg font-medium transition-colors"
              :class="isDarkMode 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
            >
              Generate Report
            </button>
          </div>
        </div>

        <!-- Report History Tab -->
        <div v-if="activeTab === 'reports'" class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-indigo-600">history</span>
              Report History
            </h3>
            <div v-if="reports.length === 0" class="text-center py-8">
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">No reports generated yet.</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="report in reports"
                :key="report.id"
                @click="loadReportById(report.id)"
                class="p-4 rounded-lg border cursor-pointer transition-colors"
                :class="currentReport?.id === report.id
                  ? (isDarkMode ? 'bg-indigo-900/20 border-indigo-600' : 'bg-indigo-50 border-indigo-500')
                  : (isDarkMode ? 'bg-slate-800 border-gray-700 hover:bg-slate-700' : 'bg-white border-gray-200 hover:bg-gray-50')"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ report.applicationName }}
                    </div>
                    <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ formatDate(report.generatedAt) }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold mb-1" :class="getScoreColor(report.complianceScore)">
                      {{ report.complianceScore }}%
                    </div>
                    <div class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ report.totalIssues }} issues
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Schedules Tab -->
        <div v-if="activeTab === 'schedules'" class="max-w-7xl mx-auto">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">schedule</span>
                Scheduled Reports
              </h3>
              <button
                @click="showScheduleModal = true"
                class="px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
              >
                Create Schedule
              </button>
            </div>
            <div v-if="schedules.length === 0" class="text-center py-8">
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">No schedules configured.</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="schedule in schedules"
                :key="schedule.id"
                class="p-4 rounded-lg border"
                :class="isDarkMode 
                  ? 'bg-slate-800 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-semibold mb-1" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ getApplicationName(schedule.applicationId) }}
                    </div>
                    <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ schedule.frequency }} at {{ schedule.time }}
                      <span v-if="schedule.frequency === 'weekly'"> on {{ getDayName(schedule.dayOfWeek) }}</span>
                      <span v-if="schedule.frequency === 'monthly'"> on day {{ schedule.dayOfMonth }}</span>
                    </div>
                    <div v-if="schedule.nextRun" class="text-xs mt-1" :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'">
                      Next run: {{ formatDate(schedule.nextRun) }}
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span 
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="schedule.enabled 
                        ? (isDarkMode ? 'bg-green-700 text-green-200' : 'bg-green-100 text-green-700')
                        : (isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700')"
                    >
                      {{ schedule.enabled ? 'Enabled' : 'Disabled' }}
                    </span>
                    <button
                      @click="toggleSchedule(schedule.id)"
                      class="px-3 py-1 rounded text-sm"
                      :class="isDarkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                    >
                      {{ schedule.enabled ? 'Disable' : 'Enable' }}
                    </button>
                    <button
                      @click="deleteSchedule(schedule.id)"
                      class="px-3 py-1 rounded text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Multi-Application Dashboard Tab -->
        <div v-if="activeTab === 'multi-app'" class="max-w-7xl mx-auto space-y-6">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-indigo-600">dashboard</span>
              Multi-Application Compliance Dashboard
            </h3>
            
            <div v-if="complianceSummary" class="space-y-6">
              <!-- Summary Cards -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Total Applications</div>
                  <div class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ complianceSummary.totalApplications }}
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'">
                  <div class="text-sm mb-1" :class="isDarkMode ? 'text-green-300' : 'text-green-700'">Compliant</div>
                  <div class="text-2xl font-bold text-green-600">
                    {{ complianceSummary.compliantApplications }}
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'">
                  <div class="text-sm mb-1" :class="isDarkMode ? 'text-red-300' : 'text-red-700'">Non-Compliant</div>
                  <div class="text-2xl font-bold text-red-600">
                    {{ complianceSummary.nonCompliantApplications }}
                  </div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-sm mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Average Score</div>
                  <div class="text-2xl font-bold" :class="getScoreColor(complianceSummary.averageScore)">
                    {{ complianceSummary.averageScore.toFixed(1) }}%
                  </div>
                </div>
              </div>

              <!-- Applications Table -->
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                      <th class="text-left py-3 px-4 text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Application</th>
                      <th class="text-left py-3 px-4 text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Score</th>
                      <th class="text-left py-3 px-4 text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">WCAG Level</th>
                      <th class="text-left py-3 px-4 text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Issues</th>
                      <th class="text-left py-3 px-4 text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">SLA Status</th>
                      <th class="text-left py-3 px-4 text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Last Report</th>
                      <th class="text-left py-3 px-4 text-sm font-semibold" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="app in complianceSummary.applications"
                      :key="app.applicationId"
                      @click="app.latestReportId && loadReportById(app.latestReportId)"
                      class="border-b cursor-pointer hover:bg-opacity-50 transition-colors"
                      :class="isDarkMode 
                        ? 'border-gray-700 hover:bg-indigo-900/20' 
                        : 'border-gray-200 hover:bg-indigo-50'"
                    >
                      <td class="py-3 px-4 font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                        {{ app.applicationName }}
                      </td>
                      <td class="py-3 px-4">
                        <span class="text-lg font-bold" :class="getScoreColor(app.complianceScore)">
                          {{ app.complianceScore }}%
                        </span>
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded text-xs font-medium"
                          :class="app.wcagLevel === 'AA' || app.wcagLevel === 'AAA' 
                            ? (isDarkMode ? 'bg-green-700 text-green-200' : 'bg-green-100 text-green-700')
                            : (isDarkMode ? 'bg-red-700 text-red-200' : 'bg-red-100 text-red-700')"
                        >
                          {{ app.wcagLevel === 'AA' ? 'WCAG 2.1 AA' : app.wcagLevel === 'AAA' ? 'WCAG 2.1 AAA' : app.wcagLevel === 'A' ? 'WCAG 2.1 A' : 'Non-Compliant' }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                        {{ app.totalIssues }} ({{ app.criticalIssues }} critical, {{ app.highIssues }} high)
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded text-xs font-medium"
                          :class="app.slaStatus === 'compliant'
                            ? (isDarkMode ? 'bg-green-700 text-green-200' : 'bg-green-100 text-green-700')
                            : app.slaStatus === 'at-risk'
                            ? (isDarkMode ? 'bg-yellow-700 text-yellow-200' : 'bg-yellow-100 text-yellow-700')
                            : (isDarkMode ? 'bg-red-700 text-red-200' : 'bg-red-100 text-red-700')"
                        >
                          {{ app.slaStatus ? app.slaStatus.toUpperCase() : 'N/A' }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                        {{ app.lastReportDate ? formatDate(app.lastReportDate) : 'Never' }}
                      </td>
                      <td class="py-3 px-4">
                        <div v-if="app.trend" class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-sm" :class="app.trend.scoreChange >= 0 ? 'text-green-500' : 'text-red-500'">
                            {{ app.trend.scoreChange >= 0 ? 'trending_up' : 'trending_down' }}
                          </span>
                          <span class="text-xs" :class="app.trend.scoreChange >= 0 ? 'text-green-500' : 'text-red-500'">
                            {{ app.trend.scoreChange >= 0 ? '+' : '' }}{{ app.trend.scoreChange.toFixed(1) }}%
                          </span>
                        </div>
                        <span v-else class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">No trend</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Loading compliance summary...</p>
            </div>
          </div>
        </div>

        <!-- SLA Management Tab -->
        <div v-if="activeTab === 'slas'" class="max-w-7xl mx-auto space-y-6">
          <div 
            class="rounded-lg shadow-sm border p-6"
            :class="isDarkMode 
              ? 'bg-slate-900 border-gray-700' 
              : 'bg-white border-gray-200'"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                <span class="material-symbols-outlined text-indigo-600">gavel</span>
                Compliance SLA Management
              </h3>
              <button
                @click="showSLAModal = true"
                class="px-4 py-2 rounded-lg font-medium transition-colors"
                :class="isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'"
              >
                Create SLA
              </button>
            </div>
            <div v-if="slas.length === 0" class="text-center py-8">
              <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">No SLAs configured. Create one to track compliance targets.</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="sla in slas"
                :key="sla.id"
                class="p-4 rounded-lg border"
                :class="isDarkMode 
                  ? 'bg-slate-800 border-gray-700' 
                  : 'bg-white border-gray-200'"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                      {{ getApplicationName(sla.applicationId) }}
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div class="text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Target Score</div>
                        <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ sla.targetScore }}%</div>
                      </div>
                      <div>
                        <div class="text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Target Level</div>
                        <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">WCAG 2.1 {{ sla.targetLevel }}</div>
                      </div>
                      <div>
                        <div class="text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Max Critical Issues</div>
                        <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ sla.criticalIssuesThreshold }}</div>
                      </div>
                      <div>
                        <div class="text-xs mb-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">Max High Issues</div>
                        <div class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ sla.highIssuesThreshold }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 ml-4">
                    <button
                      @click="editSLA(sla)"
                      class="px-3 py-1 rounded text-sm"
                      :class="isDarkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                    >
                      Edit
                    </button>
                    <button
                      @click="deleteSLA(sla.id)"
                      class="px-3 py-1 rounded text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Schedule Modal -->
    <div
      v-if="showScheduleModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="closeScheduleModal"
    >
      <div 
        class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
      >
        <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center justify-between">
            <h2 id="schedule-modal-title" class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-indigo-600">schedule</span>
              Create Schedule
            </h2>
            <button
              @click="closeScheduleModal"
              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Close modal"
            >
              <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
            </button>
          </div>
        </div>
        
        <form @submit.prevent="saveSchedule" class="p-6 space-y-4">
          <!-- Application Selection -->
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Application
            </label>
            <Dropdown
              v-model="scheduleForm.applicationId"
              :options="applicationOptions.filter(opt => opt.value !== '')"
              :is-dark-mode="isDarkMode"
              label="Select Application"
            />
          </div>

          <!-- Frequency -->
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Frequency
            </label>
            <Dropdown
              v-model="scheduleForm.frequency"
              :options="[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' }
              ]"
              :is-dark-mode="isDarkMode"
            />
          </div>

          <!-- Day of Week (for weekly) -->
          <div v-if="scheduleForm.frequency === 'weekly'">
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Day of Week
            </label>
            <Dropdown
              v-model="scheduleForm.dayOfWeek"
              :options="[
                { value: 0, label: 'Sunday' },
                { value: 1, label: 'Monday' },
                { value: 2, label: 'Tuesday' },
                { value: 3, label: 'Wednesday' },
                { value: 4, label: 'Thursday' },
                { value: 5, label: 'Friday' },
                { value: 6, label: 'Saturday' }
              ]"
              :is-dark-mode="isDarkMode"
            />
          </div>

          <!-- Day of Month (for monthly) -->
          <div v-if="scheduleForm.frequency === 'monthly'">
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Day of Month
            </label>
            <input
              v-model.number="scheduleForm.dayOfMonth"
              type="number"
              min="1"
              max="31"
              class="w-full px-4 py-2 rounded-lg border"
              :class="isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'"
            />
          </div>

          <!-- Time -->
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Time
            </label>
            <input
              v-model="scheduleForm.time"
              type="time"
              class="w-full px-4 py-2 rounded-lg border"
              :class="isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'"
            />
          </div>

          <!-- Recipients -->
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Email Recipients (comma-separated)
            </label>
            <input
              v-model="scheduleForm.recipients"
              type="text"
              placeholder="email1@example.com, email2@example.com"
              class="w-full px-4 py-2 rounded-lg border"
              :class="isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
            />
          </div>

          <!-- Enabled -->
          <div class="flex items-center">
            <input
              v-model="scheduleForm.enabled"
              type="checkbox"
              id="schedule-enabled"
              class="accent-indigo-600"
            />
            <label for="schedule-enabled" class="ml-2 text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Enable schedule immediately
            </label>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Create Schedule
            </button>
            <button
              type="button"
              @click="closeScheduleModal"
              class="flex-1 px-4 py-2 rounded-lg border transition-colors font-medium"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create/Edit SLA Modal -->
    <div
      v-if="showSLAModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="closeSLAModal"
    >
      <div 
        class="rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        :class="isDarkMode ? 'bg-slate-800' : 'bg-white'"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sla-modal-title"
      >
        <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <div class="flex items-center justify-between">
            <h2 id="sla-modal-title" class="text-xl font-semibold flex items-center gap-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
              <span class="material-symbols-outlined text-indigo-600">gavel</span>
              {{ editingSLA ? 'Edit SLA' : 'Create SLA' }}
            </h2>
            <button
              @click="closeSLAModal"
              class="p-1 rounded transition-colors"
              :class="isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'"
              aria-label="Close modal"
            >
              <span class="material-symbols-outlined" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">close</span>
            </button>
          </div>
        </div>
        
        <form @submit.prevent="editingSLA ? updateSLA() : createSLA()" class="p-6 space-y-4">
          <!-- Application Selection -->
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Application
            </label>
            <Dropdown
              v-model="slaForm.applicationId"
              :options="applicationOptions.filter(opt => opt.value !== '')"
              :is-dark-mode="isDarkMode"
              label="Select Application"
              :disabled="!!editingSLA"
            />
          </div>

          <!-- Target Score -->
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Target Compliance Score (%)
            </label>
            <input
              v-model.number="slaForm.targetScore"
              type="number"
              min="0"
              max="100"
              step="1"
              class="w-full px-4 py-2 rounded-lg border"
              :class="isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'"
            />
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
              Minimum compliance score required (0-100)
            </p>
          </div>

          <!-- Target WCAG Level -->
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Target WCAG Level
            </label>
            <Dropdown
              v-model="slaForm.targetLevel"
              :options="[
                { value: 'A', label: 'WCAG 2.1 A' },
                { value: 'AA', label: 'WCAG 2.1 AA' },
                { value: 'AAA', label: 'WCAG 2.1 AAA' }
              ]"
              :is-dark-mode="isDarkMode"
            />
          </div>

          <!-- Critical Issues Threshold -->
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Maximum Critical Issues
            </label>
            <input
              v-model.number="slaForm.criticalIssuesThreshold"
              type="number"
              min="0"
              step="1"
              class="w-full px-4 py-2 rounded-lg border"
              :class="isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'"
            />
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
              Maximum number of critical issues allowed before SLA violation
            </p>
          </div>

          <!-- High Issues Threshold -->
          <div>
            <label class="block text-sm font-medium mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
              Maximum High Issues
            </label>
            <input
              v-model.number="slaForm.highIssuesThreshold"
              type="number"
              min="0"
              step="1"
              class="w-full px-4 py-2 rounded-lg border"
              :class="isDarkMode 
                ? 'bg-slate-700 border-slate-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'"
            />
            <p class="text-xs mt-1" :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'">
              Maximum number of high severity issues allowed before at-risk status
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {{ editingSLA ? 'Update SLA' : 'Create SLA' }}
            </button>
            <button
              type="button"
              @click="closeSLAModal"
              class="flex-1 px-4 py-2 rounded-lg border transition-colors font-medium"
              :class="isDarkMode 
                ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' 
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'"
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
import { ref, onMounted, computed, watch } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';
import jsPDF from 'jspdf';

const drawerOpen = ref(false);
const isDarkMode = ref(false);
const activeTab = ref('dashboard');
const complianceSummary = ref(null);
const slas = ref([]);
const showSLAModal = ref(false);
const slaForm = ref({
  applicationId: '',
  targetScore: 90,
  targetLevel: 'AA',
  criticalIssuesThreshold: 0,
  highIssuesThreshold: 5,
});
const editingSLA = ref(null);
const loading = ref(false);
const selectedApplicationId = ref('');
const currentReport = ref(null);
const reports = ref([]);
const schedules = ref([]);
const applications = ref([]);
const showScheduleModal = ref(false);
const scheduleForm = ref({
  applicationId: '',
  frequency: 'daily',
  dayOfWeek: 1,
  dayOfMonth: 1,
  time: '09:00',
  recipients: '',
  enabled: true
});

const applicationOptions = computed(() => {
  return [
    { value: '', label: 'Select Application' },
    ...applications.value.map(app => ({
      value: app.id,
      label: app.name
    }))
  ];
});

const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const getScoreColor = (score) => {
  if (score >= 95) return 'text-green-500';
  if (score >= 85) return 'text-blue-500';
  if (score >= 70) return 'text-yellow-500';
  return 'text-red-500';
};

const formatCategoryName = (category) => {
  return category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

const getSeverityClass = (severity) => {
  if (!severity) return isDarkMode.value ? 'bg-slate-800 border border-gray-700' : 'bg-white border border-gray-200';
  
  const severityUpper = String(severity).toUpperCase();
  const base = isDarkMode.value ? 'bg-slate-800 border' : 'bg-white border';
  
  if (severityUpper === 'CRITICAL') {
    return base + (isDarkMode.value ? ' border-red-700' : ' border-red-200');
  } else if (severityUpper === 'HIGH') {
    return base + (isDarkMode.value ? ' border-orange-700' : ' border-orange-200');
  } else if (severityUpper === 'MODERATE') {
    return base + (isDarkMode.value ? ' border-yellow-700' : ' border-yellow-200');
  } else if (severityUpper === 'LOW') {
    return base + (isDarkMode.value ? ' border-blue-700' : ' border-blue-200');
  } else if (severityUpper === 'INFO') {
    return base + (isDarkMode.value ? ' border-gray-700' : ' border-gray-200');
  }
  return base + (isDarkMode.value ? ' border-gray-700' : ' border-gray-200');
};

const getSeverityBadgeClass = (severity) => {
  if (!severity) return isDarkMode.value ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700';
  
  const severityUpper = String(severity).toUpperCase();
  
  if (severityUpper === 'CRITICAL') {
    return isDarkMode.value ? 'bg-red-700 text-red-200' : 'bg-red-100 text-red-700';
  } else if (severityUpper === 'HIGH') {
    return isDarkMode.value ? 'bg-orange-700 text-orange-200' : 'bg-orange-100 text-orange-700';
  } else if (severityUpper === 'MODERATE') {
    return isDarkMode.value ? 'bg-yellow-700 text-yellow-200' : 'bg-yellow-100 text-yellow-700';
  } else if (severityUpper === 'LOW') {
    return isDarkMode.value ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700';
  } else if (severityUpper === 'INFO') {
    return isDarkMode.value ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700';
  }
  return isDarkMode.value ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700';
};

const getElementImpactClass = (impact) => {
  if (!impact) return isDarkMode.value ? 'bg-gray-900/20 border border-gray-700' : 'bg-gray-50 border border-gray-200';
  
  const impactUpper = String(impact).toUpperCase();
  
  if (impactUpper === 'CRITICAL') {
    return isDarkMode.value ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200';
  } else if (impactUpper === 'HIGH') {
    return isDarkMode.value ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200';
  } else if (impactUpper === 'MODERATE') {
    return isDarkMode.value ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200';
  } else if (impactUpper === 'LOW') {
    return isDarkMode.value ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200';
  } else if (impactUpper === 'INFO') {
    return isDarkMode.value ? 'bg-gray-900/20 border border-gray-700' : 'bg-gray-50 border border-gray-200';
  }
  return isDarkMode.value ? 'bg-gray-900/20 border border-gray-700' : 'bg-gray-50 border border-gray-200';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  if (typeof date === 'string') {
    date = new Date(date);
  }
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getDayName = (dayOfWeek) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || '';
};

const getApplicationName = (applicationId) => {
  const app = applications.value.find(a => a.id === applicationId);
  return app?.name || applicationId;
};

const loadApplications = async () => {
  try {
    const response = await axios.get('/api/v1/design-system/applications');
    applications.value = response.data.applications || [];
  } catch (error) {
    console.error('Error loading applications:', error);
  }
};

const generateReport = async () => {
  if (!selectedApplicationId.value || selectedApplicationId.value === '') {
    alert('Please select an application');
    return;
  }

  loading.value = true;
  try {
    const response = await axios.post(`/api/v1/accessibility-reports/generate/${selectedApplicationId.value}`);
    const report = response.data;
    // Debug: Log the generated report structure
    console.log('Generated report:', report);
    if (report.wcagCriteria) {
      console.log('WCAG Criteria sample:', Object.values(report.wcagCriteria)[0]);
      Object.values(report.wcagCriteria).forEach((criterion, idx) => {
        console.log(`Criterion ${idx}:`, criterion.criterion, 'failingElements:', criterion.failingElements);
      });
    }
    currentReport.value = report;
    await loadReports();
  } catch (error) {
    console.error('Error generating report:', error);
    alert('Failed to generate report');
  } finally {
    loading.value = false;
  }
};

const loadReport = async () => {
  if (!selectedApplicationId.value || selectedApplicationId.value === '') {
    currentReport.value = null;
    return;
  }

  loading.value = true;
  try {
    const response = await axios.get(`/api/v1/accessibility-reports/reports?applicationId=${selectedApplicationId.value}`);
    reports.value = response.data || [];
    if (reports.value.length > 0) {
      const report = reports.value[0];
      // Debug: Log the report structure
      console.log('Loaded report from dropdown:', report);
      if (report.wcagCriteria) {
        console.log('WCAG Criteria sample:', Object.values(report.wcagCriteria)[0]);
      }
      currentReport.value = report;
    } else {
      currentReport.value = null;
    }
  } catch (error) {
    console.error('Error loading report:', error);
  } finally {
    loading.value = false;
  }
};

const loadReportById = async (reportId) => {
  try {
    const response = await axios.get(`/api/v1/accessibility-reports/reports/${reportId}`);
    // Convert date string to Date object if needed
    const report = response.data;
    if (report.generatedAt && typeof report.generatedAt === 'string') {
      report.generatedAt = new Date(report.generatedAt);
    }
    // Debug: Log the report structure to check for failingElements
    console.log('Loaded report:', report);
    if (report.wcagCriteria) {
      console.log('WCAG Criteria sample:', Object.values(report.wcagCriteria)[0]);
      Object.values(report.wcagCriteria).forEach((criterion, idx) => {
        console.log(`Criterion ${idx}:`, criterion.criterion, 'failingElements:', criterion.failingElements);
      });
    }
    currentReport.value = report;
    // Switch to dashboard tab to show the report
    activeTab.value = 'dashboard';
    // Also set the selected application to match the report
    if (currentReport.value?.applicationId) {
      selectedApplicationId.value = currentReport.value.applicationId;
    }
  } catch (error) {
    console.error('Error loading report:', error);
    alert('Failed to load report. Please try again.');
  }
};

const loadReports = async () => {
  try {
    const response = await axios.get('/api/v1/accessibility-reports/reports');
    console.log('Reports API response:', response.data);
    reports.value = Array.isArray(response.data) ? response.data : [];
    console.log('Reports loaded:', reports.value.length, reports.value);
  } catch (error) {
    console.error('Error loading reports:', error);
    reports.value = [];
  }
};

const loadSchedules = async () => {
  try {
    const response = await axios.get('/api/v1/accessibility-reports/schedules');
    console.log('Schedules API response:', response.data);
    schedules.value = Array.isArray(response.data) ? response.data : [];
    console.log('Schedules loaded:', schedules.value.length, schedules.value);
  } catch (error) {
    console.error('Error loading schedules:', error);
    schedules.value = [];
  }
};

const toggleSchedule = async (scheduleId) => {
  try {
    if (!Array.isArray(schedules.value)) {
      await loadSchedules();
    }
    const schedule = schedules.value.find(s => s.id === scheduleId);
    if (schedule) {
      await axios.put(`/api/v1/accessibility-reports/schedules/${scheduleId}`, {
        enabled: !schedule.enabled
      });
      await loadSchedules();
    }
  } catch (error) {
    console.error('Error toggling schedule:', error);
  }
};

const deleteSchedule = async (scheduleId) => {
  if (!confirm('Are you sure you want to delete this schedule?')) {
    return;
  }

  try {
    await axios.delete(`/api/v1/accessibility-reports/schedules/${scheduleId}`);
    await loadSchedules();
  } catch (error) {
    console.error('Error deleting schedule:', error);
  }
};

const closeScheduleModal = () => {
  showScheduleModal.value = false;
  scheduleForm.value = {
    applicationId: '',
    frequency: 'daily',
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '09:00',
    recipients: '',
    enabled: true
  };
};

const saveSchedule = async () => {
  if (!scheduleForm.value.applicationId || scheduleForm.value.applicationId === '') {
    alert('Please select an application');
    return;
  }

  try {
    const scheduleData = {
      applicationId: scheduleForm.value.applicationId,
      frequency: scheduleForm.value.frequency,
      time: scheduleForm.value.time,
      enabled: scheduleForm.value.enabled,
      recipients: scheduleForm.value.recipients
        ? scheduleForm.value.recipients.split(',').map(email => email.trim()).filter(email => email)
        : []
    };

    if (scheduleForm.value.frequency === 'weekly') {
      scheduleData.dayOfWeek = scheduleForm.value.dayOfWeek;
    } else if (scheduleForm.value.frequency === 'monthly') {
      scheduleData.dayOfMonth = scheduleForm.value.dayOfMonth;
    }

    await axios.post('/api/v1/accessibility-reports/schedules', scheduleData);
    await loadSchedules();
    closeScheduleModal();
  } catch (error) {
    console.error('Error creating schedule:', error);
    alert('Failed to create schedule. Please try again.');
  }
};

const exportToPDF = () => {
  if (!currentReport.value) {
    alert('No report available to export');
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;
  const lineHeight = 7;
  const sectionSpacing = 15; // Increased from 10
  const itemSpacing = 8; // Spacing between items in lists

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace = lineHeight) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrapping
  const addText = (text, fontSize = 10, isBold = false, color = [0, 0, 0]) => {
    checkPageBreak(fontSize + 2);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);
    if (isBold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }
    
    const maxWidth = pageWidth - (margin * 2);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, margin, yPos);
    yPos += lines.length * (fontSize * 0.4) + 2;
  };

  // Title
  doc.setTextColor(79, 70, 229); // Indigo
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Accessibility Report', margin, yPos);
  yPos += 15; // Increased spacing after title

  // Application Name and Date
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`Application: ${currentReport.value.applicationName}`, margin, yPos);
  yPos += lineHeight;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const reportDate = currentReport.value.generatedAt instanceof Date 
    ? currentReport.value.generatedAt 
    : new Date(currentReport.value.generatedAt);
  doc.text(`Generated: ${reportDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, margin, yPos);
  yPos += sectionSpacing + 5; // Extra spacing before next section

  // WCAG Compliance Overview - 4 Key Metrics
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('WCAG Compliance Overview', margin, yPos);
  yPos += lineHeight + 8; // Increased spacing after section title

  // Create a visual grid layout for the 4 metrics
  const boxWidth = (pageWidth - (margin * 2) - 15) / 2;
  const boxHeight = 25;
  const boxMargin = 5;

  // Compliance Score Box
  checkPageBreak(boxHeight + 10);
  const scoreColor = currentReport.value.complianceScore >= 95 
    ? [34, 197, 94] // Green
    : currentReport.value.complianceScore >= 85
    ? [59, 130, 246] // Blue
    : currentReport.value.complianceScore >= 70
    ? [234, 179, 8] // Yellow
    : [239, 68, 68]; // Red
  
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.rect(margin, yPos, boxWidth, boxHeight, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Compliance Score', margin + 5, yPos + 7);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(`${currentReport.value.complianceScore}%`, margin + 5, yPos + 16);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  const wcagDisplay = currentReport.value.wcagLevel === 'AA' ? 'WCAG 2.1 AA' : currentReport.value.wcagLevel === 'AAA' ? 'WCAG 2.1 AAA' : currentReport.value.wcagLevel === 'A' ? 'WCAG 2.1 A' : 'Non-Compliant';
  doc.text(wcagDisplay, margin + 5, yPos + 22);

  // Critical Issues Box
  doc.setDrawColor(239, 68, 68);
  doc.setFillColor(239, 68, 68);
  doc.rect(margin + boxWidth + boxMargin, yPos, boxWidth, boxHeight, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Critical Issues', margin + boxWidth + boxMargin + 5, yPos + 7);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(`${currentReport.value.criticalIssues}`, margin + boxWidth + boxMargin + 5, yPos + 16);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('Blocking accessibility', margin + boxWidth + boxMargin + 5, yPos + 22);

  yPos += boxHeight + boxMargin;

  // Total Issues Box
  checkPageBreak(boxHeight + 10);
  doc.setDrawColor(249, 115, 22);
  doc.setFillColor(249, 115, 22);
  doc.rect(margin, yPos, boxWidth, boxHeight, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Total Issues', margin + 5, yPos + 7);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(`${currentReport.value.totalIssues}`, margin + 5, yPos + 16);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(`${currentReport.value.highIssues} high, ${currentReport.value.moderateIssues} moderate, ${currentReport.value.lowIssues} low`, margin + 5, yPos + 22);

  // Trend Box
  const trendColor = currentReport.value.trend.scoreChange >= 0 
    ? [34, 197, 94] 
    : [239, 68, 68];
  doc.setDrawColor(trendColor[0], trendColor[1], trendColor[2]);
  doc.setFillColor(trendColor[0], trendColor[1], trendColor[2]);
  doc.rect(margin + boxWidth + boxMargin, yPos, boxWidth, boxHeight, 'FD');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Trend', margin + boxWidth + boxMargin + 5, yPos + 7);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  const trendSign = currentReport.value.trend.scoreChange >= 0 ? '+' : '';
  doc.text(`${trendSign}${currentReport.value.trend.scoreChange.toFixed(1)}%`, margin + boxWidth + boxMargin + 5, yPos + 16);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(`${currentReport.value.trend.fixedIssues} fixed, ${currentReport.value.trend.newIssues} new`, margin + boxWidth + boxMargin + 5, yPos + 22);

  yPos += boxHeight + sectionSpacing + 5; // Extra spacing after overview boxes
  
  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Issues by Category
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('Issues by Category', margin, yPos);
  yPos += lineHeight + 8; // Increased spacing after section title

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  
  const categories = Object.entries(currentReport.value.issuesByCategory)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a);
  
  // Create a table-like layout for categories
  const categoryBoxWidth = (pageWidth - (margin * 2) - 20) / 3;
  let categoryX = margin;
  let categoryRow = 0;
  
  categories.forEach(([category, count], index) => {
    if (index > 0 && index % 3 === 0) {
      categoryRow++;
      categoryX = margin;
      yPos += 18; // Increased row spacing
      checkPageBreak(18);
    }
    
    const categoryName = formatCategoryName(category);
    
    // Draw a small box for each category
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(categoryX, yPos, categoryBoxWidth, 12, 2, 2, 'FD');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`${count}`, categoryX + 5, yPos + 8);
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    const nameLines = doc.splitTextToSize(categoryName, categoryBoxWidth - 25);
    doc.text(nameLines, categoryX + 20, yPos + 8);
    
    categoryX += categoryBoxWidth + 10;
  });
  
  yPos += 25; // Increased spacing after categories
  yPos += sectionSpacing;

  // Prioritized Fixes - Show ALL fixes, not just top 10
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('Prioritized Fixes', margin, yPos);
  yPos += lineHeight + 8; // Increased spacing after section title
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Showing all ${currentReport.value.prioritizedFixes.length} prioritized fixes`, margin, yPos);
  yPos += lineHeight + 5; // Increased spacing before fixes list
  
  doc.setFontSize(10);
  
  // Show ALL fixes, not just top 10
  currentReport.value.prioritizedFixes.forEach((fix, index) => {
    checkPageBreak(40);
    
    const fixStartY = yPos - 3;
    
    // Severity badge color - handle both old and new severity scales
    const severityUpper = String(fix.severity || '').toUpperCase();
    const severityColors = {
      CRITICAL: [239, 68, 68],
      HIGH: [249, 115, 22],
      MODERATE: [234, 179, 8],
      LOW: [59, 130, 246],
      INFO: [107, 114, 128],
      // Legacy support (shouldn't be needed but just in case)
      SERIOUS: [249, 115, 22], // Map to HIGH
      MINOR: [59, 130, 246], // Map to LOW
    };
    const color = severityColors[severityUpper] || [107, 114, 128];
    
    const barWidth = 3;
    const textStartX = margin + barWidth + 8; // Add space after the bar
    
    // Severity and rule - ensure it starts after the bar
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    const severityDisplay = fix.severity ? String(fix.severity).toUpperCase() : 'UNKNOWN';
    const ruleText = `${index + 1}. [${severityDisplay}] ${fix.rule}`;
    const ruleLines = doc.splitTextToSize(ruleText, pageWidth - textStartX - margin);
    doc.text(ruleLines, textStartX, yPos);
    yPos += ruleLines.length * 5 + 2;
    
    // Description - ensure it starts after the bar
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const descStartY = yPos;
    const descLines = doc.splitTextToSize(fix.description, pageWidth - textStartX - margin);
    doc.text(descLines, textStartX, yPos);
    yPos += descLines.length * 4 + 2;
    
    // Metadata - ensure it starts after the bar
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const metadataText = `WCAG ${fix.wcagCriterion} | ${fix.affectedElements} elements | Effort: ${fix.effort} | Priority: ${fix.priority.toFixed(1)}`;
    const metadataLines = doc.splitTextToSize(metadataText, pageWidth - textStartX - margin);
    doc.text(metadataLines, textStartX, yPos);
    yPos += metadataLines.length * 4 + 1;
    
    // Impact - ensure it starts after the bar
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(`Impact: ${fix.impact}`, textStartX, yPos);
    yPos += lineHeight;
    
    // Recommendation in a highlighted box - ensure it starts after the bar
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    const recStartY = yPos;
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(60, 60, 60);
    const recText = `Recommendation: ${fix.recommendation}`;
    const recLines = doc.splitTextToSize(recText, pageWidth - textStartX - margin - 4);
    const recHeight = recLines.length * 4 + 4;
    doc.roundedRect(textStartX, recStartY, pageWidth - textStartX - margin, recHeight, 2, 2, 'FD');
    doc.text(recLines, textStartX + 4, recStartY + 6);
    yPos += recHeight + 3;
    
    // Draw left border with severity color after calculating total height
    const fixBoxHeight = yPos - fixStartY;
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin, fixStartY, barWidth, fixBoxHeight, 'FD');
    
    doc.setFont(undefined, 'normal');
    yPos += itemSpacing; // Increased spacing between fixes
  });

  // WCAG Criteria
  checkPageBreak(30);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('WCAG Criteria Compliance', margin, yPos);
  yPos += lineHeight + 8; // Increased spacing after section title

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);

  const criteria = Object.entries(currentReport.value.wcagCriteria);
  criteria.forEach(([key, criterion]) => {
    checkPageBreak(30); // Increased space check
    
    const statusColor = criterion.status === 'pass'
      ? [34, 197, 94] // Green
      : criterion.status === 'fail'
      ? [239, 68, 68] // Red
      : [234, 179, 8]; // Yellow
    
    const barWidth = 3;
    const textStartX = margin + barWidth + 8; // Add space after the bar
    
    // Draw a colored bar on the left
    doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    const criterionStartY = yPos;
    doc.rect(margin, criterionStartY - 2, barWidth, 20, 'FD');
    
    // Criterion title - ensure it starts after the bar
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    const titleText = `${criterion.criterion} (Level ${criterion.level}) - ${criterion.status.toUpperCase()}`;
    const titleLines = doc.splitTextToSize(titleText, pageWidth - textStartX - margin);
    doc.text(titleLines, textStartX, yPos + 5);
    yPos += titleLines.length * 5 + 3; // Increased spacing after title
    
    // Description - ensure it starts after the bar
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const descStartY = yPos;
    const descLines = doc.splitTextToSize(criterion.description, pageWidth - textStartX - margin);
    doc.text(descLines, textStartX, yPos);
    yPos += descLines.length * 4 + 3; // Increased spacing after description
    
    // Issues count
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Issues: ${criterion.issues}`, textStartX, yPos);
    yPos += lineHeight + 2;
    
    // Failing Elements
    if (criterion.failingElements && criterion.failingElements.length > 0) {
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('Failing Elements:', textStartX, yPos);
      yPos += lineHeight + 2;
      
      criterion.failingElements.forEach((element, idx) => {
        checkPageBreak(15);
        
        // Element message
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const messageLines = doc.splitTextToSize(`${idx + 1}. ${element.message}`, pageWidth - textStartX - margin);
        doc.text(messageLines, textStartX, yPos);
        yPos += messageLines.length * 3.5 + 1;
        
        // File and line info
        if (element.file) {
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          const fileInfo = element.line ? `${element.file}:${element.line}` : element.file;
          doc.text(`File: ${fileInfo}`, textStartX, yPos);
          yPos += lineHeight - 1;
        }
        
        // Impact badge
        if (element.impact) {
          const impactColor = element.impact === 'CRITICAL' ? [239, 68, 68] :
            element.impact === 'HIGH' ? [249, 115, 22] :
            element.impact === 'MODERATE' ? [234, 179, 8] :
            element.impact === 'LOW' ? [59, 130, 246] : [107, 114, 128];
          doc.setFillColor(impactColor[0], impactColor[1], impactColor[2]);
          doc.setDrawColor(impactColor[0], impactColor[1], impactColor[2]);
          doc.roundedRect(textStartX, yPos - 2, 20, 4, 1, 1, 'FD');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(6);
          doc.text(element.impact, textStartX + 2, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += lineHeight;
        }
        
        // Element code snippet
        if (element.element) {
          doc.setFontSize(6);
          doc.setFont('courier', 'normal');
          doc.setTextColor(60, 60, 60);
          const elementLines = doc.splitTextToSize(element.element, pageWidth - textStartX - margin);
          doc.text(elementLines, textStartX, yPos);
          yPos += elementLines.length * 3 + 2;
          doc.setFont('helvetica', 'normal'); // Reset font
        }
        
        yPos += 2; // Spacing between elements
      });
    }
    
    // Update bar height to match content
    const criterionHeight = yPos - criterionStartY + 2;
    doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.rect(margin, criterionStartY - 2, barWidth, criterionHeight, 'FD');
    
    yPos += itemSpacing; // Increased spacing between criteria items
  });

  // Trend Information
  if (currentReport.value.trend) {
    checkPageBreak(25);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text('Trend Analysis', margin, yPos);
    yPos += lineHeight + 8; // Increased spacing after section title

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    const trendColor = currentReport.value.trend.scoreChange >= 0 
      ? [34, 197, 94] 
      : [239, 68, 68];
    doc.setTextColor(trendColor[0], trendColor[1], trendColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text(`Score Change: ${currentReport.value.trend.scoreChange >= 0 ? '+' : ''}${currentReport.value.trend.scoreChange.toFixed(1)}%`, margin, yPos);
    yPos += lineHeight;
    
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(`Issues Change: ${currentReport.value.trend.issuesChange >= 0 ? '+' : ''}${currentReport.value.trend.issuesChange}`, margin, yPos);
    yPos += lineHeight + 2; // Increased spacing
    doc.text(`New Issues: ${currentReport.value.trend.newIssues} | Fixed Issues: ${currentReport.value.trend.fixedIssues}`, margin, yPos);
    yPos += sectionSpacing; // Extra spacing after trend section
  }

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated by Design System Accessibility Reports`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `accessibility-report-${currentReport.value.applicationName.replace(/\s+/g, '-').toLowerCase()}-${reportDate.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

onMounted(async () => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  isDarkMode.value = document.documentElement.classList.contains('dark');
  
  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
});

const loadComplianceSummary = async () => {
  try {
    const response = await axios.get('/api/v1/accessibility-reports/summary');
    complianceSummary.value = response.data;
  } catch (error) {
    console.error('Error loading compliance summary:', error);
    complianceSummary.value = null;
  }
};

const loadSLAs = async () => {
  try {
    const response = await axios.get('/api/v1/accessibility-reports/slas');
    slas.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error loading SLAs:', error);
    slas.value = [];
  }
};

const createSLA = async () => {
  if (!slaForm.value.applicationId || slaForm.value.applicationId === '') {
    alert('Please select an application');
    return;
  }

  try {
    await axios.post('/api/v1/accessibility-reports/slas', slaForm.value);
    await loadSLAs();
    await loadComplianceSummary(); // Refresh compliance summary to update SLA status
    closeSLAModal();
  } catch (error) {
    console.error('Error creating SLA:', error);
    alert('Failed to create SLA. Please try again.');
  }
};

const editSLA = (sla) => {
  editingSLA.value = sla;
  slaForm.value = {
    applicationId: sla.applicationId,
    targetScore: sla.targetScore,
    targetLevel: sla.targetLevel,
    criticalIssuesThreshold: sla.criticalIssuesThreshold,
    highIssuesThreshold: sla.highIssuesThreshold,
  };
  showSLAModal.value = true;
};

const updateSLA = async () => {
  if (!editingSLA.value) return;

  try {
    await axios.put(`/api/v1/accessibility-reports/slas/${editingSLA.value.id}`, slaForm.value);
    await loadSLAs();
    await loadComplianceSummary(); // Refresh compliance summary to update SLA status
    closeSLAModal();
  } catch (error) {
    console.error('Error updating SLA:', error);
    alert('Failed to update SLA. Please try again.');
  }
};

const deleteSLA = async (slaId) => {
  if (!confirm('Are you sure you want to delete this SLA?')) {
    return;
  }

  try {
    await axios.delete(`/api/v1/accessibility-reports/slas/${slaId}`);
    await loadSLAs();
    if (activeTab.value === 'multi-app') {
      await loadComplianceSummary();
    }
  } catch (error) {
    console.error('Error deleting SLA:', error);
    alert('Failed to delete SLA. Please try again.');
  }
};

const closeSLAModal = () => {
  showSLAModal.value = false;
  editingSLA.value = null;
  slaForm.value = {
    applicationId: '',
    targetScore: 90,
    targetLevel: 'AA',
    criticalIssuesThreshold: 0,
    highIssuesThreshold: 5,
  };
};

// Watch activeTab to load data when switching tabs
watch(activeTab, (newTab) => {
  if (newTab === 'multi-app' && !complianceSummary.value) {
    loadComplianceSummary();
  } else if (newTab === 'slas' && slas.value.length === 0) {
    loadSLAs();
  }
});

onMounted(async () => {
  // Auto-open drawer if navigating from sidebar
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  
  isDarkMode.value = document.documentElement.classList.contains('dark');
  
  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    isDarkMode.value = document.documentElement.classList.contains('dark');
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  await loadApplications();
  await loadReports();
  await loadSchedules();
  await loadComplianceSummary();
  await loadSLAs();
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

