import { NotificationType } from '../models/notification.model.js';

export interface INotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Record<string, unknown>;
}

export interface NotificationQueryDto {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface IUnreadCountResponse {
  unreadCount: number;
}
