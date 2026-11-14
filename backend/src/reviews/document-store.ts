import { InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EsIndexService, esStatusCode, isEsNotFound } from '../common/elasticsearch/es-index.service';

export const REVIEWS_INDEX = 'reviews';
export const TEAMS_INDEX = 'reviews-teams';

/** Injection tokens for the two stores */
export const REVIEW_STORE = Symbol('REVIEW_STORE');
export const TEAM_STORE = Symbol('TEAM_STORE');

/** Sequence number and primary term of the copy that was read, for optimistic concurrency */
export interface DocVersion {
  seqNo: number;
  primaryTerm: number;
}

export interface StoredDoc<T> {
  doc: T;
  version: DocVersion;
}

/** Thrown by `replace` when the document changed since it was read */
export class VersionConflictError extends Error {
  constructor(id: string) {
    super(`Document ${id} was modified concurrently`);
  }
}

/** Thrown by `create` when a document with that id already exists */
export class DuplicateDocumentError extends Error {
  constructor(id: string) {
    super(`Document ${id} already exists`);
  }
}

/**
 * The storage the reviews module needs: whole-document reads and
 * compare-and-swap writes. Kept small so tests can swap in a fake.
 */
export interface DocumentStore<T extends { id: string }> {
  get(id: string): Promise<StoredDoc<T> | null>;
  /** Throws DuplicateDocumentError if a document with that id already exists */
  create(doc: T): Promise<void>;
  /** Writes only if the stored copy is still at `version`, else throws VersionConflictError */
  replace(doc: T, version: DocVersion): Promise<void>;
  /** Returns false when there was nothing to delete */
  delete(id: string): Promise<boolean>;
  /** Every matching document, newest first, however many there are */
  list(options?: ListOptions): Promise<T[]>;
}

/** Term values `ListOptions.where` can match on (keyword or boolean fields) */
export type ListTermValue = string | boolean;

/**
 * Narrows a `list`. Filters run in the query, so they only apply to mapped
 * fields (the index has `dynamic: false`); filter anything else in memory.
 */
export interface ListOptions {
  /** Large fields the caller won't use */
  excludes?: string[];
  /** Every field must equal its value; a field holding an array matches when any element does */
  where?: Record<string, ListTermValue>;
  /** Every (date) field must be strictly later than its ISO timestamp */
  after?: Record<string, string>;
}

/** Hits per page while listing; `list` keeps paging until the index is exhausted */
export const LIST_PAGE_SIZE = 1000;
const PIT_KEEP_ALIVE = '1m';

/** The Elasticsearch query for `ListOptions` */
export function listQuery(options: ListOptions = {}): Record<string, unknown> {
  const filter = [
    ...Object.entries(options.where ?? {}).map(([field, value]) => ({ term: { [field]: value } })),
    ...Object.entries(options.after ?? {}).map(([field, value]) => ({ range: { [field]: { gt: value } } })),
  ];
  return filter.length ? { bool: { filter } } : { match_all: {} };
}

/** `ListOptions` applied to a document in memory, matching `listQuery` (for test doubles) */
export function matchesListOptions(doc: object, options: ListOptions = {}): boolean {
  const record = doc as Record<string, unknown>;
  const termOk = Object.entries(options.where ?? {}).every(([field, value]) => {
    const actual = record[field];
    return Array.isArray(actual) ? actual.includes(value) : actual === value;
  });
  const rangeOk = Object.entries(options.after ?? {}).every(([field, value]) => {
    const actual = record[field];
    return typeof actual === 'string' && new Date(actual).getTime() > new Date(value).getTime();
  });
  return termOk && rangeOk;
}

/**
 * Elasticsearch-backed store. The index is created with `dynamic: false` so
 * free-form data (annotation payloads, emoji reaction keys) stays in `_source`
 * without growing the mapping or hitting type conflicts.
 */
export class EsDocumentStore<T extends { id: string }> implements DocumentStore<T> {
  private readonly logger = new Logger(`EsDocumentStore:${this.index}`);
  private indexReady: Promise<void> | null = null;

  constructor(
    private readonly es: ElasticsearchService,
    private readonly esIndex: EsIndexService,
    private readonly index: string,
    private readonly properties: Record<string, unknown>,
  ) {}

  async get(id: string): Promise<StoredDoc<T> | null> {
    try {
      const res = await this.es.get<T>({ index: this.index, id });
      return { doc: res._source as T, version: { seqNo: res._seq_no, primaryTerm: res._primary_term } };
    } catch (error) {
      if (isEsNotFound(error)) return null;
      throw this.mapError(error, 'read');
    }
  }

  async create(doc: T): Promise<void> {
    await this.ensureIndex();
    try {
      await this.es.index({ index: this.index, id: doc.id, document: doc, op_type: 'create', refresh: 'wait_for' });
    } catch (error) {
      if (esStatusCode(error) === 409) throw new DuplicateDocumentError(doc.id);
      throw this.mapError(error, 'write');
    }
  }

  async replace(doc: T, version: DocVersion): Promise<void> {
    await this.ensureIndex();
    try {
      await this.es.index({
        index: this.index,
        id: doc.id,
        document: doc,
        if_seq_no: version.seqNo,
        if_primary_term: version.primaryTerm,
        refresh: 'wait_for',
      });
    } catch (error) {
      if (esStatusCode(error) === 409) throw new VersionConflictError(doc.id);
      throw this.mapError(error, 'write');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.es.delete({ index: this.index, id, refresh: 'wait_for' });
      return true;
    } catch (error) {
      if (isEsNotFound(error)) return false;
      throw this.mapError(error, 'delete');
    }
  }

  /**
   * Pages through a point-in-time snapshot with `search_after`, so the result
   * is complete and consistent however large the index is.
   */
  async list(options: ListOptions = {}): Promise<T[]> {
    return this.search(listQuery(options), options.excludes);
  }

  /**
   * Every document matching an Elasticsearch query, newest first, paged through
   * a point in time so nothing is cut off. A missing index is an empty result.
   */
  async search(query: Record<string, unknown>, excludes?: string[]): Promise<T[]> {
    let pitId: string;
    try {
      pitId = (await this.es.openPointInTime({ index: this.index, keep_alive: PIT_KEEP_ALIVE })).id;
    } catch (error) {
      if (isEsNotFound(error)) return [];
      throw this.mapError(error, 'list');
    }
    try {
      const docs: T[] = [];
      let searchAfter: unknown[] | undefined;
      for (;;) {
        const res = await this.es.search<T>({
          pit: { id: pitId, keep_alive: PIT_KEEP_ALIVE },
          size: LIST_PAGE_SIZE,
          query: query as any,
          // _shard_doc breaks ties, so a page boundary never skips or repeats a document
          sort: [{ createdAt: { order: 'desc', unmapped_type: 'date' } }, { _shard_doc: 'asc' }] as any,
          ...(searchAfter ? { search_after: searchAfter as any } : {}),
          _source_excludes: excludes,
          track_total_hits: false,
        });
        if (res.pit_id) pitId = res.pit_id;
        const hits = res.hits.hits;
        for (const hit of hits) docs.push(hit._source as T);
        if (hits.length < LIST_PAGE_SIZE) return docs;
        searchAfter = hits[hits.length - 1].sort as unknown[];
      }
    } catch (error) {
      // Even a 404 here (an expired point in time) is a failure: an empty or partial list would be wrong
      throw this.mapError(error, 'list');
    } finally {
      // Best effort: an unclosed PIT expires after PIT_KEEP_ALIVE anyway
      await this.es.closePointInTime({ id: pitId }).catch(() => undefined);
    }
  }

  /** Creates the index with an explicit mapping on first write */
  private ensureIndex(): Promise<void> {
    if (!this.indexReady) {
      this.indexReady = this.createIndex().catch((error) => {
        this.indexReady = null;
        throw error;
      });
    }
    return this.indexReady;
  }

  private async createIndex(): Promise<void> {
    await this.esIndex.assertAvailable();
    try {
      const exists = await this.es.indices.exists({ index: this.index });
      if (exists) return;
      await this.es.indices.create({
        index: this.index,
        mappings: { dynamic: false, properties: this.properties as any },
      });
    } catch (error) {
      const type = (error as { meta?: { body?: { error?: { type?: string } } } })?.meta?.body?.error?.type;
      if (type === 'resource_already_exists_exception') return;
      throw this.mapError(error, 'create index');
    }
  }

  private mapError(error: unknown, op: string): Error {
    const status = esStatusCode(error);
    this.logger.error(`Elasticsearch ${op} on ${this.index} failed: ${(error as Error)?.message}`);
    // Connection errors carry no status (or 0)
    if (!status || status >= 500 || status === 429) {
      return new ServiceUnavailableException('Storage is unavailable, please try again later');
    }
    return new InternalServerErrorException('Storage request failed');
  }
}

const keyword = { type: 'keyword' };
const date = { type: 'date' };

export const REVIEW_PROPERTIES = {
  id: keyword,
  filename: { type: 'keyword', fields: { text: { type: 'text' } } },
  sourceType: keyword,
  designer: { type: 'keyword', fields: { text: { type: 'text' } } },
  designerEmail: keyword,
  teamId: keyword,
  workflowState: keyword,
  sharingMode: keyword,
  completed: { type: 'boolean' },
  createdAt: date,
  updatedAt: date,
  expiresAt: date,
};

export const TEAM_PROPERTIES = {
  id: keyword,
  name: { type: 'keyword', fields: { text: { type: 'text' } } },
  createdAt: date,
  updatedAt: date,
};
