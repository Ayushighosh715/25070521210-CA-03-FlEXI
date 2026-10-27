/**
 * Login Page
 * Authenticates user credentials, stores JWT token in localStorage,
 * and redirects back to either the prior checkout path or catalog home.
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination if user was redirected from a protected route
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <span className="logo-badge">&lt;/&gt;</span>
            <span className="logo-text">Dev<span className="logo-highlight">Store</span></span>
          </Link>
          <h2 className="auth-title">Welcome Back, Developer</h2>
          <p className="auth-subtitle">Sign in to access your orders, API keys, and saved cart</p>
        </div>

        {error && <div className="auth-error-alert">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Developer Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Account →'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have a DevStore account?{' '}
            <Link to="/signup" className="auth-link">
              Create one now
            </Link>
          </p>
        </div>

        {/* Viva Quick Helper */}
        <div className="viva-quick-tip">
          <small>💡 Testing Tip: Create a new account with the Sign Up link or log into an existing one.</small>
        </div>
      </div>
    </div>
  );
};

export default Login;

