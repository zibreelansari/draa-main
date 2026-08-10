const { logActivity } = require('../utils/activityLogger');

/**
 * Global audit logger middleware to capture and log state-changing API operations (POST, PUT, DELETE, PATCH).
 */
const auditLogger = (req, res, next) => {
  // Ignore GET requests and the logs/activity API to prevent infinite loops
  if (req.method === 'GET' || req.originalUrl.includes('/admin/logs/activity')) {
    return next();
  }

  res.on('finish', async () => {
    try {
      const status = res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failure';
      
      // Determine action type
      let actionType = 'other';
      const url = req.originalUrl;
      const method = req.method;

      if (url.includes('/login') || url.includes('/register') || url.includes('/logout') || url.includes('/forgot-password')) {
        actionType = 'auth';
      } else if (url.includes('/payment') || url.includes('/purchase') || url.includes('/cart')) {
        actionType = 'purchase';
      } else if (url.includes('/upload') || url.includes('/content') || url.includes('/syllabus') || url.includes('/pyq')) {
        actionType = 'upload';
      } else if (url.startsWith('/api/')) {
        actionType = 'api_hit';
      }

      // Identify who is doing the action
      let actorName = 'Guest';
      let userRole = 'guest';
      let userId = null;
      let userEmail = null;

      if (req.user) {
        actorName = `Student "${req.user.name || req.user.email}"`;
        userRole = 'student';
        userId = req.user._id || req.user.id;
        userEmail = req.user.email;
      } else if (req.teacher) {
        actorName = `Teacher "${req.teacher.tname || req.teacher.temail}"`;
        userRole = 'teacher';
        userId = req.teacher._id || req.teacher.id;
        userEmail = req.teacher.temail || req.teacher.email;
      } else if (req.admin) {
        actorName = `Admin "${req.admin.name || req.admin.email}"`;
        userRole = 'admin';
        userId = req.admin.adminId || req.admin.id;
        userEmail = req.admin.email || req.admin.aemail;
      } else if (req.adminId) {
        actorName = 'Admin';
        userRole = 'admin';
        userId = req.adminId;
      } else if (req.body && (req.body.email || req.body.username)) {
        actorName = `Guest (${req.body.email || req.body.username})`;
      }

      const cleanPath = url.split('?')[0];
      let description = '';

      if (status === 'success') {
        description = `${actorName} successfully executed ${method} on ${cleanPath}`;
        if (url.includes('/login')) {
          description = `${actorName} logged in successfully`;
        } else if (url.includes('/register')) {
          description = `${actorName} registered successfully`;
        }
      } else {
        description = `${actorName} failed to execute ${method} on ${cleanPath} (Status: ${res.statusCode})`;
        if (url.includes('/login')) {
          description = `${actorName} failed login attempt`;
        }
      }

      const metadata = {
        method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        query: req.query,
        body: { ...req.body }
      };

      // Sanitize passwords/tokens from log metadata
      if (metadata.body) {
        delete metadata.body.password;
        delete metadata.body.token;
        delete metadata.body.confirmPassword;
      }

      await logActivity({
        req,
        userId,
        userEmail,
        userName: actorName.replace(/^(Student|Teacher|Admin|Guest)\s+"?|"?$/g, ''), // cleaner userName
        userRole,
        actionType,
        description,
        status,
        metadata
      });
    } catch (err) {
      console.error('Error in auditLogger middleware:', err);
    }
  });

  next();
};

module.exports = auditLogger;
