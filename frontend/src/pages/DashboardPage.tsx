import * as React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Bell,
  RefreshCw,
  FolderKanban,
  Target,
  FileCheck,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { dashboardService } from '@/services/dashboard.service';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { staggerContainer, staggerItem } from '@/animations';

export function DashboardPage() {
  const { user } = useAuthStore();

  // 1. Fetch Dashboard Analytics Overview
  const {
    data: overview,
    isLoading: loadingOverview,
    isError: errorOverview,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => dashboardService.getOverview(),
  });

  // 2. Fetch Recent Tracked Jobs
  const {
    data: recentJobsData,
    isLoading: loadingJobs,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ['dashboard-recent-jobs'],
    queryFn: () => dashboardService.getRecentJobs(5),
  });

  // 3. Fetch Recent Notifications
  const {
    data: notifications = [],
    isLoading: loadingNotifications,
  } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: () => dashboardService.getRecentNotifications(4),
  });

  const resumeAnalytics = overview?.resumeAnalytics;
  const jobAnalytics = overview?.jobAnalytics;
  const aiAnalytics = overview?.aiAnalytics;

  const totalResumes = resumeAnalytics?.totalResumes ?? 0;
  const avgAtsScore = resumeAnalytics?.averageAtsScore ? Math.round(resumeAnalytics.averageAtsScore) : 0;
  const totalJobs = jobAnalytics?.totalJobs ?? 0;
  const activeApplications = (jobAnalytics?.appliedJobs ?? 0) + (jobAnalytics?.interviewScheduled ?? 0);
  const interviewCount = (jobAnalytics?.interviewScheduled ?? 0) + (jobAnalytics?.interviewCompleted ?? 0);

  const metrics = [
    {
      title: 'Active Resumes',
      value: loadingOverview ? '...' : `${totalResumes}`,
      subtext: resumeAnalytics?.latestResume
        ? `Latest: ${resumeAnalytics.latestResume.fileName.slice(0, 20)}`
        : 'No resumes uploaded',
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      highlight: resumeAnalytics?.latestResume ? `v${resumeAnalytics.latestResume.version}` : 'Upload now',
    },
    {
      title: 'Average ATS Score',
      value: loadingOverview ? '...' : `${avgAtsScore}%`,
      subtext: resumeAnalytics?.highestAtsScore
        ? `Highest match: ${Math.round(resumeAnalytics.highestAtsScore)}%`
        : 'Analyze with Gemini',
      icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
      highlight: avgAtsScore >= 75 ? 'Strong Match' : avgAtsScore > 0 ? 'Needs Tuning' : 'No data',
    },
    {
      title: 'Active Applications',
      value: loadingOverview ? '...' : `${activeApplications}`,
      subtext: `${totalJobs} total jobs tracked in Kanban`,
      icon: <Briefcase className="h-5 w-5 text-purple-500" />,
      highlight: `${jobAnalytics?.offers ?? 0} offers received`,
    },
    {
      title: 'Interview Funnel',
      value: loadingOverview ? '...' : `${interviewCount}`,
      subtext: `${jobAnalytics?.offers ?? 0} offers extended`,
      icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
      highlight: totalJobs > 0 ? `${Math.round((interviewCount / totalJobs) * 100)}% conversion` : 'Ready',
    },
  ];

  if (errorOverview) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Welcome back, ${user?.fullName?.split(' ')[0] || 'Candidate'} 👋`}
          description="Error loading your analytics. Please verify your connection."
        />
        <ErrorState
          title="Could not load dashboard statistics"
          message="We were unable to reach the analytics service. Please verify your backend server is running."
          onRetry={() => {
            refetchOverview();
            refetchJobs();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header with Quick Actions */}
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(' ')[0] || 'Candidate'} 👋`}
        description="Here is what is happening with your job applications and resume optimizations today."
        action={
          <div className="flex items-center gap-2">
            <Link to="/ai-analysis">
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Run AI Audit
              </Button>
            </Link>
            <Link to="/resumes">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Upload Resume
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metrics Row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {metrics.map((m) => (
          <motion.div key={m.title} variants={staggerItem}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {m.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted/60">{m.icon}</div>
              </CardHeader>
              <CardContent>
                {loadingOverview ? (
                  <Skeleton className="h-8 w-24 my-1" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{m.value}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1 truncate">{m.subtext}</p>
                <div className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {m.highlight}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Recent Tracked Jobs & Resume Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Jobs Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Recent Job Applications</CardTitle>
                <p className="text-xs text-muted-foreground">Tracked in your Kanban workflow</p>
              </div>
              <Link to="/jobs">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View Kanban <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loadingJobs ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : recentJobsData && recentJobsData.jobs.length > 0 ? (
                <div className="space-y-3">
                  {recentJobsData.jobs.map((job) => (
                    <div
                      key={job._id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">{job.jobTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.companyName} {job.location ? `• ${job.location}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            job.status === 'Offer'
                              ? 'success'
                              : job.status === 'Interview'
                              ? 'info'
                              : job.status === 'Applied'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {job.status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground hidden sm:inline">
                          {new Date(job.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FolderKanban className="h-6 w-6" />}
                  title="No job applications tracked yet"
                  description="Add target jobs to track your pipeline from initial application to offer letter."
                  actionText="Add Target Job"
                  onAction={() => {}}
                />
              )}
            </CardContent>
          </Card>

          {/* ATS Score & Missing Skills Intelligence Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-base">Skill Alignment & Missing Keywords</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Aggregated from your Gemini AI job match analyses
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiAnalytics?.mostMissingSkills && aiAnalytics.mostMissingSkills.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    High-demand skills missing in your target jobs:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalytics.mostMissingSkills.map((item) => (
                      <Badge key={item.skill} variant="warning" className="gap-1.5 py-1">
                        <span>{item.skill}</span>
                        <span className="rounded-full bg-amber-500/20 px-1 text-[10px]">
                          {item.count} jobs
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Run an AI job comparison in the <strong>AI Analysis</strong> tab to uncover keyword gaps.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Active Resume & AI Action Items & Notifications */}
        <div className="space-y-6">
          {/* Active Resume Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-sm font-semibold">Active Resume</CardTitle>
              </div>
              <Link to="/resumes" className="text-xs text-primary hover:underline">
                Manage
              </Link>
            </CardHeader>
            <CardContent>
              {resumeAnalytics?.latestResume ? (
                <div className="space-y-2 p-3 rounded-lg border border-border bg-card/60">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold truncate text-foreground">
                      {resumeAnalytics.latestResume.fileName}
                    </p>
                    <Badge variant="outline" className="text-[10px]">
                      v{resumeAnalytics.latestResume.version}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Uploaded: {new Date(resumeAnalytics.latestResume.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="pt-2">
                    <a
                      href={resumeAnalytics.latestResume.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View Extracted Cloud Asset <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <p className="text-xs text-muted-foreground">No active resume in your vault</p>
                  <Link to="/resumes">
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Upload PDF/DOCX
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Action Plan Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">AI Recommendations</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Action items to boost recruiter response</p>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-500/10 text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Optimize ATS Formatting</p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Single-column layouts with standard headings score 18% higher.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-indigo-500/10 text-indigo-900 dark:text-indigo-200">
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Keyword Density Check</p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Match at least 80% of required technical terms before applying.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">Recent Alerts</CardTitle>
              </div>
              <Link to="/notifications" className="text-xs text-primary hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {loadingNotifications ? (
                <Skeleton className="h-14 w-full" />
              ) : notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.slice(0, 3).map((n) => (
                    <div
                      key={n._id}
                      className="p-2.5 rounded-lg border border-border/80 bg-background text-xs space-y-0.5"
                    >
                      <p className="font-semibold text-foreground truncate">{n.title}</p>
                      <p className="text-muted-foreground text-[11px] line-clamp-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No alerts at this moment
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
