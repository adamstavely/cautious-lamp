/**
 * Leases and retries for scheduled runs (governance scans and accessibility
 * reports). An instance claims an occurrence with a lease; if it dies, the
 * lease runs out and another instance takes the occurrence over. A failed
 * attempt is retried after a growing delay, at most `maxAttempts` times in
 * all, then dead-lettered (kept, visible, and not retried).
 */
export interface OccurrencePolicy {
  /** How long a claim lasts. Longer than any one run takes (URL scans time out well within it). */
  leaseMs: number;
  /** Attempts per occurrence, the first included */
  maxAttempts: number;
  /** Delay before the first retry; doubled for each later one */
  retryDelayMs: number;
}

const positive = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/** `<prefix>_LEASE_MS` (10 min), `<prefix>_MAX_ATTEMPTS` (3) and `<prefix>_RETRY_DELAY_MS` (5 min) */
export function occurrencePolicy(prefix: 'GOVERNANCE_SCHEDULER' | 'A11Y_SCHEDULER', env: NodeJS.ProcessEnv = process.env): OccurrencePolicy {
  return {
    leaseMs: positive(env[`${prefix}_LEASE_MS`], 10 * 60_000),
    maxAttempts: Math.floor(positive(env[`${prefix}_MAX_ATTEMPTS`], 3)),
    retryDelayMs: positive(env[`${prefix}_RETRY_DELAY_MS`], 5 * 60_000),
  };
}

/** When the next attempt is due after `attempts` failed ones */
export function retryAt(policy: OccurrencePolicy, attempts: number, now: Date): Date {
  return new Date(now.getTime() + policy.retryDelayMs * 2 ** Math.max(0, attempts - 1));
}

export function leaseUntil(policy: OccurrencePolicy, now: Date): Date {
  return new Date(now.getTime() + policy.leaseMs);
}

/** Dead letters kept per schedule (newest first) */
export const MAX_DEAD_LETTERS = 10;

/** What a scheduler pass is run at: a fixed time (tests), or a clock */
export type ClockInput = Date | (() => Date);

/**
 * The clock a pass reads at each claim and each completion, so a lease or
 * retry time is measured from when that job is claimed or finishes, not from
 * when a long pass started. A fixed Date reads as itself; the default is the real time.
 */
export const clockOf = (at?: ClockInput): (() => Date) =>
  at instanceof Date ? () => at : (at ?? (() => new Date()));
