import { UnprocessableEntityException } from '@nestjs/common';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { ADMIN_KEY, FakeApplications, authProviders, startApp } from '../governance/testing/fakes';
import { APPLICATION_DIRECTORY } from '../governance/sources';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { AccessibilityReportsController } from './accessibility-reports.controller';
import {
  A11Y_SCANNER,
  A11yScanner,
  AccessibilityReportsService,
  REPORT_STORE,
  SCHEDULE_STORE,
  SLA_STORE,
} from './accessibility-reports.service';
import { AccessibilityReport, ComplianceSLA, ReportSchedule } from './accessibility-reports.types';
import { isBrowserInstalled, runAxeOnHtml, runAxeOnUrl } from './axe-engine';
import { buildReport } from './report-builder';

/** A page with known WCAG A failures: an image without alt, an unlabeled field and an empty button */
const FIXTURE = `<!doctype html>
<html lang="en"><head><title>Fixture</title></head>
<body><main>
  <h1>Sign up</h1>
  <img src="hero.png">
  <input type="email" name="email">
  <button></button>
</main></body></html>`;

const CLEAN = `<!doctype html><html lang="en"><head><title>Clean</title></head><body><main><h1>Hello</h1><img src="a.png" alt="A cat"></main></body></html>`;

describe('axe-core reports from supplied HTML', () => {
  it('finds the known violations and maps them to WCAG criteria', async () => {
    const outcome = await runAxeOnHtml(FIXTURE);
    const ids = outcome.violations.map((v) => v.id);
    expect(ids).toEqual(expect.arrayContaining(['image-alt', 'label', 'button-name']));

    const report = buildReport(outcome, {
      id: 'r1',
      applicationId: 'app-1',
      applicationName: 'App',
      generatedAt: new Date('2026-01-01T00:00:00Z'),
      source: 'html',
      createdBy: 'test',
    });
    expect(report.wcagCriteria['1.1.1']).toMatchObject({ level: 'A', status: 'fail', issues: 1 });
    expect(report.wcagCriteria['4.1.2'].status).toBe('fail');
    expect(report.wcagLevel).toBe('Non-Compliant');
    expect(report.complianceScore).toBeLessThan(100);
    expect(report.issuesByCategory.altText).toBe(1);
    expect(report.totalIssues).toBe(report.checks.length);
    expect(report.criticalIssues + report.highIssues + report.moderateIssues + report.lowIssues).toBe(report.totalIssues);
    expect(report.prioritizedFixes.map((f) => f.ruleId)).toEqual(expect.arrayContaining(['image-alt', 'label', 'button-name']));

    const clean = buildReport(await runAxeOnHtml(CLEAN), { ...report, id: 'r2', generatedAt: new Date('2026-01-02T00:00:00Z'), source: 'html', createdBy: 'test' }, report);
    expect(clean.complianceScore).toBe(100);
    expect(clean.wcagLevel).toBe('AA');
    expect(clean.trend).toMatchObject({ fixedIssues: report.totalIssues, newIssues: 0, scoreChange: 100 - report.complianceScore });
  }, 30000);
});

describe('Accessibility reports HTTP API', () => {
  const reportStore = new InMemoryStore<AccessibilityReport>();
  const scheduleStore = new InMemoryStore<ReportSchedule>();
  const slaStore = new InMemoryStore<ComplianceSLA>();
  const applications = new FakeApplications([
    { id: 'app-1', name: 'Marketing Site' },
    { id: 'app-2', name: 'Admin', applicationUrl: 'https://93.184.215.14/' },
  ]);
  const scanUrl = jest.fn(async () => runAxeOnHtml(CLEAN).then((o) => ({ ...o, engine: 'playwright' as const, url: 'https://93.184.215.14/' })));
  const scanner: A11yScanner = { scanHtml: runAxeOnHtml, scanUrl };
  let h: Awaited<ReturnType<typeof startApp>>;
  const call = (...args: Parameters<typeof h.call>) => h.call(...args);
  const admin = (method: string, route: string, body?: unknown) => h.call(method, route, body, ADMIN_KEY);

  beforeAll(async () => {
    h = await startApp({
      controllers: [AccessibilityReportsController],
      providers: [
        AccessibilityReportsService,
        { provide: REPORT_STORE, useValue: reportStore },
        { provide: SCHEDULE_STORE, useValue: scheduleStore },
        { provide: SLA_STORE, useValue: slaStore },
        { provide: APPLICATION_DIRECTORY, useValue: applications },
        { provide: A11Y_SCANNER, useValue: scanner },
        ...authProviders,
      ],
    });
  });

  afterAll(async () => {
    await h.app.close();
  });

  it('requires sign-in for reads and admin:governance for writes', async () => {
    expect((await call('GET', '/accessibility-reports/reports', undefined, null)).status).toBe(401);
    expect((await call('GET', '/accessibility-reports/reports')).status).toBe(200);
    expect((await call('GET', '/accessibility-reports/summary')).status).toBe(200);
    expect((await call('POST', '/accessibility-reports/generate/app-1', { html: FIXTURE })).status).toBe(403);
    expect((await call('POST', '/accessibility-reports/schedules', { applicationId: 'app-2', frequency: 'daily', time: '09:00' })).status).toBe(403);
    expect((await call('POST', '/accessibility-reports/slas', { applicationId: 'app-1', targetScore: 90, targetLevel: 'AA', criticalIssuesThreshold: 0, highIssuesThreshold: 5 })).status).toBe(403);
    expect((await call('DELETE', '/accessibility-reports/slas/x')).status).toBe(403);
  });

  it('returns 404 for unknown ids (not 500)', async () => {
    expect((await call('GET', '/accessibility-reports/reports/nope')).status).toBe(404);
    expect((await admin('PUT', '/accessibility-reports/schedules/nope', { enabled: false })).status).toBe(404);
    expect((await admin('DELETE', '/accessibility-reports/schedules/nope')).status).toBe(404);
    expect((await call('GET', '/accessibility-reports/slas/nope')).status).toBe(404);
    expect((await admin('PUT', '/accessibility-reports/slas/nope', { targetScore: 1 })).status).toBe(404);
    expect((await admin('POST', '/accessibility-reports/generate/missing', { html: FIXTURE })).status).toBe(404);
  });

  it('refuses to make up a report when there is nothing to scan', async () => {
    const res = await admin('POST', '/accessibility-reports/generate/app-1', {});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Nothing to scan/);
    expect(reportStore.docs.size).toBe(0);
  });

  it('generates and stores a real report from supplied HTML, then tracks the trend', async () => {
    const first = await admin('POST', '/accessibility-reports/generate/app-1', { html: FIXTURE });
    expect(first.status).toBe(201);
    expect(first.body).toMatchObject({ applicationId: 'app-1', source: 'html', engine: 'jsdom', wcagLevel: 'Non-Compliant', createdBy: 'service:admin-key' });
    expect(first.body.totalIssues).toBeGreaterThanOrEqual(3);
    expect(applications.scans.map((s) => s.id)).toContain('app-1');

    const second = await admin('POST', '/accessibility-reports/generate/app-1', { html: CLEAN });
    expect(second.body).toMatchObject({ previousReportId: first.body.id, complianceScore: 100, trend: { fixedIssues: first.body.totalIssues } });

    const list = await call('GET', '/accessibility-reports/reports?applicationId=app-1');
    expect(list.body.map((r: AccessibilityReport) => r.id)).toEqual([second.body.id, first.body.id]);
    expect(list.body[0].checks).toBeUndefined();
    expect((await call('GET', `/accessibility-reports/reports/${first.body.id}`)).body.checks.length).toBe(first.body.totalIssues);
  }, 30000);

  it('scans the application URL when no html is sent, and rejects private URLs', async () => {
    const res = await admin('POST', '/accessibility-reports/generate/app-2', {});
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ source: 'url', engine: 'playwright' });
    expect(scanUrl).toHaveBeenCalledWith('https://93.184.215.14/');
    expect((await admin('POST', '/accessibility-reports/generate/app-1', { url: 'https://example.com', html: FIXTURE })).status).toBe(400);
  }, 30000);

  it('keeps the latest good report when the target answers with an HTTP error', async () => {
    const latest = (await call('GET', '/accessibility-reports/reports?applicationId=app-2')).body[0];
    expect(latest).toBeDefined();
    const stored = reportStore.docs.size;
    scanUrl.mockRejectedValueOnce(new UnprocessableEntityException('Target unavailable: 93.184.215.14 answered HTTP 404, so there is nothing to audit (no report was created)'));
    const res = await admin('POST', '/accessibility-reports/generate/app-2', {});
    expect(res.status).toBe(422);
    expect(res.body.message).toMatch(/Target unavailable.*HTTP 404/);
    expect(reportStore.docs.size).toBe(stored);
    expect((await call('GET', '/accessibility-reports/reports?applicationId=app-2')).body[0].id).toBe(latest.id);
    const summary = await call('GET', '/accessibility-reports/summary');
    expect(summary.body.applications.find((a: { applicationId: string }) => a.applicationId === 'app-2').latestReportId).toBe(latest.id);
  });

  it('rejects server-owned and unknown fields in bodies', async () => {
    const sla = { applicationId: 'app-1', targetScore: 90, targetLevel: 'AA', criticalIssuesThreshold: 0, highIssuesThreshold: 5 };
    expect((await admin('POST', '/accessibility-reports/slas', { ...sla, id: 'mine' })).status).toBe(400);
    expect((await admin('POST', '/accessibility-reports/slas', { ...sla, createdAt: '2020-01-01' })).status).toBe(400);
    const schedule = { applicationId: 'app-2', frequency: 'daily', time: '09:00' };
    expect((await admin('POST', '/accessibility-reports/schedules', { ...schedule, nextRun: '2020-01-01' })).status).toBe(400);
    expect((await admin('POST', '/accessibility-reports/schedules', { ...schedule, recipients: ['a@example.com'] })).status).toBe(400);
    expect((await admin('POST', '/accessibility-reports/schedules', { ...schedule, time: '25:00' })).status).toBe(400);
  });

  it('allows one SLA per application and reports SLA status in the summary', async () => {
    const sla = { applicationId: 'app-1', targetScore: 90, targetLevel: 'AA', criticalIssuesThreshold: 0, highIssuesThreshold: 5 };
    const created = await admin('POST', '/accessibility-reports/slas', sla);
    expect(created.status).toBe(201);
    expect((await admin('POST', '/accessibility-reports/slas', { ...sla, targetScore: 50 })).status).toBe(409);

    const summary = await call('GET', '/accessibility-reports/summary');
    const byApp = Object.fromEntries(summary.body.applications.map((a: { applicationId: string; slaStatus: string }) => [a.applicationId, a.slaStatus]));
    expect(byApp).toEqual({ 'app-1': 'compliant', 'app-2': 'no-sla' });
    expect(summary.body).toMatchObject({ totalApplications: 2, reportedApplications: 2, compliantApplications: 1, unassessedApplications: 1, averageScore: 100 });

    // The cached summary SystemHealthService reads matches
    expect(h.moduleRef.get(AccessibilityReportsService).getMultiApplicationComplianceSummary().compliantApplications).toBe(1);

    const updated = await admin('PUT', `/accessibility-reports/slas/${created.body.id}`, { targetScore: 100, criticalIssuesThreshold: 2 });
    expect(updated.body).toMatchObject({ targetScore: 100, criticalIssuesThreshold: 2, applicationId: 'app-1', highIssuesThreshold: 5 });
    expect((await call('GET', '/accessibility-reports/slas?applicationId=app-1')).body).toHaveLength(1);
    expect((await admin('DELETE', `/accessibility-reports/slas/${created.body.id}`)).status).toBe(204);
  });

  it('creates, edits and runs schedules', async () => {
    expect((await admin('POST', '/accessibility-reports/schedules', { applicationId: 'app-1', frequency: 'daily', time: '09:00' })).body.message).toMatch(/needs a URL/);
    expect((await admin('POST', '/accessibility-reports/schedules', { applicationId: 'app-1', url: 'http://10.0.0.1/', frequency: 'daily', time: '09:00' })).status).toBe(400);

    const created = await admin('POST', '/accessibility-reports/schedules', { applicationId: 'app-2', frequency: 'weekly', dayOfWeek: 1, time: '06:30' });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ frequency: 'weekly', dayOfWeek: 1, enabled: true });
    expect(new Date(created.body.nextRun).getUTCDay()).toBe(1);
    expect((await admin('POST', '/accessibility-reports/schedules', { applicationId: 'app-2', frequency: 'weekly', time: '06:30' })).status).toBe(400);

    const edited = await admin('PUT', `/accessibility-reports/schedules/${created.body.id}`, { frequency: 'monthly', dayOfMonth: 31, time: '07:00' });
    expect(edited.body).toMatchObject({ frequency: 'monthly', dayOfMonth: 31, time: '07:00', applicationId: 'app-2' });
    expect(edited.body.dayOfWeek).toBeUndefined();

    // Run it as if it were due
    const service = h.moduleRef.get(AccessibilityReportsService);
    const before = scanUrl.mock.calls.length;
    const now = new Date(new Date(edited.body.nextRun).getTime() + 1000);
    expect(await service.runDueSchedules(now)).toBe(1);
    expect(await service.runDueSchedules(now)).toBe(0);
    expect(scanUrl.mock.calls.length).toBe(before + 1);
    const after = (await call('GET', `/accessibility-reports/schedules/${created.body.id}`)).body;
    expect(after).toMatchObject({ lastStatus: 'success', lastRun: now.toISOString() });
    expect(new Date(after.nextRun).getTime()).toBeGreaterThan(now.getTime());
    expect((await call('GET', `/accessibility-reports/reports/${after.lastReportId}`)).body).toMatchObject({ scheduled: true, scheduleId: created.body.id });

    expect((await admin('DELETE', `/accessibility-reports/schedules/${created.body.id}`)).status).toBe(204);
  }, 30000);
});

/**
 * The URL path needs a Chromium install; CI has none, so this only runs where
 * `npx playwright install chromium` was done. It serves the fixture locally,
 * which is why it uses the test-only private-address override.
 */
const describeWithBrowser = isBrowserInstalled() ? describe : describe.skip;
describeWithBrowser('axe-core reports from a URL (Playwright)', () => {
  let server: Server;
  let url: string;

  beforeAll(async () => {
    server = createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Security-Policy': "script-src 'none'" });
      res.end(FIXTURE);
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`;
  });

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  it('renders the page and finds the known violations', async () => {
    const outcome = await runAxeOnUrl(url, { allowPrivateAddressesForTests: true, timeoutMs: 20000 });
    expect(outcome.engine).toBe('playwright');
    expect(outcome.violations.map((v) => v.id)).toEqual(expect.arrayContaining(['image-alt', 'label', 'button-name']));
  }, 60000);

  it('refuses private addresses without the test override', async () => {
    await expect(runAxeOnUrl(url)).rejects.toThrow(/private or internal/);
  });
});
