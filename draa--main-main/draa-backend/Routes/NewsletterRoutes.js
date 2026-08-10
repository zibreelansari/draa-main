const express = require("express");
const router = express.Router();
const { subscribe, verify, unsubscribe } = require("../Controllers/NewsletterController");

// Endpoints mapped to newsletter controller actions
router.post("/subscribe", subscribe);
router.get("/verify", verify);
router.post("/unsubscribe", unsubscribe);

module.exports = router;
