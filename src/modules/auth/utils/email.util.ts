import { emailQueue } from '../../../core/queue/email.queue.js';
import { logger } from '../../../core/logger/logger.js';

export class EmailUtil {
  public static async sendVerificationEmail(
    email: string,
    rawToken: string,
    name: string = 'Candidate'
  ): Promise<void> {
    logger.debug(`[Auth:EmailUtil] Enqueueing verification email to ${email}`);
    emailQueue.enqueueEmail({
      type: 'VERIFY_EMAIL',
      to: email,
      name,
      token: rawToken,
    });
  }

  public static async sendPasswordResetEmail(
    email: string,
    rawToken: string,
    name: string = 'User'
  ): Promise<void> {
    logger.debug(`[Auth:EmailUtil] Enqueueing password reset email to ${email}`);
    emailQueue.enqueueEmail({
      type: 'FORGOT_PASSWORD',
      to: email,
      name,
      token: rawToken,
    });
  }

  public static async sendWelcomeEmail(email: string, name: string = 'Candidate'): Promise<void> {
    emailQueue.enqueueEmail({
      type: 'WELCOME',
      to: email,
      name,
    });
  }

  public static async sendPasswordResetSuccessEmail(email: string, name: string = 'User'): Promise<void> {
    emailQueue.enqueueEmail({
      type: 'PASSWORD_RESET_SUCCESS',
      to: email,
      name,
    });
  }

  public static async sendPasswordChangedEmail(email: string, name: string = 'User'): Promise<void> {
    emailQueue.enqueueEmail({
      type: 'PASSWORD_CHANGED',
      to: email,
      name,
    });
  }
}
