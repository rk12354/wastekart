const mongoose = require('mongoose');

const MATERIAL_TYPES = [
  'newspaper', 'cardboard', 'books',
  'iron', 'aluminium', 'copper', 'brass', 'steel',
  'plastic_hard', 'plastic_soft',
  'glass',
  'ewaste', 'battery',
  'rubber'
];

const VEHICLE_TYPES = ['cycle', 'bike', 'auto', 'mini_truck', 'truck'];

const materialPriceSchema = new mongoose.Schema({
  material:   { type: String, enum: MATERIAL_TYPES, required: true },
  pricePerKg: { type: Number, required: true, min: 0 },
  unit:       { type: String, default: 'kg' }
}, { _id: false });

const collectorSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  phone:     { type: String, required: true },
  email:     { type: String, lowercase: true, trim: true },

  address: {
    street:  { type: String, default: '' },
    city:    { type: String, default: 'Lucknow' },
    pincode: { type: String, default: '' },
    state:   { type: String, default: 'Uttar Pradesh' }
  },

  // Areas served
  servicePincodes: [{ type: String }],

  materials:    [materialPriceSchema],
  vehicleTypes: [{ type: String, enum: VEHICLE_TYPES }],

  rating:       { type: Number, default: 4.0, min: 0, max: 5 },
  totalPickups: { type: Number, default: 0 },
  isAvailable:  { type: Boolean, default: true },

  workingHours: {
    start: { type: String, default: '09:00' },
    end:   { type: String, default: '18:00' }
  },

  description: { type: String, default: '' },
  imageUrl:    { type: String, default: '' }
}, {
  timestamps: true
});

// Index for geo-pincode queries
collectorSchema.index({ servicePincodes: 1 });
collectorSchema.index({ isAvailable: 1, rating: -1 });

module.exports = mongoose.model('Collector', collectorSchema);
