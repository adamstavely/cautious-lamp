import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { GovernanceScanScheduler, periodStart } from './governance.scheduler';
import { MetaDoc } from './governance-stores';
import { ScansService } from './scans.service';
import { RegistryApplicationDirectory } from './sources';
import { FakeApplications } from './testing/fakes';

const at = (iso: string) => new Date(iso);

function setup(apps = new FakeApplications([
  { id: 'daily', name: 'Daily', applicationUrl: 'https://daily.example/', governanceEnabled: true, scanSchedule: 'daily' },
  { id: 'weekly', name: 'Weekly', applicationUrl: 'https://weekly.example/', governanceEnabled: true, scanSchedule: 'weekly' },
  { id: 'manual', name: 'Manual', applicationUrl: 'https://manual.example/', governanceEnabled: true, scanSchedule: 'manual' },
  { id: 'on-commit', name: 'Legacy on-commit', applicationUrl: 'https://commit.example/', governanceEnabled: true, scanSchedule: 'on-commit' },
  { id: 'no-url', name: 'No URL', governanceEnabled: true, scanSchedule: 'daily' },
  { id: 'off', name: 'Governance off', applicationUrl: 'https://off.example/', governanceEnabled: false, scanSchedule: 'daily' },
])) {
  const meta = new InMemoryStore<MetaDoc>();
  const scan = jest.fn(async (request: { applicationId?: string }, _principal?: unknown) => ({ id: `scan-${request.applicationId}` }));
  const scans = { scan } as unknown as ScansService;
  return { apps, meta, scan, scheduler: () => new GovernanceScanScheduler(scans, apps, meta) };
}

describe('GovernanceScanScheduler', () => {
  it('works out the UTC day and the week starting Monday', () => {
    expect(periodStart('daily', at('2026-11-13T17:45:00Z')).toISOString()).toBe('2026-11-13T00:00:00.000Z');
    // 13 Nov 2026 is a Friday; 15 Nov a Sunday
    expect(periodStart('weekly', at('2026-11-13T17:45:00Z')).toISOString()).toBe('2026-11-09T00:00:00.000Z');
    expect(periodStart('weekly', at('2026-11-15T23:59:00Z')).toISOString()).toBe('2026-11-09T00:00:00.000Z');
    expect(periodStart('weekly', at('2026-11-16T00:00:00Z')).toISOString()).toBe('2026-11-16T00:00:00.000Z');
  });

  it('runs daily and weekly scans of applications with a URL, once per period', async () => {
    const { scheduler, scan, meta } = setup();
    const s = scheduler();
    expect(await s.runDueScans(at('2026-11-13T09:00:00Z'))).toBe(2);
    expect(scan.mock.calls.map(([request]) => request)).toEqual([
      { scope: 'application', applicationId: 'daily', url: 'https://daily.example/' },
      { scope: 'application', applicationId: 'weekly', url: 'https://weekly.example/' },
    ]);
    expect(scan.mock.calls[0][1]).toMatchObject({ type: 'service', id: 'governance-scheduler' });
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({ lastStatus: 'success', lastScanId: 'scan-daily' });

    // Later the same day: nothing is due
    expect(await s.runDueScans(at('2026-11-13T23:00:00Z'))).toBe(0);
    // The next day: only the daily one
    expect(await s.runDueScans(at('2026-11-14T00:01:00Z'))).toBe(1);
    // The next Monday: both
    expect(await s.runDueScans(at('2026-11-16T00:01:00Z'))).toBe(2);
    expect(scan).toHaveBeenCalledTimes(5);
  });

  it('runs each occurrence on one instance only', async () => {
    const { scheduler, scan } = setup();
    const now = at('2026-11-13T09:00:00Z');
    const counts = await Promise.all([scheduler().runDueScans(now), scheduler().runDueScans(now)]);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(2);
    expect(scan).toHaveBeenCalledTimes(2);
  });

  it('skips an application already scanned this period', async () => {
    const { scheduler, scan } = setup(new FakeApplications([
      { id: 'daily', name: 'Daily', applicationUrl: 'https://daily.example/', governanceEnabled: true, scanSchedule: 'daily', lastScan: '2026-11-13T08:00:00Z' },
    ]));
    expect(await scheduler().runDueScans(at('2026-11-13T09:00:00Z'))).toBe(0);
    expect(scan).not.toHaveBeenCalled();
  });

  it('records a failed scan and carries on with the others', async () => {
    const { scheduler, scan, meta } = setup();
    scan.mockRejectedValueOnce(new Error('Fetching daily.example returned HTTP 503'));
    expect(await scheduler().runDueScans(at('2026-11-13T09:00:00Z'))).toBe(2);
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({ lastStatus: 'failed', lastError: 'Fetching daily.example returned HTTP 503' });
    expect(meta.docs.get('scheduled-scan:weekly')?.doc).toMatchObject({ lastStatus: 'success' });
    // Not retried until the next period
    expect(await scheduler().runDueScans(at('2026-11-13T10:00:00Z'))).toBe(0);
  });

  it('reads the schedule from the application registry', async () => {
    const directory = new RegistryApplicationDirectory({
      find: async () => null,
      markScanned: async () => undefined as never,
      list: async () =>
        [{ id: 'a', name: 'A', applicationUrl: 'https://a.example/', capabilities: { governance: { enabled: true, rules: [], scanSchedule: 'weekly', lastScan: '2026-11-01T00:00:00Z' } } }] as never,
    });
    expect(await directory.list()).toEqual([
      { id: 'a', name: 'A', applicationUrl: 'https://a.example/', governanceRules: [], governanceEnabled: true, scanSchedule: 'weekly', lastScan: '2026-11-01T00:00:00Z' },
    ]);
  });
});
