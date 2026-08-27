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

// ── Catalog Operations ───────────────────────────────────────────────────────

export async function listInstitutes() {
  return Institute.find({ status: 'PUBLISHED' }).sort({ name: 1 }).lean();
}

export async function getInstituteBySlug(slug: string) {
  return Institute.findOne({ slug: slug.toLowerCase(), status: 'PUBLISHED' }).lean();
}

export async function listCourses(filters?: { level?: string; discipline?: string; query?: string }) {
  const query: Record<string, unknown> = { status: 'PUBLISHED' };
  if (filters?.level) query.level = filters.level;
  if (filters?.discipline) query.discipline = filters.discipline;
  if (filters?.query) {
    query.$text = { $search: filters.query };
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

// ── Dashboard Aggregation Workspace ──────────────────────────────────────────

export async function getDashboardWorkspace(role: UserRole, userId: string | Types.ObjectId) {
  const notifications = await listUserNotifications(userId, role);
  const tickets = await SupportTicket.find({ userId }).sort({ createdAt: -1 }).lean();

  if (role === 'STUDENT') {
    const applications = await listStudentApplications(userId);
    const savedCourses = await listSavedCourses(userId);
    const documents = await StudentDocument.find({ studentUserId: userId }).lean();
    return { role, applications, savedCourses, documents, notifications, tickets };
  }

  if (role === 'INSTITUTE') {
    const profile = await InstituteProfile.findOne({ userId }).lean();
    const institute = await Institute.findOne({ ownerUserId: userId }).lean();
    const courses = institute ? await Course.find({ instituteId: institute._id }).lean() : [];
    const courseIds = courses.map((c) => c._id);
    const applications = await Application.find({ courseId: { $in: courseIds } })
      .populate('studentUserId', 'displayName email')
      .populate('courseId', 'title slug level')
      .sort({ submittedAt: -1 })
      .lean();

    return { role, profile, institute, courses, applications, notifications, tickets };
  }

  if (role === 'ADMIN') {
    const totalUsers = await User.countDocuments();
    const pendingInstitutes = await InstituteProfile.find({ approvalStatus: 'PENDING' }).populate('userId', 'displayName email').lean();
    const totalCourses = await Course.countDocuments();
    const totalApplications = await Application.countDocuments();
    const allTickets = await SupportTicket.find().populate('userId', 'displayName email role').sort({ createdAt: -1 }).limit(20).lean();
    const recentAudit = await AuditLog.find().sort({ createdAt: -1 }).limit(20).lean();

    return { role, totalUsers, pendingInstitutes, totalCourses, totalApplications, tickets: allTickets, recentAudit, notifications };
  }

  return { role, notifications, tickets };
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
