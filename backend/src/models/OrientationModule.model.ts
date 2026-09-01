import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IOrientationModule extends Document {
  moduleKey: string;
  title: string;
  category: 'VISA_FRRO' | 'HEALTH_SAFETY' | 'CAMPUS_LIFE' | 'FINANCE_BANKING' | 'ACADEMIC_PREP';
  description: string;
  order: number;
  estimatedMinutes: number;
  badgeName: string;
  topics: Array<{
    title: string;
    content: string;
    keyTakeaway: string;
  }>;
  checklist: string[];
}

export interface IStudentOrientationProgress extends Document {
  studentUserId: Types.ObjectId;
  moduleKey: string;
  completed: boolean;
  completedAt?: Date;
  checklistCompleted: string[];
}

const OrientationModuleSchema = new Schema<IOrientationModule>(
  {
    moduleKey: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['VISA_FRRO', 'HEALTH_SAFETY', 'CAMPUS_LIFE', 'FINANCE_BANKING', 'ACADEMIC_PREP'],
    },
    description: { type: String, required: true },
    order: { type: Number, default: 1 },
    estimatedMinutes: { type: Number, default: 15 },
    badgeName: { type: String, required: true },
    topics: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        keyTakeaway: { type: String, required: true },
      },
    ],
    checklist: [{ type: String }],
  },
  {
    timestamps: true,
    collection: 'orientation_modules',
  }
);

const StudentOrientationProgressSchema = new Schema<IStudentOrientationProgress>(
  {
    studentUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    moduleKey: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    checklistCompleted: [{ type: String }],
  },
  {
    timestamps: true,
    collection: 'student_orientation_progress',
  }
);

StudentOrientationProgressSchema.index({ studentUserId: 1, moduleKey: 1 }, { unique: true });

export const OrientationModule = mongoose.model<IOrientationModule>('OrientationModule', OrientationModuleSchema);
export const StudentOrientationProgress = mongoose.model<IStudentOrientationProgress>('StudentOrientationProgress', StudentOrientationProgressSchema);
