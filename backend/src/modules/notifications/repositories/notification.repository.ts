import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository.js';
import { Notification, INotificationDocument } from '../models/notification.model.js';
import { INotificationRepository } from './notification.repository.interface.js';
import { NotificationQueryDto } from '../dtos/notification.dto.js';
import { PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';

export class NotificationRepository
  extends BaseRepository<INotificationDocument>
  implements INotificationRepository
{
  constructor() {
    super(Notification);
  }

  public async findByUserId(
    userId: string,
    query: NotificationQueryDto = {}
  ): Promise<PaginatedResult<INotificationDocument>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<INotificationDocument> = {
      userId: new Types.ObjectId(userId),
    };

    if (query.unreadOnly) {
      filter.isRead = false;
    }

    const [data, totalItems] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  public async findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<INotificationDocument | null> {
    return this.model.findOne({ _id: id, userId }).exec();
  }

  public async markOneAsRead(
    id: string,
    userId: string
  ): Promise<INotificationDocument | null> {
    return this.model
      .findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true })
      .exec();
  }

  public async markAllAsRead(userId: string): Promise<number> {
    const result = await this.model
      .updateMany({ userId: new Types.ObjectId(userId), isRead: false }, { isRead: true })
      .exec();
    return result.modifiedCount;
  }

  public async deleteByIdAndUserId(
    id: string,
    userId: string
  ): Promise<INotificationDocument | null> {
    return this.model.findOneAndDelete({ _id: id, userId }).exec();
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return this.model
      .countDocuments({
        userId: new Types.ObjectId(userId),
        isRead: false,
      })
      .exec();
  }
}
