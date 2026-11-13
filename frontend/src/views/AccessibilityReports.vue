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
        <div class="max-w-7xl mx-auto mb-6">
          <div class="flex flex-wrap gap-2 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'" role="tablist">
            <button
              v-for="tab in TABS"
              :key="tab.id"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.id"
              class="px-6 py-3 font-medium transition-colors relative"
              :class="activeTab === tab.id
                ? (isDarkMode ? 'text-indigo-400' : 'text-indigo-600')
                : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900')"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
              <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5" :class="isDarkMode ? 'bg-indigo-400' : 'bg-indigo-600'"></div>
            </button>
          </div>
        </div>

        <div class="max-w-7xl mx-auto mb-6">
          <InlineNotice :notice="notice" @dismiss="clearNotice" />
        </div>

        <!-- Dashboard Tab -->
        <div v-if="activeTab === 'dashboard'" class="max-w-7xl mx-auto space-y-6">
          <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 class="text-lg font-semibold mb-2 flex items-center gap-2" :class="headingClass">
                  <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">apps</span>
                  Application
                </h3>
                <p class="text-sm" :class="mutedClass">
                  Choose an application to see its latest report.
                  <router-link v-if="applicationsLoaded && applications.length === 0" to="/admin/applications/register" class="underline">Register one first.</router-link>
                </p>
              </div>
              <label class="sr-only" for="a11y-app">Application</label>
              <select id="a11y-app" v-model="selectedApplicationId" class="min-w-[300px] px-4 py-2 rounded-lg border" :class="inputClass">
                <option value="" disabled>{{ applications.length ? 'Select an application' : 'No applications' }}</option>
                <option v-for="app in applications" :key="app.id" :value="app.id">{{ app.name }}</option>
              </select>
            </div>

            <!-- Generate -->
            <div v-if="canAdmin && selectedApplicationId" class="mt-6 pt-6 border-t space-y-4" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
              <fieldset class="flex flex-wrap items-center gap-4 text-sm" :class="labelClass">
                <legend class="sr-only">What to scan</legend>
                <label class="flex items-center gap-2"><input v-model="generateSource" type="radio" value="url" class="accent-indigo-600" /> Public URL (rendered in a browser)</label>
                <label class="flex items-center gap-2"><input v-model="generateSource" type="radio" value="html" class="accent-indigo-600" /> Paste HTML</label>
              </fieldset>
              <div v-if="generateSource === 'url'">
                <label for="a11y-url" class="block text-sm mb-1" :class="labelClass">Page URL</label>
                <input
                  id="a11y-url"
                  v-model.trim="generateUrl"
                  type="url"
                  :placeholder="selectedApplication?.applicationUrl || 'https://app.example.com'"
                  class="w-full px-4 py-2 rounded-lg border"
                  :class="inputClass"
                />
                <p class="text-xs mt-1" :class="mutedClass">Leave empty to use the application's URL{{ selectedApplication?.applicationUrl ? '' : ' (this application has none)' }}.</p>
              </div>
              <div v-else>
                <label for="a11y-html" class="block text-sm mb-1" :class="labelClass">HTML</label>
                <textarea id="a11y-html" v-model="generateHtml" rows="6" spellcheck="false" class="w-full px-4 py-2 rounded-lg border font-mono text-xs" :class="inputClass"></textarea>
                <p class="text-xs mt-1" :class="mutedClass">Checked without a browser, so colour contrast is listed as needing review rather than tested.</p>
              </div>
              <button
                type="button"
                class="px-4 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                :disabled="loading || !canGenerate"
                @click="generateReport"
              >
                {{ loading ? 'Scanning…' : 'Generate Report' }}
              </button>
            </div>
          </div>

          <div v-if="loading" class="flex items-center justify-center py-12" role="status">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" aria-hidden="true"></div>
              <p :class="mutedClass">Generating accessibility report…</p>
            </div>
          </div>

          <div v-else-if="currentReport" class="space-y-6">
            <p class="text-sm" :class="mutedClass">
              {{ currentReport.applicationName }} · {{ formatDate(currentReport.generatedAt) }} ·
              {{ currentReport.source === 'url' ? `URL ${currentReport.url || ''} (browser)` : 'Supplied HTML (no browser)' }}
              <span v-if="currentReport.scheduled"> · scheduled</span>
            </p>

            <!-- WCAG Compliance Overview -->
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="mutedClass">
                  <span class="material-symbols-outlined text-lg" :class="getScoreColor(currentReport.complianceScore)" aria-hidden="true">check_circle</span>
                  Compliance Score
                </div>
                <div class="text-4xl font-bold mb-2" :class="getScoreColor(currentReport.complianceScore)">{{ currentReport.complianceScore }}%</div>
                <div class="text-sm" :class="mutedClass">{{ levelLabel(currentReport.wcagLevel) }}</div>
              </div>

              <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="mutedClass">
                  <span class="material-symbols-outlined text-lg text-red-500" aria-hidden="true">error</span>
                  Critical Issues
                </div>
                <div class="text-4xl font-bold text-red-500">{{ currentReport.criticalIssues }}</div>
                <div class="text-sm" :class="mutedClass">Blocking accessibility</div>
              </div>

              <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="mutedClass">
                  <span class="material-symbols-outlined text-lg text-orange-500" aria-hidden="true">warning</span>
                  Total Issues
                </div>
                <div class="text-4xl font-bold" :class="headingClass">{{ currentReport.totalIssues }}</div>
                <div class="text-sm" :class="mutedClass">
                  {{ currentReport.highIssues }} high, {{ currentReport.moderateIssues }} moderate, {{ currentReport.lowIssues }} low
                  <span v-if="currentReport.needsReview"> · {{ currentReport.needsReview }} need manual review</span>
                </div>
              </div>

              <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
                <div class="flex items-center gap-2 text-sm font-medium mb-2" :class="mutedClass">
                  <span class="material-symbols-outlined text-lg" :class="currentReport.trend.scoreChange >= 0 ? 'text-green-500' : 'text-red-500'" aria-hidden="true">
                    {{ currentReport.trend.scoreChange >= 0 ? 'trending_up' : 'trending_down' }}
                  </span>
                  Trend
                </div>
                <template v-if="currentReport.previousReportId">
                  <div class="text-4xl font-bold" :class="currentReport.trend.scoreChange >= 0 ? 'text-green-500' : 'text-red-500'">
                    {{ currentReport.trend.scoreChange >= 0 ? '+' : '' }}{{ currentReport.trend.scoreChange.toFixed(1) }}
                  </div>
                  <div class="text-sm" :class="mutedClass">{{ currentReport.trend.fixedIssues }} fixed, {{ currentReport.trend.newIssues }} new</div>
                </template>
                <div v-else class="text-sm mt-3" :class="mutedClass">First report for this application.</div>
              </div>
            </div>

            <!-- Issues by Category -->
            <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="headingClass">
                <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">category</span>
                Issues by Category
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="(count, category) in currentReport.issuesByCategory" :key="category" class="text-center">
                  <div class="text-2xl font-bold mb-1" :class="headingClass">{{ count }}</div>
                  <div class="text-xs" :class="mutedClass">{{ formatCategoryName(category) }}</div>
                </div>
              </div>
            </div>

            <!-- Prioritized Fixes -->
            <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
              <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2" :class="headingClass">
                  <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">priority_high</span>
                  Prioritized Fixes
                </h3>
                <button type="button" class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2" :class="secondaryButton" @click="exportToPDF">
                  <span class="material-symbols-outlined text-sm" aria-hidden="true">picture_as_pdf</span>
                  Export PDF
                </button>
              </div>
              <p v-if="currentReport.prioritizedFixes.length === 0" class="text-sm" :class="mutedClass">No automated violations found.</p>
              <div class="space-y-3">
                <div v-for="fix in currentReport.prioritizedFixes.slice(0, 10)" :key="fix.id" class="p-4 rounded-lg border" :class="getSeverityClass(fix.severity)">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-1 rounded text-xs font-medium" :class="getSeverityBadgeClass(fix.severity)">{{ fix.severity }}</span>
                    <span class="text-sm font-semibold" :class="headingClass">{{ fix.rule }}</span>
                  </div>
                  <p class="text-sm mb-2" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ fix.description }}</p>
                  <div class="flex flex-wrap items-center gap-4 text-xs" :class="mutedClass">
                    <span>WCAG {{ fix.wcagCriterion }}</span>
                    <span>{{ fix.affectedElements }} elements</span>
                    <span>Effort: {{ fix.effort }}</span>
                    <span>Priority: {{ fix.priority.toFixed(1) }}</span>
                    <a v-if="fix.helpUrl" :href="fix.helpUrl" target="_blank" rel="noopener noreferrer" class="underline">How to fix</a>
                  </div>
                  <div v-if="fix.codeExamples && fix.codeExamples.length > 0" class="mt-3 p-3 rounded space-y-4" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                    <div v-for="(example, idx) in fix.codeExamples" :key="idx" class="space-y-2">
                      <p class="text-xs italic" :class="mutedClass">{{ example.explanation }}</p>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-red-300' : 'text-red-600'">Before</p>
                          <pre class="text-xs p-2 rounded overflow-x-auto" :class="isDarkMode ? 'bg-slate-900 text-gray-300 border border-red-800' : 'bg-red-50 text-red-900 border border-red-200'"><code>{{ example.before }}</code></pre>
                        </div>
                        <div>
                          <p class="text-xs font-medium mb-1" :class="isDarkMode ? 'text-green-300' : 'text-green-600'">After</p>
                          <pre class="text-xs p-2 rounded overflow-x-auto" :class="isDarkMode ? 'bg-slate-900 text-gray-300 border border-green-800' : 'bg-green-50 text-green-900 border border-green-200'"><code>{{ example.after }}</code></pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- WCAG Criteria Breakdown -->
            <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="headingClass">
                <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">checklist</span>
                WCAG Criteria
              </h3>
              <p class="text-xs mb-4" :class="mutedClass">Automated checks (axe-core, WCAG 2.x A and AA). Passing them does not prove conformance; criteria marked "Needs review" must be checked by hand.</p>
              <div class="space-y-4">
                <div v-for="(criterion, key) in currentReport.wcagCriteria" :key="key" class="rounded-lg border p-4" :class="criterionClass(criterion.status)">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-sm font-semibold" :class="headingClass">{{ criterion.criterion }}</span>
                        <span class="px-2 py-0.5 rounded text-xs" :class="criterion.level === 'AA' ? (isDarkMode ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700') : (isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700')">
                          Level {{ criterion.level }}
                        </span>
                      </div>
                      <p class="text-xs mb-2" :class="mutedClass">{{ criterion.description }}</p>
                    </div>
                    <div class="text-right ml-4">
                      <div class="text-lg font-bold" :class="criterion.status === 'pass' ? 'text-green-600' : criterion.status === 'fail' ? 'text-red-600' : 'text-yellow-600'">{{ criterion.issues }}</div>
                      <div class="text-xs" :class="mutedClass">{{ CRITERION_STATUS[criterion.status] }}</div>
                    </div>
                  </div>
                  <div v-if="criterion.failingElements.length > 0" class="mt-3 pt-3 border-t" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                    <div class="text-xs font-medium mb-2" :class="labelClass">Failing elements ({{ criterion.failingElements.length }}):</div>
                    <div class="space-y-2">
                      <div v-for="(element, idx) in criterion.failingElements" :key="`${element.id}-${idx}`" class="p-2 rounded text-xs" :class="getElementImpactClass(element.impact)">
                        <div class="font-medium mb-1" :class="headingClass">{{ element.message }}</div>
                        <div class="flex flex-wrap items-center gap-3" :class="mutedClass">
                          <span v-if="element.target" class="font-mono">{{ element.target }}</span>
                          <span v-if="element.impact" class="px-1.5 py-0.5 rounded font-medium" :class="getSeverityBadgeClass(element.impact)">{{ element.impact }}</span>
                        </div>
                        <div v-if="element.element" class="mt-1 font-mono p-1 rounded break-all" :class="isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-gray-100 text-gray-700'">{{ element.element }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="selectedApplicationId" class="text-center py-12">
            <p class="text-lg" :class="mutedClass">
              No report for this application yet.{{ canAdmin ? ' Generate one above.' : '' }}
            </p>
          </div>
        </div>

        <!-- Report History Tab -->
        <div v-if="activeTab === 'reports'" class="max-w-7xl mx-auto">
          <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="headingClass">
              <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">history</span>
              Report History
            </h3>
            <div v-if="reports.length === 0" class="text-center py-8">
              <p :class="mutedClass">No reports generated yet.</p>
            </div>
            <ul v-else class="space-y-3">
              <li
                v-for="report in reports"
                :key="report.id"
                class="p-4 rounded-lg border flex flex-wrap items-center justify-between gap-4"
                :class="currentReport?.id === report.id
                  ? (isDarkMode ? 'bg-indigo-900/20 border-indigo-600' : 'bg-indigo-50 border-indigo-500')
                  : (isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200')"
              >
                <button type="button" class="flex-1 text-left" @click="openReport(report.id)">
                  <span class="block font-semibold mb-1" :class="headingClass">{{ report.applicationName }}</span>
                  <span class="block text-sm" :class="mutedClass">
                    {{ formatDate(report.generatedAt) }} · {{ report.source === 'url' ? 'URL' : 'HTML' }}{{ report.scheduled ? ' · scheduled' : '' }}
                  </span>
                </button>
                <div class="text-right">
                  <div class="text-2xl font-bold mb-1" :class="getScoreColor(report.complianceScore)">{{ report.complianceScore }}%</div>
                  <div class="text-xs" :class="mutedClass">{{ report.totalIssues }} issues</div>
                </div>
                <template v-if="canAdmin">
                  <button v-if="confirmingDelete === `report:${report.id}`" type="button" class="px-3 py-1 rounded text-sm bg-red-600 text-white" @click="deleteReport(report.id)">Confirm delete</button>
                  <button v-else type="button" class="px-3 py-1 rounded text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" @click="confirmingDelete = `report:${report.id}`">Delete</button>
                </template>
              </li>
            </ul>
          </div>
        </div>

        <!-- Schedules Tab -->
        <div v-if="activeTab === 'schedules'" class="max-w-7xl mx-auto">
          <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="headingClass">
                <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">schedule</span>
                Scheduled Reports
              </h3>
              <button v-if="canAdmin" type="button" class="px-4 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white" @click="openScheduleModal()">
                Create Schedule
              </button>
            </div>
            <p class="text-xs mb-4" :class="mutedClass">The backend checks for due schedules every minute and scans the page in a browser. Times are UTC. Reports appear in the history; nothing is emailed.</p>
            <div v-if="schedules.length === 0" class="text-center py-8">
              <p :class="mutedClass">No schedules configured.</p>
            </div>
            <ul v-else class="space-y-3">
              <li v-for="schedule in schedules" :key="schedule.id" class="p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div class="font-semibold mb-1" :class="headingClass">{{ getApplicationName(schedule.applicationId) }}</div>
                    <div class="text-sm" :class="mutedClass">
                      {{ schedule.frequency }} at {{ schedule.time }} UTC
                      <span v-if="schedule.frequency === 'weekly'"> on {{ getDayName(schedule.dayOfWeek) }}</span>
                      <span v-if="schedule.frequency === 'monthly'"> on day {{ schedule.dayOfMonth }}{{ schedule.dayOfMonth > 28 ? ' (or the last day of shorter months)' : '' }}</span>
                    </div>
                    <div class="text-xs mt-1" :class="mutedClass">{{ schedule.url || 'Application URL' }}</div>
                    <div class="text-xs mt-1" :class="mutedClass">
                      <span v-if="schedule.enabled">Next run: {{ formatDate(schedule.nextRun) }}</span>
                      <span v-if="schedule.lastRun"> · Last run: {{ formatDate(schedule.lastRun) }} ({{ schedule.lastStatus === 'failed' ? 'failed' : 'ok' }})</span>
                    </div>
                    <div v-if="schedule.lastStatus === 'failed' && schedule.lastError" class="text-xs mt-1 text-red-600">{{ schedule.lastError }}</div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded text-xs font-medium" :class="schedule.enabled ? (isDarkMode ? 'bg-green-700 text-green-200' : 'bg-green-100 text-green-700') : (isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700')">
                      {{ schedule.enabled ? 'Enabled' : 'Disabled' }}
                    </span>
                    <template v-if="canAdmin">
                      <button type="button" class="px-3 py-1 rounded text-sm" :class="secondaryButton" @click="toggleSchedule(schedule)">{{ schedule.enabled ? 'Disable' : 'Enable' }}</button>
                      <button type="button" class="px-3 py-1 rounded text-sm" :class="secondaryButton" @click="openScheduleModal(schedule)">Edit</button>
                      <button v-if="confirmingDelete === `schedule:${schedule.id}`" type="button" class="px-3 py-1 rounded text-sm bg-red-600 text-white" @click="deleteSchedule(schedule.id)">Confirm delete</button>
                      <button v-else type="button" class="px-3 py-1 rounded text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" @click="confirmingDelete = `schedule:${schedule.id}`">Delete</button>
                    </template>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Multi-Application Dashboard Tab -->
        <div v-if="activeTab === 'multi-app'" class="max-w-7xl mx-auto space-y-6">
          <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2" :class="headingClass">
              <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">dashboard</span>
              Multi-Application Compliance
            </h3>
            <div v-if="complianceSummary" class="space-y-6">
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-sm mb-1" :class="mutedClass">Applications</div>
                  <div class="text-2xl font-bold" :class="headingClass">{{ complianceSummary.totalApplications }}</div>
                  <div class="text-xs" :class="mutedClass">{{ complianceSummary.reportedApplications }} with a report</div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'">
                  <div class="text-sm mb-1" :class="isDarkMode ? 'text-green-300' : 'text-green-700'">Meeting SLA</div>
                  <div class="text-2xl font-bold text-green-600">{{ complianceSummary.compliantApplications }}</div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'">
                  <div class="text-sm mb-1" :class="isDarkMode ? 'text-yellow-300' : 'text-yellow-700'">At risk</div>
                  <div class="text-2xl font-bold text-yellow-600">{{ complianceSummary.atRiskApplications }}</div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'">
                  <div class="text-sm mb-1" :class="isDarkMode ? 'text-red-300' : 'text-red-700'">Not meeting SLA</div>
                  <div class="text-2xl font-bold text-red-600">{{ complianceSummary.nonCompliantApplications }}</div>
                  <div class="text-xs" :class="mutedClass">{{ complianceSummary.unassessedApplications }} not assessed</div>
                </div>
                <div class="p-4 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-gray-50'">
                  <div class="text-sm mb-1" :class="mutedClass">Average score</div>
                  <div class="text-2xl font-bold" :class="complianceSummary.reportedApplications ? getScoreColor(complianceSummary.averageScore) : mutedClass">
                    {{ complianceSummary.reportedApplications ? `${complianceSummary.averageScore.toFixed(1)}%` : '—' }}
                  </div>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                      <th v-for="column in SUMMARY_COLUMNS" :key="column" scope="col" class="text-left py-3 px-4 text-sm font-semibold" :class="labelClass">{{ column }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="app in complianceSummary.applications" :key="app.applicationId" class="border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
                      <td class="py-3 px-4 font-medium" :class="headingClass">
                        <button v-if="app.latestReportId" type="button" class="underline text-left" @click="openReport(app.latestReportId)">{{ app.applicationName }}</button>
                        <span v-else>{{ app.applicationName }}</span>
                      </td>
                      <td class="py-3 px-4">
                        <span v-if="app.complianceScore !== null" class="text-lg font-bold" :class="getScoreColor(app.complianceScore)">{{ app.complianceScore }}%</span>
                        <span v-else :class="mutedClass">—</span>
                      </td>
                      <td class="py-3 px-4 text-sm" :class="labelClass">{{ app.wcagLevel ? levelLabel(app.wcagLevel) : '—' }}</td>
                      <td class="py-3 px-4 text-sm" :class="labelClass">{{ app.complianceScore !== null ? `${app.totalIssues} (${app.criticalIssues} critical, ${app.highIssues} high)` : '—' }}</td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded text-xs font-medium" :class="slaBadge(app.slaStatus)">{{ SLA_LABELS[app.slaStatus] }}</span>
                      </td>
                      <td class="py-3 px-4 text-sm" :class="mutedClass">{{ app.lastReportDate ? formatDate(app.lastReportDate) : 'Never' }}</td>
                      <td class="py-3 px-4">
                        <span v-if="app.trend" class="text-xs" :class="app.trend.scoreChange >= 0 ? 'text-green-500' : 'text-red-500'">
                          {{ app.trend.scoreChange >= 0 ? '+' : '' }}{{ app.trend.scoreChange.toFixed(1) }}
                        </span>
                        <span v-else class="text-xs" :class="mutedClass">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <p :class="mutedClass">Loading compliance summary…</p>
            </div>
          </div>
        </div>

        <!-- SLA Management Tab -->
        <div v-if="activeTab === 'slas'" class="max-w-7xl mx-auto space-y-6">
          <div class="rounded-lg shadow-sm border p-6" :class="cardClass">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold flex items-center gap-2" :class="headingClass">
                <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">gavel</span>
                Compliance SLAs
              </h3>
              <button v-if="canAdmin" type="button" class="px-4 py-2 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white" @click="openSLAModal()">Create SLA</button>
            </div>
            <p class="text-xs mb-4" :class="mutedClass">One SLA per application. Non-compliant: below the target score or level, or more critical issues than allowed. At risk: more high issues than allowed, at a limit, or within 5 points of the target score.</p>
            <div v-if="slas.length === 0" class="text-center py-8">
              <p :class="mutedClass">No SLAs configured.</p>
            </div>
            <ul v-else class="space-y-3">
              <li v-for="sla in slas" :key="sla.id" class="p-4 rounded-lg border" :class="isDarkMode ? 'bg-slate-800 border-gray-700' : 'bg-white border-gray-200'">
                <div class="flex flex-wrap items-center justify-between gap-4">
                  <div class="flex-1">
                    <div class="font-semibold mb-2" :class="headingClass">{{ getApplicationName(sla.applicationId) }}</div>
                    <dl class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><dt class="text-xs mb-1" :class="mutedClass">Target score</dt><dd class="font-medium" :class="headingClass">{{ sla.targetScore }}%</dd></div>
                      <div><dt class="text-xs mb-1" :class="mutedClass">Target level</dt><dd class="font-medium" :class="headingClass">WCAG 2.x {{ sla.targetLevel }}</dd></div>
                      <div><dt class="text-xs mb-1" :class="mutedClass">Max critical issues</dt><dd class="font-medium" :class="headingClass">{{ sla.criticalIssuesThreshold }}</dd></div>
                      <div><dt class="text-xs mb-1" :class="mutedClass">Max high issues</dt><dd class="font-medium" :class="headingClass">{{ sla.highIssuesThreshold }}</dd></div>
                    </dl>
                  </div>
                  <div v-if="canAdmin" class="flex items-center gap-2">
                    <button type="button" class="px-3 py-1 rounded text-sm" :class="secondaryButton" @click="openSLAModal(sla)">Edit</button>
                    <button v-if="confirmingDelete === `sla:${sla.id}`" type="button" class="px-3 py-1 rounded text-sm bg-red-600 text-white" @click="deleteSLA(sla.id)">Confirm delete</button>
                    <button v-else type="button" class="px-3 py-1 rounded text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" @click="confirmingDelete = `sla:${sla.id}`">Delete</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div v-if="showScheduleModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="closeScheduleModal" @keydown.esc="closeScheduleModal">
      <div class="rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" role="dialog" aria-modal="true" aria-labelledby="schedule-modal-title">
        <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <h2 id="schedule-modal-title" class="text-xl font-semibold flex items-center gap-2" :class="headingClass">
            <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">schedule</span>
            {{ editingSchedule ? 'Edit Schedule' : 'Create Schedule' }}
          </h2>
          <button type="button" class="p-1 rounded" :class="isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'" aria-label="Close" @click="closeScheduleModal">
            <span class="material-symbols-outlined" :class="mutedClass" aria-hidden="true">close</span>
          </button>
        </div>
        <form class="p-6 space-y-4" @submit.prevent="saveSchedule">
          <div>
            <label for="schedule-app" class="block text-sm font-medium mb-2" :class="labelClass">Application</label>
            <select id="schedule-app" v-model="scheduleForm.applicationId" required :disabled="!!editingSchedule" class="w-full px-4 py-2 rounded-lg border" :class="inputClass">
              <option value="" disabled>Select an application</option>
              <option v-for="app in applications" :key="app.id" :value="app.id">{{ app.name }}</option>
            </select>
          </div>
          <div>
            <label for="schedule-url" class="block text-sm font-medium mb-2" :class="labelClass">Page URL</label>
            <input id="schedule-url" v-model.trim="scheduleForm.url" type="url" :placeholder="applicationUrlFor(scheduleForm.applicationId) || 'https://app.example.com'" class="w-full px-4 py-2 rounded-lg border" :class="inputClass" />
            <p class="text-xs mt-1" :class="mutedClass">Leave empty to use the application's URL.</p>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label for="schedule-frequency" class="block text-sm font-medium mb-2" :class="labelClass">Frequency</label>
              <select id="schedule-frequency" v-model="scheduleForm.frequency" class="w-full px-4 py-2 rounded-lg border" :class="inputClass">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label for="schedule-time" class="block text-sm font-medium mb-2" :class="labelClass">Time (UTC)</label>
              <input id="schedule-time" v-model="scheduleForm.time" type="time" required class="w-full px-4 py-2 rounded-lg border" :class="inputClass" />
            </div>
            <div v-if="scheduleForm.frequency === 'weekly'">
              <label for="schedule-dow" class="block text-sm font-medium mb-2" :class="labelClass">Day of week</label>
              <select id="schedule-dow" v-model.number="scheduleForm.dayOfWeek" class="w-full px-4 py-2 rounded-lg border" :class="inputClass">
                <option v-for="(day, index) in DAYS" :key="day" :value="index">{{ day }}</option>
              </select>
            </div>
            <div v-if="scheduleForm.frequency === 'monthly'">
              <label for="schedule-dom" class="block text-sm font-medium mb-2" :class="labelClass">Day of month</label>
              <input id="schedule-dom" v-model.number="scheduleForm.dayOfMonth" type="number" min="1" max="31" required class="w-full px-4 py-2 rounded-lg border" :class="inputClass" />
              <p class="text-xs mt-1" :class="mutedClass">29–31 run on the last day of shorter months.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <input id="schedule-enabled" v-model="scheduleForm.enabled" type="checkbox" class="accent-indigo-600" />
            <label for="schedule-enabled" class="text-sm" :class="labelClass">Enabled</label>
          </div>
          <div class="flex gap-4 pt-4">
            <button type="submit" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50" :disabled="savingForm">
              {{ editingSchedule ? 'Save Schedule' : 'Create Schedule' }}
            </button>
            <button type="button" class="flex-1 px-4 py-2 rounded-lg border font-medium" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'" @click="closeScheduleModal">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- SLA Modal -->
    <div v-if="showSLAModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="closeSLAModal" @keydown.esc="closeSLAModal">
      <div class="rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" :class="isDarkMode ? 'bg-slate-800' : 'bg-white'" role="dialog" aria-modal="true" aria-labelledby="sla-modal-title">
        <div class="p-6 border-b flex items-center justify-between" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
          <h2 id="sla-modal-title" class="text-xl font-semibold flex items-center gap-2" :class="headingClass">
            <span class="material-symbols-outlined text-indigo-600" aria-hidden="true">gavel</span>
            {{ editingSLA ? 'Edit SLA' : 'Create SLA' }}
          </h2>
          <button type="button" class="p-1 rounded" :class="isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'" aria-label="Close" @click="closeSLAModal">
            <span class="material-symbols-outlined" :class="mutedClass" aria-hidden="true">close</span>
          </button>
        </div>
        <form class="p-6 space-y-4" @submit.prevent="saveSLA">
          <div>
            <label for="sla-app" class="block text-sm font-medium mb-2" :class="labelClass">Application</label>
            <select id="sla-app" v-model="slaForm.applicationId" required :disabled="!!editingSLA" class="w-full px-4 py-2 rounded-lg border" :class="inputClass">
              <option value="" disabled>Select an application</option>
              <option v-for="app in applications" :key="app.id" :value="app.id" :disabled="!editingSLA && slaApplicationIds.has(app.id)">
                {{ app.name }}{{ !editingSLA && slaApplicationIds.has(app.id) ? ' (has an SLA)' : '' }}
              </option>
            </select>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label for="sla-score" class="block text-sm font-medium mb-2" :class="labelClass">Target score (%)</label>
              <input id="sla-score" v-model.number="slaForm.targetScore" type="number" min="0" max="100" step="1" required class="w-full px-4 py-2 rounded-lg border" :class="inputClass" />
            </div>
            <div>
              <label for="sla-level" class="block text-sm font-medium mb-2" :class="labelClass">Target WCAG level</label>
              <select id="sla-level" v-model="slaForm.targetLevel" class="w-full px-4 py-2 rounded-lg border" :class="inputClass">
                <option value="A">A</option>
                <option value="AA">AA</option>
                <option value="AAA">AAA (not tested automatically, so never met)</option>
              </select>
            </div>
            <div>
              <label for="sla-critical" class="block text-sm font-medium mb-2" :class="labelClass">Max critical issues</label>
              <input id="sla-critical" v-model.number="slaForm.criticalIssuesThreshold" type="number" min="0" step="1" required class="w-full px-4 py-2 rounded-lg border" :class="inputClass" />
            </div>
            <div>
              <label for="sla-high" class="block text-sm font-medium mb-2" :class="labelClass">Max high issues</label>
              <input id="sla-high" v-model.number="slaForm.highIssuesThreshold" type="number" min="0" step="1" required class="w-full px-4 py-2 rounded-lg border" :class="inputClass" />
            </div>
          </div>
          <div class="flex gap-4 pt-4">
            <button type="submit" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50" :disabled="savingForm">
              {{ editingSLA ? 'Save SLA' : 'Create SLA' }}
            </button>
            <button type="button" class="flex-1 px-4 py-2 rounded-lg border font-medium" :class="isDarkMode ? 'border-gray-600 bg-slate-800 text-gray-300 hover:bg-slate-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'" @click="closeSLAModal">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import jsPDF from 'jspdf';
import DocumentationDrawer from '../components/DocumentationDrawer.vue';
import Breadcrumbs from '../components/Breadcrumbs.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useDrawer } from '../composables/useDrawer.js';
import { useDarkMode } from '../composables/useDarkMode.js';
import { useNotice } from '../composables/useNotice.js';
import { useAuth } from '../composables/useAuth.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'reports', label: 'Report History' },
  { id: 'multi-app', label: 'Multi-Application' },
  { id: 'schedules', label: 'Schedules' },
  { id: 'slas', label: 'SLA Management' },
];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SUMMARY_COLUMNS = ['Application', 'Score', 'WCAG level', 'Issues', 'SLA', 'Last report', 'Trend'];
const SLA_LABELS = {
  compliant: 'Meets SLA',
  'at-risk': 'At risk',
  'non-compliant': 'Not meeting SLA',
  'no-sla': 'No SLA',
  'no-report': 'No report yet',
};
const CRITERION_STATUS = { pass: 'Pass', fail: 'Fail', review: 'Needs review' };

const { drawerOpen, closeDrawer, toggleDrawer } = useDrawer();
const isDarkMode = useDarkMode();
const { notice, showNotice, clearNotice } = useNotice();
const { hasPermission } = useAuth();
const canAdmin = computed(() => hasPermission('admin:governance'));

const activeTab = ref('dashboard');
const applications = ref([]);
const applicationsLoaded = ref(false);
const selectedApplicationId = ref('');
const loading = ref(false);
const currentReport = ref(null);
const reports = ref([]);
const schedules = ref([]);
const slas = ref([]);
const complianceSummary = ref(null);
const confirmingDelete = ref(null);
const savingForm = ref(false);

const generateSource = ref('url');
const generateUrl = ref('');
const generateHtml = ref('');

const showScheduleModal = ref(false);
const editingSchedule = ref(null);
const blankSchedule = () => ({ applicationId: selectedApplicationId.value || '', url: '', frequency: 'weekly', dayOfWeek: 1, dayOfMonth: 1, time: '09:00', enabled: true });
const scheduleForm = ref(blankSchedule());

const showSLAModal = ref(false);
const editingSLA = ref(null);
const blankSLA = () => ({ applicationId: '', targetScore: 90, targetLevel: 'AA', criticalIssuesThreshold: 0, highIssuesThreshold: 5 });
const slaForm = ref(blankSLA());

// ---------- Presentation ----------
const cardClass = computed(() => (isDarkMode.value ? 'bg-slate-900 border-gray-700' : 'bg-white border-gray-200'));
const headingClass = computed(() => (isDarkMode.value ? 'text-white' : 'text-gray-900'));
const mutedClass = computed(() => (isDarkMode.value ? 'text-gray-400' : 'text-gray-600'));
const labelClass = computed(() => (isDarkMode.value ? 'text-gray-300' : 'text-gray-700'));
const inputClass = computed(() => (isDarkMode.value ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'));
const secondaryButton = computed(() => (isDarkMode.value ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'));

const selectedApplication = computed(() => applications.value.find((a) => a.id === selectedApplicationId.value) ?? null);
const slaApplicationIds = computed(() => new Set(slas.value.map((s) => s.applicationId)));
const canGenerate = computed(() =>
  generateSource.value === 'html' ? !!generateHtml.value.trim() : !!(generateUrl.value || selectedApplication.value?.applicationUrl),
);

const getScoreColor = (score) => {
  if (score >= 95) return 'text-green-500';
  if (score >= 85) return 'text-blue-500';
  if (score >= 70) return 'text-yellow-500';
  return 'text-red-500';
};

const levelLabel = (level) => (level === 'Non-Compliant' ? 'Fails WCAG A' : `No automated WCAG ${level} failures`);

const formatCategoryName = (category) =>
  category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

const IMPACT_STYLES = {
  CRITICAL: ['red'],
  HIGH: ['orange'],
  MODERATE: ['yellow'],
  LOW: ['blue'],
  INFO: ['gray'],
};
const colorFor = (impact) => IMPACT_STYLES[String(impact || '').toUpperCase()]?.[0] ?? 'gray';

// Full class strings so Tailwind keeps them
const BORDER = {
  red: ['border-red-200', 'border-red-700'],
  orange: ['border-orange-200', 'border-orange-700'],
  yellow: ['border-yellow-200', 'border-yellow-700'],
  blue: ['border-blue-200', 'border-blue-700'],
  gray: ['border-gray-200', 'border-gray-700'],
};
const BADGE = {
  red: ['bg-red-100 text-red-700', 'bg-red-700 text-red-200'],
  orange: ['bg-orange-100 text-orange-700', 'bg-orange-700 text-orange-200'],
  yellow: ['bg-yellow-100 text-yellow-700', 'bg-yellow-700 text-yellow-200'],
  blue: ['bg-blue-100 text-blue-700', 'bg-blue-700 text-blue-200'],
  gray: ['bg-gray-100 text-gray-700', 'bg-gray-700 text-gray-200'],
};
const PANEL = {
  red: ['bg-red-50 border border-red-200', 'bg-red-900/20 border border-red-700'],
  orange: ['bg-orange-50 border border-orange-200', 'bg-orange-900/20 border border-orange-700'],
  yellow: ['bg-yellow-50 border border-yellow-200', 'bg-yellow-900/20 border border-yellow-700'],
  blue: ['bg-blue-50 border border-blue-200', 'bg-blue-900/20 border border-blue-700'],
  gray: ['bg-gray-50 border border-gray-200', 'bg-gray-900/20 border border-gray-700'],
};
const pick = (table, impact) => table[colorFor(impact)][isDarkMode.value ? 1 : 0];
const getSeverityClass = (severity) => `${isDarkMode.value ? 'bg-slate-800' : 'bg-white'} border ${pick(BORDER, severity)}`;
const getSeverityBadgeClass = (severity) => pick(BADGE, severity);
const getElementImpactClass = (impact) => pick(PANEL, impact);
const criterionClass = (status) =>
  status === 'pass'
    ? isDarkMode.value ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
    : status === 'fail'
      ? isDarkMode.value ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
      : isDarkMode.value ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200';
const slaBadge = (status) =>
  ({
    compliant: isDarkMode.value ? 'bg-green-700 text-green-200' : 'bg-green-100 text-green-700',
    'at-risk': isDarkMode.value ? 'bg-yellow-700 text-yellow-200' : 'bg-yellow-100 text-yellow-700',
    'non-compliant': isDarkMode.value ? 'bg-red-700 text-red-200' : 'bg-red-100 text-red-700',
  })[status] ?? (isDarkMode.value ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700');

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const getDayName = (day) => DAYS[day] ?? '';
const getApplicationName = (id) => applications.value.find((a) => a.id === id)?.name ?? id;
const applicationUrlFor = (id) => applications.value.find((a) => a.id === id)?.applicationUrl ?? '';
const fail = (error, fallback) => showNotice(apiErrorMessage(error, fallback), 'error');

// ---------- Loading ----------
const loadApplications = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/applications');
    applications.value = data.applications ?? [];
  } catch (error) {
    fail(error, 'Could not load applications.');
  } finally {
    applicationsLoaded.value = true;
  }
};

const loadReports = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/accessibility-reports/reports');
    reports.value = data;
  } catch (error) {
    fail(error, 'Could not load reports.');
  }
};

const loadSchedules = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/accessibility-reports/schedules');
    schedules.value = data;
  } catch (error) {
    fail(error, 'Could not load schedules.');
  }
};

const loadSLAs = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/accessibility-reports/slas');
    slas.value = data;
  } catch (error) {
    fail(error, 'Could not load SLAs.');
  }
};

const loadComplianceSummary = async () => {
  try {
    const { data } = await apiClient.get('/api/v1/accessibility-reports/summary');
    complianceSummary.value = data;
  } catch (error) {
    fail(error, 'Could not load the compliance summary.');
  }
};

const openReport = async (reportId) => {
  try {
    const { data } = await apiClient.get(`/api/v1/accessibility-reports/reports/${encodeURIComponent(reportId)}`);
    currentReport.value = data;
    if (selectedApplicationId.value !== data.applicationId) {
      skipNextLoad = true;
      selectedApplicationId.value = data.applicationId;
    }
    activeTab.value = 'dashboard';
  } catch (error) {
    fail(error, 'Could not load the report.');
  }
};

/** The latest report for the selected application */
const loadLatestReport = async () => {
  currentReport.value = null;
  if (!selectedApplicationId.value) return;
  try {
    const { data } = await apiClient.get('/api/v1/accessibility-reports/reports', { params: { applicationId: selectedApplicationId.value } });
    if (data.length) await openReport(data[0].id);
  } catch (error) {
    fail(error, 'Could not load the latest report.');
  }
};

let skipNextLoad = false;
watch(selectedApplicationId, () => {
  generateUrl.value = '';
  if (skipNextLoad) {
    skipNextLoad = false;
    return;
  }
  loadLatestReport();
});

// ---------- Reports ----------
const generateReport = async () => {
  loading.value = true;
  try {
    const body = generateSource.value === 'html' ? { html: generateHtml.value } : generateUrl.value ? { url: generateUrl.value } : {};
    const { data } = await apiClient.post(`/api/v1/accessibility-reports/generate/${encodeURIComponent(selectedApplicationId.value)}`, body);
    currentReport.value = data;
    showNotice(`Report generated: score ${data.complianceScore}%, ${data.totalIssues} issues.`, 'success');
    loadReports();
    complianceSummary.value = null;
  } catch (error) {
    fail(error, 'Could not generate the report.');
  } finally {
    loading.value = false;
  }
};

const deleteReport = async (reportId) => {
  try {
    await apiClient.delete(`/api/v1/accessibility-reports/reports/${encodeURIComponent(reportId)}`);
    reports.value = reports.value.filter((r) => r.id !== reportId);
    if (currentReport.value?.id === reportId) currentReport.value = null;
    complianceSummary.value = null;
    showNotice('Report deleted.', 'success');
  } catch (error) {
    fail(error, 'Could not delete the report.');
  } finally {
    confirmingDelete.value = null;
  }
};

// ---------- Schedules ----------
const openScheduleModal = (schedule = null) => {
  editingSchedule.value = schedule;
  scheduleForm.value = schedule
    ? {
        applicationId: schedule.applicationId,
        url: schedule.url ?? '',
        frequency: schedule.frequency,
        dayOfWeek: schedule.dayOfWeek ?? 1,
        dayOfMonth: schedule.dayOfMonth ?? 1,
        time: schedule.time,
        enabled: schedule.enabled,
      }
    : blankSchedule();
  showScheduleModal.value = true;
};

const closeScheduleModal = () => {
  showScheduleModal.value = false;
  editingSchedule.value = null;
};

const schedulePayload = () => {
  const form = scheduleForm.value;
  const body = { frequency: form.frequency, time: form.time, enabled: form.enabled };
  if (form.frequency === 'weekly') body.dayOfWeek = form.dayOfWeek;
  if (form.frequency === 'monthly') body.dayOfMonth = form.dayOfMonth;
  if (form.url) body.url = form.url;
  return body;
};

const saveSchedule = async () => {
  savingForm.value = true;
  try {
    if (editingSchedule.value) {
      // An empty URL clears a custom URL so the application's URL is used
      const body = { ...schedulePayload(), url: scheduleForm.value.url || '' };
      await apiClient.put(`/api/v1/accessibility-reports/schedules/${encodeURIComponent(editingSchedule.value.id)}`, body);
    } else {
      await apiClient.post('/api/v1/accessibility-reports/schedules', { applicationId: scheduleForm.value.applicationId, ...schedulePayload() });
    }
    showNotice(editingSchedule.value ? 'Schedule saved.' : 'Schedule created.', 'success');
    closeScheduleModal();
    await loadSchedules();
  } catch (error) {
    fail(error, 'Could not save the schedule.');
  } finally {
    savingForm.value = false;
  }
};

const toggleSchedule = async (schedule) => {
  try {
    await apiClient.put(`/api/v1/accessibility-reports/schedules/${encodeURIComponent(schedule.id)}`, { enabled: !schedule.enabled });
    await loadSchedules();
  } catch (error) {
    fail(error, 'Could not change the schedule.');
  }
};

const deleteSchedule = async (scheduleId) => {
  try {
    await apiClient.delete(`/api/v1/accessibility-reports/schedules/${encodeURIComponent(scheduleId)}`);
    schedules.value = schedules.value.filter((s) => s.id !== scheduleId);
    showNotice('Schedule deleted.', 'success');
  } catch (error) {
    fail(error, 'Could not delete the schedule.');
  } finally {
    confirmingDelete.value = null;
  }
};

// ---------- SLAs ----------
const openSLAModal = (sla = null) => {
  editingSLA.value = sla;
  slaForm.value = sla
    ? {
        applicationId: sla.applicationId,
        targetScore: sla.targetScore,
        targetLevel: sla.targetLevel,
        criticalIssuesThreshold: sla.criticalIssuesThreshold,
        highIssuesThreshold: sla.highIssuesThreshold,
      }
    : blankSLA();
  showSLAModal.value = true;
};

const closeSLAModal = () => {
  showSLAModal.value = false;
  editingSLA.value = null;
};

const saveSLA = async () => {
  savingForm.value = true;
  try {
    const { applicationId, ...targets } = slaForm.value;
    if (editingSLA.value) {
      await apiClient.put(`/api/v1/accessibility-reports/slas/${encodeURIComponent(editingSLA.value.id)}`, targets);
    } else {
      await apiClient.post('/api/v1/accessibility-reports/slas', { applicationId, ...targets });
    }
    showNotice(editingSLA.value ? 'SLA saved.' : 'SLA created.', 'success');
    closeSLAModal();
    complianceSummary.value = null;
    await loadSLAs();
  } catch (error) {
    fail(error, 'Could not save the SLA.');
  } finally {
    savingForm.value = false;
  }
};

const deleteSLA = async (slaId) => {
  try {
    await apiClient.delete(`/api/v1/accessibility-reports/slas/${encodeURIComponent(slaId)}`);
    slas.value = slas.value.filter((s) => s.id !== slaId);
    complianceSummary.value = null;
    showNotice('SLA deleted.', 'success');
  } catch (error) {
    fail(error, 'Could not delete the SLA.');
  } finally {
    confirmingDelete.value = null;
  }
};

watch(activeTab, (tab) => {
  confirmingDelete.value = null;
  if (tab === 'multi-app' && !complianceSummary.value) loadComplianceSummary();
});

onMounted(async () => {
  if (sessionStorage.getItem('openDrawerOnLoad') === 'true') {
    drawerOpen.value = true;
    sessionStorage.removeItem('openDrawerOnLoad');
  }
  await loadApplications();
  await Promise.all([loadReports(), loadSchedules(), loadSLAs()]);
});

// ---------- PDF export ----------
const exportToPDF = () => {
  if (!currentReport.value) {
    showNotice('Open a report first.', 'info');
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
        
        // Element selector
        if (element.target) {
          doc.setFontSize(7);
          doc.setTextColor(100, 100, 100);
          doc.text(doc.splitTextToSize(`Selector: ${element.target}`, pageWidth - textStartX - margin), textStartX, yPos);
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
</script>

<style scoped>
.texture-pattern {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
