import { apiClient } from './api.client';
import type { ApiResponse } from '@/types';

export interface IAtsScoreBreakdown {
  formatting: number;
  keywords: number;
  skills: number;
  experience: number;
  education: number;
  readability: number;
}

export interface IStrengthAnalysis {
  technicalSkills: string[];
  softSkills: string[];
  relevantExperience: string[];
  certifications: string[];
  projects: string[];
  leadership: string[];
}

export interface IWeaknessAnalysis {
  missingInformation: string[];
  weakDescriptions: string[];
  formattingIssues: string[];
  missingAchievements: string[];
  poorReadability: string[];
}

export interface IMissingSkills {
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  certifications: string[];
}

export interface IJobMatchAnalysis {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  matchExplanation: string;
}

export interface IResumeSuggestions {
  atsCompatibility: string[];
  contentQuality: string[];
  formatting: string[];
  experienceDescriptions: string[];
  skills: string[];
  projects: string[];
  education: string[];
}

export interface IKeywordAnalysis {
  missingKeywords: string[];
  frequentlyUsedKeywords: string[];
  recommendedKeywords: string[];
}

export interface ISectionEvaluation {
  score: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  feedback: string;
  suggestions: string[];
}

export interface ISectionAnalysis {
  contact?: ISectionEvaluation;
  summary?: ISectionEvaluation;
  skills?: ISectionEvaluation;
  experience?: ISectionEvaluation;
  education?: ISectionEvaluation;
  projects?: ISectionEvaluation;
  certifications?: ISectionEvaluation;
  achievements?: ISectionEvaluation;
}

export interface IGrammarMistake {
  error: string;
  correction: string;
  context: string;
}

export interface IPassiveVoiceInstance {
  instance: string;
  activeAlternative: string;
}

export interface IWeakWordingInstance {
  weakWord: string;
  strongAlternative: string;
  reason: string;
}

export interface IGrammarAnalysis {
  grammarMistakes: IGrammarMistake[];
  spellingMistakes: IGrammarMistake[];
  passiveVoiceInstances: IPassiveVoiceInstance[];
  weakWording: IWeakWordingInstance[];
  overallWritingQuality: string;
}

export interface IResumeAnalysisResult {
  atsScore: {
    overallScore: number;
    breakdown: IAtsScoreBreakdown;
  };
  professionalSummary?: string;
  strengths: IStrengthAnalysis;
  weaknesses: IWeaknessAnalysis;
  missingSkills: IMissingSkills;
  jobMatch?: IJobMatchAnalysis;
  suggestions: IResumeSuggestions;
  keywordAnalysis: IKeywordAnalysis;
  sectionAnalysis?: ISectionAnalysis;
  grammarAndWriting?: IGrammarAnalysis;
}

export interface AnalyzeResumeRequestDto {
  resumeId?: string;
  resumeText?: string;
  targetJobTitle?: string;
  jobDescription?: string;
  customApiKey?: string;
}

export interface IAnalysisHistoryItem {
  _id?: string;
  id?: string;
  userId: string;
  resumeId?: string;
  targetJobTitle?: string;
  jobDescriptionSnippet?: string;
  overallAtsScore: number;
  matchPercentage: number;
  analysisResult: IResumeAnalysisResult;
  createdAt: string;
  updatedAt: string;
}

export const aiService = {
  /**
   * Run Gemini AI ATS Analysis
   */
  async analyzeResume(data: AnalyzeResumeRequestDto): Promise<IResumeAnalysisResult> {
    const response = await apiClient.post<ApiResponse<IResumeAnalysisResult>>('/ai/analyze', data);
    return response.data.data;
  },

  /**
   * Fetch analysis history
   */
  async getHistory(page = 1, limit = 10): Promise<{ history: IAnalysisHistoryItem[]; total: number }> {
    const response = await apiClient.get<ApiResponse<IAnalysisHistoryItem[]>>(
      `/ai/history?page=${page}&limit=${limit}`
    );
    const meta = response.data.meta as { totalItems?: number };
    return {
      history: response.data.data || [],
      total: meta?.totalItems || (response.data.data || []).length,
    };
  },

  /**
   * Get single analysis report
   */
  async getHistoryById(id: string): Promise<IAnalysisHistoryItem> {
    const response = await apiClient.get<ApiResponse<IAnalysisHistoryItem>>(`/ai/history/${id}`);
    return response.data.data;
  },

  /**
   * Delete an analysis report from history
   */
  async deleteHistory(id: string): Promise<void> {
    await apiClient.delete(`/ai/history/${id}`);
  },
};
