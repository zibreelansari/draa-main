const express = require("express");
const mongoose = require("mongoose");
const Exam = require("../Models/Exam");
const upload = require("../Middlewares/exam.image.upload");
const checkAuth = require("../Middlewares/checkAuth");
const optionalAuth = require("../Middlewares/optionalAuth");

const router = express.Router();

/* ============================================================
   HELPERS
============================================================ */

const parseJSON = (value) => {
  try {
    return typeof value ==="string" ? JSON.parse(value) : value;
  } catch {
    return value;
  }
};

const validateObjectIds = (array = []) => {
  if (!Array.isArray(array)) return [];
  return array.filter(id => mongoose.Types.ObjectId.isValid(id));
};

/* ============================================================
   CREATE EXAM
============================================================ */

router.post("/create", checkAuth, upload.single("examImage"), async (req, res) => {
  try {
    const { slug, name, categoryId } = req.body;

    if (!slug || !name || !categoryId) {
      return res.status(400).json({ message:"Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message:"Invalid categoryId" });
    }

    const existing = await Exam.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message:"Slug already exists" });
    }

    const exam = new Exam({
      ...req.body,
      slug: slug.toLowerCase(),

      phases: parseJSON(req.body.phases) || [],
      cutoffs: parseJSON(req.body.cutoffs) || [],
      vacancies: parseJSON(req.body.vacancies) || [],
      eligibility: parseJSON(req.body.eligibility) || {},
      importantDates: parseJSON(req.body.importantDates) || {},
      seo: parseJSON(req.body.seo) || {},

      courses: validateObjectIds(parseJSON(req.body.courses)),
      books: validateObjectIds(parseJSON(req.body.books)),
      courseContents: validateObjectIds(parseJSON(req.body.courseContents)),
      testSeries: validateObjectIds(parseJSON(req.body.testSeries)),
      mappedResources: {
        syllabus: validateObjectIds((parseJSON(req.body.mappedResources) || {}).syllabus),
        pyqs: validateObjectIds((parseJSON(req.body.mappedResources) || {}).pyqs),
        notifications: validateObjectIds((parseJSON(req.body.mappedResources) || {}).notifications),
        currentAffairs: validateObjectIds((parseJSON(req.body.mappedResources) || {}).currentAffairs),
      },

      uploadedBy: req.user.role ==="TEACHER" ? req.user.id : (req.body.uploadedBy || null),

      examImage: req.file
        ? `/uploads/exams/${req.file.filename}`
        :""
    });

    // Auto counters
    exam.totalCoursesLinked = exam.courses.length;
    exam.totalBooksLinked = exam.books.length;

    await exam.save();

    // Notify admin when a teacher uploads a new exam
    try {
      const Notification = require("../Models/NotificationModel");
      const uploaderName = exam.uploadedBy ? (req.teacher?.tname || req.user?.name ||"A Teacher") :"Admin";
      await Notification.create({
        recipient:'admin',
        recipientModel:'Admin',
        sender: exam.uploadedBy || null,
        senderModel:'Teacher',
        senderName: uploaderName,
        type:'course_upload',
        title:'New Exam Uploaded',
        message: `Teacher"${uploaderName}" has uploaded a new Exam:"${exam.name}" for review and activation.`,
        referenceId: exam._id
      });
      console.log('Notification triggered: New exam uploaded by teacher.');
    } catch (notifErr) {
      console.error('Failed to trigger exam upload notification:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message:"Exam created successfully",
      data: exam
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET ALL EXAMS
============================================================ */

router.get("/all", optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      level,
      mode,
      status,
      uploadedBy,
      isManagement
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options:"i" } },
        { description: { $regex: search, $options:"i" } }
      ];
    }

    if (level) query.examLevel = level;
    if (mode) query.mode = mode;
    if (status) query.status = status;

    // Force teacher filter ONLY IF we are in management context
    if (req.user && req.user.role ==="TEACHER" && isManagement ==="true") {
      query.uploadedBy = req.user.id;
    } else if (uploadedBy) {
      query.uploadedBy = uploadedBy;
    }

    const skip = (page - 1) * limit;

    const exams = await Exam.find(query)
      .populate("categoryId","name")
      .populate("courses","title price status")
      .populate("books","title price coverImage isApproved")
      .populate("courseContents","title")
      .populate("mappedResources.syllabus","title examName")
      .populate("mappedResources.pyqs","title examName year")
      .populate("mappedResources.notifications","title organization_name")
      .populate("mappedResources.currentAffairs","title type")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Exam.countDocuments(query);

    res.json({
      success: true,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalExams: total,
      exams
    });

  } catch (err) {
    console.error("Fetch Exams Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   GET EXAM BY SLUG
============================================================ */

router.get("/slug/:slug", async (req, res) => {
  try {
    const exam = await Exam.findOne({
      slug: req.params.slug,
      status:"ACTIVE"
    })
      .populate({
        path:"categoryId",
        select:"name slug description icon"
      })
      .populate({
        path:"courses",
        populate: [
          { path:"teacher_id", select:"tname temail tspecialization tprofile" },
          { path:"approvedBy", select:"aname aemail" }
        ]
      })
      .populate({
        path:"courseContents"
      })
      .populate({
        path:"books",
        populate: {
          path:"approvedBy",
          select:"aname aemail"
        }
      })
      .populate("mappedResources.syllabus")
      .populate("mappedResources.pyqs")
      .populate("mappedResources.notifications")
      .populate("mappedResources.currentAffairs");

    if (!exam) {
      return res.status(404).json({ message:"Exam not found" });
    }

    exam.views += 1;
    await exam.save();

    res.json({ success: true, data: exam });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


/* ============================================================
   GET EXAMS BY CATEGORY
============================================================ */

router.get("/by-category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message:"Invalid Category ID" });
    }

    const exams = await Exam.find({
      categoryId,
      status:"ACTIVE"
    }).select("name slug shortDescription examLevel mode examImage");

    res.json({
      success: true,
      count: exams.length,
      exams
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   UPDATE EXAM
============================================================ */

router.put("/:id", checkAuth, upload.single("examImage"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message:"Invalid Exam ID" });
    }

    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ message:"Exam not found" });
    }

    // Ownership check
    if (req.user.role ==="TEACHER" && exam.uploadedBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message:"Access denied. You do not own this record." });
    }

    const updateData = {
      ...req.body,

      phases: parseJSON(req.body.phases),
      cutoffs: parseJSON(req.body.cutoffs),
      vacancies: parseJSON(req.body.vacancies),
      eligibility: parseJSON(req.body.eligibility),
      importantDates: parseJSON(req.body.importantDates),
      seo: parseJSON(req.body.seo),
      courses: validateObjectIds(parseJSON(req.body.courses)),
      books: validateObjectIds(parseJSON(req.body.books)),
      courseContents: validateObjectIds(parseJSON(req.body.courseContents)),
      testSeries: validateObjectIds(parseJSON(req.body.testSeries)),
      mappedResources: {
        syllabus: validateObjectIds((parseJSON(req.body.mappedResources) || {}).syllabus),
        pyqs: validateObjectIds((parseJSON(req.body.mappedResources) || {}).pyqs),
        notifications: validateObjectIds((parseJSON(req.body.mappedResources) || {}).notifications),
        currentAffairs: validateObjectIds((parseJSON(req.body.mappedResources) || {}).currentAffairs),
      }
    };

    if (req.file) {
      updateData.examImage = `/uploads/exams/${req.file.filename}`;
    }

    updateData.totalCoursesLinked = updateData.courses?.length || 0;
    updateData.totalBooksLinked = updateData.books?.length || 0;

    // Only force INACTIVE if it's a TEACHER edit or if status isn't explicitly provided
    if (req.user.role ==="TEACHER") {
      updateData.status ="INACTIVE";
    } else if (req.body.status) {
      updateData.status = req.body.status;
    } else {
      // For general edits without status specified, keep original or force inactive as per policy
      // Original code was forcing INACTIVE on every edit
      updateData.status ='INACTIVE';
    }

    const previousStatus = exam.status;
    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Notify teacher and students when admin activates an exam
    if (previousStatus !=='ACTIVE' && updatedExam.status ==='ACTIVE') {
      try {
        const Notification = require("../Models/NotificationModel");
        // Notify creator teacher
        if (updatedExam.uploadedBy) {
          await Notification.create({
            recipient: updatedExam.uploadedBy.toString(),
            recipientModel:'Teacher',
            sender: null,
            senderModel:'Admin',
            senderName:'EduDocs Team',
            type:'course_upload',
            title:'Exam Activated!',
            message: `Congratulations! Your Exam"${updatedExam.name}" has been activated by the Admin and is now live for students.`,
            referenceId: updatedExam._id
          });
        }
        // Notify all students
        await Notification.create({
          recipient:'all_students',
          recipientModel:'User',
          sender: null,
          senderModel:'Admin',
          senderName:'EduDocs Team',
          type:'course_upload',
          title:'New Exam Published!',
          message: `New Exam Available:"${updatedExam.name}" is now active. Check out syllabus, dates and exam pattern!`,
          referenceId: updatedExam._id
        });
        console.log('Notification triggered: Exam activated by admin.');
      } catch (notifErr) {
        console.error('Failed to trigger exam activation notification:', notifErr.message);
      }
    }

    res.json({
      success: true,
      message:"Exam updated successfully",
      exam: updatedExam
    });

  } catch (err) {
    console.error("Update Exam Error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   SOFT DELETE
============================================================ */

router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message:"Exam not found" });
    }

    // Ownership check
    if (req.user.role ==="TEACHER" && exam.uploadedBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message:"Access denied. You do not own this record." });
    }

    // Soft delete
    exam.status ="INACTIVE";
    await exam.save();

    res.json({
      success: true,
      message:"Exam deactivated successfully"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================================
   MAP RESOURCES (COURSES / BOOKS / CONTENT)
============================================================ */

router.put("/:id/map", async (req, res) => {
  try {
    const { id } = req.params;

    const courses = validateObjectIds(req.body.courses);
    const books = validateObjectIds(req.body.books);
    const courseContents = validateObjectIds(req.body.courseContents);

    const exam = await Exam.findByIdAndUpdate(
      id,
      {
        $set: {
          courses,
          books,
          courseContents,
          totalCoursesLinked: courses.length,
          totalBooksLinked: books.length
        }
      },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message:"Exam not found" });
    }

    res.json({
      success: true,
      message:"Mapping updated successfully",
      exam
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
