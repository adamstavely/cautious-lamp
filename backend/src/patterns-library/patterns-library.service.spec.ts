import { SeedMarker } from '../common/elasticsearch/seed-defaults';
import { InMemoryStore } from '../reviews/testing/in-memory-store';
import { DEFAULT_PATTERNS } from './default-patterns';
import { ComponentPattern, PatternsLibraryService } from './patterns-library.service';

/** One Elasticsearch "cluster": a new service on the same stores is a restart */
function cluster() {
  const store = new InMemoryStore<ComponentPattern>();
  const meta = new InMemoryStore<SeedMarker>();
  return { store, meta, start: () => new PatternsLibraryService(store, meta) };
}

describe('PatternsLibraryService', () => {
  it('seeds the default patterns once, under unique stable ids', async () => {
    const { store, start } = cluster();
    const patterns = await start().getAllPatterns();
    expect(patterns.map((p) => p.name).sort()).toEqual(DEFAULT_PATTERNS.map((p) => p.name).sort());
    const ids = patterns.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('pattern-button-with-icon');
    expect(patterns.every((p) => p.status === 'production')).toBe(true);

    await start().getAllPatterns();
    expect(store.docs.size).toBe(DEFAULT_PATTERNS.length);
  });

  it('keeps patterns, their status and edits across a restart', async () => {
    const { start } = cluster();
    const before = start();
    const created = await before.createPattern({ name: 'Stepper', description: 'Steps', category: 'common', status: 'planned', tags: ['wizard'] });
    await before.updatePattern('pattern-inline-styles', { status: 'deprecated', description: 'Never' });

    const after = start();
    expect(await after.getPattern(created.id)).toMatchObject({ name: 'Stepper', status: 'planned', tags: ['wizard'] });
    expect(await after.getPattern('pattern-inline-styles')).toMatchObject({ status: 'deprecated', description: 'Never' });
    expect((await after.getAllPatterns({ tags: ['wizard'] })).map((p) => p.id)).toEqual([created.id]);
  });

  it('does not bring back a deleted default after a restart', async () => {
    const { start } = cluster();
    expect(await start().deletePattern('pattern-lazy-loading-images')).toBe(true);
    const after = start();
    expect(await after.getPattern('pattern-lazy-loading-images')).toBeNull();
    expect((await after.getAllPatterns()).map((p) => p.name)).not.toContain('Lazy Loading Images');
  });

  it('carries on a seed that stopped part way, without duplicating what was written', async () => {
    const { store, meta, start } = cluster();
    const create = store.create.bind(store);
    let writes = 0;
    store.create = async (doc) => {
      if (++writes === 3) throw new Error('Elasticsearch went away');
      return create(doc);
    };
    await expect(start().getAllPatterns()).rejects.toThrow('Elasticsearch went away');
    expect(store.docs.size).toBe(2);
    expect(await meta.get('default-patterns-seeded-v1')).toBeNull();

    store.create = create;
    const patterns = await start().getAllPatterns();
    expect(patterns).toHaveLength(DEFAULT_PATTERNS.length);
    expect(await meta.get('default-patterns-seeded-v1')).not.toBeNull();
  });

  it('gives every new pattern its own id, even created at the same moment', async () => {
    const service = cluster().start();
    const created = await Promise.all(Array.from({ length: 50 }, (_, i) => service.createPattern({ name: `P${i}`, description: 'd', category: 'common' })));
    const ids = [...created.map((p) => p.id), ...DEFAULT_PATTERNS.map((p) => p.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('never lets an update change the id or creation time', async () => {
    const service = cluster().start();
    const before = (await service.getPattern('pattern-form-validation'))!;
    const updated = await service.updatePattern('pattern-form-validation', { id: 'other', createdAt: '2000-01-01' } as never);
    expect(updated).toMatchObject({ id: 'pattern-form-validation', createdAt: before.createdAt });
    expect(await service.getPattern('other')).toBeNull();
  });

  it('returns related patterns that still exist', async () => {
    const service = cluster().start();
    const p = await service.createPattern({ name: 'Card', description: 'd', category: 'composition', relatedPatterns: ['pattern-component-composition', 'pattern-gone'] });
    expect((await service.getRelatedPatterns(p.id)).map((r) => r.id)).toEqual(['pattern-component-composition']);
  });
});
