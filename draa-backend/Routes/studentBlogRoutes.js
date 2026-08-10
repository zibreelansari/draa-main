const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createStudentBlog,
  getStudentBlogs,
  getMyBlogs,
  updateStudentBlog,
  deleteStudentBlog
} = require("../Controllers/StudentBlogController");

const { authMiddleware } = require("../Middlewares/student.auth.middleware");


/*
====================================
UPLOAD DIRECTORY
====================================
*/

const uploadDir ="uploads/blogs";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


/*
====================================
MULTER STORAGE CONFIG
====================================
*/

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() +"-" + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname);

    const filename = file.fieldname +"-" + uniqueSuffix + ext;

    cb(null, filename);
  },
});


/*
====================================
FILE FILTER
====================================
*/

const fileFilter = (req, file, cb) => {

  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }

};


/*
====================================
MULTER INSTANCE
====================================
*/

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,     // 5MB image limit
    files: 6,                      // 1 schema + 5 gallery
    fieldSize: 25 * 1024 * 1024    //  important for large blog HTML
  }
});


/*
====================================
AUTH PROTECTION
====================================
*/

router.use(authMiddleware);


/*
====================================
CREATE BLOG
====================================
*/

router.post(
"/create",
  upload.fields([
    { name:"schema_image", maxCount: 1 },
    { name:"featured_images", maxCount: 5 }
  ]),
  createStudentBlog
);


/*
====================================
GET ALL APPROVED BLOGS
====================================
*/

router.get("/", getStudentBlogs);


/*
====================================
GET MY BLOGS
====================================
*/

router.get("/my", getMyBlogs);


/*
====================================
UPDATE BLOG
====================================
*/

router.put(
"/:blogId",
  upload.fields([
    { name:"schema_image", maxCount: 1 },
    { name:"featured_images", maxCount: 5 }
  ]),
  updateStudentBlog
);


/*
====================================
DELETE BLOG
====================================
*/

router.delete("/:blogId", deleteStudentBlog);


/*
====================================
MULTER ERROR HANDLER
====================================
*/

router.use((error, req, res, next) => {

  if (error instanceof multer.MulterError) {

    if (error.code ==="LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error:"File too large",
        details:"Image must be less than 5MB"
      });
    }

    if (error.code ==="LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error:"Too many files",
        details:"Maximum 6 images allowed"
      });
    }

    if (error.code ==="LIMIT_FIELD_VALUE") {
      return res.status(400).json({
        success: false,
        error:"Content too large",
        details:"Blog content exceeds maximum size"
      });
    }

  }

  if (error.message ==="Only image files are allowed") {
    return res.status(400).json({
      success: false,
      error:"Invalid file type",
      details:"Only images are allowed"
    });
  }

  next(error);

});


module.exports = router;