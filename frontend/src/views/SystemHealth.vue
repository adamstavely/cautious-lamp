<template>
  <PageShell width="wide">
    <PageHero
      eyebrow="Admin"
      title="System health"
      lead="Monitor your design system's health, track component adoption, and identify areas for improvement."
      spot="site/system-health"
    />

    <PageSection title="Overview" description="Measured by the server; figures with no data yet say so.">
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UiStat label="Overall health" icon="check_circle" :tone="scoreTone(overallHealth)">
          <span class="flex items-baseline gap-2">
            {{ formatPercent(overallHealth) }}
            <span v-if="healthScore?.trend" class="flex items-center gap-1 text-xs font-medium" :class="trendTone">
              <span class="material-symbols-outlined text-sm" aria-hidden="true">{{ trendIcon }}</span>
              {{ healthScore.trend.change >= 0 ? '+' : '' }}{{ healthScore.trend.change.toFixed(1) }}
            </span>
          </span>
        </UiStat>
        <UiStat
          label="Components"
          icon="widgets"
          :value="metrics.components.total ?? 'Not collected'"
          :hint="`${metrics.components.productionReady ?? '–'} production ready`"
        />
        <UiStat
          label="Design tokens"
          icon="style"
          :value="metrics.tokens.total ?? 'Not collected'"
          :hint="`${metrics.tokens.categories ?? '–'} categories`"
        />
        <UiStat
          label="Accessibility"
          icon="accessibility"
          :value="formatPercent(metrics.accessibility.score)"
          :hint="metrics.accessibility.score === null ? 'No accessibility reports yet' : 'Average of the latest accessibility reports'"
        />
      </div>
    </PageSection>

    <!-- External tools and services (GET /integrations/status) -->
    <PageSection divided>
      <IntegrationsPanel />
    </PageSection>

    <PageSection title="Inventory" divided>
      <div class="grid lg:grid-cols-2 gap-6">
        <UiPanel title="Component status">
          <ul class="space-y-4">
            <li v-for="status in componentStatuses" :key="status.type" class="flex items-center justify-between gap-4">
              <span class="flex items-center gap-3 text-sm font-medium text-ink">
                <UiChip :tone="status.tone">{{ status.label }}</UiChip>
              </span>
              <span class="flex items-center gap-4">
                <UiMeter class="w-32" :value="status.percentage" :tone="status.tone" />
                <span class="text-sm font-semibold w-8 text-right text-ink-strong">{{ status.count ?? '–' }}</span>
              </span>
            </li>
          </ul>
        </UiPanel>

        <UiPanel title="Token usage by category">
          <p v-if="tokenCategories.length === 0" class="text-sm text-ink-secondary">Not collected: no token categories reported yet.</p>
          <ul v-else class="space-y-4">
            <li v-for="category in tokenCategories" :key="category.name" class="flex items-center justify-between gap-4">
              <span class="text-sm font-medium text-ink">{{ category.name }}</span>
              <span class="flex items-center gap-4">
                <UiMeter class="w-32" :value="category.percentage" />
                <span class="text-sm font-semibold w-8 text-right text-ink-strong">{{ category.count }}</span>
              </span>
            </li>
          </ul>
        </UiPanel>
      </div>
    </PageSection>

    <PageSection
      v-if="healthScore"
      title="Health score factors"
      description='Weighted factors contributing to overall health score. Factors marked "Not collected" have no data yet and are left out of the score.'
      divided
    >
      <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <UiStat
          v-for="factor in healthFactors"
          :key="factor.key"
          :label="factor.label"
          :value="formatPercent(healthScore.factors[factor.key])"
          :hint="`Weight: ${factor.weight}`"
        />
      </div>
    </PageSection>

    <PageSection title="Health score trends" description="Measured, last 30 days." divided>
      <UiCallout v-if="healthScoreTrends.length === 0" role="status">
        No health score history yet. Scores are recorded (at most hourly) as they are measured, starting when the server starts.
      </UiCallout>
      <UiPanel v-else>
        <svg
          class="trend-chart h-64"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          :aria-label="`Health score from ${trendStart} to ${trendEnd}`"
        >
          <rect
            v-for="(trend, index) in healthScoreTrends"
            :key="index"
            :class="scoreFill(trend.score)"
            class="trend-bar"
            :x="index * (100 / healthScoreTrends.length) + 0.15"
            :y="100 - Math.min(100, trend.score)"
            :width="Math.max(0.1, 100 / healthScoreTrends.length - 0.3)"
            :height="Math.min(100, trend.score)"
          >
            <title>{{ new Date(trend.date).toLocaleDateString() }}: {{ trend.score.toFixed(1) }}%</title>
          </rect>
        </svg>
        <div class="flex justify-between mt-4 text-xs text-ink-muted">
          <span>{{ trendStart }}</span>
          <span>{{ trendEnd }}</span>
        </div>
      </UiPanel>
    </PageSection>

    <PageSection v-if="healthScoreRecommendations.length > 0" title="Recommendations to improve health score" divided>
      <div class="space-y-3">
        <UiCallout
          v-for="rec in healthScoreRecommendations"
          :key="rec.id"
          :tone="priorityTone(rec.priority)"
          :icon="rec.priority === 'high' ? 'priority_high' : 'info'"
          :title="rec.title"
        >
          <p class="mb-2"><UiChip :tone="priorityTone(rec.priority)">{{ rec.priority.toUpperCase() }}</UiChip></p>
          <p class="mb-2">{{ rec.description }}</p>
          <p class="text-xs font-medium mb-1">Impact: {{ rec.impact }}</p>
          <p class="text-xs">{{ rec.action }}</p>
        </UiCallout>
      </div>
    </PageSection>

    <PageSection title="Alerts and warnings" divided>
      <UiEmptyState v-if="alerts.length === 0" spot="admin/component-status" title="No alerts" body="Your design system is healthy!" />
      <div v-else class="space-y-3">
        <UiCallout
          v-for="alert in alerts"
          :key="alert.id"
          :tone="priorityTone(alert.severity)"
          :icon="alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'"
          :title="alert.title"
        >
          {{ alert.message }}
          <template v-if="alert.action" #actions>
            <UiButton size="sm" variant="ghost" @click="handleAlertAction(alert)">{{ alert.action }}</UiButton>
          </template>
        </UiCallout>
      </div>
    </PageSection>

    <PageSection title="Component adoption" divided>
      <template #actions>
        <UiSelect v-model="adoptionTimeframe" label="Timeframe" :options="timeframeOptions" />
      </template>
      <UiPanel>
        <p v-if="topComponents.length === 0" class="text-sm text-ink-secondary">Not collected: no component usage recorded for this timeframe.</p>
        <ul v-else class="space-y-4">
          <li v-for="component in topComponents" :key="component.name" class="flex items-center justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <span class="text-sm font-medium text-ink-strong">{{ component.name }}</span>
                <UiChip :tone="statusTone(component.status)">{{ component.status }}</UiChip>
              </div>
              <UiMeter :value="component.adoption" />
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-ink-strong">{{ component.adoption }}%</div>
              <div class="text-xs text-ink-muted">{{ component.usage }} uses</div>
            </div>
          </li>
        </ul>
      </UiPanel>
    </PageSection>

    <PageSection title="Design system analytics" divided>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UiPanel title="Most used components" heading-tag="h3">
          <p v-if="mostUsedComponents.length === 0" class="text-sm text-ink-secondary">Not collected: no component usage recorded yet.</p>
          <ol v-else class="space-y-3">
            <li v-for="(comp, index) in mostUsedComponents" :key="comp.name" class="flex items-center justify-between">
              <span class="flex items-center gap-2">
                <span class="text-xs font-medium w-6 text-ink-muted">{{ index + 1 }}.</span>
                <span class="text-sm text-ink">{{ comp.name }}</span>
              </span>
              <span class="text-sm font-semibold text-ink-strong">{{ comp.usage }}</span>
            </li>
          </ol>
        </UiPanel>
        <UiPanel title="Token usage patterns" heading-tag="h3">
          <p class="text-sm text-ink-secondary">Not collected: token usage is not tracked yet.</p>
        </UiPanel>
        <UiPanel title="Performance metrics" heading-tag="h3">
          <p class="text-sm text-ink-secondary">Not collected: load time and bundle size are not measured yet.</p>
        </UiPanel>
      </div>

      <UiPanel class="mt-6" title="Usage trends" description="Last 30 days." heading-tag="h3">
        <p v-if="usageTrends.length === 0" class="text-sm text-ink-secondary">Not collected: no usage recorded in the last 30 days.</p>
        <template v-else>
          <svg class="trend-chart h-32" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Component usage per day, last 30 days">
            <rect
              v-for="(day, index) in usageTrends"
              :key="index"
              class="trend-bar fill-accent"
              :x="index * (100 / usageTrends.length) + 0.3"
              :y="100 - day.percentage"
              :width="Math.max(0.1, 100 / usageTrends.length - 0.6)"
              :height="day.percentage"
            >
              <title>{{ day.date }}: {{ day.usage }} uses</title>
            </rect>
          </svg>
          <div class="flex gap-2 mt-1" aria-hidden="true">
            <span v-for="(day, index) in usageTrends" :key="index" class="flex-1 text-center text-xs text-ink-muted">{{ day.label }}</span>
          </div>
        </template>
      </UiPanel>
    </PageSection>

    <PageSection v-if="designDebtMetrics" title="Design debt metrics" divided>
      <div class="grid md:grid-cols-3 gap-4 mb-6">
        <UiStat label="Deprecated components in use" :value="designDebtMetrics.deprecatedComponentsInUse" />
        <UiStat label="Custom components" :value="designDebtMetrics.customComponentCount" />
        <UiStat label="Technical debt score" :value="`${designDebtMetrics.technicalDebtScore}/100`" :tone="debtTone(designDebtMetrics.technicalDebtScore)" />
      </div>
      <UiPanel v-if="designDebtMetrics.recommendations && designDebtMetrics.recommendations.length > 0" title="Recommendations" heading-tag="h3">
        <ul class="space-y-2">
          <li v-for="(rec, index) in designDebtMetrics.recommendations" :key="index" class="flex items-start gap-2 text-sm text-ink">
            <span class="material-symbols-outlined text-base text-accent-text" aria-hidden="true">check_circle</span>
            {{ rec }}
          </li>
        </ul>
      </UiPanel>
    </PageSection>

    <PageSection v-if="crossApplicationComparison.length > 0" title="Cross-application comparison" divided>
      <UiPanel flush>
        <UiTable caption="Design system use by application">
          <thead>
            <tr>
              <th scope="col">Application</th>
              <th scope="col">Components used</th>
              <th scope="col">Adoption rate</th>
              <th scope="col">Shared components</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in crossApplicationComparison" :key="app.applicationId">
              <th scope="row" class="font-medium text-ink-strong">{{ app.applicationName }}</th>
              <td>{{ app.uniqueComponents }}</td>
              <td>
                <span class="flex items-center gap-2">
                  <UiMeter class="w-24" :value="app.adoptionRate" />
                  {{ app.adoptionRate.toFixed(1) }}%
                </span>
              </td>
              <td>{{ app.sharedComponents.length }}</td>
            </tr>
          </tbody>
        </UiTable>
      </UiPanel>
    </PageSection>

    <PageSection
      title="Audit reports"
      description="Generate comprehensive audit reports for stakeholders, compliance, and planning."
      divided
    >
      <template #actions>
        <UiButton variant="primary" icon="add" :loading="generatingReport" @click="generateAuditReport">
          {{ generatingReport ? 'Generating…' : 'Generate report' }}
        </UiButton>
      </template>

      <InlineNotice :notice="notice" class="mb-4" @dismiss="clearNotice" />

      <UiEmptyState
        v-if="!auditReport && !generatingReport"
        spot="admin/audit-logs"
        title="No report yet"
        body="Generate a comprehensive audit report to document your design system's current state."
      />

      <div v-if="auditReport" class="space-y-6">
        <UiPanel title="Executive summary" heading-tag="h3">
          <div class="grid md:grid-cols-3 gap-4 mb-6">
            <UiStat
              label="Overall health score"
              :value="formatPercent(auditReport.executiveSummary.overallHealthScore)"
              :hint="`Grade: ${auditReport.executiveSummary.healthGrade ?? 'n/a'}`"
              :tone="gradeTone(auditReport.executiveSummary.healthGrade)"
            />
            <UiStat
              label="Components"
              :value="auditReport.components.total"
              :hint="`${auditReport.components.byStatus.production.length} production ready`"
            />
            <UiStat
              label="Accessibility"
              :value="formatPercent(auditReport.detailedMetrics.accessibility.score)"
              :hint="auditReport.detailedMetrics.accessibility.wcagLevel ? `WCAG ${auditReport.detailedMetrics.accessibility.wcagLevel}` : 'No reports yet'"
            />
          </div>

          <h4 class="text-sm font-semibold mb-3 text-ink-strong">Key findings</h4>
          <ul class="space-y-2">
            <li v-for="(finding, idx) in auditReport.executiveSummary.keyFindings" :key="idx" class="flex items-start gap-2 text-sm text-ink">
              <span class="material-symbols-outlined text-base text-accent-text" aria-hidden="true">check_circle</span>
              {{ finding }}
            </li>
          </ul>

          <template #footer>
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-sm font-medium text-ink-secondary">Export report:</span>
              <UiButton size="sm" icon="code" @click="exportReport('json')">JSON</UiButton>
              <UiButton size="sm" icon="table_chart" @click="exportReport('csv')">CSV</UiButton>
              <UiButton size="sm" icon="picture_as_pdf" @click="exportReport('pdf')">PDF</UiButton>
            </div>
          </template>
        </UiPanel>

        <div v-if="showDetailedReport" class="space-y-6">
          <div class="grid md:grid-cols-2 gap-4">
            <UiPanel title="Component metrics" heading-tag="h3">
              <dl class="space-y-2 text-sm">
                <div v-for="row in componentMetricRows" :key="row.label" class="flex justify-between">
                  <dt class="text-ink-secondary">{{ row.label }}</dt>
                  <dd class="text-ink-strong">{{ row.value }}</dd>
                </div>
              </dl>
            </UiPanel>
            <UiPanel title="Compliance metrics" heading-tag="h3">
              <dl class="space-y-2 text-sm">
                <div v-for="row in complianceMetricRows" :key="row.label" class="flex justify-between">
                  <dt class="text-ink-secondary">{{ row.label }}</dt>
                  <dd class="text-ink-strong">{{ row.value }}</dd>
                </div>
              </dl>
            </UiPanel>
          </div>

          <UiPanel title="Recommended next steps" heading-tag="h3">
            <ul class="space-y-2">
              <li
                v-for="(step, idx) in auditReport.nextSteps"
                :key="idx"
                class="flex items-start gap-2 text-sm p-3 rounded-tile bg-accent-subtle text-ink"
              >
                <span class="material-symbols-outlined text-base text-accent-text" aria-hidden="true">arrow_forward</span>
                {{ step }}
              </li>
            </ul>
          </UiPanel>
        </div>

        <UiButton
          variant="ghost"
          :icon="showDetailedReport ? 'expand_less' : 'expand_more'"
          :aria-expanded="showDetailedReport"
          @click="showDetailedReport = !showDetailedReport"
        >
          {{ showDetailedReport ? 'Hide' : 'Show' }} detailed report
        </UiButton>
      </div>
    </PageSection>
  </PageShell>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api.js';
import IntegrationsPanel from '../components/admin/IntegrationsPanel.vue';
import InlineNotice from '../components/InlineNotice.vue';
import { useNotice } from '../composables/useNotice.js';
import {
  PageHero,
  PageSection,
  PageShell,
  UiButton,
  UiCallout,
  UiChip,
  UiEmptyState,
  UiPanel,
  UiSelect,
  UiStat,
  UiTable,
} from '../components/ui';
import UiMeter from '../components/ui/UiMeter.vue';

const router = useRouter();
const { notice, showNotice, clearNotice } = useNotice();
const adoptionTimeframe = ref('30d');

const timeframeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

const healthFactors = [
  { key: 'componentCoverage', label: 'Component coverage', weight: '25%' },
  { key: 'adoptionRate', label: 'Adoption rate', weight: '25%' },
  { key: 'compliance', label: 'Compliance', weight: '20%' },
  { key: 'maintenance', label: 'Maintenance', weight: '15%' },
  { key: 'accessibility', label: 'Accessibility', weight: '15%' },
];

/** "Not collected" when the server had no data to measure a value from */
const formatPercent = (value) => (value === null || value === undefined ? 'Not collected' : `${Number(value).toFixed(1)}%`);

// Counts measured by the server (GET /system-health/score); empty until it answers
const metrics = computed(() => {
  const inventory = healthScore.value?.inventory;
  return {
    components: {
      total: inventory?.components.total ?? null,
      productionReady: inventory?.components.production ?? null,
      inProgress: inventory?.components.inProgress ?? null,
      planned: inventory?.components.planned ?? null,
      deprecated: inventory?.components.deprecated ?? null,
    },
    tokens: {
      total: inventory?.tokens.total ?? null,
      categories: inventory ? inventory.tokens.categories.length : null,
      byCategory: inventory?.tokens.categories ?? [],
    },
    accessibility: {
      score: healthScore.value?.factors?.accessibility ?? null,
    },
  };
});

const componentStatuses = computed(() => {
  const total = metrics.value.components.total || 1;
  return [
    { type: 'production', label: 'Production ready', count: metrics.value.components.productionReady, tone: 'success' },
    { type: 'progress', label: 'In progress', count: metrics.value.components.inProgress, tone: 'warning' },
    { type: 'planned', label: 'Planned', count: metrics.value.components.planned, tone: 'info' },
    { type: 'deprecated', label: 'Deprecated', count: metrics.value.components.deprecated, tone: 'danger' },
  ].map((status) => ({ ...status, percentage: ((status.count ?? 0) / total) * 100 }));
});

const tokenCategories = computed(() => {
  const total = metrics.value.tokens.total || 1;
  return metrics.value.tokens.byCategory.map((cat) => ({
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
    const response = await apiClient.get('/api/v1/system-health/score');
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
    const response = await apiClient.get(`/api/v1/system-health/trends?days=${days}`);
    healthScoreTrends.value = response.data;
  } catch (error) {
    console.error('Error loading health score trends:', error);
  }
};

// Overall health from the server; null (shown as "Not collected") until it answers or when nothing could be measured
const overallHealth = computed(() => healthScore.value?.score ?? null);

const trendIcon = computed(() => {
  const direction = healthScore.value?.trend?.direction;
  return direction === 'up' ? 'trending_up' : direction === 'down' ? 'trending_down' : 'trending_flat';
});
const trendTone = computed(() => {
  const direction = healthScore.value?.trend?.direction;
  return direction === 'up' ? 'text-success' : direction === 'down' ? 'text-danger' : 'text-ink-muted';
});

const trendStart = computed(() => (healthScoreTrends.value.length > 0 ? new Date(healthScoreTrends.value[0].date).toLocaleDateString() : ''));
const trendEnd = computed(() =>
  healthScoreTrends.value.length > 0 ? new Date(healthScoreTrends.value[healthScoreTrends.value.length - 1].date).toLocaleDateString() : '',
);

/** Tone for a 0–100 score: 80+ good, 60+ fair, below that poor */
const scoreTone = (score) => (score === null || score === undefined ? 'neutral' : score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger');
const scoreFill = (score) => ({ success: 'fill-success-solid', warning: 'fill-warning-solid', danger: 'fill-danger-solid', neutral: 'fill-chart-neutral' })[scoreTone(score)];
const priorityTone = (priority) => (priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'info');
const debtTone = (score) => (score >= 70 ? 'danger' : score >= 40 ? 'warning' : 'success');

// Combined alerts - merge API alerts with static alerts
const alerts = computed(() => {
  const inProgress = metrics.value.components.inProgress;
  const staticAlerts = inProgress
    ? [
        {
          id: 'components-in-progress',
          severity: 'medium',
          title: `${inProgress} Component${inProgress === 1 ? '' : 's'} In Progress`,
          message: 'Some components are still in development and may have breaking changes.',
          action: 'View Components',
          actionPath: '/components/status',
        },
      ]
    : [];

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

const usageTrends = ref([]);

const loadAnalytics = async () => {
  loadingAnalytics.value = true;
  try {
    // Load component popularity
    const popularityResponse = await apiClient.get(`/api/v1/analytics/component-popularity?timeframe=${adoptionTimeframe.value}`);
    const popularity = popularityResponse.data || [];

    // Update top components with real data
    topComponents.value = popularity.slice(0, 6).map((comp) => ({
      name: comp.componentName,
      status: 'Production Ready', // TODO: Get from component status
      adoption: comp.adoptionRate,
      usage: comp.totalUsage,
    }));

    // Update most used components
    mostUsedComponents.value = popularity.slice(0, 5).map((comp) => ({
      name: comp.componentName,
      usage: comp.totalUsage,
    }));

    // Load application adoption
    const adoptionResponse = await apiClient.get('/api/v1/analytics/application-adoption');
    applicationAdoption.value = adoptionResponse.data || [];

    // Load usage trends
    const trendsResponse = await apiClient.get('/api/v1/analytics/usage-trends?days=30');
    const trends = trendsResponse.data || [];
    const maxUsage = Math.max(...trends.map((t) => t.totalUsage), 1);
    usageTrends.value = trends.map((trend) => {
      const date = new Date(trend.date);
      return {
        date: trend.date,
        usage: trend.totalUsage,
        percentage: (trend.totalUsage / maxUsage) * 100,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
      };
    });

    // Load design debt metrics
    const debtResponse = await apiClient.get('/api/v1/analytics/design-debt');
    designDebtMetrics.value = debtResponse.data;

    // Load cross-application comparison
    const comparisonResponse = await apiClient.get('/api/v1/analytics/cross-application-comparison');
    crossApplicationComparison.value = comparisonResponse.data || [];
  } catch (error) {
    console.error('Error loading analytics:', error);
  } finally {
    loadingAnalytics.value = false;
  }
};

watch(adoptionTimeframe, () => {
  loadAnalytics();
});

const statusTone = (status) =>
  ({ 'Production Ready': 'success', 'In Progress': 'warning', Planned: 'info', Deprecated: 'danger' })[status] || 'neutral';

const handleAlertAction = (alert) => {
  if (alert.actionPath) {
    router.push(alert.actionPath);
  }
};

onMounted(async () => {
  await loadHealthScore();
  await loadHealthScoreTrends(30);
  await loadAnalytics();
});

// Generate audit report
const generateAuditReport = async () => {
  generatingReport.value = true;
  clearNotice();
  try {
    const response = await apiClient.get('/api/v1/system-health/audit-report');
    auditReport.value = response.data;
    showDetailedReport.value = false; // Start with summary view
  } catch (error) {
    console.error('Error generating audit report:', error);
    showNotice('Failed to generate audit report. Please try again.', 'error');
  } finally {
    generatingReport.value = false;
  }
};

const componentMetricRows = computed(() => {
  const c = auditReport.value?.detailedMetrics.components;
  if (!c) return [];
  return [
    { label: 'Production ready', value: c.production },
    { label: 'In progress', value: c.inProgress },
    { label: 'Deprecated', value: c.deprecated },
  ];
});

const complianceMetricRows = computed(() => {
  const c = auditReport.value?.detailedMetrics.compliance;
  if (!c) return [];
  return [
    { label: 'Compliance score', value: formatPercent(c.score) },
    { label: 'Level', value: c.level },
    { label: 'WCAG compliant', value: c.wcagCompliance === null ? 'Not collected' : c.wcagCompliance ? 'Yes' : 'No' },
  ];
});

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
      ['Overall Health Score', formatPercent(auditReport.value.executiveSummary.overallHealthScore)],
      ['Health Grade', auditReport.value.executiveSummary.healthGrade ?? 'n/a'],
      ['Total Components', auditReport.value.components.total],
      ['Production Ready', auditReport.value.components.byStatus.production.length],
      ['In Progress', auditReport.value.components.byStatus.inProgress.length],
      ['Deprecated', auditReport.value.components.byStatus.deprecated.length],
      ['Accessibility Score', formatPercent(auditReport.value.detailedMetrics.accessibility.score)],
      ['WCAG Level', auditReport.value.detailedMetrics.accessibility.wcagLevel],
      ['Compliance Score', formatPercent(auditReport.value.detailedMetrics.compliance.score)],
      ['Adoption Rate', formatPercent(auditReport.value.detailedMetrics.adoption.overallRate)],
    ];
    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } else if (format === 'pdf') {
    // PDF export needs a library such as jsPDF; until then say so in the page
    showNotice('PDF export requires additional setup. Please use JSON or CSV export for now.', 'info');
  }
};

/** Tone for a health grade: A/B good, C fair, D/F poor */
const gradeTone = (grade) => ({ A: 'success', B: 'success', C: 'warning', D: 'warning', F: 'danger' })[grade] || 'neutral';
</script>

<style scoped>
.trend-chart {
  @apply block w-full;
}
.trend-bar {
  @apply transition-opacity hover:opacity-80;
}
</style>
