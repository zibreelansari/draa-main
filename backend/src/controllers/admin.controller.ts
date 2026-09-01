import type { Response, NextFunction } from 'express';
import { InstituteProfile, Institute, Course, User, SupportTicket } from '../models/index';
import {
  listAllUsers,
  updateUserStatus,
  getPlatformAnalytics,
  createAuditEntry,
  createNotification,
} from '../operations';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function updateInstituteApproval(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const userId = String(req.params.userId || '');
    const profile = await InstituteProfile.findOneAndUpdate(
      { userId },
      { $set: { approvalStatus: status } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ error: 'Institute profile not found.' });
      return;
    }

    // Also update User status and publish/draft default Institute record
    if (status === 'APPROVED') {
      await User.findByIdAndUpdate(userId, { $set: { status: 'ACTIVE' } });
      await Institute.findOneAndUpdate(
        { ownerUserId: userId },
        {
          $setOnInsert: {
            name: profile.instituteName,
            slug: profile.instituteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            city: profile.city || 'New Delhi',
            state: 'Delhi',
            type: 'University',
            description: `${profile.instituteName} is an officially approved higher education institution on the DRAA Study in India portal.`,
            status: 'PUBLISHED',
          },
        },
        { upsert: true }
      );
    } else if (status === 'REJECTED') {
      await User.findByIdAndUpdate(userId, { $set: { status: 'SUSPENDED' } });
    }

    await createAuditEntry(
      `INSTITUTE_${status}`,
      'InstituteProfile',
      userId,
      req.user?.displayName || 'Admin'
    );

    await createNotification({
      userId,
      title: `Institute Registration ${status}`,
      body: status === 'APPROVED' ? 'Your institution account has been approved. You can now publish programmes.' : 'Your institution registration was not approved.',
      kind: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
    });

    res.json({ data: { profile, message: `Institute ${status.toLowerCase()} successfully.` } });
  } catch (err) {
    next(err);
  }
}

export async function updateSupportTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const ticketId = String(req.params.id || '');
    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );

    if (!ticket) {
      res.status(404).json({ error: 'Support ticket not found.' });
      return;
    }

    await createAuditEntry('SUPPORT_TICKET_UPDATE', 'SupportTicket', ticketId, req.user?.displayName || 'Admin');

    res.json({ data: { ticket, message: 'Ticket status updated.' } });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const role = typeof req.query.role === 'string' ? req.query.role : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const search = typeof req.query.q === 'string' ? req.query.q : undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;

    const result = await listAllUsers({ role, status, search }, page, limit);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function changeUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = String(req.params.id || '');
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be ACTIVE or SUSPENDED.' });
      return;
    }

    const user = await updateUserStatus(userId, status);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    await createAuditEntry(`USER_${status}`, 'User', userId, req.user?.displayName || 'Admin');

    res.json({ data: { user, message: `User status changed to ${status}.` } });
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const analytics = await getPlatformAnalytics();
    res.json({ data: { analytics } });
  } catch (err) {
    next(err);
  }
}

export async function listAdminCourses(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const courses = await Course.find()
      .populate('instituteId', 'name slug city state')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: { courses } });
  } catch (err) {
    next(err);
  }
}

export async function createAdminCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { instituteId, title, discipline, level, durationMonths, tuitionFee, tuitionFeeInr, currency, mode, startDate } = req.body;
    if (!instituteId || !title) {
      res.status(400).json({ error: 'Institution and course title are required.' });
      return;
    }

    const slug = `${title}-${Date.now().toString(36)}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const feeVal = tuitionFee !== undefined ? Number(tuitionFee) : tuitionFeeInr !== undefined ? Number(tuitionFeeInr) : undefined;
    const selectedCurrency = (currency || 'USD').toUpperCase();

    const course = await Course.create({
      instituteId,
      title,
      slug,
      discipline: discipline || 'General Studies',
      level: level || 'UNDERGRADUATE',
      durationMonths: Number(durationMonths) || 12,
      tuitionFee: feeVal,
      tuitionFeeInr: feeVal,
      currency: selectedCurrency,
      mode: mode || 'OFFLINE',
      startDate,
      status: 'PUBLISHED',
    });

    await createAuditEntry('COURSE_CREATE', 'Course', course._id.toString(), req.user?.displayName || 'Admin');
    res.status(201).json({ data: { course, message: 'Course created successfully with currency ' + selectedCurrency + '.' } });
  } catch (err) {
    next(err);
  }
}

export async function manageCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const courseId = String(req.params.id || '');
    const updates = { ...req.body };
    if (updates.tuitionFee !== undefined || updates.tuitionFeeInr !== undefined) {
      const fee = updates.tuitionFee !== undefined ? Number(updates.tuitionFee) : Number(updates.tuitionFeeInr);
      updates.tuitionFee = fee;
      updates.tuitionFeeInr = fee;
    }
    if (updates.currency) {
      updates.currency = updates.currency.toUpperCase();
    }
    const course = await Course.findByIdAndUpdate(courseId, { $set: updates }, { new: true });
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }
    await createAuditEntry('COURSE_UPDATE', 'Course', courseId, req.user?.displayName || 'Admin');
    res.json({ data: { course, message: 'Course updated successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const courseId = String(req.params.id || '');
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }
    await createAuditEntry('COURSE_DELETE', 'Course', courseId, req.user?.displayName || 'Admin');
    res.json({ data: { message: 'Course deleted successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function getFraudQueue(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { getAdminFraudQueue } = await import('../operations');
    const flagged = await getAdminFraudQueue();
    res.json({ data: { applications: flagged } });
  } catch (err) {
    next(err);
  }
}

export async function updateFraudFlag(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { flagApplication } = await import('../operations');
    const applicationId = String(req.params.id || '');
    const { flagged, reason } = req.body;
    const app = await flagApplication(
      applicationId,
      Boolean(flagged),
      reason || '',
      req.user?.displayName || 'Admin'
    );
    res.json({ data: { application: app, message: 'Fraud flag updated.' } });
  } catch (err) {
    next(err);
  }
}
