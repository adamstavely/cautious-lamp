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
                <h3 class="text-lg font-semibold mb-2" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
                  WCAG {{ currentReport.wcagLevel }}
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
                  {{ currentReport.seriousIssues }} serious, {{ currentReport.moderateIssues }} moderate
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
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
                <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                  Prioritized Fixes
                </h3>
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
                          {{ fix.severity.toUpperCase() }}
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
                    <div class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
                      {{ fix.recommendation }}
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
              <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                WCAG Criteria Compliance
              </h3>
              <div class="space-y-3">
                <div
                  v-for="(criterion, key) in currentReport.wcagCriteria"
                  :key="key"
                  class="flex items-center justify-between p-3 rounded-lg border"
                  :class="criterion.status === 'pass' 
                    ? (isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200')
                    : criterion.status === 'fail'
                    ? (isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200')
                    : (isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200')"
                >
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
                    <p class="text-xs" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                      {{ criterion.description }}
                    </p>
                  </div>
                  <div class="text-right">
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
            <h3 class="text-lg font-semibold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
              <h3 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Dropdown from '../components/Dropdown.vue';
import axios from 'axios';

const drawerOpen = ref(false);
const isDarkMode = ref(false);
const activeTab = ref('dashboard');
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
  const base = isDarkMode.value ? 'bg-slate-800 border' : 'bg-white border';
  if (severity === 'critical') {
    return base + (isDarkMode.value ? ' border-red-700' : ' border-red-200');
  } else if (severity === 'serious') {
    return base + (isDarkMode.value ? ' border-orange-700' : ' border-orange-200');
  } else if (severity === 'moderate') {
    return base + (isDarkMode.value ? ' border-yellow-700' : ' border-yellow-200');
  }
  return base + (isDarkMode.value ? ' border-gray-700' : ' border-gray-200');
};

const getSeverityBadgeClass = (severity) => {
  if (severity === 'critical') {
    return isDarkMode.value ? 'bg-red-700 text-red-200' : 'bg-red-100 text-red-700';
  } else if (severity === 'serious') {
    return isDarkMode.value ? 'bg-orange-700 text-orange-200' : 'bg-orange-100 text-orange-700';
  } else if (severity === 'moderate') {
    return isDarkMode.value ? 'bg-yellow-700 text-yellow-200' : 'bg-yellow-100 text-yellow-700';
  }
  return isDarkMode.value ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700';
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
    currentReport.value = response.data;
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
      currentReport.value = reports.value[0];
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
    currentReport.value = response.data;
  } catch (error) {
    console.error('Error loading report:', error);
  }
};

const loadReports = async () => {
  try {
    const response = await axios.get('/api/v1/accessibility-reports/reports');
    reports.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error loading reports:', error);
    reports.value = [];
  }
};

const loadSchedules = async () => {
  try {
    const response = await axios.get('/api/v1/accessibility-reports/schedules');
    schedules.value = Array.isArray(response.data) ? response.data : [];
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
});
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>

