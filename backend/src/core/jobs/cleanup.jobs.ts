import fs from 'fs';
import path from 'path';
import { User } from '../../modules/auth/models/user.model.js';
import { Notification } from '../../modules/notifications/models/notification.model.js';
import { AnalysisHistory } from '../../modules/ai/models/analysis-history.model.js';
import { envConfig } from '../../config/env.config.js';
import { logger } from '../logger/logger.js';

export class CleanupJobs {
  /**
   * Cleans up expired password reset tokens, verification tokens, and expired refresh tokens
   */
  public static async cleanupExpiredTokens(): Promise<{
    clearedResetTokens: number;
    clearedVerificationTokens: number;
    clearedRefreshTokens: number;
  }> {
    const now = new Date();

    try {
      // 1. Clear expired password reset tokens
      const resetResult = await User.updateMany(
        { passwordResetExpires: { $lt: now } },
        { $unset: { passwordResetToken: 1, passwordResetExpires: 1 } }
      ).exec();

      // 2. Clear expired email verification tokens
      const verifyResult = await User.updateMany(
        { emailVerificationExpires: { $lt: now } },
        { $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 } }
      ).exec();

      // 3. Purge expired refresh tokens from array
      const refreshResult = await User.updateMany(
        { 'refreshTokens.expiresAt': { $lt: now } },
        { $pull: { refreshTokens: { expiresAt: { $lt: now } } } }
      ).exec();

      logger.info('🧹 [Cron: Cleanup] Expired tokens cleanup completed', {
        clearedResetTokens: resetResult.modifiedCount,
        clearedVerificationTokens: verifyResult.modifiedCount,
        clearedRefreshTokens: refreshResult.modifiedCount,
      });

      return {
        clearedResetTokens: resetResult.modifiedCount,
        clearedVerificationTokens: verifyResult.modifiedCount,
        clearedRefreshTokens: refreshResult.modifiedCount,
      };
    } catch (error) {
      logger.error('❌ [Cron: Cleanup] Error cleaning up expired tokens:', { error });
      throw error;
    }
  }

  /**
   * Cleans up read notifications older than 30 days
   */
  public static async cleanupOldNotifications(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const result = await Notification.deleteMany({
        isRead: true,
        createdAt: { $lt: cutoffDate },
      }).exec();

      logger.info(`🧹 [Cron: Cleanup] Purged ${result.deletedCount} notifications older than ${retentionDays} days.`);
      return result.deletedCount;
    } catch (error) {
      logger.error('❌ [Cron: Cleanup] Error cleaning up old notifications:', { error });
      throw error;
    }
  }

  /**
   * Cleans up old log files older than 14 days from logs directory
   */
  public static async cleanupOldLogs(retentionDays: number = 14): Promise<number> {
    const logDir = path.resolve(process.cwd(), envConfig.LOG_DIR);
    if (!fs.existsSync(logDir)) {
      return 0;
    }

    let deletedCount = 0;
    const now = Date.now();
    const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;

    try {
      const files = await fs.promises.readdir(logDir);

      for (const file of files) {
        if (file.endsWith('.log') || file.endsWith('.gz')) {
          const filePath = path.join(logDir, file);
          const stats = await fs.promises.stat(filePath);
          if (now - stats.mtimeMs > maxAgeMs) {
            await fs.promises.unlink(filePath);
            deletedCount++;
          }
        }
      }

      logger.info(`🧹 [Cron: Cleanup] Purged ${deletedCount} log archives older than ${retentionDays} days.`);
      return deletedCount;
    } catch (error) {
      logger.error('❌ [Cron: Cleanup] Error cleaning up log files:', { error });
      return deletedCount;
    }
  }

  /**
   * Cleans up stale orphan analysis history records older than 90 days
   */
  public static async cleanupStaleAiAnalyses(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const result = await AnalysisHistory.deleteMany({
        createdAt: { $lt: cutoffDate },
      }).exec();

      logger.info(`🧹 [Cron: Cleanup] Purged ${result.deletedCount} stale AI analysis reports older than ${retentionDays} days.`);
      return result.deletedCount;
    } catch (error) {
      logger.error('❌ [Cron: Cleanup] Error cleaning up stale AI analyses:', { error });
      throw error;
    }
  }
}
