import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  FileText,
  RotateCcw,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { resumeService } from '@/services/resume.service';
import { jobService, type IJobResponse, type IJobMatchResponse } from '@/services/job.service';
import { toast } from '@/components/ui/Toast';

interface AiJobMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: IJobResponse | null;
  onMatchSuccess?: (updatedJob: IJobResponse) => void;
}

export function AiJobMatchModal({
  isOpen,
  onClose,
  job,
  onMatchSuccess,
}: AiJobMatchModalProps) {
  const queryClient = useQueryClient();

  // 1. Fetch Candidate's Current Active Resume
  const {
    data: activeResume,
    isLoading: loadingResume,
    isError: errorResume,
  } = useQuery({
    queryKey: ['current-resume'],
    queryFn: () => resumeService.getCurrentResume(),
    enabled: isOpen,
  });

  const [matchResult, setMatchResult] = React.useState<IJobMatchResponse | null>(null);

  // Sync existing match result from job if available
  React.useEffect(() => {
    if (job?.aiMatchResult) {
      setMatchResult({
        ...job.aiMatchResult,
        jobId: job.id,
        jobTitle: job.jobTitle,
        companyName: job.companyName,
      });
    } else {
      setMatchResult(null);
    }
  }, [job, isOpen]);

  // 2. Mutation for Running AI Match
  const matchMutation = useMutation({
    mutationFn: () => {
      if (!job) throw new Error('No job selected');
      return jobService.matchJobWithAI(job.id);
    },
    onSuccess: (data) => {
      setMatchResult(data);
      toast.success('AI ATS match analysis completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['tracked-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-dashboard-stats'] });
      if (job) {
        onMatchSuccess?.({
          ...job,
          aiMatchResult: data,
        });
      }
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'AI Match failed.');
    },
  });

  if (!job) return null;

  const score = matchResult?.overallMatchPercentage ?? 0;
  const scoreVariant =
    score >= 80 ? 'success' : score >= 65 ? 'info' : score >= 45 ? 'warning' : 'destructive';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Resume-to-Job Match Analysis"
      description={`Semantic ATS evaluation between your active resume and ${job.jobTitle} at ${job.companyName}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Active Resume Status Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Evaluation Resume Source</p>
              {loadingResume ? (
                <p className="text-xs text-muted-foreground animate-pulse">Checking active resume...</p>
              ) : activeResume ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-[320px]">
                    {activeResume.fileName}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    v{activeResume.version}
                  </Badge>
                </div>
              ) : (
                <p className="text-xs font-semibold text-rose-500">
                  No active resume found in vault. Please upload a resume first.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeResume ? (
              <Button
                size="sm"
                className="gap-2 shadow-sm"
                onClick={() => matchMutation.mutate()}
                isLoading={matchMutation.isPending}
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                {matchResult ? 'Re-run AI Match' : 'Run AI Match'}
              </Button>
            ) : (
              <Link to="/resumes">
                <Button size="sm" variant="outline" className="gap-2 text-xs">
                  Upload Resume First
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Loading State during Mutation */}
        {matchMutation.isPending && (
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground">Evaluating ATS Compatibility with Gemini AI</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Comparing skills keywords, required competencies, role experience, and formatting parameters against {job.jobTitle}...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {matchMutation.isError && !matchMutation.isPending && (
          <ErrorState
            title="AI Match Evaluation Error"
            message={
              (matchMutation.error as Error)?.message ||
              'Unable to match resume against job description. Please ensure the job description is provided.'
            }
            onRetry={() => matchMutation.mutate()}
          />
        )}

        {/* Existing / Computed Match Result View */}
        {matchResult && !matchMutation.isPending && (
          <div className="space-y-6">
            {/* Top Score Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Overall Match Percentage */}
              <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card shadow-sm text-center">
                <span className="text-xs font-medium text-muted-foreground mb-1">
                  Overall Alignment
                </span>
                <div className="relative flex items-center justify-center my-1">
                  <div className="text-4xl font-black tracking-tight text-foreground">
                    {matchResult.overallMatchPercentage}
                    <span className="text-xl text-primary font-bold">%</span>
                  </div>
                </div>
                <Badge
                  variant={
                    score >= 80 ? 'success' : score >= 60 ? 'secondary' : score >= 40 ? 'warning' : 'destructive'
                  }
                  className="mt-1"
                >
                  {score >= 80
                    ? 'Strong Fit'
                    : score >= 60
                    ? 'Competitive Match'
                    : score >= 40
                    ? 'Moderate Fit'
                    : 'Low Match'}
                </Badge>
              </div>

              {/* Keyword Match Score */}
              <div className="flex flex-col justify-center p-4 rounded-xl border border-border bg-card shadow-sm">
                <span className="text-xs font-medium text-muted-foreground mb-1">
                  Keyword & Skill Density
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {matchResult.keywordMatchScore}%
                  </span>
                  <span className="text-xs text-muted-foreground">match</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${matchResult.keywordMatchScore}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground mt-2">
                  {matchResult.matchingSkills.length} keywords matched
                </span>
              </div>

              {/* ATS Compatibility */}
              <div className="flex flex-col justify-center p-4 rounded-xl border border-border bg-card shadow-sm">
                <span className="text-xs font-medium text-muted-foreground mb-1">
                  ATS Scanner Friendliness
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {matchResult.atsCompatibility?.score || 0}%
                  </span>
                  <span className="text-xs text-muted-foreground">pass rate</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${matchResult.atsCompatibility?.score || 0}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground mt-2 truncate">
                  {matchResult.atsCompatibility?.feedback || 'Standard single-column ATS parser compatible'}
                </span>
              </div>
            </div>

            {/* Skills Alignment Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Matching Skills Found ({matchResult.matchingSkills.length})</span>
                </div>
                {matchResult.matchingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchingSkills.map((skill) => (
                      <Badge key={skill} variant="success" className="text-xs py-0.5">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No explicit skill overlaps detected in parsed text.
                  </p>
                )}
              </div>

              {/* Missing Skills */}
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Missing Skills in Resume ({matchResult.missingSkills.length})</span>
                </div>
                {matchResult.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingSkills.map((skill) => (
                      <Badge key={skill} variant="warning" className="text-xs py-0.5">
                        + {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    All target required skills matched in resume!
                  </p>
                )}
              </div>
            </div>

            {/* Experience Alignment */}
            <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Experience Alignment Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <Check className="h-3.5 w-3.5" /> Relevant Experiences
                  </span>
                  {matchResult.matchingExperience?.length > 0 ? (
                    <ul className="space-y-1.5 pl-3 list-disc text-muted-foreground">
                      {matchResult.matchingExperience.map((exp, idx) => (
                        <li key={idx}>{exp}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">None highlighted</p>
                  )}
                </div>

                <div>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                    <Zap className="h-3.5 w-3.5" /> Potential Experience Gaps
                  </span>
                  {matchResult.missingExperience?.length > 0 ? (
                    <ul className="space-y-1.5 pl-3 list-disc text-muted-foreground">
                      {matchResult.missingExperience.map((gap, idx) => (
                        <li key={idx}>{gap}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground italic">No gaps highlighted</p>
                  )}
                </div>
              </div>
            </div>

            {/* Strategic Match Explanation */}
            {matchResult.matchExplanation && (
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>AI Recruiter Recommendations & Advice</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {matchResult.matchExplanation}
                </p>
              </div>
            )}

            {/* Footer Action to optimize in Resume Builder */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Evaluated on {new Date(matchResult.analyzedAt).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-2">
                <Link to="/resume-builder" onClick={onClose}>
                  <Button variant="outline" size="sm" className="gap-2 text-xs">
                    Optimize in Resume Builder <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button size="sm" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State before running AI match */}
        {!matchResult && !matchMutation.isPending && !matchMutation.isError && (
          <div className="py-8 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-bold text-foreground">Run Instant Semantic ATS Scoring</h4>
              <p className="text-xs text-muted-foreground">
                Gemini AI will cross-examine your active resume against {job.companyName}&apos;s required skills, experience level, and role responsibilities.
              </p>
            </div>
            <Button
              onClick={() => matchMutation.mutate()}
              disabled={!activeResume}
              className="gap-2 shadow-sm"
            >
              <Sparkles className="h-4 w-4" /> Start AI Match Analysis
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
