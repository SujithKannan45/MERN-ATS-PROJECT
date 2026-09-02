import { Request, Response } from 'express';
import { IAnalyticsService } from '../services/analytics.service.interface.js';
import { ApiResponse } from '../../../shared/utils/api-response.js';

export class AnalyticsController {
  private readonly analyticsService: IAnalyticsService;

  constructor(analyticsService: IAnalyticsService) {
    this.analyticsService = analyticsService;
  }

  public getDashboardOverview = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.analyticsService.getDashboardOverview(userId);

    return ApiResponse.success(
      res,
      result,
      'Dashboard overview statistics retrieved successfully'
    );
  };

  public getDashboardCharts = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.analyticsService.getDashboardCharts(userId);

    return ApiResponse.success(
      res,
      result,
      'Dashboard charts data retrieved successfully'
    );
  };
}
