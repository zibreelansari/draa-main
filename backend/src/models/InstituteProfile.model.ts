import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { ApprovalStatus } from '@draa/shared';

export interface IInstituteProfile extends Document {
  userId: Types.ObjectId;
  instituteName: string;
  contactName: string;
  city: string;
  website?: string;
  approvalStatus: ApprovalStatus;
}

const InstituteProfileSchema = new Schema<IInstituteProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    instituteName: { type: String, required: true, trim: true, maxlength: 180 },
    contactName: { type: String, required: true, trim: true, maxlength: 120 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    website: { type: String, trim: true },
    approvalStatus: {
      type: String,
      required: true,
      default: 'PENDING',
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
    },
  },
  {
    timestamps: true,
    collection: 'institute_profiles',
  }
);

export const InstituteProfile = mongoose.model<IInstituteProfile>('InstituteProfile', InstituteProfileSchema);
