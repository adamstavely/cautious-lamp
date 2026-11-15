import { ConflictException } from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { EncryptionService } from '../common/security/encryption.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { DesignSystemStores, createDesignSystemService, createDesignSystemStores } from '../design-system/testing/in-memory-stores';
import { DesignToolReader } from '../design-tools/design-tool-reader';
import { SyncRun, SyncRunLog } from '../design-tools/sync-runs';
import { FIGMA_KEY, figmaFixture } from '../design-tools/testing/fake-design-tools';
import { Permission } from '../rbac/rbac.service';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { APPLY_LEASE_MS, TokenSyncConnection, TokenSyncService } from './token-sync.service';

const TOKEN_WRITER = [Permission.TOKEN_CREATE, Permission.TOKEN_EDIT, Permission.TOKEN_DELETE];
const person = (id: string, extra: Permission[] = []): AuthPrincipal => ({
  type: 'user',
  id,
  email: `${id}@example.com`,
  name: id,
  roles: [],
  permissions: new Set([...TOKEN_WRITER, ...extra]),
  mustChangePassword: false,
});
const alice = person('usr_alice');
/** An administrator, who can see and apply alice's connection's runs */
const bob = person('usr_bob', [Permission.ADMIN_USERS]);

/** Resolves once `count` callers are waiting, so they all go on together */
function barrier(count: number) {
  let waiting = 0;
  let release!: () => void;
  const all = new Promise<void>((resolve) => (release = resolve));
  return () => {
    if (++waiting === count) release();
    return all;
  };
}

/**
 * Token sync under concurrency and interruption: two servers over the same
 * stores, racing applies and pulls, and applies that stop part-way.
 */
describe('Token sync: races and recovery', () => {
  let stores: DesignSystemStores;
  let designSystem: DesignSystemService;
  let runStore: InMemoryStore<SyncRun>;
  let connections: InMemoryStore<TokenSyncConnection>;
  let fixture: ReturnType<typeof figmaFixture>;
  let service: TokenSyncService;

  const build = (ds: DesignSystemService) =>
    new TokenSyncService(ds, new EncryptionService(), connections, new DesignToolReader(fixture.http), new SyncRunLog(runStore));
  const stored = async (name: string) => (await stores.tokens.get(name))?.doc.value;
  const runOf = async (id: string) => (await runStore.get(id))!.doc;

  beforeEach(async () => {
    stores = createDesignSystemStores();
    designSystem = await createDesignSystemService(stores);
    runStore = new InMemoryStore();
    connections = new InMemoryStore();
    fixture = figmaFixture();
    service = build(designSystem);
  });

  afterEach(() => jest.restoreAllMocks());

  const connect = () => service.createConnection(alice, { name: 'Acme Figma', tool: 'figma', fileId: FIGMA_KEY, apiKey: 'figd_test' });
  const RADIUS = { choices: { 'border.radius.sm': 'take-design' } };

  it('keeps a newer edit made on another server after the diff was pulled (U02)', async () => {
    const conn = await connect();
    const otherServer = await createDesignSystemService(stores);
    const run = await service.syncTokens(alice, conn.id);
    // Another server changes the token; this server's copy still holds the old value
    await otherServer.updateToken('border.radius.sm', { value: '19px' });

    const applied = await service.applyRun(alice, run.id, RADIUS);
    expect(applied.applied!.results.find((r) => r.id === 'border.radius.sm')).toMatchObject({ outcome: 'failed', error: expect.stringMatching(/Changed in code/) });
    expect(applied.status).toBe('partial');
    expect(await stored('border.radius.sm')).toBe('19px');
  });

  it('lets exactly one of two simultaneous applies write, and answers the other 409 (U05)', async () => {
    const conn = await connect();
    const run = await service.syncTokens(alice, conn.id);
    const update = jest.spyOn(designSystem, 'updateToken');
    // Both callers read the run as 'review' before either claim is written
    const bothRead = barrier(2);
    runStore.beforeReplace = async (doc) => {
      if (doc.id === run.id && doc.status === 'applying' && !doc.progress?.length) await bothRead();
    };

    const results = await Promise.allSettled([
      service.applyRun(alice, run.id, RADIUS),
      service.applyRun(bob, run.id, { choices: { 'border.radius.sm': 'keep-code' } }),
    ]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBeInstanceOf(ConflictException);

    const final = await runOf(run.id);
    const winner = (fulfilled[0] as PromiseFulfilledResult<SyncRun>).value;
    expect(final.applied!.by.id).toBe(winner.applied!.by.id);
    expect(update.mock.calls.filter(([name]) => name === 'border.radius.sm').length).toBe(winner.applied!.by.id === alice.id ? 1 : 0);
  });

  it('finishes an apply interrupted after the token writes, without writing twice (U06)', async () => {
    const conn = await connect();
    const run = await service.syncTokens(alice, conn.id);
    const update = jest.spyOn(designSystem, 'updateToken');
    // Storage fails when the baseline is saved, after the token was written
    const replace = jest.spyOn(connections, 'replace').mockRejectedValueOnce(new Error('connection store unavailable'));

    await expect(service.applyRun(alice, run.id, RADIUS)).rejects.toThrow(/unavailable/);
    expect(await stored('border.radius.sm')).toBe('6px');
    const interrupted = await runOf(run.id);
    expect(interrupted.status).toBe('applying');
    expect(interrupted.progress).toEqual(expect.arrayContaining([{ id: 'border.radius.sm', choice: 'take-design', outcome: 'updated' }]));

    replace.mockRestore();
    // Applying again finishes it with the original choices; a different body is ignored
    const finished = await service.applyRun(bob, run.id, { choices: { 'border.radius.sm': 'skip' } });
    expect(finished.status).toBe('applied');
    expect(finished.applied!.results.find((r) => r.id === 'border.radius.sm')).toMatchObject({ choice: 'take-design', outcome: 'updated' });
    expect(update.mock.calls.filter(([name]) => name === 'border.radius.sm')).toHaveLength(1);
    expect((await runOf(run.id)).claim).toBeUndefined();
    expect((await connections.get(conn.id))!.doc.baseline!['border.radius.sm']).toEqual({ design: '6px', code: '6px' });
    await expect(service.applyRun(alice, run.id, RADIUS)).rejects.toThrow(/already been applied/);
  });

  it('recovers a token written but not recorded when the server stopped, once the claim lapses (U06)', async () => {
    let now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    const conn = await connect();
    const run = await service.syncTokens(alice, conn.id);
    // The server "stops" right after writing the token: no progress, and the claim isn't released
    runStore.beforeReplace = (doc) => {
      if (doc.id === run.id && doc.status === 'applying' && doc.progress?.length) throw new Error('server stopped');
    };
    await expect(service.applyRun(alice, run.id, RADIUS)).rejects.toThrow(/stopped/);
    expect(await stored('border.radius.sm')).toBe('6px');
    expect((await runOf(run.id)).progress).toEqual([]);
    runStore.beforeReplace = undefined;

    // A restarted server: the claim still holds, so a retry is refused until it lapses
    const restarted = build(await createDesignSystemService(stores));
    const claim = (await runOf(run.id)).claim!;
    runStore.forceWrite({ ...(await runOf(run.id)), claim: { ...claim, expiresAt: new Date(now + APPLY_LEASE_MS).toISOString() } });
    await expect(restarted.applyRun(alice, run.id, {})).rejects.toThrow(/being applied by someone else/);

    now += APPLY_LEASE_MS + 1;
    const finished = await restarted.applyRun(alice, run.id, {});
    expect(finished.status).toBe('applied');
    expect(finished.applied!.results.find((r) => r.id === 'border.radius.sm')).toMatchObject({ outcome: 'updated' });
    expect(await stored('border.radius.sm')).toBe('6px');
  });

  it('keeps exactly the latest of two pulls recorded at once reviewable (U07)', async () => {
    const log = new SyncRunLog(runStore);
    const base = { kind: 'tokens' as const, connectionId: 'conn-1', tool: 'figma', trigger: 'manual' as const, startedBy: { type: 'user' as const, id: 'u', name: 'u' }, finishedAt: '2026-11-15T10:00:05.000Z', status: 'review' as const, counts: {}, warnings: [] };
    const first = { ...base, id: 'run-a', startedAt: '2026-11-15T10:00:00.000Z' };
    const second = { ...base, id: 'run-b', startedAt: '2026-11-15T10:00:01.000Z' };
    await Promise.all([log.record(second), log.record(first)]);
    expect((await runOf('run-b')).status).toBe('review');
    expect((await runOf('run-a')).status).toBe('superseded');
  });

  it('keeps the connection pointing at the latest pull when pulls race (U07)', async () => {
    const conn = await connect();
    const [a, b] = await Promise.all([service.syncTokens(alice, conn.id), service.syncTokens(bob, conn.id)]);
    const runs = await Promise.all([runOf(a.id), runOf(b.id)]);
    const reviewable = runs.filter((r) => r.status === 'review');
    expect(reviewable).toHaveLength(1);
    expect((await connections.get(conn.id))!.doc.lastRunId).toBe(reviewable[0].id);
    expect(runs.find((r) => r.id !== reviewable[0].id)!.status).toBe('superseded');
  });
});
