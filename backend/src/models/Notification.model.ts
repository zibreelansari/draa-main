import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { NotificationKind } from '@draa/shared';

export interface INotification extends Document {
  userId?: Types.ObjectId;
  audienceRole?: string;
  title: string;
  body: string;
  kind: NotificationKind;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    audienceRole: {
      type: String,
      enum: ['STUDENT', 'INSTITUTE', 'ADMIN'],
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    kind: {
      type: String,
      required: true,
      default: 'INFO',
      enum: ['INFO', 'ACTION', 'SUCCESS', 'WARNING'],
    },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
