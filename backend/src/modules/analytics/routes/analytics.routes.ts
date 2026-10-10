import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { authenticate, authorize } from '../../auth/middlewares/auth.middleware.js';
import { asyncHandler } from '../../../core/middlewares/async-handler.middleware.js';

const router = Router();

// Instantiate Dependency Injection Tree
const analyticsService = new AnalyticsService();
const analyticsController = new AnalyticsController(analyticsService);

// All dashboard analytics routes require authentication
router.use(authenticate);
router.use(authorize('candidate', 'admin'));

// 1. Get Dashboard Overview Metrics
router.get(
  '/',
  asyncHandler(analyticsController.getDashboardOverview)
);

// 2. Get Dashboard Charts Datasets
router.get(
  '/charts',
  asyncHandler(analyticsController.getDashboardCharts)
);

export const analyticsRoutes = router;
