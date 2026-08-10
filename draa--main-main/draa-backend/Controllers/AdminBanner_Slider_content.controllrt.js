const Banner = require('../Models/AdminBanner_Slider_content.model');
const path = require("path");
const sharp = require('sharp');
const fs = require('fs');
const axios = require('axios');

// Helper to ensure file exists locally (downloads from production if missing)
const ensureLocalFile = async (relativeWebPath) => {
  try {
    const serverDir = path.join(__dirname, '..');
    const cleanWebPath = relativeWebPath.startsWith('/') ? relativeWebPath.slice(1) : relativeWebPath;
    const localPath = path.resolve(serverDir, cleanWebPath);

    if (fs.existsSync(localPath)) {
      const contentHeader = fs.readFileSync(localPath, 'utf8').substring(0, 100);
      if (contentHeader.includes('<html') || contentHeader.includes('<!doctype') || contentHeader.includes('<!DOCTYPE')) {
        console.log(`[Migration] Local file is a dummy HTML page. Deleting and re-downloading: ${localPath}`);
        fs.unlinkSync(localPath);
      } else {
        return localPath;
      }
    }

    const prodBaseUrl = 'https://api.draa.in';
    const remoteUrl = `${prodBaseUrl}/${cleanWebPath}`;
    console.log(`[Migration] File missing locally. Downloading from ${remoteUrl}...`);
    
    const response = await axios({
      method: 'get',
      url: remoteUrl,
      responseType: 'stream'
    });
    
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    const writer = fs.createWriteStream(localPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    console.log(`[Migration] Successfully downloaded: ${remoteUrl}`);
    return localPath;
  } catch (error) {
    console.error(`[Migration] Failed to find or download file ${relativeWebPath}:`, error.message);
    return null;
  }
};

const generateMobileFromWeb = async (webImagePath, filename) => {
  try {
    const serverDir = path.join(__dirname, '..');
    
    // Ensure file exists locally before running sharp
    const localWebPath = await ensureLocalFile(webImagePath);
    if (!localWebPath) {
      throw new Error(`Web image file could not be found locally or downloaded: ${webImagePath}`);
    }

    const relativeOutputPath = `uploads/banners/mobile_${filename}`;
    const fullOutputPath = path.resolve(serverDir, relativeOutputPath);

    const dir = path.dirname(fullOutputPath);
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }

    // Always generate mobile image using Option A: Padded blurred background (1000x500)
    // 1. Create a blurred background of 1000x500
    const blurredBg = await sharp(localWebPath)
      .resize(1000, 500, { fit: 'cover' })
      .blur(40)
      .toBuffer();

    // 2. Create the fitted foreground banner with transparent background
    const foreground = await sharp(localWebPath)
      .resize(1000, 500, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    // 3. Composite foreground onto the blurred background
    await sharp(blurredBg)
      .composite([{ input: foreground }])
      .toFile(fullOutputPath);

    return `/uploads/banners/mobile_${filename}`;
  } catch (error) {
    console.error("Failed to auto-generate mobile banner:", error);
    return webImagePath; // Fallback to original web image
  }
};

// @desc Get all banners (admin)
exports.getAllBanners = async (req, res) => {
  try {
    const filter = {};
    if (req.query.deviceType) {
      filter.deviceType = { $in: [req.query.deviceType, 'both'] };
    }
    const banners = await Banner.find(filter).sort({ order: 1 });
    res.status(200).json({ success: true, count: banners.length, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Public active banners
exports.getPublicBanners = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.deviceType) {
      filter.deviceType = { $in: [req.query.deviceType, 'both'] };
    }
    const banners = await Banner.find(filter).sort({ order: 1 });
    res.status(200).json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create Banner
exports.createBanner = async (req, res) => {
  try {
    let imageUrl = "";
    let mobileImageUrl = "";

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        imageUrl = `/uploads/banners/${req.files.image[0].filename}`;
      }
      if (req.files.mobileImage && req.files.mobileImage[0]) {
        mobileImageUrl = `/uploads/banners/${req.files.mobileImage[0].filename}`;
      }
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Web banner image is required (standard size 2500x400)" });
    }

    if (!mobileImageUrl) {
      mobileImageUrl = await generateMobileFromWeb(imageUrl, req.files.image[0].filename);
    }

    const banner = await Banner.create({
      ...req.body,
      imageUrl,
      mobileImageUrl,
      mobileResizeMode: 'padded'
    });

    res.status(201).json({
      success: true,
      message:"Banner created successfully",
      data: banner,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc Update Banner
exports.updateBanner = async (req, res) => {
  try {
    const existing = await Banner.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ success: false, message:"Banner not found" });
    }

    let updatedImage = existing.imageUrl;
    let updatedMobileImage = existing.mobileImageUrl;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        updatedImage = `/uploads/banners/${req.files.image[0].filename}`;
        if (!req.files.mobileImage || !req.files.mobileImage[0]) {
          updatedMobileImage = await generateMobileFromWeb(updatedImage, req.files.image[0].filename);
        }
      }
      if (req.files.mobileImage && req.files.mobileImage[0]) {
        updatedMobileImage = `/uploads/banners/${req.files.mobileImage[0].filename}`;
      }
    } else {
      // If only metadata was updated, check if we need to auto-generate a missing mobile banner
      const needsRegeneration = !updatedMobileImage || 
                                updatedMobileImage === updatedImage ||
                                updatedMobileImage.includes('undefined') ||
                                updatedMobileImage.includes('null');
      if (needsRegeneration && updatedImage) {
        const originalFilename = path.basename(updatedImage);
        updatedMobileImage = await generateMobileFromWeb(updatedImage, originalFilename);
      }
    }

    const updateData = {
      ...req.body,
      imageUrl: updatedImage,
      mobileImageUrl: updatedMobileImage,
      mobileResizeMode: 'padded'
    };

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message:"Banner updated successfully",
      data: banner,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner)
      return res.status(404).json({ success: false, message:"Banner not found" });

    res.status(200).json({
      success: true,
      message:"Banner deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Toggle active/inactive
exports.toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner)
      return res.status(404).json({ success: false, message:"Banner not found" });

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner is now ${banner.isActive ?"Active" :"Inactive"}`,
      data: banner,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Migration for existing banners that don't have mobileImageUrl or have mobileImageUrl == imageUrl
exports.migrateExistingBanners = async () => {
  try {
    const banners = await Banner.find();
    let migratedCount = 0;
    for (const banner of banners) {
      const needsMigration = !banner.mobileImageUrl || 
                             banner.mobileImageUrl === banner.imageUrl ||
                             banner.mobileImageUrl.includes('undefined') ||
                             banner.mobileImageUrl.includes('null');
      if (needsMigration && banner.imageUrl) {
        const filename = path.basename(banner.imageUrl);
        const mobileUrl = await generateMobileFromWeb(banner.imageUrl, filename);
        if (mobileUrl !== banner.imageUrl) {
          banner.mobileImageUrl = mobileUrl;
          banner.mobileResizeMode = 'padded';
          await banner.save();
          migratedCount++;
          console.log(`[Migration] Successfully generated mobile banner for: ${banner.title || banner._id}`.green);
        }
      }
    }
    if (migratedCount > 0) {
      console.log(`[Migration] Finished generating mobile banners for ${migratedCount} banners.`.green.bold);
    }
  } catch (error) {
    console.error("[Migration] Error migrating existing banners:", error);
  }
};
