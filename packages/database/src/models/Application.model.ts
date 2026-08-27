import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { ApplicationStatus } from '@draa/shared';

export interface IApplication extends Document {
  studentUserId: Types.ObjectId;
  courseId: Types.ObjectId;
  statement: string;
  status: ApplicationStatus;
  decisionNote?: string;
  offerLetterUrl?: string;
  submittedAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    studentUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    statement: { type: String, required: true, minlength: 50, maxlength: 4000 },
    status: {
      type: String,
      required: true,
      default: 'SUBMITTED',
      enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'OFFERED', 'DECLINED', 'WITHDRAWN'],
    },
    decisionNote: { type: String, maxlength: 1000 },
    offerLetterUrl: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'applications',
  }
);

// One application per student per course
ApplicationSchema.index({ studentUserId: 1, courseId: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
