import { Router } from 'express';
import { updateInstituteApproval, updateSupportTicket } from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth(['ADMIN']));

router.patch('/institutes/:userId/approval', updateInstituteApproval);
router.patch('/support/:id', updateSupportTicket);

export default router;
