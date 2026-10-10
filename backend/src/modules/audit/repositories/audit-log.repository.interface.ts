import { IBaseRepository, PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';
import { IAuditLogDocument } from '../models/audit-log.model.js';
import { AuditLogQueryDto } from '../dtos/audit-log.dto.js';

export interface IAuditLogRepository extends IBaseRepository<IAuditLogDocument> {
  findByUserId(
    userId: string,
    query?: AuditLogQueryDto
  ): Promise<PaginatedResult<IAuditLogDocument>>;
  findAllWithFilters(
    query: AuditLogQueryDto
  ): Promise<PaginatedResult<IAuditLogDocument>>;
}
