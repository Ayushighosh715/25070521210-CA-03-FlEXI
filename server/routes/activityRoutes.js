/**
 * Activity Routes
 * Endpoints for tracking user searches/views and computing personalized recommendations.
 */
const express = require('express');
const router = express.Router();
const {
  logActivity,
  getRecommendations
} = require('../controllers/activityController');
const { optionalAuth } = require('../middleware/auth');

// Both logging and recommendations can take optional auth
router.post('/', optionalAuth, logActivity);
router.get('/recommendations', optionalAuth, getRecommendations);

module.exports = router;

