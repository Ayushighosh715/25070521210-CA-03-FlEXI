/**
 * Order Routes
 * Handles order submission and order history for logged-in users.
 */
const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById
} = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// All order operations require authentication
router.use(auth);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;

