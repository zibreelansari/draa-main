const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const router = express.Router();

const uploadDir = path.resolve(__dirname, '../uploads/editor');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique =
      Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
  const publicUrl = `${req.protocol}://${req.get('host')}/uploads/editor/${req.file.filename}`;

  res.json({
    location: publicUrl
  });
});



router.post('/import-word', upload.single('file'), async (req, res) => {
  try {
    const result = await mammoth.convertToHtml({
      path: req.file.path
    });

    const html = result.value;
    let firstImageUrl = null;

    // Search for first inline base64 image in the html (handles single/double quotes, extra attributes, and various formats)
    const imgRegex = /<img\s+[^>]*src=["']data:image\/([a-z0-9-+.]+);base64,([^"']+)["']/i;
    const match = html.match(imgRegex);

    if (match) {
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const base64Data = match[2];
      const courseContentUploadDir = path.resolve(__dirname, '../uploads/course-content');

      if (!fs.existsSync(courseContentUploadDir)) {
        fs.mkdirSync(courseContentUploadDir, { recursive: true });
      }

      const filename = `schema_image-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
      const filepath = path.join(courseContentUploadDir, filename);

      fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
      firstImageUrl = `uploads/course-content/${filename}`;
    }

    res.json({
      html,
      firstImageUrl
    });
  } catch (err) {
    console.error('Word import error:', err);
    res.status(500).json({ error: 'Word import failed' });
  }
});

module.exports = router;
