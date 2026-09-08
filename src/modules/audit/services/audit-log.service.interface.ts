import {
  CreateAuditLogDto,
  AuditLogQueryDto,
  IAuditLogResponse,
} from '../dtos/audit-log.dto.js';
import { PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';

export interface IAuditLogService {
  recordLog(dto: CreateAuditLogDto): Promise<void>;
  getUserLogs(
    userId: string,
    query?: AuditLogQueryDto
  ): Promise<PaginatedResult<IAuditLogResponse>>;
  getAllLogs(
    query?: AuditLogQueryDto
  ): Promise<PaginatedResult<IAuditLogResponse>>;
}
