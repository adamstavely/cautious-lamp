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

/**
 * The storage the reviews module needs: whole-document reads and
 * compare-and-swap writes. Kept small so tests can swap in a fake.
 */
export interface DocumentStore<T extends { id: string }> {
  get(id: string): Promise<StoredDoc<T> | null>;
  /** Fails if a document with that id already exists */
  create(doc: T): Promise<void>;
  /** Writes only if the stored copy is still at `version`, else throws VersionConflictError */
  replace(doc: T, version: DocVersion): Promise<void>;
  /** Returns false when there was nothing to delete */
  delete(id: string): Promise<boolean>;
  /** Every document; `excludes` drops large fields the caller won't use */
  list(options?: { excludes?: string[] }): Promise<T[]>;
}

const LIST_LIMIT = 10000;

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

  async list(options: { excludes?: string[] } = {}): Promise<T[]> {
    try {
      const res = await this.es.search<T>({
        index: this.index,
        size: LIST_LIMIT,
        query: { match_all: {} },
        sort: [{ createdAt: { order: 'desc', unmapped_type: 'date' } }],
        _source_excludes: options.excludes,
      });
      return res.hits.hits.map((hit) => hit._source as T);
    } catch (error) {
      if (isEsNotFound(error)) return [];
      throw this.mapError(error, 'list');
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
