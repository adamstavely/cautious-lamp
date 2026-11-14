/**
 * Admission control for expensive work (a child process, a browser): at most
 * `maxRunning` jobs run at once, at most `maxRunning + maxQueued` are admitted
 * at all (running, waiting for a slot, or still receiving their upload), and
 * one caller holds at most `maxPerCaller` of them.
 *
 * Admission is a separate step from running so it can happen before a large
 * upload is staged: `admit()` either hands out a ticket or throws straight
 * away, and the ticket's `run()` waits for a slot later. A ticket that is
 * never run must be cancelled, or it holds its place.
 */

export interface AdmissionLimits {
  /** Jobs running at once */
  maxRunning: number;
  /** Admitted jobs beyond those running: waiting for a slot, or still uploading */
  maxQueued: number;
  /** Admitted jobs (running or not) per caller */
  maxPerCaller: number;
}

/** Why a job wasn't admitted: the whole pool is full, or this caller has its share */
export class AdmissionRejectedError extends Error {
  constructor(readonly reason: 'busy' | 'quota', message: string) {
    super(message);
  }
}

/** The ticket was cancelled (the client went away) before or while its job ran */
export class AdmissionCancelledError extends Error {}

type TicketState = 'admitted' | 'waiting' | 'running' | 'done';

export class AdmissionTicket {
  private state: TicketState = 'admitted';
  private readonly controller = new AbortController();
  private wake?: (granted: boolean) => void;

  constructor(
    private readonly pool: AdmissionPool,
    readonly caller: string,
  ) {}

  /** Aborted when the ticket is cancelled; pass it to the work so it can stop */
  get signal(): AbortSignal {
    return this.controller.signal;
  }

  get isDone(): boolean {
    return this.state === 'done';
  }

  /** Waits for a free slot, then runs the task. Rejects with AdmissionCancelledError if cancelled first. */
  async run<T>(task: (signal: AbortSignal) => Promise<T>): Promise<T> {
    if (this.state !== 'admitted') {
      throw new AdmissionCancelledError(this.state === 'done' ? 'The analysis was cancelled' : 'This ticket has already run');
    }
    if (this.pool.tryStart()) {
      this.state = 'running';
    } else {
      this.state = 'waiting';
      const granted = await new Promise<boolean>((resolve) => {
        this.wake = resolve;
        this.pool.enqueue(this);
      });
      if (!granted) throw new AdmissionCancelledError('The analysis was cancelled');
      this.state = 'running';
    }
    try {
      if (this.signal.aborted) throw new AdmissionCancelledError('The analysis was cancelled');
      return await task(this.signal);
    } finally {
      this.state = 'done';
      this.pool.finish(this, true);
    }
  }

  /**
   * Gives the place back. Not yet running: removed at once. Running: the
   * signal is aborted and the place is freed when the task settles. Done:
   * nothing. Safe to call any number of times.
   */
  cancel(): void {
    if (this.state === 'done') return;
    this.controller.abort();
    if (this.state === 'running') return;
    const wasWaiting = this.state === 'waiting';
    this.state = 'done';
    this.pool.finish(this, false);
    if (wasWaiting) this.grant(false);
  }

  /** Called by the pool when a slot is free (true) or the wait is over (false) */
  grant(granted: boolean): void {
    const wake = this.wake;
    this.wake = undefined;
    wake?.(granted);
  }
}

export class AdmissionPool {
  private running = 0;
  private readonly admitted = new Set<AdmissionTicket>();
  private readonly waiting: AdmissionTicket[] = [];
  private readonly perCaller = new Map<string, number>();

  constructor(readonly limits: AdmissionLimits) {}

  /** A place for `caller`, or AdmissionRejectedError straight away */
  admit(caller: string): AdmissionTicket {
    const mine = this.perCaller.get(caller) ?? 0;
    if (mine >= this.limits.maxPerCaller) {
      throw new AdmissionRejectedError('quota', `You already have ${mine} analyses running or queued; wait for one to finish`);
    }
    if (this.admitted.size >= this.limits.maxRunning + this.limits.maxQueued) {
      throw new AdmissionRejectedError('busy', 'Too many analyses are running or queued, please try again shortly');
    }
    const ticket = new AdmissionTicket(this, caller);
    this.admitted.add(ticket);
    this.perCaller.set(caller, mine + 1);
    return ticket;
  }

  /** Counts, for tests and status pages */
  stats(): { running: number; queued: number; admitted: number } {
    return { running: this.running, queued: this.admitted.size - this.running, admitted: this.admitted.size };
  }

  /** @internal Takes a slot if one is free and nobody is waiting ahead */
  tryStart(): boolean {
    if (this.running >= this.limits.maxRunning || this.waiting.length > 0) return false;
    this.running++;
    return true;
  }

  /** @internal */
  enqueue(ticket: AdmissionTicket): void {
    this.waiting.push(ticket);
  }

  /** @internal The ticket is done; `ran` says whether it held a slot */
  finish(ticket: AdmissionTicket, ran: boolean): void {
    if (!this.admitted.delete(ticket)) return;
    const index = this.waiting.indexOf(ticket);
    if (index >= 0) this.waiting.splice(index, 1);
    const left = (this.perCaller.get(ticket.caller) ?? 1) - 1;
    if (left > 0) this.perCaller.set(ticket.caller, left);
    else this.perCaller.delete(ticket.caller);
    if (ran) {
      const next = this.waiting.shift();
      if (next) next.grant(true); // the slot passes straight to the next in line
      else this.running--;
    }
  }
}
