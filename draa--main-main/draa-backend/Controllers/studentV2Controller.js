const User = require("../Models/UserModel");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { validateIndianPincodeAddress } = require("../utils/pincodeLookup");

const normalizeDeliveryAddress = (rawAddress) => {
  if (!rawAddress) return null;

  const address = typeof rawAddress === "string"
    ? (() => {
      try {
        return JSON.parse(rawAddress);
      } catch {
        return null;
      }
    })()
    : rawAddress;

  if (!address || typeof address !== "object") return null;

  const fields = ["fullName", "phone", "house", "area", "landmark", "pincode", "city", "district", "state", "country"];
  return fields.reduce((acc, field) => {
    if (address[field] !== undefined && address[field] !== null) {
      acc[field] = String(address[field]).trim();
    }
    return acc;
  }, {});
};

// GET /api/v2/student/profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // From studentAuth middleware
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phn, deliveryAddress, settings } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update basic info
    if (name) user.name = name;
    if (email) user.email = email;
    if (phn) user.phn = phn;

    // Update settings preferences
    if (settings !== undefined) {
      try {
        const parsedSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;
        user.settings = {
          darkMode: parsedSettings.darkMode ?? user.settings?.darkMode ?? false,
          language: parsedSettings.language ?? user.settings?.language ?? 'en',
          privacy: {
            showProfile: parsedSettings.privacy?.showProfile ?? user.settings?.privacy?.showProfile ?? true,
            showRanking: parsedSettings.privacy?.showRanking ?? user.settings?.privacy?.showRanking ?? true
          }
        };
      } catch (parseErr) {
        console.error("Failed to parse student settings:", parseErr);
      }
    }

    const normalizedAddress = normalizeDeliveryAddress(deliveryAddress);
    if (normalizedAddress) {
      const hasDeliveryLocation = ["house", "area", "landmark", "pincode", "city", "district", "state"]
        .some(field => normalizedAddress[field]);
      let verifiedAddress = normalizedAddress;

      if (hasDeliveryLocation) {
        const pincodeValidation = await validateIndianPincodeAddress(normalizedAddress);
        if (!pincodeValidation.valid) {
          return res.status(400).json({
            success: false,
            message: pincodeValidation.message,
            suggestions: pincodeValidation.suggestions || []
          });
        }
        verifiedAddress = pincodeValidation.address;
      }

      user.deliveryAddress = {
        ...(user.deliveryAddress?.toObject ? user.deliveryAddress.toObject() : user.deliveryAddress || {}),
        ...verifiedAddress,
        country: verifiedAddress.country || user.deliveryAddress?.country || "India"
      };
    }

    // Handle Avatar Upload
    if (req.file) {
      // Delete old avatar if it exists and is local
      if (user.avatar && !user.avatar.startsWith("http")) {
        const oldPath = path.join(__dirname, "../", user.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      // Store relative path to DB
      user.avatar = `uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/v2/student/devices
const getDevices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("devices");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const authHeader = req.headers.authorization;
    let currentDeviceId = null;
    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token);
      currentDeviceId = decoded?.deviceId;
    }

    const devices = (user.devices || []).map(dev => ({
      deviceId: dev.deviceId,
      deviceType: dev.deviceType,
      browser: dev.browser,
      os: dev.os,
      ipAddress: dev.ipAddress,
      location: dev.location,
      lastUsedAt: dev.lastUsedAt,
      registeredAt: dev.registeredAt,
      isCurrent: dev.deviceId === currentDeviceId
    }));

    res.status(200).json({ success: true, devices });
  } catch (error) {
    console.error("Get Devices Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/v2/student/devices/logout
const logoutDevice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { deviceId, all } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (all) {
      user.devices = [];
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    } else if (deviceId) {
      user.devices = user.devices.filter(d => d.deviceId !== deviceId);
    } else {
      return res.status(400).json({ success: false, message: "Device ID is required" });
    }

    await user.save();
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Device Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDevices,
  logoutDevice,
};
