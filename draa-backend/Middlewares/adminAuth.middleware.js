const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access denied. Token missing." });
    }

    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const decoded = jwt.verify(token, secret);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access forbidden. Admin role required." });
    }

    req.admin = decoded;
    // Normalised shape — used by the universal blog controller.
    req.user = {
      userId: decoded.adminId || decoded.id || decoded._id,
      _id: decoded.adminId || decoded.id || decoded._id,
      email: decoded.email,
      name: decoded.aname || decoded.name,
      role: 'admin'
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = adminAuth;