import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type AuditAction =
  | 'AUTH_LOGIN'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_REGISTER'
  | 'AUTH_PASSWORD_CHANGE'
  | 'AUTH_PASSWORD_RESET'
  | 'RESUME_UPLOAD'
  | 'RESUME_UPDATE'
  | 'RESUME_DELETE'
  | 'AI_RESUME_ANALYSIS'
  | 'AI_JOB_MATCH'
  | 'JOB_CREATE'
  | 'JOB_UPDATE'
  | 'JOB_DELETE'
  | 'JOB_STATUS_CHANGE';

export interface IAuditLog {
  userId?: Types.ObjectId;
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

export interface IAuditLogDocument extends IAuditLog, Document {}

export interface IAuditLogModel extends Model<IAuditLogDocument> {}

const auditLogSchema = new Schema<IAuditLogDocument, IAuditLogModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      index: true,
    },
    resource: {
      type: String,
      required: [true, 'Resource type is required'],
      trim: true,
      index: true,
    },
    resourceId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS',
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: 'unknown',
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
    durationMs: {
      type: Number,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for high-throughput querying & filtering
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLogDocument, IAuditLogModel>(
  'AuditLog',
  auditLogSchema
);
