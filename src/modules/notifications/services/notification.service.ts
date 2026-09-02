import { Types } from 'mongoose';
import { INotificationRepository } from '../repositories/notification.repository.interface.js';
import { INotificationService } from './notification.service.interface.js';
import { INotificationDocument } from '../models/notification.model.js';
import {
  CreateNotificationDto,
  NotificationQueryDto,
  INotificationResponse,
  IUnreadCountResponse,
} from '../dtos/notification.dto.js';
import { PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';
import { NotFoundError } from '../../../core/errors/app-error.js';
import { logger } from '../../../core/logger/logger.js';

export class NotificationService implements INotificationService {
  private readonly notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  private mapNotificationResponse(doc: INotificationDocument): INotificationResponse {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      title: doc.title,
      message: doc.message,
      type: doc.type,
      isRead: doc.isRead,
      data: doc.data,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  public async createNotification(
    dto: CreateNotificationDto
  ): Promise<INotificationResponse> {
    const notification = await this.notificationRepository.create({
      userId: new Types.ObjectId(dto.userId),
      title: dto.title.trim(),
      message: dto.message.trim(),
      type: dto.type,
      isRead: false,
      data: dto.data || {},
    });

    logger.info(`Notification created for user: ${dto.userId}`, {
      notificationId: notification._id,
      type: dto.type,
      title: dto.title,
    });

    return this.mapNotificationResponse(notification);
  }

  public async getNotifications(
    userId: string,
    query: NotificationQueryDto = {}
  ): Promise<PaginatedResult<INotificationResponse>> {
    const paginated = await this.notificationRepository.findByUserId(userId, query);

    return {
      data: paginated.data.map((doc) => this.mapNotificationResponse(doc)),
      pagination: paginated.pagination,
    };
  }

  public async markNotificationRead(
    id: string,
    userId: string
  ): Promise<INotificationResponse> {
    const notification = await this.notificationRepository.markOneAsRead(id, userId);
    if (!notification) {
      throw new NotFoundError(`Notification with ID '${id}' not found.`);
    }

    return this.mapNotificationResponse(notification);
  }

  public async markAllNotificationsRead(
    userId: string
  ): Promise<{ updatedCount: number }> {
    const count = await this.notificationRepository.markAllAsRead(userId);

    return { updatedCount: count };
  }

  public async deleteNotification(
    id: string,
    userId: string
  ): Promise<{ message: string }> {
    const notification = await this.notificationRepository.deleteByIdAndUserId(id, userId);
    if (!notification) {
      throw new NotFoundError(`Notification with ID '${id}' not found.`);
    }

    return { message: 'Notification deleted successfully.' };
  }

  public async getUnreadCount(userId: string): Promise<IUnreadCountResponse> {
    const unreadCount = await this.notificationRepository.getUnreadCount(userId);

    return { unreadCount };
  }
}
