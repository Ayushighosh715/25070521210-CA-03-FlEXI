/**
 * Database Configuration
 * Connects the Express server to local MongoDB instance via Mongoose ODM.
 * Automatically provisions an embedded MongoDB instance if no external service is running.
 */
const mongoose = require('mongoose');
const path = require('path');
const Product = require('../models/Product');

let mongodInstance = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devstore';

  try {
    // Attempt connecting to standalone local MongoDB server first
    console.log(`[MongoDB]: Attempting connection to ${primaryUri}...`);
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2500 // Quick fallback if local MongoDB service isn't active
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    await autoSeedIfEmpty();
    return;
  } catch (initialError) {
    console.log(`[MongoDB]: Standalone service not detected on port 27017.`);
    console.log(`[MongoDB]: Launching high-reliability embedded local MongoDB instance...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      
      // Create local MongoDB instance
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'devstore'
        }
      });

      const fallbackUri = mongodInstance.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`[MongoDB Connected]: Embedded Server running at ${fallbackUri}`);
      console.log(`[MongoDB]: Viewable in MongoDB Compass at: mongodb://127.0.0.1:27017/devstore`);

      await autoSeedIfEmpty();
    } catch (fallbackError) {
      console.error(`[MongoDB Error]: Could not initialize database:`, fallbackError.message);
      process.exit(1);
    }
  }
};

// Automatic seed on startup if database is fresh
const autoSeedIfEmpty = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log(`[MongoDB]: Fresh database detected. Auto-seeding 214+ products...`);
      const { products } = require('../seed/seedProducts');
      await Product.insertMany(products);
      console.log(`[MongoDB Auto-Seed]: Successfully inserted ${products.length} products!`);
    } else {
      console.log(`[MongoDB]: Product catalog ready (${count} products in catalog).`);
    }
  } catch (err) {
    console.warn(`[MongoDB Auto-Seed Warning]:`, err.message);
  }
};

module.exports = connectDB;
