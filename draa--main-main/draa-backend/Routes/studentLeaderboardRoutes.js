const express = require('express');
const router = express.Router();
const StudentLeaderboardController = require('../Controllers/StudentLeaderboardController');
const { authMiddleware } = require('../Middlewares/student.auth.middleware');

// Protect all routes with auth middleware
router.use(authMiddleware);

// Get leaderboard (public - no auth needed for viewing)
router.get('/', async (req, res, next) => {
  // Temporarily skip auth for leaderboard viewing
  try {
    await require('../Controllers/StudentLeaderboardController').getLeaderboard(req, res);
  } catch (error) {
    next(error);
  }
});

// Get leaderboard (authenticated)
router.get('/list', StudentLeaderboardController.getLeaderboard);

// Get weekly leaderboard
router.get('/weekly', StudentLeaderboardController.getLeaderboard);

// Get monthly leaderboard
router.get('/monthly', StudentLeaderboardController.getLeaderboard);

// Get student's rank
router.get('/rank/:studentId', StudentLeaderboardController.getStudentRank);

// Get top by category
router.get('/top/:category', StudentLeaderboardController.getTopByCategory);

// Get friends comparison
router.get('/compare/:studentId', StudentLeaderboardController.getFriendsComparison);

// Get achievements
router.get('/achievements/:studentId', StudentLeaderboardController.getAchievements);

// Award badge (admin or system)
router.post('/badge/:studentId', StudentLeaderboardController.awardBadge);

module.exports = router;