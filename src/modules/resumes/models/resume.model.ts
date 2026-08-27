import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ResumeFileType = 'pdf' | 'doc' | 'docx';

export interface IResume {
  userId: Types.ObjectId;
  fileName: string;
  fileType: ResumeFileType;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  cloudinaryPublicId: string;
  extractedText: string;
  version: number;
  fileHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResumeDocument extends IResume, Document {}

export interface IResumeModel extends Model<IResumeDocument> {}

const resumeSchema = new Schema<IResumeDocument, IResumeModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    fileType: {
      type: String,
      enum: {
        values: ['pdf', 'doc', 'docx'],
        message: '{VALUE} is not a supported file type',
      },
      required: [true, 'File type is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size in bytes is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'Cloudinary secure URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
    },
    extractedText: {
      type: String,
      default: '',
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Resume version must be at least 1'],
    },
    fileHash: {
      type: String,
      required: [true, 'File content hash is required'],
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

// Compound and auxiliary indexes for optimal lookup performance
resumeSchema.index({ userId: 1, version: -1 });
resumeSchema.index({ userId: 1, fileHash: 1 });
resumeSchema.index({ createdAt: -1 });

export const Resume = mongoose.model<IResumeDocument, IResumeModel>('Resume', resumeSchema);
