const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const checkAuth = require("../Middlewares/checkAuth");

const { CurrentAffair, CurrentAffairCategory } = require("../Models/CurrentAffair");
const officeParser = require("officeparser");
const CurrentAffairReview = require("../Models/CurrentAffairReview");

const router = express.Router();

/* ================= CREATE UPLOAD DIR IF NOT EXISTS ================= */
const uploadDir = path.join(__dirname,"../uploads/current-affairs");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() +"-" + file.originalname.replace(/\s+/g,"-");
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});


router.post("/category/create", async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message:"Name & slug required" });
    }

    const exists = await CurrentAffairCategory.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message:"Slug already exists" });
    }

    const category = await CurrentAffairCategory.create({
      name,
      slug,
      description,
      isActive: true
    });

    res.json({ success: true, category });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/category/all", checkAuth, async (req, res) => {
  try {
    const categories = await CurrentAffairCategory.find().sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/category/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await CurrentAffairCategory.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message:"Category not found" });
    }

    res.json({ success: true, updated });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.delete("/category/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const linkedAffairs = await CurrentAffair.findOne({ categoryId: id });

    if (linkedAffairs) {
      return res.status(400).json({
        message:"Cannot delete. Current affairs exist under this category."
      });
    }

    await CurrentAffairCategory.findByIdAndDelete(id);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




// ... (Multer config remains the same)

router.post(
"/create",
  checkAuth,
  upload.fields([
    { name:"coverImage", maxCount: 1 },
    { name:"pdfFile", maxCount: 1 },
    { name:"pptFile", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        title,
        slug,
        type,
        categoryId,
        shortDescription,
        content,
        tags,
        seo,
        publishDate,
        rating
      } = req.body;

      if (!title || !slug || !type || !categoryId) {
        return res.status(400).json({ message:"Required fields missing" });
      }

      const formattedType = type.toUpperCase();

      const exists = await CurrentAffair.findOne({ slug });
      if (exists) {
        return res.status(400).json({ message:"Slug already exists" });
      }

      const affair = new CurrentAffair({
        title,
        slug,
        type: formattedType,
        categoryId,
        shortDescription,
        content,
        rating: Number(rating) || 3,
        publishDate: publishDate || new Date(),
        tags: tags ? JSON.parse(tags) : [],
        seo: seo ? JSON.parse(seo) : {},
        status:"ACTIVE",
        uploadedBy: req.user.role ==="TEACHER" ? req.user.id : (req.body.uploadedBy || null),
        coverImage: req.files?.coverImage
          ? `/uploads/current-affairs/${req.files.coverImage[0].filename}`
          :"",
        pdfFile: req.files?.pdfFile
          ? `/uploads/current-affairs/${req.files.pdfFile[0].filename}`
          :"",
        pptFile: req.files?.pptFile
          ? `/uploads/current-affairs/${req.files.pptFile[0].filename}`
          :""
      });

      await affair.save();

      res.json({ success: true, affair });

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


/* Public endpoint  approved AND active only */
router.get("/approved", async (req, res) => {
  try {
    const affairs = await CurrentAffair.find({ isApproved: true, status:"ACTIVE" })
      .populate("categoryId","name")
      .sort({ publishDate: -1 });

    res.json({ success: true, affairs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/all", checkAuth, async (req, res) => {
  try {
    const { type, page = 1, limit = 10, search } = req.query;

    const query = {};

    if (type) query.type = type.toUpperCase();
    if (search) {
      query.title = { $regex: search, $options:"i" };
    }

    // Force teacher filter
    if (req.user.role ==="TEACHER") {
      query.uploadedBy = req.user.id;
    } else if (req.query.uploadedBy) {
      query.uploadedBy = req.query.uploadedBy;
    }

    const total = await CurrentAffair.countDocuments(query);

    const data = await CurrentAffair.find(query)
      .populate("categoryId","name")
      .sort({ publishDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({
      success: true,
      total,
      data
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const affair = await CurrentAffair.findById(req.params.id)
      .populate("categoryId","name");

    if (!affair) {
      return res.status(404).json({ message:"Not found" });
    }

    res.json({ success: true, affair });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




router.put(
"/:id",
  checkAuth,
  upload.fields([
    { name:"coverImage", maxCount: 1 },
    { name:"pdfFile", maxCount: 1 },
    { name:"pptFile", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const affair = await CurrentAffair.findById(id);
      if (!affair) {
        return res.status(404).json({ message:"Not found" });
      }

      // Ownership check
      if (req.user.role ==="TEACHER" && affair.uploadedBy?.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message:"Access denied. You do not own this record." });
      }

      const updateData = {
        ...req.body,
        tags: req.body.tags ? JSON.parse(req.body.tags) : affair.tags,
        seo: req.body.seo ? JSON.parse(req.body.seo) : affair.seo
      };

      if (req.body.type) {
        updateData.type = req.body.type.toUpperCase();
      }

      if (req.files?.coverImage) {
        updateData.coverImage =
          `/uploads/current-affairs/${req.files.coverImage[0].filename}`;
      }

      if (req.files?.pdfFile) {
        updateData.pdfFile =
          `/uploads/current-affairs/${req.files.pdfFile[0].filename}`;
      }

      if (req.files?.pptFile) {
        updateData.pptFile =
          `/uploads/current-affairs/${req.files.pptFile[0].filename}`;
      }

      // Reset to pending on every edit (admin must re-approve)
      updateData.isApproved = false;

      const updated = await CurrentAffair.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      res.json({ success: true, updated });

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);




router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const affair = await CurrentAffair.findById(id);
    if (!affair) {
      return res.status(404).json({ message:"Not found" });
    }

    // Ownership check
    if (req.user.role ==="TEACHER" && affair.uploadedBy?.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message:"Access denied. You do not own this record." });
    }

    await CurrentAffair.findByIdAndDelete(id);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["ACTIVE","INACTIVE"].includes(status)) {
      return res.status(400).json({ message:"Invalid status value" });
    }

    const updated = await CurrentAffair.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ success: true, updated });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/details/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    let query = { slug };

    // Only search by _id if it's valid ObjectId
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = {
        $or: [
          { slug },
          { _id: slug }
        ]
      };
    }

    const affair = await CurrentAffair.findOne({ ...query, status:"ACTIVE", isApproved: true })
      .populate("categoryId","name");

    if (!affair) {
      return res.status(404).json({ message:"Current affair not found" });
    }

    res.json({ success: true, data: affair });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/approve", async (req, res) => {
  try {
    const { isApproved } = req.body;
    const updated = await CurrentAffair.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete("/:id/file/:fileType", async (req, res) => {
  try {
    const { id, fileType } = req.params;

    if (!["coverImage","pdfFile","pptFile"].includes(fileType)) {
      return res.status(400).json({ message:"Invalid file type" });
    }

    const affair = await CurrentAffair.findById(id);
    if (!affair) {
      return res.status(404).json({ message:"Current affair not found" });
    }

    const filePath = affair[fileType];
    if (filePath) {
      const fullPath = path.join(__dirname,"../", filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    affair[fileType] ="";
    await affair.save();

    res.json({ success: true, message: `${fileType} deleted successfully` });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// STATISTICS
router.get("/stats/overview", checkAuth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role ==="TEACHER") {
      filter.uploadedBy = req.user.id;
    }

    const [total, active, inactive, categories] = await Promise.all([
      CurrentAffair.countDocuments(filter),
      CurrentAffair.countDocuments({ ...filter, status:"ACTIVE" }),
      CurrentAffair.countDocuments({ ...filter, status:"INACTIVE" }),
      CurrentAffairCategory.countDocuments()
    ]);

    res.json({
      success: true,
      stats: { total, active, inactive, categories }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ================= PARSE PPT ================= */
router.post("/parse-ppt", checkAuth, upload.single("pptFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No PPT uploaded" });
    }

    const filePath = req.file.path;

    // Wrap callback-based API into Promise
    const text = await new Promise((resolve, reject) => {
      officeParser.parseOffice(filePath, (data, err) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    // cleanup
    fs.unlinkSync(filePath);

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "No readable content found in PPT",
      });
    }

    // Split slides by form-feed
    const slides = text
      .split(/\f/)
      .map(s => s.trim())
      .filter(Boolean);

    let htmlContent = "";
    if (slides.length > 0) {
      slides.forEach((slide, index) => {
        const lines = slide.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          htmlContent += `<h3>Slide ${index + 1}: ${lines[0]}</h3>`;
          if (lines.length > 1) {
            htmlContent += `<p>${lines.slice(1).join("<br />")}</p>`;
          }
          htmlContent += `<hr />`;
        }
      });
    } else {
      htmlContent = `<p>${text.replace(/\n/g, "<br />")}</p>`;
    }

    return res.json({
      success: true,
      text: htmlContent,
    });

  } catch (err) {
    console.error("PPT parse error:", err);
    return res.status(500).json({
      success: false,
      message: "PPT parsing failed",
    });
  }
});

/* ================= COMMENTS & RATINGS ================= */
router.post("/:id/reviews", checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: "Rating and comment are required" });
    }

    const student_id = req.user.id;

    // Check if user already reviewed
    const existing = await CurrentAffairReview.findOne({ current_affair_id: id, student_id });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
    } else {
      await CurrentAffairReview.create({
        current_affair_id: id,
        student_id,
        rating,
        comment
      });
    }

    res.json({ success: true, message: "Review submitted successfully" });
  } catch (err) {
    console.error("Review submission error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await CurrentAffairReview.find({ current_affair_id: id })
      .populate("student_id", "name")
      .sort({ createdAt: -1 });

    const avg = reviews.length > 0 
      ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length 
      : 0;

    res.json({
      success: true,
      reviews,
      averageRating: avg.toFixed(1),
      total: reviews.length
    });
  } catch (err) {
    console.error("Fetch reviews error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
