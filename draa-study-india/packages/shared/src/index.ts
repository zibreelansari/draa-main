import { z } from "zod";

export const userRoles = ["STUDENT", "INSTITUTE", "ADMIN"] as const;
export type UserRole = (typeof userRoles)[number];

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(userRoles),
});

export const studentRegistrationSchema = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(128),
  country: z.string().trim().min(2).max(80),
});

export const instituteRegistrationSchema = z.object({
  instituteName: z.string().trim().min(3).max(180),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(128),
  city: z.string().trim().min(2).max(100),
  website: z.string().trim().url().optional().or(z.literal("")),
});

export const applicationSchema = z.object({
  courseId: z.number().int().positive(),
  statement: z.string().trim().min(50).max(4000),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;
export type InstituteRegistrationInput = z.infer<typeof instituteRegistrationSchema>;

export interface PublicUser {
  id: number;
  email: string;
  role: UserRole;
  displayName: string;
}

export interface ApiResult<T> {
  data?: T;
  error?: string;
  details?: unknown;
}
