import { Types } from 'mongoose';
import { IJobRepository } from '../repositories/job.repository.interface.js';
import { IResumeRepository } from '../../resumes/repositories/resume.repository.interface.js';
import { IJobService } from './job.service.interface.js';
import { JobMatchAiUtil } from '../utils/job-match-ai.util.js';
import { IJobDocument } from '../models/job.model.js';
import {
  CreateJobDto,
  UpdateJobDto,
  JobQueryDto,
  IJobResponse,
  IJobDashboardStats,
  IJobMatchResponse,
} from '../dtos/job.dto.js';
import { PaginatedResult } from '../../../shared/repositories/base.repository.interface.js';
import { BadRequestError, NotFoundError } from '../../../core/errors/app-error.js';
import { logger } from '../../../core/logger/logger.js';

export class JobService implements IJobService {
  private readonly jobRepository: IJobRepository;
  private readonly resumeRepository: IResumeRepository;

  constructor(
    jobRepository: IJobRepository,
    resumeRepository: IResumeRepository
  ) {
    this.jobRepository = jobRepository;
    this.resumeRepository = resumeRepository;
  }

  private mapJobResponse(job: IJobDocument): IJobResponse {
    return {
      id: job._id.toString(),
      userId: job.userId.toString(),
      companyName: job.companyName,
      jobTitle: job.jobTitle,
      jobDescription: job.jobDescription,
      jobUrl: job.jobUrl,
      employmentType: job.employmentType,
      workplaceType: job.workplaceType,
      location: job.location,
      salary: job.salary,
      requiredSkills: job.requiredSkills || [],
      status: job.status,
      priority: job.priority,
      notes: job.notes,
      appliedDate: job.appliedDate,
      interviewDate: job.interviewDate,
      offerDate: job.offerDate,
      rejectionDate: job.rejectionDate,
      aiMatchResult: job.aiMatchResult,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  public async createJob(userId: string, dto: CreateJobDto): Promise<IJobResponse> {
    const appliedDate =
      dto.appliedDate ? new Date(dto.appliedDate) : dto.status === 'Applied' ? new Date() : undefined;
    const interviewDate =
      dto.interviewDate
        ? new Date(dto.interviewDate)
        : dto.status === 'Interview Scheduled'
        ? new Date()
        : undefined;
    const offerDate =
      dto.offerDate ? new Date(dto.offerDate) : dto.status === 'Offer Received' ? new Date() : undefined;
    const rejectionDate =
      dto.rejectionDate ? new Date(dto.rejectionDate) : dto.status === 'Rejected' ? new Date() : undefined;

    const job = await this.jobRepository.create({
      userId: new Types.ObjectId(userId),
      companyName: dto.companyName.trim(),
      jobTitle: dto.jobTitle.trim(),
      jobDescription: dto.jobDescription?.trim() || '',
      jobUrl: dto.jobUrl?.trim() || '',
      employmentType: dto.employmentType || 'Full-time',
      workplaceType: dto.workplaceType || 'Remote',
      location: dto.location?.trim() || '',
      salary: dto.salary,
      requiredSkills: dto.requiredSkills || [],
      status: dto.status || 'Saved',
      priority: dto.priority || 'Medium',
      notes: dto.notes?.trim() || '',
      appliedDate,
      interviewDate,
      offerDate,
      rejectionDate,
    });

    logger.info(`Job tracked successfully for user: ${userId}`, {
      jobId: job._id,
      company: job.companyName,
      title: job.jobTitle,
    });

    return this.mapJobResponse(job);
  }

  public async updateJob(
    id: string,
    userId: string,
    dto: UpdateJobDto
  ): Promise<IJobResponse> {
    const job = await this.jobRepository.findByIdAndUserId(id, userId);
    if (!job) {
      throw new NotFoundError(`Job opening with ID '${id}' not found.`);
    }

    if (dto.companyName !== undefined) job.companyName = dto.companyName.trim();
    if (dto.jobTitle !== undefined) job.jobTitle = dto.jobTitle.trim();
    if (dto.jobDescription !== undefined) job.jobDescription = dto.jobDescription.trim();
    if (dto.jobUrl !== undefined) job.jobUrl = dto.jobUrl.trim();
    if (dto.employmentType !== undefined) job.employmentType = dto.employmentType;
    if (dto.workplaceType !== undefined) job.workplaceType = dto.workplaceType;
    if (dto.location !== undefined) job.location = dto.location.trim();
    if (dto.salary !== undefined) job.salary = dto.salary;
    if (dto.requiredSkills !== undefined) job.requiredSkills = dto.requiredSkills;
    if (dto.priority !== undefined) job.priority = dto.priority;
    if (dto.notes !== undefined) job.notes = dto.notes.trim();

    // Handle status transitions and automatic dates
    if (dto.status !== undefined && dto.status !== job.status) {
      job.status = dto.status;
      if (dto.status === 'Applied' && !job.appliedDate && !dto.appliedDate) {
        job.appliedDate = new Date();
      }
      if (
        dto.status === 'Interview Scheduled' &&
        !job.interviewDate &&
        !dto.interviewDate
      ) {
        job.interviewDate = new Date();
      }
      if (dto.status === 'Offer Received' && !job.offerDate && !dto.offerDate) {
        job.offerDate = new Date();
      }
      if (dto.status === 'Rejected' && !job.rejectionDate && !dto.rejectionDate) {
        job.rejectionDate = new Date();
      }
    }

    if (dto.appliedDate !== undefined) {
      job.appliedDate = dto.appliedDate ? new Date(dto.appliedDate) : undefined;
    }
    if (dto.interviewDate !== undefined) {
      job.interviewDate = dto.interviewDate ? new Date(dto.interviewDate) : undefined;
    }
    if (dto.offerDate !== undefined) {
      job.offerDate = dto.offerDate ? new Date(dto.offerDate) : undefined;
    }
    if (dto.rejectionDate !== undefined) {
      job.rejectionDate = dto.rejectionDate ? new Date(dto.rejectionDate) : undefined;
    }

    await job.save();

    logger.info(`Job opening updated for user: ${userId}`, { jobId: job._id });

    return this.mapJobResponse(job);
  }

  public async deleteJob(id: string, userId: string): Promise<{ message: string }> {
    const job = await this.jobRepository.deleteByIdAndUserId(id, userId);
    if (!job) {
      throw new NotFoundError(`Job opening with ID '${id}' not found.`);
    }

    logger.info(`Job opening deleted for user: ${userId}`, { jobId: id });

    return { message: 'Job opening deleted successfully.' };
  }

  public async getJobById(id: string, userId: string): Promise<IJobResponse> {
    const job = await this.jobRepository.findByIdAndUserId(id, userId);
    if (!job) {
      throw new NotFoundError(`Job opening with ID '${id}' not found.`);
    }

    return this.mapJobResponse(job);
  }

  public async getAllJobs(
    userId: string,
    query: JobQueryDto
  ): Promise<PaginatedResult<IJobResponse>> {
    const paginated = await this.jobRepository.findJobsWithFilters(userId, query);

    return {
      data: paginated.data.map((job) => this.mapJobResponse(job)),
      pagination: paginated.pagination,
    };
  }

  public async getDashboardStats(userId: string): Promise<IJobDashboardStats> {
    return this.jobRepository.getDashboardStatistics(userId);
  }

  public async matchJobWithAI(
    jobId: string,
    userId: string,
    customApiKey?: string
  ): Promise<IJobMatchResponse> {
    const job = await this.jobRepository.findByIdAndUserId(jobId, userId);
    if (!job) {
      throw new NotFoundError(`Job opening with ID '${jobId}' not found.`);
    }

    if (!job.jobDescription || job.jobDescription.trim().length < 20) {
      throw new BadRequestError(
        'Job description is missing or too short to evaluate AI matching. Please edit the job and provide a complete job description.'
      );
    }

    const currentResume = await this.resumeRepository.findByUserId(userId);
    if (!currentResume || !currentResume.extractedText) {
      throw new BadRequestError(
        'No active resume found for your candidate profile. Please upload a resume first using POST /api/v1/resumes/upload before running AI job matching.'
      );
    }

    const matchResult = await JobMatchAiUtil.matchResumeToJob(
      currentResume.extractedText,
      job.jobTitle,
      job.companyName,
      job.jobDescription,
      job.requiredSkills || [],
      customApiKey
    );

    // Cache/persist match evaluation onto the job document
    job.aiMatchResult = matchResult;
    await job.save();

    logger.info(`AI Job Match calculated for job ${jobId} and user ${userId}`, {
      matchPercentage: matchResult.overallMatchPercentage,
    });

    return {
      ...matchResult,
      jobId: job._id.toString(),
      jobTitle: job.jobTitle,
      companyName: job.companyName,
    };
  }
}
