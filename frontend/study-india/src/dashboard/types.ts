import type { PublicUser, UserRole } from "@draa/shared";

export type NotificationItem = {
  id: number;
  title: string;
  body: string;
  kind: "INFO" | "ACTION" | "SUCCESS" | "WARNING";
  isRead: number;
  createdAt: string;
};

export type StudentApplication = {
  id: number;
  status: string;
  submittedAt: string;
  updatedAt: string;
  decisionNote?: string;
  offerLetterUrl?: string;
  courseId: number;
  title: string;
  slug: string;
  discipline: string;
  level: string;
  startDate?: string;
  tuitionFeeInr?: number;
  instituteName: string;
  city: string;
  state: string;
};

export type SavedCourse = {
  id: number;
  title: string;
  slug: string;
  level: string;
  discipline: string;
  startDate?: string;
  tuitionFeeInr?: number;
  instituteName: string;
  city: string;
};

export type StudentDocument = {
  id: number;
  documentType: string;
  fileName?: string;
  status: string;
  updatedAt: string;
};

export type StudentWorkspace = {
  role: "STUDENT";
  user: PublicUser & { createdAt?: string };
  profile: { firstName?: string; lastName?: string; country?: string; passportNumber?: string; dateOfBirth?: string };
  metrics: { applications: number; saved: number; documentsReady: number; totalCourses: number; openTickets: number };
  applications: StudentApplication[];
  savedCourses: SavedCourse[];
  documents: StudentDocument[];
  notifications: NotificationItem[];
};

export type InstituteApplicant = {
  id: number;
  status: string;
  submittedAt: string;
  updatedAt: string;
  decisionNote?: string;
  offerLetterUrl?: string;
  studentName: string;
  email: string;
  country?: string;
  courseTitle: string;
  level: string;
};

export type InstituteProgramme = {
  id: number;
  title: string;
  slug: string;
  level: string;
  discipline: string;
  mode: string;
  status: string;
  startDate?: string;
  tuitionFeeInr?: number;
  applications: number;
};

export type InstituteWorkspace = {
  role: "INSTITUTE";
  user: PublicUser;
  profile: { instituteName?: string; contactName?: string; city?: string; website?: string; approvalStatus?: string };
  institute?: { id?: number; name?: string; slug?: string; city?: string; state?: string; type?: string; description?: string; status?: string };
  metrics: { programmes: number; applicants: number; awaitingReview: number; offers: number };
  programmes: InstituteProgramme[];
  applicants: InstituteApplicant[];
  applicationCounts: Array<{ status: string; count: number }>;
  notifications: NotificationItem[];
};

export type AdminWorkspace = {
  role: "ADMIN";
  user: PublicUser;
  metrics: { students: number; institutes: number; pendingInstitutes: number; applications: number; openTickets: number; publishedCourses: number };
  instituteApprovals: Array<{ userId: number; instituteName: string; contactName: string; city: string; website?: string; approvalStatus: string; email: string; createdAt: string }>;
  applications: Array<{ id: number; status: string; updatedAt: string; studentName: string; country?: string; courseTitle: string; instituteName: string }>;
  recentUsers: Array<{ id: number; displayName: string; email: string; role: UserRole; status: string; createdAt: string }>;
  tickets: Array<{ id: number; subject: string; category: string; status: string; priority: string; createdAt: string; raisedBy: string; role: UserRole }>;
  audit: Array<{ id: number; action: string; entityType: string; entityId?: string; createdAt: string; actor?: string }>;
  notifications: NotificationItem[];
};

export type DashboardWorkspace = StudentWorkspace | InstituteWorkspace | AdminWorkspace;

export type DashboardViewProps<T extends DashboardWorkspace> = {
  data: T;
  activeSection: string;
  onNavigate: (section: string) => void;
  onRefresh: () => Promise<void>;
};
