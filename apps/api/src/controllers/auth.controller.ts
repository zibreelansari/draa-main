import type { Request, Response, NextFunction } from 'express';
import {
  loginSchema,
  studentRegistrationSchema,
  instituteRegistrationSchema,
  type PublicUser,
} from '@draa/shared';
import {
  findUserByEmailAndRole,
  createSession,
  deleteSession,
  createStudentUser,
  createInstituteUser,
} from '@draa/database';
import { config } from '../config';
import { hashPassword, verifyPassword, createSessionToken, hashToken } from '../utils/security';
import { SESSION_COOKIE, sessionFromRequest, type AuthenticatedRequest } from '../middleware/auth.middleware';

export function setSessionCookie(res: Response, token: string) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.secureCookie,
    maxAge: config.sessionDays * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Please check your login details.', details: parsed.error.flatten() });
      return;
    }

    const account = await findUserByEmailAndRole(parsed.data.email, parsed.data.role);
    const valid = account ? verifyPassword(parsed.data.password, account.passwordHash) : false;

    if (!account || !valid || account.status !== 'ACTIVE') {
      res.status(401).json({ error: 'Email, password or selected account type is incorrect.' });
      return;
    }

    const { token, tokenHash } = createSessionToken();
    const expiresAt = new Date(Date.now() + config.sessionDays * 86_400_000);
    await createSession(account._id, tokenHash, expiresAt);
    setSessionCookie(res, token);

    const user: PublicUser = {
      id: account._id.toString(),
      email: account.email,
      role: account.role,
      displayName: account.displayName,
    };

    res.json({ data: { user, token } });
  } catch (err) {
    next(err);
  }
}

export async function registerStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = studentRegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Please check the registration details.', details: parsed.error.flatten() });
      return;
    }

    const existing = await findUserByEmailAndRole(parsed.data.email, 'STUDENT');
    if (existing) {
      res.status(409).json({ error: 'A student account already exists for this email.' });
      return;
    }

    const user = await createStudentUser(parsed.data, hashPassword(parsed.data.password));
    res.status(201).json({ data: { user, message: 'Student account created. You can now log in.' } });
  } catch (err) {
    next(err);
  }
}

export async function registerInstitute(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = instituteRegistrationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Please check the registration details.', details: parsed.error.flatten() });
      return;
    }

    const existing = await findUserByEmailAndRole(parsed.data.email, 'INSTITUTE');
    if (existing) {
      res.status(409).json({ error: 'An institute account already exists for this email.' });
      return;
    }

    const user = await createInstituteUser(parsed.data, hashPassword(parsed.data.password));
    res.status(201).json({ data: { user, message: 'Institute registration received for administrator review.' } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = sessionFromRequest(req);
    if (token) {
      await deleteSession(hashToken(token));
    }
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  res.json({ data: { user: req.user } });
}
