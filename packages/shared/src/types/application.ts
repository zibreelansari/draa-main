// ── Application & Student Types ─────────────────────────────────────────────
export const APPLICATION_STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'OFFERED',
  'DECLINED',
  'WITHDRAWN',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const DOCUMENT_STATUSES = ['MISSING', 'UPLOADED', 'VERIFIED', 'ACTION_REQUIRED'] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const NOTIFICATION_KINDS = ['INFO', 'ACTION', 'SUCCESS', 'WARNING'] as const;
export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['LOW', 'NORMAL', 'HIGH'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export interface ApplicationDocument {
  _id: string;
  studentUserId: string;
  courseId: string;
  statement: string;
  status: ApplicationStatus;
  decisionNote?: string;
  offerLetterUrl?: string;
  submittedAt: Date;
  updatedAt: Date;
}

export interface StudentProfileDocument {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  country: string;
  passportNumber?: string;
  dateOfBirth?: string;
}

export interface InstituteProfileDocument {
  _id: string;
  userId: string;
  instituteName: string;
  contactName: string;
  city: string;
  website?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface NotificationDocument {
  _id: string;
  userId?: string;
  audienceRole?: string;
  title: string;
  body: string;
  kind: NotificationKind;
  isRead: boolean;
  createdAt: Date;
}

export interface SupportTicketDocument {
  _id: string;
  userId: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInquiryDocument {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED';
  createdAt: Date;
}

export interface NewsletterSubscriptionDocument {
  _id: string;
  email: string;
  source: string;
  isActive: boolean;
  subscribedAt: Date;
}

export interface ApiResult<T> {
  data?: T;
  error?: string;
  details?: unknown;
}
