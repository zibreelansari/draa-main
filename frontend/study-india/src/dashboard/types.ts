import type { PublicUser, UserRole } from "@draa/shared";

export type NotificationItem = {
  id: string | number;
  title: string;
  body: string;
  kind: "INFO" | "ACTION" | "SUCCESS" | "WARNING";
  isRead: number | boolean;
  createdAt: string;
};

export type OfferDetails = {
  tuitionFee?: number;
  currency?: string;
  scholarshipWaiverPercent?: number;
  finalTuitionFee?: number;
  reportingDate?: string;
  conditions?: string;
  issuedAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
};

export type EvaluationDetails = {
  academicScore?: number;
  sopScore?: number;
  languageScore?: number;
  totalScore?: number;
  reviewerNotes?: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
};

export type ApplicationMessageItem = {
  _id: string;
  applicationId: string;
  senderUserId: string;
  senderRole: "STUDENT" | "INSTITUTE" | "ADMIN";
  senderName: string;
  message: string;
  createdAt: string;
};

export type OrientationModuleItem = {
  moduleKey: string;
  title: string;
  category: "VISA_FRRO" | "HEALTH_SAFETY" | "CAMPUS_LIFE" | "FINANCE_BANKING" | "ACADEMIC_PREP";
  description: string;
  order: number;
  estimatedMinutes: number;
  badgeName: string;
  topics: Array<{
    title: string;
    content: string;
    keyTakeaway: string;
  }>;
  checklist: string[];
  completed: boolean;
  completedAt?: string;
  checklistCompleted: string[];
};

export type StudentApplication = {
  id: string | number;
  status: string;
  submittedAt: string;
  updatedAt: string;
  decisionNote?: string;
  offerLetterUrl?: string;
  courseId: string | number;
  title: string;
  slug: string;
  discipline: string;
  level: string;
  startDate?: string;
  tuitionFee?: number;
  tuitionFeeInr?: number;
  currency?: string;
  instituteName: string;
  city: string;
  state: string;
  statement?: string;
  academicHistory?: {
    previousSchool?: string;
    degreeAttained?: string;
    gpaOrPercentage?: string;
    graduationYear?: number;
  };
  passportDetails?: {
    passportNumber?: string;
    nationality?: string;
    expiryDate?: string;
  };
  englishProficiency?: {
    testType?: string;
    score?: string;
    exemptReason?: string;
  };
  sop?: {
    text?: string;
    careerGoals?: string;
  };
  scholarshipRequested?: boolean;
  offerDetails?: OfferDetails;
  evaluation?: EvaluationDetails;
};

export type SavedCourse = {
  id: string | number;
  title: string;
  slug: string;
  level: string;
  discipline: string;
  startDate?: string;
  tuitionFee?: number;
  tuitionFeeInr?: number;
  currency?: string;
  instituteName: string;
  city: string;
};

export type StudentDocument = {
  id: string | number;
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
  id: string | number;
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
  statement?: string;
  academicHistory?: {
    previousSchool?: string;
    degreeAttained?: string;
    gpaOrPercentage?: string;
    graduationYear?: number;
  };
  passportDetails?: {
    passportNumber?: string;
    nationality?: string;
    expiryDate?: string;
  };
  englishProficiency?: {
    testType?: string;
    score?: string;
    exemptReason?: string;
  };
  sop?: {
    text?: string;
    careerGoals?: string;
  };
  scholarshipRequested?: boolean;
  offerDetails?: OfferDetails;
  evaluation?: EvaluationDetails;
  flaggedSuspicious?: boolean;
  flagReason?: string;
};

export type InstituteProgramme = {
  id: string | number;
  title: string;
  slug: string;
  level: string;
  discipline: string;
  mode: string;
  status: string;
  startDate?: string;
  tuitionFee?: number;
  tuitionFeeInr?: number;
  currency?: string;
  applications: number;
};

export type InstituteWorkspace = {
  role: "INSTITUTE";
  user: PublicUser;
  profile: { instituteName?: string; contactName?: string; city?: string; website?: string; approvalStatus?: string };
  institute?: { id?: string | number; name?: string; slug?: string; city?: string; state?: string; type?: string; description?: string; status?: string };
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
  instituteApprovals: Array<{ userId: string | number; instituteName: string; contactName: string; city: string; website?: string; approvalStatus: string; email: string; createdAt: string }>;
  applications: Array<{ id: string | number; status: string; updatedAt: string; studentName: string; country?: string; courseTitle: string; instituteName: string }>;
  recentUsers: Array<{ id: string | number; displayName: string; email: string; role: UserRole; status: string; createdAt: string }>;
  tickets: Array<{ id: string | number; subject: string; category: string; status: string; priority: string; createdAt: string; raisedBy: string; role: UserRole }>;
  audit: Array<{ id: string | number; action: string; entityType: string; entityId?: string; createdAt: string; actor?: string }>;
  notifications: NotificationItem[];
};

export type DashboardWorkspace = StudentWorkspace | InstituteWorkspace | AdminWorkspace;

export type DashboardViewProps<T extends DashboardWorkspace> = {
  data: T;
  activeSection: string;
  onNavigate: (section: string) => void;
  onRefresh: () => Promise<void>;
};
