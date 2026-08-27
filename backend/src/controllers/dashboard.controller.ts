import type { Response, NextFunction } from 'express';
import {
  getDashboardWorkspace,
  markNotificationAsRead,
  createSupportTicket,
} from '../operations';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

export async function getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await getDashboardWorkspace(req.user!.role, req.user!.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await markNotificationAsRead(req.user!.id, req.params.id);
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}

export async function createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
    const category = typeof req.body?.category === 'string' ? req.body.category.trim() : 'General';

    if (subject.length < 8 || subject.length > 180 || category.length > 60) {
      res.status(400).json({ error: 'Please provide a clear support request (subject at least 8 characters).' });
      return;
    }

    const ticket = await createSupportTicket(req.user!.id, subject, category);
    res.status(201).json({ data: { ticket } });
  } catch (err) {
    next(err);
  }
}
