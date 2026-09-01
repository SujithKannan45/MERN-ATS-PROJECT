import { Request, Response } from 'express';
import { IJobService } from '../services/job.service.interface.js';
import { ApiResponse } from '../../../shared/utils/api-response.js';

export class JobController {
  private readonly jobService: IJobService;

  constructor(jobService: IJobService) {
    this.jobService = jobService;
  }

  public createJob = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.jobService.createJob(userId, req.body);

    return ApiResponse.created(res, result, 'Job added to tracker successfully');
  };

  public getAllJobs = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.jobService.getAllJobs(userId, req.query);

    return ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      'Jobs retrieved successfully'
    );
  };

  public getDashboardStats = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.jobService.getDashboardStats(userId);

    return ApiResponse.success(
      res,
      result,
      'Job dashboard statistics retrieved successfully'
    );
  };

  public getJobById = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await this.jobService.getJobById(id, userId);

    return ApiResponse.success(res, result, 'Job details retrieved successfully');
  };

  public updateJob = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await this.jobService.updateJob(id, userId, req.body);

    return ApiResponse.success(res, result, 'Job details updated successfully');
  };

  public deleteJob = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await this.jobService.deleteJob(id, userId);

    return ApiResponse.success(res, null, result.message);
  };

  public matchJobWithAI = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const headerApiKey = req.headers['x-gemini-api-key'] as string | undefined;
    const customApiKey = headerApiKey || req.body?.customApiKey;

    const result = await this.jobService.matchJobWithAI(id, userId, customApiKey);

    return ApiResponse.success(
      res,
      result,
      'AI job match evaluation completed successfully'
    );
  };
}
