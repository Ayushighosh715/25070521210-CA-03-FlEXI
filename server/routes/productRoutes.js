/**
 * Product Routes
 * Maps /api/products endpoints to productController actions.
 */
const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getCategories,
  getHighlights,
  getSuggestions
} = require('../controllers/productController');

// Search suggestions
router.get('/suggestions', getSuggestions);

// Highlights for home page (Featured & Trending)
router.get('/highlights', getHighlights);

// Category breakdown with counts
router.get('/categories', getCategories);

// Main catalog listing with query params
router.get('/', getProducts);

// Single product details
router.get('/:id', getProductById);

module.exports = router;

