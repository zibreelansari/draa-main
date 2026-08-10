const FooterSection = require('../Models/FooterModels');

// Get all footer sections with their links
exports.getFooterData = async (req, res) => {
  try {
    const sections = await FooterSection.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all sections (including inactive)
exports.getAllFooterSections = async (req, res) => {
  try {
    const sections = await FooterSection.find().sort({ order: 1 });
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create new section
exports.createFooterSection = async (req, res) => {
  try {
    const { title, order } = req.body;
    const newSection = new FooterSection({ title, order });
    await newSection.save();
    res.status(201).json({ success: true, data: newSection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update section
exports.updateFooterSection = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedSection = await FooterSection.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, data: updatedSection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete section
exports.deleteFooterSection = async (req, res) => {
  try {
    const { id } = req.params;
    await FooterSection.findByIdAndDelete(id);
    res.status(200).json({ success: true, message:'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Add link to section
exports.addFooterLink = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { label, url, linkType, order } = req.body;
    
    const section = await FooterSection.findById(sectionId);
    if (!section) return res.status(404).json({ success: false, message:'Section not found' });
    
    section.links.push({ label, url, linkType, order });
    await section.save();
    
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update link in section
exports.updateFooterLink = async (req, res) => {
  try {
    const { sectionId, linkId } = req.params;
    const { label, url, linkType, order, isActive } = req.body;
    
    const section = await FooterSection.findById(sectionId);
    if (!section) return res.status(404).json({ success: false, message:'Section not found' });
    
    const link = section.links.id(linkId);
    if (!link) return res.status(404).json({ success: false, message:'Link not found' });
    
    if (label !== undefined) link.label = label;
    if (url !== undefined) link.url = url;
    if (linkType !== undefined) link.linkType = linkType;
    if (order !== undefined) link.order = order;
    if (isActive !== undefined) link.isActive = isActive;
    
    await section.save();
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete link from section
exports.deleteFooterLink = async (req, res) => {
  try {
    const { sectionId, linkId } = req.params;
    
    const section = await FooterSection.findById(sectionId);
    if (!section) return res.status(404).json({ success: false, message:'Section not found' });
    
    section.links.pull({ _id: linkId });
    await section.save();
    
    res.status(200).json({ success: true, message:'Link removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
