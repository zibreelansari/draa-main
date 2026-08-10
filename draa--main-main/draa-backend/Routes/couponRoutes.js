const express = require('express');
const router = express.Router();
const couponController = require('../Controllers/CouponController');
const adminAuth = require('../Middlewares/adminAuth.middleware');
const { authMiddleware: studentAuth } = require('../Middlewares/student.auth.middleware');

// Admin Coupon Management
router.post('/admin', adminAuth, couponController.createCoupon);
router.get('/admin', adminAuth, couponController.getCoupons);
router.put('/admin/:id', adminAuth, couponController.updateCoupon);
router.delete('/admin/:id', adminAuth, couponController.deleteCoupon);
router.post('/admin/assign', adminAuth, couponController.assignCoupon);
router.get('/admin/assignments', adminAuth, couponController.getAssignments);

// Student View & Apply
router.get('/my-coupons', studentAuth, couponController.getMyCoupons);
router.post('/verify', couponController.verifyCoupon);

module.exports = router;
