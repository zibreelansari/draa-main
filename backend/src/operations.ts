import { Types } from 'mongoose';
import type {
  PublicUser,
  UserRole,
  StudentRegistrationInput,
  InstituteRegistrationInput,
} from '@draa/shared';
import {
  User,
  StudentProfile,
  InstituteProfile,
  Institute,
  Course,
  Application,
  ApplicationMessage,
  OrientationModule,
  StudentOrientationProgress,
  Session,
  SavedCourse,
  StudentDocument,
  Notification,
  SupportTicket,
  AuditLog,
  ContactInquiry,
  NewsletterSub,
} from './models/index';

// ── Auth & Session Operations ────────────────────────────────────────────────

export async function findUserByEmailAndRole(email: string, role: UserRole) {
  return User.findOne({ email: email.toLowerCase().trim(), role });
}

export async function findUserById(id: string | Types.ObjectId) {
  return User.findById(id);
}

export async function createSession(userId: string | Types.ObjectId, tokenHash: string, expiresAt: Date) {
  return Session.create({
    userId,
    tokenHash,
    expiresAt,
  });
}

export async function deleteSession(tokenHash: string) {
  return Session.deleteOne({ tokenHash });
}

export async function getSessionUser(tokenHash: string): Promise<PublicUser | null> {
  const session = await Session.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  }).populate<{ userId: { _id: Types.ObjectId; email: string; role: UserRole; status: string; displayName: string } }>('userId');

  if (!session || !session.userId || session.userId.status !== 'ACTIVE') {
    return null;
  }

  const u = session.userId;
  return {
    id: u._id.toString(),
    email: u.email,
    role: u.role,
    displayName: u.displayName,
  };
}

export async function createStudentUser(input: StudentRegistrationInput, passwordHash: string): Promise<PublicUser> {
  const user = await User.create({
    email: input.email.toLowerCase().trim(),
    passwordHash,
    role: 'STUDENT',
    status: 'ACTIVE',
    displayName: `${input.firstName} ${input.lastName}`,
  });

  await StudentProfile.create({
    userId: user._id,
    firstName: input.firstName,
    lastName: input.lastName,
    country: input.country,
  });

  // Create default document checklist for the student
  const requiredDocs = ['Passport', 'Academic Transcripts', 'English Proficiency Certificate', 'Statement of Purpose', 'Passport-size Photograph'];
  await StudentDocument.insertMany(
    requiredDocs.map((docType) => ({
      studentUserId: user._id,
      documentType: docType,
      status: 'MISSING',
    }))
  );

  return {
    id: user._id.toString(),
    email: user.email,
    role: 'STUDENT',
    displayName: user.displayName,
  };
}

export async function createInstituteUser(input: InstituteRegistrationInput, passwordHash: string): Promise<PublicUser> {
  const user = await User.create({
    email: input.email.toLowerCase().trim(),
    passwordHash,
    role: 'INSTITUTE',
    status: 'PENDING',
    displayName: input.instituteName,
  });

  await InstituteProfile.create({
    userId: user._id,
    instituteName: input.instituteName,
    contactName: input.contactName,
    city: input.city,
    website: input.website || undefined,
    approvalStatus: 'PENDING',
  });

  return {
    id: user._id.toString(),
    email: user.email,
    role: 'INSTITUTE',
    displayName: user.displayName,
  };
}

// ── Profile Update Operations ────────────────────────────────────────────────

export async function updateStudentProfile(userId: string | Types.ObjectId, updates: {
  firstName?: string;
  lastName?: string;
  country?: string;
  passportNumber?: string;
  dateOfBirth?: string;
}) {
  const profile = await StudentProfile.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, upsert: true }
  );

  // Update displayName on User if name changed
  if (updates.firstName || updates.lastName) {
    const current = await StudentProfile.findOne({ userId }).lean();
    if (current) {
      const displayName = `${updates.firstName || current.firstName} ${updates.lastName || current.lastName}`;
      await User.findByIdAndUpdate(userId, { $set: { displayName } });
    }
  }

  return profile;
}

export async function updateInstituteProfileData(userId: string | Types.ObjectId, updates: {
  instituteName?: string;
  contactName?: string;
  city?: string;
  website?: string;
  description?: string;
}) {
  const profile = await InstituteProfile.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true }
  );

  // Also update the Institute record if it exists
  if (updates.description || updates.city) {
    const instituteUpdates: Record<string, unknown> = {};
    if (updates.description) instituteUpdates.description = updates.description;
    if (updates.city) instituteUpdates.city = updates.city;
    await Institute.findOneAndUpdate({ ownerUserId: userId }, { $set: instituteUpdates });
  }

  if (updates.instituteName) {
    await User.findByIdAndUpdate(userId, { $set: { displayName: updates.instituteName } });
  }

  return profile;
}

// ── Catalog Operations ───────────────────────────────────────────────────────

export async function listInstitutes() {
  return Institute.find({ status: 'PUBLISHED' }).sort({ name: 1 }).lean();
}

export async function getInstituteBySlug(slug: string) {
  return Institute.findOne({ slug: slug.toLowerCase(), status: 'PUBLISHED' }).lean();
}

export async function listCourses(filters?: { level?: string; discipline?: string; query?: string; mode?: string; minFee?: number; maxFee?: number }) {
  const query: Record<string, unknown> = { status: 'PUBLISHED' };
  if (filters?.level) query.level = filters.level;
  if (filters?.discipline) query.discipline = filters.discipline;
  if (filters?.mode) query.mode = filters.mode;
  if (filters?.query) {
    query.$or = [
      { title: { $regex: filters.query, $options: 'i' } },
      { discipline: { $regex: filters.query, $options: 'i' } },
    ];
  }
  if (filters?.minFee || filters?.maxFee) {
    query.tuitionFeeInr = {};
    if (filters.minFee) (query.tuitionFeeInr as Record<string, number>).$gte = filters.minFee;
    if (filters.maxFee) (query.tuitionFeeInr as Record<string, number>).$lte = filters.maxFee;
  }

  return Course.find(query)
    .populate('instituteId', 'name slug city state type imageUrl')
    .sort({ title: 1 })
    .lean();
}

export async function getCourseBySlug(slug: string) {
  return Course.findOne({ slug: slug.toLowerCase(), status: 'PUBLISHED' })
    .populate('instituteId', 'name slug city state type description imageUrl')
    .lean();
}

// ── Application & Student Operations ─────────────────────────────────────────

export async function listStudentApplications(studentUserId: string | Types.ObjectId) {
  return Application.find({ studentUserId })
    .populate({
      path: 'courseId',
      populate: { path: 'instituteId', select: 'name slug city state' },
    })
    .sort({ submittedAt: -1 })
    .lean();
}

export async function createStudentApplication(studentUserId: string | Types.ObjectId, courseId: string | Types.ObjectId, statement: string) {
  return Application.create({
    studentUserId,
    courseId,
    statement,
    status: 'SUBMITTED',
  });
}

export async function submitFullApplication(
  studentUserId: string | Types.ObjectId,
  data: {
    courseId: string;
    statement: string;
    academicHistory?: { previousSchool?: string; degreeAttained?: string; gpaOrPercentage?: string; graduationYear?: number };
    passportDetails?: { passportNumber?: string; nationality?: string; expiryDate?: string };
    englishProficiency?: { testType?: string; score?: string; exemptReason?: string };
    sop?: { text?: string; careerGoals?: string };
    scholarshipRequested?: boolean;
  }
) {
  // Fraud detection check: check if passport is duplicate under a different student user
  let flaggedSuspicious = false;
  let flagReason = '';
  if (data.passportDetails?.passportNumber) {
    const cleanPassport = data.passportDetails.passportNumber.trim().toUpperCase();
    const existingWithSamePassport = await Application.findOne({
      'passportDetails.passportNumber': cleanPassport,
      studentUserId: { $ne: studentUserId },
    }).lean();

    if (existingWithSamePassport) {
      flaggedSuspicious = true;
      flagReason = `Duplicate passport ${cleanPassport} detected across different student accounts.`;
    }
  }

  const app = await Application.create({
    studentUserId,
    courseId: data.courseId,
    statement: data.statement || data.sop?.text || 'Application for international admission',
    academicHistory: data.academicHistory,
    passportDetails: data.passportDetails,
    englishProficiency: data.englishProficiency,
    sop: data.sop,
    scholarshipRequested: Boolean(data.scholarshipRequested),
    flaggedSuspicious,
    flagReason,
    status: 'SUBMITTED',
  });

  // Update profile country / passport if missing
  if (data.passportDetails?.nationality || data.passportDetails?.passportNumber) {
    await StudentProfile.updateOne(
      { userId: studentUserId },
      {
        $set: {
          ...(data.passportDetails.nationality ? { country: data.passportDetails.nationality } : {}),
          ...(data.passportDetails.passportNumber ? { passportNumber: data.passportDetails.passportNumber } : {}),
        },
      },
      { upsert: true }
    );
  }

  // Notify course institution
  const course = await Course.findById(data.courseId).populate('instituteId').lean();
  if (course && (course as any).instituteId?.ownerUserId) {
    await createNotification({
      userId: (course as any).instituteId.ownerUserId,
      audienceRole: 'INSTITUTE',
      title: 'New Admission Application Received',
      body: `A new candidate has submitted an application for ${course.title}.`,
      kind: 'ACTION',
    });
  }

  return app;
}

export async function issueOfferLetter(
  applicationId: string | Types.ObjectId,
  offerData: {
    tuitionFee: number;
    currency?: string;
    scholarshipWaiverPercent?: number;
    reportingDate?: string;
    conditions?: string;
  },
  actorName: string
) {
  const discount = Math.min(100, Math.max(0, Number(offerData.scholarshipWaiverPercent) || 0));
  const baseFee = Number(offerData.tuitionFee) || 0;
  const finalFee = Math.round(baseFee * (1 - discount / 100));
  const currency = (offerData.currency || 'USD').toUpperCase();

  const app = await Application.findByIdAndUpdate(
    applicationId,
    {
      $set: {
        status: 'OFFERED',
        offerDetails: {
          tuitionFee: baseFee,
          currency,
          scholarshipWaiverPercent: discount,
          finalTuitionFee: finalFee,
          reportingDate: offerData.reportingDate || 'August 1, 2026',
          conditions: offerData.conditions || 'Subject to original transcript and passport verification at campus registration.',
          issuedAt: new Date(),
        },
        updatedAt: new Date(),
      },
    },
    { new: true }
  ).populate('studentUserId').populate('courseId');

  if (app && app.studentUserId) {
    await createNotification({
      userId: (app.studentUserId as any)._id,
      audienceRole: 'STUDENT',
      title: 'Formal Admission Offer Issued!',
      body: `Congratulations! An official admission offer has been issued for ${(app.courseId as any)?.title || 'your programme'} with tuition ${currency} ${finalFee}.`,
      kind: 'SUCCESS',
    });
    await createAuditEntry('OFFER_ISSUED', 'Application', String(applicationId), actorName);
  }

  return app;
}

export async function respondToOfferLetter(
  applicationId: string | Types.ObjectId,
  studentUserId: string | Types.ObjectId,
  decision: 'ACCEPT' | 'DECLINE'
) {
  const status = decision === 'ACCEPT' ? 'OFFER_ACCEPTED' : 'OFFER_DECLINED';
  const timestampField = decision === 'ACCEPT' ? 'offerDetails.acceptedAt' : 'offerDetails.declinedAt';

  const app = await Application.findOneAndUpdate(
    { _id: applicationId, studentUserId, status: 'OFFERED' },
    {
      $set: {
        status,
        [timestampField]: new Date(),
        updatedAt: new Date(),
      },
    },
    { new: true }
  ).populate('courseId');

  if (!app) throw new Error('Application not found or not in OFFERED state.');

  // Notify institute
  const course = await Course.findById(app.courseId).populate('instituteId').lean();
  if (course && (course as any).instituteId?.ownerUserId) {
    await createNotification({
      userId: (course as any).instituteId.ownerUserId,
      audienceRole: 'INSTITUTE',
      title: decision === 'ACCEPT' ? 'Candidate Accepted Offer!' : 'Candidate Declined Offer',
      body: `An applicant has ${decision.toLowerCase()}ed the admission offer for ${course.title}.`,
      kind: decision === 'ACCEPT' ? 'SUCCESS' : 'INFO',
    });
  }

  return app;
}

export async function scoreApplicant(
  applicationId: string | Types.ObjectId,
  scores: { academicScore: number; sopScore: number; languageScore: number; reviewerNotes?: string },
  evaluatorName: string
) {
  const acad = Math.min(10, Math.max(0, Number(scores.academicScore) || 0));
  const sop = Math.min(10, Math.max(0, Number(scores.sopScore) || 0));
  const lang = Math.min(10, Math.max(0, Number(scores.languageScore) || 0));
  const total = Number(((acad * 0.4) + (sop * 0.3) + (lang * 0.3)).toFixed(1));

  return Application.findByIdAndUpdate(
    applicationId,
    {
      $set: {
        evaluation: {
          academicScore: acad,
          sopScore: sop,
          languageScore: lang,
          totalScore: total,
          reviewerNotes: scores.reviewerNotes || '',
          evaluatedBy: evaluatorName,
          evaluatedAt: new Date(),
        },
        status: 'UNDER_REVIEW',
        updatedAt: new Date(),
      },
    },
    { new: true }
  );
}

// ── Application Messaging ────────────────────────────────────────────────────

export async function getApplicationMessages(applicationId: string | Types.ObjectId) {
  return ApplicationMessage.find({ applicationId }).sort({ createdAt: 1 }).lean();
}

export async function sendApplicationMessage(
  applicationId: string | Types.ObjectId,
  senderUserId: string | Types.ObjectId,
  senderRole: 'STUDENT' | 'INSTITUTE' | 'ADMIN',
  senderName: string,
  message: string
) {
  const newMsg = await ApplicationMessage.create({
    applicationId,
    senderUserId,
    senderRole,
    senderName,
    message,
    isRead: false,
  });

  const app = await Application.findById(applicationId).populate('courseId').lean();
  if (app) {
    if (senderRole === 'STUDENT') {
      const course = await Course.findById(app.courseId).populate('instituteId').lean();
      if (course && (course as any).instituteId?.ownerUserId) {
        await createNotification({
          userId: (course as any).instituteId.ownerUserId,
          audienceRole: 'INSTITUTE',
          title: `New Query from ${senderName}`,
          body: message.length > 80 ? message.slice(0, 77) + '…' : message,
          kind: 'INFO',
        });
      }
    } else {
      await createNotification({
        userId: app.studentUserId,
        audienceRole: 'STUDENT',
        title: `Admissions Query from ${senderName}`,
        body: message.length > 80 ? message.slice(0, 77) + '…' : message,
        kind: 'INFO',
      });
    }
  }

  return newMsg;
}

// ── Orientation LMS Modules ──────────────────────────────────────────────────

export async function listOrientationModulesWithProgress(studentUserId: string | Types.ObjectId) {
  const modules = await OrientationModule.find().sort({ order: 1 }).lean();
  const progressList = await StudentOrientationProgress.find({ studentUserId }).lean();
  const progressMap = new Map(progressList.map((p) => [p.moduleKey, p]));

  return modules.map((m) => {
    const p = progressMap.get(m.moduleKey);
    return {
      moduleKey: m.moduleKey,
      title: m.title,
      category: m.category,
      description: m.description,
      order: m.order,
      estimatedMinutes: m.estimatedMinutes,
      badgeName: m.badgeName,
      topics: m.topics,
      checklist: m.checklist,
      completed: p?.completed || false,
      completedAt: p?.completedAt?.toISOString?.() || '',
      checklistCompleted: p?.checklistCompleted || [],
    };
  });
}

export async function updateOrientationProgress(
  studentUserId: string | Types.ObjectId,
  moduleKey: string,
  checklistCompleted: string[],
  completed: boolean
) {
  return StudentOrientationProgress.findOneAndUpdate(
    { studentUserId, moduleKey },
    {
      $set: {
        checklistCompleted,
        completed,
        ...(completed ? { completedAt: new Date() } : {}),
      },
    },
    { upsert: true, new: true }
  );
}

// ── Fraud & Compliance Queue ─────────────────────────────────────────────────

export async function getAdminFraudQueue() {
  return Application.find({ flaggedSuspicious: true })
    .populate('studentUserId', 'displayName email')
    .populate({
      path: 'courseId',
      populate: { path: 'instituteId', select: 'name city' },
    })
    .sort({ updatedAt: -1 })
    .lean();
}

export async function flagApplication(
  applicationId: string | Types.ObjectId,
  flagged: boolean,
  flagReason: string,
  actorName: string
) {
  const app = await Application.findByIdAndUpdate(
    applicationId,
    {
      $set: {
        flaggedSuspicious: flagged,
        flagReason: flagged ? flagReason : '',
      },
    },
    { new: true }
  );
  await createAuditEntry('FRAUD_FLAG_UPDATE', 'Application', String(applicationId), actorName);
  return app;
}

export async function withdrawApplication(studentUserId: string | Types.ObjectId, applicationId: string | Types.ObjectId) {
  return Application.findOneAndUpdate(
    { _id: applicationId, studentUserId, status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } },
    { $set: { status: 'WITHDRAWN', updatedAt: new Date() } },
    { new: true }
  );
}

export async function toggleSavedCourse(studentUserId: string | Types.ObjectId, courseId: string | Types.ObjectId, save: boolean) {
  if (save) {
    await SavedCourse.updateOne(
      { studentUserId, courseId },
      { $set: { studentUserId, courseId, savedAt: new Date() } },
      { upsert: true }
    );
    return { saved: true };
  } else {
    await SavedCourse.deleteOne({ studentUserId, courseId });
    return { saved: false };
  }
}

export async function listSavedCourses(studentUserId: string | Types.ObjectId) {
  const saved = await SavedCourse.find({ studentUserId })
    .populate({
      path: 'courseId',
      populate: { path: 'instituteId', select: 'name slug city state imageUrl' },
    })
    .lean();
  return saved.map((s) => s.courseId);
}

// ── Document Operations ──────────────────────────────────────────────────────

export async function uploadStudentDocument(studentUserId: string | Types.ObjectId, documentType: string, fileName: string, filePath: string) {
  return StudentDocument.findOneAndUpdate(
    { studentUserId, documentType },
    { $set: { fileName, filePath, status: 'UPLOADED', updatedAt: new Date() } },
    { new: true, upsert: true }
  );
}

export async function deleteStudentDocument(studentUserId: string | Types.ObjectId, documentId: string | Types.ObjectId) {
  return StudentDocument.findOneAndUpdate(
    { _id: documentId, studentUserId },
    { $set: { fileName: undefined, filePath: undefined, status: 'MISSING', updatedAt: new Date() } },
    { new: true }
  );
}

// ── Notifications & Tickets ──────────────────────────────────────────────────

export async function listUserNotifications(userId: string | Types.ObjectId, role: UserRole) {
  return Notification.find({
    $or: [{ userId }, { audienceRole: role }],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
}

export async function markNotificationAsRead(userId: string | Types.ObjectId, notificationId: string | Types.ObjectId) {
  return Notification.updateOne({ _id: notificationId, userId }, { $set: { isRead: true } });
}

export async function createNotification(options: {
  userId?: string | Types.ObjectId;
  audienceRole?: UserRole;
  title: string;
  body: string;
  kind: 'INFO' | 'ACTION' | 'SUCCESS' | 'WARNING';
}) {
  return Notification.create(options);
}

export async function createSupportTicket(userId: string | Types.ObjectId, subject: string, category: string) {
  return SupportTicket.create({
    userId,
    subject,
    category,
    status: 'OPEN',
    priority: 'NORMAL',
  });
}

export async function updateSupportTicketStatus(ticketId: string | Types.ObjectId, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') {
  return SupportTicket.findByIdAndUpdate(ticketId, { $set: { status, updatedAt: new Date() } }, { new: true });
}

// ── Audit Logging ────────────────────────────────────────────────────────────

export async function createAuditEntry(action: string, entityType: string, entityId?: string, actor?: string) {
  return AuditLog.create({ action, entityType, entityId, actor });
}

// ── Dashboard Aggregation Workspace ──────────────────────────────────────────
// These functions shape raw data into the exact format the frontend expects.

export async function getStudentDashboard(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  const profile = await StudentProfile.findOne({ userId }).lean();
  const rawApplications = await Application.find({ studentUserId: userId })
    .populate({
      path: 'courseId',
      populate: { path: 'instituteId', select: 'name slug city state' },
    })
    .sort({ submittedAt: -1 })
    .lean();

  const savedRaw = await SavedCourse.find({ studentUserId: userId })
    .populate({
      path: 'courseId',
      populate: { path: 'instituteId', select: 'name slug city state imageUrl' },
    })
    .lean();

  const documents = await StudentDocument.find({ studentUserId: userId }).lean();
  const notifications = await listUserNotifications(userId, 'STUDENT');
  const totalCourses = await Course.countDocuments({ status: 'PUBLISHED' });
  const openTickets = await SupportTicket.countDocuments({ userId, status: { $in: ['OPEN', 'IN_PROGRESS'] } });

  // Shape applications to match frontend StudentApplication type
  const applications = rawApplications.map((app: any) => {
    const course = app.courseId || {};
    const institute = course.instituteId || {};
    return {
      id: app._id.toString(),
      status: app.status,
      submittedAt: app.submittedAt?.toISOString?.() || app.submittedAt,
      updatedAt: app.updatedAt?.toISOString?.() || app.updatedAt,
      decisionNote: app.decisionNote,
      offerLetterUrl: app.offerLetterUrl,
      courseId: course._id?.toString?.() || '',
      title: course.title || 'Unknown Programme',
      slug: course.slug || '',
      discipline: course.discipline || '',
      level: course.level || '',
      startDate: course.startDate,
      tuitionFee: course.tuitionFee || course.tuitionFeeInr,
      tuitionFeeInr: course.tuitionFeeInr || course.tuitionFee,
      currency: course.currency || 'USD',
      instituteName: institute.name || 'Unknown Institute',
      city: institute.city || '',
      state: institute.state || '',
      statement: app.statement,
      academicHistory: app.academicHistory,
      passportDetails: app.passportDetails,
      englishProficiency: app.englishProficiency,
      sop: app.sop,
      scholarshipRequested: app.scholarshipRequested,
      offerDetails: app.offerDetails,
      evaluation: app.evaluation,
    };
  });

  // Shape saved courses
  const savedCourses = savedRaw.map((s: any) => {
    const course = s.courseId || {};
    const institute = course.instituteId || {};
    return {
      id: course._id?.toString?.() || '',
      title: course.title || '',
      slug: course.slug || '',
      level: course.level || '',
      discipline: course.discipline || '',
      startDate: course.startDate,
      tuitionFee: course.tuitionFee || course.tuitionFeeInr,
      tuitionFeeInr: course.tuitionFeeInr || course.tuitionFee,
      currency: course.currency || 'USD',
      instituteName: institute.name || '',
      city: institute.city || '',
    };
  });

  // Shape documents
  const shapedDocuments = documents.map((doc: any) => ({
    id: doc._id.toString(),
    documentType: doc.documentType,
    fileName: doc.fileName,
    status: doc.status,
    updatedAt: doc.updatedAt?.toISOString?.() || doc.updatedAt,
  }));

  // Shape notifications
  const shapedNotifications = notifications.map((n: any) => ({
    id: n._id.toString(),
    title: n.title,
    body: n.body,
    kind: n.kind,
    isRead: n.isRead ? 1 : 0,
    createdAt: n.createdAt?.toISOString?.() || n.createdAt,
  }));

  const documentsReady = documents.filter((d: any) => d.status === 'VERIFIED').length;

  return {
    role: 'STUDENT' as const,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: 'STUDENT' as const,
      displayName: user.displayName,
    },
    profile: {
      fullName: profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : user.displayName,
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      country: profile?.country || '',
      passportNumber: profile?.passportNumber || '',
      dateOfBirth: profile?.dateOfBirth || '',
      documentsVerified: documentsReady,
      profileComplete: profile?.firstName && profile?.lastName && profile?.country ? 1 : 0,
    },
    metrics: {
      activeApplications: applications.filter((a: any) => ['SUBMITTED', 'UNDER_REVIEW', 'OFFERED'].includes(a.status)).length,
      offersReceived: applications.filter((a: any) => a.status === 'OFFERED').length,
      documentsReady,
      totalCatalogCourses: totalCourses,
      openSupportTickets: openTickets,
    },
    applications,
    savedCourses,
    documents: shapedDocuments,
    notifications: shapedNotifications,
  };
}

export async function getInstituteDashboard(userId: string | Types.ObjectId) {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  const institute = await Institute.findOne({ ownerUserId: userId }).lean();
  const profile = await InstituteProfile.findOne({ userId }).lean();

  let programmes: any[] = [];
  let rawApplicants: any[] = [];
  let applicationCounts: Array<{ status: string; count: number }> = [];

  if (institute) {
    const courses = await Course.find({ instituteId: institute._id }).lean();
    const courseIds = courses.map((c: any) => c._id);

    // Count applications per course
    const appCountMap = await Application.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: '$courseId', count: { $sum: 1 } } },
    ]);
    const countByCourse = new Map(appCountMap.map((a: any) => [a._id.toString(), a.count]));

    programmes = courses.map((c: any) => ({
      id: c._id.toString(),
      title: c.title,
      slug: c.slug,
      level: c.level,
      discipline: c.discipline || '',
      mode: c.mode || 'OFFLINE',
      status: c.status,
      startDate: c.startDate,
      tuitionFee: c.tuitionFee || c.tuitionFeeInr,
      tuitionFeeInr: c.tuitionFeeInr || c.tuitionFee,
      currency: c.currency || 'USD',
      applications: countByCourse.get(c._id.toString()) || 0,
    }));

    // Fetch applicants
    const rawApps = await Application.find({ courseId: { $in: courseIds } })
      .populate('studentUserId', 'displayName email')
      .populate('courseId', 'title slug level')
      .sort({ submittedAt: -1 })
      .lean();

    rawApplicants = rawApps.map((app: any) => {
      const student = app.studentUserId || {};
      const course = app.courseId || {};
      // Get student country from profile
      return {
        id: app._id.toString(),
        status: app.status,
        submittedAt: app.submittedAt?.toISOString?.() || app.submittedAt,
        updatedAt: app.updatedAt?.toISOString?.() || app.updatedAt,
        decisionNote: app.decisionNote,
        offerLetterUrl: app.offerLetterUrl,
        studentName: student.displayName || 'Unknown',
        email: student.email || '',
        country: '',
        courseTitle: course.title || '',
        level: course.level || '',
        statement: app.statement,
        academicHistory: app.academicHistory,
        passportDetails: app.passportDetails,
        englishProficiency: app.englishProficiency,
        sop: app.sop,
        scholarshipRequested: app.scholarshipRequested,
        offerDetails: app.offerDetails,
        evaluation: app.evaluation,
        flaggedSuspicious: app.flaggedSuspicious,
        flagReason: app.flagReason,
      };
    });

    // Fill in countries from student profiles
    const studentUserIds = rawApps.map((a: any) => a.studentUserId?._id || a.studentUserId).filter(Boolean);
    if (studentUserIds.length) {
      const profiles = await StudentProfile.find({ userId: { $in: studentUserIds } }).lean();
      const countryMap = new Map(profiles.map((p: any) => [p.userId.toString(), p.country]));
      for (const applicant of rawApplicants) {
        const matchApp = rawApps.find((a: any) => a._id.toString() === applicant.id);
        const stuId = matchApp?.studentUserId?._id?.toString?.() || matchApp?.studentUserId?.toString?.();
        if (stuId) applicant.country = countryMap.get(stuId) || '';
      }
    }

    // Application counts by status
    const statusAgg = await Application.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    applicationCounts = statusAgg.map((a: any) => ({ status: a._id, count: a.count }));
  }

  const notifications = await listUserNotifications(userId, 'INSTITUTE');
  const shapedNotifications = notifications.map((n: any) => ({
    id: n._id.toString(),
    title: n.title,
    body: n.body,
    kind: n.kind,
    isRead: n.isRead ? 1 : 0,
    createdAt: n.createdAt?.toISOString?.() || n.createdAt,
  }));

  const awaitingReview = rawApplicants.filter((a) => a.status === 'SUBMITTED').length;
  const offers = rawApplicants.filter((a) => a.status === 'OFFERED').length;

  return {
    role: 'INSTITUTE' as const,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    },
    profile: {
      instituteName: profile?.instituteName || '',
      contactName: profile?.contactName || '',
      city: profile?.city || '',
      website: profile?.website || '',
      approvalStatus: profile?.approvalStatus || 'PENDING',
    },
    institute: institute ? {
      id: institute._id.toString(),
      name: institute.name,
      slug: institute.slug,
      city: institute.city,
      state: institute.state,
      type: institute.type,
      description: institute.description,
      status: institute.status,
    } : undefined,
    metrics: {
      programmes: programmes.length,
      applicants: rawApplicants.length,
      awaitingReview,
      offers,
    },
    programmes,
    applicants: rawApplicants,
    applicationCounts,
    notifications: shapedNotifications,
  };
}

export async function getAdminDashboard(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  // Metrics
  const students = await User.countDocuments({ role: 'STUDENT' });
  const institutes = await User.countDocuments({ role: 'INSTITUTE' });
  const pendingInstitutes = await InstituteProfile.countDocuments({ approvalStatus: 'PENDING' });
  const applications = await Application.countDocuments();
  const openTickets = await SupportTicket.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } });
  const publishedCourses = await Course.countDocuments({ status: 'PUBLISHED' });

  // Institute approvals queue
  const rawApprovals = await InstituteProfile.find()
    .populate('userId', 'displayName email createdAt')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const instituteApprovals = rawApprovals.map((p: any) => ({
    userId: p.userId?._id?.toString?.() || p.userId?.toString?.() || '',
    instituteName: p.instituteName || '',
    contactName: p.contactName || '',
    city: p.city || '',
    website: p.website || '',
    approvalStatus: p.approvalStatus || 'PENDING',
    email: p.userId?.email || '',
    createdAt: p.userId?.createdAt?.toISOString?.() || p.createdAt?.toISOString?.() || '',
  }));

  // Recent applications
  const rawApps = await Application.find()
    .populate('studentUserId', 'displayName email')
    .populate({
      path: 'courseId',
      populate: { path: 'instituteId', select: 'name' },
    })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  const shapedApplications = rawApps.map((app: any) => {
    const student = app.studentUserId || {};
    const course = app.courseId || {};
    const institute = course.instituteId || {};
    return {
      id: app._id.toString(),
      status: app.status,
      updatedAt: app.updatedAt?.toISOString?.() || app.updatedAt,
      studentName: student.displayName || 'Unknown',
      country: '',
      courseTitle: course.title || '',
      instituteName: institute.name || '',
    };
  });

  // Fill countries
  const studentIds = rawApps.map((a: any) => a.studentUserId?._id).filter(Boolean);
  if (studentIds.length) {
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } }).lean();
    const countryMap = new Map(profiles.map((p: any) => [p.userId.toString(), p.country]));
    for (let i = 0; i < shapedApplications.length; i++) {
      const stuId = rawApps[i]?.studentUserId?._id?.toString?.();
      if (stuId) shapedApplications[i].country = countryMap.get(stuId) || '';
    }
  }

  // Recent users
  const rawUsers = await User.find().sort({ createdAt: -1 }).limit(50).lean();
  const recentUsers = rawUsers.map((u: any) => ({
    id: u._id.toString(),
    displayName: u.displayName,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt?.toISOString?.() || '',
  }));

  // Support tickets
  const rawTickets = await SupportTicket.find()
    .populate('userId', 'displayName email role')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const tickets = rawTickets.map((t: any) => ({
    id: t._id.toString(),
    subject: t.subject,
    category: t.category,
    status: t.status,
    priority: t.priority,
    createdAt: t.createdAt?.toISOString?.() || '',
    raisedBy: t.userId?.displayName || 'Unknown',
    role: t.userId?.role || 'STUDENT',
  }));

  // Audit log
  const rawAudit = await AuditLog.find().sort({ createdAt: -1 }).limit(50).lean();
  const audit = rawAudit.map((a: any) => ({
    id: a._id.toString(),
    action: a.action,
    entityType: a.entityType,
    entityId: a.entityId || '',
    createdAt: a.createdAt?.toISOString?.() || '',
    actor: a.actor || '',
  }));

  // Notifications
  const notifications = await listUserNotifications(userId, 'ADMIN');
  const shapedNotifications = notifications.map((n: any) => ({
    id: n._id.toString(),
    title: n.title,
    body: n.body,
    kind: n.kind,
    isRead: n.isRead ? 1 : 0,
    createdAt: n.createdAt?.toISOString?.() || n.createdAt,
  }));

  return {
    role: 'ADMIN' as const,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    },
    metrics: {
      students,
      institutes,
      pendingInstitutes,
      applications,
      openTickets,
      publishedCourses,
    },
    instituteApprovals,
    applications: shapedApplications,
    recentUsers,
    tickets,
    audit,
    notifications: shapedNotifications,
  };
}

/** Legacy wrapper — routes still call getDashboardWorkspace */
export async function getDashboardWorkspace(role: UserRole, userId: string | Types.ObjectId) {
  const id = userId.toString();
  if (role === 'STUDENT') return getStudentDashboard(id);
  if (role === 'INSTITUTE') return getInstituteDashboard(id);
  if (role === 'ADMIN') return getAdminDashboard(id);

  // Fallback
  const notifications = await listUserNotifications(userId, role);
  return { role, notifications: [] };
}

// ── Admin Operations ─────────────────────────────────────────────────────────

export async function listAllUsers(filters?: { role?: string; status?: string; search?: string }, page = 1, limit = 25) {
  const query: Record<string, unknown> = {};
  if (filters?.role && filters.role !== 'ALL') query.role = filters.role;
  if (filters?.status) query.status = filters.status;
  if (filters?.search) {
    query.$or = [
      { displayName: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
  ]);
  return {
    data: users.map((u: any) => ({
      id: u._id.toString(),
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt?.toISOString?.() || '',
    })),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED') {
  return User.findByIdAndUpdate(userId, { $set: { status } }, { new: true });
}

export async function getPlatformAnalytics() {
  const [students, institutes, courses, apps, tickets] = await Promise.all([
    User.countDocuments({ role: 'STUDENT' }),
    User.countDocuments({ role: 'INSTITUTE' }),
    Course.countDocuments({ status: 'PUBLISHED' }),
    Application.countDocuments(),
    SupportTicket.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
  ]);

  // Application status breakdown
  const statusBreakdown = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Top disciplines
  const topDisciplines = await Course.aggregate([
    { $match: { status: 'PUBLISHED' } },
    { $group: { _id: '$discipline', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return {
    students,
    institutes,
    courses,
    applications: apps,
    openTickets: tickets,
    statusBreakdown: statusBreakdown.map((s: any) => ({ status: s._id, count: s.count })),
    topDisciplines: topDisciplines.map((d: any) => ({ discipline: d._id, count: d.count })),
  };
}

// ── Corporate Inquiries & Newsletter ─────────────────────────────────────────

export async function createContactInquiry(data: { name: string; email: string; phone?: string; subject: string; message: string }) {
  return ContactInquiry.create(data);
}

export async function subscribeNewsletter(email: string, source = 'website') {
  return NewsletterSub.updateOne(
    { email: email.toLowerCase().trim() },
    { $set: { email: email.toLowerCase().trim(), source, isActive: true, subscribedAt: new Date() } },
    { upsert: true }
  );
}
