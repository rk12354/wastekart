const mongoose = require('mongoose');

const VEHICLE_TYPES    = ['cycle', 'bike', 'auto', 'mini_truck', 'truck'];
const TIME_SLOTS       = ['09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00'];
const BOOKING_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

const bookingItemSchema = new mongoose.Schema({
  materialType: { type: String, required: true },
  category:     { type: String, required: true },
  weight:       { type: Number, required: true, min: 0.1 },
  pricePerKg:   { type: Number, required: true, min: 0 },
  subtotal:     { type: Number, required: true, min: 0 },
  aiDetected:   { type: Boolean, default: false },
  confidence:   { type: Number, default: 0 }   // AI confidence 0-100
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => 'WK' + Date.now().toString(36).toUpperCase()
  },

  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  collector: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector' },

  items:       { type: [bookingItemSchema], required: true },
  totalWeight: { type: Number, required: true },
  totalAmount: { type: Number, required: true },

  vehicleType: { type: String, enum: VEHICLE_TYPES, required: true },

  pickupAddress: {
    street:  String,
    city:    { type: String, default: 'Lucknow' },
    pincode: String,
    state:   { type: String, default: 'Uttar Pradesh' }
  },

  scheduledDate:     { type: Date, required: true },
  scheduledTimeSlot: { type: String, enum: TIME_SLOTS, required: true },

  status: { type: String, enum: BOOKING_STATUSES, default: 'pending' },
  notes:  { type: String, default: '' },

  // Environmental impact — calculated in pre-save hook
  treesPlanted: { type: Number, default: 0 },
  co2Saved:     { type: Number, default: 0 }   // kg

}, {
  timestamps: true
});

// ── Environmental impact calculation ─────────────────────────────
// 1 tree planted per 50 kg of scrap recycled
// 2.5 kg of CO₂ saved per kg of scrap recycled (industry estimate)
bookingSchema.pre('save', function (next) {
  this.treesPlanted = Math.max(0, Math.floor(this.totalWeight / 50));
  this.co2Saved     = parseFloat((this.totalWeight * 2.5).toFixed(2));
  next();
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ collector: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
