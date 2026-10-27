/**
 * Navbar Component
 * Sticky dark-tech navigation header featuring logo, live search bar, category dropdown,
 * cart counter badge, user account controls, and mobile responsive menu.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';
import '../styles/navbar.css';

const CATEGORIES = [
  'AI Models',
  'Cloud Storage',
  'Servers & VPS',
  'Cloud Servers',
  'GPU for Training',
  'Kali Linux & Security Tools',
  'Books'
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleCategorySelect = (cat) => {
    setCategoryDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(`/products?category=${encodeURIComponent(cat)}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <span className="logo-badge">&lt;/&gt;</span>
          <span className="logo-text">Dev<span className="logo-highlight">Store</span></span>
        </Link>

        {/* Live Search Bar */}
        <div className="navbar-search-desktop">
          <SearchBar onSearchSubmit={() => setMobileMenuOpen(false)} />
        </div>

        {/* Desktop Nav Links & Controls */}
        <div className="navbar-actions">
          {/* Category Dropdown */}
          <div className="nav-dropdown-wrapper">
            <button
              className="nav-btn dropdown-toggle"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              onBlur={() => setTimeout(() => setCategoryDropdownOpen(false), 200)}
            >
              Categories <span className="arrow-icon">{categoryDropdownOpen ? '▲' : '▼'}</span>
            </button>
            {categoryDropdownOpen && (
              <div className="dropdown-menu categories-menu">
                <div
                  className="dropdown-item"
                  onClick={() => handleCategorySelect('All')}
                >
                  🚀 All Categories
                </div>
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat}
                    className="dropdown-item"
                    onClick={() => handleCategorySelect(cat)}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/products" className="nav-link">
            Catalog
          </Link>

          {/* Cart Icon with Dynamic Badge */}
          <Link to="/cart" className="nav-cart-btn" title="View Cart">
            <span className="cart-icon">🛒</span>
            <span className="cart-label">Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* User Account / Auth Actions */}
          {isAuthenticated ? (
            <div className="nav-dropdown-wrapper">
              <button
                className="user-profile-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
              >
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name">{user?.name}</span>
                <span className="arrow-icon">{userDropdownOpen ? '▲' : '▼'}</span>
              </button>
              {userDropdownOpen && (
                <div className="dropdown-menu user-menu">
                  <div className="dropdown-header">
                    <span className="signed-in-as">Signed in as</span>
                    <strong>{user?.email}</strong>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link
                    to="/my-orders"
                    className="dropdown-item"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    📦 My Orders
                  </Link>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Hamburger */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-search-wrapper">
            <SearchBar onSearchSubmit={() => setMobileMenuOpen(false)} />
          </div>
          <div className="mobile-links">
            <Link
              to="/"
              className="mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse All Products
            </Link>
            <Link
              to="/cart"
              className="mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shopping Cart ({cartCount})
            </Link>

            <div className="mobile-section-title">Categories</div>
            <div className="mobile-category-list">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className="mobile-cat-item"
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>

            <hr className="mobile-divider" />

            {isAuthenticated ? (
              <div className="mobile-user-section">
                <div className="mobile-user-info">Logged in as: <strong>{user?.name}</strong></div>
                <Link
                  to="/my-orders"
                  className="mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button className="btn btn-danger btn-block" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth-actions">
                <Link
                  to="/login"
                  className="btn btn-outline btn-block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary btn-block"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

