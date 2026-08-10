const express = require("express");
const router = express.Router();
const { getProfile, updateProfile, getDevices, logoutDevice } = require("../Controllers/studentV2Controller");
const { authMiddleware: studentAuth } = require("../Middlewares/student.auth.middleware");
const avatarUpload = require("../Middlewares/avatarUpload");

// GET /api/v1/student/profile
router.get("/profile", studentAuth, getProfile);

// PUT /api/v1/student/profile
router.put("/profile", studentAuth, avatarUpload.single("avatar"), updateProfile);

// GET /api/v1/student/devices
router.get("/devices", studentAuth, getDevices);

// POST /api/v1/student/devices/logout
router.post("/devices/logout", studentAuth, logoutDevice);

module.exports = router;
