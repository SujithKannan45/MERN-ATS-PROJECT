import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type NotificationType =
  | 'RESUME_UPLOADED'
  | 'RESUME_ANALYZED'
  | 'ATS_SCORE_UPDATED'
  | 'JOB_ADDED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'INTERVIEW_SCHEDULED'
  | 'OFFER_RECEIVED'
  | 'RESUME_IMPROVEMENT_AVAILABLE'
  | 'SYSTEM';

export interface INotification {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationDocument extends INotification, Document {}

export interface INotificationModel extends Model<INotificationDocument> {}

const notificationSchema = new Schema<INotificationDocument, INotificationModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: {
        values: [
          'RESUME_UPLOADED',
          'RESUME_ANALYZED',
          'ATS_SCORE_UPDATED',
          'JOB_ADDED',
          'APPLICATION_STATUS_CHANGED',
          'INTERVIEW_SCHEDULED',
          'OFFER_RECEIVED',
          'RESUME_IMPROVEMENT_AVAILABLE',
          'SYSTEM',
        ],
        message: '{VALUE} is not a valid notification type',
      },
      required: [true, 'Notification type is required'],
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotificationDocument, INotificationModel>(
  'Notification',
  notificationSchema
);
