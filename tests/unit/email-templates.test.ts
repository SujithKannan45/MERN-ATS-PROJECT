import { EmailTemplates } from '../../src/modules/email/templates/email-templates.js';

describe('EmailTemplates Unit Tests', () => {
  it('should render welcome email template with branding and login URL', () => {
    const { subject, html } = EmailTemplates.welcome('Alex', 'http://localhost:5173/login');
    expect(subject).toContain('Welcome');
    expect(html).toContain('Alex');
    expect(html).toContain('http://localhost:5173/login');
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('should render email verification template with verification link and token', () => {
    const { subject, html } = EmailTemplates.emailVerification(
      'Alex',
      'http://localhost:5173/verify?token=tok123',
      'tok123'
    );
    expect(subject).toContain('Verify Your Email');
    expect(html).toContain('tok123');
    expect(html).toContain('http://localhost:5173/verify?token=tok123');
  });

  it('should render forgot password template with reset link', () => {
    const { subject, html } = EmailTemplates.forgotPassword(
      'Alex',
      'http://localhost:5173/reset?token=tok456',
      'tok456'
    );
    expect(subject).toContain('Password Reset');
    expect(html).toContain('http://localhost:5173/reset?token=tok456');
  });

  it('should render password changed notification', () => {
    const { subject, html } = EmailTemplates.passwordChanged('Alex', 'Jan 1, 2026, 12:00 PM');
    expect(subject).toContain('Password Changed');
    expect(html).toContain('Jan 1, 2026, 12:00 PM');
  });

  it('should render resume analyzed template with score badge', () => {
    const { subject, html } = EmailTemplates.resumeAnalyzed(
      'Alex',
      88,
      'http://localhost:5173/report/1',
      ['Add keyword metrics', 'Quantify experience']
    );
    expect(subject).toContain('Analysis Complete');
    expect(html).toContain('88/100');
    expect(html).toContain('Add keyword metrics');
  });

  it('should render interview reminder template with role and company', () => {
    const { subject, html } = EmailTemplates.interviewReminder(
      'Alex',
      'Staff Backend Engineer',
      'Stripe',
      'Monday, Oct 12 at 10:00 AM',
      'Bring portfolio projects'
    );
    expect(subject).toContain('Stripe');
    expect(html).toContain('Staff Backend Engineer');
    expect(html).toContain('Bring portfolio projects');
  });

  it('should render job status changed template', () => {
    const { subject, html } = EmailTemplates.jobStatusChanged(
      'Alex',
      'Full Stack Developer',
      'Netflix',
      'Interview Scheduled',
      'http://localhost:5173/jobs/1'
    );
    expect(subject).toContain('Application Update');
    expect(html).toContain('Interview Scheduled');
  });

  it('should render offer received congratulations template', () => {
    const { subject, html } = EmailTemplates.offerReceived(
      'Alex',
      'Principal Engineer',
      'Microsoft',
      'http://localhost:5173/dashboard'
    );
    expect(subject).toContain('Offer Received');
    expect(html).toContain('Microsoft');
  });

  it('should render security alert template with custom title', () => {
    const { subject, html } = EmailTemplates.securityAlert(
      'Alex',
      'New device login from London',
      'An unfamiliar IP accessed your profile.',
      'http://localhost:5173/settings/security'
    );
    expect(subject).toContain('Security Alert');
    expect(html).toContain('New device login from London');
  });
});
