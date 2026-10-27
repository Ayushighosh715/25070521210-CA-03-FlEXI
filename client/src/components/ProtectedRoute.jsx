/**
 * ProtectedRoute Component
 * Restricts access to authenticated users only; redirects unauthenticated users to /login.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve intended URL so user can return after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

