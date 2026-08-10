// routes/privacyPolicy.js
const express = require('express');
const router = express.Router();
const PrivacyPolicy = require('../Models/privacyPolicyModels');
const mongoose = require('mongoose');

//  GET ALL PRIVACY POLICIES (with pagination, filters, sorting)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      language,
      sortBy ='createdAt',
      sortOrder ='desc'
    } = req.query;

    console.log(' Fetching privacy policies with filters:', req.query);

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (language) filter['metadata.language'] = language;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder ==='asc' ? 1 : -1;

    // Execute query with pagination
    const policies = await PrivacyPolicy.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const totalPolicies = await PrivacyPolicy.countDocuments(filter);

    console.log(` Found ${policies.length} privacy policies`);

    res.json({
      success: true,
      data: policies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPolicies / limit),
        totalPolicies,
        hasNext: page * limit < totalPolicies,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error(' Error fetching privacy policies:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch privacy policies',
      error: error.message
    });
  }
});

//  GET ACTIVE PRIVACY POLICY (for public display)
router.get('/active', async (req, res) => {
  try {
    console.log(' Fetching active privacy policy...');

    const activePolicy = await PrivacyPolicy.findOne({
      isActive: true,
      status:'published'
    });

    if (!activePolicy) {
      return res.status(404).json({
        success: false,
        message:'No active privacy policy found'
      });
    }

    console.log(' Active privacy policy found:', activePolicy.title);

    res.json({
      success: true,
      data: activePolicy
    });

  } catch (error) {
    console.error(' Error fetching active privacy policy:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch active privacy policy',
      error: error.message
    });
  }
});

//  GET SINGLE PRIVACY POLICY BY ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid privacy policy ID'
      });
    }

    console.log(' Fetching privacy policy by ID:', id);

    const policy = await PrivacyPolicy.findById(id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message:'Privacy policy not found'
      });
    }

    console.log(' Privacy policy found:', policy.title);

    res.json({
      success: true,
      data: policy
    });

  } catch (error) {
    console.error(' Error fetching privacy policy:', error);
    res.status(500).json({
      success: false,
      message:'Failed to fetch privacy policy',
      error: error.message
    });
  }
});

//  CREATE NEW PRIVACY POLICY
router.post('/', async (req, res) => {
  try {
    const policyData = req.body;
    console.log(' Creating new privacy policy:', policyData.title);

    // Validate required fields
    if (!policyData.title || !policyData.version || !policyData.content) {
      return res.status(400).json({
        success: false,
        message:'Missing required fields: title, version, content'
      });
    }

    // Create new policy
    const newPolicy = new PrivacyPolicy({
      ...policyData,
      createdBy: {
        name: policyData.createdBy?.name ||'Admin User',
        email: policyData.createdBy?.email ||'admin@draa.com'
      }
    });

    const savedPolicy = await newPolicy.save();
    console.log(' Privacy policy created:', savedPolicy._id);

    res.status(201).json({
      success: true,
      message:'Privacy policy created successfully',
      data: savedPolicy
    });

  } catch (error) {
    console.error(' Error creating privacy policy:', error);
    res.status(500).json({
      success: false,
      message:'Failed to create privacy policy',
      error: error.message
    });
  }
});

//  UPDATE PRIVACY POLICY
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid privacy policy ID'
      });
    }

    console.log(' Updating privacy policy:', id);

    // Add updatedBy information
    updateData.updatedBy = {
      name: updateData.updatedBy?.name ||'Admin User',
      email: updateData.updatedBy?.email ||'admin@draa.com'
    };

    const updatedPolicy = await PrivacyPolicy.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPolicy) {
      return res.status(404).json({
        success: false,
        message:'Privacy policy not found'
      });
    }

    console.log(' Privacy policy updated:', updatedPolicy.title);

    res.json({
      success: true,
      message:'Privacy policy updated successfully',
      data: updatedPolicy
    });

  } catch (error) {
    console.error(' Error updating privacy policy:', error);
    res.status(500).json({
      success: false,
      message:'Failed to update privacy policy',
      error: error.message
    });
  }
});

//  DELETE PRIVACY POLICY
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid privacy policy ID'
      });
    }

    console.log(' Deleting privacy policy:', id);

    const policy = await PrivacyPolicy.findById(id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message:'Privacy policy not found'
      });
    }

    // Prevent deletion of active policy
    if (policy.isActive) {
      return res.status(400).json({
        success: false,
        message:'Cannot delete active privacy policy'
      });
    }

    await PrivacyPolicy.findByIdAndDelete(id);
    console.log(' Privacy policy deleted:', id);

    res.json({
      success: true,
      message:'Privacy policy deleted successfully'
    });

  } catch (error) {
    console.error(' Error deleting privacy policy:', error);
    res.status(500).json({
      success: false,
      message:'Failed to delete privacy policy',
      error: error.message
    });
  }
});

//  ACTIVATE PRIVACY POLICY
router.post('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid privacy policy ID'
      });
    }

    console.log(' Activating privacy policy:', id);

    // Deactivate all other policies first
    await PrivacyPolicy.updateMany({}, { isActive: false });

    // Activate the selected policy
    const activatedPolicy = await PrivacyPolicy.findByIdAndUpdate(
      id,
      {
        isActive: true,
        status:'published' // Auto-publish when activating
      },
      { new: true }
    );

    if (!activatedPolicy) {
      return res.status(404).json({
        success: false,
        message:'Privacy policy not found'
      });
    }

    console.log(' Privacy policy activated:', activatedPolicy.title);

    res.json({
      success: true,
      message:'Privacy policy activated successfully',
      data: activatedPolicy
    });

  } catch (error) {
    console.error(' Error activating privacy policy:', error);
    res.status(500).json({
      success: false,
      message:'Failed to activate privacy policy',
      error: error.message
    });
  }
});

//  RECORD POLICY VIEW
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid privacy policy ID'
      });
    }

    console.log(' Recording privacy policy view:', id);

    const updatedPolicy = await PrivacyPolicy.findByIdAndUpdate(
      id,
      {
        $inc: {'analytics.views': 1 },
'analytics.lastViewed': new Date()
      },
      { new: true }
    );

    if (!updatedPolicy) {
      return res.status(404).json({
        success: false,
        message:'Privacy policy not found'
      });
    }

    console.log(' View recorded for:', updatedPolicy.title);

    res.json({
      success: true,
      message:'View recorded successfully'
    });

  } catch (error) {
    console.error(' Error recording view:', error);
    res.status(500).json({
      success: false,
      message:'Failed to record view',
      error: error.message
    });
  }
});

//  RECORD POLICY ACCEPTANCE
router.post('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userType } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message:'Invalid privacy policy ID'
      });
    }

    console.log(' Recording privacy policy acceptance:', id);

    const updatedPolicy = await PrivacyPolicy.findByIdAndUpdate(
      id,
      {
        $inc: {'analytics.acceptances': 1 }
      },
      { new: true }
    );

    if (!updatedPolicy) {
      return res.status(404).json({
        success: false,
        message:'Privacy policy not found'
      });
    }

    // TODO: Store individual acceptance records in separate collection
    // This is just incrementing the counter for now

    console.log(' Acceptance recorded for:', updatedPolicy.title);

    res.json({
      success: true,
      message:'Acceptance recorded successfully'
    });

  } catch (error) {
    console.error(' Error recording acceptance:', error);
    res.status(500).json({
      success: false,
      message:'Failed to record acceptance',
      error: error.message
    });
  }
});

//  GET DASHBOARD STATISTICS
router.get('/stats/dashboard', async (req, res) => {
  try {
    console.log(' Fetching dashboard statistics...');

    const totalPolicies = await PrivacyPolicy.countDocuments();
    const activePolicies = await PrivacyPolicy.countDocuments({ isActive: true });
    const draftPolicies = await PrivacyPolicy.countDocuments({ status:'draft' });

    // Aggregate analytics
    const analyticsResult = await PrivacyPolicy.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum:'$analytics.views' },
          totalAcceptances: { $sum:'$analytics.acceptances' }
        }
      }
    ]);

    const analytics = analyticsResult[0] || { totalViews: 0, totalAcceptances: 0 };

    const stats = {
      totalPolicies,
      activePolicies,
      draftPolicies,
      totalViews: analytics.totalViews,
      totalAcceptances: analytics.totalAcceptances
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
