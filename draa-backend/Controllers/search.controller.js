// controllers/search.controller.js
// Unified Smart Search  searches ALL content across the platform

const Course = require("../Models/CourseModel");
const Book = require("../Models/booksModel");
const PYQ = require("../Models/PYQ.models");
const Syllabus = require("../Models/Syllabus.model");
const Blog = require("../Models/CourseConjtent");
const Exam = require("../Models/Exam");
const { JobPost } = require("../Models/jobsModel");
const CourseCategory = require("../Models/courseCategoriesModels");
const TestSeries = require("../Models/TestSeriesModels");
const Subject = require("../Models/Subject.models");
const TopicCategory = require("../Models/Topic.models");
const ExaminationCategory = require("../Models/ExaminationCategory.models");
const { CurrentAffair } = require("../Models/CurrentAffair");
const TeacherModel = require("../Models/TeacherModel");
// const StudentModel = require("../Models/StudentModel");

//  Text highlight helper 
const highlightMatch = (text, query) => {
  if (!text || !query) return text ||"";
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  return String(text).replace(
    new RegExp(`(${escaped})`,"gi"),
"<mark>$1</mark>"
  );
};

//  Slug generator 
const generateSlug = (text) => {
  if (!text) return"";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g,"")
    .replace(/[\s_-]+/g,"-")
    .replace(/^-+|-+$/g,"");
};

//  Relevance score 
const scoreResult = (item, query, fields = ["title"]) => {
  const q = query.toLowerCase();
  let score = 0;
  for (const field of fields) {
    const val = String(item[field] ||"").toLowerCase();
    if (val === q) score += 100;
    else if (val.startsWith(q)) score += 70;
    else if (val.includes(q)) score += 40;
  }
  return score;
};

//  URL builders 
const getCourseUrl = (course) => `/course-details/${course._id}`;

const getBookUrl = (book) => `/book-details/${book._id}`;

const getTestSeriesUrl = (test) =>
  `/test-series/examination/${test.examinationCategory}`;

const getExamUrl = (exam) => `/exams/${exam.slug || exam._id}`;
const getBlogUrl = (blog) => `/blog-details/${blog._id}`;
const getJobUrl = (job) => `/job-details/${job._id}`;
const getPYQUrl = (pyq) => `/previous-year-questions`;
const getSyllabusUrl = (syllabus) => `/syllabus`;
const getTeacherUrl = (teacher) => `/teacherProfile/${teacher._id}`;
const getStudentUrl = (student) => `/userProfile/${student._id}`;
const getCourseCategoryUrl = (cat) => `/courses/category/${generateSlug(cat.name)}`;
const getBookCategoryUrl = (cat) => `/books/category/${generateSlug(cat.name)}`;
const getJobCategoryUrl = (cat) => `/jobs/categories/${generateSlug(cat.name)}`;
const getExamCategoryUrl = (cat) => `/exam-topics/${cat._id}`;
const getCurrentAffairUrl = (ca) => `/current-affairs/${ca.slug || ca._id}`;
const getSubjectUrl = (sub) => `/test-series/subject/${sub._id}`;
const getTopicUrl = (topic) => `/explore/${generateSlug(topic.name)}`;

//  MAIN UNIFIED SEARCH 
exports.globalSearch = async (req, res) => {
  try {
    const { q, type, limit = 10 } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(200).json({
        success: true,
        data: { results: [], total: 0, query:"" }
      });
    }

    const query = q.trim();
    const lim = Math.min(parseInt(limit) || 10, 30);
    const regex = new RegExp(query,"i");
    const results = [];
    let totalResults = 0;

    //  1. COURSES 
    if (!type || type ==="all" || type ==="course") {
      const courses = await Course.find({
        $or: [
          { title: regex },
          { shortDescription: regex },
          { description: regex },
          { tags: regex },
          { teacherName: regex },
          { courseName: regex },
          { course_category: regex },
        ],
      })
        .limit(lim)
        .lean();

      courses.forEach((c) => {
        results.push({
          id: c._id,
          _id: c._id,
          title: highlightMatch(c.title, query),
          plainTitle: c.title,
          description: highlightMatch(c.shortDescription || c.description, query),
          plainDescription: c.shortDescription || c.description ||"",
          type:"course",
          typeLabel:"Course",
          url: getCourseUrl(c),
          thumbnail: c.thumbnail || c.coverImage,
          price: c.price || c.fees,
          originalPrice: c.originalPrice,
          rating: c.rating || c.averageRating,
          studentsEnrolled: c.enrolled_count || c.studentsEnrolled || 0,
          author: c.teacherName,
          difficulty: c.level || c.difficulty,
          isFeatured: c.isFeatured,
          isNew: c.isNew,
          category: c.course_category || c.category,
          tags: c.tags || [],
          score: scoreResult(c, query, ["title","shortDescription","teacherName"]),
          icon:"book",
          color:"#52c41a",
        });
        totalResults++;
      });
    }

    //  2. BOOKS 
    if (!type || type ==="all" || type ==="book") {
      const books = await Book.find({
        $or: [
          { title: regex },
          { description: regex },
          { author: regex },
          { tags: regex },
        ],
      })
        .limit(lim)
        .lean();

      books.forEach((b) => {
        results.push({
          id: b._id,
          _id: b._id,
          title: highlightMatch(b.title, query),
          plainTitle: b.title,
          description: highlightMatch(b.description || b.summary, query),
          plainDescription: b.description || b.summary ||"",
          type:"book",
          typeLabel:"Book",
          url: getBookUrl(b),
          thumbnail: b.coverImage || b.thumbnail,
          price: b.digitalPrice || b.physicalPrice || 0, // Base price for filtering
          physicalPrice: b.physicalPrice,
          digitalPrice: b.digitalPrice,
          physicalDiscount: b.physicalDiscountPercentage,
          digitalDiscount: b.digitalDiscountPercentage,
          originalPrice: b.originalPrice,
          rating: b.rating || b.averageRating,
          author: b.author,
          category: b.category,
          tags: b.tags || [],
          score: scoreResult(b, query, ["title","authorName","description"]),
          icon:"read",
          color:"#fa8c16",
        });
        totalResults++;
      });
    }

    //  3. TEST SERIES 
    if (!type || type ==="all" || type ==="test-series") {
      const tests = await TestSeries.find({
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex },
        ],
        // Removed isActive + status filter so all test series are searchable
      })
        .populate("examinationCategory","name")
        .limit(lim)
        .lean();

      tests.forEach((t) => {
        results.push({
          id: t._id,
          _id: t._id,
          title: highlightMatch(t.title, query),
          plainTitle: t.title,
          description: highlightMatch(t.description, query),
          plainDescription: t.description ||"",
          type:"test-series",
          typeLabel:"Test Series",
          url: getTestSeriesUrl(t),
          thumbnail: t.thumbnail,
          price: t.price ?? 0,
          isPaid: t.isPaid,
          code: t.setCode || t.code ||"TEST",
          year: t.year || new Date().getFullYear(),
           statistics: t.statistics || { 
            totalTestSeries: t.questions?.length > 0 ? 1 : 0, 
            totalSubjects: t.examinationCategory?.name ? 1 : 0 
          },
          examPattern: t.examPattern || { totalQuestions: t.totalQuestions || t.questions?.length || 0 },
          rating: t.rating,
          difficulty: t.difficulty,
          totalQuestions: t.totalQuestions || t.questions?.length || 0,
          duration: t.duration,
          category: t.category || t.examinationCategory,
          tags: t.tags || [],
          score: scoreResult(t, query, ["title","description"]),
          icon:"file-text",
          color:"#eb2f96",
        });
        totalResults++;
      });
    }

    //  4. EXAMINATION CATEGORIES 
    if (!type || type ==="all" || type ==="examination") {
      const exams = await ExaminationCategory.find({
        $or: [
          { name: regex },
          { code: regex },
          { description: regex },
        ],
      }).limit(lim).lean();

      exams.forEach((e) => {
        results.push({
          id: e._id,
          _id: e._id,
          title: highlightMatch(`${e.code} - ${e.name}`, query),
          plainTitle: `${e.code} - ${e.name}`,
          description: highlightMatch(e.description, query),
          plainDescription: e.description ||"",
          type:"examination",
          typeLabel:"Examination",
          url: getExamCategoryUrl(e),
          thumbnail: e.image || e.coverImage,
          year: e.year,
          code: e.code,
          category: e.name,
          score: scoreResult(e, query, ["name","code","description"]),
          icon:"trophy",
          color:"#722ed1",
        });
        totalResults++;
      });
    }

    //  5. SUBJECTS 
    if (!type || type ==="all" || type ==="subject") {
      const subjects = await Subject.find({
        $or: [{ name: regex }, { code: regex }],
      })
        .limit(lim)
        .lean();

      subjects.forEach((s) => {
        results.push({
          id: s._id,
          _id: s._id,
          title: highlightMatch(s.name, query),
          plainTitle: s.name,
          description: highlightMatch(s.description, query),
          plainDescription: s.description ||"",
          type:"subject",
          typeLabel:"Subject",
          url: getSubjectUrl(s),
          price: s.price,
          category: s.examinationCategory,
          score: scoreResult(s, query, ["name","code"]),
          icon:"book",
          color:"#13c2c2",
        });
        totalResults++;
      });
    }

    //  6. TOPIC CATEGORIES 
    if (!type || type ==="all" || type ==="topic") {
      const topics = await TopicCategory.find({
        $or: [{ name: regex }, { description: regex }],
      }).limit(lim).lean();

      topics.forEach((t) => {
        results.push({
          id: t._id,
          _id: t._id,
          title: highlightMatch(t.name, query),
          plainTitle: t.name,
          description: highlightMatch(t.description, query),
          plainDescription: t.description ||"",
          type:"topic",
          typeLabel:"Topic",
          url: getTopicUrl(t),
          price: t.price,
          difficulty: t.difficulty,
          tags: t.tags || [],
          score: scoreResult(t, query, ["name","description"]),
          icon:"file-text",
          color:"#eb2f96",
        });
        totalResults++;
      });
    }

    //  7. PYQs 
    if (!type || type ==="all" || type ==="pyq") {
      const pyqs = await PYQ.find({
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex },
          { examName: regex },
        ],
      }).limit(lim).lean();

      pyqs.forEach((p) => {
        results.push({
          id: p._id,
          _id: p._id,
          title: highlightMatch(p.title, query),
          plainTitle: p.title,
          description: highlightMatch(p.description, query),
          plainDescription: p.description ||"",
          type:"pyq",
          typeLabel:"PYQ",
          url: getPYQUrl(p),
          thumbnail: p.coverImage,
          examName: p.examName,
          year: p.year,
          isApproved: p.isApproved,
          tags: p.tags || [],
          score: scoreResult(p, query, ["title","examName","description"]),
          icon:"file-text",
          color:"#faad14",
        });
        totalResults++;
      });
    }

    //  8. SYLLABUS 
    if (!type || type ==="all" || type ==="syllabus") {
      const syllabi = await Syllabus.find({
        $or: [
          { title: regex },
          { examName: regex },
          { examCategory: regex },
        ],
      }).limit(lim).lean();

      syllabi.forEach((s) => {
        results.push({
          id: s._id,
          _id: s._id,
          title: highlightMatch(s.title || s.examName, query),
          plainTitle: s.title || s.examName,
          description: highlightMatch(s.description, query),
          plainDescription: s.description ||"",
          type:"syllabus",
          typeLabel:"Syllabus",
          url: getSyllabusUrl(s),
          thumbnail: s.coverImage,
          examName: s.examName,
          category: s.examCategory,
          score: scoreResult(s, query, ["title","examName","examCategory"]),
          icon:"book",
          color:"#52c41a",
        });
        totalResults++;
      });
    }

    //  9. BLOGS 
    if (!type || type ==="all" || type ==="blog") {
      const blogs = await Blog.find({
        $or: [
          { title: regex },
          { content_subject: regex },
          { tags: regex },
        ],
      })
        .limit(lim)
        .lean();

      blogs.forEach((bl) => {
        results.push({
          id: bl._id,
          _id: bl._id,
          title: highlightMatch(bl.title, query),
          plainTitle: bl.title,
          description: highlightMatch(bl.content_subject, query),
          plainDescription: bl.content_subject ||"",
          type:"blog",
          typeLabel:"Blog",
          url: getBlogUrl(bl),
          thumbnail: bl.featuredImage || bl.featured_images || bl.thumbnail,
          author: bl.authorName || bl.author?.name,
          category: bl.category || bl.content_category,
          tags: bl.tags || [],
          score: scoreResult(bl, query, ["title","content_subject"]),
          icon:"star",
          color:"#13c2c2",
        });
        totalResults++;
      });
    }

    //  10. CURRENT AFFAIRS 
    if (!type || type ==="all" || type ==="current-affair") {
      const cas = await CurrentAffair.find({
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex },
        ],
      }).limit(lim).lean();

      cas.forEach((ca) => {
        results.push({
          id: ca._id,
          _id: ca._id,
          title: highlightMatch(ca.title, query),
          plainTitle: ca.title,
          description: highlightMatch(ca.description, query),
          plainDescription: ca.description ||"",
          type:"current-affair",
          typeLabel:"Current Affair",
          url: getCurrentAffairUrl(ca),
          thumbnail: ca.coverImage,
          date: ca.date,
          type_: ca.type,
          tags: ca.tags || [],
          score: scoreResult(ca, query, ["title","description"]),
          icon:"star",
          color:"#1890ff",
        });
        totalResults++;
      });
    }

    //  11. JOBS 
    if (!type || type ==="all" || type ==="job") {
      const jobs = await JobPost.find({
        $or: [
          { title: regex },
          { organization_name: regex },
          { location: regex },
          { skills_required: regex },
        ],
      }).limit(lim).lean();

      jobs.forEach((j) => {
        results.push({
          id: j._id,
          _id: j._id,
          title: highlightMatch(j.title, query),
          plainTitle: j.title,
          description: highlightMatch(j.shortDescription || j.description, query),
          plainDescription: j.shortDescription || j.description ||"",
          type:"job",
          typeLabel:"Job",
          url: getJobUrl(j),
          thumbnail: j.cover_image,
          organization: j.organization_name,
          location: j.location,
          salary: j.salary,
          jobType: j.jobType || j.employmentType,
          deadline: j.deadline,
          tags: j.skills_required || [],
          score: scoreResult(j, query, ["title","organization_name","location"]),
          icon:"bulb",
          color:"#faad14",
        });
        totalResults++;
      });
    }

    //  12. COURSE CATEGORIES 
    if (!type || type ==="all" || type ==="category") {
      const cats = await CourseCategory.find({
        $or: [{ name: regex }, { description: regex }],
      }).limit(lim).lean();

      cats.forEach((c) => {
        results.push({
          id: c._id,
          _id: c._id,
          title: highlightMatch(c.name, query),
          plainTitle: c.name,
          description: highlightMatch(c.description, query),
          plainDescription: c.description ||"",
          type:"category",
          typeLabel:"Category",
          url: getCourseCategoryUrl(c),
          thumbnail: c.iconImage,
          icon: c.icon ||"appstore",
          color: c.color ||"#4a59f8",
          score: scoreResult(c, query, ["name","description"]),
        });
        totalResults++;
      });
    }

    //  13. TEACHERS 
    if (!type || type ==="all" || type ==="teacher") {
      const teachers = await TeacherModel.find({
        $or: [
          { tname: regex },
          { tspecialization: regex },
          { temail: regex },
        ],
      }).limit(lim).lean();

      teachers.forEach((t) => {
        results.push({
          id: t._id,
          _id: t._id,
          title: highlightMatch(t.tname, query),
          plainTitle: t.tname,
          description: highlightMatch(t.tspecialization, query),
          plainDescription: t.tspecialization ||"",
          type:"teacher",
          typeLabel:"Teacher",
          url: getTeacherUrl(t),
          thumbnail: t.tprofile_photo || t.profilePhoto,
          author: t.tname,
          specialization: t.tspecialization,
          rating: t.rating || t.averageRating,
          score: scoreResult(t, query, ["tname","tspecialization"]),
          icon:"user",
          color:"#eb2f96",
        });
        totalResults++;
      });
    }

    //  14. EXAMS (Individual) 
    if (!type || type ==="all" || type ==="exam") {
      const exams = await Exam.find({
        $or: [
          { name: regex },
          { description: regex },
        ],
      }).limit(lim).lean();

      exams.forEach((e) => {
        results.push({
          id: e._id,
          _id: e._id,
          title: highlightMatch(e.name, query),
          plainTitle: e.name,
          description: highlightMatch(e.description, query),
          plainDescription: e.description ||"",
          type:"exam",
          typeLabel:"Exam",
          url: getExamUrl(e),
          thumbnail: e.examImage,
          examDate: e.examDate,
          category: e.category,
          score: scoreResult(e, query, ["name","description"]),
          icon:"trophy",
          color:"#722ed1",
        });
        totalResults++;
      });
    }

    //  Sort by relevance score 
    results.sort((a, b) => b.score - a.score);

    //  Group by type for better UX 
    const grouped = {};
    results.forEach((r) => {
      if (!grouped[r.type]) grouped[r.type] = [];
      grouped[r.type].push(r);
    });

    //  Type summary counts 
    const typeCounts = {};
    results.forEach((r) => {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        results: results.slice(0, lim * 2), // return top results
        grouped,
        typeCounts,
        total: totalResults,
        query,
      },
    });
  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({ success: false, message:"Internal server error" });
  }
};

//  TRENDING SEARCHES 
exports.trendingSearches = async (req, res) => {
  try {
    // Get popular courses and test series as trending
    const [popularCourses, popularTests] = await Promise.all([
      Course.find({})
        .sort({ enrolled_count: -1 })
        .limit(8)
        .select("title thumbnail enrolled_count")
        .lean(),
      TestSeries.find({})
        .sort({ totalAttempts: -1 })
        .limit(8)
        .select("title thumbnail totalAttempts")
        .lean(),
    ]);

    const trending = [
      ...popularCourses.map((c) => ({ title: c.title, type:"course", thumbnail: c.thumbnail })),
      ...popularTests.map((t) => ({ title: t.title, type:"test-series", thumbnail: t.thumbnail })),
    ];

    // Shuffle and return
    const shuffled = trending.sort(() => Math.random() - 0.5).slice(0, 10);

    res.json({ success: true, data: shuffled });
  } catch (error) {
    console.error("Trending searches error:", error);
    res.status(500).json({ success: false, message:"Internal server error" });
  }
};
