import { Router } from 'express';
import { AuditLogController } from '../controllers/audit-log.controller.js';
import { AuditLogService } from '../services/audit-log.service.js';
import { AuditLogRepository } from '../repositories/audit-log.repository.js';
import { authenticate, authorize } from '../../auth/middlewares/auth.middleware.js';
import { asyncHandler } from '../../../core/middlewares/async-handler.middleware.js';

const router = Router();

// Instantiate Dependency Injection Tree
const auditLogRepository = new AuditLogRepository();
const auditLogService = new AuditLogService(auditLogRepository);
const auditLogController = new AuditLogController(auditLogService);

// All audit routes require authentication
router.use(authenticate);

// 1. Candidate/User activity history
router.get(
  '/me',
  asyncHandler(auditLogController.getMyLogs)
);

// 2. Admin-level full audit history
router.get(
  '/',
  authorize('admin'),
  asyncHandler(auditLogController.getAllLogs)
);

export const auditLogRoutes = router;
export { auditLogService };
