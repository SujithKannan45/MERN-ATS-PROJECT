import { IBaseRepository } from '../../../shared/repositories/base.repository.interface.js';
import { IResumeDocument } from '../models/resume.model.js';

export interface IResumeRepository extends IBaseRepository<IResumeDocument> {
  findByUserId(userId: string): Promise<IResumeDocument | null>;
  findByUserIdAndHash(userId: string, fileHash: string): Promise<IResumeDocument | null>;
  deleteByUserId(userId: string): Promise<IResumeDocument | null>;
}
