// routes/pyqRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const PYQ = require('../Models/PYQ.models');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname ==='questionPaperPDF' || file.fieldname ==='solutionPDF') {
      cb(null,'uploads/pyq/pdfs/');
    } else if (file.fieldname ==='coverImage') {
      cb(null,'uploads/pyq/images/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() +'-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname +'-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname ==='questionPaperPDF' || file.fieldname ==='solutionPDF') {
    const allowedMimeTypes = [
'application/pdf',
'application/vnd.ms-powerpoint',
'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and PPT files allowed for question papers!'), false);
    }
  } else if (file.fieldname ==='coverImage') {
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
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    fieldSize: 10 * 1024 * 1024 // 10MB for non-file fields
  }
});

// Multer error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code ==='LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error:'File too large. Maximum limit is 100MB per file.'
      });
    }
    return res.status(400).json({
      error: `Upload error: ${error.message}`
    });
  } else if (error) {
    return res.status(400).json({
      error: error.message
    });
  }
  next();
};

// CREATE - Teacher only
const checkAuth = require('../Middlewares/checkAuth');
const optionalAuth = require('../Middlewares/optionalAuth');

// ... (Multer config remains the same)

router.post('/create', checkAuth, upload.fields([
  { name:'questionPaperPDF', maxCount: 1 },
  { name:'solutionPDF', maxCount: 1 },
  { name:'coverImage', maxCount: 1 }
]), handleMulterError, async (req, res) => {
  try {
    // Parse subjects array if it's stringified
    let subjects = req.body.subjects;
    if (typeof subjects ==='string') {
      try {
        subjects = JSON.parse(subjects);
      } catch (e) {
        subjects = [subjects]; // If single value
      }
    }

    // Parse tags array if it's stringified
    let tags = req.body.tags;
    if (typeof tags ==='string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = tags ? [tags] : [];
      }
    }

    // Generate slug from examName + year + paper (unique per paper)
    const titleForSlug = `${req.body.examName || req.body.title}-${req.body.year ||''}-${req.body.paper ||''}`;
    const slug = titleForSlug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g,'')
      .replace(/[\s_-]+/g,'-')
      .replace(/^-+|-+$/g,'')
      +'-' + Date.now();

    // Prepare PYQ data
    const pyqData = {
      examName: req.body.examName,
      examCategory: req.body.examCategory && req.body.examCategory.trim() ? req.body.examCategory : undefined,
      year: parseInt(req.body.year),
      shift: req.body.shift,
      paper: req.body.paper,
      examStage: req.body.examStage ||'Prelims',
      title: req.body.title,
      description: req.body.description,
      subjects: subjects,
      totalQuestions: req.body.totalQuestions ? parseInt(req.body.totalQuestions) : undefined,
      totalMarks: req.body.totalMarks ? parseInt(req.body.totalMarks) : undefined,
      duration: req.body.duration ? parseInt(req.body.duration) : undefined,
      memoryBasedPaper: req.body.memoryBasedPaper ==='true' || req.body.memoryBasedPaper === true,
      videoSolutionUrl: req.body.videoSolutionUrl ||'',
      tags: tags || [],
      isFeatured: req.body.isFeatured ==='true' || req.body.isFeatured === true,
      isPopular: req.body.isPopular ==='true' || req.body.isPopular === true,
      isPremium: req.body.isPremium ==='true' || req.body.isPremium === true,
      uploadedBy: req.user.role ==="TEACHER" ? req.user.id : (req.body.uploadedBy || null),
      uploadedByName: req.body.uploadedByName ||"User",
      questionPaperPDF: req.files['questionPaperPDF'] ? req.files['questionPaperPDF'][0].path : null,
      solutionPDF: req.files['solutionPDF'] ? req.files['solutionPDF'][0].path : null,
      coverImage: req.files['coverImage'] ? req.files['coverImage'][0].path : null,
      seo: {
        seo_title: req.body.seo_title || req.body.title,
        meta_keywords: req.body.meta_keywords ||'',
        meta_description: req.body.meta_description || req.body.description,
        slug: req.body.slug || slug,
        og_title: req.body.og_title || req.body.seo_title || req.body.title,
        og_description: req.body.og_description || req.body.meta_description || req.body.description,
        canonical_url: req.body.canonical_url ||'',
        robots: req.body.robots ||'index, follow',
        schema_markup: req.body.schema_markup ||''
      }
    };

    const pyq = new PYQ(pyqData);
    await pyq.save();

    // Notify admin when a teacher uploads a PYQ
    try {
      const Notification = require('../Models/NotificationModel');
      const uploaderName = pyq.uploadedByName || req.user?.name ||"A Teacher";
      await Notification.create({
        recipient:'admin',
        recipientModel:'Admin',
        sender: pyq.uploadedBy || null,
        senderModel:'Teacher',
        senderName: uploaderName,
        type:'content_upload',
        title:'New PYQ Uploaded',
        message: `Teacher"${uploaderName}" uploaded a new PYQ:"${pyq.title || pyq.examName}" for review and approval.`,
        referenceId: pyq._id
      });
      console.log('Notification triggered: PYQ uploaded by teacher.');
    } catch (notifErr) {
      console.error('Failed to trigger PYQ upload notification:', notifErr.message);
    }

    res.status(201).json({
      message:'PYQ uploaded successfully and pending approval',
      pyq: pyq
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET ALL - With filters
router.get('/all', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      year,
      isApproved,
      isFeatured,
      isPopular,
      uploadedBy
    } = req.query;

    let filter = {};

    if (category) filter.examCategory = category;
    if (year) filter.year = parseInt(year);
    if (isApproved !== undefined) filter.isApproved = isApproved ==='true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured ==='true';
    if (isPopular !== undefined) filter.isPopular = isPopular ==='true';

    // Force teacher filter
    if (req.user && req.user.role ==="TEACHER") {
      filter.uploadedBy = req.user.id;
    } else if (uploadedBy) {
      filter.uploadedBy = uploadedBy;
    }

    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    //  OPTIMIZATION: Parallelize and exclude heavy fields
    const [pyqs, total] = await Promise.all([
      PYQ.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .select('-description -seo.schema_markup') // EXCLUDE HEAVY FIELDS
        .populate('uploadedBy','tname email')
        .lean(),
      PYQ.countDocuments(filter)
    ]);

    res.json({ pyqs, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET APPROVED - Public access
router.get('/approved', async (req, res) => {
  try {
    const pyqs = await PYQ.find({ isApproved: true })
      .sort({ year: -1, createdAt: -1 })
      .select('-description -seo.schema_markup') // EXCLUDE HEAVY FIELDS
      .populate('uploadedBy','tname')
      .lean();

    res.json({ pyqs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET PENDING - Admin or Teacher (their own)
router.get('/pending', checkAuth, async (req, res) => {
  try {
    let filter = { isApproved: false };

    if (req.user.role ==="TEACHER") {
      filter.uploadedBy = req.user.id;
    }

    const pyqs = await PYQ.find(filter)
      .sort({ createdAt: -1 })
      .populate('uploadedBy','tname email');

    res.json({ pyqs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET BY ID
router.get('/:id', async (req, res) => {
  try {
    const pyq = await PYQ.findById(req.params.id)
      .populate('uploadedBy','tname email');

    if (!pyq) {
      return res.status(404).json({ error:'PYQ not found' });
    }

    // Increment views
    pyq.views += 1;
    await pyq.save();

    res.json({ pyq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Teacher only (their own PYQs)
router.put('/:id', checkAuth, upload.fields([
  { name:'questionPaperPDF', maxCount: 1 },
  { name:'solutionPDF', maxCount: 1 },
  { name:'coverImage', maxCount: 1 }
]), handleMulterError, async (req, res) => {
  try {
    const pyq = await PYQ.findById(req.params.id);

    if (!pyq) {
      return res.status(404).json({ error:'PYQ not found' });
    }

    // Ownership check
    if (req.user.role ==="TEACHER" && pyq.uploadedBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error:"Access denied. You do not own this record." });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key !=='uploadedBy' && key !=='isApproved') {
        pyq[key] = req.body[key];
      }
    });

    // Update files if new ones uploaded (check if req.files exists)
    if (req.files) {
      if (req.files['questionPaperPDF']) {
        pyq.questionPaperPDF = req.files['questionPaperPDF'][0].path;
      }
      if (req.files['solutionPDF']) {
        pyq.solutionPDF = req.files['solutionPDF'][0].path;
      }
      if (req.files['coverImage']) {
        pyq.coverImage = req.files['coverImage'][0].path;
      }
    }

    // Reset to pending ONLY if core content changed (files or title/exam info)
    const coreFields = ['examName','examCategory','year','shift','paper','examStage','title','subjects','totalQuestions','totalMarks','duration'];
    const hasCoreFieldUpdate = Object.keys(req.body).some(key => coreFields.includes(key));
    const hasFileUpdate = req.files && (req.files['questionPaperPDF'] || req.files['solutionPDF'] || req.files['coverImage']);

    if (hasCoreFieldUpdate || hasFileUpdate) {
      pyq.isApproved = false;
      pyq.approvedBy = null;
      pyq.approvedAt = null;
    }

    await pyq.save();

    res.json({
      message:'PYQ updated successfully',
      pyq: pyq
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Teacher only (their own PYQs)
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const pyq = await PYQ.findById(req.params.id);

    if (!pyq) {
      return res.status(404).json({ error:'PYQ not found' });
    }

    // Ownership check
    if (req.user.role ==="TEACHER" && pyq.uploadedBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error:"Access denied. You do not own this record." });
    }

    await PYQ.findByIdAndDelete(req.params.id);

    res.json({ message:'PYQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// APPROVE/UNAPPROVE - Admin only
router.put('/:id/approve', async (req, res) => {
  try {
    const { isApproved, adminId, rejectionReason } = req.body;

    const pyq = await PYQ.findById(req.params.id);

    if (!pyq) {
      return res.status(404).json({ error:'PYQ not found' });
    }

    pyq.isApproved = isApproved;

    if (isApproved) {
      pyq.approvedBy = adminId;
      pyq.approvedAt = new Date();
      pyq.rejectionReason = null;
    } else {
      pyq.rejectionReason = rejectionReason || null;
    }

    await pyq.save();

    // Send notifications on approve/unapprove
    try {
      const Notification = require('../Models/NotificationModel');
      if (isApproved) {
        // Notify the creator teacher
        if (pyq.uploadedBy) {
          await Notification.create({
            recipient: pyq.uploadedBy.toString(),
            recipientModel:'Teacher',
            sender: null,
            senderModel:'Admin',
            senderName:'EduDocs Team',
            type:'content_upload',
            title:'PYQ Approved!',
            message: `Congratulations! Your PYQ"${pyq.title || pyq.examName}" has been approved by the Admin and is now publicly available.`,
            referenceId: pyq._id
          });
        }
        // Notify all students
        await Notification.create({
          recipient:'all_students',
          recipientModel:'User',
          sender: null,
          senderModel:'Admin',
          senderName:'EduDocs Team',
          type:'content_upload',
          title:'New PYQ Published!',
          message: `New PYQ Available:"${pyq.title || pyq.examName}" (${pyq.year ||''}) is now available for download!`,
          referenceId: pyq._id
        });
        console.log('Notification triggered: PYQ approved.');
      } else if (rejectionReason) {
        // Notify the creator teacher on rejection
        if (pyq.uploadedBy) {
          await Notification.create({
            recipient: pyq.uploadedBy.toString(),
            recipientModel:'Teacher',
            sender: null,
            senderModel:'Admin',
            senderName:'EduDocs Team',
            type:'content_upload',
            title:'PYQ Rejected',
            message: `Dear Instructor, your PYQ"${pyq.title || pyq.examName}" was rejected. Reason: ${rejectionReason}`,
            referenceId: pyq._id
          });
          console.log('Notification triggered: PYQ rejected.');
        }
      }
    } catch (notifErr) {
      console.error('Failed to trigger PYQ notification:', notifErr.message);
    }

    res.json({
      message: `PYQ ${isApproved ?'approved' :'unapproved'} successfully`,
      pyq: pyq
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BULK APPROVE/UNAPPROVE - Admin only
router.post('/bulk-approve', async (req, res) => {
  try {
    const { pyqIds, isApproved, adminId } = req.body;

    const updateData = {
      isApproved: isApproved
    };

    if (isApproved) {
      updateData.approvedBy = adminId;
      updateData.approvedAt = new Date();
    }

    await PYQ.updateMany(
      { _id: { $in: pyqIds } },
      updateData
    );

    res.json({
      message: `${pyqIds.length} PYQs ${isApproved ?'approved' :'unapproved'} successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET STATISTICS
router.get('/stats/overview', checkAuth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role ==="TEACHER") {
      filter.uploadedBy = req.user.id;
    }

    const stats = {
      total: await PYQ.countDocuments(filter),
      approved: await PYQ.countDocuments({ ...filter, isApproved: true }),
      pending: await PYQ.countDocuments({ ...filter, isApproved: false }),
      featured: await PYQ.countDocuments({ ...filter, isFeatured: true }),
      popular: await PYQ.countDocuments({ ...filter, isPopular: true }),
      byCategory: await PYQ.aggregate([
        { $group: { _id:'$examCategory', count: { $sum: 1 } } }
      ]),
      byYear: await PYQ.aggregate([
        { $group: { _id:'$year', count: { $sum: 1 } } },
        { $sort: { _id: -1 } }
      ])
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// INCREMENT DOWNLOAD COUNT
router.post('/:id/download', async (req, res) => {
  try {
    const pyq = await PYQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    res.json({ message:'Download count updated', pyq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
