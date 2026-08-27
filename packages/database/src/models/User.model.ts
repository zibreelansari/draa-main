import mongoose, { Schema, type Document } from 'mongoose';
import type { UserRole, UserStatus } from '@draa/shared';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['STUDENT', 'INSTITUTE', 'ADMIN'],
    },
    status: {
      type: String,
      required: true,
      default: 'ACTIVE',
      enum: ['ACTIVE', 'PENDING', 'SUSPENDED'],
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Compound unique index: one account per email+role combination
UserSchema.index({ email: 1, role: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);
