import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ServicePrincipal } from '../auth/principal';
import { DocumentStore, DuplicateDocumentError, StoredDoc, VersionConflictError } from '../reviews/document-store';
import { META_STORE, MetaDoc } from './governance-stores';
import { MAX_DEAD_LETTERS, OccurrencePolicy, leaseUntil, occurrencePolicy, retryAt } from './occurrence-policy';
import { ScansService } from './scans.service';
import { APPLICATION_DIRECTORY, ApplicationDirectory, GovernanceApplication } from './sources';

export type ScheduledFrequency = 'daily' | 'weekly';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of the period `now` falls in: the UTC day, or the UTC week starting Monday */
export function periodStart(frequency: ScheduledFrequency, now: Date): Date {
  const day = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (frequency === 'daily') return new Date(day);
  const sinceMonday = (now.getUTCDay() + 6) % 7;
  return new Date(day - sinceMonday * DAY_MS);
}

const CLAIM_PREFIX = 'scheduled-scan:';
const claimId = (applicationId: string) => `${CLAIM_PREFIX}${applicationId}`;

/** One stored scan per occurrence, however many attempts or instances run it */
export const scheduledScanId = (applicationId: string, frequency: ScheduledFrequency, start: Date) =>
  `scan-scheduled-${applicationId}-${frequency}-${start.getTime()}`;

type Claim = { applicationId: string; token: string; attempts: number; period: string };

/** Who scheduled scans are recorded as */
const SCHEDULER: ServicePrincipal = {
  type: 'service',
  id: 'governance-scheduler',
  name: 'Scheduled governance scan',
  email: null,
  roles: [],
  permissions: new Set(),
  mustChangePassword: false,
};

const isScheduled = (app: GovernanceApplication): app is GovernanceApplication & { scanSchedule: ScheduledFrequency; applicationUrl: string } =>
  !!app.governanceEnabled && !!app.applicationUrl && (app.scanSchedule === 'daily' || app.scanSchedule === 'weekly');

/**
 * Runs the governance scans applications ask for with
 * capabilities.governance.scanSchedule = daily or weekly: once per UTC day,
 * or once per UTC week (from Monday), against the application's URL with the
 * rules the application picked. An application whose governance scan already
 * ran in the current period (by hand, say) is not scanned again; accessibility
 * reports don't count. Applications without a URL can't be scanned on a
 * schedule and are left alone.
 *
 * Each occurrence is claimed with a compare-and-swap write to a marker in the
 * governance meta index, with a lease (occurrence-policy.ts). If the instance
 * running it dies, another takes it over once the lease expires. A failed
 * attempt is retried with backoff up to the attempt limit, then
 * dead-lettered. The stored scan has a fixed id per occurrence, so a
 * takeover after the scan was stored completes it without scanning again.
 * Disable with GOVERNANCE_SCHEDULER_ENABLED=false; it never starts under NODE_ENV=test.
 */
@Injectable()
export class GovernanceScanScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GovernanceScanScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  readonly policy: OccurrencePolicy = occurrencePolicy('GOVERNANCE_SCHEDULER');

  constructor(
    private readonly scans: ScansService,
    @Inject(APPLICATION_DIRECTORY) private readonly applications: ApplicationDirectory,
    @Inject(META_STORE) private readonly meta: DocumentStore<MetaDoc>,
  ) {}

  onModuleInit(): void {
    if (process.env.GOVERNANCE_SCHEDULER_ENABLED === 'false' || process.env.NODE_ENV === 'test') return;
    const intervalMs = Number(process.env.GOVERNANCE_SCHEDULER_INTERVAL_MS) || 60_000;
    this.timer = setInterval(() => void this.tick(), intervalMs);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** One pass; skipped if the previous pass is still running */
  async tick(now = new Date()): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const ran = await this.runDueScans(now);
      if (ran) this.logger.log(`Ran ${ran} scheduled governance scan(s)`);
    } catch (error) {
      this.logger.warn(`Scheduled governance scans skipped: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }

  /** Runs every attempt that is due; returns how many this instance ran */
  async runDueScans(now = new Date()): Promise<number> {
    let ran = 0;
    for (const app of await this.applications.list()) {
      if (!isScheduled(app)) continue;
      const start = periodStart(app.scanSchedule, now);
      const claim = await this.claim(app, `${app.scanSchedule}:${start.toISOString()}`, start, now);
      if (!claim) continue;
      ran++;
      try {
        const scan = await this.scans.scan({ scope: 'application', applicationId: app.id, url: app.applicationUrl }, SCHEDULER, {
          id: scheduledScanId(app.id, app.scanSchedule, start),
        });
        await this.finish(claim, { scanId: scan.id }, now);
      } catch (error) {
        const message = (error as Error).message.slice(0, 500);
        this.logger.warn(`Scheduled governance scan of ${app.id} failed (attempt ${claim.attempts} of ${this.policy.maxAttempts}): ${message}`);
        await this.finish(claim, { error: message }, now).catch(() => undefined);
      }
    }
    return ran;
  }

  /** Every application's latest occurrence, including dead letters (GET /governance/scheduled-scans) */
  async occurrences(): Promise<Array<MetaDoc & { applicationId: string }>> {
    return (await this.meta.list())
      .filter((doc) => doc.id.startsWith(CLAIM_PREFIX))
      .map(({ token: _token, ...doc }) => ({ ...doc, applicationId: doc.id.slice(CLAIM_PREFIX.length) }));
  }

  /**
   * Claims the next attempt of this period's occurrence, or returns null
   * when there's nothing to do: it completed or was dead-lettered, another
   * instance holds a live lease, a retry isn't due yet, or (for a new
   * period) the application's governance scan already ran this period.
   */
  private async claim(app: GovernanceApplication, period: string, start: Date, now: Date): Promise<Claim | null> {
    const id = claimId(app.id);
    const found = await this.meta.get(id);
    const current = found?.doc.value === period ? normalize(found.doc, this.policy) : null;
    let attempts = 1;
    if (current) {
      if (current.state === 'completed' || current.state === 'dead-letter') return null;
      if (current.state === 'claimed' && new Date(current.leaseUntil!) > now) return null;
      if (current.state === 'retry' && new Date(current.retryAt!) > now) return null;
      attempts = (current.attempts ?? 1) + 1;
      // The last attempt died with its lease held: give up on the occurrence
      if (current.state === 'claimed' && attempts > this.policy.maxAttempts) {
        await this.deadLetter(found!, current, `The run was interrupted ${current.attempts} time(s) (its lease expired)`, now).catch(() => undefined);
        return null;
      }
    } else if (app.lastScan && new Date(app.lastScan) >= start) {
      return null;
    }

    const token = randomUUID();
    const marker: MetaDoc = {
      id,
      createdAt: found?.doc.createdAt ?? now.toISOString(),
      updatedAt: now.toISOString(),
      value: period,
      state: 'claimed',
      attempts,
      token,
      leaseUntil: leaseUntil(this.policy, now).toISOString(),
      lastStatus: 'running',
      ...(current?.lastError ? { lastError: current.lastError } : {}),
      ...(found?.doc.deadLetters ? { deadLetters: found.doc.deadLetters } : {}),
    };
    try {
      if (found) await this.meta.replace(marker, found.version);
      else await this.meta.create(marker);
      return { applicationId: app.id, token, attempts, period };
    } catch (error) {
      if (error instanceof DuplicateDocumentError || error instanceof VersionConflictError) return null;
      throw error;
    }
  }

  /**
   * Completes the attempt: success marks the occurrence completed; a failure
   * schedules a retry, or dead-letters it after the last attempt. Only the
   * run holding the claim can do this, so a run whose lease was taken over
   * changes nothing (and its scan, stored under the occurrence's fixed id, isn't a duplicate).
   */
  private async finish(claim: Claim, result: { scanId: string } | { error: string }, now: Date): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const found = await this.meta.get(claimId(claim.applicationId));
      if (!found || found.doc.token !== claim.token || found.doc.value !== claim.period) return;
      if (!('error' in result)) {
        const { lastError: _error, retryAt: _retry, leaseUntil: _lease, ...rest } = found.doc;
        if (await this.write({ ...rest, state: 'completed', lastStatus: 'success', lastScanId: result.scanId, updatedAt: now.toISOString() }, found)) return;
        continue;
      }
      if (claim.attempts >= this.policy.maxAttempts) {
        if (await this.deadLetter(found, found.doc, result.error, now)) return;
        continue;
      }
      const { leaseUntil: _lease, lastScanId: _scan, ...rest } = found.doc;
      const retry: MetaDoc = {
        ...rest,
        state: 'retry',
        lastStatus: 'failed',
        lastError: result.error,
        retryAt: retryAt(this.policy, claim.attempts, now).toISOString(),
        updatedAt: now.toISOString(),
      };
      if (await this.write(retry, found)) return;
    }
  }

  private async deadLetter(found: StoredDoc<MetaDoc>, current: MetaDoc, error: string, now: Date): Promise<boolean> {
    const { leaseUntil: _lease, retryAt: _retry, lastScanId: _scan, ...rest } = found.doc;
    const letter = { period: current.value ?? '', attempts: current.attempts ?? 1, error, at: now.toISOString() };
    this.logger.error(`Scheduled governance scan ${found.doc.id} (${letter.period}) dead-lettered after ${letter.attempts} attempt(s): ${error}`);
    return this.write(
      {
        ...rest,
        state: 'dead-letter',
        lastStatus: 'failed',
        lastError: error,
        deadLetters: [letter, ...(found.doc.deadLetters ?? [])].slice(0, MAX_DEAD_LETTERS),
        updatedAt: now.toISOString(),
      },
      found,
    );
  }

  /** false when someone else wrote first (the caller re-reads and decides again) */
  private async write(doc: MetaDoc, found: StoredDoc<MetaDoc>): Promise<boolean> {
    try {
      await this.meta.replace(doc, found.version);
      return true;
    } catch (error) {
      if (error instanceof VersionConflictError) return false;
      throw error;
    }
  }
}

/**
 * Markers from before occurrence states had only lastStatus: success counts
 * as completed, failed as a first attempt due for retry, and running as a
 * claim whose lease started when it was written.
 */
function normalize(doc: MetaDoc, policy: OccurrencePolicy): MetaDoc {
  if (doc.state) return doc;
  const written = new Date(doc.updatedAt ?? doc.createdAt);
  if (doc.lastStatus === 'success') return { ...doc, state: 'completed', attempts: 1 };
  if (doc.lastStatus === 'failed') return { ...doc, state: 'retry', attempts: 1, retryAt: retryAt(policy, 1, written).toISOString() };
  return { ...doc, state: 'claimed', attempts: 1, leaseUntil: leaseUntil(policy, written).toISOString() };
}
