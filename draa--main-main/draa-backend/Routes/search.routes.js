const express = require("express");
const { globalSearch, trendingSearches } = require("../Controllers/search.controller");
const router = express.Router();

router.get("/global", globalSearch);
router.get("/trending", trendingSearches);

module.exports = router;
