import { FilterQuery, Types } from 'mongoose';
import { BaseRepository } from '../../../shared/repositories/base.repository.js';
import { AuditLog, IAuditLogDocument } from '../models/audit-log.model.js';
import { IAuditLogRepository } from './audit-log.repository.interface.js';
import { AuditLogQueryDto } from '../dtos/audit-log.dto.js';
import { PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';

export class AuditLogRepository
  extends BaseRepository<IAuditLogDocument>
  implements IAuditLogRepository
{
  constructor() {
    super(AuditLog);
  }

  public async findByUserId(
    userId: string,
    query: AuditLogQueryDto = {}
  ): Promise<PaginatedResult<IAuditLogDocument>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IAuditLogDocument> = {
      userId: new Types.ObjectId(userId),
    };

    if (query.action) filter.action = query.action;
    if (query.status) filter.status = query.status;

    const [data, totalItems] = await Promise.all([
      this.model.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).exec(),
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

  public async findAllWithFilters(
    query: AuditLogQueryDto = {}
  ): Promise<PaginatedResult<IAuditLogDocument>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: FilterQuery<IAuditLogDocument> = {};

    if (query.action) filter.action = query.action;
    if (query.resource) filter.resource = query.resource;
    if (query.status) filter.status = query.status;

    if (query.startDate || query.endDate) {
      filter.timestamp = {};
      if (query.startDate) filter.timestamp.$gte = new Date(query.startDate);
      if (query.endDate) filter.timestamp.$lte = new Date(query.endDate);
    }

    const [data, totalItems] = await Promise.all([
      this.model.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).exec(),
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
}
