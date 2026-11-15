import { AuthPrincipal } from '../auth/principal';
import { EncryptionService } from '../common/security/encryption.service';
import { DesignSyncConnection, DesignSyncService } from '../design-sync/design-sync.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { DesignToolReader } from '../design-tools/design-tool-reader';
import { SyncRunLog } from '../design-tools/sync-runs';
import { stubHttp } from '../design-tools/testing/fake-design-tools';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { TokenSyncConnection, TokenSyncService } from './token-sync.service';

const alice: AuthPrincipal = { type: 'user', id: 'usr_alice', email: 'alice@example.com', name: 'alice', roles: [], permissions: new Set(), mustChangePassword: false };
const SECRET = 'figd_secret_value';

describe('Saved sync connections', () => {
  const encryption = new EncryptionService();
  const designSystem = { getAllTokens: () => [], getAllComponents: () => [] } as unknown as DesignSystemService;
  const reader = new DesignToolReader(stubHttp(() => undefined));
  const runs = new SyncRunLog(new InMemoryStore());
  const tokenSync = (store: InMemoryStore<TokenSyncConnection>) => new TokenSyncService(designSystem, encryption, store, reader, runs);
  const designSync = (store: InMemoryStore<DesignSyncConnection>) => new DesignSyncService(encryption, store, designSystem, reader, runs);

  it('keeps token sync connections across a restart, with the key encrypted at rest', async () => {
    const store = new InMemoryStore<TokenSyncConnection>();
    const created = await tokenSync(store).createConnection(alice, { name: 'Tokens', tool: 'figma', fileId: 'f1', apiKey: SECRET });

    const raw = JSON.stringify([...store.docs.values()]);
    expect(raw).not.toContain(SECRET);
    expect(encryption.isEncrypted(store.docs.get(created.id)!.doc.apiKey!)).toBe(true);

    const restarted = tokenSync(store);
    expect(await restarted.getAllConnections(alice)).toEqual([created]);
    const registry = (restarted as unknown as { registry: { require: Function; credential: Function } }).registry;
    expect(registry.credential(await registry.require(alice, created.id))).toBe(SECRET);
  });

  it('keeps design sync connections and their edits across a restart', async () => {
    const store = new InMemoryStore<DesignSyncConnection>();
    const before = designSync(store);
    const created = await before.createConnection(alice, { name: 'Figma', tool: 'figma', fileId: 'f1', apiKey: SECRET });
    await before.updateConnection(alice, created.id, { name: 'Renamed', apiKey: 'figd_rotated' });
    expect(JSON.stringify([...store.docs.values()])).not.toMatch(/figd_/);

    const after = designSync(store);
    expect(await after.getConnection(alice, created.id)).toMatchObject({ name: 'Renamed', hasApiKey: true, owner: { id: alice.id } });
    await after.deleteConnection(alice, created.id);
    expect(await designSync(store).getAllConnections(alice)).toEqual([]);
  });
});
