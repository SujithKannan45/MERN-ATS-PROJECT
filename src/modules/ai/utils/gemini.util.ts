import { GoogleGenerativeAI } from '@google/generative-ai';
import { envConfig } from '../../../config/env.config.js';
import { logger } from '../../../core/logger/logger.js';
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from '../../../core/errors/app-error.js';
import { IResumeAnalysisResult } from '../dtos/ai-analysis.dto.js';
import { ResumeAnalysisPrompt } from '../prompts/resume-analysis.prompt.js';

export class GeminiUtil {
  private static sanitizeLogMessage(message: string, apiKey?: string): string {
    if (!apiKey) return message;
    return message.replace(new RegExp(apiKey, 'g'), '[REDACTED_API_KEY]');
  }

  /**
   * Dispatches the resume analysis prompt to Google Gemini with retry and timeout mechanisms
   */
  public static async generateResumeAnalysis(
    resumeText: string,
    targetJobTitle?: string,
    jobDescription?: string,
    customApiKey?: string
  ): Promise<IResumeAnalysisResult> {
    // 1. Resolve Effective API Key
    const effectiveApiKey = (customApiKey || envConfig.GEMINI_API_KEY || '').trim();

    if (!effectiveApiKey) {
      throw new BadRequestError(
        'No Gemini API Key provided. Please supply an API key in the request header (x-gemini-api-key), request body, or configure GEMINI_API_KEY in the server environment.'
      );
    }

    const systemInstruction = ResumeAnalysisPrompt.buildSystemInstruction();
    const userPrompt = ResumeAnalysisPrompt.buildUserPrompt(
      resumeText,
      targetJobTitle,
      jobDescription
    );

    const maxRetries = 3;
    let attempt = 0;
    let lastError: unknown;

    while (attempt < maxRetries) {
      attempt++;
      try {
        // Instantiate fresh SDK instance for this request and immediately scope it
        const genAI = new GoogleGenerativeAI(effectiveApiKey);
        const model = genAI.getGenerativeModel({
          model: envConfig.GEMINI_MODEL,
          systemInstruction,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2, // Low temperature for consistent, objective ATS scoring
          },
        });

        // 60-second timeout promise
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Gemini API request timed out after 60 seconds.')),
            60000
          )
        );

        const generatePromise = model.generateContent(userPrompt);
        const response = await Promise.race([generatePromise, timeoutPromise]);
        const responseText = response.response.text();

        // Parse JSON response
        const cleanedJson = responseText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        const parsedResult = JSON.parse(cleanedJson) as IResumeAnalysisResult;

        // Basic structural validation
        if (!parsedResult.atsScore || typeof parsedResult.atsScore.overallScore !== 'number') {
          throw new Error('Malformed JSON payload received from Gemini model.');
        }

        return parsedResult;
      } catch (error: unknown) {
        lastError = error;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const sanitizedError = this.sanitizeLogMessage(errorMessage, effectiveApiKey);

        // Check for Invalid API Key errors (HTTP 400/403 with API_KEY_INVALID)
        if (
          errorMessage.includes('API_KEY_INVALID') ||
          errorMessage.includes('API key not valid') ||
          errorMessage.includes('403') ||
          errorMessage.includes('401')
        ) {
          logger.warn(`Invalid Gemini API Key provided in request: ${sanitizedError}`);
          throw new UnauthorizedError(
            'The provided Google Gemini API Key is invalid or unauthorized. Please verify your credentials.'
          );
        }

        // Check for Rate Limit / Quota Exceeded (HTTP 429)
        const isRateLimit =
          errorMessage.includes('429') ||
          errorMessage.includes('RESOURCE_EXHAUSTED') ||
          errorMessage.includes('quota');

        if (isRateLimit) {
          logger.warn(
            `Gemini Rate limit reached on attempt ${attempt}/${maxRetries}. Retrying with backoff...`
          );
          if (attempt < maxRetries) {
            const delayMs = Math.pow(2, attempt) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }
          throw new BadRequestError(
            'Gemini AI quota or rate limit exceeded. If using a free API key, please wait a minute before retrying or use a different key.'
          );
        }

        // Retry on transient server / network errors
        if (attempt < maxRetries) {
          logger.warn(
            `Transient error in Gemini call (attempt ${attempt}/${maxRetries}): ${sanitizedError}. Retrying...`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    const finalMessage = lastError instanceof Error ? lastError.message : 'Unknown AI processing error';
    logger.error(`Gemini analysis failed after ${maxRetries} attempts: ${this.sanitizeLogMessage(finalMessage, effectiveApiKey)}`);
    throw new InternalServerError('Failed to analyze resume with AI. Please try again.');
  }
}
