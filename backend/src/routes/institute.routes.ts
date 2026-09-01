import { Router } from 'express';
import {
  updateApplicationStatus,
  bulkUpdateApplications,
  getApplicantDetail,
  handleIssueOffer,
  handleScoreApplicant,
  getInstituteMessages,
  sendInstituteMessage,
  createProgramme,
  updateProgramme,
  updateProgrammeStatus,
  deleteProgramme,
  updateInstituteProfile,
} from '../controllers/institute.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth(['INSTITUTE']));

router.patch('/applications/bulk', bulkUpdateApplications);
router.patch('/applications/:id', updateApplicationStatus);
router.get('/applicants/:id', getApplicantDetail);

// Formal Offer Letter & Scoring
router.post('/applications/:id/offer', handleIssueOffer);
router.post('/applications/:id/score', handleScoreApplicant);

// Admissions Messaging
router.get('/applications/:applicationId/messages', getInstituteMessages);
router.post('/applications/:applicationId/messages', sendInstituteMessage);

// Programmes & Profile
router.post('/programmes', createProgramme);
router.put('/programmes/:id', updateProgramme);
router.patch('/programmes/:id/status', updateProgrammeStatus);
router.delete('/programmes/:id', deleteProgramme);
router.put('/profile', updateInstituteProfile);

export default router;
