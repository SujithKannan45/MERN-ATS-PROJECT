import { Request, Response } from 'express';
import { INotificationService } from '../services/notification.service.interface.js';
import { ApiResponse } from '../../../shared/utils/api-response.js';

export class NotificationController {
  private readonly notificationService: INotificationService;

  constructor(notificationService: INotificationService) {
    this.notificationService = notificationService;
  }

  public getNotifications = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.notificationService.getNotifications(userId, req.query);

    return ApiResponse.paginated(
      res,
      result.data,
      result.pagination,
      'Notifications retrieved successfully'
    );
  };

  public markOneRead = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await this.notificationService.markNotificationRead(id, userId);

    return ApiResponse.success(res, result, 'Notification marked as read successfully');
  };

  public markAllRead = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.notificationService.markAllNotificationsRead(userId);

    return ApiResponse.success(
      res,
      result,
      'All notifications marked as read successfully'
    );
  };

  public deleteNotification = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const result = await this.notificationService.deleteNotification(id, userId);

    return ApiResponse.success(res, null, result.message);
  };

  public getUnreadCount = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const result = await this.notificationService.getUnreadCount(userId);

    return ApiResponse.success(
      res,
      result,
      'Unread notification count retrieved successfully'
    );
  };
}
