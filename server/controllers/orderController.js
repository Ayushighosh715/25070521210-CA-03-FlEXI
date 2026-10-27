/**
 * Order Controller
 * Manages order creation, stock adjustments, cart clearing, and user order history.
 */
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Create a new order (COD or UPI)
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const {
      buyerInfo,
      items,
      paymentMethod,
      upiQrReference
    } = req.body;

    // Validate buyer information
    if (
      !buyerInfo ||
      !buyerInfo.name ||
      !buyerInfo.email ||
      !buyerInfo.phone ||
      !buyerInfo.address ||
      !buyerInfo.city ||
      !buyerInfo.state ||
      !buyerInfo.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: 'All buyer details (name, email, phone, address, city, state, pincode) are required.'
      });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place an order with an empty cart.'
      });
    }

    // Validate payment method
    if (!['COD', 'UPI'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Allowed options are COD or UPI.'
      });
    }

    // Verify stock and compute verified line totals
    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const pid = item.product?._id || item.product || item._id;
      const product = await Product.findById(pid);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name || pid} was not found in catalog.`
        });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10));
      const lineTotal = product.price * qty;
      calculatedTotal += lineTotal;

      verifiedItems.push({
        product: product._id,
        name: product.name,
        quantity: qty,
        price: product.price,
        lineTotal
      });

      // Decrement stock (if sufficient)
      if (product.stock >= qty) {
        product.stock -= qty;
        await product.save();
      }
    }

    // Determine initial payment status
    const paymentStatus = paymentMethod === 'UPI' ? 'Completed' : 'Pending';

    // Create Order document
    const order = await Order.create({
      user: req.user.id,
      buyerInfo,
      items: verifiedItems,
      totalAmount: calculatedTotal,
      paymentMethod,
      paymentStatus,
      upiQrReference: paymentMethod === 'UPI' ? upiQrReference : null,
      orderStatus: 'Confirmed'
    });

    // Clear user's database cart after successful purchase
    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order history for authenticated user
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'image category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'items.product',
      'image category'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Ensure order belongs to logged-in user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order.'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

