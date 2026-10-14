import * as React from 'react';
import {
  Building,
  MapPin,
  Calendar,
  Sparkles,
  MoreVertical,
  Edit3,
  Trash2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import type { IJobResponse, JobStatus } from '@/services/job.service';

interface JobCardProps {
  job: IJobResponse;
  onView: (job: IJobResponse) => void;
  onEdit: (job: IJobResponse) => void;
  onDelete: (job: IJobResponse) => void;
  onOpenMatch: (job: IJobResponse) => void;
  onStatusChange: (job: IJobResponse, newStatus: JobStatus) => void;
}

const statusOrder: JobStatus[] = [
  'Saved',
  'Applied',
  'Interview Scheduled',
  'Interview Completed',
  'Offer Received',
  'Accepted',
  'Rejected',
  'Archived',
];

export function JobCard({
  job,
  onView,
  onEdit,
  onDelete,
  onOpenMatch,
  onStatusChange,
}: JobCardProps) {
  const currentIdx = statusOrder.indexOf(job.status);
  const nextStatus = currentIdx >= 0 && currentIdx < statusOrder.length - 1 ? statusOrder[currentIdx + 1] : null;
  const prevStatus = currentIdx > 0 ? statusOrder[currentIdx - 1] : null;

  const priorityColors = {
    Low: 'secondary',
    Medium: 'default',
    High: 'destructive',
  } as const;

  const matchScore = job.aiMatchResult?.overallMatchPercentage;

  const menuItems = [
    {
      id: 'view',
      label: 'View Details',
      onClick: () => onView(job),
    },
    {
      id: 'match',
      label: matchScore !== undefined ? `AI Match: ${matchScore}%` : 'Run AI Match',
      icon: <Sparkles className="h-3.5 w-3.5 text-indigo-500" />,
      onClick: () => onOpenMatch(job),
    },
    {
      id: 'edit',
      label: 'Edit Job',
      icon: <Edit3 className="h-3.5 w-3.5" />,
      onClick: () => onEdit(job),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-3.5 w-3.5 text-destructive" />,
      destructive: true,
      onClick: () => onDelete(job),
    },
  ];

  return (
    <Card className="p-3.5 hover:shadow-md transition-all duration-200 border-border bg-card hover:border-primary/40 group relative">
      <div className="space-y-3">
        {/* Header: Title, Priority, Menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onView(job)}>
            <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {job.jobTitle}
            </h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
              <Building className="h-3 w-3 shrink-0" />
              <span>{job.companyName}</span>
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={priorityColors[job.priority] || 'secondary'} className="text-[10px] px-1.5 py-0">
              {job.priority}
            </Badge>
            <Dropdown
              trigger={
                <button
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Job actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
              items={menuItems}
              align="right"
            />
          </div>
        </div>

        {/* Location & Workplace */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{job.location}</span>
            </span>
          )}
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
            {job.workplaceType}
          </span>
          {job.salary?.min || job.salary?.max ? (
            <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 text-[10px] font-semibold">
              ${Math.round((job.salary.max || job.salary.min || 0) / 1000)}k
            </span>
          ) : null}
        </div>

        {/* AI Match Score or Trigger Button */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          {matchScore !== undefined ? (
            <button
              onClick={() => onOpenMatch(job)}
              className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-80 transition-opacity"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white font-black ${
                  matchScore >= 80 ? 'bg-emerald-500' : matchScore >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
              >
                {matchScore}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {matchScore >= 80 ? 'Great Match' : 'Match'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => onOpenMatch(job)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              Match AI
            </button>
          )}

          {/* Quick status movement controls */}
          <div className="flex items-center gap-1">
            {prevStatus && (
              <button
                type="button"
                onClick={() => onStatusChange(job, prevStatus)}
                title={`Move back to ${prevStatus}`}
                className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            )}
            {nextStatus && (
              <button
                type="button"
                onClick={() => onStatusChange(job, nextStatus)}
                title={`Advance to ${nextStatus}`}
                className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
