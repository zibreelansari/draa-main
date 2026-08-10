const JobCategory = require('../Models/jobsModel').JobCategory;

// @desc Create a new category
// @route POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, subcategories = [] } = req.body;

    // Check if category already exists
    const exists = await JobCategory.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ success: false, message:'Category already exists' });
    }

    const category = new JobCategory({
      name: name.trim(),
      subcategories: subcategories.map((sub) => sub.trim()),
    });

    await category.save();

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message:'Error creating category', error: error.message });
  }
};

// @desc Get all categories
// @route GET /api/categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await JobCategory.find().sort({ name: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message:'Error fetching categories', error: error.message });
  }
};

// @desc Get single category by ID
// @route GET /api/categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await JobCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message:'Category not found' });

    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message:'Error fetching category', error: error.message });
  }
};

// @desc Update category by ID
// @route PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { name, subcategories = [] } = req.body;

    const updatedCategory = await JobCategory.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        subcategories: subcategories.map((sub) => sub.trim()),
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message:'Category not found' });
    }

    res.status(200).json({ success: true, category: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message:'Error updating category', error: error.message });
  }
};

// @desc Delete category by ID
// @route DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await JobCategory.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ success: false, message:'Category not found' });
    }

    res.status(200).json({ success: true, message:'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message:'Error deleting category', error: error.message });
  }
};






