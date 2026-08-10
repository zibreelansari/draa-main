const express = require("express");
const ExamCategory = require("../Models/ExamCategory");
const Exam = require("../Models/Exam");

const router = express.Router();

/**
 * CREATE CATEGORY (ADMIN)
 */
router.post("/create", async (req, res) => {
  try {
    const exists = await ExamCategory.findOne({ slug: req.body.slug });
    if (exists) {
      return res.status(409).json({ message:"Category already exists" });
    }

    const category = await ExamCategory.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * GET ALL ACTIVE CATEGORIES (PUBLIC / ADMIN)
 */
router.get("/all", async (req, res) => {
  const categories = await ExamCategory.find({ isActive: true })
    .sort({ createdAt: -1 });

  res.json({ categories });
});

/**
 * UPDATE CATEGORY
 */
router.put("/:id", async (req, res) => {
  const category = await ExamCategory.findByIdAndUpdate(
    req.params.id,
    { ...req.body, isActive: false },
    { new: true }
  );

  if (!category) {
    return res.status(404).json({ message:"Category not found" });
  }

  res.json({ success: true, category });
});

/**
 * DELETE CATEGORY (SOFT)
 */
router.delete("/:id", async (req, res) => {
  const examCount = await Exam.countDocuments({
    categoryId: req.params.id,
    status:"ACTIVE"
  });

  if (examCount > 0) {
    return res.status(400).json({
      message:"Category has active exams. Cannot delete."
    });
  }

  await ExamCategory.findByIdAndUpdate(req.params.id, {
    isActive: false
  });

  res.json({ success: true, message:"Category deactivated" });
});

module.exports = router;
