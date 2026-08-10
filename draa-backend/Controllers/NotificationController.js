const Notification = require('../Models/NotificationModel');

// @desc    Get notifications based on user role (Admin, Teacher, Student)
// @route   GET /api/v1/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    let filter = {};
    let userId = null;

    if (req.role ==='admin') {
      filter.recipient ='admin';
    } else if (req.role ==='teacher') {
      userId = req.teacher._id.toString();
      filter.$or = [
        { recipient: userId },
        { recipient:'all_teachers' },
        { recipient:'all' }
      ];
      filter.deletedBy = { $ne: userId };
    } else if (req.role ==='student') {
      userId = req.user._id.toString();
      filter.$or = [
        { recipient: userId },
        { recipient:'all_students' },
        { recipient:'all' }
      ];
      filter.deletedBy = { $ne: userId };
    } else {
      return res.status(400).json({ success: false, message:'Invalid or unknown user role' });
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    // Map notifications to dynamically calculate `isRead` for multi-recipient notifications
    const mappedNotifications = notifications.map(notif => {
      const notifObj = notif.toObject();
      
      if (notif.recipient ==='all_students' || notif.recipient ==='all' || notif.recipient ==='all_teachers') {
        notifObj.isRead = notif.readBy.some(id => id.toString() === userId);
      }
      
      return notifObj;
    });

    res.status(200).json({
      success: true,
      count: mappedNotifications.length,
      data: mappedNotifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message:'Failed to fetch notifications', error: error.message });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    let userId = null;

    if (req.role ==='teacher') {
      userId = req.teacher._id;
    } else if (req.role ==='student') {
      userId = req.user._id;
    } else if (req.role ==='admin') {
      userId = req.adminId; // can be null/string
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message:'Notification not found' });
    }

    // Handle global multi-recipient notifications
    if (notification.recipient ==='all_students' || notification.recipient ==='all' || notification.recipient ==='all_teachers') {
      if (userId) {
        notification.readBy.addToSet(userId);
        await notification.save();
      }
    } else {
      notification.isRead = true;
      await notification.save();
    }

    res.status(200).json({ success: true, message:'Notification marked as read', data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message:'Failed to mark notification as read', error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    let userId = null;

    if (req.role ==='admin') {
      await Notification.updateMany({ recipient:'admin', isRead: false }, { isRead: true });
    } else if (req.role ==='teacher') {
      userId = req.teacher._id;
      // Mark direct notifications as read
      await Notification.updateMany({ recipient: userId.toString(), isRead: false }, { isRead: true });
      // Add teacher to global notifications' readBy
      await Notification.updateMany(
        { recipient: { $in: ['all_teachers','all'] }, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
    } else if (req.role ==='student') {
      userId = req.user._id;
      // Mark direct notifications as read
      await Notification.updateMany({ recipient: userId.toString(), isRead: false }, { isRead: true });
      // Add student to global notifications' readBy
      await Notification.updateMany(
        { recipient: { $in: ['all_students','all'] }, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
    }

    res.status(200).json({ success: true, message:'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message:'Failed to mark notifications as read', error: error.message });
  }
};

// @desc    Delete a notification (Admin only or check ownership)
// @route   DELETE /api/v1/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message:'Notification not found' });
    }

    // Handle global multi-recipient notifications soft delete per user
    if (notification.recipient === 'all_students' || notification.recipient === 'all_teachers' || notification.recipient === 'all') {
      let userId = req.role === 'teacher' ? req.teacher._id : (req.role === 'student' ? req.user._id : null);
      if (userId) {
        notification.deletedBy = notification.deletedBy || [];
        notification.deletedBy.addToSet(userId);
        await notification.save();
        return res.status(200).json({ success: true, message: 'Notification deleted successfully' });
      }
    }

    // Check permissions: Admin can delete any. If Teacher/Student, they must be the recipient
    if (req.role !=='admin') {
      let userId = req.role ==='teacher' ? req.teacher._id.toString() : req.user._id.toString();
      if (notification.recipient !== userId) {
        return res.status(403).json({ success: false, message:'Access denied: cannot delete this notification' });
      }
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json({ success: true, message:'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message:'Failed to delete notification', error: error.message });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    let userId = null;

    if (req.role === 'admin') {
      await Notification.deleteMany({ recipient: 'admin' });
    } else if (req.role === 'teacher') {
      userId = req.teacher._id;
      await Notification.updateMany(
        { recipient: { $in: ['all_teachers', 'all'] }, deletedBy: { $ne: userId } },
        { $addToSet: { deletedBy: userId } }
      );
      await Notification.deleteMany({ recipient: userId.toString() });
    } else if (req.role === 'student') {
      userId = req.user._id;
      await Notification.updateMany(
        { recipient: { $in: ['all_students', 'all'] }, deletedBy: { $ne: userId } },
        { $addToSet: { deletedBy: userId } }
      );
      await Notification.deleteMany({ recipient: userId.toString() });
    }

    res.status(200).json({ success: true, message: 'All notifications cleared successfully' });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to clear notifications', error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
