const Videography = require('../Models/Videography');

// Create video (Admin only)
exports.createVideo = async (req, res) => {
  try {
    const { title, url, category, description, isActive, priority } = req.body;
    if (!title || !url) {
      return res.status(400).json({ success: false, message: 'Title and URL are required' });
    }
    const video = await Videography.create({
      title,
      url,
      category: category || 'YouTube',
      description,
      isActive: isActive ?? true,
      priority: priority ?? 0
    });
    res.status(201).json({ success: true, message: 'Video added successfully', data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all videos (Admin - active + inactive, sorted by priority)
exports.getAllVideosAdmin = async (req, res) => {
  try {
    const videos = await Videography.find().sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, count: videos.length, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get active videos (Public - sorted by priority)
exports.getPublicVideos = async (req, res) => {
  try {
    const videos = await Videography.find({ isActive: true }).sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, count: videos.length, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update video (Admin only)
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Videography.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    res.json({ success: true, message: 'Video updated successfully', data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete video (Admin only)
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Videography.findByIdAndDelete(id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle active status (Admin only)
exports.toggleVideoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Videography.findById(id);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }
    video.isActive = !video.isActive;
    await video.save();
    res.json({ success: true, message: `Video is now ${video.isActive ? 'Active' : 'Inactive'}`, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
