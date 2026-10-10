import { Request, Response } from 'express';
import { IAuditLogService } from '../services/audit-log.service.interface.js';
import { ApiResponse } from '../../../shared/utils/api-response.js';

export class AuditLogController {
  private readonly auditLogService: IAuditLogService;

  constructor(auditLogService: IAuditLogService) {
    this.auditLogService = auditLogService;
  }

  public getMyLogs = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.auditLogService.getUserLogs(userId, req.query);

    return ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      'User activity audit logs retrieved successfully'
    );
  };

  public getAllLogs = async (req: Request, res: Response): Promise<Response> => {
    const result = await this.auditLogService.getAllLogs(req.query);

    return ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      'System-wide audit logs retrieved successfully'
    );
  };
}
