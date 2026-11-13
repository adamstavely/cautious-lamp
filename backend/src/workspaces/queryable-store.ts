import { InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService, esStatusCode, isEsNotFound } from '../common/elasticsearch/es-index.service';
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

const FIND_LIMIT = 10000;

/**
 * Elasticsearch store: get/create/replace/delete/list from the reviews
 * module's EsDocumentStore (optimistic concurrency, `refresh: wait_for`), plus
 * term queries. The index has `dynamic: false`, so only the mapped fields are searchable.
 */
export class EsQueryableStore<T extends { id: string }> implements QueryableStore<T> {
  private readonly logger = new Logger(`EsQueryableStore:${this.index}`);
  private readonly inner: EsDocumentStore<T>;

  constructor(
    private readonly es: ElasticsearchService,
    esIndex: EsIndexService,
    private readonly index: string,
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

  async findAny(clauses: TermClause[]): Promise<T[]> {
    if (clauses.length === 0) return [];
    try {
      const res = await this.es.search<T>({
        index: this.index,
        size: FIND_LIMIT,
        query: {
          bool: {
            should: clauses.map((clause) => ({
              bool: { filter: Object.entries(clause).map(([field, value]) => ({ term: { [field]: value } })) },
            })),
            minimum_should_match: 1,
          },
        },
        sort: [{ createdAt: { order: 'desc', unmapped_type: 'date' } }],
      });
      return res.hits.hits.map((hit) => hit._source as T);
    } catch (error) {
      // No index yet means nothing has been written
      if (isEsNotFound(error)) return [];
      const status = esStatusCode(error);
      this.logger.error(`Elasticsearch search on ${this.index} failed: ${(error as Error)?.message}`);
      if (!status || status >= 500 || status === 429) {
        throw new ServiceUnavailableException('Storage is unavailable, please try again later');
      }
      throw new InternalServerErrorException('Storage request failed');
    }
  }
}

/** Whether a stored document matches a clause, with the same semantics as the Elasticsearch query */
export function matchesClause(doc: Record<string, unknown>, clause: TermClause): boolean {
  return Object.entries(clause).every(([field, value]) => {
    const actual = field.split('.').reduce<unknown>((obj, key) => (obj as Record<string, unknown>)?.[key], doc);
    return Array.isArray(actual) ? actual.includes(value) : actual === value;
  });
}
