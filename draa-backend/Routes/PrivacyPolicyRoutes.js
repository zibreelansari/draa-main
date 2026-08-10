const express = require('express');
const router = express.Router();
const privacyPolicyController = require('../Controllers/PrivacyPolicyController');

// You might want to add authentication middleware
// const authMiddleware = require('../middleware/auth');
// const adminMiddleware = require('../middleware/admin');

//  Public routes (no authentication required)
router.get('/active', privacyPolicyController.getActivePrivacyPolicy);
router.get('/versions', privacyPolicyController.getPrivacyPolicyVersions);
router.post('/:id/accept', privacyPolicyController.recordAcceptance);

//  Admin routes (authentication required)
// Add authentication middleware for these routes
router.post('/', /* authMiddleware, adminMiddleware, */ privacyPolicyController.createPrivacyPolicy);
router.get('/', /* authMiddleware, adminMiddleware, */ privacyPolicyController.getAllPrivacyPolicies);
router.get('/:id', /* authMiddleware, adminMiddleware, */ privacyPolicyController.getPrivacyPolicyById);
router.put('/:id', /* authMiddleware, adminMiddleware, */ privacyPolicyController.updatePrivacyPolicy);
router.post('/:id/activate', /* authMiddleware, adminMiddleware, */ privacyPolicyController.activatePrivacyPolicy);
router.delete('/:id', /* authMiddleware, adminMiddleware, */ privacyPolicyController.deletePrivacyPolicy);
router.get('/:id/analytics', /* authMiddleware, adminMiddleware, */ privacyPolicyController.getPrivacyPolicyAnalytics);

module.exports = router;
