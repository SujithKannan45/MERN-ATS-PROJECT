import { EventEmitter } from 'events';
import { logger } from '../logger/logger.js';

export interface IJobOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  priority?: number;
}

export interface IQueueJob<T> {
  id: string;
  type: string;
  data: T;
  options: IJobOptions;
  attempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  processedAt?: Date;
}

export type JobHandler<T> = (data: T, job: IQueueJob<T>) => Promise<void>;

export class AsyncQueue<T> extends EventEmitter {
  private queueName: string;
  private jobs: IQueueJob<T>[] = [];
  private handlers: Map<string, JobHandler<T>> = new Map();
  private isRunning: boolean = true;
  private activeWorkers: number = 0;
  private maxConcurrency: number;

  constructor(queueName: string, maxConcurrency: number = 5) {
    super();
    this.queueName = queueName;
    this.maxConcurrency = maxConcurrency;
  }

  public registerHandler(jobType: string, handler: JobHandler<T>): void {
    this.handlers.set(jobType, handler);
  }

  public add(
    jobType: string,
    data: T,
    options: IJobOptions = { maxRetries: 3, retryDelayMs: 1000 }
  ): string {
    const job: IQueueJob<T> = {
      id: `${this.queueName}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: jobType,
      data,
      options: {
        maxRetries: options.maxRetries ?? 3,
        retryDelayMs: options.retryDelayMs ?? 1000,
        priority: options.priority ?? 0,
      },
      attempts: 0,
      status: 'pending',
      createdAt: new Date(),
    };

    this.jobs.push(job);
    logger.debug(`[Queue: ${this.queueName}] Job '${job.type}' (ID: ${job.id}) added to queue.`);
    this.processNext();
    return job.id;
  }

  private async processNext(): Promise<void> {
    if (!this.isRunning || this.activeWorkers >= this.maxConcurrency) {
      return;
    }

    const pendingJob = this.jobs.find((j) => j.status === 'pending');
    if (!pendingJob) {
      return;
    }

    pendingJob.status = 'processing';
    pendingJob.attempts++;
    pendingJob.processedAt = new Date();
    this.activeWorkers++;

    const handler = this.handlers.get(pendingJob.type);

    if (!handler) {
      logger.error(`[Queue: ${this.queueName}] No handler registered for job type '${pendingJob.type}'.`);
      pendingJob.status = 'failed';
      pendingJob.error = `No handler registered for '${pendingJob.type}'`;
      this.activeWorkers--;
      this.emit('failed', pendingJob);
      return;
    }

    try {
      await handler(pendingJob.data, pendingJob);
      pendingJob.status = 'completed';
      logger.debug(`[Queue: ${this.queueName}] Job '${pendingJob.id}' (${pendingJob.type}) completed successfully.`);
      this.emit('completed', pendingJob);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      logger.warn(
        `[Queue: ${this.queueName}] Job '${pendingJob.id}' (${pendingJob.type}) failed on attempt ${pendingJob.attempts}/${pendingJob.options.maxRetries}: ${errMessage}`
      );

      if (pendingJob.attempts < (pendingJob.options.maxRetries || 3)) {
        pendingJob.status = 'pending';
        const delay = (pendingJob.options.retryDelayMs || 1000) * Math.pow(2, pendingJob.attempts - 1);
        setTimeout(() => this.processNext(), delay);
      } else {
        pendingJob.status = 'failed';
        pendingJob.error = errMessage;
        logger.error(`[Queue: ${this.queueName}] Job '${pendingJob.id}' permanently failed after max retries.`);
        this.emit('failed', pendingJob);
      }
    } finally {
      this.activeWorkers--;
      // Remove finished jobs to prevent memory leaks while keeping recent 100
      if (this.jobs.length > 200) {
        this.jobs = this.jobs.filter((j) => j.status === 'pending' || j.status === 'processing');
      }
      this.processNext();
    }
  }

  public async shutdown(timeoutMs: number = 5000): Promise<void> {
    logger.info(`[Queue: ${this.queueName}] Shutting down queue, waiting for active jobs to finish...`);
    this.isRunning = false;

    const startTime = Date.now();
    while (this.activeWorkers > 0 && Date.now() - startTime < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    logger.info(`[Queue: ${this.queueName}] Queue shutdown completed. Active workers: ${this.activeWorkers}`);
  }

  public getStats(): { pending: number; processing: number; activeWorkers: number } {
    return {
      pending: this.jobs.filter((j) => j.status === 'pending').length,
      processing: this.jobs.filter((j) => j.status === 'processing').length,
      activeWorkers: this.activeWorkers,
    };
  }
}
