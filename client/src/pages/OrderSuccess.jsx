/**
 * OrderSuccess Page
 * Confirms order placement with receipt breakdown, date/time timestamps,
 * payment methodology, delivery address, and line item receipts.
 */
import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import '../styles/orders.css';

const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;

  // If no order data in state (e.g. direct URL visit), navigate to home
  if (!order) {
    return <Navigate to="/my-orders" replace />;
  }

  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  return (
    <div className="order-success-page">
      <div className="success-container">
        {/* Animated Confirmation Badge */}
        <div className="success-header">
          <div className="success-check-badge">✓</div>
          <h1 className="success-title">Order Confirmed!</h1>
          <p className="success-subtitle">
            Thank you for your purchase from DevStore. Your order has been registered in the database.
          </p>
        </div>

        {/* Receipt Card */}
        <div className="order-receipt-card">
          <div className="receipt-meta-grid">
            <div className="receipt-meta-block">
              <span className="meta-label">Order ID</span>
              <span className="meta-value order-id-highlight">{order._id}</span>
            </div>
            <div className="receipt-meta-block">
              <span className="meta-label">Date & Time</span>
              <span className="meta-value">{formattedDate}</span>
            </div>
            <div className="receipt-meta-block">
              <span className="meta-label">Payment Method</span>
              <span className="meta-value payment-pill">
                {order.paymentMethod === 'UPI' ? '⚡ UPI Instant' : '📦 Cash on Delivery'}
              </span>
            </div>
            <div className="receipt-meta-block">
              <span className="meta-label">Payment Status</span>
              <span className={`meta-value status-pill status-${order.paymentStatus.toLowerCase()}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <hr className="receipt-divider" />

          {/* Shipping / Buyer Info */}
          <div className="receipt-section">
            <h3 className="receipt-section-title">Shipping & Contact Details</h3>
            <div className="buyer-summary-box">
              <p><strong>Name:</strong> {order.buyerInfo?.name}</p>
              <p><strong>Email:</strong> {order.buyerInfo?.email}</p>
              <p><strong>Phone:</strong> {order.buyerInfo?.phone}</p>
              <p>
                <strong>Delivery Address:</strong> {order.buyerInfo?.address}, {order.buyerInfo?.city}, {order.buyerInfo?.state} - {order.buyerInfo?.pincode}
              </p>
              {order.upiQrReference && (
                <p><strong>UPI Reference Code:</strong> <code>{order.upiQrReference}</code></p>
              )}
            </div>
          </div>

          <hr className="receipt-divider" />

          {/* Purchased Items List */}
          <div className="receipt-section">
            <h3 className="receipt-section-title">Items Ordered</h3>
            <div className="receipt-items-table">
              <div className="receipt-table-head">
                <span>Product Name</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Total</span>
              </div>
              {order.items?.map((item, index) => (
                <div key={index} className="receipt-table-row">
                  <span className="receipt-item-name">{item.name}</span>
                  <span className="receipt-item-qty">{item.quantity}</span>
                  <span className="receipt-item-unit">₹{Number(item.price).toLocaleString('en-IN')}</span>
                  <span className="receipt-item-sub">₹{Number(item.lineTotal).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="receipt-total-footer">
              <div className="receipt-total-line">
                <span>Total Paid:</span>
                <span className="receipt-grand-total">
                  ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="success-actions">
            <Link to="/my-orders" className="btn btn-primary btn-lg">
              View in My Orders →
            </Link>
            <Link to="/products" className="btn btn-outline btn-lg">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

