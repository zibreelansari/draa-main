const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return next(); // Continue without user
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET ||"your-secret-key-change-in-production";
    
    try {
      const decoded = jwt.verify(token, secret);
      
      // Standardize
      const rawRole = decoded.role ||"";
      const role = rawRole.toString().toUpperCase();

      if (decoded.adminId || role ==="ADMIN") {
        decoded.role ="ADMIN";
        decoded.id = decoded.adminId || decoded.id;
      } else if (decoded.teacherId || role ==="TEACHER") {
        decoded.role ="TEACHER";
        decoded.id = decoded.teacherId || decoded.id;
      } else if (decoded.userId) {
        decoded.role ="STUDENT";
        decoded.id = decoded.userId;
      }

      req.user = decoded;
    } catch (err) {
      // Token invalid, but we allow it for optional auth
    }
    
    next();
  } catch (error) {
    next();
  }
};
