import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IResumeAnalysisResult } from '../dtos/ai-analysis.dto.js';

export interface IAnalysisHistory {
  userId: Types.ObjectId;
  resumeId?: Types.ObjectId;
  targetJobTitle?: string;
  jobDescription?: string;
  overallAtsScore: number;
  matchPercentage: number;
  analysisResult: IResumeAnalysisResult;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalysisHistoryDocument extends IAnalysisHistory, Document {}

export interface IAnalysisHistoryModel extends Model<IAnalysisHistoryDocument> {}

const analysisHistorySchema = new Schema<IAnalysisHistoryDocument, IAnalysisHistoryModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      index: true,
    },
    targetJobTitle: {
      type: String,
      trim: true,
      default: '',
    },
    jobDescription: {
      type: String,
      trim: true,
      default: '',
    },
    overallAtsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    analysisResult: {
      type: Schema.Types.Mixed,
      required: [true, 'Analysis result payload is required'],
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
analysisHistorySchema.index({ userId: 1, createdAt: -1 });
analysisHistorySchema.index({ userId: 1, overallAtsScore: -1 });

export const AnalysisHistory = mongoose.model<IAnalysisHistoryDocument, IAnalysisHistoryModel>(
  'AnalysisHistory',
  analysisHistorySchema
);
