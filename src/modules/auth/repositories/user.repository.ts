import { BaseRepository } from '../../../shared/repositories/base.repository.js';
import { User, IUserDocument, IRefreshTokenRecord } from '../models/user.model.js';
import { IUserRepository } from './user.repository.interface.js';

export class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository {
  constructor() {
    super(User);
  }

  public async findByEmail(
    email: string,
    includePassword: boolean = false
  ): Promise<IUserDocument | null> {
    const query = this.model.findOne({ email: email.toLowerCase().trim() });
    if (includePassword) {
      query.select('+password +refreshTokens');
    }
    return query.exec();
  }

  public async findByEmailVerificationToken(
    tokenHash: string
  ): Promise<IUserDocument | null> {
    return this.model
      .findOne({
        emailVerificationToken: tokenHash,
        emailVerificationExpires: { $gt: new Date() },
      })
      .select('+emailVerificationToken +emailVerificationExpires')
      .exec();
  }

  public async findByPasswordResetToken(
    tokenHash: string
  ): Promise<IUserDocument | null> {
    return this.model
      .findOne({
        passwordResetToken: tokenHash,
        passwordResetExpires: { $gt: new Date() },
      })
      .select('+password +passwordResetToken +passwordResetExpires')
      .exec();
  }

  public async findByRefreshToken(
    tokenHash: string
  ): Promise<IUserDocument | null> {
    return this.model
      .findOne({
        'refreshTokens.tokenHash': tokenHash,
      })
      .select('+refreshTokens')
      .exec();
  }

  public async addRefreshToken(
    userId: string,
    tokenData: IRefreshTokenRecord
  ): Promise<void> {
    await this.model
      .findByIdAndUpdate(userId, {
        $push: {
          refreshTokens: {
            $each: [tokenData],
            $slice: -10, // Maintain max 10 active refresh tokens per user across devices
          },
        },
      })
      .exec();
  }

  public async removeRefreshToken(
    userId: string,
    tokenHash: string
  ): Promise<void> {
    await this.model
      .findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { tokenHash } },
      })
      .exec();
  }

  public async clearAllRefreshTokens(userId: string): Promise<void> {
    await this.model
      .findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] },
      })
      .exec();
  }

  public async clearRefreshTokenFamily(
    userId: string,
    familyId: string
  ): Promise<void> {
    await this.model
      .findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { familyId } },
      })
      .exec();
  }
}
