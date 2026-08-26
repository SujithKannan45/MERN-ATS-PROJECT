import { UserRole, AccountStatus, AuthProvider } from '../models/user.model.js';

export interface IUserResponse {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  accountStatus: AccountStatus;
  provider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface AuthTokensResponse {
  user: IUserResponse;
  accessToken: string;
  refreshToken: string;
}
