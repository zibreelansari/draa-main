import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { CourseLevel, CourseMode, CourseType, PublishStatus, CurrencyCode } from '@draa/shared';

export interface ICourse extends Document {
  instituteId: Types.ObjectId;
  title: string;
  slug: string;
  discipline: string;
  level: CourseLevel;
  durationMonths: number;
  tuitionFee?: number;
  tuitionFeeInr?: number;
  currency: CurrencyCode | string;
  mode: CourseMode;
  courseType: CourseType;
  scholarshipAvailable: boolean;
  eligibility: string;
  startDate?: string;
  status: PublishStatus;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    instituteId: {
      type: Schema.Types.ObjectId,
      ref: 'Institute',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    discipline: { type: String, required: true, trim: true },
    level: {
      type: String,
      required: true,
      enum: ['UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORAL', 'CERTIFICATE'],
    },
    durationMonths: { type: Number, required: true, min: 1, max: 96 },
    tuitionFee: { type: Number },
    tuitionFeeInr: { type: Number },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      trim: true,
      uppercase: true,
      enum: ['USD', 'INR', 'EUR', 'GBP', 'AED', 'CAD', 'AUD', 'SGD'],
    },
    mode: {
      type: String,
      required: true,
      default: 'OFFLINE',
      enum: ['OFFLINE', 'BLENDED', 'ONLINE'],
    },
    courseType: {
      type: String,
      required: true,
      default: 'REGULAR',
      enum: ['REGULAR', 'SHORT_TERM', 'SKILL_BASED'],
    },
    scholarshipAvailable: { type: Boolean, default: false },
    eligibility: {
      type: String,
      required: true,
      default: 'Confirm programme-specific requirements with the institution.',
    },
    startDate: { type: String },
    status: {
      type: String,
      required: true,
      default: 'PUBLISHED',
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    },
  },
  {
    timestamps: true,
    collection: 'courses',
  }
);

// Compound index for discovery filters
CourseSchema.index({ level: 1, discipline: 1, status: 1 });
CourseSchema.index({ courseType: 1, mode: 1, scholarshipAvailable: 1, discipline: 1 });
CourseSchema.index({ currency: 1, status: 1 });

// Fee range filtering (used in catalog fee budget filter)
CourseSchema.index({ status: 1, tuitionFeeInr: 1 });

// Catalog listing default sort (status=PUBLISHED sorted by title)
CourseSchema.index({ status: 1, title: 1 });

// Text index for search
CourseSchema.index({ title: 'text', discipline: 'text', eligibility: 'text' });

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
