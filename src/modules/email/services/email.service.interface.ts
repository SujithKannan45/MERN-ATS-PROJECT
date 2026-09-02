export interface ISendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  sendMail(options: ISendMailOptions): Promise<boolean>;
  sendWelcomeEmail(to: string, name: string): Promise<boolean>;
  sendVerificationEmail(to: string, name: string, token: string): Promise<boolean>;
  sendForgotPasswordEmail(to: string, name: string, token: string): Promise<boolean>;
  sendPasswordResetSuccessEmail(to: string, name: string): Promise<boolean>;
  sendPasswordChangedEmail(to: string, name: string): Promise<boolean>;
  sendResumeUploadedEmail(to: string, name: string, fileName: string, version: number): Promise<boolean>;
  sendResumeAnalyzedEmail(to: string, name: string, score: number, suggestions?: string[]): Promise<boolean>;
  sendInterviewReminderEmail(
    to: string,
    name: string,
    jobTitle: string,
    companyName: string,
    date: string,
    notes?: string
  ): Promise<boolean>;
  sendJobStatusChangedEmail(
    to: string,
    name: string,
    jobTitle: string,
    companyName: string,
    newStatus: string
  ): Promise<boolean>;
  sendOfferReceivedEmail(to: string, name: string, jobTitle: string, companyName: string): Promise<boolean>;
  sendSecurityAlertEmail(to: string, name: string, title: string, message: string): Promise<boolean>;
}
