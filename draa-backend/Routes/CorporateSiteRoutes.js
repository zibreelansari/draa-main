const express = require('express');
const adminAuth = require('../Middlewares/adminAuth.middleware');
const { authMiddleware: studentAuth } = require('../Middlewares/student.auth.middleware');
const controller = require('../Controllers/CorporateSiteController');
const studyIndiaProfile = require('../Controllers/StudyIndiaProfileController');

const router = express.Router();

router.get('/navigation', controller.getNavigation);
router.get('/pages', controller.getPages);
router.get('/pages/:slug', controller.getPageBySlug);

router.get('/study-india/profile', studentAuth, studyIndiaProfile.getMyProfile);
router.put('/study-india/profile', studentAuth, studyIndiaProfile.saveMyProfile);

router.put('/pages/:slug', adminAuth, controller.upsertPage);
router.delete('/pages/:slug', adminAuth, controller.removePageOverride);

module.exports = router;
