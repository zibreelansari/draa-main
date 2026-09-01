import type { Response, NextFunction } from 'express';
import { Application, Course, Institute, StudentProfile } from '../models/index';
import {
  updateInstituteProfileData,
  createNotification,
  issueOfferLetter,
  scoreApplicant,
  getApplicationMessages,
  sendApplicationMessage,
} from '../operations';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function handleIssueOffer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applicationId = String(req.params.id || '');
    const { tuitionFee, currency, scholarshipWaiverPercent, reportingDate, conditions } = req.body;

    const app = await issueOfferLetter(
      applicationId,
      {
        tuitionFee: Number(tuitionFee),
        currency: currency || 'USD',
        scholarshipWaiverPercent: Number(scholarshipWaiverPercent) || 0,
        reportingDate,
        conditions,
      },
      req.user?.displayName || 'Institute Admissions Officer'
    );

    res.json({ data: { application: app, message: 'Formal admission offer letter issued successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function handleScoreApplicant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applicationId = String(req.params.id || '');
    const { academicScore, sopScore, languageScore, reviewerNotes } = req.body;

    const app = await scoreApplicant(
      applicationId,
      {
        academicScore: Number(academicScore),
        sopScore: Number(sopScore),
        languageScore: Number(languageScore),
        reviewerNotes,
      },
      req.user?.displayName || 'Evaluator'
    );

    res.json({ data: { application: app, message: 'Candidate evaluation recorded successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function getInstituteMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applicationId = String(req.params.applicationId || '');
    const messages = await getApplicationMessages(applicationId);
    res.json({ data: { messages } });
  } catch (err) {
    next(err);
  }
}

export async function sendInstituteMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applicationId = String(req.params.applicationId || '');
    const { message } = req.body;
    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    const newMsg = await sendApplicationMessage(
      applicationId,
      req.user!.id,
      'INSTITUTE',
      req.user!.displayName || 'Admissions Team',
      message.trim()
    );

    res.status(201).json({ data: { message: newMsg } });
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status, note } = req.body;
    const applicationId = String(req.params.id || '');
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { $set: { status, decisionNote: note, updatedAt: new Date() } },
      { new: true }
    );

    if (!application) {
      res.status(404).json({ error: 'Application not found.' });
      return;
    }

    // Send notification to the student
    await createNotification({
      userId: application.studentUserId,
      title: `Application Status Updated: ${status}`,
      body: note || `Your application status is now ${status}. Check your dashboard for details.`,
      kind: status === 'OFFERED' ? 'SUCCESS' : status === 'DECLINED' ? 'WARNING' : 'INFO',
    });

    res.json({ data: { application, message: `Application status updated to ${status}.` } });
  } catch (err) {
    next(err);
  }
}

export async function bulkUpdateApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { applicationIds, status, note } = req.body;
    if (!Array.isArray(applicationIds) || !applicationIds.length) {
      res.status(400).json({ error: 'Please provide application IDs to update.' });
      return;
    }

    await Application.updateMany(
      { _id: { $in: applicationIds } },
      { $set: { status, decisionNote: note, updatedAt: new Date() } }
    );

    res.json({ data: { success: true, count: applicationIds.length, message: `${applicationIds.length} applications updated to ${status}.` } });
  } catch (err) {
    next(err);
  }
}

export async function getApplicantDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applicantId = String(req.params.id || '');
    const application = await Application.findById(applicantId)
      .populate('studentUserId', 'displayName email createdAt')
      .populate('courseId')
      .lean();

    if (!application) {
      res.status(404).json({ error: 'Applicant record not found.' });
      return;
    }

    const studentProfile = await StudentProfile.findOne({ userId: (application.studentUserId as any)?._id }).lean();

    res.json({
      data: {
        application,
        studentProfile,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createProgramme(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const institute = await Institute.findOne({ ownerUserId: req.user!.id });
    if (!institute) {
      res.status(400).json({ error: 'No institution profile linked to your account.' });
      return;
    }

    const { title, discipline, level, durationMonths, tuitionFee, tuitionFeeInr, currency, mode, startDate } = req.body;
    const slug = `${title}-${Date.now().toString(36)}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const feeVal = tuitionFee !== undefined ? Number(tuitionFee) : tuitionFeeInr !== undefined ? Number(tuitionFeeInr) : undefined;
    const selectedCurrency = (currency || 'USD').toUpperCase();

    const programme = await Course.create({
      instituteId: institute._id,
      title,
      slug,
      discipline,
      level,
      durationMonths: Number(durationMonths) || 12,
      tuitionFee: feeVal,
      tuitionFeeInr: feeVal,
      currency: selectedCurrency,
      mode: mode || 'OFFLINE',
      startDate,
      status: 'PUBLISHED',
    });

    res.status(201).json({ data: { programme, message: 'Programme created and published.' } });
  } catch (err) {
    next(err);
  }
}

export async function updateProgramme(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const programmeId = String(req.params.id || '');
    const { title, discipline, level, durationMonths, tuitionFee, tuitionFeeInr, currency, mode, startDate, status } = req.body;
    const feeVal = tuitionFee !== undefined ? Number(tuitionFee) : tuitionFeeInr !== undefined ? Number(tuitionFeeInr) : undefined;

    const programme = await Course.findByIdAndUpdate(
      programmeId,
      {
        $set: {
          ...(title && { title }),
          ...(discipline && { discipline }),
          ...(level && { level }),
          ...(durationMonths && { durationMonths: Number(durationMonths) }),
          ...(feeVal !== undefined && { tuitionFee: feeVal, tuitionFeeInr: feeVal }),
          ...(currency && { currency: currency.toUpperCase() }),
          ...(mode && { mode }),
          ...(startDate && { startDate }),
          ...(status && { status }),
        },
      },
      { new: true }
    );

    if (!programme) {
      res.status(404).json({ error: 'Programme not found.' });
      return;
    }

    res.json({ data: { programme, message: 'Programme updated successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function updateProgrammeStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const programmeId = String(req.params.id || '');
    const programme = await Course.findByIdAndUpdate(
      programmeId,
      { $set: { status } },
      { new: true }
    );

    if (!programme) {
      res.status(404).json({ error: 'Programme not found.' });
      return;
    }

    res.json({ data: { programme, message: `Programme status changed to ${status}.` } });
  } catch (err) {
    next(err);
  }
}

export async function deleteProgramme(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const programmeId = String(req.params.id || '');
    const programme = await Course.findByIdAndUpdate(
      programmeId,
      { $set: { status: 'ARCHIVED' } },
      { new: true }
    );

    res.json({ data: { programme, message: 'Programme archived.' } });
  } catch (err) {
    next(err);
  }
}

export async function updateInstituteProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { instituteName, contactName, city, website, description } = req.body;
    const profile = await updateInstituteProfileData(req.user!.id, {
      instituteName: typeof instituteName === 'string' ? instituteName.trim() : undefined,
      contactName: typeof contactName === 'string' ? contactName.trim() : undefined,
      city: typeof city === 'string' ? city.trim() : undefined,
      website: typeof website === 'string' ? website.trim() : undefined,
      description: typeof description === 'string' ? description.trim() : undefined,
    });

    res.json({ data: { profile, message: 'Institute profile updated successfully.' } });
  } catch (err) {
    next(err);
  }
}
