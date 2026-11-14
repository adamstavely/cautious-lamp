<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="Accessibility reports"
      lead="Automated WCAG compliance monitoring, trend tracking, and prioritized fix recommendations. Stay on top of accessibility across all your applications."
      spot="site/accessibility-reports"
    />

    <InlineNotice :notice="notice" class="mb-6" @dismiss="clearNotice" />

    <UiTabs v-model="activeTab" :tabs="TABS" label="Accessibility reports">
      <!-- Dashboard -->
      <template #dashboard>
        <div class="space-y-6">
          <UiPanel title="Application" description="Choose an application to see its latest report.">
            <p v-if="applicationsLoaded && applications.length === 0" class="text-sm text-ink-secondary">
              <UiLink to="/admin/applications/register">Register one first.</UiLink>
            </p>
            <UiSelect
              id="a11y-app"
              v-model="selectedApplicationId"
              label="Application"
              class="max-w-md"
              :placeholder="applications.length ? 'Select an application' : 'No applications'"
              :options="applicationOptions"
            />

            <!-- Generate -->
            <div v-if="canAdmin && selectedApplicationId" class="pt-5 border-t border-line space-y-4">
              <UiSegmented v-model="generateSource" label="What to scan" :options="GENERATE_SOURCES" />
              <UiInput
                v-if="generateSource === 'url'"
                id="a11y-url"
                :model-value="generateUrl"
                type="url"
                label="Page URL"
                :placeholder="selectedApplication?.applicationUrl || 'https://app.example.com'"
                :hint="`Leave empty to use the application's URL${selectedApplication?.applicationUrl ? '' : ' (this application has none)'}.`"
                @update:model-value="generateUrl = String($event).trim()"
              />
              <UiTextarea
                v-else
                id="a11y-html"
                v-model="generateHtml"
                label="HTML"
                rows="6"
                spellcheck="false"
                mono
                hint="Checked without a browser, so colour contrast is listed as needing review rather than tested."
              />
              <div>
                <UiButton variant="primary" icon="play_arrow" :loading="loading" :disabled="!canGenerate" @click="generateReport">
                  {{ loading ? 'Scanning…' : 'Generate report' }}
                </UiButton>
              </div>
            </div>
          </UiPanel>

          <div v-if="loading" class="flex justify-center py-12">
            <UiSpinner label="Generating accessibility report…" />
          </div>

          <div v-else-if="currentReport" class="space-y-6">
            <p class="text-sm text-ink-secondary">
              {{ currentReport.applicationName }} · {{ formatDate(currentReport.generatedAt) }} ·
              {{ currentReport.source === 'url' ? `URL ${currentReport.url || ''} (browser)` : 'Supplied HTML (no browser)' }}
              <span v-if="currentReport.scheduled"> · scheduled</span>
            </p>

            <!-- WCAG compliance overview -->
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <UiStat
                label="Compliance score"
                icon="check_circle"
                :value="`${currentReport.complianceScore}%`"
                :tone="scoreTone(currentReport.complianceScore)"
                :hint="levelLabel(currentReport.wcagLevel)"
              />
              <UiStat label="Critical issues" icon="error" tone="danger" :value="currentReport.criticalIssues" hint="Blocking accessibility" />
              <UiStat label="Total issues" icon="warning" :value="currentReport.totalIssues">
                {{ currentReport.totalIssues }}
                <span class="block text-sm font-normal tracking-normal text-ink-muted">
                  {{ currentReport.highIssues }} high, {{ currentReport.moderateIssues }} moderate, {{ currentReport.lowIssues }} low
                  <span v-if="currentReport.needsReview"> · {{ currentReport.needsReview }} need manual review</span>
                </span>
                <span v-if="currentReport.sampling" class="block text-xs font-normal tracking-normal text-ink-muted mt-1">
                  Counts include every failing element; {{ currentReport.sampling.rules.length }} rule(s) list only the first {{ currentReport.sampling.examplesPerRule }} as examples.
                </span>
              </UiStat>
              <UiStat
                v-if="currentReport.previousReportId"
                label="Trend"
                :icon="currentReport.trend.scoreChange >= 0 ? 'trending_up' : 'trending_down'"
                :tone="currentReport.trend.scoreChange >= 0 ? 'success' : 'danger'"
                :value="`${currentReport.trend.scoreChange >= 0 ? '+' : ''}${currentReport.trend.scoreChange.toFixed(1)}`"
                :hint="`${currentReport.trend.fixedIssues} fixed, ${currentReport.trend.newIssues} new`"
              />
              <UiStat v-else label="Trend" icon="trending_flat" value="–" hint="First report for this application." />
            </div>

            <!-- Issues by category -->
            <UiPanel title="Issues by category">
              <dl class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="(count, category) in currentReport.issuesByCategory" :key="category" class="flex flex-col-reverse text-center">
                  <dt class="text-xs text-ink-muted">{{ formatCategoryName(category) }}</dt>
                  <dd class="text-2xl font-semibold mb-1 text-ink-strong">{{ count }}</dd>
                </div>
              </dl>
            </UiPanel>

            <!-- Prioritized fixes -->
            <UiPanel title="Prioritized fixes">
              <template #actions>
                <UiButton size="sm" icon="picture_as_pdf" @click="exportToPDF">Export PDF</UiButton>
              </template>
              <p v-if="currentReport.prioritizedFixes.length === 0" class="text-sm text-ink-secondary">No automated violations found.</p>
              <ul v-else class="space-y-3">
                <li v-for="fix in currentReport.prioritizedFixes.slice(0, 10)" :key="fix.id" class="tone-card" :class="toneCard(impactTone(fix.severity))">
                  <div class="flex flex-wrap items-center gap-2 mb-1">
                    <UiChip :tone="impactTone(fix.severity)">{{ fix.severity }}</UiChip>
                    <span class="text-sm font-semibold text-ink-strong">{{ fix.rule }}</span>
                  </div>
                  <p class="text-sm mb-2 text-ink">{{ fix.description }}</p>
                  <div class="flex flex-wrap items-center gap-4 text-xs text-ink-secondary">
                    <span>WCAG {{ fix.wcagCriterion }}</span>
                    <span>{{ fix.affectedElements }} elements</span>
                    <span>Effort: {{ fix.effort }}</span>
                    <span>Priority: {{ fix.priority.toFixed(1) }}</span>
                    <UiLink v-if="fix.helpUrl" :href="fix.helpUrl" external>How to fix</UiLink>
                  </div>
                  <div v-if="fix.codeExamples && fix.codeExamples.length > 0" class="mt-3 p-3 rounded-tile bg-surface-sunken space-y-4">
                    <div v-for="(example, idx) in fix.codeExamples" :key="idx" class="space-y-2">
                      <p class="text-xs italic text-ink-secondary">{{ example.explanation }}</p>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p class="text-xs font-medium mb-1 text-danger">Before</p>
                          <pre class="code-sample border-danger-border"><code>{{ example.before }}</code></pre>
                        </div>
                        <div>
                          <p class="text-xs font-medium mb-1 text-success">After</p>
                          <pre class="code-sample border-success-border"><code>{{ example.after }}</code></pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </UiPanel>

            <!-- WCAG criteria breakdown -->
            <UiPanel
              title="WCAG criteria"
              description='Automated checks (axe-core, WCAG 2.x A and AA). Passing them does not prove conformance; criteria marked "Needs review" must be checked by hand.'
            >
              <ul class="space-y-4">
                <li v-for="(criterion, key) in currentReport.wcagCriteria" :key="key" class="tone-card" :class="toneCard(criterionTone(criterion.status))">
                  <div class="flex items-start justify-between gap-4 mb-2">
                    <div class="flex-1">
                      <div class="flex flex-wrap items-center gap-2 mb-1">
                        <span class="text-sm font-semibold text-ink-strong">{{ criterion.criterion }}</span>
                        <UiChip :tone="criterion.level === 'AA' ? 'info' : 'neutral'">Level {{ criterion.level }}</UiChip>
                      </div>
                      <p class="text-xs mb-2 text-ink-secondary">{{ criterion.description }}</p>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-semibold" :class="toneText(criterionTone(criterion.status))">{{ criterion.issues }}</div>
                      <div class="text-xs text-ink-muted">{{ CRITERION_STATUS[criterion.status] }}</div>
                    </div>
                  </div>
                  <div v-if="criterion.failingElements.length > 0" class="mt-3 pt-3 border-t border-line">
                    <div class="text-xs font-medium mb-2 text-ink">
                      Failing elements ({{ criterion.issues > criterion.failingElements.length ? `showing ${criterion.failingElements.length} of ${criterion.issues}` : criterion.failingElements.length }}):
                    </div>
                    <ul class="space-y-2">
                      <li v-for="(element, idx) in criterion.failingElements" :key="`${element.id}-${idx}`" class="tone-card p-2 text-xs" :class="toneCard(impactTone(element.impact))">
                        <div class="font-medium mb-1 text-ink-strong">{{ element.message }}</div>
                        <div class="flex flex-wrap items-center gap-3 text-ink-secondary">
                          <span v-if="element.target" class="font-code">{{ element.target }}</span>
                          <UiChip v-if="element.impact" :tone="impactTone(element.impact)">{{ element.impact }}</UiChip>
                        </div>
                        <div v-if="element.element" class="mt-1 font-code p-1 rounded-control break-all bg-surface-sunken text-ink">{{ element.element }}</div>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </UiPanel>
          </div>

          <UiEmptyState
            v-else-if="selectedApplicationId"
            spot="site/accessibility-reports"
            title="No report for this application yet"
            :body="canAdmin ? 'Generate one above.' : ''"
          />
        </div>
      </template>

      <!-- Report history -->
      <template #reports>
        <UiPanel title="Report history">
          <p v-if="reports.length === 0" class="text-sm text-ink-secondary">No reports generated yet.</p>
          <ul v-else class="space-y-3">
            <li
              v-for="report in reports"
              :key="report.id"
              class="list-row"
              :class="{ 'list-row-on': currentReport?.id === report.id }"
            >
              <button type="button" class="list-row-select" @click="openReport(report.id)">
                <span class="block font-semibold mb-1 text-ink-strong">{{ report.applicationName }}</span>
                <span class="block text-sm text-ink-secondary">
                  {{ formatDate(report.generatedAt) }} · {{ report.source === 'url' ? 'URL' : 'HTML' }}{{ report.scheduled ? ' · scheduled' : '' }}
                </span>
              </button>
              <div class="text-right">
                <div class="text-2xl font-semibold mb-1" :class="toneText(scoreTone(report.complianceScore))">{{ report.complianceScore }}%</div>
                <div class="text-xs text-ink-muted">{{ report.totalIssues }} issues</div>
              </div>
              <template v-if="canAdmin">
                <UiButton v-if="confirmingDelete === `report:${report.id}`" size="sm" variant="danger" @click="deleteReport(report.id)">Confirm delete</UiButton>
                <UiButton v-else size="sm" variant="ghost" icon="delete" @click="confirmingDelete = `report:${report.id}`">Delete</UiButton>
              </template>
            </li>
          </ul>
        </UiPanel>
      </template>

      <!-- Multi-application -->
      <template #multi-app>
        <div v-if="complianceSummary" class="space-y-6">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <UiStat label="Applications" :value="complianceSummary.totalApplications" :hint="`${complianceSummary.reportedApplications} with a report`" />
            <UiStat label="Meeting SLA" tone="success" :value="complianceSummary.compliantApplications" />
            <UiStat label="At risk" tone="warning" :value="complianceSummary.atRiskApplications" />
            <UiStat
              label="Not meeting SLA"
              tone="danger"
              :value="complianceSummary.nonCompliantApplications"
              :hint="`${complianceSummary.unassessedApplications} not assessed`"
            />
            <UiStat
              label="Average score"
              :tone="complianceSummary.reportedApplications ? scoreTone(complianceSummary.averageScore) : 'neutral'"
              :value="complianceSummary.reportedApplications ? `${complianceSummary.averageScore.toFixed(1)}%` : '—'"
            />
          </div>

          <UiPanel title="Multi-application compliance" flush>
            <UiTable caption="Accessibility compliance by application">
              <thead>
                <tr>
                  <th v-for="column in SUMMARY_COLUMNS" :key="column" scope="col">{{ column }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="app in complianceSummary.applications" :key="app.applicationId">
                  <th scope="row" class="font-medium text-ink-strong">
                    <button v-if="app.latestReportId" type="button" class="link-button" @click="openReport(app.latestReportId)">{{ app.applicationName }}</button>
                    <span v-else>{{ app.applicationName }}</span>
                  </th>
                  <td>
                    <span v-if="app.complianceScore !== null" class="text-lg font-semibold" :class="toneText(scoreTone(app.complianceScore))">{{ app.complianceScore }}%</span>
                    <span v-else class="text-ink-muted">—</span>
                  </td>
                  <td>{{ app.wcagLevel ? levelLabel(app.wcagLevel) : '—' }}</td>
                  <td>{{ app.complianceScore !== null ? `${app.totalIssues} (${app.criticalIssues} critical, ${app.highIssues} high)` : '—' }}</td>
                  <td><UiChip :tone="slaTone(app.slaStatus)">{{ SLA_LABELS[app.slaStatus] }}</UiChip></td>
                  <td class="text-ink-secondary">{{ app.lastReportDate ? formatDate(app.lastReportDate) : 'Never' }}</td>
                  <td>
                    <span v-if="app.trend" class="text-xs" :class="app.trend.scoreChange >= 0 ? 'text-success' : 'text-danger'">
                      {{ app.trend.scoreChange >= 0 ? '+' : '' }}{{ app.trend.scoreChange.toFixed(1) }}
                    </span>
                    <span v-else class="text-xs text-ink-muted">—</span>
                  </td>
                </tr>
              </tbody>
            </UiTable>
          </UiPanel>
        </div>
        <UiSpinner v-else label="Loading compliance summary…" />
      </template>

      <!-- Schedules -->
      <template #schedules>
        <UiPanel
          title="Scheduled reports"
          description="The backend checks for due schedules every minute and scans the page in a browser. Times are UTC. Reports appear in the history; nothing is emailed."
        >
          <template v-if="canAdmin" #actions>
            <UiButton variant="primary" icon="add" @click="openScheduleModal()">Create schedule</UiButton>
          </template>
          <p v-if="schedules.length === 0" class="text-sm text-ink-secondary">No schedules configured.</p>
          <ul v-else class="space-y-3">
            <li v-for="schedule in schedules" :key="schedule.id" class="list-row">
              <div class="flex-1 min-w-0">
                <div class="font-semibold mb-1 text-ink-strong">{{ getApplicationName(schedule.applicationId) }}</div>
                <div class="text-sm text-ink-secondary">
                  {{ schedule.frequency }} at {{ schedule.time }} UTC
                  <span v-if="schedule.frequency === 'weekly'"> on {{ getDayName(schedule.dayOfWeek) }}</span>
                  <span v-if="schedule.frequency === 'monthly'"> on day {{ schedule.dayOfMonth }}{{ schedule.dayOfMonth > 28 ? ' (or the last day of shorter months)' : '' }}</span>
                </div>
                <div class="text-xs mt-1 text-ink-muted">{{ schedule.url || 'Application URL' }}</div>
                <div class="text-xs mt-1 text-ink-muted">
                  <span v-if="schedule.enabled">Next run: {{ formatDate(schedule.nextRun) }}</span>
                  <span v-if="schedule.lastRun"> · Last run: {{ formatDate(schedule.lastRun) }} ({{ schedule.lastStatus === 'failed' ? 'failed' : 'ok' }})</span>
                </div>
                <div v-if="schedule.lastStatus === 'failed' && schedule.lastError" class="text-xs mt-1 text-danger">{{ schedule.lastError }}</div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <UiChip :tone="schedule.enabled ? 'success' : 'neutral'">{{ schedule.enabled ? 'Enabled' : 'Disabled' }}</UiChip>
                <template v-if="canAdmin">
                  <UiButton size="sm" @click="toggleSchedule(schedule)">{{ schedule.enabled ? 'Disable' : 'Enable' }}</UiButton>
                  <UiButton size="sm" icon="edit" @click="openScheduleModal(schedule)">Edit</UiButton>
                  <UiButton v-if="confirmingDelete === `schedule:${schedule.id}`" size="sm" variant="danger" @click="deleteSchedule(schedule.id)">Confirm delete</UiButton>
                  <UiButton v-else size="sm" variant="ghost" icon="delete" @click="confirmingDelete = `schedule:${schedule.id}`">Delete</UiButton>
                </template>
              </div>
            </li>
          </ul>
        </UiPanel>
      </template>

      <!-- SLA management -->
      <template #slas>
        <UiPanel
          title="Compliance SLAs"
          description="One SLA per application. Non-compliant: below the target score or level, or more critical issues than allowed. At risk: more high issues than allowed, at a limit, or within 5 points of the target score."
        >
          <template v-if="canAdmin" #actions>
            <UiButton variant="primary" icon="add" @click="openSLAModal()">Create SLA</UiButton>
          </template>
          <p v-if="slas.length === 0" class="text-sm text-ink-secondary">No SLAs configured.</p>
          <ul v-else class="space-y-3">
            <li v-for="sla in slas" :key="sla.id" class="list-row">
              <div class="flex-1">
                <div class="font-semibold mb-2 text-ink-strong">{{ getApplicationName(sla.applicationId) }}</div>
                <dl class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><dt class="text-xs mb-1 text-ink-muted">Target score</dt><dd class="font-medium text-ink-strong">{{ sla.targetScore }}%</dd></div>
                  <div><dt class="text-xs mb-1 text-ink-muted">Target level</dt><dd class="font-medium text-ink-strong">WCAG 2.x {{ sla.targetLevel }}</dd></div>
                  <div><dt class="text-xs mb-1 text-ink-muted">Max critical issues</dt><dd class="font-medium text-ink-strong">{{ sla.criticalIssuesThreshold }}</dd></div>
                  <div><dt class="text-xs mb-1 text-ink-muted">Max high issues</dt><dd class="font-medium text-ink-strong">{{ sla.highIssuesThreshold }}</dd></div>
                </dl>
              </div>
              <div v-if="canAdmin" class="flex items-center gap-2">
                <UiButton size="sm" icon="edit" @click="openSLAModal(sla)">Edit</UiButton>
                <UiButton v-if="confirmingDelete === `sla:${sla.id}`" size="sm" variant="danger" @click="deleteSLA(sla.id)">Confirm delete</UiButton>
                <UiButton v-else size="sm" variant="ghost" icon="delete" @click="confirmingDelete = `sla:${sla.id}`">Delete</UiButton>
              </div>
            </li>
          </ul>
        </UiPanel>
      </template>
    </UiTabs>

    <!-- Schedule -->
    <UiDialog
      :open="showScheduleModal"
      :title="editingSchedule ? 'Edit schedule' : 'Create schedule'"
      size="lg"
      @update:open="(open) => { if (!open) closeScheduleModal(); }"
    >
      <form id="a11y-schedule-form" class="space-y-4" @submit.prevent="saveSchedule">
        <UiSelect
          id="schedule-app"
          v-model="scheduleForm.applicationId"
          label="Application"
          required
          :disabled="!!editingSchedule"
          placeholder="Select an application"
          :options="applicationOptions"
        />
        <UiInput
          id="schedule-url"
          :model-value="scheduleForm.url"
          type="url"
          label="Page URL"
          :placeholder="applicationUrlFor(scheduleForm.applicationId) || 'https://app.example.com'"
          hint="Leave empty to use the application's URL."
          @update:model-value="scheduleForm.url = String($event).trim()"
        />
        <div class="grid md:grid-cols-2 gap-4">
          <UiSelect id="schedule-frequency" v-model="scheduleForm.frequency" label="Frequency" :options="FREQUENCIES" />
          <UiInput id="schedule-time" v-model="scheduleForm.time" type="time" label="Time (UTC)" required />
          <UiSelect
            v-if="scheduleForm.frequency === 'weekly'"
            id="schedule-dow"
            v-model="scheduleForm.dayOfWeek"
            label="Day of week"
            :options="DAYS.map((day, index) => ({ value: index, label: day }))"
          />
          <UiInput
            v-if="scheduleForm.frequency === 'monthly'"
            id="schedule-dom"
            v-model="scheduleForm.dayOfMonth"
            type="number"
            min="1"
            max="31"
            required
            label="Day of month"
            hint="29–31 run on the last day of shorter months."
          />
        </div>
        <UiCheckbox v-model="scheduleForm.enabled" label="Enabled" />
      </form>
      <template #footer>
        <UiButton @click="closeScheduleModal">Cancel</UiButton>
        <UiButton type="submit" form="a11y-schedule-form" variant="primary" :loading="savingForm">
          {{ editingSchedule ? 'Save schedule' : 'Create schedule' }}
        </UiButton>
      </template>
    </UiDialog>

    <!-- SLA -->
    <UiDialog
      :open="showSLAModal"
      :title="editingSLA ? 'Edit SLA' : 'Create SLA'"
      size="lg"
      @update:open="(open) => { if (!open) closeSLAModal(); }"
    >
      <form id="a11y-sla-form" class="space-y-4" @submit.prevent="saveSLA">
        <UiSelect
          id="sla-app"
          v-model="slaForm.applicationId"
          label="Application"
          required
          :disabled="!!editingSLA"
          placeholder="Select an application"
          :options="slaApplicationOptions"
        />
        <div class="grid md:grid-cols-2 gap-4">
          <UiInput id="sla-score" v-model="slaForm.targetScore" type="number" min="0" max="100" step="1" required label="Target score (%)" />
          <UiSelect id="sla-level" v-model="slaForm.targetLevel" label="Target WCAG level" :options="SLA_LEVELS" />
          <UiInput id="sla-critical" v-model="slaForm.criticalIssuesThreshold" type="number" min="0" step="1" required label="Max critical issues" />
          <UiInput id="sla-high" v-model="slaForm.highIssuesThreshold" type="number" min="0" step="1" required label="Max high issues" />
        </div>
      </form>
      <template #footer>
        <UiButton @click="closeSLAModal">Cancel</UiButton>
        <UiButton type="submit" form="a11y-sla-form" variant="primary" :loading="savingForm">{{ editingSLA ? 'Save SLA' : 'Create SLA' }}</UiButton>
      </template>
    </UiDialog>
  </PageShell>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import jsPDF from 'jspdf';
import InlineNotice from '../components/InlineNotice.vue';
import {
  PageHero,
  PageShell,
  UiButton,
  UiCheckbox,
  UiChip,
  UiDialog,
  UiEmptyState,
  UiInput,
  UiLink,
  UiPanel,
  UiSegmented,
  UiSelect,
  UiSpinner,
  UiStat,
  UiTable,
  UiTabs,
  UiTextarea,
} from '../components/ui';
import { useNotice } from '../composables/useNotice.js';
import { useAuth } from '../composables/useAuth.js';
import apiClient, { apiErrorMessage } from '../services/api.js';

const TABS = [
  { value: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { value: 'reports', label: 'Report history', icon: 'history' },
  { value: 'multi-app', label: 'Multi-application', icon: 'apps' },
  { value: 'schedules', label: 'Schedules', icon: 'schedule' },
  { value: 'slas', label: 'SLA management', icon: 'gavel' },
];
const GENERATE_SOURCES = [
  { value: 'url', label: 'Public URL (rendered in a browser)' },
  { value: 'html', label: 'Paste HTML' },
];
const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];
const SLA_LEVELS = [
  { value: 'A', label: 'A' },
  { value: 'AA', label: 'AA' },
  { value: 'AAA', label: 'AAA (not tested automatically, so never met)' },
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
const selectedApplication = computed(() => applications.value.find((a) => a.id === selectedApplicationId.value) ?? null);
const slaApplicationIds = computed(() => new Set(slas.value.map((s) => s.applicationId)));
const applicationOptions = computed(() => applications.value.map((app) => ({ value: app.id, label: app.name })));
// New SLAs can't be added for an application that already has one
const slaApplicationOptions = computed(() =>
  applications.value.map((app) => {
    const taken = !editingSLA.value && slaApplicationIds.value.has(app.id);
    return { value: app.id, label: `${app.name}${taken ? ' (has an SLA)' : ''}`, disabled: taken };
  }),
);
const canGenerate = computed(() =>
  generateSource.value === 'html' ? !!generateHtml.value.trim() : !!(generateUrl.value || selectedApplication.value?.applicationUrl),
);

/** 95+ success, 85+ accent, 70+ warning, below that danger */
const scoreTone = (score) => (score >= 95 ? 'success' : score >= 85 ? 'accent' : score >= 70 ? 'warning' : 'danger');
const TONE_TEXT = { success: 'text-success', accent: 'text-accent-text', warning: 'text-warning', danger: 'text-danger', info: 'text-info', neutral: 'text-ink-strong' };
const toneText = (tone) => TONE_TEXT[tone] ?? TONE_TEXT.neutral;

const levelLabel = (level) => (level === 'Non-Compliant' ? 'Fails WCAG A' : `No automated WCAG ${level} failures`);

const formatCategoryName = (category) =>
  category
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

// axe impact (CRITICAL, HIGH, MODERATE, LOW, INFO) as a status tone
const IMPACT_TONES = { CRITICAL: 'danger', HIGH: 'danger', MODERATE: 'warning', LOW: 'info', INFO: 'neutral' };
const impactTone = (impact) => IMPACT_TONES[String(impact || '').toUpperCase()] ?? 'neutral';
const criterionTone = (status) => (status === 'pass' ? 'success' : status === 'fail' ? 'danger' : 'warning');
const toneCard = (tone) =>
  ({
    success: 'border-success-border bg-success-bg',
    warning: 'border-warning-border bg-warning-bg',
    danger: 'border-danger-border bg-danger-bg',
    info: 'border-info-border bg-info-bg',
  })[tone] ?? 'border-line bg-surface-raised';
const slaTone = (status) => ({ compliant: 'success', 'at-risk': 'warning', 'non-compliant': 'danger' })[status] ?? 'neutral';

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
.tone-card {
  @apply rounded-tile border p-4;
}
.code-sample {
  @apply text-xs p-2 rounded-control overflow-x-auto border bg-surface-raised text-ink font-code;
}
.list-row {
  @apply flex flex-wrap items-center justify-between gap-4 p-4 rounded-tile border border-line bg-surface-raised;
}
.list-row-on {
  @apply bg-accent-subtle border-accent-highlight;
}
.list-row-select {
  @apply flex-1 text-left rounded-control focus-visible:outline focus-visible:outline-2 outline-focus;
}
.link-button {
  @apply text-left text-accent-text underline underline-offset-2 rounded-control focus-visible:outline focus-visible:outline-2 outline-focus;
}
</style>
