const express = require('express');
const router = express.Router();
const footerController = require('../Controllers/FooterControllers');
const adminAuth = require('../Middlewares/adminAuth.middleware');

// Public route to get footer data
router.get('/', footerController.getFooterData);

// Admin routes for sections
router.get('/sections', adminAuth, footerController.getAllFooterSections);
router.post('/sections', adminAuth, footerController.createFooterSection);
router.put('/sections/:id', adminAuth, footerController.updateFooterSection);
router.delete('/sections/:id', adminAuth, footerController.deleteFooterSection);

// Admin routes for links within sections
router.post('/sections/:sectionId/links', adminAuth, footerController.addFooterLink);
router.put('/sections/:sectionId/links/:linkId', adminAuth, footerController.updateFooterLink);
router.delete('/sections/:sectionId/links/:linkId', adminAuth, footerController.deleteFooterLink);

module.exports = router;
