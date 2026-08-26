import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes.js';
import { authRoutes } from '../modules/auth/routes/auth.routes.js';
import { NotFoundError } from '../core/errors/app-error.js';

const router = Router();

// Register Module Sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Catch-all for undefined API routes under /api/v1
router.all('*', (req, _res, next) => {
  next(new NotFoundError(`API Route not found: [${req.method}] ${req.originalUrl}`));
});

export const apiRouter = router;

