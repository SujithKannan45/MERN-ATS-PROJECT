import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller.js';
import { ResumeService } from '../services/resume.service.js';
import { ResumeRepository } from '../repositories/resume.repository.js';
import { authenticate, authorize } from '../../auth/middlewares/auth.middleware.js';
import { resumeUploadMiddleware } from '../middlewares/upload.middleware.js';
import { asyncHandler } from '../../../core/middlewares/async-handler.middleware.js';

const router = Router();

// Instantiate Dependency Injection Tree
const resumeRepository = new ResumeRepository();
const resumeService = new ResumeService(resumeRepository);
const resumeController = new ResumeController(resumeService);

// All resume routes require authentication and are restricted to candidates (and admins)
router.use(authenticate);
router.use(authorize('candidate', 'admin'));

// 1. Upload Resume
router.post(
  '/upload',
  resumeUploadMiddleware,
  asyncHandler(resumeController.uploadResume)
);

// 2. Replace / Update Resume
router.put(
  '/update',
  resumeUploadMiddleware,
  asyncHandler(resumeController.updateResume)
);

// 3. Delete Resume
router.delete(
  '/delete',
  asyncHandler(resumeController.deleteResume)
);

// 4. Get Current User's Full Resume (With Text)
router.get(
  '/me',
  asyncHandler(resumeController.getCurrentResume)
);

// 5. Get Resume Metadata (Lightweight)
router.get(
  '/metadata',
  asyncHandler(resumeController.getResumeMetadata)
);

// 6. Download Resume
router.get(
  '/download',
  asyncHandler(resumeController.downloadResume)
);

export const resumeRoutes = router;
