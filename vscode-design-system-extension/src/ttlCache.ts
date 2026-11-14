// One cached value with its own freshness. Each data set (components, tokens)
// gets its own instance, so loading one never makes the other look fresh.

export class TtlCache<T> {
  private value: T | null = null;
  private storedAt = 0;

  constructor(
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now
  ) {}

  /** The value if it was stored less than `ttlMs` ago */
  getFresh(): T | null {
    return this.value !== null && this.now() - this.storedAt < this.ttlMs ? this.value : null;
  }

  /** The last stored value, however old (a fallback when a refresh fails) */
  getStale(): T | null {
    return this.value;
  }

  set(value: T): T {
    this.value = value;
    this.storedAt = this.now();
    return value;
  }

  clear(): void {
    this.value = null;
    this.storedAt = 0;
  }
}
