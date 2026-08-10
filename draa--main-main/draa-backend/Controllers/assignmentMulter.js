
const multer = require("multer");
const path = require("path");
const fs = require("fs");


// Ensure uploads folder exists
const uploadPath ="uploads/assignments/";
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowed = [".pdf",".docx",".jpg",".jpeg",".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    return cb(new Error("Only PDF, DOCX, JPG, PNG files allowed"));
  }
  cb(null, true);
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max per file
});


module.exports=upload