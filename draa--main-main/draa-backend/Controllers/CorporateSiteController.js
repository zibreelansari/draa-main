const CorporatePage = require('../Models/CorporatePage');
const { corporatePages, corporatePagesBySlug } = require('../Config/corporatePages.defaults');

const mergePages = (storedPages) => {
  const storedBySlug = Object.fromEntries(storedPages.map((page) => [page.slug, page.toObject()]));
  return corporatePages.map((fallback) => storedBySlug[fallback.slug] || fallback);
};

exports.getNavigation = async (req, res) => {
  try {
    const storedPages = await CorporatePage.find({ isPublished: true })
      .select('slug navigationLabel order')
      .sort({ order: 1 })
      .lean();

    const storedBySlug = Object.fromEntries(storedPages.map((page) => [page.slug, page]));
    const navigation = corporatePages
      .map((fallback) => storedBySlug[fallback.slug] || {
        slug: fallback.slug,
        navigationLabel: fallback.navigationLabel,
        order: fallback.order,
      })
      .sort((a, b) => a.order - b.order);

    res.status(200).json({ success: true, data: navigation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPages = async (req, res) => {
  try {
    const storedPages = await CorporatePage.find({ isPublished: true }).sort({ order: 1 });
    res.status(200).json({ success: true, data: mergePages(storedPages) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPageBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || '').toLowerCase();
    const storedPage = await CorporatePage.findOne({ slug, isPublished: true }).lean();
    const page = storedPage || corporatePagesBySlug[slug];

    if (!page) {
      return res.status(404).json({ success: false, message: 'Corporate page not found' });
    }

    return res.status(200).json({ success: true, data: page });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.upsertPage = async (req, res) => {
  try {
    const slug = String(req.params.slug || '').toLowerCase();
    const allowed = ['navigationLabel', 'order', 'eyebrow', 'title', 'summary', 'sections', 'seo', 'isPublished'];
    const updates = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    const fallback = corporatePagesBySlug[slug];

    if (!fallback && !updates.title) {
      return res.status(400).json({ success: false, message: 'A title is required for a new page' });
    }

    const page = await CorporatePage.findOneAndUpdate(
      { slug },
      {
        $set: {
          ...fallback,
          ...updates,
          slug,
          updatedBy: req.admin?.adminId || req.admin?.id || null,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, data: page });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.removePageOverride = async (req, res) => {
  try {
    const slug = String(req.params.slug || '').toLowerCase();
    await CorporatePage.deleteOne({ slug });
    return res.status(200).json({
      success: true,
      message: corporatePagesBySlug[slug] ? 'Custom content removed; the default page is active.' : 'Page removed.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
