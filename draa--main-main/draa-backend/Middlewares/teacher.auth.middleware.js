const jwt = require("jsonwebtoken");
const TeacherModel = require("../Models/TeacherModel");

const teacherAuthMiddleware = async (req, res, next) => {
    try {
        let token;

        //  1. Get token from header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        //  No token
        if (!token) {
            return res.status(401).json({
                success: false,
                message:"Access denied. No token provided.",
            });
        }

        //  2. Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        //  3. Fetch teacher
        const teacher = await TeacherModel.findById(decoded.teacherId).select("-tpassword");

        if (!teacher) {
            return res.status(401).json({
                success: false,
                message:"Invalid token. Teacher not found.",
            });
        }

        //  4. Check token version (Force Logout Logic)
        if (teacher.tokenVersion !== undefined && decoded.tokenVersion !== undefined && teacher.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({
                success: false,
                message:"Session expired due to account updates. Please login again.",
                forceLogout: true
            });
        }

        //  4. Attach to request
        req.teacher = teacher;
        req.teacherId = teacher._id;
        // Normalised shape — used by the universal blog controller.
        req.user = {
          userId: teacher._id,
          _id: teacher._id,
          email: teacher.temail,
          name: teacher.tname,
          role: 'teacher'
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);

        return res.status(401).json({
            success: false,
            message:"Invalid or expired token.",
        });
    }
};

module.exports = teacherAuthMiddleware;