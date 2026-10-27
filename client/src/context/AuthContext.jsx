/**
 * Auth Context
 * Provides centralized authentication state and methods (login, signup, logout) across the application.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('devstore_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('devstore_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate existing token with backend on mount
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('devstore_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('devstore_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('devstore_token', receivedToken);
      localStorage.setItem('devstore_user', JSON.stringify(receivedUser));
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  // Signup handler
  const signup = async (name, email, password, confirmPassword) => {
    const res = await api.post('/auth/signup', {
      name,
      email,
      password,
      confirmPassword
    });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('devstore_token', receivedToken);
      localStorage.setItem('devstore_user', JSON.stringify(receivedUser));
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('devstore_token');
    localStorage.removeItem('devstore_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

