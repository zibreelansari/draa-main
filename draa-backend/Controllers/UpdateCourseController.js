const Course = require('../Models/CourseModel');
const CourseCategory = require('../Models/courseCategoriesModels');

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g,'')
    .replace(/[\s_-]+/g,'-')
    .replace(/^-+|-+$/g,'');
};

exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const currentCourse = await Course.findById(courseId);
    if (!currentCourse) {
      return res.status(404).json({ error:"Course not found" });
    }

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
      who_this_course_is_for,
      what_you_will_learn,
      course_features,
      course_faqs
    } = req.body;

    // ==============================
    //  COVER PHOTO (upload.any)
    // ==============================
    const coverFile = req.files.find(f => f.fieldname ==="coverphoto");
    const syllabusFile = req.files.find(f => f.fieldname ==="syllabus");

    // ==============================
    //  CATEGORY VALIDATION
    // ==============================
    let categoryRef = currentCourse.course_category_ref;

    if (course_category && course_category !== currentCourse.course_category) {
      const category = await CourseCategory.findOne({
        name: course_category,
        isActive: true
      });
      if (!category) {
        return res.status(400).json({
          error: `Course category'${course_category}' not found or inactive`
        });
      }
      categoryRef = category._id;
    }

    // ==============================
    //  SLUG VALIDATION
    // ==============================
    const courseSlug = slug || generateSlug(title || currentCourse.title);

    if (courseSlug !== currentCourse.seo?.slug) {
      const existingCourse = await Course.findOne({
"seo.slug": courseSlug,
        _id: { $ne: courseId }
      });
      if (existingCourse) {
        return res.status(400).json({
          error:"Course slug already exists."
        });
      }
    }

    // ==============================
    //  CHAPTER PROCESSING (NEW STRUCTURE)
    // ==============================

    let parsedChapters = [];
    try {
      parsedChapters = JSON.parse(chapters ||"[]");
    } catch {
      parsedChapters = [];
    }

    const updatedChapters = parsedChapters.map((chapter, index) => {

      const chapterObj = {
        chapter_name: chapter.chapter_name ||"",
        order: index + 1,
        youtube_video: chapter.youtube_video ||""
      };

      // Study Material
      const studyFile = req.files.find(
        f => f.fieldname === `chapters[${index}][study_material]`
      );

      chapterObj.study_material =
        studyFile?.path ||
        chapter.study_material_existing ||
        currentCourse.chapters[index]?.study_material ||
"";

      // Practice Set
      const practiceFile = req.files.find(
        f => f.fieldname === `chapters[${index}][practice_set]`
      );

      chapterObj.practice_set =
        practiceFile?.path ||
        chapter.practice_set_existing ||
        currentCourse.chapters[index]?.practice_set ||
"";

      // Other Materials (merge new uploads with existing paths)
      const otherFiles = req.files.filter(
        (f) => f.fieldname === `chapters[${index}][other_materials]`
      );
      const newOtherPaths = otherFiles.map((f) => f.path);
      const existingOtherPaths = chapter.other_materials_existing || [];

      chapterObj.other_materials = [...existingOtherPaths, ...newOtherPaths];

      // Fallback to current course if absolutely nothing provided (safety)
      if (chapterObj.other_materials.length === 0 && currentCourse.chapters[index]?.other_materials) {
        chapterObj.other_materials = currentCourse.chapters[index].other_materials;
      }

      return chapterObj;
    });

    // Enforce required chapter files
    const invalidChapters = updatedChapters.filter(
      ch => !ch.study_material || !ch.practice_set
    );

    if (invalidChapters.length > 0 && updatedChapters.length > 0) {
      return res.status(400).json({
        error:"Each chapter must include Study Material and Practice Set"
      });
    }

    // ==============================
    //  YOUTUBE LINKS
    // ==============================

    let youtubeLinksArray = currentCourse.youtube_links || [];

    if (youtube_links) {
      try {
        const parsed = JSON.parse(youtube_links);
        youtubeLinksArray = parsed.map((link, index) => ({
          url: link,
          title: `Video ${index + 1}`,
          order: index
        }));
      } catch { }
    }

    // ==============================
    //  PRICING
    // ==============================

    const parsedActualPrice = parseFloat(actual_price) || currentCourse.actual_price;
    const parsedDiscountedPrice = parseFloat(discounted_price) || currentCourse.discounted_price;

    let finalDiscount = discount_percentage || currentCourse.discount_percentage;

    if (parsedActualPrice > 0 && parsedDiscountedPrice < parsedActualPrice) {
      finalDiscount = Math.round(
        ((parsedActualPrice - parsedDiscountedPrice) / parsedActualPrice) * 100
      );
    }

    // ==============================
    //  SEO
    // ==============================

    const seoData = {
      seo_title: seo_title || currentCourse.seo?.seo_title,
      meta_keywords: meta_keywords || currentCourse.seo?.meta_keywords,
      meta_description: meta_description || currentCourse.seo?.meta_description,
      slug: courseSlug,
      og_title: og_title || currentCourse.seo?.og_title,
      og_description: og_description || currentCourse.seo?.og_description,
      og_image: coverFile?.path || currentCourse.seo?.og_image,
      canonical_url: canonical_url || currentCourse.seo?.canonical_url,
      robots: robots || currentCourse.seo?.robots,
      schema_markup: schema_markup || currentCourse.seo?.schema_markup
    };

    // ==============================
    //  COURSE DETAILS FIELDS
    // ==============================

    const safeParse = (field, fallback) => {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch {
        return fallback;
      }
    };

    const updateData = {
      title: title || currentCourse.title,
      short_desc: short_desc || currentCourse.short_desc,
      long_desc: long_desc || currentCourse.long_desc,
      actual_price: parsedActualPrice,
      discounted_price: parsedDiscountedPrice,
      discount_percentage: finalDiscount,
      enrolled_count: enrolled_count || currentCourse.enrolled_count,
      price: parsedDiscountedPrice,
      duration: duration || currentCourse.duration,
      teacher_id: teacher_id || currentCourse.teacher_id,
      language: language || currentCourse.language,
      skill_level: skill_level || currentCourse.skill_level,
      course_category: course_category || currentCourse.course_category,
      course_category_ref: categoryRef,
      youtube_links: youtubeLinksArray,
      youtube_link: youtube_link || currentCourse.youtube_link,
      chapters: updatedChapters,
      syllabus: syllabusFile?.path || currentCourse.syllabus,
      coverphoto: coverFile?.path || currentCourse.coverphoto,
      seo: seoData,
      who_this_course_is_for: safeParse(who_this_course_is_for, currentCourse.who_this_course_is_for),
      what_you_will_learn: safeParse(what_you_will_learn, currentCourse.what_you_will_learn),
      course_features: safeParse(course_features, currentCourse.course_features),
      course_faqs: safeParse(course_faqs, currentCourse.course_faqs),
      // Reset to pending after edit
      isApproved: false,
      status:'pending'
    };

    const updated = await Course.findByIdAndUpdate(
      courseId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message:" Course updated successfully",
      course: updated
    });

  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ error:"Failed to update course" });
  }
};

