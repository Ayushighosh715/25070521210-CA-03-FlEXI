/**
 * Cart Page
 * Displays line items, quantity modifiers, item removal, cost summary,
 * and navigation into the order checkout pipeline.
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/cart.css';

const Cart = () => {
  const {
    cartItems,
    cartCount,
    subtotal,
    shippingFee,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      // Direct user to login first with return destination
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty-container">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Cart is Currently Empty</h2>
          <p>
            You haven't added any developer servers, AI weights, or books to your cart yet.
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Browse Product Catalog →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">Your Developer Shopping Cart</h1>
          <span className="cart-item-count">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="cart-content-layout">
          {/* Cart Items List */}
          <div className="cart-items-column">
            <div className="cart-items-card">
              <div className="cart-table-header">
                <span className="col-product">Product</span>
                <span className="col-price">Unit Price</span>
                <span className="col-qty">Quantity</span>
                <span className="col-total">Line Total</span>
                <span className="col-action"></span>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const product = item.product;
                  const lineTotal = (product.price || 0) * item.quantity;

                  return (
                    <div key={product._id} className="cart-item-row">
                      {/* Product Thumbnail & Details */}
                      <div className="cart-product-info">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="cart-item-thumb"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=120&q=80';
                          }}
                        />
                        <div className="cart-product-details">
                          <span className="cart-item-category">{product.category}</span>
                          <Link to={`/products/${product._id}`} className="cart-item-name">
                            {product.name}
                          </Link>
                          {product.stock <= 5 && (
                            <span className="cart-low-stock">
                              Only {product.stock} available
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="cart-unit-price">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </div>

                      {/* Quantity Controller */}
                      <div className="cart-quantity-cell">
                        <div className="quantity-controls-small">
                          <button
                            className="qty-btn-sm"
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="qty-val-sm">{item.quantity}</span>
                          <button
                            className="qty-btn-sm"
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="cart-line-total">
                        ₹{Number(lineTotal).toLocaleString('en-IN')}
                      </div>

                      {/* Remove Button */}
                      <div className="cart-action-cell">
                        <button
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(product._id)}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Table Footer Actions */}
              <div className="cart-actions-bar">
                <Link to="/products" className="continue-shopping-link">
                  ← Continue Shopping
                </Link>
                <button className="clear-cart-btn" onClick={clearCart}>
                  Clear All Items
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="cart-summary-column">
            <div className="order-summary-card">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{Number(subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-row">
                  <span>Digital Provisioning & Shipping</span>
                  <span className="text-success">FREE</span>
                </div>
                <div className="summary-row">
                  <span>Goods & Services Tax (GST)</span>
                  <span>Included</span>
                </div>
                <hr className="summary-divider" />
                <div className="summary-row total-row">
                  <strong>Total Amount</strong>
                  <strong className="total-amount">
                    ₹{Number(cartTotal).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <button
                className="btn btn-primary btn-block btn-lg checkout-btn"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout →
              </button>

              <div className="summary-guarantees">
                <p>🔒 256-Bit SSL Encrypted Checkout</p>
                <p>⚡ Instant Key Generation or Physical Dispatch</p>
                <p>📱 Supports UPI QR & Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

