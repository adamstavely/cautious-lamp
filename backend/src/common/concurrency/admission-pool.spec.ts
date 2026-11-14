import { AdmissionCancelledError, AdmissionPool, AdmissionRejectedError } from './admission-pool';

/** A task that runs until `finish()` is called, recording how many run at once */
function gate() {
  let open!: () => void;
  const opened = new Promise<void>((resolve) => (open = resolve));
  return { opened, finish: () => open() };
}

const tick = () => new Promise((resolve) => setImmediate(resolve));

describe('AdmissionPool', () => {
  it('runs at most maxRunning at once, admits at most maxRunning + maxQueued, and refuses the rest straight away', async () => {
    const pool = new AdmissionPool({ maxRunning: 2, maxQueued: 3, maxPerCaller: 10 });
    const g = gate();
    let active = 0;
    let peak = 0;
    const task = async () => {
      active++;
      peak = Math.max(peak, active);
      await g.opened;
      active--;
      return 'ok';
    };

    const outcomes: Array<Promise<string>> = [];
    const refusals: AdmissionRejectedError[] = [];
    for (let i = 0; i < 9; i++) {
      try {
        outcomes.push(pool.admit(`caller-${i}`).run(task));
      } catch (error) {
        refusals.push(error as AdmissionRejectedError);
      }
      await tick();
      expect(pool.stats().running).toBeLessThanOrEqual(2);
      expect(pool.stats().queued).toBeLessThanOrEqual(3);
    }

    expect(outcomes).toHaveLength(5);
    expect(refusals).toHaveLength(4);
    expect(refusals.every((e) => e instanceof AdmissionRejectedError && e.reason === 'busy')).toBe(true);
    expect(pool.stats()).toEqual({ running: 2, queued: 3, admitted: 5 });

    g.finish();
    expect(await Promise.all(outcomes)).toEqual(['ok', 'ok', 'ok', 'ok', 'ok']);
    expect(peak).toBe(2);
    expect(pool.stats()).toEqual({ running: 0, queued: 0, admitted: 0 });
  });

  it('limits each caller, counting places that are admitted but not yet running', async () => {
    const pool = new AdmissionPool({ maxRunning: 1, maxQueued: 10, maxPerCaller: 2 });
    const first = pool.admit('alice');
    pool.admit('alice');
    const refusal = (() => {
      try {
        pool.admit('alice');
      } catch (error) {
        return error as AdmissionRejectedError;
      }
    })();
    expect(refusal?.reason).toBe('quota');
    expect(() => pool.admit('bob')).not.toThrow();

    // A finished place is given back to its caller
    await first.run(async () => undefined);
    expect(() => pool.admit('alice')).not.toThrow();
  });

  it('cancelling a queued ticket frees its place and rejects its run; cancelling a running one aborts it', async () => {
    const pool = new AdmissionPool({ maxRunning: 1, maxQueued: 1, maxPerCaller: 5 });
    const running = pool.admit('a');
    let aborted = false;
    const first = running.run(
      (signal) =>
        new Promise<string>((_resolve, reject) =>
          signal.addEventListener('abort', () => {
            aborted = true;
            reject(new Error('stopped'));
          }),
        ),
    );
    const queued = pool.admit('a');
    const second = queued.run(async () => 'never');
    await tick();
    expect(() => pool.admit('b')).toThrow(AdmissionRejectedError);

    queued.cancel();
    await expect(second).rejects.toBeInstanceOf(AdmissionCancelledError);
    expect(pool.stats()).toEqual({ running: 1, queued: 0, admitted: 1 });

    running.cancel();
    await expect(first).rejects.toThrow('stopped');
    expect(aborted).toBe(true);
    expect(pool.stats()).toEqual({ running: 0, queued: 0, admitted: 0 });

    // A ticket cancelled before it ran never runs
    const never = pool.admit('c');
    never.cancel();
    await expect(never.run(async () => 'x')).rejects.toBeInstanceOf(AdmissionCancelledError);
    expect(pool.stats().admitted).toBe(0);
  });

  it('hands freed slots out in arrival order', async () => {
    const pool = new AdmissionPool({ maxRunning: 1, maxQueued: 3, maxPerCaller: 5 });
    const order: number[] = [];
    const g = gate();
    const runs = [0, 1, 2, 3].map((n) =>
      pool.admit('x').run(async () => {
        order.push(n);
        if (n === 0) await g.opened;
      }),
    );
    await tick();
    g.finish();
    await Promise.all(runs);
    expect(order).toEqual([0, 1, 2, 3]);
  });
});
