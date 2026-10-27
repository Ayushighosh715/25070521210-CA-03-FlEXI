/**
 * MyOrders Page
 * Displays the complete chronological purchase history for the authenticated user,
 * including payment status, item breakdowns, and shipping addresses.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import '../styles/orders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my');
        if (res.data.success) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Could not retrieve order history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container loading-state">
          <div className="spinner"></div>
          <p>Retrieving your order records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <div>
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-subtitle">
              Manage and track all your active cloud subscriptions, AI packages, and hardware orders.
            </p>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">
            + Order More Tools
          </Link>
        </div>

        {error && <div className="orders-error-banner">{error}</div>}

        {orders.length === 0 ? (
          <div className="orders-empty-state">
            <span className="empty-box-icon">📦</span>
            <h3>No Orders Placed Yet</h3>
            <p>You haven't purchased any developer tools, VPS, or books yet.</p>
            <Link to="/products" className="btn btn-primary">
              Browse Developer Catalog
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              });

              return (
                <div key={order._id} className="order-history-card">
                  {/* Card Header Bar */}
                  <div className="order-card-header">
                    <div className="order-id-group">
                      <span className="order-id-label">Order</span>
                      <strong className="order-id-value">{order._id}</strong>
                      <span className="order-date-text">• {formattedDate}</span>
                    </div>

                    <div className="order-status-group">
                      <span className={`order-status-badge status-${order.orderStatus.toLowerCase()}`}>
                        ● {order.orderStatus}
                      </span>
                      <span className={`payment-status-badge status-${order.paymentStatus.toLowerCase()}`}>
                        {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </div>
                  </div>

                  {/* Items List Inside Card */}
                  <div className="order-items-wrapper">
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-item-entry">
                        <div className="order-item-details">
                          <span className="item-name">{item.name}</span>
                          <span className="item-qty-sub">
                            Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="order-item-total">
                          ₹{Number(item.lineTotal).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer Bar */}
                  <div className="order-card-footer">
                    <div className="order-shipping-summary">
                      <span className="ship-to-label">Ship to:</span>{' '}
                      <span className="ship-to-address">
                        {order.buyerInfo?.name}, {order.buyerInfo?.city}, {order.buyerInfo?.pincode}
                      </span>
                    </div>

                    <div className="order-grand-total">
                      <span className="total-label">Order Total:</span>
                      <span className="total-val">
                        ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;

