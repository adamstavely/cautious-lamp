import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { randomUUID } from 'crypto';
import { isEsNotFound } from '../common/elasticsearch/es-index.service';
import { ClockInput, clockOf, leaseUntil, occurrencePolicy } from '../governance/occurrence-policy';
import { DocumentStore, DuplicateDocumentError, StoredDoc, VersionConflictError } from '../reviews/document-store';
import { DELIVERY_ATTEMPTS_INDEX, DELIVERY_ATTEMPT_PRUNER, DELIVERY_META_STORE, DeliveryAttemptPruner, DeliveryMetaDoc } from './delivery.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const MARKER_ID = 'attempt-retention';
export const DEFAULT_RETENTION_DAYS = 90;

/** DELIVERY_ATTEMPT_RETENTION_DAYS, or 90; anything that isn't a positive number falls back to it */
export function retentionDays(env: NodeJS.ProcessEnv = process.env): number {
  const days = Number(env.DELIVERY_ATTEMPT_RETENTION_DAYS);
  return Number.isFinite(days) && days > 0 ? days : DEFAULT_RETENTION_DAYS;
}

/** Deletes attempts created before the cutoff with one delete-by-query; a missing index deletes nothing */
export function esAttemptPruner(es: ElasticsearchService): DeliveryAttemptPruner {
  return {
    async deleteCreatedBefore(cutoff: string): Promise<number> {
      try {
        const res = await es.deleteByQuery({
          index: DELIVERY_ATTEMPTS_INDEX,
          query: { range: { createdAt: { lt: cutoff } } },
          conflicts: 'proceed',
          refresh: true,
        });
        return res.deleted ?? 0;
      } catch (error) {
        if (isEsNotFound(error)) return 0;
        throw error;
      }
    },
  };
}

/**
 * Deletes delivery attempts older than DELIVERY_ATTEMPT_RETENTION_DAYS (90
 * by default), once per UTC day. Like the governance scheduler, the day's
 * run is claimed with a compare-and-swap write to a marker that carries a
 * lease (DELIVERY_RETENTION_LEASE_MS, 10 minutes), so with several replicas
 * only one deletes; if it dies, another takes over once the lease expires.
 * A failed run is tried again on the next pass. Polls every hour
 * (DELIVERY_RETENTION_INTERVAL_MS). Disable with
 * DELIVERY_RETENTION_ENABLED=false; it never starts under NODE_ENV=test.
 */
@Injectable()
export class DeliveryRetentionJob implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DeliveryRetentionJob.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  /** Only the lease applies: a failed run is simply tried again on the next pass */
  readonly policy = occurrencePolicy('DELIVERY_RETENTION');

  constructor(
    @Inject(DELIVERY_META_STORE) private readonly meta: DocumentStore<DeliveryMetaDoc>,
    @Inject(DELIVERY_ATTEMPT_PRUNER) private readonly pruner: DeliveryAttemptPruner,
  ) {}

  onModuleInit(): void {
    if (process.env.DELIVERY_RETENTION_ENABLED === 'false' || process.env.NODE_ENV === 'test') return;
    const intervalMs = Number(process.env.DELIVERY_RETENTION_INTERVAL_MS) || 60 * 60_000;
    this.timer = setInterval(() => void this.tick(), intervalMs);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** One pass; skipped if the previous pass is still running */
  async tick(at?: ClockInput): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.runIfDue(at);
    } catch (error) {
      this.logger.warn(`Delivery attempt retention skipped: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }

  /** Deletes old attempts if today's run is this instance's to do; returns how many were deleted, or null when it wasn't */
  async runIfDue(at?: ClockInput): Promise<number | null> {
    const clock = clockOf(at);
    const now = clock();
    const period = now.toISOString().slice(0, 10);
    const claim = await this.claim(period, now);
    if (!claim) return null;

    const cutoff = new Date(now.getTime() - retentionDays() * DAY_MS).toISOString();
    try {
      const deleted = await this.pruner.deleteCreatedBefore(cutoff);
      if (deleted) this.logger.log(`Deleted ${deleted} delivery attempt(s) created before ${cutoff}`);
      await this.finish(claim, { state: 'completed', deleted, cutoff }, clock());
      return deleted;
    } catch (error) {
      const message = (error as Error).message.slice(0, 500);
      this.logger.warn(`Deleting delivery attempts created before ${cutoff} failed: ${message}`);
      await this.finish(claim, { state: 'failed', lastError: message }, clock()).catch(() => undefined);
      throw error;
    }
  }

  /** The retention marker as stored, without its claim token (for status pages and tests) */
  async status(): Promise<Omit<DeliveryMetaDoc, 'token'> | null> {
    const found = await this.meta.get(MARKER_ID);
    if (!found) return null;
    const { token: _token, ...doc } = found.doc;
    return doc;
  }

  /**
   * Claims today's run, or returns null when it already completed or another
   * instance holds a live lease on it. A failed run, or one whose lease ran
   * out, is claimed again.
   */
  private async claim(period: string, now: Date): Promise<{ token: string } | null> {
    const found = await this.meta.get(MARKER_ID);
    const current = found?.doc.period === period ? found.doc : null;
    if (current?.state === 'completed') return null;
    if (current?.state === 'claimed' && new Date(current.leaseUntil ?? 0) > now) return null;

    const token = randomUUID();
    const marker: DeliveryMetaDoc = {
      ...(found?.doc ?? {}),
      id: MARKER_ID,
      createdAt: found?.doc.createdAt ?? now.toISOString(),
      updatedAt: now.toISOString(),
      period,
      state: 'claimed',
      token,
      leaseUntil: leaseUntil(this.policy, now).toISOString(),
    };
    try {
      if (found) await this.meta.replace(marker, found.version);
      else await this.meta.create(marker);
      return { token };
    } catch (error) {
      if (error instanceof DuplicateDocumentError || error instanceof VersionConflictError) return null;
      throw error;
    }
  }

  /** Records how the run ended, unless another instance has taken the claim over since */
  private async finish(
    claim: { token: string },
    result: { state: 'completed'; deleted: number; cutoff: string } | { state: 'failed'; lastError: string },
    now: Date,
  ): Promise<void> {
    const found: StoredDoc<DeliveryMetaDoc> | null = await this.meta.get(MARKER_ID);
    if (!found || found.doc.token !== claim.token) return;
    const { leaseUntil: _lease, lastError: _error, ...rest } = found.doc;
    const doc: DeliveryMetaDoc =
      result.state === 'completed'
        ? { ...rest, state: 'completed', lastDeleted: result.deleted, lastCutoff: result.cutoff, lastRunAt: now.toISOString(), updatedAt: now.toISOString() }
        : { ...rest, state: 'failed', lastError: result.lastError, updatedAt: now.toISOString() };
    try {
      await this.meta.replace(doc, found.version);
    } catch (error) {
      if (!(error instanceof VersionConflictError)) throw error;
    }
  }
}
