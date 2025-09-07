const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { // In a real app, this would be a ref to a User model
    type: String,
    required: true,
    default: 'Anonymous', // For now, just a string
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  tags: { // New tags field
    type: [String], // Array of strings
    default: [],
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  sales: {
    type: Number,
    default: 0,
  },
  reviews: [reviewSchema], // Add reviews array
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
