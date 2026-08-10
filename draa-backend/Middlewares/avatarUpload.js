const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadPath ="uploads/avatars/";
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `avatar-${Date.now()}-${file.originalname.replace(/\s+/g,'-')}`;
    cb(null, uniqueName);
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowed = [".jpg",".jpeg",".png",".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error("Only JPG, PNG, and WEBP files are allowed"), false);
  }
  cb(null, true);
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max for profile pics
});

module.exports = upload;
