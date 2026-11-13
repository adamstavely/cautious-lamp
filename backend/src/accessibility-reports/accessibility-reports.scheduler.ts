import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AccessibilityReportsService } from './accessibility-reports.service';

/**
 * Runs due report schedules once a minute. nextRun is stored with each
 * schedule, so runs survive restarts, and each run is claimed with a
 * compare-and-swap write, so several backend instances don't double-run a
 * schedule (they still all poll). Disable with A11Y_SCHEDULER_ENABLED=false;
 * it never starts under NODE_ENV=test.
 */
@Injectable()
export class AccessibilityReportsScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AccessibilityReportsScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly reports: AccessibilityReportsService) {}

  onModuleInit(): void {
    if (process.env.A11Y_SCHEDULER_ENABLED === 'false' || process.env.NODE_ENV === 'test') return;
    const intervalMs = Number(process.env.A11Y_SCHEDULER_INTERVAL_MS) || 60_000;
    this.timer = setInterval(() => void this.tick(), intervalMs);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** One pass over due schedules; skipped if the previous pass is still running */
  async tick(now = new Date()): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const ran = await this.reports.runDueSchedules(now);
      if (ran) this.logger.log(`Ran ${ran} scheduled accessibility report(s)`);
    } catch (error) {
      this.logger.warn(`Scheduled reports skipped: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
