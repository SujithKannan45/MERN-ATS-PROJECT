import { z } from 'zod';

export const analyzeResumeSchema = z.object({
  body: z.object({
    resumeId: z.string().optional(),
    resumeText: z
      .string()
      .min(20, 'Resume text must be at least 20 characters long')
      .max(50000, 'Resume text cannot exceed 50,000 characters')
      .optional(),
    targetJobTitle: z
      .string()
      .max(200, 'Target job title cannot exceed 200 characters')
      .optional(),
    jobDescription: z
      .string()
      .max(30000, 'Job description cannot exceed 30,000 characters')
      .optional(),
    customApiKey: z.string().optional(),
  }),
});
