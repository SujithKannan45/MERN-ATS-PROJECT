import { z } from 'zod';

const jobStatusEnum = z.enum([
  'Saved',
  'Applied',
  'Interview Scheduled',
  'Interview Completed',
  'Offer Received',
  'Rejected',
  'Accepted',
  'Archived',
]);

const workplaceTypeEnum = z.enum(['Remote', 'Hybrid', 'On-site']);

const employmentTypeEnum = z.enum([
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
  'Temporary',
  'Other',
]);

const priorityEnum = z.enum(['Low', 'Medium', 'High']);

const salarySchema = z
  .object({
    min: z.number().nonnegative().optional(),
    max: z.number().nonnegative().optional(),
    currency: z.string().max(10).optional().default('USD'),
    period: z.enum(['hourly', 'monthly', 'yearly']).optional().default('yearly'),
  })
  .optional();

export const createJobSchema = z.object({
  body: z.object({
    companyName: z
      .string({ required_error: 'Company name is required' })
      .trim()
      .min(1, 'Company name cannot be empty')
      .max(200, 'Company name cannot exceed 200 characters'),
    jobTitle: z
      .string({ required_error: 'Job title is required' })
      .trim()
      .min(1, 'Job title cannot be empty')
      .max(200, 'Job title cannot exceed 200 characters'),
    jobDescription: z.string().optional().default(''),
    jobUrl: z.string().url('Invalid URL format').or(z.literal('')).optional(),
    employmentType: employmentTypeEnum.optional().default('Full-time'),
    workplaceType: workplaceTypeEnum.optional().default('Remote'),
    location: z.string().max(200).optional().default(''),
    salary: salarySchema,
    requiredSkills: z.array(z.string().trim()).optional().default([]),
    status: jobStatusEnum.optional().default('Saved'),
    priority: priorityEnum.optional().default('Medium'),
    notes: z.string().max(5000).optional().default(''),
    appliedDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
    interviewDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
    offerDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
    rejectionDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(1).max(200).optional(),
    jobTitle: z.string().trim().min(1).max(200).optional(),
    jobDescription: z.string().optional(),
    jobUrl: z.string().url('Invalid URL format').or(z.literal('')).optional(),
    employmentType: employmentTypeEnum.optional(),
    workplaceType: workplaceTypeEnum.optional(),
    location: z.string().max(200).optional(),
    salary: salarySchema,
    requiredSkills: z.array(z.string().trim()).optional(),
    status: jobStatusEnum.optional(),
    priority: priorityEnum.optional(),
    notes: z.string().max(5000).optional(),
    appliedDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
    interviewDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
    offerDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
    rejectionDate: z.string().datetime({ offset: true }).or(z.string().date()).nullable().optional(),
  }),
});

export const queryJobSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional(),
    status: jobStatusEnum.optional(),
    priority: priorityEnum.optional(),
    workplaceType: workplaceTypeEnum.optional(),
    employmentType: employmentTypeEnum.optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const matchJobSchema = z.object({
  body: z
    .object({
      customApiKey: z.string().optional(),
    })
    .optional(),
});
