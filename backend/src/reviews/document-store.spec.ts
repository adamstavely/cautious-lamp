import { InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { EsDocumentStore, VersionConflictError } from './document-store';

function esError(statusCode?: number, type?: string) {
  return Object.assign(new Error(type ?? 'es error'), statusCode ? { meta: { statusCode, body: { error: { type } } } } : {});
}

function setup() {
  const es = {
    get: jest.fn(),
    index: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    search: jest.fn(),
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
    es.search.mockRejectedValue(esError(404, 'index_not_found_exception'));
    expect(await store.list()).toEqual([]);
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
