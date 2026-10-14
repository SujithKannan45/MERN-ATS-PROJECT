import { apiClient } from './api.client';
import type { ApiResponse, PaginationMeta } from '@/types';

export type JobStatus =
  | 'Saved'
  | 'Applied'
  | 'Interview Scheduled'
  | 'Interview Completed'
  | 'Offer Received'
  | 'Rejected'
  | 'Accepted'
  | 'Archived';

export type WorkplaceType = 'Remote' | 'Hybrid' | 'On-site';

export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Internship'
  | 'Freelance'
  | 'Temporary'
  | 'Other';

export type JobPriority = 'Low' | 'Medium' | 'High';

export interface ISalaryRange {
  min?: number;
  max?: number;
  currency?: string;
  period?: 'hourly' | 'monthly' | 'yearly';
}

export interface IAtsCompatibility {
  score: number;
  feedback: string;
}

export interface IAiJobMatchData {
  overallMatchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  matchingExperience: string[];
  missingExperience: string[];
  matchingEducation: string[];
  keywordMatchScore: number;
  atsCompatibility: IAtsCompatibility;
  matchExplanation: string;
  analyzedAt: string | Date;
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
  appliedDate?: string;
  interviewDate?: string;
  offerDate?: string;
  rejectionDate?: string;
  aiMatchResult?: IAiJobMatchData;
  createdAt: string;
  updatedAt: string;
}

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
  appliedDate?: string;
  interviewDate?: string;
  offerDate?: string;
  rejectionDate?: string;
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
  appliedDate?: string | null;
  interviewDate?: string | null;
  offerDate?: string | null;
  rejectionDate?: string | null;
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

export interface PaginatedJobsResult {
  jobs: IJobResponse[];
  pagination: PaginationMeta;
}

export const jobService = {
  /**
   * Fetch paginated jobs with search, filtering, and sorting
   */
  async getAllJobs(query: JobQueryDto = {}): Promise<PaginatedJobsResult> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.search) params.append('search', query.search);
    if (query.status) params.append('status', query.status);
    if (query.priority) params.append('priority', query.priority);
    if (query.workplaceType) params.append('workplaceType', query.workplaceType);
    if (query.employmentType) params.append('employmentType', query.employmentType);
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `/jobs?${queryString}` : '/jobs';

    const response = await apiClient.get<ApiResponse<IJobResponse[]>>(endpoint);
    return {
      jobs: response.data.data || [],
      pagination: (response.data.meta as PaginationMeta) || {
        page: query.page || 1,
        limit: query.limit || 10,
        totalItems: (response.data.data || []).length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  /**
   * Fetch aggregate job pipeline statistics
   */
  async getDashboardStats(): Promise<IJobDashboardStats> {
    const response = await apiClient.get<ApiResponse<IJobDashboardStats>>('/jobs/dashboard');
    return response.data.data;
  },

  /**
   * Fetch a single job by ID
   */
  async getJobById(id: string): Promise<IJobResponse> {
    const response = await apiClient.get<ApiResponse<IJobResponse>>(`/jobs/${id}`);
    return response.data.data;
  },

  /**
   * Create a new tracked job
   */
  async createJob(dto: CreateJobDto): Promise<IJobResponse> {
    const response = await apiClient.post<ApiResponse<IJobResponse>>('/jobs', dto);
    return response.data.data;
  },

  /**
   * Update an existing job opening
   */
  async updateJob(id: string, dto: UpdateJobDto): Promise<IJobResponse> {
    const response = await apiClient.put<ApiResponse<IJobResponse>>(`/jobs/${id}`, dto);
    return response.data.data;
  },

  /**
   * Delete a job opening by ID
   */
  async deleteJob(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/jobs/${id}`);
    return response.data.data;
  },

  /**
   * Run Gemini AI match between active resume and target job
   */
  async matchJobWithAI(jobId: string, customApiKey?: string): Promise<IJobMatchResponse> {
    const response = await apiClient.post<ApiResponse<IJobMatchResponse>>(
      `/jobs/${jobId}/match`,
      customApiKey ? { customApiKey } : {}
    );
    return response.data.data;
  },
};
