// routes/terms.js
const express = require('express');
const router = express.Router();
const TermsAndConditions = require('../Models/TermsandConditionsModels');

// CREATE - Add new terms
router.post('/', async (req, res) => {
  try {
    const terms = new TermsAndConditions(req.body);
    await terms.save();
    
    res.status(201).json({
      success: true,
      message:'Terms & conditions created successfully',
      data: terms
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:'Failed to create terms & conditions',
      error: error.message
    });
  }
});

// READ - Get all terms
router.get('/', async (req, res) => {
  try {
    const terms = await TermsAndConditions.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Failed to fetch terms & conditions',
      error: error.message
    });
  }
});

// READ - Get single terms
router.get('/:id', async (req, res) => {
  try {
    const terms = await TermsAndConditions.findById(req.params.id);
    
    if (!terms) {
      return res.status(404).json({
        success: false,
        message:'Terms & conditions not found'
      });
    }
    
    res.json({
      success: true,
      data: terms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Failed to fetch terms & conditions',
      error: error.message
    });
  }
});

// UPDATE - Update terms
router.put('/:id', async (req, res) => {
  try {
    const terms = await TermsAndConditions.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!terms) {
      return res.status(404).json({
        success: false,
        message:'Terms & conditions not found'
      });
    }
    
    res.json({
      success: true,
      message:'Terms & conditions updated successfully',
      data: terms
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:'Failed to update terms & conditions',
      error: error.message
    });
  }
});

// ACTIVATE/DEACTIVATE terms
router.put('/:id/activate', async (req, res) => {
  try {
    // First, deactivate all other terms
    await TermsAndConditions.updateMany({}, { isActive: false });
    
    // Then activate the selected one
    const terms = await TermsAndConditions.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    
    if (!terms) {
      return res.status(404).json({
        success: false,
        message:'Terms & conditions not found'
      });
    }
    
    res.json({
      success: true,
      message:'Terms & conditions activated successfully',
      data: terms
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:'Failed to activate terms & conditions',
      error: error.message
    });
  }
});

// DELETE - Remove terms
router.delete('/:id', async (req, res) => {
  try {
    const terms = await TermsAndConditions.findByIdAndDelete(req.params.id);
    
    if (!terms) {
      return res.status(404).json({
        success: false,
        message:'Terms & conditions not found'
      });
    }
    
    res.json({
      success: true,
      message:'Terms & conditions deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:'Failed to delete terms & conditions',
      error: error.message
    });
  }
});

module.exports = router;
