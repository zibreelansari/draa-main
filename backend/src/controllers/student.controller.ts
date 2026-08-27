import type { Response, NextFunction } from 'express';
import { applicationSchema } from '@draa/shared';
import {
  listStudentApplications,
  createStudentApplication,
  toggleSavedCourse,
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

export async function saveCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await toggleSavedCourse(req.user!.id, req.params.courseId, true);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function removeSavedCourse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await toggleSavedCourse(req.user!.id, req.params.courseId, false);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}
