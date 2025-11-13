import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

export interface Job<T = unknown> {
  id: string;
  type: string;
  data: T;
  priority?: number;
  attempts?: number;
  maxAttempts?: number;
  delay?: number; // Delay in milliseconds before processing
  createdAt: Date;
}

export interface JobHandler<T = unknown> {
  handle(job: Job<T>): Promise<void>;
}

/**
 * Simple in-memory job queue service
 * In production, consider using Bull, BullMQ, or similar
 */
@Injectable()
export class JobQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(JobQueueService.name);
  private readonly queues = new Map<string, Job[]>();
  private readonly handlers = new Map<string, JobHandler>();
  private readonly processing = new Set<string>();
  private readonly intervals = new Map<string, NodeJS.Timeout>();
  private readonly defaultMaxAttempts = 3;
  private readonly defaultRetryDelay = 5000; // 5 seconds

  /**
   * Register a job handler
   */
  registerHandler<T>(type: string, handler: JobHandler<T>): void {
    this.handlers.set(type, handler);
    this.logger.log(`Registered handler for job type: ${type}`);
  }

  /**
   * Add a job to the queue
   */
  async add<T>(type: string, data: T, options?: {
    priority?: number;
    delay?: number;
    maxAttempts?: number;
  }): Promise<string> {
    const job: Job<T> = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      priority: options?.priority || 0,
      attempts: 0,
      maxAttempts: options?.maxAttempts || this.defaultMaxAttempts,
      delay: options?.delay || 0,
      createdAt: new Date(),
    };

    if (!this.queues.has(type)) {
      this.queues.set(type, []);
      this.startProcessing(type);
    }

    const queue = this.queues.get(type)!;
    queue.push(job);
    
    // Sort by priority (higher priority first)
    queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    this.logger.debug(`Added job ${job.id} of type ${type} to queue`);
    return job.id;
  }

  /**
   * Start processing jobs for a queue type
   */
  private startProcessing(type: string): void {
    if (this.intervals.has(type)) {
      return; // Already processing
    }

    const interval = setInterval(async () => {
      await this.processNext(type);
    }, 1000); // Check every second

    this.intervals.set(type, interval);
    this.logger.log(`Started processing queue for type: ${type}`);
  }

  /**
   * Process the next job in the queue
   */
  private async processNext(type: string): Promise<void> {
    const queue = this.queues.get(type);
    if (!queue || queue.length === 0) {
      return;
    }

    const handler = this.handlers.get(type);
    if (!handler) {
      this.logger.warn(`No handler registered for job type: ${type}`);
      return;
    }

    // Find next job that's ready (delay has passed)
    const now = Date.now();
    const jobIndex = queue.findIndex(job => {
      const delayPassed = !job.delay || (now - job.createdAt.getTime()) >= job.delay;
      return delayPassed && !this.processing.has(job.id);
    });

    if (jobIndex === -1) {
      return; // No jobs ready
    }

    const job = queue.splice(jobIndex, 1)[0];
    this.processing.add(job.id);

    try {
      await handler.handle(job);
      this.logger.debug(`Successfully processed job ${job.id} of type ${type}`);
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id} of type ${type}:`, error);
      
      // Retry if attempts remaining
      job.attempts = (job.attempts || 0) + 1;
      if (job.attempts < (job.maxAttempts || this.defaultMaxAttempts)) {
        // Re-add to queue with delay
        job.delay = this.defaultRetryDelay * job.attempts; // Exponential backoff
        job.createdAt = new Date(); // Reset creation time for delay calculation
        queue.push(job);
        queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        this.logger.debug(`Re-queued job ${job.id} for retry (attempt ${job.attempts})`);
      } else {
        this.logger.error(`Job ${job.id} exceeded max attempts, removing from queue`);
      }
    } finally {
      this.processing.delete(job.id);
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): Record<string, { queued: number; processing: number }> {
    const stats: Record<string, { queued: number; processing: number }> = {};

    for (const [type, queue] of this.queues.entries()) {
      const processing = Array.from(this.processing).filter(id => 
        queue.some(job => job.id === id)
      ).length;

      stats[type] = {
        queued: queue.length,
        processing,
      };
    }

    return stats;
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
    this.queues.clear();
    this.handlers.clear();
    this.processing.clear();
  }
}

