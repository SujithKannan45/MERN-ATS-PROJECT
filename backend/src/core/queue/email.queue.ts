import { AsyncQueue } from './queue.service.js';
import { emailService } from '../../modules/email/services/email.service.js';
import { logger } from '../logger/logger.js';

export interface IEmailJobData {
  type:
    | 'WELCOME'
    | 'VERIFY_EMAIL'
    | 'FORGOT_PASSWORD'
    | 'PASSWORD_RESET_SUCCESS'
    | 'PASSWORD_CHANGED'
    | 'RESUME_UPLOADED'
    | 'RESUME_ANALYZED'
    | 'INTERVIEW_REMINDER'
    | 'JOB_STATUS_CHANGED'
    | 'OFFER_RECEIVED'
    | 'SECURITY_ALERT'
    | 'CUSTOM';
  to: string;
  name?: string;
  token?: string;
  subject?: string;
  html?: string;
  score?: number;
  fileName?: string;
  version?: number;
  suggestions?: string[];
  jobTitle?: string;
  companyName?: string;
  interviewDate?: string;
  newStatus?: string;
  notes?: string;
  alertTitle?: string;
  alertMessage?: string;
}

class EmailQueueManager {
  private static instance: EmailQueueManager;
  public readonly queue: AsyncQueue<IEmailJobData>;

  private constructor() {
    this.queue = new AsyncQueue<IEmailJobData>('EmailQueue', 5);
    this.registerHandlers();
  }

  public static getInstance(): EmailQueueManager {
    if (!EmailQueueManager.instance) {
      EmailQueueManager.instance = new EmailQueueManager();
    }
    return EmailQueueManager.instance;
  }

  private registerHandlers(): void {
    this.queue.registerHandler('SEND_EMAIL', async (data: IEmailJobData) => {
      logger.debug(`[EmailQueue] Processing ${data.type} email for: ${data.to}`);

      switch (data.type) {
        case 'WELCOME':
          await emailService.sendWelcomeEmail(data.to, data.name || 'Candidate');
          break;
        case 'VERIFY_EMAIL':
          await emailService.sendVerificationEmail(data.to, data.name || 'Candidate', data.token || '');
          break;
        case 'FORGOT_PASSWORD':
          await emailService.sendForgotPasswordEmail(data.to, data.name || 'User', data.token || '');
          break;
        case 'PASSWORD_RESET_SUCCESS':
          await emailService.sendPasswordResetSuccessEmail(data.to, data.name || 'User');
          break;
        case 'PASSWORD_CHANGED':
          await emailService.sendPasswordChangedEmail(data.to, data.name || 'User');
          break;
        case 'RESUME_UPLOADED':
          await emailService.sendResumeUploadedEmail(
            data.to,
            data.name || 'Candidate',
            data.fileName || 'Resume',
            data.version || 1
          );
          break;
        case 'RESUME_ANALYZED':
          await emailService.sendResumeAnalyzedEmail(
            data.to,
            data.name || 'Candidate',
            data.score || 0,
            data.suggestions
          );
          break;
        case 'INTERVIEW_REMINDER':
          await emailService.sendInterviewReminderEmail(
            data.to,
            data.name || 'Candidate',
            data.jobTitle || 'Role',
            data.companyName || 'Company',
            data.interviewDate || 'Upcoming',
            data.notes
          );
          break;
        case 'JOB_STATUS_CHANGED':
          await emailService.sendJobStatusChangedEmail(
            data.to,
            data.name || 'Candidate',
            data.jobTitle || 'Role',
            data.companyName || 'Company',
            data.newStatus || 'Updated'
          );
          break;
        case 'OFFER_RECEIVED':
          await emailService.sendOfferReceivedEmail(
            data.to,
            data.name || 'Candidate',
            data.jobTitle || 'Role',
            data.companyName || 'Company'
          );
          break;
        case 'SECURITY_ALERT':
          await emailService.sendSecurityAlertEmail(
            data.to,
            data.name || 'User',
            data.alertTitle || 'Security Notice',
            data.alertMessage || ''
          );
          break;
        case 'CUSTOM':
          if (data.subject && data.html) {
            await emailService.sendMail({ to: data.to, subject: data.subject, html: data.html });
          }
          break;
        default:
          logger.warn(`[EmailQueue] Unknown email job type: ${(data as unknown as { type: string }).type}`);
      }
    });
  }

  public enqueueEmail(data: IEmailJobData): string {
    return this.queue.add('SEND_EMAIL', data, { maxRetries: 3, retryDelayMs: 1500 });
  }
}

export const emailQueue = EmailQueueManager.getInstance();
