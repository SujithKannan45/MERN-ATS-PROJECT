import { Request, Response } from 'express';
import { IAiAnalysisService } from '../services/ai-analysis.service.interface.js';
import { ApiResponse } from '../../../shared/utils/api-response.js';

export class AiAnalysisController {
  private readonly aiService: IAiAnalysisService;

  constructor(aiService: IAiAnalysisService) {
    this.aiService = aiService;
  }

  public analyzeResume = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    // Extract optional client-provided key from header or body
    const headerApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    const result = await this.aiService.analyzeResume(
      userId,
      req.body,
      headerApiKey
    );

    return ApiResponse.created(
      res,
      result,
      'Resume analyzed successfully with Google Gemini AI'
    );
  };

  public getHistory = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const result = await this.aiService.getAnalysisHistory(userId, { page, limit });

    return ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      'Analysis history records retrieved successfully'
    );
  };

  public getHistoryById = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await this.aiService.getAnalysisById(id, userId);

    return ApiResponse.success(
      res,
      result,
      'Analysis report retrieved successfully'
    );
  };

  public deleteHistoryById = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await this.aiService.deleteAnalysisById(id, userId);

    return ApiResponse.success(res, null, result.message);
  };
}
