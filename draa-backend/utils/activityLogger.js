const AppLog = require('../Models/AppLogModel');

/**
 * Helper function to create structured logs inside the database.
 */
const logActivity = async ({
  req = null,
  userId = null,
  userEmail = null,
  userName = null,
  userRole = null,
  actionType = 'other',
  description,
  status = 'success',
  metadata = {}
}) => {
  try {
    let finalUserId = userId;
    let finalUserEmail = userEmail;
    let finalUserName = userName;
    let finalUserRole = userRole || 'guest';
    let ipAddress = 'unknown';
    let userAgent = 'unknown';

    if (req) {
      // Extract IP address safely
      ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'unknown';
      if (ipAddress.startsWith('::ffff:')) {
        ipAddress = ipAddress.replace('::ffff:', '');
      }
      
      // Extract User Agent
      userAgent = req.headers['user-agent'] || 'unknown';

      // Auto-extract logged-in user from headers/session/middleware contexts if not provided
      if (!finalUserId) {
        if (req.user) {
          finalUserId = req.user._id || req.user.id;
          finalUserEmail = req.user.email;
          finalUserName = req.user.name;
          finalUserRole = 'student';
        } else if (req.teacher) {
          finalUserId = req.teacher._id || req.teacher.id;
          finalUserEmail = req.teacher.temail || req.teacher.email;
          finalUserName = req.teacher.tname || req.teacher.name;
          finalUserRole = 'teacher';
        } else if (req.admin) {
          finalUserId = req.admin.adminId || req.admin.id;
          finalUserEmail = req.admin.email || req.admin.aemail;
          finalUserName = req.admin.name || req.admin.aname;
          finalUserRole = 'admin';
        } else if (req.adminId) {
          finalUserId = req.adminId;
          finalUserRole = 'admin';
        }
      }
    }

    const logEntry = new AppLog({
      userId: finalUserId ? String(finalUserId) : undefined,
      userEmail: finalUserEmail,
      userName: finalUserName,
      userRole: finalUserRole,
      actionType,
      description,
      status,
      ipAddress,
      userAgent,
      metadata,
      timestamp: new Date()
    });

    await logEntry.save();
    console.log(`[ACTIVITY LOG] Registered "${description}" for role: ${finalUserRole} | Status: ${status}`);

    // Broadcast real-time activity update to Admins
    try {
      const socketService = require('./socketService');
      const io = socketService.getIO();
      if (io) {
        io.to('admin').emit('new_activity_log', logEntry);
      }
    } catch (socketErr) {
      console.error("Failed to broadcast activity log over socket.io:", socketErr);
    }
  } catch (err) {
    console.error("Failed to save activity log in database:", err);
  }
};

module.exports = { logActivity };
