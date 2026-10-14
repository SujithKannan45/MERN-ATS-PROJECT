import * as React from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { JobCard } from './JobCard';
import { Button } from '@/components/ui/Button';
import type { IJobResponse, JobStatus } from '@/services/job.service';

interface KanbanColumnConfig {
  id: string;
  title: string;
  statuses: JobStatus[];
  color: string;
  defaultStatus: JobStatus;
}

const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    id: 'saved',
    title: 'Saved & Wishlist',
    statuses: ['Saved'],
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    defaultStatus: 'Saved',
  },
  {
    id: 'applied',
    title: 'Applied',
    statuses: ['Applied'],
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    defaultStatus: 'Applied',
  },
  {
    id: 'interviewing',
    title: 'Interview Stage',
    statuses: ['Interview Scheduled', 'Interview Completed'],
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    defaultStatus: 'Interview Scheduled',
  },
  {
    id: 'offers',
    title: 'Offers & Accepted',
    statuses: ['Offer Received', 'Accepted'],
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    defaultStatus: 'Offer Received',
  },
  {
    id: 'archived',
    title: 'Rejected / Archived',
    statuses: ['Rejected', 'Archived'],
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    defaultStatus: 'Rejected',
  },
];

interface JobKanbanBoardProps {
  jobs: IJobResponse[];
  onView: (job: IJobResponse) => void;
  onEdit: (job: IJobResponse) => void;
  onDelete: (job: IJobResponse) => void;
  onOpenMatch: (job: IJobResponse) => void;
  onStatusChange: (job: IJobResponse, newStatus: JobStatus) => void;
  onAddJobInColumn: (status: JobStatus) => void;
}

export function JobKanbanBoard({
  jobs,
  onView,
  onEdit,
  onDelete,
  onOpenMatch,
  onStatusChange,
  onAddJobInColumn,
}: JobKanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 min-h-[550px] snap-x">
      {KANBAN_COLUMNS.map((col) => {
        const columnJobs = jobs.filter((j) => col.statuses.includes(j.status));

        return (
          <div
            key={col.id}
            className="flex flex-col w-72 sm:w-80 shrink-0 rounded-2xl border border-border bg-muted/20 p-3 snap-start"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${col.color}`}
                >
                  {col.title}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {columnJobs.length}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onAddJobInColumn(col.defaultStatus)}
                title={`Add job to ${col.title}`}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Column Cards Container */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[720px] pr-1">
              {columnJobs.length > 0 ? (
                columnJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onOpenMatch={onOpenMatch}
                    onStatusChange={onStatusChange}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-44 rounded-xl border border-dashed border-border/60 bg-card/30 p-4 text-center">
                  <FolderKanban className="h-6 w-6 text-muted-foreground/40 mb-1" />
                  <p className="text-xs text-muted-foreground">No jobs in this stage</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs text-primary"
                    onClick={() => onAddJobInColumn(col.defaultStatus)}
                  >
                    + Add Job
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
