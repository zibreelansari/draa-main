const ChatbotFAQ = require('../Models/ChatbotFAQ');

// Create FAQ (Admin only)
exports.createFAQ = async (req, res) => {
  try {
    const { question, answer, category, isActive, priority } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }
    const faq = await ChatbotFAQ.create({
      question,
      answer,
      category: category || 'General',
      isActive: isActive ?? true,
      priority: priority ?? 0
    });
    res.status(201).json({ success: true, message: 'FAQ added successfully', data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all FAQs (Admin - active + inactive)
exports.getAllFAQsAdmin = async (req, res) => {
  try {
    const faqs = await ChatbotFAQ.find().sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get active FAQs (Public)
exports.getPublicFAQs = async (req, res) => {
  try {
    const faqs = await ChatbotFAQ.find({ isActive: true }).sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update FAQ (Admin only)
exports.updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await ChatbotFAQ.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, message: 'FAQ updated successfully', data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete FAQ (Admin only)
exports.deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await ChatbotFAQ.findByIdAndDelete(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle active status (Admin only)
exports.toggleFAQStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await ChatbotFAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    faq.isActive = !faq.isActive;
    await faq.save();
    res.json({ success: true, message: `FAQ is now ${faq.isActive ? 'Active' : 'Inactive'}`, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
