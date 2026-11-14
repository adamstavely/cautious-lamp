import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { SYSTEM_SCOPE } from './evidence-access';
import { GovernanceScanScheduler, periodStart, scheduledScanId } from './governance.scheduler';
import { MetaDoc } from './governance-stores';
import { GovernanceRule, ScanRecord } from './governance.types';
import { RulesService } from './rules.service';
import { fetchPublicPage } from './safe-fetch';
import { ScansService } from './scans.service';
import { RegistryApplicationDirectory } from './sources';
import { FakeApplications, FakeDesignSystem } from './testing/fakes';

// The real ScansService fetches the application's URL; the network is the only thing faked
jest.mock('./safe-fetch', () => ({ fetchPublicPage: jest.fn() }));
const fetchPage = fetchPublicPage as jest.MockedFunction<typeof fetchPublicPage>;

const at = (iso: string) => new Date(iso);
const minutes = (base: Date, n: number) => new Date(base.getTime() + n * 60_000);

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

  it('records a failed scan, carries on with the others, and retries it with backoff', async () => {
    const { scheduler, scan, meta } = setup();
    const t0 = at('2026-11-13T09:00:00Z');
    scan.mockRejectedValueOnce(new Error('Fetching daily.example returned HTTP 503'));
    expect(await scheduler().runDueScans(t0)).toBe(2);
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({
      state: 'retry',
      attempts: 1,
      lastStatus: 'failed',
      lastError: 'Fetching daily.example returned HTTP 503',
      retryAt: minutes(t0, 5).toISOString(),
    });
    expect(meta.docs.get('scheduled-scan:weekly')?.doc).toMatchObject({ state: 'completed', lastStatus: 'success' });

    // Not before the retry is due; then once, and it succeeds
    expect(await scheduler().runDueScans(minutes(t0, 4))).toBe(0);
    expect(await scheduler().runDueScans(minutes(t0, 5))).toBe(1);
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({ state: 'completed', attempts: 2, lastStatus: 'success', lastScanId: 'scan-daily' });
    expect(meta.docs.get('scheduled-scan:daily')?.doc.lastError).toBeUndefined();
    expect(await scheduler().runDueScans(minutes(t0, 60))).toBe(0);
    expect(scan).toHaveBeenCalledTimes(3);
  });

  it('dead-letters an occurrence after the last attempt, and runs the next period as usual', async () => {
    const { scheduler, scan, meta } = setup(new FakeApplications([
      { id: 'daily', name: 'Daily', applicationUrl: 'https://daily.example/', governanceEnabled: true, scanSchedule: 'daily' },
    ]));
    const t0 = at('2026-11-13T09:00:00Z');
    scan.mockRejectedValue(new Error('Fetching daily.example returned HTTP 503'));
    expect(await scheduler().runDueScans(t0)).toBe(1);
    expect(await scheduler().runDueScans(minutes(t0, 5))).toBe(1);
    // The second retry waits twice as long
    expect(meta.docs.get('scheduled-scan:daily')?.doc.retryAt).toBe(minutes(t0, 15).toISOString());
    expect(await scheduler().runDueScans(minutes(t0, 15))).toBe(1);
    const marker = meta.docs.get('scheduled-scan:daily')!.doc;
    expect(marker).toMatchObject({ state: 'dead-letter', attempts: 3, lastStatus: 'failed' });
    expect(marker.deadLetters).toEqual([{ period: 'daily:2026-11-13T00:00:00.000Z', attempts: 3, error: 'Fetching daily.example returned HTTP 503', at: minutes(t0, 15).toISOString() }]);
    expect(await scheduler().runDueScans(minutes(t0, 120))).toBe(0);
    expect(scan).toHaveBeenCalledTimes(3);

    // Dead letters are listed for admins, without the claim token
    const [listed] = await scheduler().occurrences();
    expect(listed).toMatchObject({ applicationId: 'daily', state: 'dead-letter' });
    expect(listed.token).toBeUndefined();

    scan.mockResolvedValue({ id: 'scan-daily' } as never);
    expect(await scheduler().runDueScans(at('2026-11-14T00:01:00Z'))).toBe(1);
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({ state: 'completed', attempts: 1, deadLetters: marker.deadLetters });
  });

  it('takes over a claim left by an old marker without a lease, once it has expired', async () => {
    const { scheduler, scan, meta } = setup(new FakeApplications([
      { id: 'daily', name: 'Daily', applicationUrl: 'https://daily.example/', governanceEnabled: true, scanSchedule: 'daily' },
    ]));
    const t0 = at('2026-11-13T09:00:00Z');
    meta.forceWrite({ id: 'scheduled-scan:daily', createdAt: t0.toISOString(), updatedAt: t0.toISOString(), value: 'daily:2026-11-13T00:00:00.000Z', lastStatus: 'running' });
    expect(await scheduler().runDueScans(minutes(t0, 9))).toBe(0);
    expect(await scheduler().runDueScans(minutes(t0, 10))).toBe(1);
    expect(scan).toHaveBeenCalledTimes(1);
  });

  it('reads the schedule from the application registry', async () => {
    const directory = new RegistryApplicationDirectory({
      find: async () => null,
      markScanned: async () => undefined as never,
      list: async () =>
        [{ id: 'a', name: 'A', applicationUrl: 'https://a.example/', capabilities: { governance: { enabled: true, rules: [], scanSchedule: 'weekly', lastScan: '2026-11-01T00:00:00Z' } } }] as never,
    });
    expect(await directory.list()).toEqual([
      { id: 'a', name: 'A', applicationUrl: 'https://a.example/', governanceRules: [], governanceEnabled: true, scanSchedule: 'weekly', lastScan: '2026-11-01T00:00:00Z', workspaceId: null },
    ]);
  });
});

/**
 * Crash recovery with the real ScansService and stores: one instance claims
 * an occurrence and dies; another takes over once the lease expires, and
 * only one scan is ever stored for the occurrence.
 */
describe('GovernanceScanScheduler crash recovery', () => {
  const t0 = at('2026-11-13T09:00:00Z');
  const scanId = scheduledScanId('daily', 'daily', at('2026-11-13T00:00:00Z'));
  const page = { url: 'https://daily.example/', status: 200, contentType: 'text/html', body: '<main><img src="hero.png"></main>' };

  async function setupReal() {
    const meta = new InMemoryStore<MetaDoc>();
    const scanStore = new InMemoryStore<ScanRecord>();
    const rules = new RulesService(new InMemoryStore<GovernanceRule>(), meta);
    const apps = new FakeApplications([
      { id: 'daily', name: 'Daily', applicationUrl: 'https://daily.example/', governanceEnabled: true, scanSchedule: 'daily', governanceRules: ['a11y-image-alt'] },
    ]);
    const scans = new ScansService(rules, scanStore, apps, new FakeDesignSystem(), { scopeFor: async () => SYSTEM_SCOPE });
    // Each "instance" is its own scheduler over the same stores
    const instance = () => new GovernanceScanScheduler(scans, apps, meta);
    return { meta, scanStore, apps, scans, instance };
  }

  beforeEach(() => fetchPage.mockReset());

  it('takes over after the lease expires, without a duplicate scan when the first run finishes late', async () => {
    const { meta, scanStore, apps, scans, instance } = await setupReal();
    let releaseFirst!: () => void;
    fetchPage.mockImplementationOnce(() => new Promise((resolve) => (releaseFirst = () => resolve(page))));
    fetchPage.mockResolvedValue(page);

    // Worker A claims and hangs (as good as dead)
    const first = instance().runDueScans(t0);
    await new Promise((resolve) => setImmediate(resolve));
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({ state: 'claimed', attempts: 1, leaseUntil: minutes(t0, 10).toISOString() });

    // Worker B leaves it alone while the lease holds, then takes it over
    expect(await instance().runDueScans(minutes(t0, 9))).toBe(0);
    expect(await instance().runDueScans(minutes(t0, 10))).toBe(1);
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({ state: 'completed', attempts: 2, lastStatus: 'success', lastScanId: scanId });

    // A wakes up: its scan lands on the same id and it can't complete the occurrence again
    releaseFirst();
    expect(await first).toBe(1);
    expect([...scanStore.docs.keys()]).toEqual([scanId]);
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({ state: 'completed', attempts: 2 });
    expect(apps.scans.filter((s) => s.kind === 'governance')).toHaveLength(1);
    expect((await scans.get(scanId, { type: 'service', id: 'x', name: 'x', email: null, roles: [], permissions: new Set(['admin:governance']), mustChangePassword: false })).ruleResults[0]).toMatchObject({ outcome: 'fail' });
  });

  it('completes an occurrence whose scan was stored before the worker died, without scanning again', async () => {
    const { meta, scanStore, instance } = await setupReal();
    fetchPage.mockResolvedValue(page);
    // Worker A stores the scan, then dies before it can write anything else
    meta.beforeReplace = () => {
      throw new Error('process killed');
    };
    expect(await instance().runDueScans(t0)).toBe(1);
    meta.beforeReplace = undefined;
    expect(scanStore.docs.has(scanId)).toBe(true);
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({ state: 'claimed', attempts: 1 });

    expect(await instance().runDueScans(minutes(t0, 10))).toBe(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(scanStore.docs.size).toBe(1);
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({ state: 'completed', attempts: 2, lastScanId: scanId });
  });

  it('dead-letters an occurrence whose every attempt died', async () => {
    const { meta, instance } = await setupReal();
    fetchPage.mockImplementation(() => new Promise(() => undefined));
    void instance().runDueScans(t0);
    await new Promise((resolve) => setImmediate(resolve));
    void instance().runDueScans(minutes(t0, 10));
    await new Promise((resolve) => setImmediate(resolve));
    void instance().runDueScans(minutes(t0, 20));
    await new Promise((resolve) => setImmediate(resolve));
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({ state: 'claimed', attempts: 3 });
    expect(await instance().runDueScans(minutes(t0, 30))).toBe(0);
    expect(meta.docs.get('scheduled-scan:daily')?.doc).toMatchObject({ state: 'dead-letter', deadLetters: [expect.objectContaining({ attempts: 3 })] });
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });
});
