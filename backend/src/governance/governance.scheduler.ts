import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ServicePrincipal } from '../auth/principal';
import { DocumentStore, DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import { META_STORE, MetaDoc } from './governance-stores';
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

const claimId = (applicationId: string) => `scheduled-scan:${applicationId}`;

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
 * rules the application picked. An application scanned in the current period
 * already (by hand, say) is not scanned again. Applications without a URL
 * can't be scanned on a schedule and are left alone.
 *
 * Each occurrence is claimed first with a compare-and-swap write to a marker
 * in the governance meta index, so several backend instances don't run the
 * same one. Disable with GOVERNANCE_SCHEDULER_ENABLED=false; it never starts
 * under NODE_ENV=test.
 */
@Injectable()
export class GovernanceScanScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GovernanceScanScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

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

  /** Runs every scan that is due; returns how many this instance ran */
  async runDueScans(now = new Date()): Promise<number> {
    let ran = 0;
    for (const app of await this.applications.list()) {
      if (!isScheduled(app)) continue;
      const start = periodStart(app.scanSchedule, now);
      if (app.lastScan && new Date(app.lastScan) >= start) continue;
      const period = `${app.scanSchedule}:${start.toISOString()}`;
      if (!(await this.claim(app.id, period, now))) continue;
      ran++;
      try {
        const scan = await this.scans.scan({ scope: 'application', applicationId: app.id, url: app.applicationUrl }, SCHEDULER);
        await this.record(app.id, { lastStatus: 'success', lastScanId: scan.id }, now);
      } catch (error) {
        const message = (error as Error).message.slice(0, 500);
        this.logger.warn(`Scheduled governance scan of ${app.id} failed: ${message}`);
        await this.record(app.id, { lastStatus: 'failed', lastError: message }, now).catch(() => undefined);
      }
    }
    return ran;
  }

  /** Claims this period's run for an application; false when it was already claimed */
  private async claim(applicationId: string, period: string, now: Date): Promise<boolean> {
    const id = claimId(applicationId);
    const marker: MetaDoc = { id, createdAt: now.toISOString(), updatedAt: now.toISOString(), value: period, lastStatus: 'running' };
    const found = await this.meta.get(id);
    try {
      if (!found) {
        await this.meta.create(marker);
        return true;
      }
      if (found.doc.value === period) return false;
      await this.meta.replace({ ...marker, createdAt: found.doc.createdAt }, found.version);
      return true;
    } catch (error) {
      if (error instanceof DuplicateDocumentError || error instanceof VersionConflictError) return false;
      throw error;
    }
  }

  private async record(applicationId: string, result: Pick<MetaDoc, 'lastStatus' | 'lastError' | 'lastScanId'>, now: Date): Promise<void> {
    const found = await this.meta.get(claimId(applicationId));
    if (!found) return;
    const { lastError: _error, lastScanId: _scan, ...rest } = found.doc;
    await this.meta.replace({ ...rest, ...result, updatedAt: now.toISOString() }, found.version).catch((error) => {
      if (!(error instanceof VersionConflictError)) throw error;
    });
  }
}
