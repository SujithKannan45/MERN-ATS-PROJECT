import { Types } from 'mongoose';
import { IAnalysisHistoryRepository } from '../repositories/analysis-history.repository.interface.js';
import { IResumeRepository } from '../../resumes/repositories/resume.repository.interface.js';
import { IAiAnalysisService } from './ai-analysis.service.interface.js';
import { GeminiUtil } from '../utils/gemini.util.js';
import { IAnalysisHistoryDocument } from '../models/analysis-history.model.js';
import {
  AnalyzeResumeRequestDto,
  IAnalysisHistoryResponse,
} from '../dtos/ai-analysis.dto.js';
import {
  PaginatedResult,
  PaginationOptions,
} from '../../../shared/repositories/base.repository.interface.js';
import { BadRequestError, NotFoundError } from '../../../core/errors/app-error.js';
import { logger } from '../../../core/logger/logger.js';

export class AiAnalysisService implements IAiAnalysisService {
  private readonly historyRepository: IAnalysisHistoryRepository;
  private readonly resumeRepository: IResumeRepository;

  constructor(
    historyRepository: IAnalysisHistoryRepository,
    resumeRepository: IResumeRepository
  ) {
    this.historyRepository = historyRepository;
    this.resumeRepository = resumeRepository;
  }

  private mapHistoryResponse(doc: IAnalysisHistoryDocument): IAnalysisHistoryResponse {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      resumeId: doc.resumeId ? doc.resumeId.toString() : undefined,
      targetJobTitle: doc.targetJobTitle,
      jobDescriptionSnippet: doc.jobDescription
        ? doc.jobDescription.slice(0, 150) + (doc.jobDescription.length > 150 ? '...' : '')
        : undefined,
      overallAtsScore: doc.overallAtsScore,
      matchPercentage: doc.matchPercentage,
      analysisResult: doc.analysisResult,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  public async analyzeResume(
    userId: string,
    dto: AnalyzeResumeRequestDto,
    requestApiKey?: string
  ): Promise<IAnalysisHistoryResponse> {
    let resumeText = dto.resumeText?.trim();
    let resolvedResumeId: string | undefined = dto.resumeId;

    // 1. Resolve Resume Content if text is not explicitly supplied
    if (!resumeText) {
      if (resolvedResumeId) {
        const resume = await this.resumeRepository.findById(resolvedResumeId);
        if (!resume || resume.userId.toString() !== userId) {
          throw new NotFoundError('Specified resume was not found or does not belong to this user.');
        }
        resumeText = resume.extractedText;
      } else {
        // Fetch candidate's current active uploaded resume
        const currentResume = await this.resumeRepository.findByUserId(userId);
        if (!currentResume) {
          throw new BadRequestError(
            'No resume text provided and no active resume found on your profile. Please upload a resume first or provide resumeText in the request.'
          );
        }
        resumeText = currentResume.extractedText;
        resolvedResumeId = currentResume._id.toString();
      }
    }

    if (!resumeText || resumeText.length < 20) {
      throw new BadRequestError(
        'Resume content is too short or empty for comprehensive ATS evaluation.'
      );
    }

    // 2. Perform AI Evaluation via Gemini
    const effectiveApiKey = requestApiKey || dto.customApiKey;
    const analysisResult = await GeminiUtil.generateResumeAnalysis(
      resumeText,
      dto.targetJobTitle,
      dto.jobDescription,
      effectiveApiKey
    );

    // 3. Persist Analysis Report in MongoDB
    const historyDoc = await this.historyRepository.create({
      userId: new Types.ObjectId(userId),
      resumeId: resolvedResumeId ? new Types.ObjectId(resolvedResumeId) : undefined,
      targetJobTitle: dto.targetJobTitle || '',
      jobDescription: dto.jobDescription || '',
      overallAtsScore: analysisResult.atsScore.overallScore,
      matchPercentage: analysisResult.jobMatch.matchPercentage,
      analysisResult,
    });

    logger.info(`Resume ATS analysis completed for user: ${userId}`, {
      reportId: historyDoc._id,
      overallScore: analysisResult.atsScore.overallScore,
      matchPercentage: analysisResult.jobMatch.matchPercentage,
    });

    return this.mapHistoryResponse(historyDoc);
  }

  public async getAnalysisHistory(
    userId: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<IAnalysisHistoryResponse>> {
    const paginatedDocs = await this.historyRepository.findByUserId(userId, pagination);

    return {
      data: paginatedDocs.data.map((doc) => this.mapHistoryResponse(doc)),
      pagination: paginatedDocs.pagination,
    };
  }

  public async getAnalysisById(
    id: string,
    userId: string
  ): Promise<IAnalysisHistoryResponse> {
    const doc = await this.historyRepository.findByIdAndUserId(id, userId);
    if (!doc) {
      throw new NotFoundError(`Analysis report with ID '${id}' not found.`);
    }

    return this.mapHistoryResponse(doc);
  }

  public async deleteAnalysisById(
    id: string,
    userId: string
  ): Promise<{ message: string }> {
    const doc = await this.historyRepository.deleteByIdAndUserId(id, userId);
    if (!doc) {
      throw new NotFoundError(`Analysis report with ID '${id}' not found.`);
    }

    return { message: 'Analysis report deleted successfully.' };
  }
}
