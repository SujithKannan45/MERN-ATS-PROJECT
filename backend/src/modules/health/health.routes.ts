import { Router } from 'express';
import { HealthController } from './health.controller.js';
import { asyncHandler } from '../../core/middlewares/async-handler.middleware.js';

const router = Router();

router.get('/', asyncHandler(HealthController.getHealth));

export const healthRoutes = router;
