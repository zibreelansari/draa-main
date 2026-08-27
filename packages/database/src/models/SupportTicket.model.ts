import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { TicketStatus, TicketPriority } from '@draa/shared';

export interface ISupportTicket extends Document {
  userId: Types.ObjectId;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: { type: String, required: true, trim: true, maxlength: 180 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    status: {
      type: String,
      required: true,
      default: 'OPEN',
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
    },
    priority: {
      type: String,
      required: true,
      default: 'NORMAL',
      enum: ['LOW', 'NORMAL', 'HIGH'],
    },
  },
  {
    timestamps: true,
    collection: 'support_tickets',
  }
);

SupportTicketSchema.index({ status: 1, priority: 1 });

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
