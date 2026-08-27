import { Router } from 'express';
import { AiAnalysisController } from '../controllers/ai-analysis.controller.js';
import { AiAnalysisService } from '../services/ai-analysis.service.js';
import { AnalysisHistoryRepository } from '../repositories/analysis-history.repository.js';
import { ResumeRepository } from '../../resumes/repositories/resume.repository.js';
import { authenticate, authorize } from '../../auth/middlewares/auth.middleware.js';
import { validateRequest } from '../../../core/middlewares/validate.middleware.js';
import { asyncHandler } from '../../../core/middlewares/async-handler.middleware.js';
import { analyzeResumeSchema } from '../validators/ai-analysis.validator.js';

const router = Router();

// Instantiate Dependency Injection Tree
const historyRepository = new AnalysisHistoryRepository();
const resumeRepository = new ResumeRepository();
const aiService = new AiAnalysisService(historyRepository, resumeRepository);
const aiController = new AiAnalysisController(aiService);

// All AI routes require authentication and are restricted to candidates (and admins)
router.use(authenticate);
router.use(authorize('candidate', 'admin'));

// 1. Analyze Resume
router.post(
  '/analyze',
  validateRequest(analyzeResumeSchema),
  asyncHandler(aiController.analyzeResume)
);

// 2. Fetch Analysis History (Paginated)
router.get(
  '/history',
  asyncHandler(aiController.getHistory)
);

// 3. Fetch Single Analysis Report
router.get(
  '/history/:id',
  asyncHandler(aiController.getHistoryById)
);

// 4. Delete Analysis Report
router.delete(
  '/history/:id',
  asyncHandler(aiController.deleteHistoryById)
);

export const aiRoutes = router;
