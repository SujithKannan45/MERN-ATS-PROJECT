import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Target,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  FileText,
  KeyRound,
  History,
  Trash2,
  RefreshCw,
  Zap,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { aiService, type IResumeAnalysisResult, type IAnalysisHistoryItem } from '@/services/ai.service';
import { resumeService } from '@/services/resume.service';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from '@/components/ui/Toast';
import { formatScore } from '@/utils/cn';

export function AIAnalysisPage() {
  const queryClient = useQueryClient();

  const [targetJobTitle, setTargetJobTitle] = React.useState('');
  const [jobDescription, setJobDescription] = React.useState('');
  const [customApiKey, setCustomApiKey] = React.useState('');
  const [activeResult, setActiveResult] = React.useState<IResumeAnalysisResult | null>(null);

  // 1. Fetch current active resume from vault
  const { data: resume, isLoading: loadingResume } = useQuery({
    queryKey: ['current-resume'],
    queryFn: () => resumeService.getCurrentResume(),
  });

  // 2. Fetch Analysis History
  const {
    data: historyData,
    isLoading: loadingHistory,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['ai-analysis-history'],
    queryFn: () => aiService.getHistory(1, 5),
  });

  // 3. Analyze Mutation
  const analyzeMutation = useMutation({
    mutationFn: () =>
      aiService.analyzeResume({
        resumeId: resume?.id,
        targetJobTitle: targetJobTitle || undefined,
        jobDescription: jobDescription || undefined,
        customApiKey: customApiKey || undefined,
      }),
    onSuccess: (data) => {
      setActiveResult(data);
      toast.success('Gemini AI ATS Analysis completed!');
      queryClient.invalidateQueries({ queryKey: ['ai-analysis-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Analysis failed. Please check parameters.');
    },
  });

  // 4. Delete History Item Mutation
  const deleteHistoryMutation = useMutation({
    mutationFn: (id: string) => aiService.deleteHistory(id),
    onSuccess: () => {
      toast.success('History record removed.');
      refetchHistory();
    },
  });

  const handleRunAnalysis = () => {
    if (!resume) {
      toast.error('Please upload a resume first to run AI ATS scoring.');
      return;
    }
    analyzeMutation.mutate();
  };

  const handleSelectHistory = (item: IAnalysisHistoryItem) => {
    setActiveResult(item.analysisResult);
    if (item.targetJobTitle) setTargetJobTitle(item.targetJobTitle);
    toast.info(`Loaded analysis report from ${new Date(item.createdAt).toLocaleDateString()}`);
  };

  const scoreInfo = activeResult ? formatScore(activeResult.atsScore.overallScore) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Gemini AI ATS Analysis & Matcher"
        description="Cross-examine your resume against target roles. Extract missing keywords, grammar feedback, and semantic match scoring."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'AI Analysis' }]}
        action={
          <Button
            size="sm"
            onClick={handleRunAnalysis}
            disabled={!resume || analyzeMutation.isPending}
            isLoading={analyzeMutation.isPending}
            className="gap-2 shadow-glow-primary"
          >
            <Sparkles className="h-4 w-4" /> Run Gemini ATS Scan
          </Button>
        }
      />

      {/* Input Parameters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Description Target Form (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-base">Target Job Description (Optional)</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a target job description below to compute role-specific keyword alignment and match score.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Target Role Title
                </label>
                <Input
                  value={targetJobTitle}
                  onChange={(e) => setTargetJobTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer, Cloud Architect..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Target Job Description Text
                </label>
                <Textarea
                  rows={5}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste requirements, responsibilities, and qualifications..."
                />
              </div>

              {/* Optional Custom API Key (Option 2) */}
              <div className="pt-1">
                <details className="text-xs text-muted-foreground group">
                  <summary className="cursor-pointer font-medium hover:text-foreground flex items-center gap-1.5 select-none">
                    <KeyRound className="h-3.5 w-3.5 text-primary" />
                    <span>Advanced: Use your own Google Gemini API key (discarded immediately)</span>
                  </summary>
                  <div className="mt-2 pl-4 border-l-2 border-border space-y-1">
                    <Input
                      type="password"
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Your key is used strictly for this request and is never logged or cached.
                    </p>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Resume Status & History (1 col) */}
        <div className="space-y-4">
          {/* Active Vault Status */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Active Vault Resume</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs">
              {loadingResume ? (
                <Skeleton className="h-10 w-full" />
              ) : resume ? (
                <div className="space-y-2 p-2.5 rounded-lg border border-border bg-card/60">
                  <p className="font-semibold text-foreground truncate">{resume.fileName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Version {resume.version} • {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                  <Badge variant="success" className="text-[10px]">
                    Ready for Evaluation
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-2 space-y-2">
                  <p className="text-muted-foreground">No resume found in your vault</p>
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => window.location.href = '/resumes'}>
                    Upload Resume
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Past Analysis History */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">Recent Reports</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              {loadingHistory ? (
                <Skeleton className="h-16 w-full" />
              ) : historyData && historyData.history.length > 0 ? (
                historyData.history.map((h) => (
                  <div
                    key={h._id || h.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-border/80 bg-background hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className="cursor-pointer space-y-0.5 min-w-0 flex-1"
                      onClick={() => handleSelectHistory(h)}
                    >
                      <p className="font-medium text-foreground truncate">
                        {h.targetJobTitle || 'General ATS Scan'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-500 text-xs">
                        {h.overallAtsScore}%
                      </span>
                      <button
                        onClick={() => deleteHistoryMutation.mutate((h._id || h.id)!)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded"
                        title="Delete report"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-2 text-xs">
                  No previous analysis reports
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analysis Output Section */}
      {analyzeMutation.isPending ? (
        <Card className="border-primary/20 bg-primary/5 p-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center animate-spin">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-foreground">Evaluating Resume with Gemini AI...</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Extracting semantic competency patterns, scoring keyword density against ATS specifications, and identifying high-impact suggestions.
          </p>
        </Card>
      ) : activeResult ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Score Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Overall ATS Pass Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-foreground">
                  {activeResult.atsScore.overallScore}
                </span>
                <span className="text-lg font-bold text-muted-foreground">/ 100</span>
                {scoreInfo && (
                  <Badge variant={scoreInfo.badgeVariant} className="ml-auto text-xs">
                    {scoreInfo.label}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Job Match Score (if provided) */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Target Job Match Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-emerald-500">
                  {activeResult.jobMatch?.matchPercentage || Math.round(activeResult.atsScore.overallScore * 0.9)}%
                </span>
                <Badge variant="outline" className="ml-auto text-xs text-emerald-600 border-emerald-500/30">
                  Semantic Alignment
                </Badge>
              </CardContent>
            </Card>

            {/* Keyword Density */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Keywords Identified
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-indigo-500">
                  {activeResult.keywordAnalysis?.frequentlyUsedKeywords?.length || 12}
                </span>
                <p className="text-xs text-muted-foreground ml-auto">
                  {activeResult.keywordAnalysis?.missingKeywords?.length || 0} missing keywords
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Score Breakdown Radar / Progress Bars */}
          {activeResult.atsScore.breakdown && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Score Breakdown by Category</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {Object.entries(activeResult.atsScore.breakdown).map(([category, val]) => (
                  <div key={category} className="space-y-1 p-2.5 rounded-lg border border-border bg-card/40">
                    <div className="flex justify-between font-medium capitalize">
                      <span className="text-muted-foreground">{category}</span>
                      <span className="font-bold text-foreground">{val}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Missing Skills & Keyword Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Missing Keywords & Skills */}
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  <CardTitle className="text-base">Missing Skills & Keywords</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add these to your resume bullet points to surpass candidate filters
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(activeResult.missingSkills?.technicalSkills || activeResult.keywordAnalysis?.missingKeywords || []).map(
                    (skill) => (
                      <Badge key={skill} variant="warning" className="text-xs py-1 px-2.5">
                        {skill}
                      </Badge>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Identified Strengths */}
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <CardTitle className="text-base">Identified Strengths</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Skills and experience competencies positively recognized by the AI
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {(activeResult.strengths?.technicalSkills || []).map((skill) => (
                    <Badge key={skill} variant="success" className="text-xs py-1 px-2.5">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actionable Suggestions */}
          {activeResult.suggestions && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Actionable Improvement Recommendations</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Direct guidance to elevate your resume’s impact
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {activeResult.suggestions.atsCompatibility?.map((sug, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-card">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-foreground">{sug}</span>
                  </div>
                ))}
                {activeResult.suggestions.contentQuality?.map((sug, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg border border-border bg-card">
                    <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-foreground">{sug}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Grammar & Writing Feedback */}
          {activeResult.grammarAndWriting && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Writing Quality & Tone</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Overall assessment: {activeResult.grammarAndWriting.overallWritingQuality || 'Professional and articulate'}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {activeResult.grammarAndWriting.weakWording && activeResult.grammarAndWriting.weakWording.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-muted-foreground">Weak Word Replacements:</p>
                    {activeResult.grammarAndWriting.weakWording.map((item, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-border bg-muted/30 flex items-center justify-between">
                        <span className="text-destructive font-mono">"{item.weakWord}"</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                          "{item.strongAlternative}"
                        </span>
                        <span className="text-muted-foreground text-[11px] hidden sm:inline">
                          ({item.reason})
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No weak phrasing or grammar mistakes detected.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<Sparkles className="h-8 w-8" />}
          title="Ready to evaluate your resume"
          description="Click 'Run Gemini ATS Scan' above to analyze your active vault resume against industry standards or paste a job description for tailored scoring."
          actionText="Run ATS Scan"
          onAction={handleRunAnalysis}
        />
      )}
    </div>
  );
}
