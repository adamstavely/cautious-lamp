import { InMemoryStore } from '../../reviews/testing/in-memory-store';
import { QueryableStore, TermClause, matchesClause } from '../queryable-store';

/** In-memory QueryableStore for tests, with the same compare-and-swap semantics as Elasticsearch */
export class InMemoryQueryableStore<T extends { id: string }> extends InMemoryStore<T> implements QueryableStore<T> {
  async findAny(clauses: TermClause[]): Promise<T[]> {
    const all = await this.list();
    return all.filter((doc) => clauses.some((clause) => matchesClause(doc as unknown as Record<string, unknown>, clause)));
  }
}
