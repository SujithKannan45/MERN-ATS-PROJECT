import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes.js';
import { authRoutes } from '../modules/auth/routes/auth.routes.js';
import { resumeRoutes } from '../modules/resumes/routes/resume.routes.js';
import { aiRoutes } from '../modules/ai/routes/ai.routes.js';
import { jobRoutes } from '../modules/jobs/routes/job.routes.js';
import { analyticsRoutes } from '../modules/analytics/routes/analytics.routes.js';
import { notificationRoutes } from '../modules/notifications/routes/notification.routes.js';
import { auditLogRoutes } from '../modules/audit/routes/audit-log.routes.js';
import { swaggerRoutes } from '../docs/swagger.routes.js';
import {
  authRateLimiter,
  aiRateLimiter,
  uploadRateLimiter,
} from '../core/middlewares/rate-limiter.middleware.js';
import { NotFoundError } from '../core/errors/app-error.js';

const router = Router();

// Register Module Sub-routers with appropriate rate limiters
router.use('/health', healthRoutes);
router.use('/docs', swaggerRoutes);
router.use('/auth', authRateLimiter, authRoutes);
router.use('/resumes', uploadRateLimiter, resumeRoutes);
router.use('/ai', aiRateLimiter, aiRoutes);
router.use('/jobs', jobRoutes);
router.use('/dashboard', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditLogRoutes);

// Catch-all for undefined API routes under /api/v1
router.all('*', (req, _res, next) => {
  next(new NotFoundError(`API Route not found: [${req.method}] ${req.originalUrl}`));
});

export const apiRouter = router;
