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
  /** Being applied: `claim` says by whom and until when; an expired claim can be finished by anyone allowed to apply */
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
  /** Token runs being applied: who claimed the run, until when, and the choices being applied */
  claim?: ApplyClaim;
  /** Token runs being applied: each item's outcome as it is written, so an interrupted apply can finish */
  progress?: ItemResult[];
  applied?: {
    by: SyncActor;
    at: string;
    counts: Record<ItemOutcome, number>;
    results: ItemResult[];
  };
}

export interface ItemResult {
  id: string;
  choice: SyncChoice;
  outcome: ItemOutcome;
  error?: string;
}

/** Held by the one caller applying a run; renewed as items are written */
export interface ApplyClaim {
  token: string;
  by: SyncActor;
  at: string;
  expiresAt: string;
  choices: Record<string, SyncChoice>;
}

/** Whether `a` is a later pull than `b`: started later, or at the same moment with a greater id */
export function isNewerRun(a: Pick<SyncRun, 'startedAt' | 'id'>, b: Pick<SyncRun, 'startedAt' | 'id'>): boolean {
  return a.startedAt > b.startedAt || (a.startedAt === b.startedAt && a.id > b.id);
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
   * Records a run. Of the connection's diffs waiting for review, only the
   * latest pull (isNewerRun) stays reviewable; the rest are superseded. Every
   * caller picks the same latest one, so pulls recorded at the same time
   * agree, and one that started earlier but finished later never replaces it.
   */
  async record(run: SyncRun): Promise<void> {
    await this.store.create(run);
    const runs = await this.forConnection(run.connectionId);
    if (run.status === 'review') {
      const waiting = runs.filter((r) => r.kind === run.kind && r.status === 'review');
      if (!waiting.some((r) => r.id === run.id)) waiting.push(run);
      const latest = waiting.reduce((best, r) => (isNewerRun(r, best) ? r : best));
      for (const older of waiting) {
        if (older.id === latest.id) continue;
        await this.update(older.id, (r) => {
          if (r.status !== 'review') return false;
          r.status = 'superseded';
        }).catch(() => undefined);
      }
    }
    for (const old of runs.slice(MAX_RUNS_PER_CONNECTION)) await this.store.delete(old.id).catch(() => undefined);
  }

  /** Newest first */
  async forConnection(connectionId: string): Promise<SyncRun[]> {
    const runs = await this.store.list({ where: { connectionId } });
    return runs.sort((a, b) => (isNewerRun(a, b) ? -1 : isNewerRun(b, a) ? 1 : 0));
  }

  async get(id: string): Promise<SyncRun | null> {
    return (await this.store.get(id))?.doc ?? null;
  }

  /**
   * Applies `change` to the stored run, compare-and-swap. Returns true only
   * when this write landed: false if the run is gone, `change` returned false
   * (nothing is written), or someone else wrote first.
   */
  async update(id: string, change: (run: SyncRun) => boolean | void): Promise<boolean> {
    const stored = await this.store.get(id);
    if (!stored) return false;
    if (change(stored.doc) === false) return false;
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
