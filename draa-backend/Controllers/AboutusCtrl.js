// routes/about.js
const express = require('express');
const router = express.Router();
const AboutUs = require('../Models/AboutUsModels');
const mongoose = require('mongoose');

//  CREATE - Add new about us page
router.post('/', async (req, res) => {
  try {
    console.log(' Creating new About Us page...');
    console.log('Request body:', req.body);

    const aboutData = req.body;

    // Validate required fields
    if (!aboutData.title || !aboutData.companyName) {
      return res.status(400).json({
        success: false,
        message:'Missing required fields: title and companyName are required',
        requiredFields: ['title','companyName'],
        receivedFields: Object.keys(aboutData)
      });
    }

    // If this is marked as active, deactivate all others first
    if (aboutData.isActive) {
      await AboutUs.updateMany({}, { isActive: false });
      console.log(' Deactivated all other About Us pages');
    }

    // Create new about page with defaults
    const newAbout = new AboutUs({
      title: aboutData.title,
      version: aboutData.version ||'1.0.0',
      status: aboutData.status ||'draft',
      isActive: aboutData.isActive || false,
      companyName: aboutData.companyName,
      tagline: aboutData.tagline ||'',
      foundedYear: aboutData.foundedYear || new Date().getFullYear(),
      headquarters: aboutData.headquarters ||'',
      website: aboutData.website ||'',
      email: aboutData.email ||'',
      phone: aboutData.phone ||'',

      overview: aboutData.overview || `${aboutData.companyName} is a leading company committed to excellence and innovation.`,
      mission: aboutData.mission || `To provide exceptional services and value to our customers.`,
      vision: aboutData.vision || `To be a leader in our industry and make a positive impact.`,
      story: aboutData.story || `${aboutData.companyName} was founded with a vision to make a difference.`,

      teamMembers: aboutData.teamMembers || [],
      values: aboutData.values || [],

      statistics: {
        studentsServed: aboutData.statistics?.studentsServed || 0,
        coursesOffered: aboutData.statistics?.coursesOffered || 0,
        yearsExperience: aboutData.statistics?.yearsExperience || 1,
        successRate: aboutData.statistics?.successRate || 95
      },

      socialMedia: {
        facebook: aboutData.socialMedia?.facebook ||'',
        twitter: aboutData.socialMedia?.twitter ||'',
        linkedin: aboutData.socialMedia?.linkedin ||'',
        instagram: aboutData.socialMedia?.instagram ||'',
        youtube: aboutData.socialMedia?.youtube ||''
      },

      metaTitle: aboutData.metaTitle || `About ${aboutData.companyName}`,
      metaDescription: aboutData.metaDescription || `Learn more about ${aboutData.companyName} and our mission.`,
      keywords: aboutData.keywords || [aboutData.companyName.toLowerCase(),'about us','company']
    });

    const savedAbout = await newAbout.save();
    console.log(' About Us page created:', savedAbout._id);

    res.status(201).json({
      success: true,
      message:'About Us page created successfully',
      data: savedAbout
    });

  } catch (error) {
    console.error(' Error creating About Us page:', error);

    let errorMessage ='Failed to create About Us page';
    let validationErrors = [];

    if (error.name ==='ValidationError') {
      errorMessage ='Validation failed';
      validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
    }

    res.status(400).json({
      success: false,
      message: errorMessage,
      error: error.message,
      validationErrors: validationErrors,
      receivedData: req.body
    });
  }
});

//  READ - Get all about us pages
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      isActive,
      sortBy ='createdAt',
      sortOrder ='desc',
      search
    } = req.query;

    console.log(' Fetching About Us pages with filters:', req.query);

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive ==='true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options:'i' } },
        { companyName: { $regex: search, $options:'i' } },
        { tagline: { $regex: search, $options:'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder ==='asc' ? 1 : -1;

    // Execute query with pagination
    const aboutPages = await AboutUs.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const totalPages = await AboutUs.countDocuments(filter);

    console.log(` Found ${aboutPages.length} About Us pages`);

    res.json({
      success: true,
      data: aboutPages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPages / limit),
        totalItems: totalPages,
        hasNext: page * limit < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error(' Error fetching About Us pages:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch About Us pages',
      error: error.message
    });
  }
});

//  READ - Get active about us page (for public display)
router.get('/active', async (req, res) => {
  try {
    console.log(' Fetching active About Us page...');

    const activeAbout = await AboutUs.findOne({
      isActive: true,
      status:'published'
    });

    if (!activeAbout) {
      return res.status(404).json({
        success: false,
        message:'No active About Us page found'
      });
    }

    console.log(' Active About Us page found:', activeAbout.title);

    res.json({
      success: true,
      data: activeAbout
    });

  } catch (error) {
    console.error(' Error fetching active About Us page:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch active About Us page',
      error: error.message
    });
  }
});

//  READ - Get single about us page by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid About Us page ID'
      });
    }

    const aboutPage = await AboutUs.findById(id);

    if (!aboutPage) {
      return res.status(404).json({
        success: false,
        message:'About Us page not found'
      });
    }

    res.json({
      success: true,
      data: aboutPage
    });

  } catch (error) {
    console.error(' Error fetching About Us page:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch About Us page',
      error: error.message
    });
  }
});

//  UPDATE - Update about us page
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid About Us page ID'
      });
    }

    console.log(' Updating About Us page:', id);

    // If this is being set as active, deactivate all others first
    if (updateData.isActive) {
      await AboutUs.updateMany(
        { _id: { $ne: id } },
        { isActive: false }
      );
      console.log(' Deactivated other About Us pages');
    }

    const updatedAbout = await AboutUs.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAbout) {
      return res.status(404).json({
        success: false,
        message:'About Us page not found'
      });
    }

    console.log(' About Us page updated:', updatedAbout.title);

    res.json({
      success: true,
      message:'About Us page updated successfully',
      data: updatedAbout
    });

  } catch (error) {
    console.error(' Error updating About Us page:', error);
    res.status(400).json({
      success: false,
      message:'Failed to update About Us page',
      error: error.message
    });
  }
});

//  DELETE - Remove about us page
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid About Us page ID'
      });
    }

    console.log(' Deleting About Us page:', id);

    const aboutPage = await AboutUs.findById(id);

    if (!aboutPage) {
      return res.status(404).json({
        success: false,
        message:'About Us page not found'
      });
    }

    // Prevent deletion of active page
    if (aboutPage.isActive) {
      return res.status(400).json({
        success: false,
        message:'Cannot delete active About Us page. Please deactivate it first.'
      });
    }

    await AboutUs.findByIdAndDelete(id);
    console.log(' About Us page deleted:', id);

    res.json({
      success: true,
      message:'About Us page deleted successfully'
    });

  } catch (error) {
    console.error(' Error deleting About Us page:', error);
    res.status(500).json({
      success: false,
      message:'Failed to delete About Us page',
      error: error.message
    });
  }
});

//  ACTIVATE - Activate about us page
router.put('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid About Us page ID'
      });
    }

    console.log(' Activating About Us page:', id);

    // Deactivate all other pages first
    await AboutUs.updateMany({}, { isActive: false });

    // Activate the selected page and set to published
    const activatedAbout = await AboutUs.findByIdAndUpdate(
      id,
      {
        isActive: true,
        status:'published'
      },
      { new: true }
    );

    if (!activatedAbout) {
      return res.status(404).json({
        success: false,
        message:'About Us page not found'
      });
    }

    console.log(' About Us page activated:', activatedAbout.title);

    res.json({
      success: true,
      message:'About Us page activated successfully',
      data: activatedAbout
    });

  } catch (error) {
    console.error(' Error activating About Us page:', error);
    res.status(500).json({
      success: false,
      message:'Failed to activate About Us page',
      error: error.message
    });
  }
});

//  TEAM MANAGEMENT - Add team member (No Photo)
router.post('/:id/team', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, bio, email, linkedin } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid About Us page ID'
      });
    }

    console.log(' Adding team member to About Us page:', id);

    const aboutPage = await AboutUs.findById(id);

    if (!aboutPage) {
      return res.status(404).json({
        success: false,
        message:'About Us page not found'
      });
    }

    const newTeamMember = {
      name,
      position,
      bio: bio ||'',
      email: email ||'',
      linkedin: linkedin ||'',
      order: aboutPage.teamMembers.length + 1
    };

    aboutPage.teamMembers.push(newTeamMember);
    await aboutPage.save();

    console.log(' Team member added:', name);

    res.json({
      success: true,
      message:'Team member added successfully',
      data: aboutPage
    });

  } catch (error) {
    console.error(' Error adding team member:', error);
    res.status(400).json({
      success: false,
      message:'Failed to add team member',
      error: error.message
    });
  }
});

//  STATISTICS - Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    console.log(' Fetching dashboard statistics...');

    const totalPages = await AboutUs.countDocuments();
    const activePages = await AboutUs.countDocuments({ isActive: true });
    const publishedPages = await AboutUs.countDocuments({ status:'published' });
    const draftPages = await AboutUs.countDocuments({ status:'draft' });

    // Aggregate team members and statistics
    const aggregateResult = await AboutUs.aggregate([
      {
        $group: {
          _id: null,
          totalTeamMembers: { $sum: { $size:'$teamMembers' } },
          totalStudents: { $sum:'$statistics.studentsServed' },
          totalCourses: { $sum:'$statistics.coursesOffered' },
          avgSuccessRate: { $avg:'$statistics.successRate' }
        }
      }
    ]);

    const aggregateData = aggregateResult[0] || {
      totalTeamMembers: 0,
      totalStudents: 0,
      totalCourses: 0,
      avgSuccessRate: 0
    };

    const stats = {
      totalPages,
      activePages,
      publishedPages,
      draftPages,
      totalTeamMembers: aggregateData.totalTeamMembers,
      totalStudents: aggregateData.totalStudents,
      totalCourses: aggregateData.totalCourses,
      avgSuccessRate: Math.round(aggregateData.avgSuccessRate || 0)
    };

    console.log(' Dashboard stats:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error(' Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

module.exports = router;
