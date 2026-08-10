// Routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../Middlewares/student.auth.middleware');
const wishlistCtrl = require('../Controllers/wishlistController');

// ============================================================
// EXISTING ROUTES  endpoints unchanged (order preserved)
// ============================================================

// Add item to wishlist
// POST /wishlist/add
// Body: { item_type, item_id, priority?, notes? }
router.post('/add', authMiddleware, wishlistCtrl.addToWishlist);

// Remove item from wishlist
// DELETE /wishlist/remove
// Body: { item_type, item_id }
router.delete('/remove', authMiddleware, wishlistCtrl.removeFromWishlist);

// Get current user's wishlist
// GET /wishlist/my
// Query: ?type=book|course|test_series  &sort=newest|oldest|price_asc|price_desc  &page=1  &limit=20
router.get('/my', authMiddleware, wishlistCtrl.getMyWishlist);

// ============================================================
// NEW ENHANCED ROUTES
// ============================================================

// Check if a specific item is in wishlist
// GET /wishlist/check?item_type=book&item_id=xxx
router.get('/check', authMiddleware, wishlistCtrl.checkWishlist);

// Update priority or notes on a wishlist item
// PATCH /wishlist/update
// Body: { item_type, item_id, priority?, notes? }
router.patch('/update', authMiddleware, wishlistCtrl.updateWishlistItem);

// Re-fetch latest snapshot data from the source model
// POST /wishlist/refresh
// Body: { item_type, item_id }
router.post('/refresh', authMiddleware, wishlistCtrl.refreshSnapshot);

// Clear entire wishlist for the current user
// DELETE /wishlist/clear
router.delete('/clear', authMiddleware, wishlistCtrl.clearWishlist);

module.exports = router;