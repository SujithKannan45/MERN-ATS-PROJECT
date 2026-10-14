import { apiClient } from './api.client';
import type { ApiResponse, PaginationMeta } from '@/types';

export type NotificationType =
  | 'RESUME_UPLOADED'
  | 'RESUME_ANALYZED'
  | 'ATS_SCORE_UPDATED'
  | 'JOB_ADDED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'INTERVIEW_SCHEDULED'
  | 'OFFER_RECEIVED'
  | 'RESUME_IMPROVEMENT_AVAILABLE'
  | 'SYSTEM';

export interface INotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQueryDto {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface PaginatedNotificationsResult {
  notifications: INotificationResponse[];
  pagination: PaginationMeta;
}

export interface IUnreadCountResponse {
  unreadCount: number;
}

export const notificationService = {
  /**
   * Fetch paginated user notifications with optional unreadOnly filter
   */
  async getNotifications(query: NotificationQueryDto = {}): Promise<PaginatedNotificationsResult> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.unreadOnly !== undefined) params.append('unreadOnly', String(query.unreadOnly));

    const queryString = params.toString();
    const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';

    const response = await apiClient.get<ApiResponse<INotificationResponse[]>>(endpoint);
    return {
      notifications: response.data.data || [],
      pagination: (response.data.meta as PaginationMeta) || {
        page: query.page || 1,
        limit: query.limit || 10,
        totalItems: (response.data.data || []).length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  /**
   * Fetch unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<IUnreadCountResponse>>('/notifications/unread-count');
    return response.data.data?.unreadCount ?? 0;
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead(): Promise<{ message: string }> {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>('/notifications/read-all');
    return response.data.data;
  },

  /**
   * Mark a single notification as read
   */
  async markOneRead(id: string): Promise<{ message: string }> {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/notifications/${id}`);
    return response.data.data;
  },
};
