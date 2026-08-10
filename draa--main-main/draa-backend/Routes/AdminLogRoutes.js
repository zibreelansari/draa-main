const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AppLog = require('../Models/AppLogModel');
const adminAuth = require('../Middlewares/adminAuth.middleware');
const { logActivity } = require('../utils/activityLogger');
const UserModel = require('../Models/UserModel');
const TeacherModel = require('../Models/TeacherModel');

// 0. GET /api/v1/admin/logs/activity (Public health check — many clients probe this)
router.get('/activity', async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Activity logging endpoint is live. Use POST to record an activity.',
      method: 'POST'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// 1. GET /api/v1/admin/logs (Protected - Admin Only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      userRole,
      actionType,
      status
    } = req.query;

    const query = {};

    // Filters
    if (userRole && userRole !== 'all') {
      query.userRole = userRole;
    }
    if (actionType && actionType !== 'all') {
      query.actionType = actionType;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    // Text search filter
    if (search && search.trim() !== '') {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    const skipIndex = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AppLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skipIndex)
        .limit(parseInt(limit)),
      AppLog.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching admin logs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 2. GET /api/v1/admin/logs/stats (Protected - Admin Only)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalCount = await AppLog.countDocuments();
    const successCount = await AppLog.countDocuments({ status: 'success' });
    const failureCount = await AppLog.countDocuments({ status: 'failure' });

    // Group count by actionType
    const actionStats = await AppLog.aggregate([
      { $group: { _id: '$actionType', count: { $sum: 1 } } }
    ]);

    const formattedActionStats = actionStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      stats: {
        total: totalCount,
        success: successCount,
        failure: failureCount,
        successRate: totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 100,
        actions: {
          page_visit: formattedActionStats.page_visit || 0,
          purchase: formattedActionStats.purchase || 0,
          upload: formattedActionStats.upload || 0,
          auth: formattedActionStats.auth || 0,
          api_hit: formattedActionStats.api_hit || 0,
          system_event: formattedActionStats.system_event || 0,
          other: formattedActionStats.other || 0
        }
      }
    });
  } catch (error) {
    console.error("Error fetching logs stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 3. POST /api/v1/admin/logs/activity (Semi-Public - records client-side logs)
router.post('/activity', async (req, res) => {
  try {
    const { actionType, description, metadata = {} } = req.body;

    if (!description) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    // Try parsing optional Auth header to extract user details
    const authHeader = req.headers.authorization;
    let userId = null;
    let userEmail = null;
    let userName = null;
    let userRole = 'guest';

    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.decode(token);
        if (decoded) {
          if (decoded.role === 'admin' || decoded.adminId) {
            userId = decoded.adminId;
            userRole = 'admin';
            userName = decoded.name || 'Admin';
          } else if (decoded.role === 'teacher' || decoded.teacherId) {
            userId = decoded.teacherId;
            userRole = 'teacher';
            const teacher = await TeacherModel.findById(userId).select('tname temail');
            if (teacher) {
              userName = teacher.tname;
              userEmail = teacher.temail;
            }
          } else {
            userId = decoded.userId || decoded.id;
            userRole = 'student';
            const student = await UserModel.findById(userId).select('name email');
            if (student) {
              userName = student.name;
              userEmail = student.email;
            }
          }
        }
      } catch (err) {
        console.warn("JWT Decoding failed in log endpoint, logging as guest", err.message);
      }
    }

    await logActivity({
      req,
      userId,
      userEmail,
      userName,
      userRole,
      actionType,
      description,
      status: 'success',
      metadata
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error writing client log:", error);
    res.status(500).json({ success: false, message: 'Failed to save log' });
  }
});

module.exports = router;
