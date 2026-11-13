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
