import type { Response, NextFunction } from 'express';
import { InstituteProfile, SupportTicket } from '@draa/database';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function updateInstituteApproval(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const profile = await InstituteProfile.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: { approvalStatus: status } },
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ error: 'Institute profile not found.' });
      return;
    }

    res.json({ data: { profile } });
  } catch (err) {
    next(err);
  }
}

export async function updateSupportTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );

    if (!ticket) {
      res.status(404).json({ error: 'Support ticket not found.' });
      return;
    }

    res.json({ data: { ticket } });
  } catch (err) {
    next(err);
  }
}
