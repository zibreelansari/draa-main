import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IApplicationMessage extends Document {
  applicationId: Types.ObjectId;
  senderUserId: Types.ObjectId;
  senderRole: 'STUDENT' | 'INSTITUTE' | 'ADMIN';
  senderName: string;
  message: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: Date;
}

const ApplicationMessageSchema = new Schema<IApplicationMessage>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    senderUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      required: true,
      enum: ['STUDENT', 'INSTITUTE', 'ADMIN'],
    },
    senderName: { type: String, required: true },
    message: { type: String, required: true, maxlength: 2500 },
    attachments: [{ type: String }],
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: 'application_messages',
  }
);

ApplicationMessageSchema.index({ applicationId: 1, createdAt: 1 });

export const ApplicationMessage = mongoose.model<IApplicationMessage>('ApplicationMessage', ApplicationMessageSchema);
