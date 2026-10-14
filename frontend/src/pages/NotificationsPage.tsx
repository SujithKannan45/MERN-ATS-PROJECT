import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { toast } from '@/components/ui/Toast';

import {
  notificationService,
  type INotificationResponse,
} from '@/services/notification.service';
import { NotificationItem } from '@/components/notifications/NotificationItem';

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const [unreadOnly, setUnreadOnly] = React.useState<boolean>(false);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // 1. Fetch unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
  });

  // 2. Fetch Notifications List
  const {
    data: notificationsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications-list', currentPage, unreadOnly],
    queryFn: () =>
      notificationService.getNotifications({
        page: currentPage,
        limit: 10,
        unreadOnly,
      }),
  });

  // 3. Mutation: Mark One Read
  const markOneReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markOneRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update notification');
    },
  });

  // 4. Mutation: Mark All Read
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read.');
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to mark all as read');
    },
  });

  // 5. Mutation: Delete Notification
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      toast.success('Notification removed.');
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete notification');
    },
  });

  const notifications = notificationsData?.notifications || [];
  const pagination = notificationsData?.pagination || {
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Notifications"
        description="Stay informed about ATS scoring benchmarks, interview dates, and application milestones."
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Notifications' }]}
        action={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs"
              onClick={() => markAllReadMutation.mutate()}
              isLoading={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 text-emerald-500" />
              Mark All as Read ({unreadCount})
            </Button>
          ) : undefined
        }
      />

      {/* Control Bar: Filter Tabs */}
      <div className="flex items-center justify-between gap-4 p-1.5 bg-muted rounded-xl">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setUnreadOnly(false);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !unreadOnly
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => {
              setUnreadOnly(true);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              unreadOnly
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] text-primary-foreground font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <span className="text-xs text-muted-foreground pr-2 font-medium">
          {pagination.totalItems} total
        </span>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to Load Notifications"
          message={
            (error as Error)?.message ||
            'Could not retrieve notifications from the server. Please verify your connection.'
          }
          onRetry={() => refetch()}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-10 w-10 text-muted-foreground" />}
          title={unreadOnly ? 'No unread notifications' : 'Your notifications inbox is empty'}
          description={
            unreadOnly
              ? 'You have reviewed all incoming alerts and status changes.'
              : 'As you upload resumes, track jobs, and run AI evaluations, alerts will appear here.'
          }
          actionText={unreadOnly ? 'View All Notifications' : undefined}
          onAction={unreadOnly ? () => setUnreadOnly(false) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={(id) => markOneReadMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pt-4 flex items-center justify-between border-t border-border">
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
