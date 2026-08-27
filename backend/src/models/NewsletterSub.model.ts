import mongoose, { Schema, type Document } from 'mongoose';

export interface INewsletterSub extends Document {
  email: string;
  source: string;
  isActive: boolean;
  subscribedAt: Date;
}

const NewsletterSubSchema = new Schema<INewsletterSub>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    source: {
      type: String,
      trim: true,
      default: 'website',
      maxlength: 80,
    },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'newsletter_subscriptions',
  }
);

export const NewsletterSub = mongoose.model<INewsletterSub>('NewsletterSub', NewsletterSubSchema);
