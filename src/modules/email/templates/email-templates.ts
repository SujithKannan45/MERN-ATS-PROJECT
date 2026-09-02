import { envConfig } from '../../../config/env.config.js';

/**
 * Base responsive HTML email wrapper with modern styling, company branding, CTA button formatting, and footer
 */
export const baseEmailLayout = (title: string, contentHtml: string): string => {
  const currentYear = new Date().getFullYear();
  const appName = envConfig.APP_NAME || 'AI ATS Platform';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f8;
      color: #333333;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f6f8;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      padding: 32px 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px 28px;
      line-height: 1.6;
      font-size: 15px;
      color: #374151;
    }
    .btn {
      display: inline-block;
      padding: 12px 28px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .btn:hover {
      background-color: #1d4ed8;
    }
    .alert-box {
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 14px 18px;
      border-radius: 4px;
      margin: 18px 0;
      font-size: 14px;
      color: #1e40af;
    }
    .score-badge {
      display: inline-block;
      font-size: 24px;
      font-weight: 800;
      color: #2563eb;
      background: #eff6ff;
      padding: 8px 16px;
      border-radius: 8px;
      margin: 12px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${appName}</h1>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        <p>© ${currentYear} ${appName}. All rights reserved.</p>
        <p>This is an automated operational notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export const EmailTemplates = {
  welcome: (name: string, loginUrl: string) => {
    const title = 'Welcome to AI ATS Platform';
    const content = `
      <h2>Welcome aboard, ${name}! 🎉</h2>
      <p>Thank you for joining our AI-Powered ATS Resume Builder & Job Tracking Platform.</p>
      <p>Here is what you can accomplish with your new account:</p>
      <ul>
        <li><strong>Upload & Parse:</strong> Ingest existing PDF & DOCX resumes into structured profiles.</li>
        <li><strong>AI ATS Scoring:</strong> Get instant 0–100 match ratings against target job descriptions.</li>
        <li><strong>Job Tracking:</strong> Organize your complete application pipeline with Kanban boards.</li>
      </ul>
      <div style="text-align: center;">
        <a href="${loginUrl}" class="btn">Access Your Dashboard</a>
      </div>
      <p>If you have any questions, our support team is always here to assist you.</p>
    `;
    return { subject: title, html: baseEmailLayout(title, content) };
  },

  emailVerification: (name: string, verificationUrl: string, token: string) => {
    const title = 'Verify Your Email Address';
    const content = `
      <h2>Hello ${name},</h2>
      <p>Please verify your email address to activate your full platform capabilities.</p>
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="btn">Verify Email Address</a>
      </div>
      <p>Alternatively, you can copy and paste this verification link directly into your browser:</p>
      <div class="alert-box">
        <code>${verificationUrl}</code>
      </div>
      <p>Or submit this manual token in the verification window: <strong>${token}</strong></p>
      <p>This link will expire in 24 hours.</p>
    `;
    return { subject: title, html: baseEmailLayout(title, content) };
  },

  forgotPassword: (name: string, resetUrl: string, token: string) => {
    const title = 'Password Reset Request';
    const content = `
      <h2>Hello ${name},</h2>
      <p>We received a request to reset the password for your account.</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </div>
      <p>Or use this reset link:</p>
      <div class="alert-box">
        <code>${resetUrl}</code>
      </div>
      <p>Reset Token: <strong>${token}</strong></p>
      <p><strong>Note:</strong> This link is valid for 15 minutes. If you did not request a password reset, please ignore this email or contact support immediately.</p>
    `;
    return { subject: title, html: baseEmailLayout(title, content) };
  },

  passwordResetSuccess: (name: string, loginUrl: string) => {
    const title = 'Password Reset Successful';
    const content = `
      <h2>Hello ${name},</h2>
      <p>Your password has been successfully reset. All prior active sessions have been invalidated for your security.</p>
      <div style="text-align: center;">
        <a href="${loginUrl}" class="btn">Log In With New Password</a>
      </div>
      <p>If you did not make this change, please reach out to our security team immediately.</p>
    `;
    return { subject: title, html: baseEmailLayout(title, content) };
  },

  passwordChanged: (name: string, changeDate: string) => {
    const title = 'Security Notification: Password Changed';
    const content = `
      <h2>Hello ${name},</h2>
      <p>This is a confirmation that the password for your account was updated on <strong>${changeDate}</strong>.</p>
      <div class="alert-box">
        If you initiated this change, no further action is required.
      </div>
      <p>If you did not authorize this change, please reset your password immediately and contact support.</p>
    `;
    return { subject: title, html: baseEmailLayout(title, content) };
  },

  resumeUploaded: (name: string, fileName: string, version: number, analysisUrl: string) => {
    const title = 'Resume Successfully Uploaded';
    const content = `
      <h2>Hello ${name},</h2>
      <p>Your resume <strong>"${fileName}"</strong> (Version ${version}) was successfully uploaded and parsed.</p>
      <p>Our extraction engine has extracted your technical skills, work experiences, and education.</p>
      <div style="text-align: center;">
        <a href="${analysisUrl}" class="btn">Run AI ATS Analysis</a>
      </div>
      <p>You can now test this resume against any target job opening to get tailored optimization suggestions.</p>
    `;
    return { subject: title, html: baseEmailLayout(title, content) };
  },

  resumeAnalyzed: (name: string, overallScore: number, reportUrl: string, topSuggestions: string[] = []) => {
    const title = 'AI Resume ATS Analysis Complete';
    const suggestionsList =
      topSuggestions.length > 0
        ? `<h3>Key Recommendations:</h3><ul>${topSuggestions.map((s) => `<li>${s}</li>`).join('')}</ul>`
        : '';

    const content = `
      <h2>Hello ${name},</h2>
      <p>Google Gemini AI has completed the ATS evaluation for your resume.</p>
      <div style="text-align: center;">
        <div class="score-badge">ATS Score: ${overallScore}/100</div>
      </div>
      ${suggestionsList}
      <div style="text-align: center;">
        <a href="${reportUrl}" class="btn">View Complete Analysis Report</a>
      </div>
    `;
    return { subject: title, html: baseEmailLayout(title, content) };
  },

  interviewReminder: (
    name: string,
    jobTitle: string,
    companyName: string,
    interviewDate: string,
    notes?: string
  ) => {
    const title = `Interview Reminder: ${companyName} (${jobTitle})`;
    const notesHtml = notes ? `<div class="alert-box"><strong>Interview Notes:</strong><br>${notes}</div>` : '';

    const content = `
      <h2>Upcoming Interview Reminder</h2>
      <p>Hello ${name}, you have an interview scheduled soon with <strong>${companyName}</strong>.</p>
      <ul>
        <li><strong>Role:</strong> ${jobTitle}</li>
        <li><strong>Company:</strong> ${companyName}</li>
        <li><strong>Scheduled Date & Time:</strong> ${interviewDate}</li>
      </ul>
      ${notesHtml}
      <p>Best of luck with your interview preparation!</p>
    `;
    return { subject: title, html: baseEmailLayout(title, content) };
  },

  jobStatusChanged: (
    name: string,
    jobTitle: string,
    companyName: string,
    newStatus: string,
    jobUrl: string
  ) => {
    const title = `Application Update: ${jobTitle} at ${companyName}`;
    const content = `
      <h2>Hello ${name},</h2>
      <p>Your application for <strong>"${jobTitle}"</strong> at <strong>"${companyName}"</strong> has progressed.</p>
      <div class="alert-box">
        <strong>New Status:</strong> ${newStatus}
      </div>
      <div style="text-align: center;">
        <a href="${jobUrl}" class="btn">View In Job Tracker</a>
      </div>
    `;
    return { subject: title, html: baseEmailLayout(title, content) };
  },

  offerReceived: (name: string, jobTitle: string, companyName: string, dashboardUrl: string) => {
    const title = `Congratulations! Offer Received from ${companyName} 🎉`;
    const content = `
      <h2>Outstanding news, ${name}! 🎊</h2>
      <p>You have logged an offer received for <strong>"${jobTitle}"</strong> at <strong>"${companyName}"</strong>!</p>
      <div class="alert-box">
        Remember to evaluate your compensation breakdown, benefits, and start date timelines carefully.
      </div>
      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="btn">View Application Details</a>
      </div>
    `;
    return { subject: title, html: baseEmailLayout(title, content) };
  },

  securityAlert: (name: string, alertTitle: string, alertMessage: string, actionUrl: string) => {
    const title = `Security Alert: ${alertTitle}`;
    const content = `
      <h2>Security Alert</h2>
      <p>Hello ${name},</p>
      <div class="alert-box" style="border-left-color: #dc2626; background-color: #fef2f2; color: #991b1b;">
        <strong>${alertTitle}</strong><br>
        ${alertMessage}
      </div>
      <div style="text-align: center;">
        <a href="${actionUrl}" class="btn" style="background-color: #dc2626;">Review Security Settings</a>
      </div>
      <p>If you recognize this activity, no further action is necessary.</p>
    `;
    return { subject: title, html: baseEmailLayout(title, content) };
  },
};
