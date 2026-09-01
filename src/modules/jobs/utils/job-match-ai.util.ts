import { GoogleGenerativeAI } from '@google/generative-ai';
import { envConfig } from '../../../config/env.config.js';
import { logger } from '../../../core/logger/logger.js';
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from '../../../core/errors/app-error.js';
import { IAiJobMatchData } from '../models/job.model.js';
import { JobMatchPrompt } from '../prompts/job-match.prompt.js';

export class JobMatchAiUtil {
  private static sanitizeLogMessage(message: string, apiKey?: string): string {
    if (!apiKey) return message;
    return message.replace(new RegExp(apiKey, 'g'), '[REDACTED_API_KEY]');
  }

  public static async matchResumeToJob(
    resumeText: string,
    jobTitle: string,
    companyName: string,
    jobDescription: string,
    requiredSkills: string[] = [],
    customApiKey?: string
  ): Promise<IAiJobMatchData> {
    const effectiveApiKey = (customApiKey || envConfig.GEMINI_API_KEY || '').trim();

    if (!effectiveApiKey) {
      throw new BadRequestError(
        'No Gemini API Key provided. Please supply an API key in header x-gemini-api-key, request body, or set GEMINI_API_KEY in server environment.'
      );
    }

    const systemInstruction = JobMatchPrompt.buildSystemInstruction();
    const userPrompt = JobMatchPrompt.buildUserPrompt(
      resumeText,
      jobTitle,
      companyName,
      jobDescription,
      requiredSkills
    );

    const maxRetries = 3;
    let attempt = 0;
    let lastError: unknown;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const genAI = new GoogleGenerativeAI(effectiveApiKey);
        const model = genAI.getGenerativeModel({
          model: envConfig.GEMINI_MODEL,
          systemInstruction,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Gemini API request timed out after 60 seconds.')),
            60000
          )
        );

        const generatePromise = model.generateContent(userPrompt);
        const response = await Promise.race([generatePromise, timeoutPromise]);
        const responseText = response.response.text();

        const cleanedJson = responseText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        const parsedResult = JSON.parse(cleanedJson) as Omit<IAiJobMatchData, 'analyzedAt'>;

        if (
          typeof parsedResult.overallMatchPercentage !== 'number' ||
          !Array.isArray(parsedResult.matchingSkills)
        ) {
          throw new Error('Malformed JSON payload received from Gemini model.');
        }

        return {
          ...parsedResult,
          analyzedAt: new Date(),
        };
      } catch (error: unknown) {
        lastError = error;
        const errorMessage = error instanceof Error ? error.message : String(error);
        const sanitizedError = this.sanitizeLogMessage(errorMessage, effectiveApiKey);

        if (
          errorMessage.includes('API_KEY_INVALID') ||
          errorMessage.includes('API key not valid') ||
          errorMessage.includes('403') ||
          errorMessage.includes('401')
        ) {
          logger.warn(`Invalid Gemini API Key in job matching request: ${sanitizedError}`);
          throw new UnauthorizedError(
            'The provided Google Gemini API Key is invalid or unauthorized.'
          );
        }

        const isRateLimit =
          errorMessage.includes('429') ||
          errorMessage.includes('RESOURCE_EXHAUSTED') ||
          errorMessage.includes('quota');

        if (isRateLimit) {
          logger.warn(`Gemini rate limit hit during job matching (attempt ${attempt}/${maxRetries}).`);
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            continue;
          }
          throw new BadRequestError('Gemini AI quota exceeded. Please retry shortly.');
        }

        if (attempt < maxRetries) {
          logger.warn(`Transient error in Gemini job match (attempt ${attempt}): ${sanitizedError}`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    const finalMessage = lastError instanceof Error ? lastError.message : 'Unknown AI match error';
    logger.error(`Job match AI failed: ${this.sanitizeLogMessage(finalMessage, effectiveApiKey)}`);
    throw new InternalServerError('Failed to evaluate job match with AI. Please try again.');
  }
}
