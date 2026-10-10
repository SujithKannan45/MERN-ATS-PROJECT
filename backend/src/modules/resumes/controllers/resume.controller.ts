import { Request, Response } from 'express';
import { IResumeService } from '../services/resume.service.interface.js';
import { ApiResponse } from '../../../shared/utils/api-response.js';

export class ResumeController {
  private readonly resumeService: IResumeService;

  constructor(resumeService: IResumeService) {
    this.resumeService = resumeService;
  }

  public uploadResume = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.resumeService.uploadResume(userId, req.file!);

    return ApiResponse.created(
      res,
      result,
      'Resume uploaded, parsed, and stored successfully'
    );
  };

  public updateResume = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.resumeService.updateResume(userId, req.file!);

    return ApiResponse.success(
      res,
      result,
      'Resume document replaced and updated successfully'
    );
  };

  public deleteResume = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.resumeService.deleteResume(userId);

    return ApiResponse.success(res, null, result.message);
  };

  public getCurrentResume = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.resumeService.getCurrentResume(userId);

    return ApiResponse.success(res, result, 'Current resume retrieved successfully');
  };

  public getResumeMetadata = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.resumeService.getResumeMetadata(userId);

    return ApiResponse.success(res, result, 'Resume metadata retrieved successfully');
  };

  public downloadResume = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const result = await this.resumeService.getDownloadInfo(userId);

    // If client requested direct redirect
    if (req.query.redirect === 'true') {
      res.redirect(result.downloadUrl);
      return;
    }

    ApiResponse.success(
      res,
      result,
      'Resume download link generated successfully'
    );
  };
}
