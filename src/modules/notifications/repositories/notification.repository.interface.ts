import { IBaseRepository } from '../../../shared/repositories/base.repository.interface.js';
import { INotificationDocument } from '../models/notification.model.js';
import { NotificationQueryDto } from '../dtos/notification.dto.js';
import { PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';

export interface INotificationRepository extends IBaseRepository<INotificationDocument> {
  findByUserId(
    userId: string,
    query?: NotificationQueryDto
  ): Promise<PaginatedResult<INotificationDocument>>;
  findByIdAndUserId(id: string, userId: string): Promise<INotificationDocument | null>;
  markOneAsRead(id: string, userId: string): Promise<INotificationDocument | null>;
  markAllAsRead(userId: string): Promise<number>;
  deleteByIdAndUserId(id: string, userId: string): Promise<INotificationDocument | null>;
  getUnreadCount(userId: string): Promise<number>;
}
