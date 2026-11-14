import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService } from '../common/elasticsearch/es-index.service';
import { DocVersion, DocumentStore, EsDocumentStore, StoredDoc } from '../reviews/document-store';

/** Term values a clause can match on (keyword or boolean fields) */
export type TermValue = string | boolean;

/**
 * One clause of a `findAny` query: every field must match. A field holding an
 * array matches when any element equals the value (like an Elasticsearch term query).
 */
export type TermClause = Record<string, TermValue>;

/**
 * A DocumentStore that can also find documents by exact field values. Used by
 * the workspaces and applications modules, which need "everything in this
 * workspace" without reading the whole index.
 */
export interface QueryableStore<T extends { id: string }> extends DocumentStore<T> {
  /** Documents matching at least one clause. Fields must be mapped as keyword or boolean. */
  findAny(clauses: TermClause[]): Promise<T[]>;
}

/**
 * Elasticsearch store: get/create/replace/delete/list from the reviews
 * module's EsDocumentStore (optimistic concurrency, `refresh: wait_for`), plus
 * term queries. The index has `dynamic: false`, so only the mapped fields are searchable.
 */
export class EsQueryableStore<T extends { id: string }> implements QueryableStore<T> {
  private readonly inner: EsDocumentStore<T>;

  constructor(
    es: ElasticsearchService,
    esIndex: EsIndexService,
    index: string,
    properties: Record<string, unknown>,
  ) {
    this.inner = new EsDocumentStore<T>(es, esIndex, index, properties);
  }

  get(id: string): Promise<StoredDoc<T> | null> {
    return this.inner.get(id);
  }

  create(doc: T): Promise<void> {
    return this.inner.create(doc);
  }

  replace(doc: T, version: DocVersion): Promise<void> {
    return this.inner.replace(doc, version);
  }

  delete(id: string): Promise<boolean> {
    return this.inner.delete(id);
  }

  list(options?: { excludes?: string[] }): Promise<T[]> {
    return this.inner.list(options);
  }

  /** Pages through every match (EsDocumentStore.search), so large workspaces aren't cut off */
  async findAny(clauses: TermClause[]): Promise<T[]> {
    if (clauses.length === 0) return [];
    return this.inner.search({
      bool: {
        should: clauses.map((clause) => ({
          bool: { filter: Object.entries(clause).map(([field, value]) => ({ term: { [field]: value } })) },
        })),
        minimum_should_match: 1,
      },
    });
  }
}

/** Whether a stored document matches a clause, with the same semantics as the Elasticsearch query */
export function matchesClause(doc: Record<string, unknown>, clause: TermClause): boolean {
  return Object.entries(clause).every(([field, value]) => {
    const actual = field.split('.').reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], doc);
    return Array.isArray(actual) ? actual.includes(value) : actual === value;
  });
}
