import { AuditAction } from '../models/audit-log.model.js';

export interface CreateAuditLogDto {
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  status?: 'SUCCESS' | 'FAILURE';
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  durationMs?: number;
}

export interface IAuditLogResponse {
  id: string;
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  durationMs?: number;
  timestamp: Date;
}

export interface AuditLogQueryDto {
  page?: number;
  limit?: number;
  action?: AuditAction;
  resource?: string;
  status?: 'SUCCESS' | 'FAILURE';
  startDate?: string;
  endDate?: string;
}
