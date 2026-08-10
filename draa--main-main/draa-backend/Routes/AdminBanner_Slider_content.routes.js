const express = require("express");
const router = express.Router();
const upload = require("../Middlewares/uploadBanner");
const bannerCtrl = require("../Controllers/AdminBanner_Slider_content.controllrt");

// Admin
router.get("/all", bannerCtrl.getAllBanners);
router.post("/create", upload.fields([{ name: "image", maxCount: 1 }, { name: "mobileImage", maxCount: 1 }]), bannerCtrl.createBanner);
router.put("/update/:id", upload.fields([{ name: "image", maxCount: 1 }, { name: "mobileImage", maxCount: 1 }]), bannerCtrl.updateBanner);
router.delete("/delete/:id", bannerCtrl.deleteBanner);
router.patch("/toggle/:id", bannerCtrl.toggleBannerStatus);

// Public
router.get("/public", bannerCtrl.getPublicBanners);

module.exports = router;
