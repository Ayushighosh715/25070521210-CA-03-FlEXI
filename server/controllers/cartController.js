/**
 * Cart Controller
 * Manages persistent server-side cart operations for logged-in users,
 * including item addition, quantity updates, removal, and guest cart synchronization.
 */
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user's populated cart
// @route   GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Filter out any products that might have been deleted from catalog
    const validCart = user.cart.filter(item => item.product != null);
    if (validCart.length !== user.cart.length) {
      user.cart = validCart;
      await user.save();
    }

    // Calculate subtotal
    const subtotal = validCart.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );

    res.status(200).json({
      success: true,
      cart: validCart,
      itemCount: validCart.reduce((sum, item) => sum + item.quantity, 0),
      subtotal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart or increment quantity if exists
// @route   POST /api/cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const qty = Math.max(1, parseInt(quantity, 10));

    // Verify product exists and check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const user = await User.findById(req.user.id);

    // Check if product already in cart
    const itemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Increment quantity
      user.cart[itemIndex].quantity += qty;
    } else {
      // Add new item
      user.cart.push({ product: productId, quantity: qty });
    }

    await user.save();

    // Populate for fresh cart response
    await user.populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    res.status(200).json({
      success: true,
      message: 'Product added to cart!',
      cart: user.cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of a product in cart
// @route   PUT /api/cart/:productId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const user = await User.findById(req.user.id);
    const itemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart.' });
    }

    user.cart[itemIndex].quantity = qty;
    await user.save();

    await user.populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully.',
      cart: user.cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();

    await user.populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      cart: user.cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items in cart
// @route   DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      cart: []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync local guest cart items with DB cart upon login
// @route   POST /api/cart/sync
exports.syncCart = async (req, res, next) => {
  try {
    const { localItems = [] } = req.body;
    const user = await User.findById(req.user.id);

    for (const localItem of localItems) {
      const pid = localItem.product?._id || localItem.productId;
      if (!pid) continue;

      const existingIndex = user.cart.findIndex(
        item => item.product.toString() === pid.toString()
      );

      if (existingIndex > -1) {
        user.cart[existingIndex].quantity = Math.max(
          user.cart[existingIndex].quantity,
          localItem.quantity || 1
        );
      } else {
        user.cart.push({
          product: pid,
          quantity: localItem.quantity || 1
        });
      }
    }

    await user.save();
    await user.populate({
      path: 'cart.product',
      select: 'name price image stock category'
    });

    res.status(200).json({
      success: true,
      message: 'Cart synced successfully.',
      cart: user.cart
    });
  } catch (error) {
    next(error);
  }
};

