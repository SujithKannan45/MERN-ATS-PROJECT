import crypto from 'crypto';
import { IUserRepository } from '../repositories/user.repository.interface.js';
import { IAuthService } from './auth.service.interface.js';
import { TokenUtil } from '../utils/token.util.js';
import { EmailUtil } from '../utils/email.util.js';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  AuthTokensResponse,
  IUserResponse,
} from '../dtos/auth.dto.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../../core/errors/app-error.js';
import { IUserDocument } from '../models/user.model.js';

export class AuthService implements IAuthService {
  private readonly userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  private mapUserResponse(user: IUserDocument): IUserResponse {
    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      accountStatus: user.accountStatus,
      provider: user.provider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  public async register(dto: RegisterDto): Promise<AuthTokensResponse> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists');
    }

    const { rawToken: verificationRawToken, hashedToken: verificationHashedToken } =
      TokenUtil.generateRandomToken();

    const user = await this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      role: dto.role || 'candidate',
      isEmailVerified: false,
      accountStatus: 'active',
      provider: 'local',
      emailVerificationToken: verificationHashedToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email asynchronously
    void EmailUtil.sendVerificationEmail(user.email, verificationRawToken);

    // Issue tokens with initial familyId
    const familyId = crypto.randomUUID();
    const accessToken = TokenUtil.generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = TokenUtil.generateRefreshToken({
      userId: user._id.toString(),
      familyId,
    });

    const refreshTokenHash = TokenUtil.hashToken(refreshToken);
    await this.userRepository.addRefreshToken(user._id.toString(), {
      tokenHash: refreshTokenHash,
      familyId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: this.mapUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  public async login(dto: LoginDto): Promise<AuthTokensResponse> {
    const user = await this.userRepository.findByEmail(dto.email, true);
    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.accountStatus === 'suspended') {
      throw new UnauthorizedError('Your account has been suspended. Please contact support.');
    }

    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const familyId = crypto.randomUUID();
    const accessToken = TokenUtil.generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = TokenUtil.generateRefreshToken({
      userId: user._id.toString(),
      familyId,
    });

    const refreshTokenHash = TokenUtil.hashToken(refreshToken);
    await this.userRepository.addRefreshToken(user._id.toString(), {
      tokenHash: refreshTokenHash,
      familyId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: this.mapUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  public async logout(userId?: string, refreshToken?: string): Promise<void> {
    if (userId && refreshToken) {
      const tokenHash = TokenUtil.hashToken(refreshToken);
      await this.userRepository.removeRefreshToken(userId, tokenHash);
    } else if (userId) {
      await this.userRepository.clearAllRefreshTokens(userId);
    }
  }

  public async refreshToken(
    rawRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    // 1. Verify JWT signature & expiration
    const payload = TokenUtil.verifyRefreshToken(rawRefreshToken);
    const incomingTokenHash = TokenUtil.hashToken(rawRefreshToken);

    // 2. Lookup user by ID with refresh tokens
    const user = await this.userRepository.findById(
      payload.userId,
      '+refreshTokens +role +email'
    );

    if (!user) {
      throw new UnauthorizedError('User session not found');
    }

    if (user.accountStatus === 'suspended') {
      throw new UnauthorizedError('Your account has been suspended.');
    }

    // 3. Check for Token Reuse Detection
    const tokenRecord = user.refreshTokens.find((r) => r.tokenHash === incomingTokenHash);

    if (!tokenRecord) {
      // Possible compromise: Invalidate entire token family to protect user
      await this.userRepository.clearRefreshTokenFamily(user._id.toString(), payload.familyId);
      throw new UnauthorizedError('Compromised session detected. Please log in again.');
    }

    // 4. Invalidate used refresh token
    await this.userRepository.removeRefreshToken(user._id.toString(), incomingTokenHash);

    // 5. Generate new Access & Refresh Token maintaining familyId
    const newAccessToken = TokenUtil.generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = TokenUtil.generateRefreshToken({
      userId: user._id.toString(),
      familyId: payload.familyId,
    });

    const newRefreshTokenHash = TokenUtil.hashToken(newRefreshToken);
    await this.userRepository.addRefreshToken(user._id.toString(), {
      tokenHash: newRefreshTokenHash,
      familyId: payload.familyId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (user) {
      const { rawToken, hashedToken } = TokenUtil.generateRandomToken();
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await user.save({ validateBeforeSave: false });

      void EmailUtil.sendPasswordResetEmail(user.email, rawToken);
    }

    // Always return the same generic message to prevent email enumeration
    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  public async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const hashedToken = TokenUtil.hashToken(dto.token);
    const user = await this.userRepository.findByPasswordResetToken(hashedToken);

    if (!user) {
      throw new BadRequestError('Password reset token is invalid or has expired');
    }

    user.password = dto.newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Revoke all sessions on password reset
    await user.save();

    return {
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  public async changePassword(
    userId: string,
    dto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId, '+password +refreshTokens');

    if (!user || !user.password) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await user.comparePassword(dto.currentPassword);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    user.password = dto.newPassword;
    user.refreshTokens = []; // Clear other sessions
    await user.save();

    return {
      message: 'Password changed successfully. Please log in again.',
    };
  }

  public async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const hashedToken = TokenUtil.hashToken(dto.token);
    const user = await this.userRepository.findByEmailVerificationToken(hashedToken);

    if (!user) {
      throw new BadRequestError('Verification token is invalid or has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return {
      message: 'Email address has been successfully verified.',
    };
  }

  public async resendVerificationEmail(
    dto: ResendVerificationDto
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new NotFoundError('User not found with this email address');
    }

    if (user.isEmailVerified) {
      throw new BadRequestError('Email address is already verified');
    }

    const { rawToken, hashedToken } = TokenUtil.generateRandomToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    void EmailUtil.sendVerificationEmail(user.email, rawToken);

    return {
      message: 'A fresh verification email has been sent.',
    };
  }
}
