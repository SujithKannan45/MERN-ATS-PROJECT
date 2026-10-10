import { AsyncQueue } from './queue.service.js';
import { notificationService } from '../../modules/notifications/routes/notification.routes.js';
import { CreateNotificationDto } from '../../modules/notifications/dtos/notification.dto.js';
import { logger } from '../logger/logger.js';

class NotificationQueueManager {
  private static instance: NotificationQueueManager;
  public readonly queue: AsyncQueue<CreateNotificationDto>;

  private constructor() {
    this.queue = new AsyncQueue<CreateNotificationDto>('NotificationQueue', 5);
    this.registerHandlers();
  }

  public static getInstance(): NotificationQueueManager {
    if (!NotificationQueueManager.instance) {
      NotificationQueueManager.instance = new NotificationQueueManager();
    }
    return NotificationQueueManager.instance;
  }

  private registerHandlers(): void {
    this.queue.registerHandler('CREATE_NOTIFICATION', async (data: CreateNotificationDto) => {
      logger.debug(`[NotificationQueue] Processing notification for user: ${data.userId}`);
      await notificationService.createNotification(data);
    });
  }

  public enqueueNotification(data: CreateNotificationDto): string {
    return this.queue.add('CREATE_NOTIFICATION', data, { maxRetries: 3, retryDelayMs: 1000 });
  }
}

export const notificationQueue = NotificationQueueManager.getInstance();
