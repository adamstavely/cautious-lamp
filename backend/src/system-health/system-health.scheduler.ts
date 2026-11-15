import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SystemHealthService } from './system-health.service';

/**
 * Takes the day's system-health snapshot (SystemHealthService.takeSnapshot):
 * checks on start and then every SYSTEM_HEALTH_SNAPSHOT_INTERVAL_MS (an hour
 * by default), and stores one when the current UTC day has none. The
 * snapshot's id is the day, so however many instances run this, each day
 * has one. Disable with SYSTEM_HEALTH_SNAPSHOTS_ENABLED=false; it never
 * starts under NODE_ENV=test.
 */
@Injectable()
export class SystemHealthSnapshotScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SystemHealthSnapshotScheduler.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly health: SystemHealthService) {}

  onModuleInit(): void {
    if (process.env.SYSTEM_HEALTH_SNAPSHOTS_ENABLED === 'false' || process.env.NODE_ENV === 'test') return;
    const intervalMs = Number(process.env.SYSTEM_HEALTH_SNAPSHOT_INTERVAL_MS) || 60 * 60 * 1000;
    this.timer = setInterval(() => void this.tick(), intervalMs);
    this.timer.unref();
    void this.tick();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** One check; skipped if the previous one is still running */
  async tick(at?: Date): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      if (await this.health.takeSnapshot(at)) this.logger.log('Stored the daily system-health snapshot');
    } catch (error) {
      this.logger.warn(`System-health snapshot skipped: ${(error as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
