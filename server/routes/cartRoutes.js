/**
 * Cart Routes
 * Protected endpoints managing user shopping cart state in the database.
 */
const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
} = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

// All cart operations require authentication
router.use(auth);

router.get('/', getCart);
router.post('/', addToCart);
router.post('/sync', syncCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;

