import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Briefcase,
  Sparkles,
  Trophy,
  Filter,
  Calendar,
  Layers,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { analyticsService } from '@/services/analytics.service';
import { MonthlyTrendsChart } from '@/components/analytics/MonthlyTrendsChart';
import { AtsScoreTrendChart } from '@/components/analytics/AtsScoreTrendChart';
import { StatusDistributionChart } from '@/components/analytics/StatusDistributionChart';
import { SkillsFrequencyChart } from '@/components/analytics/SkillsFrequencyChart';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState<'6m' | '12m' | 'all'>('6m');

  // 1. Fetch Dashboard Overview KPI Stats
  const {
    data: overview,
    isLoading: loadingOverview,
    isError: errorOverview,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: () => analyticsService.getOverview(),
  });

  // 2. Fetch Time-Series & Aggregate Chart Datasets
  const {
    data: charts,
    isLoading: loadingCharts,
    isError: errorCharts,
    refetch: refetchCharts,
  } = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: () => analyticsService.getCharts(),
  });

  const isLoading = loadingOverview || loadingCharts;
  const isError = errorOverview || errorCharts;

  const resumeStats = overview?.resumeAnalytics;
  const jobStats = overview?.jobAnalytics;
  const aiStats = overview?.aiAnalytics;

  const totalApps = jobStats?.totalJobs ?? 0;
  const interviewsCount = (jobStats?.interviewScheduled ?? 0) + (jobStats?.interviewCompleted ?? 0);
  const offersCount = (jobStats?.offers ?? 0) + (jobStats?.accepted ?? 0);
  const interviewRate = totalApps > 0 ? Math.round((interviewsCount / totalApps) * 100) : 0;
  const offerRate = totalApps > 0 ? Math.round((offersCount / totalApps) * 100) : 0;
  const avgAtsScore = resumeStats?.averageAtsScore ? Math.round(resumeStats.averageAtsScore) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Analytics & Telemetry"
        description="Comprehensive insights into your ATS resume score trajectory, interview conversion rates, and skill demands."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
        action={
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '6m' | '12m' | 'all')}
              className="text-xs rounded-lg border border-border bg-background px-3 py-1.5 font-medium text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="6m">Last 6 Months</option>
              <option value="12m">Past Year</option>
              <option value="all">All-Time Pipeline</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchOverview();
                refetchCharts();
              }}
              className="text-xs"
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      ) : isError ? (
        <ErrorState
          title="Telemetry Connection Failed"
          message="Unable to load analytics metrics from the API service. Please verify your connection."
          onRetry={() => {
            refetchOverview();
            refetchCharts();
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Top KPI Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 border-border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Applications</span>
                <Briefcase className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-foreground mt-2">{totalApps}</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {jobStats?.appliedJobs ?? 0} actively submitted
              </p>
            </Card>

            <Card className="p-4 border-border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Interview Conversion</span>
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-foreground mt-2">{interviewRate}%</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {interviewsCount} total interviews
              </p>
            </Card>

            <Card className="p-4 border-border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Offer Conversion</span>
                <Trophy className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-foreground mt-2 text-emerald-600 dark:text-emerald-400">
                {offerRate}%
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {offersCount} offers extended
              </p>
            </Card>

            <Card className="p-4 border-border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Average ATS Score</span>
                <Sparkles className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-foreground mt-2">{avgAtsScore}%</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Peak: {Math.round(resumeStats?.highestAtsScore ?? 0)}%
              </p>
            </Card>
          </div>

          {/* Row 1: Monthly Timeline Activity & ATS Progression */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MonthlyTrendsChart
              applications={charts?.monthlyApplications || []}
              resumeUploads={charts?.monthlyResumeUploads || []}
            />
            <AtsScoreTrendChart trend={charts?.atsScoreTrend || []} />
          </div>

          {/* Row 2: Status Distribution & Skill Frequency Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusDistributionChart distribution={charts?.jobStatusDistribution || []} />
            <SkillsFrequencyChart
              topSkills={charts?.topSkills || []}
              missingSkills={charts?.missingSkillsFrequency || []}
            />
          </div>

          {/* Application Funnel Breakdown Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recruitment Pipeline Funnel</CardTitle>
              <p className="text-xs text-muted-foreground">
                Progression through key milestones from application submission to accepted offer
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  {
                    stage: 'Saved',
                    count: jobStats?.savedJobs ?? 0,
                    color: 'text-slate-500 bg-slate-500/10',
                  },
                  {
                    stage: 'Applied',
                    count: jobStats?.appliedJobs ?? 0,
                    color: 'text-blue-500 bg-blue-500/10',
                  },
                  {
                    stage: 'Interview',
                    count: interviewsCount,
                    color: 'text-amber-500 bg-amber-500/10',
                  },
                  {
                    stage: 'Offer',
                    count: jobStats?.offers ?? 0,
                    color: 'text-emerald-500 bg-emerald-500/10',
                  },
                  {
                    stage: 'Accepted',
                    count: jobStats?.accepted ?? 0,
                    color: 'text-teal-500 bg-teal-500/10',
                  },
                ].map((step, idx) => (
                  <div
                    key={step.stage}
                    className="flex flex-col p-3 rounded-xl border border-border bg-muted/20 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Step {idx + 1}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${step.color}`}>
                        {step.stage}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-foreground">{step.count}</div>
                    <span className="text-[10px] text-muted-foreground">
                      {totalApps > 0 ? `${Math.round((step.count / totalApps) * 100)}% of total` : '0%'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
