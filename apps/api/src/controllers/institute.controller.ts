import type { Response, NextFunction } from 'express';
import { Application, Course, Institute } from '@draa/database';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function updateApplicationStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status, note } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { $set: { status, decisionNote: note, updatedAt: new Date() } },
      { new: true }
    );

    if (!application) {
      res.status(404).json({ error: 'Application not found.' });
      return;
    }

    res.json({ data: { application } });
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

    const { title, discipline, level, durationMonths, tuitionFeeInr, mode, startDate } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const programme = await Course.create({
      instituteId: institute._id,
      title,
      slug,
      discipline,
      level,
      durationMonths: Number(durationMonths),
      tuitionFeeInr: tuitionFeeInr ? Number(tuitionFeeInr) : undefined,
      mode: mode || 'OFFLINE',
      startDate,
      status: 'PUBLISHED',
    });

    res.status(201).json({ data: { programme } });
  } catch (err) {
    next(err);
  }
}

export async function updateProgrammeStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const programme = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!programme) {
      res.status(404).json({ error: 'Programme not found.' });
      return;
    }

    res.json({ data: { programme } });
  } catch (err) {
    next(err);
  }
}
