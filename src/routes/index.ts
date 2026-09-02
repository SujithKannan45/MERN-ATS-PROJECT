import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes.js';
import { authRoutes } from '../modules/auth/routes/auth.routes.js';
import { resumeRoutes } from '../modules/resumes/routes/resume.routes.js';
import { aiRoutes } from '../modules/ai/routes/ai.routes.js';
import { jobRoutes } from '../modules/jobs/routes/job.routes.js';
import { analyticsRoutes } from '../modules/analytics/routes/analytics.routes.js';
import { notificationRoutes } from '../modules/notifications/routes/notification.routes.js';
import { NotFoundError } from '../core/errors/app-error.js';

const router = Router();

// Register Module Sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/resumes', resumeRoutes);
router.use('/ai', aiRoutes);
router.use('/jobs', jobRoutes);
router.use('/dashboard', analyticsRoutes);
router.use('/notifications', notificationRoutes);

// Catch-all for undefined API routes under /api/v1
router.all('*', (req, _res, next) => {
  next(new NotFoundError(`API Route not found: [${req.method}] ${req.originalUrl}`));
});

export const apiRouter = router;

