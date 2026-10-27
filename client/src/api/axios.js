/**
 * Axios API Client Configuration
 * Automatically attaches stored JWT token to all requests and sets default backend API URL.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devstore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized/token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clean storage (avoid loop if checking auth)
      const isAuthCheck = error.config.url.includes('/auth/me');
      if (!isAuthCheck) {
        localStorage.removeItem('devstore_token');
        localStorage.removeItem('devstore_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

