import { Router } from 'express';
import { getDashboard, markNotificationRead, createTicket } from '../controllers/dashboard.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth());

router.get('/', getDashboard);
router.post('/notifications/:id/read', markNotificationRead);
router.post('/support', createTicket);

export default router;
