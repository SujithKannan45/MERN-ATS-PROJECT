import nodemailer, { Transporter } from 'nodemailer';
import { envConfig } from '../../../config/env.config.js';
import { logger } from '../../../core/logger/logger.js';
import { IEmailService, ISendMailOptions } from './email.service.interface.js';
import { EmailTemplates } from '../templates/email-templates.js';

export class EmailService implements IEmailService {
  private static instance: EmailService;
  private transporter: Transporter;
  private isConfigured: boolean = false;

  constructor() {
    this.transporter = this.initTransporter();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initTransporter(): Transporter {
    const hasCredentials = Boolean(envConfig.SMTP_USER && envConfig.SMTP_PASS);

    if (hasCredentials) {
      this.isConfigured = true;
      return nodemailer.createTransport({
        host: envConfig.SMTP_HOST,
        port: envConfig.SMTP_PORT,
        secure: envConfig.SMTP_SECURE,
        auth: {
          user: envConfig.SMTP_USER,
          pass: envConfig.SMTP_PASS,
        },
      });
    }

    // Development / Local Stub Transporter (logs output without failing)
    logger.info('ℹ️ SMTP credentials not provided. EmailService running in development console mode.');
    this.isConfigured = false;
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal_user',
        pass: 'ethereal_pass',
      },
    });
  }

  private getClientBaseUrl(): string {
    return envConfig.CLIENT_URL || envConfig.ALLOWED_ORIGINS[0] || 'http://localhost:5173';
  }

  public async sendMail(options: ISendMailOptions): Promise<boolean> {
    try {
      if (!this.isConfigured && envConfig.NODE_ENV !== 'production') {
        logger.info(`📧 [DEV EMAIL SIMULATION] To: ${options.to} | Subject: ${options.subject}`);
        return true;
      }

      const info = await this.transporter.sendMail({
        from: envConfig.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
      });

      logger.info(`Email successfully dispatched to ${options.to}`, {
        messageId: info.messageId,
        subject: options.subject,
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}:`, {
        error: error instanceof Error ? error.message : String(error),
        subject: options.subject,
      });
      return false;
    }
  }

  public async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const loginUrl = `${this.getClientBaseUrl()}/login`;
    const { subject, html } = EmailTemplates.welcome(name, loginUrl);
    return this.sendMail({ to, subject, html });
  }

  public async sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
    const verificationUrl = `${this.getClientBaseUrl()}/verify-email?token=${token}`;
    const { subject, html } = EmailTemplates.emailVerification(name, verificationUrl, token);
    return this.sendMail({ to, subject, html });
  }

  public async sendForgotPasswordEmail(to: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `${this.getClientBaseUrl()}/reset-password?token=${token}`;
    const { subject, html } = EmailTemplates.forgotPassword(name, resetUrl, token);
    return this.sendMail({ to, subject, html });
  }

  public async sendPasswordResetSuccessEmail(to: string, name: string): Promise<boolean> {
    const loginUrl = `${this.getClientBaseUrl()}/login`;
    const { subject, html } = EmailTemplates.passwordResetSuccess(name, loginUrl);
    return this.sendMail({ to, subject, html });
  }

  public async sendPasswordChangedEmail(to: string, name: string): Promise<boolean> {
    const changeDate = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const { subject, html } = EmailTemplates.passwordChanged(name, changeDate);
    return this.sendMail({ to, subject, html });
  }

  public async sendResumeUploadedEmail(
    to: string,
    name: string,
    fileName: string,
    version: number
  ): Promise<boolean> {
    const analysisUrl = `${this.getClientBaseUrl()}/resume-analyzer`;
    const { subject, html } = EmailTemplates.resumeUploaded(name, fileName, version, analysisUrl);
    return this.sendMail({ to, subject, html });
  }

  public async sendResumeAnalyzedEmail(
    to: string,
    name: string,
    score: number,
    suggestions: string[] = []
  ): Promise<boolean> {
    const reportUrl = `${this.getClientBaseUrl()}/analysis-report`;
    const { subject, html } = EmailTemplates.resumeAnalyzed(name, score, reportUrl, suggestions);
    return this.sendMail({ to, subject, html });
  }

  public async sendInterviewReminderEmail(
    to: string,
    name: string,
    jobTitle: string,
    companyName: string,
    date: string,
    notes?: string
  ): Promise<boolean> {
    const { subject, html } = EmailTemplates.interviewReminder(name, jobTitle, companyName, date, notes);
    return this.sendMail({ to, subject, html });
  }

  public async sendJobStatusChangedEmail(
    to: string,
    name: string,
    jobTitle: string,
    companyName: string,
    newStatus: string
  ): Promise<boolean> {
    const jobUrl = `${this.getClientBaseUrl()}/job-tracker`;
    const { subject, html } = EmailTemplates.jobStatusChanged(name, jobTitle, companyName, newStatus, jobUrl);
    return this.sendMail({ to, subject, html });
  }

  public async sendOfferReceivedEmail(
    to: string,
    name: string,
    jobTitle: string,
    companyName: string
  ): Promise<boolean> {
    const dashboardUrl = `${this.getClientBaseUrl()}/dashboard`;
    const { subject, html } = EmailTemplates.offerReceived(name, jobTitle, companyName, dashboardUrl);
    return this.sendMail({ to, subject, html });
  }

  public async sendSecurityAlertEmail(
    to: string,
    name: string,
    title: string,
    message: string
  ): Promise<boolean> {
    const actionUrl = `${this.getClientBaseUrl()}/settings/security`;
    const { subject, html } = EmailTemplates.securityAlert(name, title, message, actionUrl);
    return this.sendMail({ to, subject, html });
  }
}

export const emailService = EmailService.getInstance();
