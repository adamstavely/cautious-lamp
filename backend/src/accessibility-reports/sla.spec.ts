import { evaluateSla } from './sla';

const sla = { targetScore: 90, targetLevel: 'AA' as const, criticalIssuesThreshold: 0, highIssuesThreshold: 5 };
const report = (patch: Partial<Parameters<typeof evaluateSla>[1]> = {}) => ({ complianceScore: 100, wcagLevel: 'AA' as const, criticalIssues: 0, highIssues: 0, ...patch });

describe('evaluateSla', () => {
  it('no SLA is "no-sla", not non-compliant; no report is "no-report"', () => {
    expect(evaluateSla(null, report())).toBe('no-sla');
    expect(evaluateSla(sla, null)).toBe('no-report');
  });

  it('a zero threshold with zero issues is compliant (not always at-risk)', () => {
    expect(evaluateSla({ ...sla, highIssuesThreshold: 0 }, report())).toBe('compliant');
  });

  it('non-compliant below target score or level, or above the critical threshold', () => {
    expect(evaluateSla(sla, report({ complianceScore: 89 }))).toBe('non-compliant');
    expect(evaluateSla(sla, report({ wcagLevel: 'A' }))).toBe('non-compliant');
    expect(evaluateSla(sla, report({ wcagLevel: 'Non-Compliant' }))).toBe('non-compliant');
    expect(evaluateSla(sla, report({ criticalIssues: 1 }))).toBe('non-compliant');
  });

  it('at-risk above the high threshold, exactly at a non-zero limit, or within 5 points of the target score', () => {
    expect(evaluateSla(sla, report({ highIssues: 6 }))).toBe('at-risk');
    expect(evaluateSla(sla, report({ highIssues: 5 }))).toBe('at-risk');
    expect(evaluateSla(sla, report({ highIssues: 4 }))).toBe('compliant');
    expect(evaluateSla({ ...sla, criticalIssuesThreshold: 2 }, report({ criticalIssues: 2 }))).toBe('at-risk');
    expect(evaluateSla(sla, report({ complianceScore: 94 }))).toBe('at-risk');
    expect(evaluateSla(sla, report({ complianceScore: 95 }))).toBe('compliant');
  });

  it('a perfect score meets a high target', () => {
    expect(evaluateSla({ ...sla, targetScore: 98 }, report({ complianceScore: 100 }))).toBe('compliant');
    expect(evaluateSla({ ...sla, targetScore: 100 }, report({ complianceScore: 100 }))).toBe('compliant');
  });

  it('a higher level than required is fine', () => {
    expect(evaluateSla({ ...sla, targetLevel: 'A' }, report({ wcagLevel: 'AA' }))).toBe('compliant');
  });
});
