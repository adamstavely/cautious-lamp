import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { Permission } from '../rbac/rbac.service';
import { InMemoryQueryableStore } from '../workspaces/testing/in-memory-queryable-store';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { WorkspaceDoc } from '../workspaces/workspace.types';
import { ColorPaletteService } from './color-palette.service';
import { ColorTheoryService } from './color-theory.service';

const user = (id: string, permissions: string[] = []) =>
  ({ type: 'user', id, email: `${id}@example.com`, name: id, roles: [], permissions: new Set(permissions), mustChangePassword: false }) as unknown as AuthPrincipal;

const owner = user('usr_owner');
const stranger = user('usr_stranger');
const editor = user('usr_editor');
const viewer = user('usr_viewer');
const admin = user('usr_admin', [Permission.ADMIN_USERS]);

/** Just enough of the Elasticsearch client: documents with sequence numbers and compare-and-swap writes */
function fakeElasticsearch() {
  const docs = new Map<string, { source: any; seqNo: number }>();
  let seq = 0;
  let ids = 0;
  const notFound = () => Object.assign(new Error('not found'), { meta: { statusCode: 404 } });
  const conflict = () => Object.assign(new Error('conflict'), { meta: { statusCode: 409 } });
  return {
    docs,
    async get({ id }: { id: string }) {
      const doc = docs.get(id);
      if (!doc) throw notFound();
      return { _id: id, _source: structuredClone(doc.source), _seq_no: doc.seqNo, _primary_term: 1 };
    },
    async index({ id, document, if_seq_no }: { id?: string; document: any; if_seq_no?: number }) {
      const key = id ?? `pal_${++ids}`;
      if (if_seq_no !== undefined && docs.get(key)?.seqNo !== if_seq_no) throw conflict();
      docs.set(key, { source: structuredClone(document), seqNo: ++seq });
      return { _id: key };
    },
    async delete({ id, if_seq_no }: { id: string; if_seq_no?: number }) {
      if (!docs.has(id)) throw notFound();
      if (if_seq_no !== undefined && docs.get(id)!.seqNo !== if_seq_no) throw conflict();
      docs.delete(id);
    },
    async search() {
      return { hits: { hits: [...docs.entries()].map(([id, doc]) => ({ _id: id, _source: structuredClone(doc.source) })) } };
    },
  };
}

function setup() {
  const es = fakeElasticsearch();
  const workspaces = new InMemoryQueryableStore<WorkspaceDoc>();
  workspaces.forceWrite({
    id: 'ws_design',
    name: 'Design',
    members: [
      { userId: 'usr_editor', email: 'e@example.com', name: 'editor', role: 'editor' },
      { userId: 'usr_viewer', email: 'v@example.com', name: 'viewer', role: 'viewer' },
      { userId: 'usr_owner', email: 'o@example.com', name: 'owner', role: 'editor' },
    ],
    memberIds: ['usr_editor', 'usr_viewer', 'usr_owner'],
  } as unknown as WorkspaceDoc);
  const service = new ColorPaletteService(es as any, new ColorTheoryService(), { assertAvailable: async () => undefined } as any, new WorkspaceAccessService(workspaces));
  return { es, service };
}

const content = { name: 'Brand', colors: [{ hex: '#112233' }] };

describe('ColorPaletteService ownership', () => {
  it('records the creator as owner and lets only them (or an admin) change a personal palette', async () => {
    const { service, es } = setup();
    const created = await service.createPalette(owner, content);
    expect(created).toMatchObject({ owner: { type: 'user', id: 'usr_owner' }, workspaceId: null, canEdit: true });
    expect(es.docs.get(created.id)!.source.owner).toEqual({ type: 'user', id: 'usr_owner', name: 'usr_owner' });

    await expect(service.updatePalette(stranger, created.id, { ...content, name: 'Hijacked' })).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.deletePalette(stranger, created.id)).rejects.toBeInstanceOf(ForbiddenException);
    expect((await service.getPalette(stranger, created.id)).canEdit).toBe(false);

    expect(await service.updatePalette(owner, created.id, { ...content, name: 'Brand 2' })).toMatchObject({ name: 'Brand 2', owner: { id: 'usr_owner' } });
    expect(await service.updatePalette(admin, created.id, { ...content, name: 'Brand 3' })).toMatchObject({ name: 'Brand 3', owner: { id: 'usr_owner' } });
    await service.deletePalette(owner, created.id);
    await expect(service.getPalette(owner, created.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it("lets the workspace's editors change a workspace palette, but not its viewers", async () => {
    const { service } = setup();
    const created = await service.createPalette(owner, { ...content, workspaceId: 'ws_design' });
    expect(created.workspaceId).toBe('ws_design');
    expect(await service.updatePalette(editor, created.id, { ...content, name: 'Team' })).toMatchObject({ name: 'Team' });
    await expect(service.updatePalette(viewer, created.id, content)).rejects.toBeInstanceOf(ForbiddenException);
    expect((await service.getAllPalettes(viewer)).map((p) => p.canEdit)).toEqual([false]);
    await service.deletePalette(editor, created.id);
  });

  it('only saves into a workspace where the creator is an editor', async () => {
    const { service } = setup();
    await expect(service.createPalette(viewer, { ...content, workspaceId: 'ws_design' })).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.createPalette(stranger, { ...content, workspaceId: 'ws_design' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('leaves palettes saved before owners existed to admins', async () => {
    const { service, es } = setup();
    es.docs.set('legacy', { source: { name: 'Old', colors: [], createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' }, seqNo: 1 });
    expect(await service.getPalette(owner, 'legacy')).toMatchObject({ owner: null, workspaceId: null, canEdit: false });
    await expect(service.updatePalette(owner, 'legacy', content)).rejects.toThrow(/only an admin/);
    await expect(service.deletePalette(owner, 'legacy')).rejects.toBeInstanceOf(ForbiddenException);
    expect(await service.updatePalette(admin, 'legacy', content)).toMatchObject({ name: 'Brand', owner: null });
  });
});
