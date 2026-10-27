/**
 * DevStore Backend Server Entry Point
 * Express application configuration, CORS setup, routing, and database initialization.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Connect to MongoDB Database
connectDB();

// CORS configuration (allow requests from React client on port 5173)
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [clientOrigin, 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger for Viva & Debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/activity', activityRoutes);

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'DevStore API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Catch-all 404 Route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`
  });
});

// Global Central Error Handler
app.use(errorHandler);

// Start Express Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  DevStore API Server running on port ${PORT} `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Database: ${process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devstore'}`);
  console.log(`===============================================`);
});

