import type { Request, Response, NextFunction } from 'express';
import type { PublicUser, UserRole } from '@draa/shared';
import { getSessionUser } from '@draa/database';
import { hashToken } from '../utils/security';

export const SESSION_COOKIE = 'draa_session';

export type AuthenticatedRequest = Request & { user?: PublicUser };

export function sessionFromRequest(req: Request): string | undefined {
  const cookieToken = req.cookies?.[SESSION_COOKIE];
  if (typeof cookieToken === 'string') return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return undefined;
}

export function requireAuth(roles?: UserRole[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = sessionFromRequest(req);
      if (!token) {
        res.status(401).json({ error: 'Authentication required.' });
        return;
      }

      const user = await getSessionUser(hashToken(token));
      if (!user) {
        res.status(401).json({ error: 'Invalid or expired session.' });
        return;
      }

      if (roles && !roles.includes(user.role)) {
        res.status(403).json({ error: 'You do not have permission for this action.' });
        return;
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}
