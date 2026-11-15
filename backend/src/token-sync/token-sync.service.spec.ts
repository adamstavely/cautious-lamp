import { ConflictException, ForbiddenException, UnprocessableEntityException } from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { EncryptionService } from '../common/security/encryption.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { createDesignSystemService } from '../design-system/testing/in-memory-stores';
import { DesignToolReader } from '../design-tools/design-tool-reader';
import { DesignToolHttp, publicJsonHttp } from '../design-tools/design-tool-http';
import { SyncRun, SyncRunLog } from '../design-tools/sync-runs';
import { FIGMA_KEY, FIGMA_PLAN_ERROR, PENPOT_FILE, figmaFixture } from '../design-tools/testing/fake-design-tools';
import { Permission } from '../rbac/rbac.service';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { TokenSyncConnection, TokenSyncService } from './token-sync.service';

const person = (id: string, permissions: Permission[] = []): AuthPrincipal => ({
  type: 'user',
  id,
  email: `${id}@example.com`,
  name: id,
  roles: [],
  permissions: new Set(permissions),
  mustChangePassword: false,
});

const TOKEN_WRITER = [Permission.TOKEN_CREATE, Permission.TOKEN_EDIT, Permission.TOKEN_DELETE];
const alice = person('usr_alice', TOKEN_WRITER);
const viewer = person('usr_viewer');
const bob = person('usr_bob', TOKEN_WRITER);

describe('Token sync', () => {
  let designSystem: DesignSystemService;
  let fixture: ReturnType<typeof figmaFixture>;
  let runStore: InMemoryStore<SyncRun>;
  let connections: InMemoryStore<TokenSyncConnection>;
  let service: TokenSyncService;

  const build = (http: DesignToolHttp = fixture.http) => new TokenSyncService(designSystem, new EncryptionService(), connections, new DesignToolReader(http), new SyncRunLog(runStore));

  beforeEach(async () => {
    designSystem = await createDesignSystemService();
    fixture = figmaFixture();
    runStore = new InMemoryStore();
    connections = new InMemoryStore();
    service = build();
  });

  const connect = (owner = alice, extra: Record<string, unknown> = {}) =>
    service.createConnection(owner, { name: 'Acme Figma', tool: 'figma', fileId: FIGMA_KEY, apiKey: 'figd_test', ...extra });
  const item = (run: SyncRun, id: string) => run.tokenItems!.find((i) => i.id === id);

  it('pulls the file and diffs it against the current tokens without writing any', async () => {
    const conn = await connect(viewer);
    const before = designSystem.getAllTokens();
    const run = await service.syncTokens(viewer, conn.id);

    expect(run).toMatchObject({ kind: 'tokens', status: 'review', trigger: 'manual', fileName: 'Acme design system', fileVersion: '42', startedBy: { id: viewer.id } });
    // color.primary and spacing.md (16px = 1rem) already match the seeded tokens
    expect(item(run, 'color.primary')).toBeUndefined();
    expect(item(run, 'spacing.md')).toBeUndefined();
    expect(item(run, 'border.radius.sm')).toMatchObject({ kind: 'changed', codeValue: '0.25rem', designValue: '6px', defaultChoice: 'take-design' });
    expect(item(run, 'color.brand.accent')).toMatchObject({ kind: 'added', designValue: '#ff8000' });
    expect(item(run, 'color.link')).toMatchObject({ kind: 'added', designValue: '{color.primary}' });
    expect(run.counts).toMatchObject({ unchanged: 2, removed: 0 });
    expect(run.counts.added).toBeGreaterThan(0);
    expect(designSystem.getAllTokens()).toEqual(before);
  });

  it('applies chosen changes through the token writes, and records who applied what', async () => {
    const conn = await connect();
    const run = await service.syncTokens(alice, conn.id);
    const applied = await service.applyRun(alice, run.id, {
      choices: { 'border.radius.sm': 'take-design', 'color.brand.accent': 'take-design', 'color.link': 'skip' },
    });

    expect(designSystem.getTokenByName('border.radius.sm')?.value).toBe('6px');
    expect(designSystem.getTokenByName('color.brand.accent')).toMatchObject({ value: '#ff8000', type: 'color', category: 'colors', description: 'Accent colour', tags: ['design-sync'] });
    expect(designSystem.getTokenByName('color.link')).toBeUndefined();
    expect(applied.status).toBe('applied');
    expect(applied.applied).toMatchObject({ by: { id: alice.id }, counts: { skipped: expect.any(Number), failed: 0 } });
    expect(applied.applied!.results).toEqual(expect.arrayContaining([{ id: 'color.link', choice: 'skip', outcome: 'skipped' }]));

    // History: the stored run, and the connection's last sync
    const history = await service.listRuns(alice, conn.id);
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ id: run.id, status: 'applied', startedBy: { id: alice.id }, applied: { by: { id: alice.id } } });
    expect(history[0]).not.toHaveProperty('tokenItems');
    expect(await service.getConnection(alice, conn.id)).toMatchObject({ lastSync: expect.any(String), lastSyncVersion: '42', lastRunId: run.id });
    expect(await service.getConnection(alice, conn.id)).not.toHaveProperty('baseline');
  });

  it('refuses to apply without the token permissions the chosen changes need', async () => {
    const conn = await connect(viewer);
    const run = await service.syncTokens(viewer, conn.id);
    await expect(service.applyRun(viewer, run.id, { choices: { 'border.radius.sm': 'take-design' } })).rejects.toThrow(ForbiddenException);
    const editorOnly = { ...viewer, permissions: new Set([Permission.TOKEN_EDIT]) } as AuthPrincipal;
    // Edits are allowed, but the added tokens (default take-design) need token:create
    await expect(service.applyRun(editorOnly, run.id, {})).rejects.toThrow(/token:create/);
    expect(designSystem.getTokenByName('border.radius.sm')?.value).toBe('0.25rem');
    // Skipping everything that needs a permission is fine
    const skipAll = Object.fromEntries(run.tokenItems!.map((i) => [i.id, 'skip']));
    expect((await service.applyRun(viewer, run.id, { choices: skipAll })).status).toBe('applied');
  });

  it("keeps runs to the connection's owner", async () => {
    const conn = await connect();
    const run = await service.syncTokens(alice, conn.id);
    await expect(service.getRun(bob, run.id)).rejects.toThrow(/not found/);
    await expect(service.applyRun(bob, run.id, {})).rejects.toThrow(/not found/);
    await expect(service.listRuns(bob, conn.id)).rejects.toThrow(/not found/);
  });

  it('honours keep-code, take-design and skip on conflicts, and remembers the choice', async () => {
    const conn = await connect();
    // First sync: take the design radius, so both sides agree on 6px
    const first = await service.syncTokens(alice, conn.id);
    await service.applyRun(alice, first.id, { choices: { 'border.radius.sm': 'take-design' } });

    // Then both sides move: code to 5px, design to 8px
    await designSystem.updateToken('border.radius.sm', { value: '5px' });
    (fixture.variables.body.meta.variables['V:4'] as any).valuesByMode.m1 = 8;
    const second = await service.syncTokens(alice, conn.id);
    expect(item(second, 'border.radius.sm')).toMatchObject({ kind: 'conflict', codeValue: '5px', designValue: '8px', baselineValue: '6px', defaultChoice: 'skip' });

    // Skip leaves it, and the next pull raises it again
    await service.applyRun(alice, second.id, { choices: { 'border.radius.sm': 'skip' } });
    expect(designSystem.getTokenByName('border.radius.sm')?.value).toBe('5px');
    const third = await service.syncTokens(alice, conn.id);
    expect(item(third, 'border.radius.sm')?.kind).toBe('conflict');

    // Keep code: code stays, and the design value isn't proposed again
    await service.applyRun(alice, third.id, { choices: { 'border.radius.sm': 'keep-code' } });
    expect(designSystem.getTokenByName('border.radius.sm')?.value).toBe('5px');
    const fourth = await service.syncTokens(alice, conn.id);
    expect(item(fourth, 'border.radius.sm')).toBeUndefined();

    // A later design change is proposed again, and take-design writes it
    (fixture.variables.body.meta.variables['V:4'] as any).valuesByMode.m1 = 10;
    const fifth = await service.syncTokens(alice, conn.id);
    expect(item(fifth, 'border.radius.sm')).toMatchObject({ kind: 'changed', defaultChoice: 'take-design' });
    await service.applyRun(alice, fifth.id, { choices: { 'border.radius.sm': 'take-design' } });
    expect(designSystem.getTokenByName('border.radius.sm')?.value).toBe('10px');
  });

  it('only deletes a token removed from the design file when someone chooses to', async () => {
    const conn = await connect();
    const first = await service.syncTokens(alice, conn.id);
    await service.applyRun(alice, first.id, {});
    expect(designSystem.getTokenByName('color.brand.accent')).toBeDefined();

    delete fixture.file.styles['S:fill1'];
    const second = await service.syncTokens(alice, conn.id);
    expect(item(second, 'color.brand.accent')).toMatchObject({ kind: 'removed', defaultChoice: 'skip' });
    await service.applyRun(alice, second.id, {});
    expect(designSystem.getTokenByName('color.brand.accent')).toBeDefined();

    const third = await service.syncTokens(alice, conn.id);
    await expect(service.applyRun(viewer, third.id, { choices: { 'color.brand.accent': 'take-design' } })).rejects.toThrow(/not found/);
    await service.applyRun(alice, third.id, { choices: { 'color.brand.accent': 'take-design' } });
    expect(designSystem.getTokenByName('color.brand.accent')).toBeUndefined();
  });

  it("doesn't overwrite a token changed in code after the diff was made", async () => {
    const conn = await connect();
    const run = await service.syncTokens(alice, conn.id);
    await designSystem.updateToken('border.radius.sm', { value: '3px' });
    const applied = await service.applyRun(alice, run.id, { choices: { 'border.radius.sm': 'take-design' } });
    expect(applied.status).toBe('partial');
    expect(applied.applied!.results.find((r) => r.id === 'border.radius.sm')).toMatchObject({ outcome: 'failed', error: expect.stringMatching(/Changed in code/) });
    expect(designSystem.getTokenByName('border.radius.sm')?.value).toBe('3px');
  });

  it('applies a diff once, and only the latest pull', async () => {
    const conn = await connect();
    const older = await service.syncTokens(alice, conn.id);
    const newer = await service.syncTokens(alice, conn.id);
    await expect(service.applyRun(alice, older.id, {})).rejects.toThrow(/newer pull/);
    await service.applyRun(alice, newer.id, {});
    await expect(service.applyRun(alice, newer.id, {})).rejects.toThrow(ConflictException);
  });

  it('rejects choices that are not in the diff or not allowed for the item', async () => {
    const conn = await connect();
    const run = await service.syncTokens(alice, conn.id);
    await expect(service.applyRun(alice, run.id, { choices: { 'color.nope': 'skip' } })).rejects.toThrow(/not an item/);
    await expect(service.applyRun(alice, run.id, { choices: { 'color.brand.accent': 'keep-code' } })).rejects.toThrow(/take-design, skip/);
    await expect(service.applyRun(alice, run.id, { choices: { 'border.radius.sm': 'merge' } })).rejects.toThrow(/choose one of/);
  });

  it('records a failed run and answers 422 with the reason when the file cannot be read', async () => {
    const conn = await connect(alice, { apiKey: 'figd_wrong' });
    await expect(service.syncTokens(alice, conn.id)).rejects.toThrow(UnprocessableEntityException);
    const [failed] = await service.listRuns(alice, conn.id);
    expect(failed).toMatchObject({ status: 'failed', error: expect.stringMatching(/Figma refused the access token/) });
  });

  it("surfaces the variables plan error on the run and still diffs the styles", async () => {
    Object.assign(fixture.variables, FIGMA_PLAN_ERROR);
    const conn = await connect();
    const run = await service.syncTokens(alice, conn.id);
    expect(run.variables).toMatchObject({ status: 'unavailable', message: expect.stringMatching(/Limited by Figma plan.*Enterprise/) });
    expect(run.warnings).toContain(run.variables!.message);
    expect(item(run, 'color.brand.accent')).toBeDefined();
    expect(item(run, 'border.radius.sm')).toBeUndefined();
  });

  it('refuses a design tool on a private address (egress)', async () => {
    service = build(publicJsonHttp({ timeoutMs: 2000 }));
    const conn = await service.createConnection(alice, { name: 'Local Penpot', tool: 'penpot', fileId: PENPOT_FILE, fileUrl: 'http://127.0.0.1:9001/', apiKey: 'penpot_test' });
    await expect(service.syncTokens(alice, conn.id)).rejects.toThrow(/Refused to contact 127\.0\.0\.1:9001/);
  });

  it('says why Adobe XD connections saved earlier cannot sync', async () => {
    const conn = await connect();
    const stored = connections.docs.get(conn.id)!;
    stored.doc.tool = 'adobe-xd';
    await expect(service.syncTokens(alice, conn.id)).rejects.toThrow(/Adobe XD is not supported/);
    await expect(service.createConnection(alice, { name: 'XD', tool: 'adobe-xd' })).rejects.toThrow(/tool must be one of figma, penpot/);
  });

  describe('auto-sync', () => {
    it('pulls due connections on a schedule into diffs for review, never applying them', async () => {
      const conn = await connect();
      await service.enableAutoSync(alice, conn.id, { intervalHours: 6 });
      const now = new Date(Date.now() + 1000);

      expect(await service.runDueAutoSyncs(now)).toBe(1);
      const [run] = await service.listRuns(alice, conn.id);
      expect(run).toMatchObject({ status: 'review', trigger: 'scheduled', startedBy: { type: 'service' } });
      expect(designSystem.getTokenByName('border.radius.sm')?.value).toBe('0.25rem');
      expect(designSystem.getTokenByName('color.brand.accent')).toBeUndefined();

      // Not due again until the interval has passed, and only one instance claims it
      expect(await service.runDueAutoSyncs(now)).toBe(0);
      const later = new Date(now.getTime() + 6 * 60 * 60 * 1000 + 1);
      const [a, b] = await Promise.all([service.runDueAutoSyncs(later), build().runDueAutoSyncs(later)]);
      expect(a + b).toBe(1);

      expect(await service.getConnection(alice, conn.id)).toMatchObject({ autoSync: true, syncIntervalHours: 6 });
      await service.disableAutoSync(alice, conn.id);
      expect(await service.runDueAutoSyncs(new Date(later.getTime() + 7 * 60 * 60 * 1000))).toBe(0);
    });

    it('skips disabled connections', async () => {
      const conn = await connect(alice, { autoSync: true, enabled: false });
      expect(await service.getConnection(alice, conn.id)).toMatchObject({ autoSync: true });
      expect(await service.runDueAutoSyncs(new Date(Date.now() + 1000))).toBe(0);
    });
  });
});
