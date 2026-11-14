import { LIST_PAGE_SIZE } from '../reviews/document-store';
import { EsQueryableStore } from './queryable-store';

describe('EsQueryableStore.findAny', () => {
  it('returns every match past 10,000 by paging a point in time, not one capped search', async () => {
    const total = 10 * LIST_PAGE_SIZE + 3;
    const docs = Array.from({ length: total }, (_, n) => ({ id: `r${n}`, workspaceId: 'ws_1' }));
    const es = {
      openPointInTime: jest.fn().mockResolvedValue({ id: 'pit-1' }),
      closePointInTime: jest.fn().mockResolvedValue({ succeeded: true }),
      search: jest.fn(async (req: any) => {
        const start = req.search_after ? req.search_after[1] + 1 : 0;
        const page = docs.slice(start, start + req.size);
        return { pit_id: `pit-${start}`, hits: { hits: page.map((doc, i) => ({ _source: doc, sort: ['2026-01-01', start + i] })) } };
      }),
    };
    const store = new EsQueryableStore<{ id: string; workspaceId: string }>(es as any, {} as any, 'workspace-resources', {});

    const found = await store.findAny([{ workspaceId: 'ws_1' }, { sharedWith: 'ws_1', isGlobal: true }]);

    expect(found).toHaveLength(total);
    expect(es.search).toHaveBeenCalledTimes(11);
    expect(es.search.mock.calls[0][0].query).toEqual({
      bool: {
        should: [
          { bool: { filter: [{ term: { workspaceId: 'ws_1' } }] } },
          { bool: { filter: [{ term: { sharedWith: 'ws_1' } }, { term: { isGlobal: true } }] } },
        ],
        minimum_should_match: 1,
      },
    });
    expect(es.closePointInTime).toHaveBeenCalled();
  });

  it('treats a missing index as no documents', async () => {
    const es = { openPointInTime: jest.fn().mockRejectedValue(Object.assign(new Error('index_not_found_exception'), { meta: { statusCode: 404 } })) };
    const store = new EsQueryableStore<{ id: string }>(es as any, {} as any, 'workspace-resources', {});
    expect(await store.findAny([{ workspaceId: 'ws_1' }])).toEqual([]);
  });
});
