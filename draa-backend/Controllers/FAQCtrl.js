// routes/faq.js
const express = require('express');
const router = express.Router();
const FAQ = require('../Models/FAQModel');
const mongoose = require('mongoose');

//  CREATE - Add new FAQ
router.post('/', async (req, res) => {
  try {
    console.log(' Creating new FAQ...');
    console.log('Request body:', req.body);

    const faqData = req.body;

    // Validate required fields
    if (!faqData.question || !faqData.answer) {
      return res.status(400).json({
        success: false,
        message:'Missing required fields: question and answer are required',
        requiredFields: ['question','answer'],
        receivedFields: Object.keys(faqData)
      });
    }

    const newFAQ = new FAQ({
      question: faqData.question,
      answer: faqData.answer,
      category: faqData.category ||'General',
      status: faqData.status ||'draft',
      isActive: faqData.isActive !== undefined ? faqData.isActive : true,
      priority: faqData.priority || 5,
      tags: faqData.tags || [],
      lastUpdatedBy: faqData.lastUpdatedBy ||'Admin',
      metaTitle: faqData.metaTitle,
      metaDescription: faqData.metaDescription
    });

    const savedFAQ = await newFAQ.save();
    console.log(' FAQ created:', savedFAQ._id);

    res.status(201).json({
      success: true,
      message:'FAQ created successfully',
      data: savedFAQ
    });

  } catch (error) {
    console.error(' Error creating FAQ:', error);

    let errorMessage ='Failed to create FAQ';
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
      validationErrors: validationErrors
    });
  }
});

//  READ - Get all FAQs with advanced filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      isActive,
      priority,
      sortBy ='createdAt',
      sortOrder ='desc',
      search,
      tags
    } = req.query;

    console.log(' Fetching FAQs with filters:', req.query);

    // Build filter object
    const filter = {};
    if (category && category !=='All') filter.category = category;
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive ==='true';
    if (priority) filter.priority = parseInt(priority);
    if (tags) filter.tags = { $in: tags.split(',') };

    // Add search functionality
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options:'i' } },
        { answer: { $regex: search, $options:'i' } },
        { tags: { $in: [new RegExp(search,'i')] } },
        { searchKeywords: { $in: [new RegExp(search,'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder ==='asc' ? 1 : -1;

    // Add secondary sort by priority and creation date
    if (sortBy !=='priority') sort.priority = -1;
    if (sortBy !=='createdAt') sort.createdAt = -1;

    // Execute query with pagination
    const faqs = await FAQ.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedFAQs','question category')
      .exec();

    const totalFAQs = await FAQ.countDocuments(filter);

    console.log(` Found ${faqs.length} FAQs`);

    res.json({
      success: true,
      data: faqs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalFAQs / limit),
        totalItems: totalFAQs,
        hasNext: page * limit < totalFAQs,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error(' Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch FAQs',
      error: error.message
    });
  }
});

//  READ - Get published FAQs for public display (grouped by category)
router.get('/public', async (req, res) => {
  try {
    console.log(' Fetching public FAQs...');

    const { category, search, limit = 50 } = req.query;

    const filter = {
      status:'published',
      isActive: true
    };

    if (category && category !=='All') filter.category = category;

    if (search) {
      filter.$or = [
        { question: { $regex: search, $options:'i' } },
        { answer: { $regex: search, $options:'i' } },
        { tags: { $in: [new RegExp(search,'i')] } }
      ];
    }

    const faqs = await FAQ.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('question answer category priority tags viewCount helpfulCount')
      .exec();

    // Group FAQs by category
    const groupedFAQs = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push(faq);
      return acc;
    }, {});

    console.log(' Public FAQs grouped by category');

    res.json({
      success: true,
      data: groupedFAQs,
      totalFAQs: faqs.length
    });

  } catch (error) {
    console.error(' Error fetching public FAQs:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch public FAQs',
      error: error.message
    });
  }
});

//  READ - Get single FAQ by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid FAQ ID'
      });
    }

    const faq = await FAQ.findById(id)
      .populate('relatedFAQs','question category');

    if (!faq) {
      return res.status(404).json({
        success: false,
        message:'FAQ not found'
      });
    }

    // Increment view count
    faq.viewCount += 1;
    await faq.save();

    res.json({
      success: true,
      data: faq
    });

  } catch (error) {
    console.error(' Error fetching FAQ:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch FAQ',
      error: error.message
    });
  }
});

//  UPDATE - Update FAQ
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid FAQ ID'
      });
    }

    console.log(' Updating FAQ:', id);

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      {
        ...updateData,
        lastUpdatedBy: updateData.lastUpdatedBy ||'Admin'
      },
      { new: true, runValidators: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({
        success: false,
        message:'FAQ not found'
      });
    }

    console.log(' FAQ updated:', updatedFAQ.question);

    res.json({
      success: true,
      message:'FAQ updated successfully',
      data: updatedFAQ
    });

  } catch (error) {
    console.error(' Error updating FAQ:', error);
    res.status(400).json({
      success: false,
      message:'Failed to update FAQ',
      error: error.message
    });
  }
});

//  DELETE - Remove FAQ
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid FAQ ID'
      });
    }

    console.log(' Deleting FAQ:', id);

    const deletedFAQ = await FAQ.findByIdAndDelete(id);

    if (!deletedFAQ) {
      return res.status(404).json({
        success: false,
        message:'FAQ not found'
      });
    }

    console.log(' FAQ deleted:', deletedFAQ.question);

    res.json({
      success: true,
      message:'FAQ deleted successfully'
    });

  } catch (error) {
    console.error(' Error deleting FAQ:', error);
    res.status(500).json({
      success: false,
      message:'Failed to delete FAQ',
      error: error.message
    });
  }
});

//  FEEDBACK - Mark FAQ as helpful/not helpful
router.post('/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid FAQ ID'
      });
    }

    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message:'FAQ not found'
      });
    }

    if (helpful === true) {
      faq.helpfulCount += 1;
    } else if (helpful === false) {
      faq.notHelpfulCount += 1;
    }

    await faq.save();

    res.json({
      success: true,
      message:'Feedback recorded successfully',
      data: {
        helpfulCount: faq.helpfulCount,
        notHelpfulCount: faq.notHelpfulCount
      }
    });

  } catch (error) {
    console.error(' Error recording feedback:', error);
    res.status(500).json({
      success: false,
      message:'Failed to record feedback',
      error: error.message
    });
  }
});

//  CATEGORIES - Get all categories with FAQ counts
router.get('/categories/list', async (req, res) => {
  try {
    console.log(' Fetching FAQ categories...');

    const categories = await FAQ.aggregate([
      {
        $group: {
          _id:'$category',
          totalCount: { $sum: 1 },
          publishedCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status','published'] }, { $eq: ['$isActive', true] }] },
                1,
                0
              ]
            }
          },
          draftCount: {
            $sum: {
              $cond: [{ $eq: ['$status','draft'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const categoryList = categories.map(cat => ({
      name: cat._id,
      total: cat.totalCount,
      published: cat.publishedCount,
      draft: cat.draftCount
    }));

    res.json({
      success: true,
      data: categoryList
    });

  } catch (error) {
    console.error(' Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch categories',
      error: error.message
    });
  }
});

//  STATISTICS - Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    console.log(' Fetching FAQ dashboard statistics...');

    const totalFAQs = await FAQ.countDocuments();
    const publishedFAQs = await FAQ.countDocuments({ status:'published', isActive: true });
    const draftFAQs = await FAQ.countDocuments({ status:'draft' });
    const archivedFAQs = await FAQ.countDocuments({ status:'archived' });

    // Aggregate statistics
    const aggregateResult = await FAQ.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum:'$viewCount' },
          totalHelpful: { $sum:'$helpfulCount' },
          totalNotHelpful: { $sum:'$notHelpfulCount' },
          avgPriority: { $avg:'$priority' }
        }
      }
    ]);

    const aggregateData = aggregateResult[0] || {
      totalViews: 0,
      totalHelpful: 0,
      totalNotHelpful: 0,
      avgPriority: 5
    };

    // Category distribution
    const categoryStats = await FAQ.aggregate([
      {
        $match: { status:'published', isActive: true }
      },
      {
        $group: {
          _id:'$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const stats = {
      totalFAQs,
      publishedFAQs,
      draftFAQs,
      archivedFAQs,
      totalViews: aggregateData.totalViews,
      totalHelpful: aggregateData.totalHelpful,
      totalNotHelpful: aggregateData.totalNotHelpful,
      avgPriority: Math.round(aggregateData.avgPriority || 5),
      categoryDistribution: categoryStats,
      helpfulnessRate: aggregateData.totalHelpful > 0 ?
        Math.round((aggregateData.totalHelpful / (aggregateData.totalHelpful + aggregateData.totalNotHelpful)) * 100) : 0
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

//  SEARCH - Advanced search FAQs
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { category, limit = 20 } = req.query;

    console.log(' Searching FAQs for:', query);

    const searchFilter = {
      $and: [
        { status:'published', isActive: true },
        {
          $or: [
            { question: { $regex: query, $options:'i' } },
            { answer: { $regex: query, $options:'i' } },
            { tags: { $in: [new RegExp(query,'i')] } },
            { searchKeywords: { $in: [new RegExp(query,'i')] } }
          ]
        }
      ]
    };

    if (category && category !=='All') {
      searchFilter.$and.push({ category: category });
    }

    const searchResults = await FAQ.find(searchFilter)
      .limit(parseInt(limit))
      .sort({ priority: -1, viewCount: -1 })
      .select('question answer category priority viewCount helpfulCount')
      .exec();

    console.log(' Found', searchResults.length,'results');

    res.json({
      success: true,
      data: searchResults,
      query: query,
      totalResults: searchResults.length
    });

  } catch (error) {
    console.error(' Error searching FAQs:', error);
    res.status(500).json({
      success: false,
      message:'Search failed',
      error: error.message
    });
  }
});

//  BULK OPERATIONS - Bulk update status
router.patch('/bulk/status', async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message:'Please provide valid IDs array'
      });
    }

    if (!['draft','published','archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message:'Invalid status. Must be draft, published, or archived'
      });
    }

    console.log(' Bulk updating status for:', ids.length,'FAQs');

    const result = await FAQ.updateMany(
      { _id: { $in: ids } },
      {
        status: status,
        lastUpdatedBy:'Admin'
      }
    );

    console.log(' Bulk update completed:', result.modifiedCount,'FAQs updated');

    res.json({
      success: true,
      message: `${result.modifiedCount} FAQs updated successfully`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error(' Error in bulk status update:', error);
    res.status(500).json({
      success: false,
      message:'Failed to update FAQs',
      error: error.message
    });
  }
});

module.exports = router;
