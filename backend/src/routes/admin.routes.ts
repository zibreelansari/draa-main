import { Router } from 'express';
import {
  updateInstituteApproval,
  updateSupportTicket,
  getUsers,
  changeUserStatus,
  getAnalytics,
  manageCourse,
  listAdminCourses,
  createAdminCourse,
  deleteAdminCourse,
  getFraudQueue,
  updateFraudFlag,
} from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth(['ADMIN']));

router.patch('/institutes/:userId/approval', updateInstituteApproval);
router.patch('/support/:id', updateSupportTicket);
router.get('/users', getUsers);
router.patch('/users/:id/status', changeUserStatus);
router.get('/analytics', getAnalytics);

// Course Management
router.get('/courses', listAdminCourses);
router.post('/courses', createAdminCourse);
router.patch('/courses/:id', manageCourse);
router.delete('/courses/:id', deleteAdminCourse);

// Fraud & Compliance Queue
router.get('/fraud-queue', getFraudQueue);
router.patch('/fraud-queue/:id', updateFraudFlag);

export default router;
