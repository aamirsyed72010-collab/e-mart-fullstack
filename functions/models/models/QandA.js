const mongoose = require('mongoose');

const qandaSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
  },
  user: { // User who asked the question
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  seller: { // Seller who answered the question
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  answeredAt: {
    type: Date,
  },
});

const QandA = mongoose.model('QandA', qandaSchema);

module.exports = QandA;
