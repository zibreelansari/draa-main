// routes/syllabusRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Syllabus = require('../Models/Syllabus.model');
const fs = require('fs');
const pdfParse = require('pdf-parse/lib/pdf-parse');

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'syllabusPDF') {
      cb(null, 'uploads/syllabus/pdfs/');
    } else if (file.fieldname === 'coverImage') {
      cb(null, 'uploads/syllabus/images/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'syllabusPDF') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed for syllabus!'), false);
    }
  } else if (file.fieldname === 'coverImage') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed for cover!'), false);
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }
});


router.post(
  "/preview-extract",
  upload.single("syllabusPDF"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "PDF required" });
      }

      const pdfPath = req.file.path;

      const buffer = fs.readFileSync(pdfPath);
      let parsed = { text: "" };
      try {
        parsed = await pdfParse(buffer);
      } catch (err) {
        console.error("PDF parse error:", err);
      }

      let extractedText = parsed.text || "";

      // ================= CLEAN TEXT =================
      extractedText = extractedText
        .replace(/\d+\s*\|\s*Page/gi, "")
        .replace(/Page\s*\d+/gi, "")
        .replace(/\r/g, "")
        .replace(/\n/g, "")
        .replace(/\s+/g, "")
        .trim();

      // ================= TITLE DETECTION =================
      let autoTitle = "Exam Syllabus";

      const sentences = extractedText
        .split(".")
        .map(s => s.trim())
        .filter(s => s.length > 20);

      const syllabusLine = sentences.find(s =>
        s.toLowerCase().includes("syllabus")
      );

      if (syllabusLine) {
        autoTitle = syllabusLine;
      } else if (sentences.length > 0) {
        autoTitle = sentences[0];
      }

      // ================= DESCRIPTION =================
      const autoDescription = extractedText.substring(0, 300);

      // ================= KEYWORDS =================
      const words = extractedText
        .replace(/[^\w\s]/g, "")
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 6);

      const autoKeywords = [...new Set(words)]
        .slice(0, 12)
        .join(",");

      // ================= SLUG =================
      const slug = autoTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();

      return res.json({
        title: autoTitle,
        description: autoDescription,
        keywords: autoKeywords,
        slug
      });

    } catch (err) {
      console.error("Preview Extract Error:", err);
      return res.status(500).json({
        error: "Failed to extract PDF content",
      });
    }
  }
);



// CREATE SYLLABUS

const checkAuth = require('../Middlewares/checkAuth');
const optionalAuth = require('../Middlewares/optionalAuth');

// ... (Multer config remains the same)

router.post(
  "/create",
  checkAuth,
  upload.fields([
    { name: "syllabusPDF", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // ================= PDF VALIDATION =================
      if (!req.files || !req.files["syllabusPDF"]) {
        return res.status(400).json({ error: "Syllabus PDF required" });
      }

      const pdfPath = req.files["syllabusPDF"][0].path;

      // ================= EXTRACT TEXT =================
      const buffer = fs.readFileSync(pdfPath);
      let parsed = { text: "" };
      try {
        parsed = await pdfParse(buffer);
      } catch (err) {
        console.error("PDF parse error:", err);
      }

      let extractedText = parsed.text || "";

      console.log("PDF TEXT LENGTH:", extractedText.length);

      // ================= CLEAN TEXT =================
      extractedText = extractedText
        .replace(/\d+\s*\|\s*Page/gi, "")
        .replace(/Page\s*\d+/gi, "")
        .replace(/\r/g, "")
        .replace(/\n/g, "")
        .replace(/\s+/g, "")
        .trim();

      // ================= TITLE DETECTION =================
      let autoTitle = "Exam Syllabus";

      const sentences = extractedText
        .split(".")
        .map(s => s.trim())
        .filter(s => s.length > 20);

      const syllabusLine = sentences.find(s =>
        s.toLowerCase().includes("syllabus")
      );

      if (syllabusLine) {
        autoTitle = syllabusLine;
      } else if (sentences.length > 0) {
        autoTitle = sentences[0];
      }

      // ================= DESCRIPTION =================
      const autoDescription = extractedText.substring(0, 300);

      // ================= KEYWORDS =================
      const words = extractedText
        .replace(/[^\w\s]/g, "")
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 6);

      const autoKeywords = [...new Set(words)]
        .slice(0, 12)
        .join(",");

      // ================= SLUG =================
      const slug = autoTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();

      // ================= SAFE PARSE ARRAYS =================
      const safeParse = (value, fallback) => {
        if (!value) return fallback;
        if (typeof value === "object") return value;
        try {
          return JSON.parse(value);
        } catch {
          return fallback;
        }
      };

      const subjects = safeParse(req.body.subjects, []);
      const importantTopics = safeParse(req.body.importantTopics, []);
      const recommendedBooks = safeParse(req.body.recommendedBooks, []);
      const examPattern = safeParse(req.body.examPattern, {});
      const tags = safeParse(req.body.tags, []);

      // ================= CREATE DOCUMENT =================
      const syllabus = await Syllabus.create({
        examName: req.body.examName || autoTitle,
        examCategory: req.body.examCategory || "",
        title: req.body.title || autoTitle,
        description: req.body.description || autoDescription,
        subjects,
        examPattern,
        importantTopics,
        recommendedBooks,
        videoUrl: req.body.videoUrl || "",
        tags,
        isFeatured: req.body.isFeatured === "true",
        isPopular: req.body.isPopular === "true",
        isPremium: req.body.isPremium === "true",
        uploadedBy: req.user.role === "TEACHER" ? req.user.id : (req.body.uploadedBy || null),
        uploadedByName: req.body.uploadedByName || "User",
        syllabusPDF: pdfPath,
        coverImage: req.files["coverImage"]
          ? req.files["coverImage"][0].path
          : null,

        seo: {
          seo_title: req.body.seo_title || (req.body.title || autoTitle).substring(0, 60),
          meta_keywords: req.body.meta_keywords || autoKeywords,
          meta_description: req.body.meta_description || (req.body.description || autoDescription).substring(0, 160),
          slug: req.body.slug || slug,
          og_title: req.body.og_title || req.body.title || autoTitle,
          og_description: req.body.og_description || req.body.description || autoDescription,
          canonical_url: `${process.env.FRONTEND_URL}/syllabus/${req.body.slug || slug}`,
          robots: "index, follow",
          schema_markup: "",
        },
      });

      // Notify admin when a teacher uploads a new syllabus
      try {
        const Notification = require("../Models/NotificationModel");
        const uploaderName = syllabus.uploadedByName || req.user?.name || "A Teacher";
        await Notification.create({
          recipient: 'admin',
          recipientModel: 'Admin',
          sender: syllabus.uploadedBy || null,
          senderModel: 'Teacher',
          senderName: uploaderName,
          type: 'content_upload',
          title: 'New Syllabus Uploaded',
          message: `Teacher"${uploaderName}" uploaded a new Syllabus:"${syllabus.title}" for review and approval.`,
          referenceId: syllabus._id
        });
        console.log('Notification triggered: Syllabus uploaded by teacher.');
      } catch (notifErr) {
        console.error('Failed to trigger syllabus upload notification:', notifErr.message);
      }

      return res.status(201).json({
        message: "Syllabus uploaded successfully",
        syllabus,
      });

    } catch (error) {
      console.error("CREATE ERROR:", error);
      return res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }
);


// GET ALL
router.get('/all', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      isApproved,
      isFeatured,
      isPopular,
      uploadedBy
    } = req.query;

    let filter = {};

    if (category) filter.examCategory = category;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (isPopular !== undefined) filter.isPopular = isPopular === 'true';

    // Force teacher filter
    if (req.user && req.user.role === "TEACHER") {
      filter.uploadedBy = req.user.id;
    } else if (uploadedBy) {
      filter.uploadedBy = uploadedBy;
    }
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    //  OPTIMIZATION: Parallelize and exclude heavy fields
    const [syllabuses, total] = await Promise.all([
      Syllabus.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .select('-description -seo.schema_markup') // EXCLUDE HEAVY FIELDS
        .populate('uploadedBy', 'tname email')
        .lean(),
      Syllabus.countDocuments(filter)
    ]);

    res.json({ syllabuses, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET APPROVED
router.get('/approved', async (req, res) => {
  try {
    const syllabuses = await Syllabus.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .select('-description -seo.schema_markup') // EXCLUDE HEAVY FIELDS
      .populate('uploadedBy', 'tname')
      .lean();

    res.json({ syllabuses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET PENDING - Admin or Teacher (their own)
router.get('/pending', checkAuth, async (req, res) => {
  try {
    let filter = { isApproved: false };

    if (req.user.role === "TEACHER") {
      filter.uploadedBy = req.user.id;
    }

    const syllabuses = await Syllabus.find(filter)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'tname email');

    res.json({ syllabuses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET BY ID
router.get('/:id', async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id)
      .populate('uploadedBy', 'tname email');

    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }

    syllabus.views += 1;
    await syllabus.save();

    res.json({ syllabus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Teacher only
router.put('/:id', checkAuth, upload.fields([
  { name: 'syllabusPDF', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);

    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }

    // Ownership check
    if (req.user.role === "TEACHER" && syllabus.uploadedBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Access denied. You do not own this record." });
    }

    // Parse arrays
    let subjects = req.body.subjects;
    if (typeof subjects === 'string' && subjects !== '') {
      try {
        subjects = JSON.parse(subjects);
      } catch (e) {
        subjects = syllabus.subjects;
      }
    }

    let importantTopics = req.body.importantTopics;
    if (typeof importantTopics === 'string' && importantTopics !== '') {
      try {
        importantTopics = JSON.parse(importantTopics);
      } catch (e) {
        importantTopics = syllabus.importantTopics;
      }
    }

    let recommendedBooks = req.body.recommendedBooks;
    if (typeof recommendedBooks === 'string' && recommendedBooks !== '') {
      try {
        recommendedBooks = JSON.parse(recommendedBooks);
      } catch (e) {
        recommendedBooks = syllabus.recommendedBooks;
      }
    }

    let examPattern = req.body.examPattern;
    if (typeof examPattern === 'string' && examPattern !== '') {
      try {
        examPattern = JSON.parse(examPattern);
      } catch (e) {
        examPattern = syllabus.examPattern;
      }
    }

    let tags = req.body.tags;
    if (typeof tags === 'string' && tags !== '') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = syllabus.tags;
      }
    }

    // Update fields
    if (req.body.examName) syllabus.examName = req.body.examName;
    if (req.body.examCategory) syllabus.examCategory = req.body.examCategory;
    if (req.body.title) syllabus.title = req.body.title;
    if (req.body.description !== undefined) syllabus.description = req.body.description;
    if (subjects) syllabus.subjects = subjects;
    if (importantTopics) syllabus.importantTopics = importantTopics;
    if (recommendedBooks) syllabus.recommendedBooks = recommendedBooks;
    if (examPattern) syllabus.examPattern = examPattern;
    if (req.body.videoUrl !== undefined) syllabus.videoUrl = req.body.videoUrl;
    if (tags) syllabus.tags = tags;

    if (req.body.isFeatured !== undefined) {
      syllabus.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    }
    if (req.body.isPopular !== undefined) {
      syllabus.isPopular = req.body.isPopular === 'true' || req.body.isPopular === true;
    }
    if (req.body.isPremium !== undefined) {
      syllabus.isPremium = req.body.isPremium === 'true' || req.body.isPremium === true;
    }

    // Update SEO
    if (req.body.seo_title) syllabus.seo.seo_title = req.body.seo_title;
    if (req.body.meta_keywords) syllabus.seo.meta_keywords = req.body.meta_keywords;
    if (req.body.meta_description) syllabus.seo.meta_description = req.body.meta_description;
    if (req.body.slug) syllabus.seo.slug = req.body.slug;
    if (req.body.og_title) syllabus.seo.og_title = req.body.og_title;
    if (req.body.og_description) syllabus.seo.og_description = req.body.og_description;

    // Update files
    if (req.files && req.files['syllabusPDF']) {
      syllabus.syllabusPDF = req.files['syllabusPDF'][0].path;
    }
    if (req.files && req.files['coverImage']) {
      syllabus.coverImage = req.files['coverImage'][0].path;
    }

    // Reset to pending on every edit
    syllabus.isApproved = false;
    syllabus.approvedBy = null;
    syllabus.approvedAt = null;

    await syllabus.save();

    res.json({
      message: 'Syllabus updated successfully',
      syllabus: syllabus
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// DELETE
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id);

    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }

    // Ownership check
    if (req.user.role === "TEACHER" && syllabus.uploadedBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Access denied. You do not own this record." });
    }

    await Syllabus.findByIdAndDelete(req.params.id);

    res.json({ message: 'Syllabus deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// APPROVE/UNAPPROVE - Admin only
router.put('/:id/approve', async (req, res) => {
  try {
    const { isApproved, adminId, rejectionReason } = req.body;

    const syllabus = await Syllabus.findById(req.params.id);

    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }

    syllabus.isApproved = isApproved;

    if (isApproved) {
      syllabus.approvedBy = adminId;
      syllabus.approvedAt = new Date();
      syllabus.rejectionReason = null;
    } else {
      syllabus.rejectionReason = rejectionReason || null;
    }

    await syllabus.save();

    // Send notifications on approve/unapprove
    try {
      const Notification = require("../Models/NotificationModel");
      if (isApproved) {
        // Notify the creator teacher
        if (syllabus.uploadedBy) {
          await Notification.create({
            recipient: syllabus.uploadedBy.toString(),
            recipientModel: 'Teacher',
            sender: null,
            senderModel: 'Admin',
            senderName: 'EduDocs Team',
            type: 'content_upload',
            title: 'Syllabus Approved!',
            message: `Congratulations! Your Syllabus"${syllabus.title}" has been approved by the Admin and is now publicly available.`,
            referenceId: syllabus._id
          });
        }
        // Notify all students
        await Notification.create({
          recipient: 'all_students',
          recipientModel: 'User',
          sender: null,
          senderModel: 'Admin',
          senderName: 'EduDocs Team',
          type: 'content_upload',
          title: 'New Syllabus Published!',
          message: `New Syllabus Available:"${syllabus.title}" is now available for download!`,
          referenceId: syllabus._id
        });
        console.log('Notification triggered: Syllabus approved.');
      } else if (rejectionReason) {
        // Notify the creator teacher on rejection
        if (syllabus.uploadedBy) {
          await Notification.create({
            recipient: syllabus.uploadedBy.toString(),
            recipientModel: 'Teacher',
            sender: null,
            senderModel: 'Admin',
            senderName: 'EduDocs Team',
            type: 'content_upload',
            title: 'Syllabus Rejected',
            message: `Dear Instructor, your Syllabus"${syllabus.title}" was rejected. Reason: ${rejectionReason}`,
            referenceId: syllabus._id
          });
          console.log('Notification triggered: Syllabus rejected.');
        }
      }
    } catch (notifErr) {
      console.error('Failed to trigger syllabus notification:', notifErr.message);
    }

    res.json({
      message: `Syllabus ${isApproved ? 'approved' : 'unapproved'} successfully`,
      syllabus: syllabus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BULK APPROVE
router.post('/bulk-approve', async (req, res) => {
  try {
    const { syllabusIds, isApproved, adminId } = req.body;

    const updateData = {
      isApproved: isApproved
    };

    if (isApproved) {
      updateData.approvedBy = adminId;
      updateData.approvedAt = new Date();
    }

    await Syllabus.updateMany(
      { _id: { $in: syllabusIds } },
      updateData
    );

    res.json({
      message: `${syllabusIds.length} syllabuses ${isApproved ? 'approved' : 'unapproved'} successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// STATISTICS
router.get('/stats/overview', checkAuth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "TEACHER") {
      filter.uploadedBy = req.user.id;
    }

    const stats = {
      total: await Syllabus.countDocuments(filter),
      approved: await Syllabus.countDocuments({ ...filter, isApproved: true }),
      pending: await Syllabus.countDocuments({ ...filter, isApproved: false }),
      featured: await Syllabus.countDocuments({ ...filter, isFeatured: true }),
      popular: await Syllabus.countDocuments({ ...filter, isPopular: true }),
      byCategory: await Syllabus.aggregate([
        { $group: { _id: '$examCategory', count: { $sum: 1 } } }
      ])
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// INCREMENT DOWNLOAD
router.post('/:id/download', async (req, res) => {
  try {
    const syllabus = await Syllabus.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    res.json({ message: 'Download count updated', syllabus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
