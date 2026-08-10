const CourseContent = require("../Models/CourseConjtent");

/**
 * Resolve the blog author label and creator role from the authenticated user.
 * Works for student/teacher/admin — the per-role middleware attaches a
 * normalised `req.user = { _id, name, role }` shape.
 */
function _resolveAuthor(req) {
  const role = req.user?.role || 'student';
  const name = req.user?.name || (role === 'student' ? 'Student' : role === 'teacher' ? 'Teacher' : 'Admin');
  return { role, name };
}

// CREATE BLOG
const createStudentBlog = async (req, res) => {
  try {

    const userId = req.user._id;
    const { role, name: defaultAuthorName } = _resolveAuthor(req);

    const {
      content_subject,
      content_category,
      content
    } = req.body;

    if (!content_subject || !content_category || !content) {
      return res.status(400).json({
        success: false,
        message:"Subject, category and content required"
      });
    }

    let schemaImage = req.body.schema_image || "";
    let featuredImages = [];

    if (req.files?.schema_image) {
      schemaImage = req.files.schema_image[0].path.replace(/\\/g, '/');
    } else if (schemaImage && schemaImage.startsWith('http')) {
      const { downloadExternalImage } = require('../utils/imageDownloader');
      const localPath = await downloadExternalImage(schemaImage);
      if (localPath) schemaImage = localPath;
    }

    if (req.files?.featured_images) {
      featuredImages = req.files.featured_images.map(f => f.path.replace(/\\/g, '/'));
    }

    const blog = await CourseContent.create({
      student: userId,
      content_subject,
      content_category,
      content,
      author: req.body.author || defaultAuthorName,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      schema_image: schemaImage,
      featured_images: featuredImages,
      youtube_url: req.body.youtube_url ||"",
      instagram_url: req.body.instagram_url ||"",
      createdBy: userId,
      creatorRole: role,
      approved: role === 'admin' // admins self-approve, others go through review
    });

    res.status(201).json({
      success: true,
      message: role === 'admin' ? "Blog published successfully" : "Blog submitted for approval",
      blog
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message:"Failed to create blog"
    });

  }
};



// GET ALL STUDENT BLOGS
const getStudentBlogs = async (req, res) => {
  try {

    const userId = req.user._id;

    const blogs = await CourseContent.find({
      createdBy: userId
    })
      .populate("student","name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: blogs.length,
      blogs
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message:"Failed to fetch blogs"
    });

  }
};


// GET MY BLOGS
const getMyBlogs = async (req, res) => {
  try {

    const userId = req.user._id;

    const blogs = await CourseContent.find({
      createdBy: userId
    })
      .populate("student","name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });

  } catch (error) {

    console.error("Get My Blogs Error:", error);

    res.status(500).json({
      success: false,
      message:"Failed to fetch blogs"
    });

  }
};



// UPDATE BLOG
const updateStudentBlog = async (req, res) => {
  try {

    const { blogId } = req.params;
    const userId = req.user._id;

    const blog = await CourseContent.findOne({
      _id: blogId,
      createdBy: userId
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message:"Blog not found"
      });
    }

    // Basic fields
    const { content_subject, content_category, content, tags, youtube_url, instagram_url } = req.body;
    if (content_subject) blog.content_subject = content_subject;
    if (content_category) blog.content_category = content_category;
    if (content) blog.content = content;
    if (youtube_url !== undefined) blog.youtube_url = youtube_url;
    if (instagram_url !== undefined) blog.instagram_url = instagram_url;
    if (tags) blog.tags = JSON.parse(tags);

    // Handle image updates
    if (req.files?.schema_image) {
      blog.schema_image = req.files.schema_image[0].path.replace(/\\/g, '/');
    } else if (req.body.schema_image && req.body.schema_image.startsWith('http')) {
      const { downloadExternalImage } = require('../utils/imageDownloader');
      const localPath = await downloadExternalImage(req.body.schema_image);
      if (localPath) blog.schema_image = localPath;
    }
    if (req.files?.featured_images) {
      blog.featured_images = req.files.featured_images.map(f => f.path.replace(/\\/g, '/'));
    }

    blog.updatedAt = new Date();
    blog.approved = false; // re-approval required

    await blog.save();

    res.json({
      success: true,
      message:"Blog updated. Awaiting approval."
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message:"Update failed"
    });
  }
};



// DELETE BLOG
const deleteStudentBlog = async (req, res) => {

  try {

    const { blogId } = req.params;
    const userId = req.user._id;

    const blog = await CourseContent.findOneAndDelete({
      _id: blogId,
      createdBy: userId
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message:"Blog not found"
      });
    }

    res.json({
      success: true,
      message:"Blog deleted"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message:"Delete failed"
    });
  }
};

module.exports = {
  createStudentBlog,
  getStudentBlogs,
  getMyBlogs,
  updateStudentBlog,
  deleteStudentBlog
};