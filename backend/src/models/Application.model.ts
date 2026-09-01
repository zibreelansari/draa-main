import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { ApplicationStatus } from '@draa/shared';

export interface IApplication extends Document {
  studentUserId: Types.ObjectId;
  courseId: Types.ObjectId;
  statement: string;
  status: ApplicationStatus | 'OFFER_ACCEPTED' | 'OFFER_DECLINED';
  decisionNote?: string;
  offerLetterUrl?: string;
  
  // Academic & Candidate Profile Snapshot
  academicHistory?: {
    previousSchool?: string;
    degreeAttained?: string;
    gpaOrPercentage?: string;
    graduationYear?: number;
  };
  passportDetails?: {
    passportNumber?: string;
    nationality?: string;
    expiryDate?: string;
  };
  englishProficiency?: {
    testType?: string; // IELTS, TOEFL, Duolingo, MOI
    score?: string;
    exemptReason?: string;
  };
  sop?: {
    text?: string;
    careerGoals?: string;
  };
  scholarshipRequested?: boolean;
  
  // Formal Offer Letter Metadata
  offerDetails?: {
    tuitionFee?: number;
    currency?: string; // USD as default
    scholarshipWaiverPercent?: number;
    finalTuitionFee?: number;
    reportingDate?: string;
    conditions?: string;
    issuedAt?: Date;
    acceptedAt?: Date;
    declinedAt?: Date;
  };
  
  // Institutional Evaluation & Scoring
  evaluation?: {
    academicScore?: number; // 1-10
    sopScore?: number; // 1-10
    languageScore?: number; // 1-10
    totalScore?: number; // Calculated
    reviewerNotes?: string;
    evaluatedBy?: string;
    evaluatedAt?: Date;
  };

  // Fraud & Verification Flags
  flaggedSuspicious?: boolean;
  flagReason?: string;

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
    statement: { type: String, required: true, maxlength: 5000 },
    status: {
      type: String,
      required: true,
      default: 'SUBMITTED',
      enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'OFFERED', 'OFFER_ACCEPTED', 'OFFER_DECLINED', 'DECLINED', 'WITHDRAWN'],
    },
    decisionNote: { type: String, maxlength: 1000 },
    offerLetterUrl: { type: String },
    academicHistory: {
      previousSchool: { type: String },
      degreeAttained: { type: String },
      gpaOrPercentage: { type: String },
      graduationYear: { type: Number },
    },
    passportDetails: {
      passportNumber: { type: String },
      nationality: { type: String },
      expiryDate: { type: String },
    },
    englishProficiency: {
      testType: { type: String },
      score: { type: String },
      exemptReason: { type: String },
    },
    sop: {
      text: { type: String },
      careerGoals: { type: String },
    },
    scholarshipRequested: { type: Boolean, default: false },
    offerDetails: {
      tuitionFee: { type: Number },
      currency: { type: String, default: 'USD' },
      scholarshipWaiverPercent: { type: Number, default: 0 },
      finalTuitionFee: { type: Number },
      reportingDate: { type: String },
      conditions: { type: String },
      issuedAt: { type: Date },
      acceptedAt: { type: Date },
      declinedAt: { type: Date },
    },
    evaluation: {
      academicScore: { type: Number, min: 0, max: 10 },
      sopScore: { type: Number, min: 0, max: 10 },
      languageScore: { type: Number, min: 0, max: 10 },
      totalScore: { type: Number },
      reviewerNotes: { type: String },
      evaluatedBy: { type: String },
      evaluatedAt: { type: Date },
    },
    flaggedSuspicious: { type: Boolean, default: false },
    flagReason: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'applications',
  }
);

// Compound indexes for high-speed multi-filter queries at scale
ApplicationSchema.index({ studentUserId: 1, courseId: 1 }, { unique: true });
ApplicationSchema.index({ status: 1, submittedAt: -1 });
ApplicationSchema.index({ 'passportDetails.passportNumber': 1 });
ApplicationSchema.index({ flaggedSuspicious: 1, status: 1 });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
