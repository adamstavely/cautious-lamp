export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;
/** Bound on tracked emails, so a flood of random emails can't grow memory without limit */
const MAX_TRACKED = 10_000;

interface Entry {
  /** Times of recent failures, within the last LOCKOUT_MS */
  failures: number[];
  lockedUntil?: number;
}

/**
 * Failed sign-ins per email: after 5 failures within 15 minutes the email is
 * locked for 15 minutes. Kept in memory, so it is per process and resets on
 * restart (docs/AUTH.md). Unknown emails are tracked the same way, so lockout
 * doesn't reveal which emails exist.
 */
export class LoginLockout {
  private readonly entries = new Map<string, Entry>();

  constructor(private readonly now: () => number = () => Date.now()) {}

  /** When the lock ends, or null if the email isn't locked */
  lockedUntil(email: string): Date | null {
    const entry = this.entries.get(email);
    if (!entry?.lockedUntil) return null;
    if (entry.lockedUntil <= this.now()) {
      this.entries.delete(email);
      return null;
    }
    return new Date(entry.lockedUntil);
  }

  /** Records a failure. Returns true when this failure locked the email. */
  recordFailure(email: string): boolean {
    const now = this.now();
    const entry = this.entries.get(email) ?? { failures: [] };
    entry.failures = entry.failures.filter((time) => time > now - LOCKOUT_MS);
    entry.failures.push(now);
    let locked = false;
    if (entry.failures.length >= MAX_FAILED_LOGINS) {
      entry.lockedUntil = now + LOCKOUT_MS;
      entry.failures = [];
      locked = true;
    }
    // Re-insert so Map order is least recently failed first
    this.entries.delete(email);
    this.entries.set(email, entry);
    this.evict();
    return locked;
  }

  clear(email: string): void {
    this.entries.delete(email);
  }

  private evict(): void {
    while (this.entries.size > MAX_TRACKED) {
      const oldest = this.entries.keys().next().value as string;
      this.entries.delete(oldest);
    }
  }
}
