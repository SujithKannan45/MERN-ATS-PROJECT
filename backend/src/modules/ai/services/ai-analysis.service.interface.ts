import {
  AnalyzeResumeRequestDto,
  IAnalysisHistoryResponse,
} from '../dtos/ai-analysis.dto.js';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../shared/repositories/base.repository.interface.js';

export interface IAiAnalysisService {
  analyzeResume(
    userId: string,
    dto: AnalyzeResumeRequestDto,
    requestApiKey?: string
  ): Promise<IAnalysisHistoryResponse>;

  getAnalysisHistory(
    userId: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<IAnalysisHistoryResponse>>;

  getAnalysisById(id: string, userId: string): Promise<IAnalysisHistoryResponse>;

  deleteAnalysisById(id: string, userId: string): Promise<{ message: string }>;
}
