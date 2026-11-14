import {
  DocVersion,
  DocumentStore,
  DuplicateDocumentError,
  ListOptions,
  StoredDoc,
  VersionConflictError,
  matchesListOptions,
} from '../document-store';

/** In-memory DocumentStore with the same compare-and-swap semantics as Elasticsearch, for tests */
export class InMemoryStore<T extends { id: string }> implements DocumentStore<T> {
  readonly docs = new Map<string, { doc: T; seqNo: number }>();
  private seq = 0;
  /** Called before each replace, so tests can simulate a concurrent writer */
  beforeReplace?: (doc: T) => void | Promise<void>;

  async get(id: string): Promise<StoredDoc<T> | null> {
    const entry = this.docs.get(id);
    if (!entry) return null;
    return { doc: structuredClone(entry.doc), version: { seqNo: entry.seqNo, primaryTerm: 1 } };
  }

  async create(doc: T): Promise<void> {
    if (this.docs.has(doc.id)) throw new DuplicateDocumentError(doc.id);
    this.docs.set(doc.id, { doc: structuredClone(doc), seqNo: ++this.seq });
  }

  async replace(doc: T, version: DocVersion): Promise<void> {
    if (this.beforeReplace) await this.beforeReplace(doc);
    const entry = this.docs.get(doc.id);
    if (!entry || entry.seqNo !== version.seqNo) throw new VersionConflictError(doc.id);
    this.docs.set(doc.id, { doc: structuredClone(doc), seqNo: ++this.seq });
  }

  async delete(id: string): Promise<boolean> {
    return this.docs.delete(id);
  }

  /** Same filters and order (newest `createdAt` first) as EsDocumentStore; `excludes` is honoured too */
  async list(options: ListOptions = {}): Promise<T[]> {
    const time = (doc: T) => new Date(String((doc as Record<string, unknown>).createdAt ?? 0)).getTime() || 0;
    return [...this.docs.values()]
      .map((entry) => entry.doc)
      .filter((doc) => matchesListOptions(doc, options))
      .sort((a, b) => time(b) - time(a))
      .map((doc) => {
        const copy = structuredClone(doc) as Record<string, unknown>;
        for (const field of options.excludes ?? []) delete copy[field];
        return copy as T;
      });
  }

  /** Writes directly, bumping the sequence number like another writer would */
  forceWrite(doc: T): void {
    this.docs.set(doc.id, { doc: structuredClone(doc), seqNo: ++this.seq });
  }
}
