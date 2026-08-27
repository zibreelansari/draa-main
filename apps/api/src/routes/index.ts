import { Router } from 'express';
import authRoutes from './auth.routes';
import catalogRoutes from './catalog.routes';
import studentRoutes from './student.routes';
import instituteRoutes from './institute.routes';
import adminRoutes from './admin.routes';
import dashboardRoutes from './dashboard.routes';
import contactRoutes from './contact.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok', service: 'draa-unified-api', timestamp: new Date().toISOString() } });
});

router.use('/auth', authRoutes);
router.use('/catalog', catalogRoutes);
router.use('/student', studentRoutes);
router.use('/institute', instituteRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/contact', contactRoutes);

export default router;
