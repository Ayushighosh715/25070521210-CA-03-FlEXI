/**
 * Payment Routes
 * Generates dynamic UPI QR codes with order references for instant app payments.
 */
const express = require('express');
const router = express.Router();
const { generateUpiQr } = require('../controllers/paymentController');

// QR code generation endpoint
router.post('/upi-qr', generateUpiQr);

module.exports = router;

