import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ISavedCourse extends Document {
  studentUserId: Types.ObjectId;
  courseId: Types.ObjectId;
  savedAt: Date;
}

const SavedCourseSchema = new Schema<ISavedCourse>(
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
    savedAt: { type: Date, default: Date.now },
  },
  {
    collection: 'saved_courses',
  }
);

SavedCourseSchema.index({ studentUserId: 1, courseId: 1 }, { unique: true });

export const SavedCourse = mongoose.model<ISavedCourse>('SavedCourse', SavedCourseSchema);
