import cron, { ScheduledTask } from 'node-cron';
import { CleanupJobs } from '../jobs/cleanup.jobs.js';
import { ReminderJobs } from '../jobs/reminder.jobs.js';
import { logger } from '../logger/logger.js';
import { envConfig } from '../../config/env.config.js';

export class CronScheduler {
  private static instance: CronScheduler;
  private tasks: ScheduledTask[] = [];

  private constructor() {}

  public static getInstance(): CronScheduler {
    if (!CronScheduler.instance) {
      CronScheduler.instance = new CronScheduler();
    }
    return CronScheduler.instance;
  }

  public init(): void {
    if (envConfig.NODE_ENV === 'test') {
      logger.info('ℹ️ CronScheduler skipped in test environment.');
      return;
    }

    logger.info('⏰ Initializing Background Cron Scheduler tasks...');

    // 1. Daily Midnight Cleanup (Every day at 00:00) - Expired tokens
    const dailyTokenCleanup = cron.schedule('0 0 * * *', async () => {
      logger.info('🚀 [Cron] Running Daily Token Cleanup Job...');
      try {
        await CleanupJobs.cleanupExpiredTokens();
      } catch (err) {
        logger.error('[Cron] Error executing daily token cleanup:', { err });
      }
    });
    this.tasks.push(dailyTokenCleanup);

    // 2. Daily Morning Interview Reminder Job (Every day at 08:00 AM)
    const dailyInterviewReminders = cron.schedule('0 8 * * *', async () => {
      logger.info('🚀 [Cron] Running Daily Interview Reminder Job...');
      try {
        await ReminderJobs.sendUpcomingInterviewReminders();
      } catch (err) {
        logger.error('[Cron] Error executing interview reminder job:', { err });
      }
    });
    this.tasks.push(dailyInterviewReminders);

    // 3. Weekly Maintenance Job (Every Sunday at 03:00 AM)
    const weeklyMaintenance = cron.schedule('0 3 * * 0', async () => {
      logger.info('🚀 [Cron] Running Weekly Platform Maintenance Job...');
      try {
        await Promise.allSettled([
          CleanupJobs.cleanupOldNotifications(30),
          CleanupJobs.cleanupOldLogs(14),
          CleanupJobs.cleanupStaleAiAnalyses(90),
          ReminderJobs.sendWeeklyApplicationDigest(),
        ]);
        logger.info('✅ [Cron] Weekly Platform Maintenance Job completed successfully.');
      } catch (err) {
        logger.error('[Cron] Error executing weekly maintenance job:', { err });
      }
    });
    this.tasks.push(weeklyMaintenance);

    logger.info(`✅ CronScheduler started with ${this.tasks.length} active scheduled jobs.`);
  }

  public stopAll(): void {
    logger.info(`Stopping all ${this.tasks.length} active cron scheduler tasks...`);
    this.tasks.forEach((task) => task.stop());
    this.tasks = [];
  }
}

export const cronScheduler = CronScheduler.getInstance();
