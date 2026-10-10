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
  contact: ISectionEvaluation;
  summary: ISectionEvaluation;
  skills: ISectionEvaluation;
  experience: ISectionEvaluation;
  education: ISectionEvaluation;
  projects: ISectionEvaluation;
  certifications: ISectionEvaluation;
  achievements: ISectionEvaluation;
}

export interface IExperienceAnalysis {
  relevance: string;
  impact: string;
  actionVerbsUsage: string;
  quantifiedAchievements: string[];
  careerProgression: string;
}

export interface IEducationAnalysis {
  completeness: string;
  relevance: string;
  certifications: string[];
  academicDetails: string;
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
  professionalSummary: string;
  strengths: IStrengthAnalysis;
  weaknesses: IWeaknessAnalysis;
  missingSkills: IMissingSkills;
  jobMatch: IJobMatchAnalysis;
  suggestions: IResumeSuggestions;
  keywordAnalysis: IKeywordAnalysis;
  sectionAnalysis: ISectionAnalysis;
  experienceAnalysis: IExperienceAnalysis;
  educationAnalysis: IEducationAnalysis;
  grammarAndWriting: IGrammarAnalysis;
}

export interface AnalyzeResumeRequestDto {
  resumeId?: string;
  resumeText?: string;
  targetJobTitle?: string;
  jobDescription?: string;
  customApiKey?: string;
}

export interface IAnalysisHistoryResponse {
  id: string;
  userId: string;
  resumeId?: string;
  targetJobTitle?: string;
  jobDescriptionSnippet?: string;
  overallAtsScore: number;
  matchPercentage: number;
  analysisResult: IResumeAnalysisResult;
  createdAt: Date;
  updatedAt: Date;
}
