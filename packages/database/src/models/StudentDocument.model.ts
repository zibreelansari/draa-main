import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { DocumentStatus } from '@draa/shared';

export interface IStudentDocument extends Document {
  studentUserId: Types.ObjectId;
  documentType: string;
  fileName?: string;
  status: DocumentStatus;
  updatedAt: Date;
}

const StudentDocumentSchema = new Schema<IStudentDocument>(
  {
    studentUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documentType: { type: String, required: true, trim: true },
    fileName: { type: String, trim: true },
    status: {
      type: String,
      required: true,
      default: 'MISSING',
      enum: ['MISSING', 'UPLOADED', 'VERIFIED', 'ACTION_REQUIRED'],
    },
  },
  {
    timestamps: true,
    collection: 'student_documents',
  }
);

StudentDocumentSchema.index({ studentUserId: 1, documentType: 1 }, { unique: true });

export const StudentDocument = mongoose.model<IStudentDocument>('StudentDocument', StudentDocumentSchema);
