export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  accountStatus: 'active' | 'pending' | 'suspended';
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'fail' | 'error';
  statusCode: number;
  message?: string;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: boolean;
  status: string;
  statusCode: number;
  message: string;
  details?: Array<{ field?: string; message: string }> | unknown;
  timestamp: string;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  roles?: UserRole[];
  disabled?: boolean;
}
