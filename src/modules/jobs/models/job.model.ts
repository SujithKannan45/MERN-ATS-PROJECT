import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type JobStatus =
  | 'Saved'
  | 'Applied'
  | 'Interview Scheduled'
  | 'Interview Completed'
  | 'Offer Received'
  | 'Rejected'
  | 'Accepted'
  | 'Archived';

export type WorkplaceType = 'Remote' | 'Hybrid' | 'On-site';

export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Internship'
  | 'Freelance'
  | 'Temporary'
  | 'Other';

export type JobPriority = 'Low' | 'Medium' | 'High';

export interface ISalaryRange {
  min?: number;
  max?: number;
  currency?: string;
  period?: 'hourly' | 'monthly' | 'yearly';
}

export interface IAtsCompatibility {
  score: number;
  feedback: string;
}

export interface IAiJobMatchData {
  overallMatchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  matchingExperience: string[];
  missingExperience: string[];
  matchingEducation: string[];
  keywordMatchScore: number;
  atsCompatibility: IAtsCompatibility;
  matchExplanation: string;
  analyzedAt: Date;
}

export interface IJob {
  userId: Types.ObjectId;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  jobUrl?: string;
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  location?: string;
  salary?: ISalaryRange;
  requiredSkills: string[];
  status: JobStatus;
  priority: JobPriority;
  notes?: string;
  appliedDate?: Date;
  interviewDate?: Date;
  offerDate?: Date;
  rejectionDate?: Date;
  aiMatchResult?: IAiJobMatchData;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJobDocument extends IJob, Document {}

export interface IJobModel extends Model<IJobDocument> {}

const salarySchema = new Schema<ISalaryRange>(
  {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true, trim: true },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly',
    },
  },
  { _id: false }
);

const atsCompatibilitySchema = new Schema<IAtsCompatibility>(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

const aiJobMatchSchema = new Schema<IAiJobMatchData>(
  {
    overallMatchPercentage: { type: Number, required: true, min: 0, max: 100 },
    matchingSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    matchingExperience: { type: [String], default: [] },
    missingExperience: { type: [String], default: [] },
    matchingEducation: { type: [String], default: [] },
    keywordMatchScore: { type: Number, required: true, min: 0, max: 100 },
    atsCompatibility: { type: atsCompatibilitySchema, required: true },
    matchExplanation: { type: String, default: '' },
    analyzedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const jobSchema = new Schema<IJobDocument, IJobModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Job title cannot exceed 200 characters'],
    },
    jobDescription: {
      type: String,
      default: '',
      trim: true,
    },
    jobUrl: {
      type: String,
      default: '',
      trim: true,
    },
    employmentType: {
      type: String,
      enum: {
        values: [
          'Full-time',
          'Part-time',
          'Contract',
          'Internship',
          'Freelance',
          'Temporary',
          'Other',
        ],
        message: '{VALUE} is not a valid employment type',
      },
      default: 'Full-time',
    },
    workplaceType: {
      type: String,
      enum: {
        values: ['Remote', 'Hybrid', 'On-site'],
        message: '{VALUE} is not a valid workplace type',
      },
      default: 'Remote',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    salary: {
      type: salarySchema,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: [
          'Saved',
          'Applied',
          'Interview Scheduled',
          'Interview Completed',
          'Offer Received',
          'Rejected',
          'Accepted',
          'Archived',
        ],
        message: '{VALUE} is not a valid application status',
      },
      default: 'Saved',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority level',
      },
      default: 'Medium',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    appliedDate: {
      type: Date,
    },
    interviewDate: {
      type: Date,
    },
    offerDate: {
      type: Date,
    },
    rejectionDate: {
      type: Date,
    },
    aiMatchResult: {
      type: aiJobMatchSchema,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, priority: 1 });
jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ userId: 1, companyName: 1, jobTitle: 1 });

export const Job = mongoose.model<IJobDocument, IJobModel>('Job', jobSchema);
