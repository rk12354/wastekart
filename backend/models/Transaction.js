const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    default: () => 'TXN' + Date.now().toString(36).toUpperCase()
  },

  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  booking:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking',   required: true },
  collector: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector' },

  amount:        { type: Number, required: true, min: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },

  // Per-transaction environmental metrics (mirrored from booking)
  treesPlanted: { type: Number, default: 0 },
  co2Saved:     { type: Number, default: 0 }

}, {
  timestamps: true
});

transactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
