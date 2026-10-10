import { IBaseRepository } from '../../../shared/repositories/base.repository.interface.js';
import { IAnalysisHistoryDocument } from '../models/analysis-history.model.js';
import { PaginatedResult, PaginationOptions } from '../../../shared/repositories/base.repository.interface.js';

export interface IAnalysisHistoryRepository extends IBaseRepository<IAnalysisHistoryDocument> {
  findByUserId(
    userId: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<IAnalysisHistoryDocument>>;
  findByIdAndUserId(id: string, userId: string): Promise<IAnalysisHistoryDocument | null>;
  deleteByIdAndUserId(id: string, userId: string): Promise<IAnalysisHistoryDocument | null>;
}
