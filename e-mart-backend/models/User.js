const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profilePicture: {
    type: String,
  },
  shippingAddress: {
    fullName: { type: String },
    houseNo: { type: String }, // New field
    streetName: { type: String }, // New field
    address: { type: String }, // Keeping for general address line if needed
    city: { type: String },
    district: { type: String }, // New field
    taluk: { type: String }, // New field
    postalCode: { type: String },
    country: { type: String }
  },
  role: { // New role field
    type: String,
    enum: ['user', 'seller', 'admin'], // Define possible roles
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;