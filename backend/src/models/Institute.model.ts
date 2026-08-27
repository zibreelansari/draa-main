import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { PublishStatus } from '@draa/shared';

export interface IInstitute extends Document {
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  description: string;
  imageUrl?: string;
  ownerUserId?: Types.ObjectId;
  status: PublishStatus;
  createdAt: Date;
}

const InstituteSchema = new Schema<IInstitute>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      required: true,
      default: 'PUBLISHED',
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    },
  },
  {
    timestamps: true,
    collection: 'institutes',
  }
);

// Text index for search
InstituteSchema.index({ name: 'text', city: 'text', description: 'text' });

export const Institute = mongoose.model<IInstitute>('Institute', InstituteSchema);
