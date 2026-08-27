import { Router } from 'express';
import { updateApplicationStatus, createProgramme, updateProgrammeStatus } from '../controllers/institute.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth(['INSTITUTE']));

router.patch('/applications/:id', updateApplicationStatus);
router.post('/programmes', createProgramme);
router.patch('/programmes/:id/status', updateProgrammeStatus);

export default router;
