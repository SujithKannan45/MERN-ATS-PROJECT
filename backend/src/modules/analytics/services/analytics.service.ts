import { Types } from 'mongoose';
import { IAnalyticsService } from './analytics.service.interface.js';
import { IResumeRepository } from '../../resumes/repositories/resume.repository.interface.js';
import { IJobRepository } from '../../jobs/repositories/job.repository.interface.js';
import { IAnalysisHistoryRepository } from '../../ai/repositories/analysis-history.repository.interface.js';
import {
  IDashboardOverviewResponse,
  IDashboardChartsResponse,
  ISkillFrequency,
  ISuggestionFrequency,
  IMonthlyMetric,
  IAtsScoreTrendItem,
  IJobStatusDistributionItem,
  ILatestResumeInfo,
} from '../dtos/analytics.dto.js';
import { Resume } from '../../resumes/models/resume.model.js';
import { Job, JobStatus } from '../../jobs/models/job.model.js';
import { AnalysisHistory } from '../../ai/models/analysis-history.model.js';

export class AnalyticsService implements IAnalyticsService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_resumeRepo?: IResumeRepository, _jobRepo?: IJobRepository, _aiRepo?: IAnalysisHistoryRepository) {}

  public async getDashboardOverview(userId: string): Promise<IDashboardOverviewResponse> {
    const userObjectId = new Types.ObjectId(userId);

    // Parallel fetch for optimal latency
    const [resumes, jobs, analyses] = await Promise.all([
      Resume.find({ userId: userObjectId }).sort({ updatedAt: -1 }).exec(),
      Job.find({ userId: userObjectId }).exec(),
      AnalysisHistory.find({ userId: userObjectId }).sort({ createdAt: -1 }).exec(),
    ]);

    // 1. Resume Analytics
    const totalResumes = resumes.length;
    let latestResume: ILatestResumeInfo | null = null;
    if (resumes.length > 0) {
      const latest = resumes[0];
      latestResume = {
        id: latest._id.toString(),
        fileName: latest.fileName,
        fileType: latest.fileType,
        fileUrl: latest.fileUrl,
        version: latest.version,
        updatedAt: latest.updatedAt,
      };
    }

    const atsScores = analyses.map((a) => a.overallAtsScore).filter((s) => typeof s === 'number');
    const averageAtsScore =
      atsScores.length > 0
        ? Math.round(atsScores.reduce((sum, val) => sum + val, 0) / atsScores.length)
        : 0;
    const highestAtsScore = atsScores.length > 0 ? Math.max(...atsScores) : 0;
    const lowestAtsScore = atsScores.length > 0 ? Math.min(...atsScores) : 0;

    // 2. Job Analytics
    const jobStatusCounts: Record<string, number> = {};
    jobs.forEach((j) => {
      jobStatusCounts[j.status] = (jobStatusCounts[j.status] || 0) + 1;
    });

    const jobAnalytics = {
      totalJobs: jobs.length,
      savedJobs: jobStatusCounts['Saved'] || 0,
      appliedJobs: jobStatusCounts['Applied'] || 0,
      interviewScheduled: jobStatusCounts['Interview Scheduled'] || 0,
      interviewCompleted: jobStatusCounts['Interview Completed'] || 0,
      offers: jobStatusCounts['Offer Received'] || 0,
      accepted: jobStatusCounts['Accepted'] || 0,
      rejected: jobStatusCounts['Rejected'] || 0,
      archived: jobStatusCounts['Archived'] || 0,
    };

    // 3. AI Analytics
    const matchedJobs = jobs.filter(
      (j) => j.aiMatchResult && typeof j.aiMatchResult.overallMatchPercentage === 'number'
    );
    const totalJobMatchAnalyses = matchedJobs.length;
    const matchScores = matchedJobs.map((j) => j.aiMatchResult!.overallMatchPercentage);
    const averageJobMatchScore =
      matchScores.length > 0
        ? Math.round(matchScores.reduce((sum, val) => sum + val, 0) / matchScores.length)
        : 0;

    // Aggregate Missing Skills
    const missingSkillsMap = new Map<string, number>();
    analyses.forEach((a) => {
      const ms = a.analysisResult?.missingSkills;
      if (ms) {
        const allMissing = [
          ...(ms.technicalSkills || []),
          ...(ms.softSkills || []),
          ...(ms.tools || []),
          ...(ms.certifications || []),
        ];
        allMissing.forEach((skill) => {
          if (skill && skill.trim()) {
            const clean = skill.trim();
            missingSkillsMap.set(clean, (missingSkillsMap.get(clean) || 0) + 1);
          }
        });
      }
    });

    matchedJobs.forEach((j) => {
      j.aiMatchResult?.missingSkills?.forEach((skill) => {
        if (skill && skill.trim()) {
          const clean = skill.trim();
          missingSkillsMap.set(clean, (missingSkillsMap.get(clean) || 0) + 1);
        }
      });
    });

    const mostMissingSkills: ISkillFrequency[] = Array.from(missingSkillsMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Aggregate Frequent Resume Suggestions
    const suggestionsMap = new Map<string, number>();
    analyses.forEach((a) => {
      const sug = a.analysisResult?.suggestions;
      if (sug) {
        const allSuggestions = [
          ...(sug.atsCompatibility || []),
          ...(sug.contentQuality || []),
          ...(sug.formatting || []),
          ...(sug.experienceDescriptions || []),
          ...(sug.skills || []),
          ...(sug.projects || []),
          ...(sug.education || []),
        ];
        allSuggestions.forEach((text) => {
          if (text && text.trim()) {
            const clean = text.trim();
            suggestionsMap.set(clean, (suggestionsMap.get(clean) || 0) + 1);
          }
        });
      }
    });

    const mostFrequentResumeSuggestions: ISuggestionFrequency[] = Array.from(
      suggestionsMap.entries()
    )
      .map(([suggestion, count]) => ({ suggestion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      resumeAnalytics: {
        totalResumes,
        latestResume,
        averageAtsScore,
        highestAtsScore,
        lowestAtsScore,
      },
      jobAnalytics,
      aiAnalytics: {
        totalResumeAnalyses: analyses.length,
        totalJobMatchAnalyses,
        averageJobMatchScore,
        mostMissingSkills,
        mostFrequentResumeSuggestions,
      },
    };
  }

  public async getDashboardCharts(userId: string): Promise<IDashboardChartsResponse> {
    const userObjectId = new Types.ObjectId(userId);

    const [resumes, jobs, analyses] = await Promise.all([
      Resume.find({ userId: userObjectId }).exec(),
      Job.find({ userId: userObjectId }).exec(),
      AnalysisHistory.find({ userId: userObjectId }).sort({ createdAt: 1 }).exec(),
    ]);

    // Build last 6 months timeline labels (e.g. "Mar 2026", "Apr 2026", ...)
    const monthsTimeline: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthsTimeline.push({ key, label });
    }

    // 1. Monthly Applications
    const applicationsByMonth: Record<string, number> = {};
    jobs.forEach((job) => {
      const date = job.appliedDate || job.createdAt;
      if (date) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        applicationsByMonth[key] = (applicationsByMonth[key] || 0) + 1;
      }
    });

    const monthlyApplications: IMonthlyMetric[] = monthsTimeline.map(({ key, label }) => ({
      month: label,
      count: applicationsByMonth[key] || 0,
    }));

    // 2. Monthly Resume Uploads
    const uploadsByMonth: Record<string, number> = {};
    resumes.forEach((resume) => {
      if (resume.createdAt) {
        const key = `${resume.createdAt.getFullYear()}-${String(
          resume.createdAt.getMonth() + 1
        ).padStart(2, '0')}`;
        uploadsByMonth[key] = (uploadsByMonth[key] || 0) + 1;
      }
    });

    const monthlyResumeUploads: IMonthlyMetric[] = monthsTimeline.map(({ key, label }) => ({
      month: label,
      count: uploadsByMonth[key] || 0,
    }));

    // 3. ATS Score Trend
    const atsScoreTrend: IAtsScoreTrendItem[] = analyses.map((a) => ({
      id: a._id.toString(),
      date: a.createdAt ? a.createdAt.toISOString().split('T')[0] : 'N/A',
      score: a.overallAtsScore,
      targetJobTitle: a.targetJobTitle || undefined,
    }));

    // 4. Job Status Distribution
    const allStatuses: JobStatus[] = [
      'Saved',
      'Applied',
      'Interview Scheduled',
      'Interview Completed',
      'Offer Received',
      'Rejected',
      'Accepted',
      'Archived',
    ];

    const statusCounts: Record<string, number> = {};
    jobs.forEach((j) => {
      statusCounts[j.status] = (statusCounts[j.status] || 0) + 1;
    });

    const totalJobs = jobs.length;
    const jobStatusDistribution: IJobStatusDistributionItem[] = allStatuses.map((status) => {
      const count = statusCounts[status] || 0;
      const percentage = totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;
      return { status, count, percentage };
    });

    // 5. Top Skills (from Job requiredSkills + Resume skills)
    const skillsMap = new Map<string, number>();
    jobs.forEach((j) => {
      j.requiredSkills?.forEach((skill) => {
        if (skill && skill.trim()) {
          const clean = skill.trim();
          skillsMap.set(clean, (skillsMap.get(clean) || 0) + 1);
        }
      });
      j.aiMatchResult?.matchingSkills?.forEach((skill) => {
        if (skill && skill.trim()) {
          const clean = skill.trim();
          skillsMap.set(clean, (skillsMap.get(clean) || 0) + 1);
        }
      });
    });

    const topSkills: ISkillFrequency[] = Array.from(skillsMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 6. Missing Skills Frequency
    const missingSkillsMap = new Map<string, number>();
    analyses.forEach((a) => {
      const ms = a.analysisResult?.missingSkills;
      if (ms) {
        const allMissing = [
          ...(ms.technicalSkills || []),
          ...(ms.softSkills || []),
          ...(ms.tools || []),
          ...(ms.certifications || []),
        ];
        allMissing.forEach((skill) => {
          if (skill && skill.trim()) {
            const clean = skill.trim();
            missingSkillsMap.set(clean, (missingSkillsMap.get(clean) || 0) + 1);
          }
        });
      }
    });

    const missingSkillsFrequency: ISkillFrequency[] = Array.from(missingSkillsMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      monthlyApplications,
      monthlyResumeUploads,
      atsScoreTrend,
      jobStatusDistribution,
      topSkills,
      missingSkillsFrequency,
    };
  }
}
