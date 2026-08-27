import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IStudentProfile extends Document {
  userId: Types.ObjectId;
  firstName: string;
  lastName: string;
  country: string;
  passportNumber?: string;
  dateOfBirth?: string;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    country: { type: String, required: true, trim: true, maxlength: 80 },
    passportNumber: { type: String, trim: true },
    dateOfBirth: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: 'student_profiles',
  }
);

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
