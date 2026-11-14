import { ServiceUnavailableException } from '@nestjs/common';

/** Caps concurrent work; callers beyond `maxQueued` waiting get a 503 instead of piling up */
export class Semaphore {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(
    private readonly max: number,
    private readonly maxQueued = 20,
  ) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await task();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.active < this.max) {
      this.active++;
      return Promise.resolve();
    }
    if (this.waiting.length >= this.maxQueued) {
      return Promise.reject(new ServiceUnavailableException('Too many scans are running, please try again shortly'));
    }
    return new Promise((resolve) => this.waiting.push(() => {
      this.active++;
      resolve();
    }));
  }

  private release(): void {
    this.active--;
    this.waiting.shift()?.();
  }
}

/**
 * Runs `work` with a total time limit. When the limit passes, `onTimeout`
 * runs (it should stop the work, e.g. close the browser) and the call rejects
 * with `timeoutError()` straight away, without waiting for the work to
 * notice. Whatever the abandoned work does later is ignored.
 */
export async function withDeadline<T>(ms: number, work: () => Promise<T>, onTimeout: () => Promise<unknown> | void, timeoutError: () => Error): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const running = work();
  running.catch(() => undefined);
  const expired = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      Promise.resolve()
        .then(onTimeout)
        .catch(() => undefined);
      reject(timeoutError());
    }, ms);
  });
  try {
    return await Promise.race([running, expired]);
  } finally {
    clearTimeout(timer);
  }
}
