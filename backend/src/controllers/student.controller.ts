import type { Response, NextFunction } from 'express';
import { applicationSchema } from '@draa/shared';
import {
  listStudentApplications,
  createStudentApplication,
  submitFullApplication,
  respondToOfferLetter,
  getApplicationMessages,
  sendApplicationMessage,
  listOrientationModulesWithProgress,
  updateOrientationProgress,
  withdrawApplication,
  toggleSavedCourse,
  updateStudentProfile,
  uploadStudentDocument,
  deleteStudentDocument,
} from '../operations';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applications = await listStudentApplications(req.user!.id);
    res.json({ data: { applications } });
  } catch (err) {
    next(err);
  }
}

export async function submitApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const parsed = applicationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Please check your application details.', details: parsed.error.flatten() });
      return;
    }

    const application = await createStudentApplication(req.user!.id, parsed.data.courseId, parsed.data.statement);
    res.status(201).json({ data: { application } });
  } catch (err: any) {
    if (err?.code === 11000) {
      res.status(409).json({ error: 'An application for this programme already exists.' });
      return;
    }
    next(err);
  }
}

export async function submitWizard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { courseId, statement, academicHistory, passportDetails, englishProficiency, sop, scholarshipRequested } = req.body;
    if (!courseId) {
      res.status(400).json({ error: 'Course ID is required.' });
      return;
    }

    const application = await submitFullApplication(req.user!.id, {
      courseId,
      statement: statement || sop?.text || 'Direct international admission application',
      academicHistory,
      passportDetails,
      englishProficiency,
      sop,
      scholarshipRequested,
    });

    res.status(201).json({ data: { application, message: 'Application submitted successfully.' } });
  } catch (err: any) {
    if (err?.code === 11000) {
      res.status(409).json({ error: 'You have already submitted an application for this programme.' });
      return;
    }
    next(err);
  }
}

export async function handleRespondToOffer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applicationId = String(req.params.id || '');
    const { decision } = req.body; // 'ACCEPT' | 'DECLINE'
    if (!decision || !['ACCEPT', 'DECLINE'].includes(decision)) {
      res.status(400).json({ error: 'Valid decision (ACCEPT or DECLINE) is required.' });
      return;
    }

    const application = await respondToOfferLetter(applicationId, req.user!.id, decision);
    res.json({
      data: {
        application,
        message: decision === 'ACCEPT' ? 'Admission offer accepted! Welcome to India!' : 'Admission offer declined.',
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getStudentMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applicationId = String(req.params.applicationId || '');
    const messages = await getApplicationMessages(applicationId);
    res.json({ data: { messages } });
  } catch (err) {
    next(err);
  }
}

export async function sendStudentMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applicationId = String(req.params.applicationId || '');
    const { message } = req.body;
    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message content cannot be empty.' });
      return;
    }

    const newMsg = await sendApplicationMessage(
      applicationId,
      req.user!.id,
      'STUDENT',
      req.user!.displayName || 'Applicant',
      message.trim()
    );

    res.status(201).json({ data: { message: newMsg } });
  } catch (err) {
    next(err);
  }
}

export async function getOrientation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const modules = await listOrientationModulesWithProgress(req.user!.id);
    res.json({ data: { modules } });
  } catch (err) {
    next(err);
  }
}

export async function saveOrientation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { moduleKey, checklistCompleted, completed } = req.body;
    if (!moduleKey) {
      res.status(400).json({ error: 'moduleKey is required.' });
      return;
    }

    const progress = await updateOrientationProgress(
      req.user!.id,
      moduleKey,
      checklistCompleted || [],
      Boolean(completed)
    );

    res.json({ data: { progress } });
  } catch (err) {
    next(err);
  }
}

export async function handleWithdrawApplication(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const applicationId = String(req.params.id || '');
    const application = await withdrawApplication(req.user!.id, applicationId);
    if (!application) {
      res.status(404).json({ error: 'Application not found or cannot be withdrawn.' });
      return;
    }
    res.json({ data: { application, message: 'Application withdrawn successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function saveCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const courseId = String(req.params.courseId || '');
    const result = await toggleSavedCourse(req.user!.id, courseId, true);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function unsaveCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const courseId = String(req.params.courseId || '');
    const result = await toggleSavedCourse(req.user!.id, courseId, false);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateStudentProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await updateStudentProfile(req.user!.id, req.body);
    res.json({ data: { profile, message: 'Profile updated successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function handleUploadDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { documentType, fileName } = req.body;
    if (!documentType || !fileName) {
      res.status(400).json({ error: 'Document type and file name are required.' });
      return;
    }
    const doc = await uploadStudentDocument(req.user!.id, documentType, fileName, `/uploads/${fileName}`);
    res.json({ data: { document: doc, message: 'Document uploaded successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteDocument(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const documentId = String(req.params.id || '');
    await deleteStudentDocument(req.user!.id, documentId);
    res.json({ data: { message: 'Document deleted successfully.' } });
  } catch (err) {
    next(err);
  }
}
