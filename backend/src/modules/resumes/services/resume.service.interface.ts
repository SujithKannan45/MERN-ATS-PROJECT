import {
  IResumeResponse,
  IResumeMetadataResponse,
  IDownloadResponse,
} from '../dtos/resume.dto.js';

export interface IResumeService {
  uploadResume(userId: string, file: Express.Multer.File): Promise<IResumeResponse>;
  updateResume(userId: string, file: Express.Multer.File): Promise<IResumeResponse>;
  deleteResume(userId: string): Promise<{ message: string }>;
  getCurrentResume(userId: string): Promise<IResumeResponse>;
  getResumeMetadata(userId: string): Promise<IResumeMetadataResponse>;
  getDownloadInfo(userId: string): Promise<IDownloadResponse>;
}
