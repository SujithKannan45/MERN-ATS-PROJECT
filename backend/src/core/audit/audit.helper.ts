import { Request } from 'express';
import { auditLogService } from '../../modules/audit/routes/audit-log.routes.js';
import { AuditAction } from '../../modules/audit/models/audit-log.model.js';

export interface IAuditContext {
  req?: Request;
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  status?: 'SUCCESS' | 'FAILURE';
  details?: Record<string, unknown>;
  durationMs?: number;
}

export class AuditHelper {
  public static log(ctx: IAuditContext): void {
    const ipAddress =
      ctx.req?.ip ||
      (ctx.req?.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      'unknown';
    const userAgent = ctx.req?.headers['user-agent'] || 'unknown';
    const resolvedUserId =
      ctx.userId ||
      (ctx.req as Request & { user?: { userId?: string } })?.user?.userId;

    // Fire-and-forget
    void auditLogService.recordLog({
      userId: resolvedUserId,
      action: ctx.action,
      resource: ctx.resource,
      resourceId: ctx.resourceId,
      status: ctx.status || 'SUCCESS',
      details: ctx.details,
      ipAddress,
      userAgent,
      durationMs: ctx.durationMs,
    });
  }
}
