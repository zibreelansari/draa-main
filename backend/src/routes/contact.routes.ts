import { Router } from 'express';
import { submitContact, subscribe } from '../controllers/contact.controller';
import { contactLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/inquiry', contactLimiter, submitContact);
router.post('/newsletter', contactLimiter, subscribe);

export default router;
