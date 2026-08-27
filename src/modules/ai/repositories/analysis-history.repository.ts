import { BaseRepository } from '../../../shared/repositories/base.repository.js';
import {
  AnalysisHistory,
  IAnalysisHistoryDocument,
} from '../models/analysis-history.model.js';
import { IAnalysisHistoryRepository } from './analysis-history.repository.interface.js';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../shared/repositories/base.repository.interface.js';

export class AnalysisHistoryRepository
  extends BaseRepository<IAnalysisHistoryDocument>
  implements IAnalysisHistoryRepository
{
  constructor() {
    super(AnalysisHistory);
  }

  public async findByUserId(
    userId: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<IAnalysisHistoryDocument>> {
    return this.findWithPagination({ userId }, pagination);
  }

  public async findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<IAnalysisHistoryDocument | null> {
    return this.model.findOne({ _id: id, userId }).exec();
  }

  public async deleteByIdAndUserId(
    id: string,
    userId: string
  ): Promise<IAnalysisHistoryDocument | null> {
    return this.model.findOneAndDelete({ _id: id, userId }).exec();
  }
}
