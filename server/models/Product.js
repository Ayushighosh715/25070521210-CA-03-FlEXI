/**
 * Product Model
 * Schema representing developer products sold on DevStore.
 */
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: [
        'AI Models',
        'Cloud Storage',
        'Servers & VPS',
        'Cloud Servers',
        'GPU for Training',
        'Kali Linux & Security Tools',
        'Books'
      ],
      index: true
    },
    subCategory: {
      type: String,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required']
    },
    price: {
      type: Number,
      required: [true, 'Product price in INR is required'],
      min: [0, 'Price must be a positive number']
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 50,
      min: [0, 'Stock cannot be negative']
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1.0'],
      max: [5, 'Rating cannot exceed 5.0']
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required']
    },
    tags: {
      type: [String],
      default: []
    },
    featured: {
      type: Boolean,
      default: false
    },
    trending: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Text index for fast multi-field search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);

