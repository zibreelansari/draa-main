const express = require("express");
const router = express.Router();
const { generateSitemap } = require("../Controllers/SitemapController");

router.get("/", generateSitemap);

module.exports = router;
