import { z } from 'zod';
import { USER_ROLES } from '../types/user';

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(USER_ROLES),
});

export const studentRegistrationSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  country: z.string().trim().min(2).max(80),
  phone: z.string().trim().optional(),
  preferredLevel: z.string().trim().optional(),
  preferredDiscipline: z.string().trim().optional(),
  targetIntake: z.string().trim().optional(),
  passportNumber: z.string().trim().optional(),
});

export const instituteRegistrationSchema = z.object({
  instituteName: z.string().trim().min(3).max(180),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().optional(),
  website: z.string().trim().url().optional().or(z.literal('')),
  aisheCode: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  naacGrade: z.string().trim().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;
export type InstituteRegistrationInput = z.infer<typeof instituteRegistrationSchema>;
