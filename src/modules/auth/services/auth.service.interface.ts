import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  AuthTokensResponse,
} from '../dtos/auth.dto.js';

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthTokensResponse>;
  login(dto: LoginDto): Promise<AuthTokensResponse>;
  logout(userId?: string, refreshToken?: string): Promise<void>;
  refreshToken(rawRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }>;
  resetPassword(dto: ResetPasswordDto): Promise<{ message: string }>;
  changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }>;
  verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }>;
  resendVerificationEmail(dto: ResendVerificationDto): Promise<{ message: string }>;
}
