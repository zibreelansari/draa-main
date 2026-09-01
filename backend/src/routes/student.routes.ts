import { Router } from 'express';
import {
  getApplications,
  submitApplication,
  submitWizard,
  handleRespondToOffer,
  getStudentMessages,
  sendStudentMessage,
  getOrientation,
  saveOrientation,
  handleWithdrawApplication,
  saveCourse,
  unsaveCourse,
  handleUpdateStudentProfile,
  handleUploadDocument,
  handleDeleteDocument,
} from '../controllers/student.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth(['STUDENT']));

router.get('/applications', getApplications);
router.post('/applications', submitApplication);
router.post('/applications/wizard', submitWizard);
router.post('/applications/:id/offer-response', handleRespondToOffer);
router.get('/applications/:applicationId/messages', getStudentMessages);
router.post('/applications/:applicationId/messages', sendStudentMessage);

// Orientation LMS
router.get('/orientation', getOrientation);
router.post('/orientation/progress', saveOrientation);

// Saved courses & Profile
router.patch('/applications/:id/withdraw', handleWithdrawApplication);
router.post('/saved-courses/:courseId', saveCourse);
router.delete('/saved-courses/:courseId', unsaveCourse);
router.put('/profile', handleUpdateStudentProfile);
router.post('/documents', handleUploadDocument);
router.delete('/documents/:id', handleDeleteDocument);

export default router;
