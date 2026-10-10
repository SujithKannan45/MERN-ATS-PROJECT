import { IBaseRepository } from '../../../shared/repositories/base.repository.interface.js';
import { IUserDocument, IRefreshTokenRecord } from '../models/user.model.js';

export interface IUserRepository extends IBaseRepository<IUserDocument> {
  findByEmail(email: string, includePassword?: boolean): Promise<IUserDocument | null>;
  findByEmailVerificationToken(tokenHash: string): Promise<IUserDocument | null>;
  findByPasswordResetToken(tokenHash: string): Promise<IUserDocument | null>;
  findByRefreshToken(tokenHash: string): Promise<IUserDocument | null>;
  addRefreshToken(userId: string, tokenData: IRefreshTokenRecord): Promise<void>;
  removeRefreshToken(userId: string, tokenHash: string): Promise<void>;
  clearAllRefreshTokens(userId: string): Promise<void>;
  clearRefreshTokenFamily(userId: string, familyId: string): Promise<void>;
}
