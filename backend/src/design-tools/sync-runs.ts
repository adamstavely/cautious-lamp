import { randomBytes } from 'crypto';
import { DocumentStore, VersionConflictError } from '../reviews/document-store';
import { ComponentReportItem } from './component-diff';
import { DesignFileSnapshot } from './design-tool.types';
import { BaselineEntry, SyncChoice, TokenDiffItem } from './token-diff';

export const SYNC_RUNS_INDEX = 'design-system-sync-runs';
/** Injection token for the run store */
export const SYNC_RUN_STORE = Symbol('SYNC_RUN_STORE');

const keyword = { type: 'keyword' };

/** Mapping for the run index; the diff itself stays in `_source` */
export const SYNC_RUN_PROPERTIES = {
  id: keyword,
  kind: keyword,
  connectionId: keyword,
  status: keyword,
  trigger: keyword,
  startedAt: { type: 'date' },
  finishedAt: { type: 'date' },
};

/** Runs kept per connection; older ones are deleted as new ones are recorded */
export const MAX_RUNS_PER_CONNECTION = 50;

export type SyncRunStatus =
  /** Token diff waiting for someone to choose and apply */
  | 'review'
  /** Being applied right now */
  | 'applying'
  /** Every chosen change was written */
  | 'applied'
  /** Some chosen changes were written, some failed */
  | 'partial'
  /** The design file couldn't be read */
  | 'failed'
  /** A newer pull of the same connection replaced this diff before it was applied */
  | 'superseded'
  /** A component compare (nothing to apply) */
  | 'compared';

export type ItemOutcome = 'created' | 'updated' | 'deleted' | 'kept-code' | 'skipped' | 'failed';

export interface SyncActor {
  type: 'user' | 'service';
  id: string;
  name: string;
}

/** One pull of a design file: who started it, what it found, and what was applied */
export interface SyncRun {
  id: string;
  kind: 'tokens' | 'components';
  connectionId: string;
  tool: string;
  fileId?: string;
  fileName?: string;
  fileVersion?: string;
  trigger: 'manual' | 'scheduled';
  startedBy: SyncActor;
  startedAt: string;
  finishedAt: string;
  status: SyncRunStatus;
  counts: Record<string, number>;
  warnings: string[];
  error?: string;
  variables?: DesignFileSnapshot['variables'];
  /** Token runs: the diff */
  tokenItems?: TokenDiffItem[];
  /** Token runs: design tokens that already matched code, folded into the baseline on apply */
  matched?: Record<string, BaselineEntry>;
  /** Component runs: the report */
  componentItems?: ComponentReportItem[];
  applied?: {
    by: SyncActor;
    at: string;
    counts: Record<ItemOutcome, number>;
    results: Array<{ id: string; choice: SyncChoice; outcome: ItemOutcome; error?: string }>;
  };
}

/** A run without its item lists, for history views */
export type SyncRunSummary = Omit<SyncRun, 'tokenItems' | 'componentItems' | 'matched'>;

export function newRunId(): string {
  return `run-${randomBytes(9).toString('hex')}`;
}

export function summarize(run: SyncRun): SyncRunSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tokenItems, componentItems, matched, ...summary } = run;
  if (summary.applied) summary.applied = { ...summary.applied, results: [] };
  return summary;
}

/** Sync runs in Elasticsearch: recording, history and the compare-and-swap writes apply needs */
export class SyncRunLog {
  constructor(private readonly store: DocumentStore<SyncRun>) {}

  /**
   * Records a run. A new token diff supersedes the connection's older ones
   * still waiting for review, so only the latest pull can be applied.
   */
  async record(run: SyncRun): Promise<void> {
    await this.store.create(run);
    const runs = await this.forConnection(run.connectionId);
    if (run.status === 'review') {
      for (const older of runs) {
        if (older.id !== run.id && older.kind === run.kind && older.status === 'review') {
          await this.update(older.id, (r) => {
            if (r.status === 'review') r.status = 'superseded';
          }).catch(() => undefined);
        }
      }
    }
    for (const old of runs.slice(MAX_RUNS_PER_CONNECTION)) await this.store.delete(old.id).catch(() => undefined);
  }

  /** Newest first */
  async forConnection(connectionId: string): Promise<SyncRun[]> {
    const runs = await this.store.list({ where: { connectionId } });
    return runs.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  async get(id: string): Promise<SyncRun | null> {
    return (await this.store.get(id))?.doc ?? null;
  }

  /** Applies `change` to the stored run, compare-and-swap; returns false if someone else wrote first */
  async update(id: string, change: (run: SyncRun) => void): Promise<boolean> {
    const stored = await this.store.get(id);
    if (!stored) return false;
    change(stored.doc);
    try {
      await this.store.replace(stored.doc, stored.version);
      return true;
    } catch (error) {
      if (error instanceof VersionConflictError) return false;
      throw error;
    }
  }

  async deleteForConnection(connectionId: string): Promise<void> {
    for (const run of await this.forConnection(connectionId)) await this.store.delete(run.id).catch(() => undefined);
  }
}
