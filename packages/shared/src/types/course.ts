// ── Course & Institute Types ────────────────────────────────────────────────
export const COURSE_LEVELS = ['UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORAL', 'CERTIFICATE'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const COURSE_MODES = ['OFFLINE', 'BLENDED', 'ONLINE'] as const;
export type CourseMode = (typeof COURSE_MODES)[number];

export const COURSE_TYPES = ['REGULAR', 'SHORT_TERM', 'SKILL_BASED'] as const;
export type CourseType = (typeof COURSE_TYPES)[number];

export const PUBLISH_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const APPROVAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export interface InstituteDocument {
  _id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  description: string;
  imageUrl?: string;
  ownerUserId?: string;
  status: PublishStatus;
  createdAt: Date;
}

export interface CourseDocument {
  _id: string;
  instituteId: string;
  title: string;
  slug: string;
  discipline: string;
  level: CourseLevel;
  durationMonths: number;
  tuitionFeeInr?: number;
  mode: CourseMode;
  courseType: CourseType;
  scholarshipAvailable: boolean;
  eligibility: string;
  startDate?: string;
  status: PublishStatus;
  createdAt: Date;
}
