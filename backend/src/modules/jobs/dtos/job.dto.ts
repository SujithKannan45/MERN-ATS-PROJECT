import {
  JobStatus,
  WorkplaceType,
  EmploymentType,
  JobPriority,
  ISalaryRange,
  IAiJobMatchData,
} from '../models/job.model.js';

export interface CreateJobDto {
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  jobUrl?: string;
  employmentType?: EmploymentType;
  workplaceType?: WorkplaceType;
  location?: string;
  salary?: ISalaryRange;
  requiredSkills?: string[];
  status?: JobStatus;
  priority?: JobPriority;
  notes?: string;
  appliedDate?: Date | string;
  interviewDate?: Date | string;
  offerDate?: Date | string;
  rejectionDate?: Date | string;
}

export interface UpdateJobDto {
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  jobUrl?: string;
  employmentType?: EmploymentType;
  workplaceType?: WorkplaceType;
  location?: string;
  salary?: ISalaryRange;
  requiredSkills?: string[];
  status?: JobStatus;
  priority?: JobPriority;
  notes?: string;
  appliedDate?: Date | string;
  interviewDate?: Date | string;
  offerDate?: Date | string;
  rejectionDate?: Date | string;
}

export interface JobQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: JobStatus;
  priority?: JobPriority;
  workplaceType?: WorkplaceType;
  employmentType?: EmploymentType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IJobResponse {
  id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  jobUrl?: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  location?: string;
  salary?: ISalaryRange;
  requiredSkills: string[];
  status: JobStatus;
  priority: JobPriority;
  notes?: string;
  appliedDate?: Date;
  interviewDate?: Date;
  offerDate?: Date;
  rejectionDate?: Date;
  aiMatchResult?: IAiJobMatchData;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJobDashboardStats {
  totalJobs: number;
  savedJobs: number;
  appliedJobs: number;
  interviews: number;
  offers: number;
  rejections: number;
  acceptedJobs: number;
  archivedJobs: number;
}

export interface IJobMatchResponse extends IAiJobMatchData {
  jobId: string;
  jobTitle: string;
  companyName: string;
}
