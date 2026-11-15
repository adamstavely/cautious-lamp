/**
 * Performance budgets compared with what the backend really measures. The
 * bundle analysis (`/api/v1/performance/bundle-analysis`) measures each
 * component's stored source: raw bytes, and real gzip and brotli sizes. A
 * budget on one of those is compared with that measurement; a budget on
 * anything nothing measures (load time, memory…) says so instead of showing
 * a made-up value.
 */

/** Metrics with a measurement behind them: what each reads from the analysis summary */
export const MEASURED_METRICS = {
  'bundle-size': {
    label: 'Bundle size',
    description: 'Raw size of every component’s source (Vue and React), added up.',
    read: (summary) => ({ bytes: summary.totalSize }),
  },
  'bundle-size-gzip': {
    label: 'Bundle size, gzip',
    description: 'Gzip-compressed size of every component’s source, added up.',
    read: (summary) => ({ bytes: summary.totalGzippedSize }),
  },
  'bundle-size-brotli': {
    label: 'Bundle size, brotli',
    description: 'Brotli-compressed size of every component’s source, added up.',
    read: (summary) => ({ bytes: summary.totalBrotliSize }),
  },
  'component-size': {
    label: 'Largest component',
    description: 'Raw source size of the largest single component.',
    read: (summary) =>
      summary.largestComponent ? { bytes: summary.largestComponent.totalSize, subject: summary.largestComponent.componentName } : { bytes: null },
  },
};

/** Metrics older budgets may use, which nothing measures yet */
export const UNMEASURED_METRICS = {
  'load-time': 'Load time',
  'render-time': 'Render time',
  'memory-usage': 'Memory usage',
  'api-response-time': 'API response time',
};

export const SIZE_UNITS = { B: 1, KB: 1024, MB: 1024 * 1024 };

export const metricLabel = (metric) => MEASURED_METRICS[metric]?.label ?? UNMEASURED_METRICS[metric] ?? metric;

const round = (n) => Math.round(n * 100) / 100;

/**
 * Where a budget stands against the latest analysis.
 *
 * Returns `{ state, value, unit, percent, remaining, subject, reason }`:
 *  - `exceeded`, `warning` (over the warning threshold) or `within`, with the measured value in the budget's unit;
 *  - `not-measured`: no measurement exists for this metric;
 *  - `unit-mismatch`: a size metric with a time unit (or the reverse);
 *  - `no-data`: the analysis hasn't loaded or measured nothing.
 */
export function compareBudget(budget, analysis) {
  const metric = MEASURED_METRICS[budget.metric];
  if (!metric) return { state: 'not-measured', reason: `Nothing measures ${metricLabel(budget.metric).toLowerCase()} yet, so this budget has no current value.` };
  const factor = SIZE_UNITS[budget.unit];
  if (!factor) return { state: 'unit-mismatch', reason: `${metric.label} is measured in bytes; this budget uses ${budget.unit}. Edit it to use B, KB or MB.` };
  const summary = analysis?.summary;
  if (!summary || !summary.totalComponents) return { state: 'no-data', reason: 'No bundle analysis to compare with yet.' };
  const { bytes, subject } = metric.read(summary);
  if (bytes === null || bytes === undefined) return { state: 'no-data', reason: 'The analysis has no value for this metric.' };

  const value = round(bytes / factor);
  const threshold = Number(budget.threshold);
  const warning = budget.alertThreshold === null || budget.alertThreshold === undefined || budget.alertThreshold === '' ? null : Number(budget.alertThreshold);
  let state = 'within';
  if (value > threshold) state = 'exceeded';
  else if (warning !== null && value > warning) state = 'warning';
  return {
    state,
    value,
    unit: budget.unit,
    subject,
    percent: threshold > 0 ? Math.round((value / threshold) * 100) : null,
    remaining: round(threshold - value),
  };
}

export const BUDGET_STATES = {
  exceeded: { label: 'Exceeded', tone: 'danger' },
  warning: { label: 'Warning', tone: 'warning' },
  within: { label: 'Within budget', tone: 'success' },
  'not-measured': { label: 'Not measured', tone: 'neutral' },
  'unit-mismatch': { label: 'Wrong unit', tone: 'warning' },
  'no-data': { label: 'No data', tone: 'neutral' },
};
