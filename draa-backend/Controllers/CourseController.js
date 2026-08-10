const Course = require("../Models/CourseModel");
const CourseCategory = require("../Models/courseCategoriesModels");

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g,'')
    .replace(/[\s_-]+/g,'-')
    .replace(/^-+|-+$/g,'');
};

//  UPDATED: Create Course with NEW FIELDS
exports.createCourse = async (req, res) => {

  try {
    const {
      title,
      short_desc,
      long_desc,
      actual_price,
      discounted_price,
      discount_percentage,
      enrolled_count,
      price,
      duration,
      teacher_id,
      youtube_links,
      youtube_link,
      language,
      skill_level,
      course_category,
      seo_title,
      meta_keywords,
      meta_description,
      slug,
      og_title,
      og_description,
      canonical_url,
      robots,
      schema_markup,
      chapters,
      //  NEW FIELDS
      who_this_course_is_for,
      what_you_will_learn,
      course_features,
      course_faqs,


    } = req.body;

    //  SAFE CHAPTERS PARSING
    let parsedChapters = [];

    try {
      parsedChapters = JSON.parse(chapters ||'[]');
    } catch (error) {
      return res.status(400).json({ error:"Invalid chapters data" });
    }

    //  NEW: Parse new fields safely
    let parsedWhoThisCourseIsFor = [];
    let parsedWhatYouWillLearn = [];
    let parsedCourseFeatures = [];
    let parsedCourseFaqs = [];


    try {
      parsedWhoThisCourseIsFor = JSON.parse(who_this_course_is_for ||'[]');
      parsedWhatYouWillLearn = JSON.parse(what_you_will_learn ||'[]');
      parsedCourseFeatures = JSON.parse(course_features ||'[]');
      parsedCourseFaqs = JSON.parse(course_faqs ||'[]');

    } catch (error) {
      return res.status(400).json({ error:"Invalid course details data" });
    }

    //  VALIDATE REQUIRED FIELDS
    if (!title || !short_desc || !long_desc || !course_category || !teacher_id || !language || !skill_level || !duration) {
      return res.status(400).json({
        error:"Missing required fields: title, short_desc, long_desc, course_category, teacher_id, language, skill_level, duration"
      });
    }

    //  CATEGORY VALIDATION
    const categoryRef = await CourseCategory.findOne({
      name: course_category,
      isActive: true
    });

    if (!categoryRef) {
      return res.status(400).json({
        error: `Course category'${course_category}' not found or inactive`
      });
    }

    //  SLUG VALIDATION (UNIQUE)
    const courseSlug = slug || generateSlug(title);
    const existingCourse = await Course.findOne({'seo.slug': courseSlug });
    if (existingCourse) {
      return res.status(400).json({
        error:"Course slug already exists. Please use a different slug."
      });
    }

    //  COVER PHOTO REQUIRED
    const coverFile = req.files.find(
      file => file.fieldname ==="coverphoto"
    );

    if (!coverFile) {
      return res.status(400).json({
        error:"Cover photo is required"
      });
    }


    //  SYLLABUS HANDLING (OPTIONAL)
    const syllabusFile = req.files.find(
      file => file.fieldname ==="syllabus"
    );

    const syllabusPath = syllabusFile ? syllabusFile.path :"";
    //  UPDATED CHAPTER PROCESSING
    //  UPDATED CHAPTER PROCESSING (upload.any() compatible)

    const chapterData = parsedChapters.map((chapter, index) => {

      const chapterObj = {
        chapter_name: chapter.chapter_name || `Chapter ${index + 1}`,
        order: index + 1,
        youtube_video: chapter.youtube_video ||""
      };

      // Find Study Material
      const studyFile = req.files.find(
        file => file.fieldname === `chapters[${index}][study_material]`
      );

      chapterObj.study_material = studyFile ? studyFile.path :"";

      // Find Practice Set
      const practiceFile = req.files.find(
        file => file.fieldname === `chapters[${index}][practice_set]`
      );

      chapterObj.practice_set = practiceFile ? practiceFile.path :"";

      // Find Other Materials (multiple)
      const otherFiles = req.files.filter(
        file => file.fieldname === `chapters[${index}][other_materials]`
      );

      chapterObj.other_materials = otherFiles.map(f => f.path);

      return chapterObj;
    });



    //  Each chapter must have study_material + practice_set

    const invalidChapters = chapterData.filter(
      ch => !ch.study_material || !ch.practice_set
    );

    if (invalidChapters.length > 0 && parsedChapters.length > 0) {
      return res.status(400).json({
        error:"Each chapter must include Study Material and Practice Set"
      });
    }



    //  YOUTUBE LINKS PROCESSING
    let youtubeLinksArray = [];
    if (youtube_links) {
      try {
        const parsedLinks = JSON.parse(youtube_links);
        youtubeLinksArray = Array.isArray(parsedLinks) ? parsedLinks.map((link, index) => ({
          url: link,
          title: `Video ${index + 1}`,
          order: index,
          thumbnail:""
        })) : [];
      } catch (error) {
        youtubeLinksArray = youtube_link ? [{
          url: youtube_link,
          title:'Main Video',
          order: 0,
          thumbnail:""
        }] : [];
      }
    } else if (youtube_link) {
      youtubeLinksArray = [{
        url: youtube_link,
        title:'Main Video',
        order: 0,
        thumbnail:""
      }];
    }

    //  PRICING CALCULATION
    const parsedActualPrice = parseFloat(actual_price) || parseFloat(price) || 0;
    const parsedDiscountedPrice = parseFloat(discounted_price) || parseFloat(price) || 0;
    const parsedDiscountPercentage = parseFloat(discount_percentage) || 0;
    const parsedEnrolledCount = parseInt(enrolled_count) || 0;
    const parsedDuration = parseInt(duration) || 0;

    //  AUTO-CALCULATE DISCOUNT
    let finalDiscountPercentage = parsedDiscountPercentage;
    if (parsedActualPrice > 0 && parsedDiscountedPrice < parsedActualPrice) {
      finalDiscountPercentage = Math.round(((parsedActualPrice - parsedDiscountedPrice) / parsedActualPrice) * 100);
    }

    //  SEO DATA (FALLBACKS)
    const seoData = {
      seo_title: seo_title || title.substring(0, 60),
      meta_keywords: meta_keywords || `${title}, ${course_category}, online course, ${skill_level}`,
      meta_description: meta_description || short_desc.substring(0, 160),
      slug: courseSlug,
      og_title: og_title || seo_title || title.substring(0, 60),
      og_description: og_description || meta_description || short_desc.substring(0, 160),
      og_image: coverFile.path,
      canonical_url: canonical_url ||"",
      robots: robots ||'index, follow',
      schema_markup: schema_markup ||""
    };

    //  CREATE COURSE WITH ALL FIELDS INCLUDING NEW ONES
    const course = new Course({
      title: title.trim(),
      short_desc: short_desc.trim(),
      long_desc: long_desc.trim(),
      actual_price: parsedActualPrice,
      discounted_price: parsedDiscountedPrice,
      discount_percentage: finalDiscountPercentage,
      price: parsedDiscountedPrice,
      enrolled_count: parsedEnrolledCount,
      duration: parsedDuration,
      teacher_id,
      coverphoto: coverFile.path,
      syllabus: syllabusPath,
      youtube_links: youtubeLinksArray,
      youtube_link: youtube_link || null,
      language,
      skill_level,
      course_category,
      course_category_ref: categoryRef._id,
      chapters: chapterData,
      seo: seoData,
      //  NEW FIELDS ADDED
      who_this_course_is_for: parsedWhoThisCourseIsFor,
      what_you_will_learn: parsedWhatYouWillLearn,
      course_features: parsedCourseFeatures,
      course_faqs: parsedCourseFaqs,

      status:'draft',
      isApproved: false
    });

    //  SAVE COURSE
    await course.save();

    //  UPDATE CATEGORY COUNTER
    await CourseCategory.findByIdAndUpdate(
      categoryRef._id,
      { $inc: { courseCount: 1 } }
    );

    //  RETURN POPULATED COURSE
    const populatedCourse = await Course.findById(course._id)
      .populate('teacher_id','tname temail tprofile tspecialization')
      .populate('course_category_ref','name icon color description slug isActive');

    // Create notification for admin
    try {
      const teacherName = populatedCourse.teacher_id?.tname ||"A Teacher";
      const teacherObjectId = populatedCourse.teacher_id?._id || teacher_id;
      const Notification = require("../Models/NotificationModel");
      
      await Notification.create({
        recipient:'admin',
        recipientModel:'Admin',
        sender: teacherObjectId,
        senderModel:'Teacher',
        senderName: teacherName,
        type:'course_upload',
        title:'New Course Uploaded',
        message: `Teacher ${teacherName} uploaded a new course:"${title}" (Pending Approval)`,
        referenceId: course._id
      });
      console.log('Notification triggered for new course');
    } catch (notifErr) {
      console.error('Failed to trigger admin notification for course:', notifErr);
    }

    // Log successful course upload
    try {
      const { logActivity } = require("../utils/activityLogger");
      await logActivity({
        req,
        actionType: 'upload',
        description: `Teacher uploaded a new course: "${title}" (Status: Pending Approval)`,
        status: 'success',
        metadata: { courseId: course._id, category: course_category }
      });
    } catch (logErr) {
      console.error('Failed to log course upload activity:', logErr);
    }

    res.status(201).json({
      success: true,
      message:" Course created successfully! (Draft - Pending Admin Approval)",
      course: populatedCourse
    });

  } catch (error) {
    console.error('Course creation error:', error);

    // Log course upload failure
    try {
      const { logActivity } = require("../utils/activityLogger");
      await logActivity({
        req,
        actionType: 'upload',
        description: `Failed to create course: "${req.body?.title || 'Unknown Title'}"`,
        status: 'failure',
        metadata: { error: error.message }
      });
    } catch (logErr) {
      console.error('Failed to log course upload failure:', logErr);
    }

    //  VALIDATION ERROR
    if (error.name ==='ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error:"Validation failed",
        details: validationErrors
      });
    }

    //  DUPLICATE KEY ERROR
    if (error.code === 11000) {
      return res.status(400).json({
        error:"Duplicate entry",
        details:"Course with this slug or category already exists"
      });
    }

    //  GENERAL ERROR
    res.status(500).json({
      error:"Course creation failed",
      details: process.env.NODE_ENV ==='development' ? error.message :"Internal server error"
    });
  }
};

// ───────────────────────────────────────────────────────────────────
// DUPLICATE an existing course — copies every field INCLUDING file paths,
// so the new course has the same cover photo, syllabus, and chapter files
// without needing the user to re-upload anything.
// Always resets: status='draft', isApproved=false, enrolled_count=0,
// title suffix " (Copy)", slug suffix "-copy".
// ───────────────────────────────────────────────────────────────────
exports.duplicateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const source = await Course.findById(id).lean();
    if (!source) {
      return res.status(404).json({ success: false, error: "Source course not found" });
    }

    // Build a unique title and slug
    const baseTitle = (source.title || "Untitled Course").trim();
    const baseSlug = (source.seo?.slug) || generateSlug(baseTitle);
    const newTitle = `${baseTitle} (Copy)`;
    let newSlug = `${baseSlug}-copy`;

    // Make sure the slug is unique — fall back to -copy-2, -copy-3, etc.
    let attempt = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await Course.findOne({ "seo.slug": newSlug }).lean()) {
      attempt += 1;
      newSlug = `${baseSlug}-copy-${attempt}`;
    }

    // Copy every field. We strip _id, timestamps, approval metadata,
    // enrollment counts and other instance-specific fields.
    const dup = {
      title: newTitle,
      short_desc: source.short_desc,
      long_desc: source.long_desc,
      description: source.description,
      actual_price: source.actual_price,
      discounted_price: source.discounted_price,
      discount_percentage: source.discount_percentage,
      price: source.discounted_price || source.price,
      duration: source.duration,
      teacher_id: source.teacher_id,
      coverphoto: source.coverphoto,
      syllabus: source.syllabus,
      thumbnail: source.thumbnail,
      youtube_links: Array.isArray(source.youtube_links) ? source.youtube_links : [],
      youtube_link: source.youtube_link,
      language: source.language,
      skill_level: source.skill_level,
      course_category: source.course_category,
      course_category_ref: source.course_category_ref,
      category: source.category,
      subcategory: source.subcategory,
      tags: Array.isArray(source.tags) ? source.tags : [],
      instructor: source.instructor,
      featured: false,
      who_this_course_is_for: Array.isArray(source.who_this_course_is_for) ? source.who_this_course_is_for : [],
      what_you_will_learn: Array.isArray(source.what_you_will_learn) ? source.what_you_will_learn : [],
      course_features: Array.isArray(source.course_features) ? source.course_features : [],
      course_faqs: Array.isArray(source.course_faqs) ? source.course_faqs : [],
      chapters: Array.isArray(source.chapters) ? source.chapters.map((ch) => ({
        chapter_name: ch.chapter_name,
        study_material: ch.study_material,
        youtube_video: ch.youtube_video,
        practice_set: ch.practice_set,
        other_materials: Array.isArray(ch.other_materials) ? ch.other_materials : [],
        order: ch.order,
      })) : [],
      materials: Array.isArray(source.materials) ? source.materials : [],
      seo: source.seo ? {
        ...source.seo,
        slug: newSlug,
        seo_title: source.seo.seo_title || newTitle,
      } : { slug: newSlug },
      status: "draft",
      isApproved: false,
      enrolled_count: 0,
      views: 0,
      rating: 0,
      ratingCount: 0,
    };

    const created = await Course.create(dup);

    // Log activity
    try {
      const { logActivity } = require("../utils/activityLogger");
      await logActivity({
        req,
        actionType: "upload",
        description: `Course duplicated: "${source.title}" → "${newTitle}"`,
        status: "success",
        metadata: { sourceId: source._id, newId: created._id }
      });
    } catch (_) { /* non-fatal */ }

    // Notify admin that a new course is awaiting approval
    try {
      const Notification = require("../Models/NotificationModel");
      await Notification.create({
        recipient: "admin",
        recipientModel: "Admin",
        sender: req.admin?.adminId || req.user?.userId || null,
        senderModel: "Admin",
        senderName: req.admin?.name || req.user?.name || "System",
        type: "course_upload",
        title: "Course Duplicated",
        message: `A course was duplicated: "${newTitle}" (Pending Approval)`,
        referenceId: created._id,
      });
    } catch (_) { /* non-fatal */ }

    const populated = await Course.findById(created._id)
      .populate("teacher_id", "tname temail tprofile tspecialization")
      .populate("course_category_ref", "name icon color description slug isActive");

    res.status(201).json({
      success: true,
      message: `Course duplicated successfully as "${newTitle}". Pending admin approval.`,
      course: populated,
    });
  } catch (err) {
    console.error("Duplicate course error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to duplicate course",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};