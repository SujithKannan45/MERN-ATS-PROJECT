import { apiClient } from './api.client';
import type { ApiResponse, AuthResponse, User } from '@/types';
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ResendVerificationInput,
} from '@/schemas/auth.schema';

export const authService = {
  async register(data: RegisterInput): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token');
    return response.data.data;
  },

  async forgotPassword(data: ForgotPasswordInput): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', data);
    return { message: response.data.message || 'Password reset link sent to your email.' };
  },

  async resetPassword(data: Omit<ResetPasswordInput, 'confirmPassword'>): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      token: data.token,
      newPassword: data.newPassword,
    });
    return { message: response.data.message || 'Password reset successfully.' };
  },

  async verifyEmail(data: VerifyEmailInput): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', data);
    return { message: response.data.message || 'Email verified successfully.' };
  },

  async resendVerification(data: ResendVerificationInput): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-verification', data);
    return { message: response.data.message || 'Verification email resent.' };
  },
};
