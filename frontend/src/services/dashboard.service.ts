import { apiClient } from './api.client';
import type { ApiResponse } from '@/types';

export interface ILatestResumeInfo {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  version: number;
  updatedAt: string | Date;
}

export interface IResumeAnalytics {
  totalResumes: number;
  latestResume: ILatestResumeInfo | null;
  averageAtsScore: number;
  highestAtsScore: number;
  lowestAtsScore: number;
}

export interface IJobAnalytics {
  totalJobs: number;
  savedJobs: number;
  appliedJobs: number;
  interviewScheduled: number;
  interviewCompleted: number;
  offers: number;
  accepted: number;
  rejected: number;
  archived: number;
}

export interface ISkillFrequency {
  skill: string;
  count: number;
}

export interface ISuggestionFrequency {
  suggestion: string;
  count: number;
}

export interface IAiAnalytics {
  totalResumeAnalyses: number;
  totalJobMatchAnalyses: number;
  averageJobMatchScore: number;
  mostMissingSkills: ISkillFrequency[];
  mostFrequentResumeSuggestions: ISuggestionFrequency[];
}

export interface IDashboardOverviewResponse {
  resumeAnalytics: IResumeAnalytics;
  jobAnalytics: IJobAnalytics;
  aiAnalytics: IAiAnalytics;
}

export interface ITrackedJob {
  _id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  status: 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Archived';
  priority?: 'Low' | 'Medium' | 'High';
  location?: string;
  employmentType?: string;
  workplaceType?: string;
  appliedDate?: string;
  interviewDate?: string;
  updatedAt: string;
  createdAt: string;
}

export interface INotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export const dashboardService = {
  async getOverview(): Promise<IDashboardOverviewResponse> {
    const response = await apiClient.get<ApiResponse<IDashboardOverviewResponse>>('/dashboard');
    return response.data.data;
  },

  async getRecentJobs(limit = 5): Promise<{ jobs: ITrackedJob[]; total: number }> {
    const response = await apiClient.get<ApiResponse<ITrackedJob[]>>(`/jobs?limit=${limit}&sortBy=updatedAt&order=desc`);
    return {
      jobs: response.data.data || [],
      total: (response.data.meta as { totalItems?: number })?.totalItems || 0,
    };
  },

  async getRecentNotifications(limit = 5): Promise<INotificationItem[]> {
    const response = await apiClient.get<ApiResponse<INotificationItem[]>>(`/notifications?limit=${limit}`);
    return response.data.data || [];
  },

  async getCurrentResume(): Promise<ILatestResumeInfo | null> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/resumes/me');
      if (response.data.data) {
        const d = response.data.data;
        return {
          id: d._id || d.id,
          fileName: d.fileName,
          fileType: d.fileType,
          fileUrl: d.fileUrl,
          version: d.version,
          updatedAt: d.updatedAt,
        };
      }
      return null;
    } catch {
      return null;
    }
  },
};
