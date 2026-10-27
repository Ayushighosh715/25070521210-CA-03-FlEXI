/**
 * App Component
 * Core routing tree, global toast banner, layout shell (Navbar, main content view, and Footer).
 */
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useCart } from './context/CartContext';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const { notification } = useCart();

  return (
    <div className="app-layout">
      {/* Dynamic Global Toast Notification */}
      {notification && (
        <div className={`global-toast toast-${notification.type}`}>
          <span className="toast-icon">
            {notification.type === 'success' ? '✓' : 'ℹ'}
          </span>
          <span className="toast-message">{notification.message}</span>
        </div>
      )}

      {/* Sticky Top Navigation */}
      <Navbar />

      {/* Primary Main Content View */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes (Require Authentication) */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="not-found-page">
                <div className="not-found-content">
                  <h1 className="error-code">404</h1>
                  <h2>Page Not Found</h2>
                  <p>The developer resource you are searching for does not exist or has moved.</p>
                  <Link to="/" className="btn btn-primary">
                    Return to Homepage
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Technical Footer */}
      <Footer />
    </div>
  );
}

export default App;

