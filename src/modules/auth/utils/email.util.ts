import { logger } from '../../../core/logger/logger.js';
import { envConfig } from '../../../config/env.config.js';

export class EmailUtil {
  private static getClientBaseUrl(): string {
    const origins = envConfig.ALLOWED_ORIGINS;
    return origins[0] || 'http://localhost:5173';
  }

  public static async sendVerificationEmail(email: string, rawToken: string): Promise<void> {
    const clientUrl = this.getClientBaseUrl();
    const verificationUrl = `${clientUrl}/verify-email?token=${rawToken}`;

    logger.info(`📧 [Email Service] Sending Verification Email to: ${email}`, {
      recipient: email,
      verificationUrl,
      rawToken,
    });
  }

  public static async sendPasswordResetEmail(email: string, rawToken: string): Promise<void> {
    const clientUrl = this.getClientBaseUrl();
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    logger.info(`📧 [Email Service] Sending Password Reset Email to: ${email}`, {
      recipient: email,
      resetUrl,
      rawToken,
    });
  }
}
