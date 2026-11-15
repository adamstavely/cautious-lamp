import { Logger } from '@nestjs/common';

/**
 * Runs `tick` every DESIGN_SYNC_SCHEDULER_INTERVAL_MS (default 5 minutes)
 * to start the scheduled pulls that are due; a pass still running is not
 * overlapped. Off with DESIGN_SYNC_SCHEDULER_ENABLED=false, and never under
 * NODE_ENV=test. Returns a stop function.
 */
export function startAutoSyncTimer(logger: Logger, label: string, tick: (now: Date) => Promise<number>): () => void {
  if (process.env.DESIGN_SYNC_SCHEDULER_ENABLED === 'false' || process.env.NODE_ENV === 'test') return () => undefined;
  const intervalMs = Number(process.env.DESIGN_SYNC_SCHEDULER_INTERVAL_MS) || 5 * 60_000;
  let running = false;
  const timer = setInterval(() => {
    if (running) return;
    running = true;
    tick(new Date())
      .then((ran) => {
        if (ran) logger.log(`Pulled ${ran} scheduled ${label}`);
      })
      .catch((error) => logger.warn(`Scheduled ${label} skipped: ${(error as Error).message}`))
      .finally(() => {
        running = false;
      });
  }, intervalMs);
  timer.unref();
  return () => clearInterval(timer);
}
