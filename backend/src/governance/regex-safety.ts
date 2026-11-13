import { Worker } from 'worker_threads';
import { LIMITS, REGEX_FLAGS } from './governance.types';

/** A rule pattern was rejected; the message says why (shown to the admin as a 400) */
export class UnsafePatternError extends Error {}

/** A match ran past its time budget and was stopped */
export class RegexTimeoutError extends Error {
  constructor(budgetMs: number) {
    super(`Pattern took longer than ${budgetMs}ms and was stopped`);
  }
}

/**
 * Static checks on a rule pattern before it is stored or run. Rejects syntax
 * errors, unknown flags, oversized patterns and the shapes behind most
 * catastrophic backtracking: backreferences, lookbehind, and a quantified group
 * that itself contains a quantifier or an alternation (`(a+)+`, `(a|ab)*`).
 * RegexRunner's time budget is the backstop for anything this misses.
 */
export function assertSafePattern(pattern: string, flags = ''): void {
  if (typeof pattern !== 'string' || pattern.length === 0) throw new UnsafePatternError('Pattern is required');
  if (pattern.length > LIMITS.pattern) throw new UnsafePatternError(`Pattern is longer than ${LIMITS.pattern} characters`);
  for (const flag of flags) {
    if (!(REGEX_FLAGS as readonly string[]).includes(flag)) throw new UnsafePatternError(`Flag "${flag}" is not allowed (use i, m or s)`);
  }
  if (new Set(flags).size !== flags.length) throw new UnsafePatternError('Repeated flag');
  try {
    new RegExp(pattern, flags);
  } catch (error) {
    throw new UnsafePatternError(`Invalid pattern: ${(error as Error).message}`);
  }

  // Walk the pattern, tracking groups. Escapes and character classes are skipped.
  interface Group {
    hasQuantifier: boolean;
    hasAlternation: boolean;
  }
  const stack: Group[] = [{ hasQuantifier: false, hasAlternation: false }];
  let lastClosedGroup: Group | null = null;
  let i = 0;
  const quantifierAt = (index: number): { length: number; repeats: boolean } | null => {
    const ch = pattern[index];
    if (ch === '*' || ch === '+') return { length: 1, repeats: true };
    if (ch === '?') return { length: 1, repeats: false };
    if (ch === '{') {
      const m = /^\{(\d+)(,(\d*))?\}/.exec(pattern.slice(index));
      if (!m) return null;
      const max = m[2] === undefined ? Number(m[1]) : m[3] === '' ? Infinity : Number(m[3]);
      return { length: m[0].length, repeats: max > 1 };
    }
    return null;
  };

  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === '\\') {
      const next = pattern[i + 1];
      if (next && /[1-9]/.test(next)) throw new UnsafePatternError('Backreferences are not allowed');
      if (next === 'k' && pattern[i + 2] === '<') throw new UnsafePatternError('Backreferences are not allowed');
      i += 2;
      lastClosedGroup = null;
    } else if (ch === '[') {
      // Skip the class body
      i++;
      if (pattern[i] === '^') i++;
      if (pattern[i] === ']') i++;
      while (i < pattern.length && pattern[i] !== ']') i += pattern[i] === '\\' ? 2 : 1;
      i++;
      lastClosedGroup = null;
    } else if (ch === '(') {
      if (pattern.startsWith('(?<=', i) || pattern.startsWith('(?<!', i)) throw new UnsafePatternError('Lookbehind is not allowed');
      stack.push({ hasQuantifier: false, hasAlternation: false });
      i += pattern.startsWith('(?:', i) || pattern.startsWith('(?=', i) || pattern.startsWith('(?!', i) ? 3 : 1;
      if (pattern[i - 1] === '(' && pattern.startsWith('?<', i)) {
        // Named group (?<name>
        const end = pattern.indexOf('>', i);
        i = end + 1;
      }
      lastClosedGroup = null;
    } else if (ch === ')') {
      const group = stack.pop()!;
      const parent = stack[stack.length - 1];
      // A group's contents count toward its parent
      parent.hasQuantifier ||= group.hasQuantifier;
      lastClosedGroup = group;
      i++;
    } else if (ch === '|') {
      stack[stack.length - 1].hasAlternation = true;
      lastClosedGroup = null;
      i++;
    } else {
      const quantifier = quantifierAt(i);
      if (quantifier) {
        if (quantifier.repeats && lastClosedGroup && (lastClosedGroup.hasQuantifier || lastClosedGroup.hasAlternation)) {
          throw new UnsafePatternError(
            'A repeated group may not contain another quantifier or an alternation (risk of catastrophic backtracking)',
          );
        }
        stack[stack.length - 1].hasQuantifier ||= quantifier.repeats;
        i += quantifier.length;
        // Lazy/possessive suffix
        if (pattern[i] === '?') i++;
        lastClosedGroup = null;
      } else {
        lastClosedGroup = null;
        i++;
      }
    }
  }
}

export interface RegexMatch {
  index: number;
  match: string;
}

/**
 * Source for the matcher thread. It is a fixed string in this file, never built
 * from request data: patterns and text arrive as message data only.
 */
const WORKER_SOURCE = `
const { parentPort } = require('worker_threads');
parentPort.on('message', (job) => {
  try {
    const flags = job.flags.replace(/g/g, '');
    if (job.op === 'matchAll') {
      const re = new RegExp(job.pattern, flags + 'g');
      const out = [];
      let m;
      while ((m = re.exec(job.text)) !== null) {
        out.push({ index: m.index, match: m[0].slice(0, 200) });
        if (m[0].length === 0) re.lastIndex++;
        if (out.length >= job.limit) break;
      }
      parentPort.postMessage({ id: job.id, ok: true, result: out });
    } else {
      const re = new RegExp(job.pattern, flags);
      parentPort.postMessage({ id: job.id, ok: true, result: job.values.map((v) => re.test(v)) });
    }
  } catch (error) {
    parentPort.postMessage({ id: job.id, ok: false, error: String(error && error.message) });
  }
});
`;

interface Job {
  id: number;
  payload: Record<string, unknown>;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}

/**
 * Runs rule patterns in a separate thread with a time budget per call. If a
 * pattern runs too long the thread is terminated (which interrupts the regex
 * engine) and replaced, and the call fails with RegexTimeoutError. Calls are
 * queued and run one at a time.
 */
export class RegexRunner {
  private worker: Worker | null = null;
  private queue: Job[] = [];
  private current: Job | null = null;
  private timer: NodeJS.Timeout | null = null;
  private nextId = 1;
  private closed = false;

  constructor(private readonly budgetMs = Number(process.env.GOVERNANCE_REGEX_BUDGET_MS) || 500) {}

  /** Every match of `pattern` in `text` (at most `limit`) */
  matchAll(pattern: string, flags: string, text: string, limit: number = LIMITS.matchesPerRule): Promise<RegexMatch[]> {
    return this.enqueue({ op: 'matchAll', pattern, flags, text, limit });
  }

  /** Whether `pattern` matches each value */
  testEach(pattern: string, flags: string, values: string[]): Promise<boolean[]> {
    if (values.length === 0) return Promise.resolve([]);
    return this.enqueue({ op: 'testEach', pattern, flags, values });
  }

  /** Stops the thread; later calls start a new one */
  async close(): Promise<void> {
    this.closed = true;
    for (const job of this.queue.splice(0)) job.reject(new Error('Regex runner closed'));
    if (this.current) this.current.reject(new Error('Regex runner closed'));
    this.current = null;
    this.clearTimer();
    const worker = this.worker;
    this.worker = null;
    if (worker) await worker.terminate();
  }

  private enqueue<T>(payload: Record<string, unknown>): Promise<T> {
    this.closed = false;
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ id: this.nextId++, payload, resolve, reject });
      this.pump();
    });
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const worker = new Worker(WORKER_SOURCE, { eval: true });
    worker.unref();
    worker.on('message', (message: { id: number; ok: boolean; result?: unknown; error?: string }) => {
      const job = this.current;
      if (!job || job.id !== message.id) return;
      this.clearTimer();
      this.current = null;
      if (message.ok) job.resolve(message.result);
      else job.reject(new UnsafePatternError(message.error ?? 'Pattern failed'));
      this.pump();
    });
    worker.on('error', (error) => {
      const job = this.current;
      this.current = null;
      this.clearTimer();
      if (this.worker === worker) this.worker = null;
      job?.reject(error);
      this.pump();
    });
    worker.on('exit', () => {
      if (this.worker === worker) this.worker = null;
    });
    this.worker = worker;
    return worker;
  }

  private pump(): void {
    if (this.current || this.closed) return;
    const job = this.queue.shift();
    if (!job) return;
    this.current = job;
    const worker = this.ensureWorker();
    this.timer = setTimeout(() => {
      if (this.current !== job) return;
      this.current = null;
      this.worker = null;
      void worker.terminate();
      job.reject(new RegexTimeoutError(this.budgetMs));
      this.pump();
    }, this.budgetMs);
    worker.postMessage({ id: job.id, ...job.payload });
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
