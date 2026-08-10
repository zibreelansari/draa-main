const jwt = require("jsonwebtoken");
const userModel = require("../Models/UserModel");
const socketService = require("../utils/socketService");

//  Use env
const jwtSecret = process.env.JWT_SECRET;

const userPromises = new Map();
const CACHE_TTL = 5000; // 5 seconds

const authMiddleware = async (req, res, next) => {
  try {
    let token ='';
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message:"Unauthorized" });
    }
    const decoded = jwt.verify(token, jwtSecret);

    //  ROLE CHECK: Block Teachers and Admins from student-only actions
    if (decoded.role ==="teacher" || decoded.role ==="admin") {
      return res.status(403).json({
        success: false,
        message: `Access Denied: ${decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1)}s are not permitted to perform student-specific actions like purchasing, cart, or wishlist.`
      });
    }

    const studentId = decoded.userId;
    const now = Date.now();
    let cached = userPromises.get(studentId);

    if (!cached || (now - cached.timestamp > CACHE_TTL)) {
      const promise = userModel.findById(studentId).exec();
      cached = { promise, timestamp: now };
      userPromises.set(studentId, cached);
    }

    let user = await cached.promise;
    if (!user) {
      userPromises.delete(studentId);
      return res.status(401).json({ success: false, message:"User not found" });
    }


    if ((decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) {
      return res.status(401).json({
        success: false,
        message:"Session expired. Please login again.",
      });
    }

    // Verify the device session is still active
    if (decoded.deviceId && (!user.devices || !user.devices.some(d => d.deviceId === decoded.deviceId))) {
      // 1. Bypass cache and look up user directly in the database
      const freshUser = await userModel.findById(studentId);
      if (freshUser && freshUser.devices && freshUser.devices.some(d => d.deviceId === decoded.deviceId)) {
        user = freshUser;
        userPromises.set(studentId, { promise: Promise.resolve(freshUser), timestamp: Date.now() });
      } else if (freshUser) {
        // 2. Self-heal: Token is valid (correct signature and token version), but device registration is missing.
        // Register it dynamically on the fly to prevent false-positive logouts due to version error saves.
        try {
          const { getDeviceInfo } = require('../utils/deviceHelper');
          const info = getDeviceInfo(req);
          const newDevice = {
            deviceId: decoded.deviceId,
            deviceType: info.deviceType,
            browser: info.browser,
            os: info.os,
            ipAddress: info.ipAddress,
            location: 'Sikkim, Majitar, India',
            lastUsedAt: new Date(),
            registeredAt: new Date()
          };
          freshUser.devices = [...(freshUser.devices || []), newDevice];
          await freshUser.save();
          user = freshUser;
          userPromises.set(studentId, { promise: Promise.resolve(freshUser), timestamp: Date.now() });
        } catch (saveErr) {
          console.error("Failed to self-heal device session in student.auth.middleware:", saveErr);
          userPromises.delete(studentId);
          return res.status(401).json({
            success: false,
            message: "Session expired. Please login again.",
          });
        }
      } else {
        userPromises.delete(studentId);
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again.",
        });
      }
    }

    req.user = {
      userId: user._id,
      _id: user._id,
      email: user.email,
      name: user.name,
      role: decoded.role || 'student'
    };

    next();
  } catch (error) {
    // Push real-time force_logout on token expiry
    if (error.name === 'TokenExpiredError') {
      try {
        const rawToken = req.headers.authorization?.split(' ')[1];
        const expiredPayload = rawToken ? jwt.decode(rawToken) : null;
        if (expiredPayload?.userId) {
          const io = socketService.getIO();
          if (io) {
            io.to(String(expiredPayload.userId)).emit('force_logout', {
              reason: 'session_expired',
              message: 'Your session has expired. Please login again.',
            });
          }
        }
      } catch (_) {}
    }
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { jwtSecret, authMiddleware };
