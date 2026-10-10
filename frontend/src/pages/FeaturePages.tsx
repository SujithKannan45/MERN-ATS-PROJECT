import * as React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { FileText } from 'lucide-react';

export function ResumesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Vault"
        description="Manage your uploaded resumes, parsed markdown texts, and targeted versions."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Resumes' }]}
      />
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title="No resumes uploaded yet"
        description="Upload your current resume in PDF or DOCX format to trigger automated AI ATS analysis."
        actionText="Upload Resume"
        onAction={() => alert('Resume upload workflow will be fully connected in Prompt 12')}
      />
    </div>
  );
}

export function AIAnalysisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Resume & Job Matcher"
        description="Run deep semantic comparisons against job descriptions with Gemini AI."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'AI Analysis' }]}
      />
      <EmptyState
        title="Select a resume to analyze"
        description="Match your resume against any job description to view score breakdown and keyword gaps."
        actionText="Start AI Analysis"
        onAction={() => alert('Full AI Matcher will be completed in Prompt 12')}
      />
    </div>
  );
}

export function JobsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Application Pipeline"
        description="Kanban workflow for managing job applications, interview dates, and offers."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Jobs' }]}
      />
      <EmptyState
        title="Your job pipeline is ready"
        description="Add target jobs to track application dates, interview stages, and recruiter contacts."
        actionText="Add Target Job"
        onAction={() => alert('Kanban board will be populated in Prompt 12')}
      />
    </div>
  );
}

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Telemetry"
        description="Performance metrics on your application funnel, response rates, and resume versions."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
      />
      <EmptyState
        title="Telemetry gathering in progress"
        description="As you submit applications and optimize resumes, conversion rates will populate here."
      />
    </div>
  );
}

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Alerts on interview reminders, ATS scoring milestones, and system updates."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Notifications' }]}
      />
      <EmptyState
        title="You're all caught up"
        description="New interview reminders and analysis completions will appear here."
      />
    </div>
  );
}

export function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Profile"
        description="Manage your personal details, contact information, and target job preferences."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]}
      />
      <EmptyState
        title="Profile settings"
        description="Configure your career goals, target industries, and default resume profile."
      />
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Account & AI Settings"
        description="Manage security preferences, theme modes, and custom Gemini API keys."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />
      <EmptyState
        title="Platform Preferences"
        description="Configure email notifications, session preferences, and optional personal Gemini API keys."
      />
    </div>
  );
}
