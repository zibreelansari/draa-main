import { Router } from 'express';
import { getApplications, submitApplication, saveCourse, removeSavedCourse } from '../controllers/student.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth(['STUDENT']));

router.get('/applications', getApplications);
router.post('/applications', submitApplication);
router.post('/saved-courses/:courseId', saveCourse);
router.delete('/saved-courses/:courseId', removeSavedCourse);

export default router;
