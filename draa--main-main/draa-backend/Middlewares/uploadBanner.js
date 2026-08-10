const multer = require("multer");
const path = require("path");

// Storage location
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"uploads/banners"); // Folder must exist
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() +"_" + file.originalname);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);

  if (ext && mime) cb(null, true);
  else cb(new Error("Only JPEG, PNG, WEBP images allowed"));
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});
