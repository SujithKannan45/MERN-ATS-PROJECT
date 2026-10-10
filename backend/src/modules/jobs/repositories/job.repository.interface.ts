import { IBaseRepository } from '../../../shared/repositories/base.repository.interface.js';
import { IJobDocument } from '../models/job.model.js';
import { JobQueryDto, IJobDashboardStats } from '../dtos/job.dto.js';
import { PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';

export interface IJobRepository extends IBaseRepository<IJobDocument> {
  findJobsWithFilters(
    userId: string,
    query: JobQueryDto
  ): Promise<PaginatedResult<IJobDocument>>;
  findByIdAndUserId(id: string, userId: string): Promise<IJobDocument | null>;
  deleteByIdAndUserId(id: string, userId: string): Promise<IJobDocument | null>;
  getDashboardStatistics(userId: string): Promise<IJobDashboardStats>;
}
