import { z } from 'zod';

export const applicationSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  statement: z.string().trim().min(50).max(4000),
});

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(254),
  source: z.string().trim().max(80).optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
