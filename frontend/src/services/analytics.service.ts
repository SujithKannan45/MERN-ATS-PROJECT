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

export interface IMonthlyMetric {
  month: string;
  count: number;
}

export interface IAtsScoreTrendItem {
  id: string;
  date: string;
  score: number;
  targetJobTitle?: string;
}

export interface IJobStatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
}

export interface IDashboardChartsResponse {
  monthlyApplications: IMonthlyMetric[];
  monthlyResumeUploads: IMonthlyMetric[];
  atsScoreTrend: IAtsScoreTrendItem[];
  jobStatusDistribution: IJobStatusDistributionItem[];
  topSkills: ISkillFrequency[];
  missingSkillsFrequency: ISkillFrequency[];
}

export const analyticsService = {
  /**
   * Fetch aggregate KPI overview from /dashboard
   */
  async getOverview(): Promise<IDashboardOverviewResponse> {
    const response = await apiClient.get<ApiResponse<IDashboardOverviewResponse>>('/dashboard');
    return response.data.data;
  },

  /**
   * Fetch time-series and aggregate chart metrics from /dashboard/charts
   */
  async getCharts(): Promise<IDashboardChartsResponse> {
    const response = await apiClient.get<ApiResponse<IDashboardChartsResponse>>('/dashboard/charts');
    return response.data.data;
  },
};
