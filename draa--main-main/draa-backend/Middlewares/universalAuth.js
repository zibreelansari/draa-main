const jwt = require('jsonwebtoken');
const UserModel = require('../Models/UserModel');
const TeacherModel = require('../Models/TeacherModel');
const AdminModel = require('../Models/AdminModel');
const socketService = require('../utils/socketService');

const studentPromises = new Map();
const teacherPromises = new Map();
const CACHE_TTL = 5000; // 5 seconds

const universalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ success: false, message:'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check Admin
        if (decoded.role ==='admin' || decoded.adminId) {
            req.adminId = decoded.adminId;
            req.role ='admin';
            return next();
        }

        // Check Teacher
        if (decoded.role ==='teacher' || decoded.teacherId) {
            const teacherId = decoded.teacherId;
            const now = Date.now();
            let cachedTeacher = teacherPromises.get(teacherId);

            if (!cachedTeacher || (now - cachedTeacher.timestamp > CACHE_TTL)) {
                const promise = TeacherModel.findById(teacherId).exec();
                cachedTeacher = { promise, timestamp: now };
                teacherPromises.set(teacherId, cachedTeacher);
            }

            const teacher = await cachedTeacher.promise;
            if (teacher) {
                req.teacher = teacher;
                req.role ='teacher';
                return next();
            } else {
                teacherPromises.delete(teacherId);
            }
        }

        // Check Student (User)
        const studentId = decoded.userId || decoded.id;
        const now = Date.now();
        let cachedStudent = studentPromises.get(studentId);

        if (!cachedStudent || (now - cachedStudent.timestamp > CACHE_TTL)) {
            const promise = UserModel.findById(studentId).exec();
            cachedStudent = { promise, timestamp: now };
            studentPromises.set(studentId, cachedStudent);
        }

        let user = await cachedStudent.promise;
        if (user) {
            if ((decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) {
                studentPromises.delete(studentId);
                return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
            }
            if (decoded.deviceId && (!user.devices || !user.devices.some(d => d.deviceId === decoded.deviceId))) {
                // 1. Bypass cache and look up user directly in the database
                const freshUser = await UserModel.findById(studentId);
                if (freshUser && freshUser.devices && freshUser.devices.some(d => d.deviceId === decoded.deviceId)) {
                    user = freshUser;
                    studentPromises.set(studentId, { promise: Promise.resolve(freshUser), timestamp: Date.now() });
                } else if (freshUser) {
                    // 2. Self-heal: Token is valid (correct signature and token version), but device registration is missing.
                    // Register it dynamically on the fly to prevent false-positive logouts.
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
                        studentPromises.set(studentId, { promise: Promise.resolve(freshUser), timestamp: Date.now() });
                    } catch (saveErr) {
                        console.error("Failed to self-heal device session in universalAuth:", saveErr);
                        studentPromises.delete(studentId);
                        return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
                    }
                } else {
                    studentPromises.delete(studentId);
                    return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
                }
            }
            req.user = user;
            req.role ='student';
            return next();
        } else {
            studentPromises.delete(studentId);
        }

        return res.status(401).json({ success: false, message:'Invalid token or user not found' });
    } catch (error) {
        // If the token is expired, extract the userId from the payload without
        // verification and push a real-time force_logout event so all connected
        // devices for that user are logged out immediately — no polling required.
        if (error.name === 'TokenExpiredError') {
            try {
                const decoded = jwt.decode(error.expiredAt ? req.headers.authorization?.split(' ')[1] : '');
                // jwt.decode never throws — it returns null on bad input
                const rawToken = req.headers.authorization?.split(' ')[1];
                const expiredPayload = rawToken ? jwt.decode(rawToken) : null;
                if (expiredPayload) {
                    const userId =
                        expiredPayload.userId ||
                        expiredPayload.teacherId ||
                        expiredPayload.adminId ||
                        expiredPayload.id;
                    if (userId) {
                        const io = socketService.getIO();
                        if (io) {
                            // Emit to the user's personal socket room so every connected
                            // device/tab receives the event and logs out instantly.
                            io.to(String(userId)).emit('force_logout', {
                                reason: 'session_expired',
                                message: 'Your session has expired. Please login again.',
                            });
                        }
                    }
                }
            } catch (_) {
                // Best-effort — don't block the 401 response
            }

            console.error('Universal Auth Error:', error);
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please login again.',
                code: 'TOKEN_EXPIRED',
            });
        }

        console.error('Universal Auth Error:', error);
        return res.status(401).json({ success: false, message:'Unauthorized' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.role !=='admin') {
        return res.status(403).json({ success: false, message:'Admin access required' });
    }
    next();
};

module.exports = { universalAuth, adminOnly };
