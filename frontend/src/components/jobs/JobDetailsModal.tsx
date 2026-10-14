import * as React from 'react';
import {
  Building,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Sparkles,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { IJobResponse, JobStatus } from '@/services/job.service';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: IJobResponse | null;
  onEdit: (job: IJobResponse) => void;
  onDelete: (job: IJobResponse) => void;
  onOpenMatch: (job: IJobResponse) => void;
  onStatusChange: (job: IJobResponse, newStatus: JobStatus) => Promise<void>;
}

export function JobDetailsModal({
  isOpen,
  onClose,
  job,
  onEdit,
  onDelete,
  onOpenMatch,
  onStatusChange,
}: JobDetailsModalProps) {
  if (!job) return null;

  const statusColors: Record<JobStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info'> = {
    Saved: 'secondary',
    Applied: 'info',
    'Interview Scheduled': 'warning',
    'Interview Completed': 'info',
    'Offer Received': 'success',
    Accepted: 'success',
    Rejected: 'destructive',
    Archived: 'secondary',
  };

  const priorityColors = {
    Low: 'secondary',
    Medium: 'default',
    High: 'destructive',
  } as const;

  const matchScore = job.aiMatchResult?.overallMatchPercentage;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job.jobTitle}
      description={`${job.companyName} • Added on ${new Date(job.createdAt).toLocaleDateString()}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Top Header Row with Status & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[job.status] || 'secondary'} className="px-2.5 py-1 text-xs">
              {job.status}
            </Badge>
            <Badge variant={priorityColors[job.priority] || 'secondary'} className="text-[11px]">
              {job.priority} Priority
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              {job.workplaceType}
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              {job.employmentType}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-primary"
              onClick={() => onOpenMatch(job)}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              {matchScore !== undefined ? `${matchScore}% AI Match` : 'AI Match'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                onClose();
                onEdit(job);
              }}
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                onClose();
                onDelete(job);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-border bg-card/60 text-xs">
          <div>
            <span className="text-muted-foreground block mb-0.5">Company</span>
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5 text-muted-foreground" />
              {job.companyName}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-0.5">Location</span>
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {job.location || 'Remote / Not specified'}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-0.5">Compensation</span>
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              {job.salary?.min || job.salary?.max
                ? `${job.salary.min ? `$${job.salary.min.toLocaleString()}` : ''}${
                    job.salary.min && job.salary.max ? ' - ' : ''
                  }${job.salary.max ? `$${job.salary.max.toLocaleString()}` : ''} / ${
                    job.salary.period || 'yr'
                  }`
                : 'Not disclosed'}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block mb-0.5">Applied Date</span>
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : 'Not applied yet'}
            </span>
          </div>

          {job.interviewDate && (
            <div>
              <span className="text-muted-foreground block mb-0.5">Interview Date</span>
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-amber-500">
                <Clock className="h-3.5 w-3.5" />
                {new Date(job.interviewDate).toLocaleDateString()}
              </span>
            </div>
          )}

          {job.jobUrl && (
            <div>
              <span className="text-muted-foreground block mb-0.5">Posting Link</span>
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Open Posting <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* AI Match Overview Banner */}
        {job.aiMatchResult ? (
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 font-black text-sm">
                {job.aiMatchResult.overallMatchPercentage}%
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  Gemini AI ATS Match Score
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {job.aiMatchResult.matchingSkills.length} matching skills, {job.aiMatchResult.missingSkills.length} missing
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1"
              onClick={() => onOpenMatch(job)}
            >
              View Full Report
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-border bg-muted/20">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-foreground">ATS Match Not Computed Yet</p>
              <p className="text-[11px] text-muted-foreground">
                Run semantic matching against your active resume to discover keyword gaps.
              </p>
            </div>
            <Button
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => onOpenMatch(job)}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Analyze Match
            </Button>
          </div>
        )}

        {/* Required Skills */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Required Skills & Technologies
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {job.requiredSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Job Description */}
        {job.jobDescription && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Job Description
            </h4>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
              {job.jobDescription}
            </div>
          </div>
        )}

        {/* Notes */}
        {job.notes && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Candidate Notes
            </h4>
            <div className="rounded-lg border border-border bg-card p-3 text-xs text-foreground whitespace-pre-line">
              {job.notes}
            </div>
          </div>
        )}

        {/* Change Status Fast Picker */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-medium text-muted-foreground">Quick Move Status:</span>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                'Saved',
                'Applied',
                'Interview Scheduled',
                'Interview Completed',
                'Offer Received',
                'Accepted',
                'Rejected',
                'Archived',
              ] as JobStatus[]
            ).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onStatusChange(job, st)}
                className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                  job.status === st
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
