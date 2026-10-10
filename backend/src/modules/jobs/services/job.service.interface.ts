import {
  CreateJobDto,
  UpdateJobDto,
  JobQueryDto,
  IJobResponse,
  IJobDashboardStats,
  IJobMatchResponse,
} from '../dtos/job.dto.js';
import { PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';

export interface IJobService {
  createJob(userId: string, dto: CreateJobDto): Promise<IJobResponse>;
  updateJob(id: string, userId: string, dto: UpdateJobDto): Promise<IJobResponse>;
  deleteJob(id: string, userId: string): Promise<{ message: string }>;
  getJobById(id: string, userId: string): Promise<IJobResponse>;
  getAllJobs(userId: string, query: JobQueryDto): Promise<PaginatedResult<IJobResponse>>;
  getDashboardStats(userId: string): Promise<IJobDashboardStats>;
  matchJobWithAI(
    jobId: string,
    userId: string,
    customApiKey?: string
  ): Promise<IJobMatchResponse>;
}
