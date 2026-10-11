import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Edit3,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileCheck2,
} from 'lucide-react';
import { resumeService, type IResumeResponse } from '@/services/resume.service';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ResumeUploadModal } from '@/components/resume/ResumeUploadModal';
import { toast } from '@/components/ui/Toast';
import { formatBytes } from '@/utils/cn';
import { useResumeBuilderStore } from '@/stores/resume-builder.store';

export function ResumesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { loadFromText } = useResumeBuilderStore();

  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isUpdateMode, setIsUpdateMode] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [viewExtractedText, setViewExtractedText] = React.useState(false);

  // 1. Fetch Current User's Full Resume
  const {
    data: resume,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['current-resume'],
    queryFn: () => resumeService.getCurrentResume(),
  });

  // 2. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => resumeService.deleteResume(),
    onSuccess: () => {
      toast.success('Resume deleted successfully.');
      queryClient.setQueryData(['current-resume'], null);
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      setIsDeleteOpen(false);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete resume');
    },
  });

  const handleOpenUpload = (update = false) => {
    setIsUpdateMode(update);
    setIsUploadOpen(true);
  };

  const handleUploadSuccess = (uploaded: IResumeResponse) => {
    queryClient.setQueryData(['current-resume'], uploaded);
    queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
  };

  const handleSendToBuilder = () => {
    if (resume?.extractedText) {
      loadFromText(resume.extractedText);
      toast.success('Resume text loaded into Builder!');
      navigate('/resume-builder');
    }
  };

  const handleSendToAI = () => {
    navigate('/ai-analysis');
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resume Vault"
        description="Securely manage your active resume, extracted texts, Cloudinary assets, and version metadata."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Resumes' }]}
        action={
          <div className="flex items-center gap-2">
            <Link to="/resume-builder">
              <Button variant="outline" size="sm" className="gap-2">
                <Edit3 className="h-4 w-4" /> Open Resume Builder
              </Button>
            </Link>
            <Button size="sm" onClick={() => handleOpenUpload(false)} className="gap-2">
              <UploadCloud className="h-4 w-4" /> Upload Resume
            </Button>
          </div>
        }
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load resume"
          message={error instanceof Error ? error.message : 'Could not reach server'}
          onRetry={() => refetch()}
        />
      ) : !resume ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No resume uploaded in your vault yet"
          description="Upload your latest resume (PDF, DOC, DOCX) to extract text, trigger automated AI ATS scoring, and match target jobs."
          actionText="Upload Resume Now"
          onAction={() => handleOpenUpload(false)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Resume Card & Text Inspector */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      {resume.fileName}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className="uppercase text-[10px]">
                        {resume.fileType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(resume.fileSize)}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        Version {resume.version}
                      </span>
                    </div>
                  </div>
                </div>

                <Badge variant="success" className="gap-1 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active Vault Resume
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-muted/40 border border-border text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Format:</span>
                    <span className="font-semibold text-foreground uppercase">{resume.fileType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Uploaded:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Last Updated:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Storage:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Cloudinary SSL
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <a href={resume.fileUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-4 w-4" /> Download / View File
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenUpload(true)}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" /> Replace Document
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewExtractedText((prev) => !prev)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />{' '}
                    {viewExtractedText ? 'Hide Parsed Text' : 'View Parsed Text'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteOpen(true)}
                    className="gap-2 ml-auto"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Extracted Text Viewer */}
            {viewExtractedText && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold">
                    Extracted Resume Text (Parsed via Mammoth / PDF-Parse)
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSendToBuilder}
                    className="text-xs text-primary gap-1"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit in Resume Builder
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-[350px] overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted/60 p-4 text-xs font-mono text-muted-foreground leading-relaxed border border-border">
                    {resume.extractedText || 'No text extracted.'}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: AI Quick Actions & Next Steps */}
          <div className="space-y-6">
            {/* AI Optimization Card */}
            <Card className="border-primary/20 bg-gradient-to-b from-card to-card/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">AI ATS Optimization</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Score this resume against candidate screening standards
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your resume text is fully parsed and ready for Gemini AI analysis. Run a scan to discover
                  missing hard skills, grammar suggestions, and overall ATS compatibility.
                </p>
                <Button onClick={handleSendToAI} className="w-full gap-2 shadow-sm">
                  <Sparkles className="h-4 w-4" /> Run Gemini ATS Analysis
                </Button>
              </CardContent>
            </Card>

            {/* Resume Builder Quick Action */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-indigo-500" />
                  <CardTitle className="text-base">Interactive Resume Builder</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Format and tailor your resume with live templates
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Export clean ATS-friendly templates (Modern, Minimal, Executive) with live preview and PDF printing.
                </p>
                <Button
                  variant="outline"
                  onClick={handleSendToBuilder}
                  className="w-full gap-2"
                >
                  <FileCheck2 className="h-4 w-4" /> Load in Resume Builder
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Upload / Update Modal */}
      <ResumeUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        isUpdate={isUpdateMode}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Resume"
        description="Are you sure you want to delete this resume from your vault? This will also remove the extracted text and stored Cloudinary asset."
        confirmText="Delete Resume"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
