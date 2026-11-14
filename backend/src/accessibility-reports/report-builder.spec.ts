import { AxeOutcome, AxeRuleResult } from './axe-engine';
import { buildReport, withConformance } from './report-builder';
import { evaluateSla } from './sla';

const rule = (id: string, tags: string[], patch: Partial<AxeRuleResult> = {}): AxeRuleResult => ({
  id,
  impact: null,
  help: id,
  description: id,
  helpUrl: '',
  tags,
  nodes: [],
  nodeCount: 0,
  ...patch,
});

const contrast = rule('color-contrast', ['wcag2aa', 'wcag143']);
const imageAlt = rule('image-alt', ['wcag2a', 'wcag111']);
const docTitle = rule('document-title', ['wcag2a', 'wcag242']);
const input = { id: 'r', applicationId: 'app', applicationName: 'App', generatedAt: new Date('2026-11-14T00:00:00Z'), source: 'url' as const, createdBy: 'test' };
const sla = { targetScore: 90, targetLevel: 'AA' as const, criticalIssuesThreshold: 0, highIssuesThreshold: 5 };

describe('buildReport conformance', () => {
  it('does not certify AA when a required criterion only came back incomplete', () => {
    const outcome: AxeOutcome = { engine: 'playwright', violations: [], passes: [imageAlt, docTitle], incomplete: [contrast] };
    const report = buildReport(outcome, input);
    // The automated score only counts failures...
    expect(report.complianceScore).toBe(100);
    // ...but the level and status say 1.4.3 wasn't verified
    expect(report.wcagLevel).toBe('A');
    expect(report.conformance).toEqual({ status: 'needs-review', noFailuresUpTo: 'AA', verifiedUpTo: 'A', reviewCriteria: ['1.4.3'], rendered: true });
    expect(evaluateSla(sla, report)).toBe('needs-review');
    expect(evaluateSla({ ...sla, targetLevel: 'A' }, report)).toBe('compliant');
  });

  it('says Unverified when a level A criterion needs review', () => {
    const report = buildReport({ engine: 'playwright', violations: [], passes: [docTitle], incomplete: [imageAlt] }, input);
    expect(report.wcagLevel).toBe('Unverified');
    expect(report.conformance).toMatchObject({ status: 'needs-review', verifiedUpTo: null });
    expect(evaluateSla({ ...sla, targetLevel: 'A' }, report)).toBe('needs-review');
  });

  it('never reaches AA from an HTML-only scan, even with nothing to review', () => {
    const report = buildReport({ engine: 'jsdom', violations: [], passes: [imageAlt, docTitle, contrast], incomplete: [] }, { ...input, source: 'html' });
    expect(report.wcagLevel).toBe('A');
    expect(report.conformance).toMatchObject({ status: 'needs-review', noFailuresUpTo: 'AA', verifiedUpTo: 'A', rendered: false });
    expect(evaluateSla(sla, report)).toBe('needs-review');
  });

  it('reports a rendered page with no failures and nothing to review as such, and failures as failing', () => {
    const clean = buildReport({ engine: 'playwright', violations: [], passes: [imageAlt, docTitle, contrast], incomplete: [] }, input);
    expect(clean.wcagLevel).toBe('AA');
    expect(clean.conformance.status).toBe('no-automated-failures');
    expect(evaluateSla(sla, clean)).toBe('compliant');
    // No automated rule tests AAA
    expect(evaluateSla({ ...sla, targetLevel: 'AAA' }, clean)).toBe('needs-review');

    const failing = buildReport(
      { engine: 'playwright', violations: [{ ...contrast, impact: 'serious', nodes: [{ target: 'p', html: '<p>' }], nodeCount: 1 }], passes: [imageAlt], incomplete: [] },
      input,
    );
    expect(failing).toMatchObject({ wcagLevel: 'A', complianceScore: 90, conformance: { status: 'failing', noFailuresUpTo: 'A' } });
    expect(evaluateSla(sla, failing)).toBe('non-compliant');
  });

  it('reads reports stored before conformance existed conservatively', () => {
    const legacy = { wcagLevel: 'AA' as const, needsReview: 1, engine: 'playwright' as const, complianceScore: 100, criticalIssues: 0, highIssues: 0 };
    const read = withConformance(legacy);
    expect(read.wcagLevel).toBe('Unverified');
    expect(read.conformance).toMatchObject({ status: 'needs-review', noFailuresUpTo: 'AA', verifiedUpTo: null, derived: true });
    expect(evaluateSla(sla, read)).toBe('needs-review');
    expect(withConformance({ ...legacy, needsReview: 0 }).wcagLevel).toBe('AA');
    expect(withConformance({ ...legacy, needsReview: 0, engine: 'jsdom' as const }).wcagLevel).toBe('Unverified');
    expect(withConformance({ ...legacy, wcagLevel: 'Non-Compliant' as const }).conformance.status).toBe('failing');
  });
});
