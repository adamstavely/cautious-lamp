// Performance budgets compare with the bundle analysis's measured sizes, in
// the budget's unit; metrics nothing measures say so instead of a value.
import { describe, expect, it } from 'vitest';
import { compareBudget } from '../src/utils/performanceBudgets.js';

const analysis = {
  summary: {
    totalComponents: 3,
    totalSize: 150 * 1024,
    totalGzippedSize: 40 * 1024,
    totalBrotliSize: 30 * 1024,
    largestComponent: { componentName: 'Data table', totalSize: 60 * 1024 },
  },
};

describe('compareBudget', () => {
  it('flags a budget the measured size exceeds', () => {
    expect(compareBudget({ metric: 'bundle-size', threshold: 100, unit: 'KB' }, analysis)).toMatchObject({ state: 'exceeded', value: 150, percent: 150, remaining: -50 });
  });

  it('warns above the warning threshold and passes below it', () => {
    expect(compareBudget({ metric: 'bundle-size-gzip', threshold: 50, alertThreshold: 35, unit: 'KB' }, analysis).state).toBe('warning');
    expect(compareBudget({ metric: 'bundle-size-brotli', threshold: 50, alertThreshold: 35, unit: 'KB' }, analysis)).toMatchObject({ state: 'within', value: 30 });
  });

  it('converts to the budget unit and names the largest component', () => {
    expect(compareBudget({ metric: 'component-size', threshold: 1, unit: 'MB' }, analysis)).toMatchObject({ state: 'within', value: 0.06, subject: 'Data table' });
    expect(compareBudget({ metric: 'bundle-size', threshold: 200000, unit: 'B' }, analysis)).toMatchObject({ state: 'within', value: 153600 });
  });

  it('never invents a value for unmeasured metrics, wrong units or missing data', () => {
    expect(compareBudget({ metric: 'load-time', threshold: 100, unit: 'ms' }, analysis)).toMatchObject({ state: 'not-measured' });
    expect(compareBudget({ metric: 'bundle-size', threshold: 100, unit: 'ms' }, analysis)).toMatchObject({ state: 'unit-mismatch' });
    expect(compareBudget({ metric: 'bundle-size', threshold: 100, unit: 'KB' }, null)).toMatchObject({ state: 'no-data' });
    expect(compareBudget({ metric: 'bundle-size', threshold: 100, unit: 'KB' }, null).value).toBeUndefined();
  });
});
