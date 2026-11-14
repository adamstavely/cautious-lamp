import { InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { EsDocumentStore, LIST_PAGE_SIZE, VersionConflictError } from './document-store';
import { InMemoryStore } from './testing/in-memory-store';

function esError(statusCode?: number, type?: string) {
  return Object.assign(new Error(type ?? 'es error'), statusCode ? { meta: { statusCode, body: { error: { type } } } } : {});
}

function setup() {
  const es = {
    get: jest.fn(),
    index: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    search: jest.fn(),
    openPointInTime: jest.fn().mockResolvedValue({ id: 'pit-1' }),
    closePointInTime: jest.fn().mockResolvedValue({ succeeded: true }),
    indices: { exists: jest.fn().mockResolvedValue(false), create: jest.fn().mockResolvedValue({}) },
  };
  const esIndex = { assertAvailable: jest.fn().mockResolvedValue(undefined) };
  const store = new EsDocumentStore<{ id: string; n?: number }>(es as any, esIndex as any, 'reviews', { id: { type: 'keyword' } });
  return { es, esIndex, store };
}

describe('EsDocumentStore', () => {
  it('reads documents with their sequence number and primary term', async () => {
    const { es, store } = setup();
    es.get.mockResolvedValue({ _source: { id: 'a' }, _seq_no: 7, _primary_term: 2 });
    expect(await store.get('a')).toEqual({ doc: { id: 'a' }, version: { seqNo: 7, primaryTerm: 2 } });
    es.get.mockRejectedValue(esError(404));
    expect(await store.get('a')).toBeNull();
  });

  it('writes with if_seq_no/if_primary_term and wait_for refresh, and maps 409 to a version conflict', async () => {
    const { es, store } = setup();
    await store.replace({ id: 'a', n: 1 }, { seqNo: 7, primaryTerm: 2 });
    expect(es.index).toHaveBeenCalledWith(
      expect.objectContaining({ index: 'reviews', id: 'a', if_seq_no: 7, if_primary_term: 2, refresh: 'wait_for' }),
    );
    es.index.mockRejectedValueOnce(esError(409));
    await expect(store.replace({ id: 'a' }, { seqNo: 7, primaryTerm: 2 })).rejects.toBeInstanceOf(VersionConflictError);
  });

  it('creates the index once with dynamic mapping off', async () => {
    const { es, store } = setup();
    await store.create({ id: 'a' });
    await store.create({ id: 'b' });
    expect(es.indices.create).toHaveBeenCalledTimes(1);
    expect(es.indices.create).toHaveBeenCalledWith(
      expect.objectContaining({ index: 'reviews', mappings: expect.objectContaining({ dynamic: false }) }),
    );
    expect(es.index).toHaveBeenCalledWith(expect.objectContaining({ op_type: 'create', refresh: 'wait_for' }));
  });

  it('tolerates a concurrent index creation', async () => {
    const { es, store } = setup();
    es.indices.create.mockRejectedValue(esError(400, 'resource_already_exists_exception'));
    await expect(store.create({ id: 'a' })).resolves.toBeUndefined();
  });

  it('lists an empty result when the index does not exist', async () => {
    const { es, store } = setup();
    es.openPointInTime.mockRejectedValue(esError(404, 'index_not_found_exception'));
    expect(await store.list()).toEqual([]);
    expect(es.closePointInTime).not.toHaveBeenCalled();
  });

  it('lists past 10,000 documents by paging a point in time with search_after, then closes it', async () => {
    const { es, store } = setup();
    const total = 10 * LIST_PAGE_SIZE + 7;
    const docs = Array.from({ length: total }, (_, n) => ({ id: `d${n}` }));
    es.search.mockImplementation(async (req: any) => {
      const start = req.search_after ? req.search_after[1] + 1 : 0;
      const page = docs.slice(start, start + req.size);
      return {
        pit_id: `pit-${start}`,
        hits: { hits: page.map((doc, i) => ({ _source: doc, sort: ['2026-01-01', start + i] })) },
      };
    });
    const listed = await store.list({ excludes: ['big'] });
    expect(listed).toHaveLength(total);
    expect(new Set(listed.map((d) => d.id)).size).toBe(total);
    expect(es.search).toHaveBeenCalledTimes(11);
    const first = es.search.mock.calls[0][0];
    expect(first).toMatchObject({ pit: { id: 'pit-1' }, _source_excludes: ['big'] });
    expect(first.index).toBeUndefined();
    expect(first.sort).toEqual([{ createdAt: { order: 'desc', unmapped_type: 'date' } }, { _shard_doc: 'asc' }]);
    // Each page continues from the last hit, with the PIT id the previous response returned
    expect(es.search.mock.calls[1][0]).toMatchObject({ pit: { id: 'pit-0' }, search_after: ['2026-01-01', LIST_PAGE_SIZE - 1] });
    expect(es.closePointInTime).toHaveBeenCalledWith({ id: `pit-${10 * LIST_PAGE_SIZE}` });
  });

  it('filters in the query: terms on mapped fields and strict lower bounds on dates', async () => {
    const { es, store } = setup();
    es.search.mockResolvedValue({ hits: { hits: [] } });
    await store.list({ where: { workflowState: 'draft', completed: false }, after: { expiresAt: '2026-01-01T00:00:00.000Z' } });
    expect(es.search.mock.calls[0][0].query).toEqual({
      bool: {
        filter: [
          { term: { workflowState: 'draft' } },
          { term: { completed: false } },
          { range: { expiresAt: { gt: '2026-01-01T00:00:00.000Z' } } },
        ],
      },
    });
  });

  it('closes the point in time when a page fails', async () => {
    const { es, store } = setup();
    es.search.mockRejectedValue(esError(503));
    await expect(store.list()).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(es.closePointInTime).toHaveBeenCalledWith({ id: 'pit-1' });
  });

  it('maps outages to 503 and never reports success', async () => {
    const { es, esIndex, store } = setup();
    es.search.mockRejectedValue(esError(undefined));
    await expect(store.list()).rejects.toBeInstanceOf(ServiceUnavailableException);
    es.search.mockRejectedValue(Object.assign(new Error('connect ECONNREFUSED'), { meta: { statusCode: 0 } }));
    await expect(store.list()).rejects.toBeInstanceOf(ServiceUnavailableException);
    es.get.mockRejectedValue(esError(503));
    await expect(store.get('a')).rejects.toBeInstanceOf(ServiceUnavailableException);
    es.delete.mockRejectedValue(esError(400));
    await expect(store.delete('a')).rejects.toBeInstanceOf(InternalServerErrorException);
    esIndex.assertAvailable.mockRejectedValue(new ServiceUnavailableException());
    await expect(store.create({ id: 'a' })).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(es.index).not.toHaveBeenCalled();
  });

  it('returns false when deleting a missing document', async () => {
    const { es, store } = setup();
    es.delete.mockRejectedValue(esError(404));
    expect(await store.delete('a')).toBe(false);
  });
});

describe('InMemoryStore.list (the test double)', () => {
  it('applies the same filters, order and excludes as Elasticsearch', async () => {
    const store = new InMemoryStore<{ id: string; createdAt: string; state: string; tags?: string[]; big?: string }>();
    await store.create({ id: 'old', createdAt: '2026-01-01T00:00:00Z', state: 'draft', tags: ['a'], big: 'x' });
    await store.create({ id: 'new', createdAt: '2026-02-01T00:00:00Z', state: 'draft', tags: ['b'] });
    await store.create({ id: 'other', createdAt: '2026-03-01T00:00:00Z', state: 'approved' });
    expect((await store.list()).map((d) => d.id)).toEqual(['other', 'new', 'old']);
    expect((await store.list({ where: { state: 'draft' } })).map((d) => d.id)).toEqual(['new', 'old']);
    expect((await store.list({ where: { tags: 'a' } })).map((d) => d.id)).toEqual(['old']);
    expect((await store.list({ after: { createdAt: '2026-02-01T00:00:00Z' } })).map((d) => d.id)).toEqual(['other']);
    expect((await store.list({ excludes: ['big'] })).find((d) => d.id === 'old')).not.toHaveProperty('big');
  });
});
