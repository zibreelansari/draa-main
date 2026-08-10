const Course = require("../Models/CourseModel");
const Book = require("../Models/booksModel");
const Exam = require("../Models/Exam");
const { JobPost } = require("../Models/jobsModel");
const CourseContent = require("../Models/CourseConjtent");
const { CurrentAffair } = require("../Models/CurrentAffair");
const PYQ = require("../Models/PYQ.models");

const CLIENT_URL = "https://draa.in";

const generateSitemap = async (req, res) => {
  try {
    const urls = [];

    // 1. Static Pages
    const staticPages = [
      "",
      "/about",
      "/contact",
      "/courses",
      "/all-books",
      "/online-test-series",
      "/previous-year-questions",
      "/syllabus",
      "/current-affairs",
      "/jobs-notifications",
      "/free-resources",
      "/success-stories",
      "/e-learning/website-development",
      "/e-learning/academic-content",
      "/e-learning/white-label-content",
      "/e-learning/mobile-app-development",
      "/e-learning/exam-management",
      "/e-learning/digital-content-creation",
      "/e-learning/digital-marketing",
      "/e-learning/managed-services"
    ];

    staticPages.forEach(p => {
      urls.push({
        loc: `${CLIENT_URL}${p}`,
        changefreq: "daily",
        priority: p === "" ? "1.0" : "0.8"
      });
    });

    // Helper for formatting date
    const formatDate = (date) => {
      return date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    };

    // Helper to escape XML special characters
    const escapeXml = (unsafe) => {
      return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
          default: return c;
        }
      });
    };

    // Helper to generate dynamic blog details slug
    // Exactly matches front-end: generateSlug = (title, id) => `${title-slug}-${id}`
    const generateBlogSlug = (title, id) => {
      if (!title) return id;
      const slug = title.toLowerCase().replace(/[^\w\s-]/g,'').replace(/[\s_-]+/g,'-').replace(/^-+|-+$/g,'');
      return `${slug}-${id}`;
    };

    // 2. Fetch Courses
    const courses = await Course.find({ isApproved: true, status: 'published' }).select('_id updatedAt');
    courses.forEach(c => {
      urls.push({
        loc: `${CLIENT_URL}/course-details/${c._id}`,
        lastmod: formatDate(c.updatedAt),
        changefreq: "weekly",
        priority: "0.7"
      });
    });

    // 3. Fetch Books
    const books = await Book.find({ isApproved: true }).select('_id updatedAt');
    books.forEach(b => {
      urls.push({
        loc: `${CLIENT_URL}/book-details/${b._id}`,
        lastmod: formatDate(b.updatedAt),
        changefreq: "weekly",
        priority: "0.7"
      });
    });

    // 4. Fetch Exams
    const exams = await Exam.find({ status: 'ACTIVE' }).select('slug updatedAt');
    exams.forEach(e => {
      urls.push({
        loc: `${CLIENT_URL}/exams/${e.slug}`,
        lastmod: formatDate(e.updatedAt),
        changefreq: "weekly",
        priority: "0.7"
      });
    });

    // 5. Fetch Jobs
    const jobs = await JobPost.find({ isApproved: true, status: 'Active' }).select('_id updatedAt');
    jobs.forEach(j => {
      urls.push({
        loc: `${CLIENT_URL}/job-details/${j._id}`,
        lastmod: formatDate(j.updatedAt),
        changefreq: "weekly",
        priority: "0.7"
      });
    });

    // 6. Fetch Blogs (CourseContent)
    const blogs = await CourseContent.find({ approved: true }).select('_id content_subject updatedAt');
    blogs.forEach(b => {
      urls.push({
        loc: `${CLIENT_URL}/blog-details/${generateBlogSlug(b.content_subject, b._id)}`,
        lastmod: formatDate(b.updatedAt),
        changefreq: "weekly",
        priority: "0.7"
      });
    });

    // 7. Fetch Current Affairs
    const affairs = await CurrentAffair.find({ status: 'ACTIVE', isApproved: true }).select('slug updatedAt');
    affairs.forEach(a => {
      urls.push({
        loc: `${CLIENT_URL}/current-affairs/${a.slug}`,
        lastmod: formatDate(a.updatedAt),
        changefreq: "weekly",
        priority: "0.7"
      });
    });

    // 8. Fetch PYQ Exam Names
    const pyqExamNames = await PYQ.find({ isApproved: true }).distinct('examName');
    pyqExamNames.forEach(name => {
      if (name) {
        urls.push({
          loc: `${CLIENT_URL}/previous-year-questions/details/${encodeURIComponent(name)}`,
          changefreq: "weekly",
          priority: "0.6"
        });
      }
    });

    // Build XML response
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    urls.forEach(u => {
      xml += '  <url>\n';
      xml += `    <loc>${escapeXml(u.loc)}</loc>\n`;
      if (u.lastmod) {
        xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
      }
      xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
      xml += `    <priority>${u.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    // Return a valid fallback XML sitemap in case of server/database errors
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += '  <url>\n';
    xml += '    <loc>https://draa.in</loc>\n';
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';
    xml += '  <url>\n';
    xml += '    <loc>https://draa.in/about</loc>\n';
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
    xml += '  <url>\n';
    xml += '    <loc>https://draa.in/courses</loc>\n';
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  }
};

module.exports = {
  generateSitemap
};
