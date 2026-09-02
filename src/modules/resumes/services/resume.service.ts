import crypto from 'crypto';
import path from 'path';
import { Types } from 'mongoose';
import { IResumeRepository } from '../repositories/resume.repository.interface.js';
import { IResumeService } from './resume.service.interface.js';
import { CloudinaryUtil } from '../utils/cloudinary.util.js';
import { ParserUtil } from '../utils/parser.util.js';
import { IResumeDocument, ResumeFileType } from '../models/resume.model.js';
import {
  IResumeResponse,
  IResumeMetadataResponse,
  IDownloadResponse,
} from '../dtos/resume.dto.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../../core/errors/app-error.js';
import { logger } from '../../../core/logger/logger.js';
import { Notification } from '../../notifications/models/notification.model.js';

export class ResumeService implements IResumeService {
  private readonly resumeRepository: IResumeRepository;

  constructor(resumeRepository: IResumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  private getFileType(fileName: string, mimeType: string): ResumeFileType {
    const ext = path.extname(fileName).toLowerCase();
    if (ext === '.pdf' || mimeType === 'application/pdf') return 'pdf';
    if (
      ext === '.docx' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
      return 'docx';
    if (ext === '.doc' || mimeType === 'application/msword') return 'doc';
    throw new BadRequestError(`Unsupported file format '${ext}'`);
  }

  private mapResumeResponse(resume: IResumeDocument): IResumeResponse {
    return {
      id: resume._id.toString(),
      userId: resume.userId.toString(),
      fileName: resume.fileName,
      fileType: resume.fileType,
      mimeType: resume.mimeType,
      fileSize: resume.fileSize,
      fileUrl: resume.fileUrl,
      cloudinaryPublicId: resume.cloudinaryPublicId,
      extractedText: resume.extractedText,
      version: resume.version,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    };
  }

  public async uploadResume(
    userId: string,
    file: Express.Multer.File
  ): Promise<IResumeResponse> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestError('A valid, non-empty resume document file is required.');
    }

    const fileType = this.getFileType(file.originalname, file.mimetype);
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Check if an active resume already exists for this candidate
    const existingResume = await this.resumeRepository.findByUserId(userId);
    if (existingResume) {
      throw new ConflictError(
        'A resume is already linked to this candidate profile. Use the PUT /api/v1/resumes/update endpoint to replace it with a new version.'
      );
    }

    // 1. Extract and clean resume text
    const extractedText = await ParserUtil.extractText(
      file.buffer,
      fileType,
      file.mimetype
    );

    // 2. Upload document buffer to Cloudinary
    const uploadResult = await CloudinaryUtil.uploadResumeBuffer(
      file.buffer,
      file.originalname,
      userId
    );

    // 3. Persist to MongoDB
    try {
      const resume = await this.resumeRepository.create({
        userId: new Types.ObjectId(userId),
        fileName: file.originalname,
        fileType,
        mimeType: file.mimetype,
        fileSize: file.size,
        fileUrl: uploadResult.secureUrl,
        cloudinaryPublicId: uploadResult.publicId,
        extractedText,
        version: 1,
        fileHash,
      });

      logger.info(`Resume uploaded successfully for user: ${userId}`, {
        resumeId: resume._id,
        version: 1,
        fileType,
      });

      // Asynchronously trigger notification
      void Notification.create({
        userId: new Types.ObjectId(userId),
        title: 'Resume Uploaded Successfully',
        message: `Your resume "${file.originalname}" has been uploaded, parsed, and is ready for ATS analysis.`,
        type: 'RESUME_UPLOADED',
        data: { resumeId: resume._id.toString() },
      });

      return this.mapResumeResponse(resume);
    } catch (error) {
      // Rollback Cloudinary asset if DB write fails
      void CloudinaryUtil.deleteResumeFile(uploadResult.publicId);
      throw error;
    }
  }

  public async updateResume(
    userId: string,
    file: Express.Multer.File
  ): Promise<IResumeResponse> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestError('A valid, non-empty resume document file is required.');
    }

    const existingResume = await this.resumeRepository.findByUserId(userId);
    if (!existingResume) {
      throw new NotFoundError(
        'No active resume found for this candidate. Please upload an initial resume first using POST /api/v1/resumes/upload.'
      );
    }

    const fileType = this.getFileType(file.originalname, file.mimetype);
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Duplicate detection check
    if (existingResume.fileHash === fileHash) {
      throw new ConflictError(
        'The uploaded document is identical to your current active resume. No update is needed.'
      );
    }

    // 1. Extract and clean text from the new document
    const extractedText = await ParserUtil.extractText(
      file.buffer,
      fileType,
      file.mimetype
    );

    // 2. Upload replacement document to Cloudinary
    const uploadResult = await CloudinaryUtil.uploadResumeBuffer(
      file.buffer,
      file.originalname,
      userId
    );

    const oldPublicId = existingResume.cloudinaryPublicId;
    const newVersion = existingResume.version + 1;

    // 3. Update MongoDB document
    try {
      existingResume.fileName = file.originalname;
      existingResume.fileType = fileType;
      existingResume.mimeType = file.mimetype;
      existingResume.fileSize = file.size;
      existingResume.fileUrl = uploadResult.secureUrl;
      existingResume.cloudinaryPublicId = uploadResult.publicId;
      existingResume.extractedText = extractedText;
      existingResume.version = newVersion;
      existingResume.fileHash = fileHash;

      await existingResume.save();

      // 4. Asynchronously purge previous asset from Cloudinary
      if (oldPublicId && oldPublicId !== uploadResult.publicId) {
        void CloudinaryUtil.deleteResumeFile(oldPublicId);
      }

      logger.info(`Resume replaced/updated for user: ${userId}`, {
        resumeId: existingResume._id,
        version: newVersion,
      });

      // Asynchronously trigger notification
      void Notification.create({
        userId: new Types.ObjectId(userId),
        title: 'Resume Updated',
        message: `Your resume "${existingResume.fileName}" has been updated to version ${newVersion}.`,
        type: 'RESUME_UPLOADED',
        data: { resumeId: existingResume._id.toString(), version: newVersion },
      });

      return this.mapResumeResponse(existingResume);
    } catch (error) {
      // Rollback newly uploaded Cloudinary asset if DB update fails
      void CloudinaryUtil.deleteResumeFile(uploadResult.publicId);
      throw error;
    }
  }

  public async deleteResume(userId: string): Promise<{ message: string }> {
    const resume = await this.resumeRepository.findByUserId(userId);
    if (!resume) {
      throw new NotFoundError('No active resume found for this candidate.');
    }

    const publicId = resume.cloudinaryPublicId;

    // Delete from MongoDB
    await this.resumeRepository.deleteByUserId(userId);

    // Delete from Cloudinary
    if (publicId) {
      void CloudinaryUtil.deleteResumeFile(publicId);
    }

    logger.info(`Resume deleted for user: ${userId}`, { resumeId: resume._id });

    return { message: 'Resume document deleted successfully from your profile.' };
  }

  public async getCurrentResume(userId: string): Promise<IResumeResponse> {
    const resume = await this.resumeRepository.findByUserId(userId);
    if (!resume) {
      throw new NotFoundError('No active resume found for this candidate.');
    }

    return this.mapResumeResponse(resume);
  }

  public async getResumeMetadata(userId: string): Promise<IResumeMetadataResponse> {
    const resume = await this.resumeRepository.findByUserId(userId);
    if (!resume) {
      throw new NotFoundError('No active resume found for this candidate.');
    }

    return {
      id: resume._id.toString(),
      userId: resume.userId.toString(),
      fileName: resume.fileName,
      fileType: resume.fileType,
      mimeType: resume.mimeType,
      fileSize: resume.fileSize,
      fileUrl: resume.fileUrl,
      version: resume.version,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    };
  }

  public async getDownloadInfo(userId: string): Promise<IDownloadResponse> {
    const resume = await this.resumeRepository.findByUserId(userId);
    if (!resume) {
      throw new NotFoundError('No active resume found for this candidate to download.');
    }

    const downloadUrl = CloudinaryUtil.getDownloadUrl(
      resume.cloudinaryPublicId,
      resume.fileUrl
    );

    return {
      downloadUrl,
      fileName: resume.fileName,
      mimeType: resume.mimeType,
    };
  }
}
