import * as React from 'react';
import {
  Building,
  MapPin,
  Calendar,
  Sparkles,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Pagination } from '@/components/ui/Pagination';
import type { IJobResponse, JobStatus } from '@/services/job.service';
import type { PaginationMeta } from '@/types';

interface JobListViewProps {
  jobs: IJobResponse[];
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onView: (job: IJobResponse) => void;
  onEdit: (job: IJobResponse) => void;
  onDelete: (job: IJobResponse) => void;
  onOpenMatch: (job: IJobResponse) => void;
  onStatusChange: (job: IJobResponse, newStatus: JobStatus) => void;
}

const statusOptions: JobStatus[] = [
  'Saved',
  'Applied',
  'Interview Scheduled',
  'Interview Completed',
  'Offer Received',
  'Accepted',
  'Rejected',
  'Archived',
];

export function JobListView({
  jobs,
  pagination,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onOpenMatch,
  onStatusChange,
}: JobListViewProps) {
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

  return (
    <Card className="overflow-hidden border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Role & Company</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Workplace</th>
              <th className="py-3 px-4">AI Match</th>
              <th className="py-3 px-4">Applied</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((job) => {
              const matchScore = job.aiMatchResult?.overallMatchPercentage;

              const actionItems = [
                {
                  id: 'view',
                  label: 'View Full Details',
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => onView(job),
                },
                {
                  id: 'match',
                  label: matchScore !== undefined ? `Re-run AI Match (${matchScore}%)` : 'Run AI Match',
                  icon: <Sparkles className="h-4 w-4 text-indigo-500" />,
                  onClick: () => onOpenMatch(job),
                },
                {
                  id: 'edit',
                  label: 'Edit Job',
                  icon: <Edit3 className="h-4 w-4" />,
                  onClick: () => onEdit(job),
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  icon: <Trash2 className="h-4 w-4 text-destructive" />,
                  destructive: true,
                  onClick: () => onDelete(job),
                },
              ];

              return (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors group">
                  {/* Role & Company */}
                  <td className="py-3.5 px-4">
                    <div className="cursor-pointer" onClick={() => onView(job)}>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {job.jobTitle}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building className="h-3 w-3" />
                        <span>{job.companyName}</span>
                        {job.location && <span>• {job.location}</span>}
                      </p>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4">
                    <select
                      value={job.status}
                      onChange={(e) => onStatusChange(job, e.target.value as JobStatus)}
                      className="text-xs font-semibold rounded-md border border-border bg-background px-2 py-1 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <Badge variant={priorityColors[job.priority] || 'secondary'} className="text-[10px]">
                      {job.priority}
                    </Badge>
                  </td>

                  {/* Workplace */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-muted-foreground">
                      {job.workplaceType} • {job.employmentType}
                    </span>
                  </td>

                  {/* AI Match */}
                  <td className="py-3.5 px-4">
                    {matchScore !== undefined ? (
                      <button
                        onClick={() => onOpenMatch(job)}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold hover:opacity-80 transition-opacity bg-muted"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            matchScore >= 80 ? 'bg-emerald-500' : matchScore >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                        />
                        <span>{matchScore}%</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenMatch(job)}
                        className="text-xs text-indigo-500 hover:text-indigo-600 font-medium inline-flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        Match
                      </button>
                    )}
                  </td>

                  {/* Applied Date */}
                  <td className="py-3.5 px-4 text-xs text-muted-foreground">
                    {job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onView(job)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Dropdown
                        trigger={
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        }
                        items={actionItems}
                        align="right"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} jobs
          </p>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </Card>
  );
}
