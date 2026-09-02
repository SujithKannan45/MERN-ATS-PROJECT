import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { NotificationService } from '../services/notification.service.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { authenticate } from '../../auth/middlewares/auth.middleware.js';
import { validateRequest } from '../../../core/middlewares/validate.middleware.js';
import { asyncHandler } from '../../../core/middlewares/async-handler.middleware.js';
import { queryNotificationSchema } from '../validators/notification.validator.js';

const router = Router();

// Instantiate Dependency Injection Tree
const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

// All notification routes require authentication
router.use(authenticate);

// 1. Get notifications (paginated, with optional unreadOnly filter)
router.get(
  '/',
  validateRequest(queryNotificationSchema),
  asyncHandler(notificationController.getNotifications)
);

// 2. Get unread notification count (MUST be before /:id)
router.get(
  '/unread-count',
  asyncHandler(notificationController.getUnreadCount)
);

// 3. Mark all notifications as read (MUST be before /:id)
router.patch(
  '/read-all',
  asyncHandler(notificationController.markAllRead)
);

// 4. Mark specific notification as read
router.patch(
  '/:id/read',
  asyncHandler(notificationController.markOneRead)
);

// 5. Delete specific notification
router.delete(
  '/:id',
  asyncHandler(notificationController.deleteNotification)
);

export const notificationRoutes = router;
export { notificationService };
