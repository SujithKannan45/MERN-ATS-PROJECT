import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { envConfig } from '../../../config/env.config.js';
import { UserRole } from '../models/user.model.js';
import { UnauthorizedError } from '../../../core/errors/app-error.js';

export interface JwtAccessTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshTokenPayload {
  userId: string;
  familyId: string;
  iat?: number;
  exp?: number;
}

export class TokenUtil {
  public static generateAccessToken(payload: JwtAccessTokenPayload): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      envConfig.JWT_ACCESS_SECRET,
      { expiresIn: envConfig.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );
  }

  public static generateRefreshToken(
    payload: { userId: string; familyId: string }
  ): string {
    return jwt.sign(
      {
        userId: payload.userId,
        familyId: payload.familyId,
      },
      envConfig.JWT_REFRESH_SECRET,
      { expiresIn: envConfig.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );
  }

  public static verifyAccessToken(token: string): JwtAccessTokenPayload {
    try {
      return jwt.verify(token, envConfig.JWT_ACCESS_SECRET) as JwtAccessTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Access token has expired. Please refresh your session.');
      }
      throw new UnauthorizedError('Invalid access token');
    }
  }

  public static verifyRefreshToken(token: string): JwtRefreshTokenPayload {
    try {
      return jwt.verify(token, envConfig.JWT_REFRESH_SECRET) as JwtRefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token has expired. Please log in again.');
      }
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  /**
   * Hashes a raw token string (refresh token, reset token, verification token) using SHA-256
   */
  public static hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Generates a secure random crypto token pair: raw unhashed (to send to user via email/URL) and hashed (to store in DB)
   */
  public static generateRandomToken(): { rawToken: string; hashedToken: string } {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(rawToken);
    return { rawToken, hashedToken };
  }

  /**
   * Configures and sets HTTP-only, secure authentication cookies
   */
  public static setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ): void {
    const isProduction = envConfig.NODE_ENV === 'production';

    // Access Token Cookie (15 mins)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    // Refresh Token Cookie (7 days)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/v1/auth', // Scoped strictly to auth path for maximum security
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  /**
   * Clears authentication cookies upon logout or session invalidation
   */
  public static clearAuthCookies(res: Response): void {
    const isProduction = envConfig.NODE_ENV === 'production';

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/v1/auth',
    });
  }
}
