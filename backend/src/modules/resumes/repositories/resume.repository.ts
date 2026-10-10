import { BaseRepository } from '../../../shared/repositories/base.repository.js';
import { Resume, IResumeDocument } from '../models/resume.model.js';
import { IResumeRepository } from './resume.repository.interface.js';

export class ResumeRepository extends BaseRepository<IResumeDocument> implements IResumeRepository {
  constructor() {
    super(Resume);
  }

  public async findByUserId(userId: string): Promise<IResumeDocument | null> {
    return this.model.findOne({ userId }).exec();
  }

  public async findByUserIdAndHash(
    userId: string,
    fileHash: string
  ): Promise<IResumeDocument | null> {
    return this.model.findOne({ userId, fileHash }).exec();
  }

  public async deleteByUserId(userId: string): Promise<IResumeDocument | null> {
    return this.model.findOneAndDelete({ userId }).exec();
  }
}
