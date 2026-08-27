import { ResumeFileType } from '../models/resume.model.js';

export interface IResumeResponse {
  id: string;
  userId: string;
  fileName: string;
  fileType: ResumeFileType;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  cloudinaryPublicId: string;
  extractedText: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResumeMetadataResponse {
  id: string;
  userId: string;
  fileName: string;
  fileType: ResumeFileType;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDownloadResponse {
  downloadUrl: string;
  fileName: string;
  mimeType: string;
}
