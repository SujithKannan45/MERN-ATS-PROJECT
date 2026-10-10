import { Types } from 'mongoose';
import { IAuditLogRepository } from '../repositories/audit-log.repository.interface.js';
import { IAuditLogService } from './audit-log.service.interface.js';
import { IAuditLogDocument } from '../models/audit-log.model.js';
import {
  CreateAuditLogDto,
  AuditLogQueryDto,
  IAuditLogResponse,
} from '../dtos/audit-log.dto.js';
import { PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';
import { redactSensitiveData, logger } from '../../../core/logger/logger.js';

export class AuditLogService implements IAuditLogService {
  private readonly auditLogRepository: IAuditLogRepository;

  constructor(auditLogRepository: IAuditLogRepository) {
    this.auditLogRepository = auditLogRepository;
  }

  private mapAuditLogResponse(doc: IAuditLogDocument): IAuditLogResponse {
    return {
      id: doc._id.toString(),
      userId: doc.userId ? doc.userId.toString() : undefined,
      action: doc.action,
      resource: doc.resource,
      resourceId: doc.resourceId,
      status: doc.status,
      details: doc.details,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      durationMs: doc.durationMs,
      timestamp: doc.timestamp,
    };
  }

  /**
   * Safe asynchronous audit logging. Never throws an unhandled error to disrupt user workflows.
   */
  public async recordLog(dto: CreateAuditLogDto): Promise<void> {
    try {
      const sanitizedDetails = dto.details
        ? (redactSensitiveData(dto.details) as Record<string, unknown>)
        : {};

      await this.auditLogRepository.create({
        userId: dto.userId ? new Types.ObjectId(dto.userId) : undefined,
        action: dto.action,
        resource: dto.resource,
        resourceId: dto.resourceId,
        status: dto.status || 'SUCCESS',
        details: sanitizedDetails,
        ipAddress: dto.ipAddress || 'unknown',
        userAgent: dto.userAgent || 'unknown',
        durationMs: dto.durationMs,
        timestamp: new Date(),
      });

      logger.audit(`[Audit Recorded] ${dto.action} on ${dto.resource}`, {
        userId: dto.userId,
        status: dto.status || 'SUCCESS',
        ip: dto.ipAddress,
      });
    } catch (err) {
      logger.error('Failed to persist audit log entry to database:', {
        action: dto.action,
        resource: dto.resource,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  public async getUserLogs(
    userId: string,
    query: AuditLogQueryDto = {}
  ): Promise<PaginatedResult<IAuditLogResponse>> {
    const paginated = await this.auditLogRepository.findByUserId(userId, query);

    return {
      data: paginated.data.map((doc) => this.mapAuditLogResponse(doc)),
      pagination: paginated.pagination,
    };
  }

  public async getAllLogs(
    query: AuditLogQueryDto = {}
  ): Promise<PaginatedResult<IAuditLogResponse>> {
    const paginated = await this.auditLogRepository.findAllWithFilters(query);

    return {
      data: paginated.data.map((doc) => this.mapAuditLogResponse(doc)),
      pagination: paginated.pagination,
    };
  }
}
