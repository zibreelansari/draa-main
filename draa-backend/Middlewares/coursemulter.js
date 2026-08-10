const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir ="uploads/coursematerials";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== STORAGE CONFIG =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +"-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// ===== ALLOWED TYPES =====
const docTypes = [
"application/pdf",
"application/msword",
"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
"application/vnd.ms-powerpoint",
"application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const imageTypes = [
"image/png",
"image/jpeg",
"image/jpg",
];

// ===== FILE FILTER =====
const fileFilter = (req, file, cb) => {

  //  COVER PHOTO (Images only)
  if (file.fieldname ==="coverphoto") {
    if (imageTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error("Cover photo must be an image (PNG/JPG)"));
    }
  }

  //  SYLLABUS (Docs only)
  if (file.fieldname ==="syllabus") {
    if (docTypes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error("Syllabus must be PDF/DOC/DOCX"));
    }
  }

  //  CHAPTER FILES (dynamic fields)
  if (file.fieldname.startsWith("chapters")) {

    // Study Material  docs only
    if (file.fieldname.includes("study_material")) {
      if (docTypes.includes(file.mimetype)) {
        return cb(null, true);
      } else {
        return cb(new Error("Study material must be document file"));
      }
    }

    // Practice Set  docs + images
    if (file.fieldname.includes("practice_set")) {
      if (docTypes.includes(file.mimetype) || imageTypes.includes(file.mimetype)) {
        return cb(null, true);
      } else {
        return cb(new Error("Practice set must be document or image"));
      }
    }

    // Other Materials  docs + images
    if (file.fieldname.includes("other_materials")) {
      if (docTypes.includes(file.mimetype) || imageTypes.includes(file.mimetype)) {
        return cb(null, true);
      } else {
        return cb(new Error("Other materials must be document or image"));
      }
    }

    return cb(null, true);
  }

  return cb(new Error(`Unexpected field: ${file.fieldname}`));
};

// ===== MULTER INSTANCE =====
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB per file (raised from 50MB to accommodate full chapter sets)
    files: 50,                    // up to 50 files per request
  },
});

module.exports = upload;
