import { ApplicationDoc } from '../applications/application.types';
import { ApplicationsService } from '../applications/applications.service';
import { SYSTEM_SCOPE } from '../governance/evidence-access';
import { GovernanceScanScheduler } from '../governance/governance.scheduler';
import { MetaDoc } from '../governance/governance-stores';
import { GovernanceRule, ScanRecord } from '../governance/governance.types';
import { RulesService } from '../governance/rules.service';
import { fetchPublicPage } from '../governance/safe-fetch';
import { ScansService } from '../governance/scans.service';
import { RegistryApplicationDirectory } from '../governance/sources';
import { FakeApplications, FakeDesignSystem } from '../governance/testing/fakes';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { InMemoryQueryableStore } from '../workspaces/testing/in-memory-queryable-store';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { WorkspaceDoc } from '../workspaces/workspace.types';
import { A11yScanner, AccessibilityReportsService, scheduledReportId } from './accessibility-reports.service';
import { AccessibilityReport, ComplianceSLA, ReportSchedule } from './accessibility-reports.types';
import { AxeOutcome, runAxeOnHtml } from './axe-engine';

// Governance scans fetch the application's URL; the network is the only thing faked
jest.mock('../governance/safe-fetch', () => ({ fetchPublicPage: jest.fn() }));
const fetchPage = fetchPublicPage as jest.MockedFunction<typeof fetchPublicPage>;

const CLEAN = `<!doctype html><html lang="en"><head><title>Clean</title></head><body><main><h1>Hello</h1><img src="a.png" alt="A cat"></main></body></html>`;
const URL = 'https://93.184.215.14/';
const minutes = (base: Date, n: number) => new Date(base.getTime() + n * 60_000);
const allScope = { scopeFor: async () => SYSTEM_SCOPE };

interface Hold {
  /** Resolves once the held scan has started */
  started: Promise<void>;
  release: () => void;
}

/** A URL scanner that runs axe over fixed HTML; `hold()` makes the next scan wait until released, `failNext` makes the next ones throw */
function controllableScanner() {
  const calls: string[] = [];
  let failures: Error[] = [];
  let held: { hold: Hold; begin: () => void; gate: Promise<void> } | null = null;
  const scanner: A11yScanner = {
    scanHtml: runAxeOnHtml,
    async scanUrl(url: string): Promise<AxeOutcome> {
      calls.push(url);
      const failure = failures.shift();
      if (failure) throw failure;
      if (held) {
        const current = held;
        held = null;
        current.begin();
        await current.gate;
      }
      return { ...(await runAxeOnHtml(CLEAN)), engine: 'playwright', url };
    },
  };
  return {
    scanner,
    calls,
    failNext: (...errors: Error[]) => (failures = errors),
    hold(): Hold {
      let begin!: () => void;
      let release!: () => void;
      const started = new Promise<void>((resolve) => (begin = resolve));
      const gate = new Promise<void>((resolve) => (release = resolve));
      const hold = { started, release };
      held = { hold, begin, gate };
      return hold;
    },
  };
}

/**
 * Scheduled reports across two "instances" (two services over the same
 * stores, as two backend processes over one Elasticsearch): a run that dies
 * after its claim is taken over once the lease expires, and each occurrence
 * produces at most one report.
 */
describe('Scheduled accessibility reports: leases, retries and dead letters', () => {
  const t0 = new Date('2026-11-13T08:00:00Z');
  const due = new Date('2026-11-13T09:00:30Z');
  const occurrence = '2026-11-13T09:00:00.000Z';

  async function setup() {
    const reports = new InMemoryStore<AccessibilityReport>();
    const schedules = new InMemoryStore<ReportSchedule>();
    const slas = new InMemoryStore<ComplianceSLA>();
    const apps = new FakeApplications([{ id: 'app-1', name: 'App', applicationUrl: URL, workspaceId: null }]);
    const control = controllableScanner();
    const instance = () => new AccessibilityReportsService(reports, schedules, slas, apps, control.scanner, allScope);
    const schedule = await instance().createSchedule({ applicationId: 'app-1', frequency: 'daily', time: '09:00' }, { type: 'service', id: 'admin', name: 'admin', email: null, roles: [], permissions: new Set(), mustChangePassword: false }, t0);
    expect(schedule.nextRun).toBe(occurrence);
    const stored = () => schedules.docs.get(schedule.id)!.doc;
    return { reports, schedules, slas, apps, control, instance, schedule, stored };
  }

  it('measures each lease from its own claim, not from the start of a long pass', async () => {
    const { reports, schedules, slas, apps, instance, schedule } = await setup();
    const other = await instance().createSchedule({ applicationId: 'app-1', frequency: 'daily', time: '09:00' }, { type: 'service', id: 'admin', name: 'admin', email: null, roles: [], permissions: new Set(), mustChangePassword: false }, t0);
    // The first scan takes 11 minutes, longer than the 10-minute lease; the second hangs
    let now = due;
    let scans = 0;
    let releaseSecond!: () => void;
    const scanner: A11yScanner = {
      scanHtml: runAxeOnHtml,
      async scanUrl(url: string) {
        if (++scans === 1) now = minutes(now, 11);
        else await new Promise<void>((resolve) => (releaseSecond = resolve));
        return { ...(await runAxeOnHtml(CLEAN)), engine: 'playwright', url };
      },
    };
    const pass = new AccessibilityReportsService(reports, schedules, slas, apps, scanner, allScope).runDueSchedules(() => now);
    const claimed = () => [schedule.id, other.id].map((id) => schedules.docs.get(id)!.doc).find((s) => s.pending?.state === 'claimed' && scans === 2);
    for (let i = 0; i < 200 && !claimed(); i++) await new Promise((resolve) => setTimeout(resolve, 5));

    expect(claimed()?.pending?.leaseUntil).toBe(minutes(due, 21).toISOString());
    // Another instance a minute later leaves the second schedule alone: its lease is live
    expect(await instance().runDueSchedules(minutes(due, 12))).toBe(0);
    releaseSecond();
    expect(await pass).toBe(2);
  }, 30000);

  it('takes over a claim after its lease expires, and the late run adds no second report', async () => {
    const { reports, control, instance, schedule, stored } = await setup();
    const hold = control.hold();
    const first = instance().runDueSchedules(due);
    await hold.started;
    // Claimed, but nextRun hasn't moved: the occurrence isn't done
    expect(stored()).toMatchObject({ nextRun: occurrence, pending: { occurrence, state: 'claimed', attempts: 1, leaseUntil: minutes(due, 10).toISOString() } });

    expect(await instance().runDueSchedules(minutes(due, 9))).toBe(0);
    expect(await instance().runDueSchedules(minutes(due, 10))).toBe(1);
    const reportId = scheduledReportId(schedule.id, occurrence);
    expect(stored()).toMatchObject({ lastStatus: 'success', lastReportId: reportId, nextRun: '2026-11-14T09:00:00.000Z' });
    expect(stored().pending).toBeUndefined();

    // The first worker finishes late: same report id, and it can't complete the occurrence again
    const before = structuredClone(stored());
    hold.release();
    expect(await first).toBe(1);
    expect([...reports.docs.keys()]).toEqual([reportId]);
    expect(stored()).toEqual(before);
    expect(control.calls).toHaveLength(2);
  }, 30000);

  it('completes an occurrence whose report was stored before the worker died, without scanning again', async () => {
    const { reports, schedules, control, instance, schedule, stored } = await setup();
    const hold = control.hold();
    const first = instance().runDueSchedules(due);
    await hold.started;
    // The process "dies" once the scan is done: none of its schedule writes land
    schedules.beforeReplace = () => {
      throw new Error('process killed');
    };
    hold.release();
    await first;
    schedules.beforeReplace = undefined;
    expect(reports.docs.has(scheduledReportId(schedule.id, occurrence))).toBe(true);
    expect(stored().pending).toMatchObject({ state: 'claimed', attempts: 1 });

    expect(await instance().runDueSchedules(minutes(due, 10))).toBe(1);
    expect(control.calls).toHaveLength(1);
    expect(reports.docs.size).toBe(1);
    expect(stored()).toMatchObject({ lastStatus: 'success', lastReportId: scheduledReportId(schedule.id, occurrence) });
  }, 30000);

  it('retries a failed run with backoff, then dead-letters it and moves on to the next occurrence', async () => {
    const { reports, control, instance, stored } = await setup();
    control.failNext(new Error('net::ERR_CONNECTION_RESET'), new Error('net::ERR_CONNECTION_RESET'), new Error('net::ERR_CONNECTION_RESET'));
    expect(await instance().runDueSchedules(due)).toBe(1);
    expect(stored()).toMatchObject({ nextRun: occurrence, lastStatus: 'failed', pending: { state: 'retry', attempts: 1, retryAt: minutes(due, 5).toISOString() } });
    expect(await instance().runDueSchedules(minutes(due, 4))).toBe(0);
    expect(await instance().runDueSchedules(minutes(due, 5))).toBe(1);
    expect(stored().pending).toMatchObject({ attempts: 2, retryAt: minutes(due, 15).toISOString() });
    expect(await instance().runDueSchedules(minutes(due, 15))).toBe(1);

    expect(stored()).toMatchObject({ lastStatus: 'dead-letter', nextRun: '2026-11-14T09:00:00.000Z' });
    expect(stored().pending).toBeUndefined();
    expect(stored().deadLetters).toEqual([{ occurrence, attempts: 3, error: expect.stringMatching(/ERR_CONNECTION_RESET/), at: minutes(due, 15).toISOString() }]);
    expect(await instance().runDueSchedules(minutes(due, 120))).toBe(0);
    expect(reports.docs.size).toBe(0);

    // The next day's occurrence runs normally
    expect(await instance().runDueSchedules(new Date('2026-11-14T09:00:30Z'))).toBe(1);
    expect(stored()).toMatchObject({ lastStatus: 'success', deadLetters: [expect.objectContaining({ occurrence })] });
  }, 30000);

  it('removes the schedule and SLA of a deleted application instead of failing every period', async () => {
    const { apps, instance, schedules, slas, reports, control, schedule } = await setup();
    await instance().createSLA({ applicationId: 'app-1', targetScore: 90, targetLevel: 'AA', criticalIssuesThreshold: 0, highIssuesThreshold: 5 });
    apps.apps.delete('app-1');
    expect(await instance().runDueSchedules(due)).toBe(0);
    expect(schedules.docs.has(schedule.id)).toBe(false);
    expect(slas.docs.size).toBe(0);
    expect(reports.docs.size).toBe(0);
    expect(control.calls).toEqual([]);
  });

  it('keeps the schedule when the application lookup fails, to try again next tick', async () => {
    const { apps, instance, schedules, schedule, control } = await setup();
    jest.spyOn(apps, 'get').mockRejectedValueOnce(new Error('Storage is unavailable'));
    expect(await instance().runDueSchedules(due)).toBe(0);
    expect(schedules.docs.has(schedule.id)).toBe(true);
    expect(control.calls).toEqual([]);
  });

  it('a transient failure is retried and succeeds', async () => {
    const { reports, control, instance, stored } = await setup();
    control.failNext(new Error('Navigation timeout'));
    expect(await instance().runDueSchedules(due)).toBe(1);
    expect(await instance().runDueSchedules(minutes(due, 5))).toBe(1);
    expect(stored()).toMatchObject({ lastStatus: 'success', nextRun: '2026-11-14T09:00:00.000Z' });
    expect(stored().lastError).toBeUndefined();
    expect(reports.docs.size).toBe(1);
  }, 30000);
});

/**
 * An accessibility report doesn't count as the period's governance scan:
 * the real application registry, directory, report service and governance
 * scheduler (and ScansService, with only the network faked).
 */
describe('Accessibility reports and scheduled governance scans', () => {
  it("still runs the daily governance scan after a report earlier in the day", async () => {
    const store = new InMemoryQueryableStore<ApplicationDoc>();
    const now = new Date().toISOString();
    const actor = { id: 'usr_x', name: 'x' };
    store.forceWrite({
      id: 'app_daily',
      name: 'Daily',
      description: '',
      applicationUrl: URL,
      workspaceId: null,
      registeredAt: now,
      updatedAt: now,
      registeredBy: actor,
      updatedBy: actor,
      capabilities: {
        governance: { enabled: true, rules: ['a11y-image-alt'], scanSchedule: 'daily' },
        visualRegression: { enabled: false },
        sessionReplay: { enabled: false },
      },
      metadata: {},
    });
    const registry = new ApplicationsService(store, new WorkspaceAccessService(new InMemoryQueryableStore<WorkspaceDoc>()), {} as never, {} as never);
    const directory = new RegistryApplicationDirectory(registry);
    const meta = new InMemoryStore<MetaDoc>();
    const scans = new ScansService(new RulesService(new InMemoryStore<GovernanceRule>(), meta), new InMemoryStore<ScanRecord>(), directory, new FakeDesignSystem(), allScope);
    const governance = new GovernanceScanScheduler(scans, directory, meta);
    const reports = new AccessibilityReportsService(
      new InMemoryStore<AccessibilityReport>(),
      new InMemoryStore<ReportSchedule>(),
      new InMemoryStore<ComplianceSLA>(),
      directory,
      controllableScanner().scanner,
      allScope,
    );
    fetchPage.mockResolvedValue({ url: URL, status: 200, contentType: 'text/html', body: '<img src="x.png">' });

    const report = await reports.generateReport('app_daily', { html: CLEAN }, 'scheduler');
    const afterReport = (await registry.find('app_daily'))!;
    expect(afterReport).toMatchObject({ lastAccessibilityReport: report.generatedAt, lastScanned: report.generatedAt });
    expect(afterReport.capabilities.governance.lastScan).toBeUndefined();

    // The daily tick later the same day
    const tick = new Date(new Date(report.generatedAt).getTime() + 1000);
    expect(await governance.runDueScans(tick)).toBe(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    const afterScan = (await registry.find('app_daily'))!;
    expect(afterScan.capabilities.governance.lastScan).toBeDefined();
    expect(afterScan.lastAccessibilityReport).toBe(report.generatedAt);
    // Scanned now: nothing more this period
    expect(await governance.runDueScans(new Date(tick.getTime() + 60_000))).toBe(0);
  }, 30000);
});
