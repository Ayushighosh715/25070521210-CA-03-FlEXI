/**
 * Checkout Page
 * Collects mandatory shipping and buyer details, generates on-demand UPI payment QR codes,
 * and submits orders into the database with either UPI confirmation or Cash on Delivery.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Buyer Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // Default to modern UPI

  // UPI QR Code State
  const [upiData, setUpiData] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // If cart is empty, redirect back to cart
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Generate UPI QR code automatically when UPI is active and total is available
  useEffect(() => {
    const fetchQr = async () => {
      if (paymentMethod === 'UPI' && cartTotal > 0 && !upiData) {
        try {
          setLoadingQr(true);
          const res = await api.post('/payment/upi-qr', {
            amount: cartTotal
          });
          if (res.data.success) {
            setUpiData(res.data);
          }
        } catch (error) {
          console.error('Failed to generate UPI QR code:', error);
        } finally {
          setLoadingQr(false);
        }
      }
    };

    fetchQr();
  }, [paymentMethod, cartTotal, upiData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field being edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';
    if (!formData.phone.trim() || formData.phone.length < 10) {
      errors.phone = 'Valid 10-digit phone number is required';
    }
    if (!formData.address.trim()) errors.address = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State / Province is required';
    if (!formData.pincode.trim() || formData.pincode.length < 6) {
      errors.pincode = 'Valid 6-digit PIN code is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Order to backend (only triggered by "Place Order" or "I have paid")
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setOrderError(null);

    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    try {
      setSubmittingOrder(true);

      const orderPayload = {
        buyerInfo: formData,
        items: cartItems.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          lineTotal: item.product.price * item.quantity
        })),
        paymentMethod,
        upiQrReference: paymentMethod === 'UPI' ? upiData?.referenceId : null
      };

      const res = await api.post('/orders', orderPayload);

      if (res.data.success) {
        // Clear cart in state and storage
        await clearCart();
        // Redirect to Order Success page with order details
        navigate('/order-success', { state: { order: res.data.order } });
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
      setOrderError(
        err.response?.data?.message || 'Failed to place order. Please check details and try again.'
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-page-title">Secure Developer Checkout</h1>

        {orderError && (
          <div className="checkout-error-banner">
            ⚠️ {orderError}
          </div>
        )}

        <div className="checkout-layout">
          {/* Left Column: Buyer Shipping & Billing Form */}
          <div className="checkout-form-column">
            <div className="checkout-card">
              <h2 className="card-heading">
                <span className="step-num">1</span> Buyer Information & Shipping Address
              </h2>

              <form className="buyer-form" onSubmit={handleSubmitOrder}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                    placeholder="e.g. Ayushi Ghosh"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group col-half">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                      placeholder="dev@domain.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                    {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                  </div>

                  <div className="form-group col-half">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-input ${formErrors.phone ? 'input-error' : ''}`}
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Street Address *</label>
                  <textarea
                    name="address"
                    rows="2"
                    className={`form-textarea ${formErrors.address ? 'input-error' : ''}`}
                    placeholder="House/Flat No., Tech Park, Street Name"
                    value={formData.address}
                    onChange={handleInputChange}
                  ></textarea>
                  {formErrors.address && <span className="field-error">{formErrors.address}</span>}
                </div>

                <div className="form-row three-cols">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      className={`form-input ${formErrors.city ? 'input-error' : ''}`}
                      placeholder="Bengaluru"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                    {formErrors.city && <span className="field-error">{formErrors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      name="state"
                      className={`form-input ${formErrors.state ? 'input-error' : ''}`}
                      placeholder="Karnataka"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                    {formErrors.state && <span className="field-error">{formErrors.state}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">PIN Code *</label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength="6"
                      className={`form-input ${formErrors.pincode ? 'input-error' : ''}`}
                      placeholder="560100"
                      value={formData.pincode}
                      onChange={handleInputChange}
                    />
                    {formErrors.pincode && <span className="field-error">{formErrors.pincode}</span>}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Payment Method & Dynamic UPI QR */}
          <div className="checkout-payment-column">
            <div className="checkout-card">
              <h2 className="card-heading">
                <span className="step-num">2</span> Select Payment Method
              </h2>

              {/* Payment Option Selector */}
              <div className="payment-options-grid">
                <label className={`payment-option ${paymentMethod === 'UPI' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <div className="option-content">
                    <span className="option-title">⚡ Instant UPI (QR Code)</span>
                    <span className="option-sub">GPay, PhonePe, Paytm, BHIM</span>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div className="option-content">
                    <span className="option-title">📦 Cash on Delivery (COD)</span>
                    <span className="option-sub">Pay upon physical equipment arrival</span>
                  </div>
                </label>
              </div>

              {/* UPI QR Display Container */}
              {paymentMethod === 'UPI' && (
                <div className="upi-payment-panel">
                  <div className="upi-panel-header">
                    <h4>Scan QR to Pay via Any UPI App</h4>
                    <p className="upi-instruction">
                      Scan the dynamically generated QR code below using Google Pay, PhonePe, or Paytm:
                    </p>
                  </div>

                  <div className="qr-code-box">
                    {loadingQr ? (
                      <div className="qr-spinner">
                        <div className="spinner"></div>
                        <span>Generating Order QR...</span>
                      </div>
                    ) : upiData?.qrCodeImage ? (
                      <div className="qr-image-wrapper">
                        <img
                          src={upiData.qrCodeImage}
                          alt="DevStore UPI Payment QR"
                          className="upi-qr-image"
                        />
                        <div className="qr-details-badge">
                          <span className="qr-vpa">VPA: <strong>devstore@upi</strong></span>
                          <span className="qr-ref">Ref: {upiData.referenceId}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="qr-fallback">Click below to generate QR code</div>
                    )}
                  </div>

                  <div className="upi-amount-pill">
                    Amount to Pay: <strong>₹{Number(cartTotal).toLocaleString('en-IN')}</strong>
                  </div>

                  <div className="upi-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-block btn-lg pay-confirm-btn"
                      onClick={handleSubmitOrder}
                      disabled={submittingOrder || loadingQr}
                    >
                      {submittingOrder ? 'Verifying & Placing Order...' : '✓ I Have Paid (Place Order)'}
                    </button>
                    <p className="upi-note">
                      * Order will be saved and confirmed in the database once you click "I Have Paid".
                    </p>
                  </div>
                </div>
              )}

              {/* Cash On Delivery Action Container */}
              {paymentMethod === 'COD' && (
                <div className="cod-panel">
                  <p className="cod-info-text">
                    You can pay the full amount of <strong>₹{Number(cartTotal).toLocaleString('en-IN')}</strong> in cash or card when your shipment or hardware gear is delivered to your address.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-block btn-lg cod-submit-btn"
                    onClick={handleSubmitOrder}
                    disabled={submittingOrder}
                  >
                    {submittingOrder ? 'Placing Your Order...' : '📦 Place Order (COD)'}
                  </button>
                </div>
              )}

              {/* Items Summary Accordion */}
              <div className="checkout-items-summary">
                <h4 className="items-summary-title">Order Items ({cartItems.length})</h4>
                <div className="mini-items-list">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="mini-item-row">
                      <span className="mini-item-name">
                        {item.product.name} <small>x{item.quantity}</small>
                      </span>
                      <span className="mini-item-price">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  <div className="mini-total-row">
                    <strong>Total Amount:</strong>
                    <strong>₹{Number(cartTotal).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

