import { Router } from 'express';
import { JobController } from '../controllers/job.controller.js';
import { JobService } from '../services/job.service.js';
import { JobRepository } from '../repositories/job.repository.js';
import { ResumeRepository } from '../../resumes/repositories/resume.repository.js';
import { authenticate, authorize } from '../../auth/middlewares/auth.middleware.js';
import { validateRequest } from '../../../core/middlewares/validate.middleware.js';
import { asyncHandler } from '../../../core/middlewares/async-handler.middleware.js';
import {
  createJobSchema,
  updateJobSchema,
  queryJobSchema,
  matchJobSchema,
} from '../validators/job.validator.js';

const router = Router();

// Instantiate Dependency Injection Tree
const jobRepository = new JobRepository();
const resumeRepository = new ResumeRepository();
const jobService = new JobService(jobRepository, resumeRepository);
const jobController = new JobController(jobService);

// All job routes require authentication and are restricted to candidates (and admins)
router.use(authenticate);
router.use(authorize('candidate', 'admin'));

// 1. Create a new tracked job opening
router.post(
  '/',
  validateRequest(createJobSchema),
  asyncHandler(jobController.createJob)
);

// 2. Fetch all tracked jobs (with search, filter, sort & pagination)
router.get(
  '/',
  validateRequest(queryJobSchema),
  asyncHandler(jobController.getAllJobs)
);

// 3. Get Job Dashboard aggregate statistics (MUST be placed before /:id)
router.get(
  '/dashboard',
  asyncHandler(jobController.getDashboardStats)
);

// 4. Get a single job opening by ID
router.get(
  '/:id',
  asyncHandler(jobController.getJobById)
);

// 5. Update a job opening by ID
router.put(
  '/:id',
  validateRequest(updateJobSchema),
  asyncHandler(jobController.updateJob)
);

// 6. Delete a job opening by ID
router.delete(
  '/:id',
  asyncHandler(jobController.deleteJob)
);

// 7. Perform AI Job Matching against candidate's latest resume
router.post(
  '/:id/match',
  validateRequest(matchJobSchema),
  asyncHandler(jobController.matchJobWithAI)
);

export const jobRoutes = router;
