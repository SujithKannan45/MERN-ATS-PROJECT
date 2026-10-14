import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Briefcase,
  Plus,
  LayoutGrid,
  List,
  Search,
  Filter,
  SlidersHorizontal,
  FolderKanban,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from '@/components/ui/Toast';

import {
  jobService,
  type IJobResponse,
  type JobStatus,
  type JobPriority,
  type WorkplaceType,
  type CreateJobDto,
  type UpdateJobDto,
} from '@/services/job.service';

import { JobKanbanBoard } from '@/components/jobs/JobKanbanBoard';
import { JobListView } from '@/components/jobs/JobListView';
import { JobFormModal } from '@/components/jobs/JobFormModal';
import { JobDetailsModal } from '@/components/jobs/JobDetailsModal';
import { AiJobMatchModal } from '@/components/jobs/AiJobMatchModal';

export function JobsPage() {
  const queryClient = useQueryClient();

  // State Management
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('ALL');
  const [workplaceFilter, setWorkplaceFilter] = React.useState<string>('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);

  // Modals State
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedJobToEdit, setSelectedJobToEdit] = React.useState<IJobResponse | null>(null);
  const [formInitialStatus, setFormInitialStatus] = React.useState<JobStatus>('Saved');

  const [detailsJob, setDetailsJob] = React.useState<IJobResponse | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  const [matchJob, setMatchJob] = React.useState<IJobResponse | null>(null);
  const [isMatchOpen, setIsMatchOpen] = React.useState(false);

  const [deleteJobTarget, setDeleteJobTarget] = React.useState<IJobResponse | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  // 1. Fetch Aggregate Pipeline Stats
  const { data: stats } = useQuery({
    queryKey: ['job-dashboard-stats'],
    queryFn: () => jobService.getDashboardStats(),
  });

  // 2. Fetch Jobs List
  const {
    data: jobsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'tracked-jobs',
      currentPage,
      searchQuery,
      statusFilter,
      priorityFilter,
      workplaceFilter,
      viewMode,
    ],
    queryFn: () =>
      jobService.getAllJobs({
        page: currentPage,
        limit: viewMode === 'kanban' ? 50 : 10,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'ALL' ? (statusFilter as JobStatus) : undefined,
        priority: priorityFilter !== 'ALL' ? (priorityFilter as JobPriority) : undefined,
        workplaceType: workplaceFilter !== 'ALL' ? (workplaceFilter as WorkplaceType) : undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
  });

  // 3. Create Job Mutation
  const createMutation = useMutation({
    mutationFn: (dto: CreateJobDto) => jobService.createJob(dto),
    onSuccess: () => {
      toast.success('Job opening added to tracker!');
      queryClient.invalidateQueries({ queryKey: ['tracked-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add job opening');
    },
  });

  // 4. Update Job Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateJobDto }) =>
      jobService.updateJob(id, dto),
    onSuccess: (updated) => {
      toast.success('Job details updated.');
      queryClient.invalidateQueries({ queryKey: ['tracked-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-dashboard-stats'] });
      if (detailsJob?.id === updated.id) setDetailsJob(updated);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update job');
    },
  });

  // 5. Delete Job Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobService.deleteJob(id),
    onSuccess: () => {
      toast.success('Job removed from pipeline.');
      queryClient.invalidateQueries({ queryKey: ['tracked-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
      setIsDeleteOpen(false);
      setDeleteJobTarget(null);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete job');
    },
  });

  // Action Handlers
  const handleOpenAddJob = (initialStatus: JobStatus = 'Saved') => {
    setSelectedJobToEdit(null);
    setFormInitialStatus(initialStatus);
    setIsFormOpen(true);
  };

  const handleOpenEditJob = (job: IJobResponse) => {
    setSelectedJobToEdit(job);
    setIsFormOpen(true);
  };

  const handleOpenDetails = (job: IJobResponse) => {
    setDetailsJob(job);
    setIsDetailsOpen(true);
  };

  const handleOpenMatch = (job: IJobResponse) => {
    setMatchJob(job);
    setIsMatchOpen(true);
  };

  const handleConfirmDelete = (job: IJobResponse) => {
    setDeleteJobTarget(job);
    setIsDeleteOpen(true);
  };

  const handleStatusChange = async (job: IJobResponse, newStatus: JobStatus) => {
    if (job.status === newStatus) return;
    await updateMutation.mutateAsync({
      id: job.id,
      dto: { status: newStatus },
    });
  };

  const handleFormSubmit = async (data: CreateJobDto | UpdateJobDto) => {
    if (selectedJobToEdit) {
      await updateMutation.mutateAsync({
        id: selectedJobToEdit.id,
        dto: data as UpdateJobDto,
      });
    } else {
      await createMutation.mutateAsync(data as CreateJobDto);
    }
  };

  const jobs = jobsData?.jobs || [];
  const pagination = jobsData?.pagination || {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Job Application Pipeline"
        description="Track job applications from discovery to offer letters with integrated Gemini ATS matching."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Job Tracker' }]}
        action={
          <Button onClick={() => handleOpenAddJob('Saved')} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> Add New Job
          </Button>
        }
      />

      {/* Aggregate Pipeline KPI Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total In Pipeline</span>
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">
            {stats?.totalJobs ?? 0}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {stats?.savedJobs ?? 0} saved in wishlist
          </span>
        </Card>

        <Card className="p-3.5 border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Applied</span>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">
            {stats?.appliedJobs ?? 0}
          </div>
          <span className="text-[11px] text-muted-foreground">Actively under review</span>
        </Card>

        <Card className="p-3.5 border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Interviews</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1">
            {stats?.interviews ?? 0}
          </div>
          <span className="text-[11px] text-muted-foreground">Scheduled & in-progress</span>
        </Card>

        <Card className="p-3.5 border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Offers Received</span>
            <Trophy className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground mt-1 text-emerald-600 dark:text-emerald-400">
            {stats?.offers ?? 0}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {stats?.acceptedJobs ?? 0} accepted offers
          </span>
        </Card>
      </div>

      {/* Control Bar: Search, Filters, View Mode Toggle */}
      <Card className="p-4 border-border bg-card space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Input
              placeholder="Search by company, title, or skills..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg self-end md:self-auto shrink-0">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setViewMode('list')}
            >
              <List className="h-3.5 w-3.5" /> Table
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="Saved">Saved</option>
            <option value="Applied">Applied</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Interview Completed">Interview Completed</option>
            <option value="Offer Received">Offer Received</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority 🔥</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={workplaceFilter}
            onChange={(e) => {
              setWorkplaceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="ALL">All Workplace Types</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
      </Card>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to Load Tracked Jobs"
          message={
            (error as Error)?.message ||
            'Could not retrieve job applications from the server. Please verify your connection.'
          }
          onRetry={() => refetch()}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-10 w-10 text-muted-foreground" />}
          title={
            searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'No matching jobs found'
              : 'Your job application pipeline is empty'
          }
          description={
            searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'Try adjusting your search criteria or resetting filters to see more results.'
              : 'Add target jobs from LinkedIn, Indeed, or career sites to organize your search and evaluate ATS match readiness.'
          }
          actionText={
            searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'Clear All Filters'
              : 'Track Your First Job'
          }
          onAction={
            searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? () => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                  setPriorityFilter('ALL');
                  setWorkplaceFilter('ALL');
                }
              : () => handleOpenAddJob('Saved')
          }
        />
      ) : viewMode === 'kanban' ? (
        <JobKanbanBoard
          jobs={jobs}
          onView={handleOpenDetails}
          onEdit={handleOpenEditJob}
          onDelete={handleConfirmDelete}
          onOpenMatch={handleOpenMatch}
          onStatusChange={handleStatusChange}
          onAddJobInColumn={handleOpenAddJob}
        />
      ) : (
        <JobListView
          jobs={jobs}
          pagination={pagination}
          onPageChange={(page) => setCurrentPage(page)}
          onView={handleOpenDetails}
          onEdit={handleOpenEditJob}
          onDelete={handleConfirmDelete}
          onOpenMatch={handleOpenMatch}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Modals & Dialogs */}
      <JobFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        jobToEdit={selectedJobToEdit}
        initialStatus={formInitialStatus}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <JobDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        job={detailsJob}
        onEdit={handleOpenEditJob}
        onDelete={handleConfirmDelete}
        onOpenMatch={handleOpenMatch}
        onStatusChange={handleStatusChange}
      />

      <AiJobMatchModal
        isOpen={isMatchOpen}
        onClose={() => setIsMatchOpen(false)}
        job={matchJob}
        onMatchSuccess={(updatedJob) => {
          if (detailsJob?.id === updatedJob.id) setDetailsJob(updatedJob);
        }}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Tracked Job"
        description={`Are you sure you want to remove "${deleteJobTarget?.jobTitle}" at "${deleteJobTarget?.companyName}" from your tracker? This action cannot be undone.`}
        confirmText="Delete Job"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteJobTarget) deleteMutation.mutate(deleteJobTarget.id);
        }}
      />
    </div>
  );
}
