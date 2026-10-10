import {
  CreateNotificationDto,
  NotificationQueryDto,
  INotificationResponse,
  IUnreadCountResponse,
} from '../dtos/notification.dto.js';
import { PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';

export interface INotificationService {
  createNotification(dto: CreateNotificationDto): Promise<INotificationResponse>;
  getNotifications(
    userId: string,
    query?: NotificationQueryDto
  ): Promise<PaginatedResult<INotificationResponse>>;
  markNotificationRead(id: string, userId: string): Promise<INotificationResponse>;
  markAllNotificationsRead(userId: string): Promise<{ updatedCount: number }>;
  deleteNotification(id: string, userId: string): Promise<{ message: string }>;
  getUnreadCount(userId: string): Promise<IUnreadCountResponse>;
}
