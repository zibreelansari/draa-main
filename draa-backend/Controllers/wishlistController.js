// Controllers/wishlistController.js

const mongoose = require("mongoose");
const Wishlist = require("../Models/WishLists.models");
const Book = require("../Models/booksModel");
const Course = require("../Models/CourseModel");
//  test_series items are ExaminationCategory documents
const ExaminationCategory = require("../Models/ExaminationCategory.models");
const TopicCategory = require("../Models/Topic.models");
const Subject = require("../Models/Subject.models");

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

/* =========================================================
   SAFE DISCOUNT CALC  avoids NaN when price is 0 / null
========================================================= */
const applyDiscount = (price, pct) => {
  const p = Number(price) || 0;
  const d = Number(pct) || 0;
  if (p <= 0) return 0;
  return Math.max(0, p - (p * d) / 100);
};

/* =========================================================
   SNAPSHOT BUILDER
   book            Book model
   course          Course model
   test_series     ExaminationCategory model
========================================================= */
const buildSnapshot = async (item_type, item_id) => {

  /*  BOOK  */
  if (item_type ==="book") {
    //  NO populate  category is sometimes stored as a plain string (e.g."GOVERNMENT")
    // not an ObjectId, so populate() throws a CastError. We read it raw instead.
    const book = await Book.findById(item_id).lean();
    if (!book) throw new Error("Book not found");

    // Resolve category name safely regardless of how it is stored
    let categoryName = null;
    if (book.category) {
      if (typeof book.category ==="string") {
        // already a plain string label  use as-is
        categoryName = book.category;
      } else if (book.category?.name) {
        // already populated object
        categoryName = book.category.name;
      } else if (mongoose.Types.ObjectId.isValid(String(book.category))) {
        // it IS a valid ObjectId  try to populate manually, but never crash
        try {
          const BookCategory = mongoose.models.BookCategory ||
            require("../Models/BookCategoryModel"); // adjust path if needed
          const cat = await BookCategory.findById(book.category).select("name").lean();
          categoryName = cat?.name || null;
        } catch (_) {
          categoryName = null; // category lookup failed silently
        }
      }
    }

    const physPrice = Number(book.physicalPrice) || 0;
    const digPrice  = Number(book.digitalPrice)  || 0;
    const physDisc  = Number(book.physicalDiscountPercentage) || 0;
    const digDisc   = Number(book.digitalDiscountPercentage)  || 0;

    const physFinal = applyDiscount(physPrice, physDisc);
    const digFinal  = applyDiscount(digPrice,  digDisc);

    //"price" = best available final price for UI
    const price = digFinal || physFinal || digPrice || physPrice || 0;

    return {
      // identity
      title:      book.title      ||"Untitled Book",
      subtitle:   book.author     ||"",
      author:     book.author     ||"",       // kept for UI compat
      image:      book.coverImage || null,
      coverImage: book.coverImage || null,     // kept for UI compat
      slug:       book.seo?.slug  || null,

      // pricing
      price,
      originalPrice:              digPrice  || physPrice || 0,
      discount:                   digDisc   || physDisc  || 0,
      digitalPrice:               digPrice,
      physicalPrice:              physPrice,
      digitalDiscountPercentage:  digDisc,
      physicalDiscountPercentage: physDisc,
      digitalFinalPrice:          digFinal,
      physicalFinalPrice:         physFinal,

      // meta
      category:        categoryName,
      language:        book.language        ||"English",
      bookType:        book.bookType        ||"pdftype",
      pages:           book.pages           || null,
      isbn:            book.isbn            || null,
      publicationName: book.publicationName || null,
      publicationYear: book.publicationYear || null,
      tags:            book.tags            || [],
      features:        book.features        || [],

      // engagement
      views:       Number(book.views)     || 0,
      downloads:   Number(book.downloads) || 0,
      isFeatured:  book.isFeatured        || false,
      isPopular:   book.isPopular         || false,
      isPaid:      price > 0,
      isAvailable: book.isApproved        || false,

      // gallery
      addOnImages: book.addOnImages || [],
    };
  }

  /*  COURSE  */
  if (item_type ==="course") {
    const course = await Course.findById(item_id)
      .populate("teacher_id","name tname profilePic")
      .lean();
    if (!course) throw new Error("Course not found");

    const actualPrice = Number(course.actual_price) || Number(course.price) || 0;
    const discPct     = Number(course.discount_percentage) || 0;
    const finalPrice  = applyDiscount(actualPrice, discPct) || actualPrice;

    let pdfCount   = 0;
    let videoCount = 0;
    if (Array.isArray(course.chapters)) {
      course.chapters.forEach((ch) => {
        if (Array.isArray(ch.videos))    videoCount += ch.videos.length;
        if (Array.isArray(ch.materials)) pdfCount   += ch.materials.length;
        if (Array.isArray(ch.pdfs))      pdfCount   += ch.pdfs.length;
      });
    }
    if (Array.isArray(course.materials)) pdfCount += course.materials.length;

    const teacherName =
      course.teacher_id?.name ||
      course.teacher_id?.tname ||
"Expert Faculty";

    return {
      // identity
      title:    course.title                          ||"Untitled Course",
      subtitle: teacherName,
      image:    course.coverphoto || course.thumbnail || null,
      slug:     course.slug                           || null,

      // pricing
      price:         finalPrice,
      originalPrice: actualPrice,
      discount:      discPct,

      // meta
      category: course.course_category || null,
      language: course.language        ||"English",
      tags:     course.tags            || [],

      // content stats
      chapters:           Array.isArray(course.chapters)      ? course.chapters.length      : 0,
      video_count:        videoCount,
      pdf_count:          pdfCount,
      materials:          pdfCount,
      practice_set_count: Array.isArray(course.practice_sets) ? course.practice_sets.length : 0,

      // engagement
      rating:      Number(course.rating)      || 0,
      ratingCount: Number(course.ratingCount) || course.reviews?.length || 0,
      students:    Number(course.enrolledStudents || course.students) || 0,
      views:       Number(course.views)       || 0,
      isFeatured:  course.isFeatured          || false,
      isPopular:   course.isPopular           || false,
      isPaid:      finalPrice > 0,
      isAvailable: course.isActive || course.isApproved || true,

      // teacher
      teacher: {
        name:       teacherName,
        profilePic: course.teacher_id?.profilePic || null,
      },
    };
  }

  /*  TEST SERIES    ExaminationCategory  */
  if (item_type ==="test_series") {
    const exam = await ExaminationCategory.findById(item_id).lean();
    if (!exam) throw new Error("Examination category not found");

    const origPrice  = Number(exam.originalPrice) || Number(exam.price) || 0;
    const discPct    = Number(exam.discount)       || 0;
    const finalPrice = applyDiscount(origPrice, discPct) || Number(exam.price) || 0;

    return {
      // identity
      title:    exam.name        ||"Exam Preparation",
      subtitle: exam.description || exam.name ||"",
      name:     exam.name        ||"",        // UI uses both title & name
      image:    exam.bannerImage || null,
      slug:     null,

      // pricing
      price:         finalPrice,
      originalPrice: origPrice,
      discount:      discPct,
      isPaid:        exam.isPaid || finalPrice > 0,

      // meta
      category:    exam.name        || null,
      examCode:    exam.code        || null,
      year:        exam.year        || null,
      language:"English",
      tags:        exam.syllabus    || [],
      description: exam.description ||"",

      // exam pattern from the category itself
      totalQuestions:  exam.examPattern?.totalQuestions  || 0,
      totalMarks:      exam.examPattern?.totalMarks      || 0,
      duration:        exam.examPattern?.duration        || 0,
      negativeMarking: exam.examPattern?.negativeMarking || false,

      // key dates
      examDate:              exam.examDate              || null,
      registrationStartDate: exam.registrationStartDate || null,
      registrationEndDate:   exam.registrationEndDate   || null,

      // application fee
      applicationFee: {
        general:  exam.applicationFee?.general  || 0,
        reserved: exam.applicationFee?.reserved || 0,
      },

      // engagement / flags
      rating:      0,
      ratingCount: 0,
      students:    0,
      views:       0,
      isFeatured:  false,
      isPopular:   (exam.priority || 0) > 5,
      isAvailable: exam.isActive || false,
      priority:    exam.priority || 0,

      // mirror old TestSeries shape so existing UI cards still render correctly
      difficulty:"intermediate",
      testType:"mock",
      maxAttempts: 3,
      statistics: {
        totalTestSeries: 0,
        attemptCount:    0,
        averageScore:    0,
      },
      examPattern: {
        totalQuestions: exam.examPattern?.totalQuestions || 0,
        totalMarks:     exam.examPattern?.totalMarks     || 0,
        duration:       exam.examPattern?.duration       || 0,
      },
    };
  }

  /*  TOPIC (TopicCategory)  */
  if (item_type ==="topic") {
    const topic = await TopicCategory.findById(item_id).populate("subject").lean();
    if (!topic) throw new Error("Topic category not found");

    // Pricing lives on the subject
    const subject = topic.subject || {};
    const origPrice = Number(subject.originalPrice) || Number(subject.price) || 0;
    const discPct = Number(subject.discount) || 0;
    const finalPrice = applyDiscount(origPrice, discPct) || Number(subject.price) || 0;

    return {
      // identity
      title: topic.name ||"Test Topic",
      subtitle: subject.name ? `Part of ${subject.name}` : topic.description ||"",
      name: topic.name ||"",
      image: topic.icon || null, // TopicCategory uses'icon'
      slug: null,

      // pricing
      price: finalPrice,
      originalPrice: origPrice,
      discount: discPct,
      isPaid: subject.isPaid || finalPrice > 0,

      // meta
      category: subject.name ||"Test Series",
      examCode: topic.code || null,
      language:"English",
      description: topic.description ||"",

      // engagement
      rating: 0,
      ratingCount: 0,
      students: 0,
      views: 0,
      isFeatured: false,
      isPopular: (topic.priority || 0) > 5,
      isAvailable: topic.isActive || false,
      priority: topic.priority || 0,

      // UI compatibility (same shape as test_series)
      totalQuestions: 0,
      totalMarks: 0,
      duration: 0,
      difficulty: topic.difficulty ||"intermediate",
    };
  }

  throw new Error("Invalid item type. Must be: book | course | test_series | topic");
};

/* =========================================================
   HELPER
========================================================= */
const getUserId = (req) => req.user?.userId || req.user?.id || null;

/* =========================================================
   ADD TO WISHLIST
   POST /wishlist/add
========================================================= */
exports.addToWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { item_type, item_id } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message:"Unauthorized" });
    }
    if (!item_type || !item_id) {
      return res.status(400).json({ success: false, message:"item_type and item_id are required" });
    }

    const allowedTypes = ["book","course","test_series","topic"];
    if (!allowedTypes.includes(item_type)) {
      return res.status(400).json({
        success: false,
        message: `item_type must be one of: ${allowedTypes.join(",")}`,
      });
    }
    if (!mongoose.Types.ObjectId.isValid(item_id)) {
      return res.status(400).json({ success: false, message:"Invalid item_id" });
    }

    // Duplicate check
    const exists = await Wishlist.findOne({
      user_id: toObjectId(userId),
      item_type,
      item_id: toObjectId(item_id),
      isRemoved: false,
    });

    if (exists) {
      return res.status(200).json({
        success: false,
        alreadyWishlisted: true,
        message:"Item already in wishlist",
        data: exists,
      });
    }

    const snapshot = await buildSnapshot(item_type, item_id);
    const { priority ="medium", notes ="" } = req.body;

    const wishlistItem = await Wishlist.create({
      user_id: toObjectId(userId),
      item_type,
      item_id: toObjectId(item_id),
      snapshot,
      priority,
      notes: notes?.slice(0, 300),
      addedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message:"Added to wishlist",
      data: wishlistItem,
    });
  } catch (err) {
    console.error("ADD WISHLIST ERROR:", err);

    if (err.message?.includes("not found")) {
      return res.status(404).json({ success: false, message: err.message });
    }
    if (err.code === 11000) {
      return res.status(200).json({
        success: false,
        alreadyWishlisted: true,
        message:"Item already in wishlist",
      });
    }

    return res.status(500).json({ success: false, message: err.message ||"Server error" });
  }
};

/* =========================================================
   REMOVE FROM WISHLIST
   DELETE /wishlist/remove
========================================================= */
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { item_type, item_id } = req.body;

    if (!userId) return res.status(401).json({ success: false, message:"Unauthorized" });
    if (!item_type || !item_id) {
      return res.status(400).json({ success: false, message:"item_type and item_id are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(item_id)) {
      return res.status(400).json({ success: false, message:"Invalid item_id" });
    }

    const deleted = await Wishlist.findOneAndDelete({
      user_id: toObjectId(userId),
      item_type,
      item_id: toObjectId(item_id),
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message:"Item not found in wishlist" });
    }

    return res.status(200).json({
      success: true,
      message:"Removed from wishlist",
      data: { item_type, item_id },
    });
  } catch (err) {
    console.error("REMOVE WISHLIST ERROR:", err);
    return res.status(500).json({ success: false, message:"Server error" });
  }
};

/* =========================================================
   GET MY WISHLIST
   GET /wishlist/my
========================================================= */
exports.getMyWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message:"Unauthorized" });

    const { type, sort ="newest", page = 1, limit = 20 } = req.query;

    const filter = { user_id: toObjectId(userId), isRemoved: false };
    if (type && ["book","course","test_series","topic"].includes(type)) {
      filter.item_type = type;
    }

    const sortMap = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt:  1 },
      price_asc:  {"snapshot.price":  1 },
      price_desc: {"snapshot.price": -1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Wishlist.find(filter).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(parseInt(limit)).lean(),
      Wishlist.countDocuments(filter),
    ]);

    const countByType = await Wishlist.aggregate([
      { $match: { user_id: toObjectId(userId), isRemoved: false } },
      { $group: { _id:"$item_type", count: { $sum: 1 } } },
    ]);

    const typeCounts = { book: 0, course: 0, test_series: 0, topic: 0 };
    countByType.forEach(({ _id, count }) => {
      if (_id in typeCounts) typeCounts[_id] = count;
    });

    return res.status(200).json({
      success: true,
      data: {
        total,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
        typeCounts,
        items,
      },
    });
  } catch (err) {
    console.error("GET WISHLIST ERROR:", err);
    return res.status(500).json({ success: false, message:"Server error" });
  }
};

/* =========================================================
   CHECK
   GET /wishlist/check?item_type=book&item_id=xxx
========================================================= */
exports.checkWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message:"Unauthorized" });

    const { item_type, item_id } = req.query;
    if (!item_type || !item_id) {
      return res.status(400).json({ success: false, message:"item_type and item_id query params are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(item_id)) {
      return res.status(400).json({ success: false, message:"Invalid item_id" });
    }

    const exists = await Wishlist.findOne({
      user_id: toObjectId(userId),
      item_type,
      item_id: toObjectId(item_id),
      isRemoved: false,
    }).lean();

    return res.status(200).json({ success: true, isWishlisted: !!exists, data: exists || null });
  } catch (err) {
    console.error("CHECK WISHLIST ERROR:", err);
    return res.status(500).json({ success: false, message:"Server error" });
  }
};

/* =========================================================
   CLEAR
   DELETE /wishlist/clear
========================================================= */
exports.clearWishlist = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message:"Unauthorized" });

    const result = await Wishlist.deleteMany({ user_id: toObjectId(userId) });

    return res.status(200).json({ success: true, message:"Wishlist cleared", deletedCount: result.deletedCount });
  } catch (err) {
    console.error("CLEAR WISHLIST ERROR:", err);
    return res.status(500).json({ success: false, message:"Server error" });
  }
};

/* =========================================================
   UPDATE PRIORITY / NOTES
   PATCH /wishlist/update
========================================================= */
exports.updateWishlistItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message:"Unauthorized" });

    const { item_type, item_id, priority, notes } = req.body;
    if (!item_type || !item_id) {
      return res.status(400).json({ success: false, message:"item_type and item_id are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(item_id)) {
      return res.status(400).json({ success: false, message:"Invalid item_id" });
    }

    const updateFields = {};
    if (priority && ["low","medium","high"].includes(priority)) updateFields.priority = priority;
    if (notes !== undefined) updateFields.notes = notes?.slice(0, 300);

    if (!Object.keys(updateFields).length) {
      return res.status(400).json({ success: false, message:"Provide at least one field: priority or notes" });
    }

    const updated = await Wishlist.findOneAndUpdate(
      { user_id: toObjectId(userId), item_type, item_id: toObjectId(item_id), isRemoved: false },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message:"Wishlist item not found" });

    return res.status(200).json({ success: true, message:"Wishlist item updated", data: updated });
  } catch (err) {
    console.error("UPDATE WISHLIST ERROR:", err);
    return res.status(500).json({ success: false, message:"Server error" });
  }
};

/* =========================================================
   REFRESH SNAPSHOT
   POST /wishlist/refresh
========================================================= */
exports.refreshSnapshot = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message:"Unauthorized" });

    const { item_type, item_id } = req.body;
    if (!item_type || !item_id) {
      return res.status(400).json({ success: false, message:"item_type and item_id are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(item_id)) {
      return res.status(400).json({ success: false, message:"Invalid item_id" });
    }

    const snapshot = await buildSnapshot(item_type, item_id);

    const updated = await Wishlist.findOneAndUpdate(
      { user_id: toObjectId(userId), item_type, item_id: toObjectId(item_id) },
      { $set: { snapshot } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message:"Wishlist item not found" });

    return res.status(200).json({ success: true, message:"Snapshot refreshed", data: updated });
  } catch (err) {
    console.error("REFRESH SNAPSHOT ERROR:", err);
    return res.status(500).json({ success: false, message:"Server error" });
  }
};