/**
 * Activity Model
 * Tracks user interactions (search, product view, add to cart) to drive personalized recommendations.
 */
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    type: {
      type: String,
      enum: ['search', 'view', 'add_to_cart'],
      required: true,
      index: true
    },
    searchQuery: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      trim: true,
      default: ''
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// TTL index to automatically clean up raw activity older than 60 days
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.model('Activity', activitySchema);

