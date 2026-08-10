const express = require('express');
const { universalAuth } = require('../Middlewares/universalAuth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../Controllers/NotificationController');

const router = express.Router();

// Apply auth middleware to protect all notification endpoints
router.use(universalAuth);

// Fetch notifications
router.get('/', getNotifications);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Mark specific notification as read
router.put('/:id/read', markAsRead);

// Clear all notifications
router.delete('/clear-all', clearAllNotifications);

// Delete specific notification
router.delete('/:id', deleteNotification);

module.exports = router;
