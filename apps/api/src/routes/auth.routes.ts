import { Router } from 'express';
import { login, registerStudent, registerInstitute, logout, getMe } from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', authLimiter, login);
router.post('/register/student', authLimiter, registerStudent);
router.post('/register/institute', authLimiter, registerInstitute);
router.post('/logout', logout);
router.get('/me', requireAuth(), getMe);

export default router;
