const express = require('express');
const router = express.Router();
const agentController = require('./agentController');

// Parse natural language → structured intent + fields
router.post('/chat', agentController.chat);

// Server-side execution of management intents (approve/reject/delete/list)
// These are safer to execute on the backend than via direct client API calls
router.post('/execute', agentController.execute);

// Blog / Course content writing assistant (AI-powered via Gemini or local fallback)
router.post('/blog-chat', agentController.blogChat);

// Auto-write a complete blog post from a topic — returns structured JSON
// (title, content, metaDescription, tags) for the frontend form-filler.
router.post('/blog-generate', agentController.blogGenerate);

// AI Recommendation System - takes natural language prompt, searches models, and returns conversational response
router.post('/recommend', agentController.recommend);

module.exports = router;
